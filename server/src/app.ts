import { toNodeHandler } from 'better-auth/node';
import express, { type ErrorRequestHandler, type RequestHandler } from 'express';
import multer from 'multer';

import { auth } from './auth';
import { HttpError } from './lib/http-error';
import { attendanceRouter } from './routes/attendance';
import { profileRouter } from './routes/profile';
import { uploadsRouter } from './routes/uploads';
import { verifyLinkRouter } from './routes/verify-link';

/** CORS sederhana: izinkan asal mana pun (aplikasi Expo web/dev) dengan kredensial. */
const cors: RequestHandler = (req, res, next) => {
  const origin = req.get('origin');
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  }
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
};

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    const message =
      err.code === 'LIMIT_FILE_SIZE' ? 'Ukuran foto maksimal 8 MB' : 'Unggahan foto tidak valid';
    res.status(err.code === 'LIMIT_FILE_SIZE' ? 413 : 400).json({ error: { message } });
    return;
  }
  const status = err instanceof HttpError ? err.status : (err?.status ?? 500);
  if (status >= 500) console.error(err);
  res.status(status).json({
    error: { message: status >= 500 ? 'Terjadi kesalahan pada server' : err.message },
  });
};

/**
 * Teruskan IP klien (hasil `req.ip` Express) ke Better Auth lewat header internal,
 * agar rate limit dihitung per pengguna; header kiriman klien selalu ditimpa.
 */
const withClientIp: RequestHandler = (req, _res, next) => {
  req.headers['x-absen-client-ip'] = req.ip ?? req.socket.remoteAddress ?? 'unknown';
  next();
};

/** Bangun aplikasi Express: middleware umum, file upload statis, dan route API. */
export function createApp() {
  const app = express();
  // Percayai X-Forwarded-For hanya dari proxy lokal (mis. Nginx di mesin yang sama).
  app.set('trust proxy', 'loopback');
  app.use(cors);

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  // Better Auth membaca body sendiri, jadi dipasang sebelum `express.json()`.
  app.all('/api/auth/*splat', withClientIp, toNodeHandler(auth));

  app.use(express.json());
  app.use('/uploads', uploadsRouter);
  app.use('/api/attendance', attendanceRouter);
  app.use('/api/profile', profileRouter);
  app.use('/api', verifyLinkRouter);

  app.use('/api', (_req, _res, next) => next(new HttpError(404, 'Endpoint tidak ditemukan')));
  app.use(errorHandler);
  return app;
}
