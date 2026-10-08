import { eq } from 'drizzle-orm';
import { Router } from 'express';

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
