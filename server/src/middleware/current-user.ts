import { fromNodeHeaders } from 'better-auth/node';
import type { NextFunction, Request, Response } from 'express';

import { auth } from '../auth';
import { HttpError } from '../lib/http-error';

declare module 'express-serve-static-core' {
  interface Request {
    /** Pengguna yang terautentikasi untuk request ini. */
    userId?: string;
  }
}

/** Wajibkan sesi Better Auth yang valid; isi `req.userId`, atau balas 401. */
export async function requireUser(req: Request, _res: Response, next: NextFunction) {
  const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
  if (!session) throw new HttpError(401, 'Silakan masuk terlebih dahulu');
  req.userId = session.user.id;
  next();
}

/** Ambil id pengguna yang sudah dipastikan oleh `requireUser`. */
export function userIdOf(req: Request): string {
  if (!req.userId) throw new Error('requireUser belum dipasang pada route ini');
  return req.userId;
}
