import { APIError } from 'better-auth/api';
import { fromNodeHeaders } from 'better-auth/node';
import { eq } from 'drizzle-orm';
import { Router } from 'express';
import { z } from 'zod';

import { auth } from '../auth';

import { db } from '../db';
import { users } from '../db/schema';
import { HttpError } from '../lib/http-error';
import { notificationPrefsSchema, parsePrefs, toProfileDto } from '../lib/profile';
import { requireUser, userIdOf } from '../middleware/current-user';

export const profileRouter = Router();
profileRouter.use(requireUser);

/** `GET /api/profile` → `{ data: Profile }` milik pengguna yang sedang masuk. */
profileRouter.get('/', async (req, res) => {
  const user = await db.query.users.findFirst({ where: eq(users.id, userIdOf(req)) });
  if (!user) throw new HttpError(404, 'Akun tidak ditemukan');
  res.json({ data: toProfileDto(req, user) });
});

/**
 * `PUT /api/profile/notifications` `{ reminderIn?, reminderOut?, weekly? }` → `{ data: Profile }`.
 * Field yang tidak dikirim mempertahankan nilai tersimpan.
 */
profileRouter.put('/notifications', async (req, res) => {
  const parsed = notificationPrefsSchema.partial().strict().safeParse(req.body ?? {});
  if (!parsed.success) throw new HttpError(400, 'Preferensi notifikasi tidak valid');

  const userId = userIdOf(req);
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user) throw new HttpError(404, 'Akun tidak ditemukan');

  const prefs = { ...parsePrefs(user.notificationPrefs), ...parsed.data };
  const [updated] = await db
    .update(users)
    .set({ notificationPrefs: JSON.stringify(prefs), updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning();
  res.json({ data: toProfileDto(req, updated ?? user) });
});

const changePasswordBody = z.object({
  currentPassword: z.string().min(1, 'Masukkan kata sandi saat ini'),
  newPassword: z.string().min(1, 'Masukkan kata sandi baru'),
});

/** Pesan galat Better Auth → bahasa aplikasi. */
const PASSWORD_ERRORS: Record<string, string> = {
  INVALID_PASSWORD: 'Kata sandi saat ini salah. Coba lagi atau atur ulang lewat email.',
  PASSWORD_TOO_SHORT: 'Kata sandi baru minimal 8 karakter',
  PASSWORD_TOO_LONG: 'Kata sandi baru terlalu panjang',
  PASSWORD_TOO_WEAK: 'Kata sandi harus mengandung huruf dan angka',
};

/**
 * `PUT /api/profile/password` `{ currentPassword, newPassword }` → `{ data: { ok: true } }`.
 * Sesi di perangkat lain dikeluarkan; cookie sesi baru untuk perangkat ini ikut dikirim.
 */
profileRouter.put('/password', async (req, res) => {
  const parsed = changePasswordBody.safeParse(req.body ?? {});
  if (!parsed.success) throw new HttpError(400, parsed.error.issues[0]?.message ?? 'Data tidak valid');
  const { currentPassword, newPassword } = parsed.data;
  if (currentPassword === newPassword) {
    throw new HttpError(400, 'Kata sandi baru harus berbeda dari kata sandi saat ini');
  }

  try {
    const { headers } = await auth.api.changePassword({
      body: { currentPassword, newPassword, revokeOtherSessions: true },
      headers: fromNodeHeaders(req.headers),
      returnHeaders: true,
    });
    const cookies = headers.getSetCookie();
    if (cookies.length) res.setHeader('Set-Cookie', cookies);
    res.json({ data: { ok: true } });
  } catch (e) {
    if (e instanceof APIError) {
      const code = (e.body as { code?: string } | undefined)?.code ?? '';
      throw new HttpError(400, PASSWORD_ERRORS[code] ?? e.message);
    }
    throw e;
  }
});
