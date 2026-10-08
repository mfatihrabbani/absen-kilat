import type { NextFunction, Request, Response } from 'express';

import { DEMO_USER_ID } from '../lib/demo-user';

declare module 'express-serve-static-core' {
  interface Request {
    /** Pengguna yang terautentikasi untuk request ini. */
    userId?: string;
  }
}

/**
 * Tentukan pengguna untuk request. Sementara (sebelum Better Auth aktif)
 * semua request memakai pengguna contoh hasil seed.
 */
export function requireUser(req: Request, _res: Response, next: NextFunction) {
  req.userId = DEMO_USER_ID;
  next();
}

/** Ambil id pengguna yang sudah dipastikan oleh `requireUser`. */
export function userIdOf(req: Request): string {
  if (!req.userId) throw new Error('requireUser belum dipasang pada route ini');
  return req.userId;
}
