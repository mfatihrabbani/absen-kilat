import express, { Router } from 'express';

import { env } from '../env';
import { HttpError } from '../lib/http-error';
import { AVATAR_DIR } from '../lib/uploads';
import { requireUser, userIdOf } from '../middleware/current-user';

/**
 * File unggahan di `/uploads`:
 * - `/uploads/avatars/...` — foto profil, publik, cache panjang (nama file UUID tidak pernah berubah).
 * - `/uploads/<userId>/...` — foto selfie absen, hanya bisa dibuka pemiliknya (wajib login).
 */
export const uploadsRouter = Router();

const serve = express.static(env.uploadDir, {
  maxAge: '30d',
  immutable: true,
  fallthrough: false,
  index: false,
  dotfiles: 'deny',
});

uploadsRouter.use(`/${AVATAR_DIR}`, (req, res, next) => {
  req.url = `/${AVATAR_DIR}${req.url}`;
  serve(req, res, next);
});

uploadsRouter.use(requireUser, (req, res, next) => {
  const owner = decodeURIComponent(req.path.split('/')[1] ?? '');
  if (owner !== userIdOf(req)) throw new HttpError(404, 'File tidak ditemukan');
  res.setHeader('Cache-Control', 'private, max-age=86400');
  express.static(env.uploadDir, { index: false, dotfiles: 'deny', fallthrough: false })(req, res, next);
});
