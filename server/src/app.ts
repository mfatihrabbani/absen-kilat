import { toNodeHandler } from 'better-auth/node';
import express, { type ErrorRequestHandler, type RequestHandler } from 'express';
import multer from 'multer';

import { auth } from './auth';
import { env } from './env';
import { HttpError } from './lib/http-error';
import { attendanceRouter } from './routes/attendance';
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

/** Bangun aplikasi Express: middleware umum, file upload statis, dan route API. */
export function createApp() {
  const app = express();
  app.set('trust proxy', true);
  app.use(cors);

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  // Better Auth membaca body sendiri, jadi dipasang sebelum `express.json()`.
  app.all('/api/auth/*splat', toNodeHandler(auth));

  app.use(express.json());
  app.use('/uploads', express.static(env.uploadDir, { maxAge: '7d', fallthrough: false }));
  app.use('/api/attendance', attendanceRouter);
  app.use('/api', verifyLinkRouter);

  app.use('/api', (_req, _res, next) => next(new HttpError(404, 'Endpoint tidak ditemukan')));
  app.use(errorHandler);
  return app;
}
