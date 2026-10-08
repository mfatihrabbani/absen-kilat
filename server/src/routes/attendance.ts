import { and, asc, eq, gte, lt } from 'drizzle-orm';
import { Router } from 'express';
import { z } from 'zod';

import { db } from '../db';
import { attendances } from '../db/schema';
import { officeDayRange } from '../lib/attendance-rules';
import { HttpError } from '../lib/http-error';
import { toAttendanceDto } from '../lib/serialize';
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
