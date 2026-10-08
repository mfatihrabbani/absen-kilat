import { existsSync } from 'node:fs';
import path from 'node:path';

// Muat `.env` (bila ada) sebelum membaca konfigurasi.
if (existsSync('.env')) process.loadEnvFile('.env');

/** Konfigurasi server dari variabel lingkungan, dengan nilai bawaan untuk pengembangan lokal. */
export const env = {
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: process.env.DATABASE_URL ?? 'file:./data/absen-kilat.db',
  uploadDir: path.resolve(process.env.UPLOAD_DIR ?? './uploads'),
  /** URL publik server, dipakai Better Auth untuk tautan & cookie. */
  authUrl: process.env.BETTER_AUTH_URL ?? `http://localhost:${process.env.PORT ?? 3000}`,
  authSecret: process.env.BETTER_AUTH_SECRET ?? devSecret(),
  /** Asal yang dipercaya untuk request auth: skema deep link aplikasi + dev server Expo. */
  trustedOrigins: (
    process.env.TRUSTED_ORIGINS ?? 'absenkilat://,exp://,http://localhost:8081'
  ).split(',').map((o) => o.trim()).filter(Boolean),
};

/** Secret bawaan khusus pengembangan; produksi wajib mengisi `BETTER_AUTH_SECRET`. */
function devSecret(): string {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('BETTER_AUTH_SECRET wajib diisi di produksi');
  }
  return 'absen-kilat-dev-secret-ganti-di-produksi';
}
