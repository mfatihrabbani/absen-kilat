import { and, asc, eq, gte, lt } from 'drizzle-orm';
import { Router } from 'express';
import { z } from 'zod';

import { db } from '../db';
import { attendances } from '../db/schema';
import { officeDateKey, officeDayRange, statusFor } from '../lib/attendance-rules';
import { HttpError } from '../lib/http-error';
import { toAttendanceDto } from '../lib/serialize';
import { photoUpload, removePhoto, savePhoto } from '../lib/uploads';
import { requireUser, userIdOf } from '../middleware/current-user';

const dateKey = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD');

/** Query daftar: satu tanggal (`date`) atau rentang (`from`..`to`, maks. 366 hari). */
const listQuery = z.union([
  z.object({ date: dateKey }),
  z
    .object({ from: dateKey, to: dateKey })
    .refine((q) => q.from <= q.to, 'Tanggal `from` harus sebelum atau sama dengan `to`')
    .refine(
      (q) => officeDayRange(q.to).end.getTime() - officeDayRange(q.from).start.getTime() <= 366 * 86_400_000,
      'Rentang maksimal 366 hari',
    ),
]);

export const attendanceRouter = Router();
attendanceRouter.use(requireUser);

/**
 * `GET /api/attendance?date=YYYY-MM-DD` atau `?from=YYYY-MM-DD&to=YYYY-MM-DD`
 * → `{ data: Attendance[] }` milik pengguna, urut kronologis (tanggal dalam WIB).
 */
attendanceRouter.get('/', async (req, res) => {
  const parsed = listQuery.safeParse(req.query);
  if (!parsed.success) {
    throw new HttpError(400, parsed.error.issues[0]?.message ?? 'Parameter tanggal tidak valid');
  }
  const q = parsed.data;
  const start = officeDayRange('date' in q ? q.date : q.from).start;
  const end = officeDayRange('date' in q ? q.date : q.to).end;

  const rows = await db
    .select()
    .from(attendances)
    .where(
      and(
        eq(attendances.userId, userIdOf(req)),
        gte(attendances.timestamp, start),
        lt(attendances.timestamp, end),
      ),
    )
    .orderBy(asc(attendances.timestamp));

  res.json({ data: rows.map((r) => toAttendanceDto(req, r)) });
});

/** `GET /api/attendance/:id` → `{ data: Attendance }`; 404 bila tidak ada / milik orang lain. */
attendanceRouter.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(404, 'Catatan absen tidak ditemukan');

  const row = await db.query.attendances.findFirst({
    where: and(eq(attendances.id, id), eq(attendances.userId, userIdOf(req))),
  });
  if (!row) throw new HttpError(404, 'Catatan absen tidak ditemukan');

  res.json({ data: toAttendanceDto(req, row) });
});

/** Angka opsional dari field multipart (string kosong = tidak ada). */
const optionalNumber = (label: string, min: number, max: number) =>
  z.preprocess(
    (v) => (v === undefined || v === '' ? null : Number(v)),
    z
      .number({ message: `${label} harus berupa angka` })
      .min(min, `${label} minimal ${min}`)
      .max(max, `${label} maksimal ${max}`)
      .nullable(),
  );

const createBody = z.object({
  type: z.enum(['in', 'out'], { message: 'Jenis absen harus `in` atau `out`' }),
  latitude: optionalNumber('Latitude', -90, 90),
  longitude: optionalNumber('Longitude', -180, 180),
  accuracy: optionalNumber('Akurasi', 0, 100_000),
});

/**
 * `POST /api/attendance` (multipart/form-data: `photo`, `type`, `latitude`, `longitude`, `accuracy`)
 * → `201 { data: Attendance }`. Waktu & status ditentukan server. Aturan per hari (WIB):
 * satu absen masuk; absen keluar hanya setelah absen masuk dan sekali saja.
 */
attendanceRouter.post('/', photoUpload.single('photo'), async (req, res) => {
  const parsed = createBody.safeParse(req.body ?? {});
  if (!parsed.success) throw new HttpError(400, parsed.error.issues[0]?.message ?? 'Data absen tidak valid');
  if (!req.file) throw new HttpError(400, 'Foto selfie wajib dilampirkan');

  const userId = userIdOf(req);
  const { type, latitude, longitude, accuracy } = parsed.data;
  const now = new Date();
  const day = officeDayRange(officeDateKey(now));

  const today = await db
    .select({ type: attendances.type })
    .from(attendances)
    .where(
      and(
        eq(attendances.userId, userId),
        gte(attendances.timestamp, day.start),
        lt(attendances.timestamp, day.end),
      ),
    );
  const hasIn = today.some((a) => a.type === 'in');
  const hasOut = today.some((a) => a.type === 'out');
  if (type === 'in' && hasIn) throw new HttpError(409, 'Kamu sudah absen masuk hari ini');
  if (type === 'out' && !hasIn) throw new HttpError(409, 'Absen masuk dulu sebelum absen keluar');
  if (type === 'out' && hasOut) throw new HttpError(409, 'Kamu sudah absen keluar hari ini');

  const photoPath = await savePhoto(`${userId}/${officeDateKey(now).slice(0, 7)}`, req.file);
  try {
    const [row] = await db
      .insert(attendances)
      .values({
        userId,
        type,
        photoPath,
        latitude,
        longitude,
        accuracy,
        timestamp: now,
        status: statusFor(type, now),
      })
      .returning();
    if (!row) throw new Error('Gagal menyimpan absen');
    res.status(201).json({ data: toAttendanceDto(req, row) });
  } catch (e) {
    await removePhoto(photoPath);
    throw e;
  }
});
