import { eq } from 'drizzle-orm';
import { Router } from 'express';

import { db } from '../db';
import { users } from '../db/schema';
import { HttpError } from '../lib/http-error';
import { toProfileDto } from '../lib/profile';
import { requireUser, userIdOf } from '../middleware/current-user';

export const profileRouter = Router();
profileRouter.use(requireUser);

/** `GET /api/profile` → `{ data: Profile }` milik pengguna yang sedang masuk. */
profileRouter.get('/', async (req, res) => {
  const user = await db.query.users.findFirst({ where: eq(users.id, userIdOf(req)) });
  if (!user) throw new HttpError(404, 'Akun tidak ditemukan');
  res.json({ data: toProfileDto(req, user) });
});
