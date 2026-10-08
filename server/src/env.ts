import { existsSync } from 'node:fs';
import path from 'node:path';

// Muat `.env` (bila ada) sebelum membaca konfigurasi.
if (existsSync('.env')) process.loadEnvFile('.env');

/** Konfigurasi server dari variabel lingkungan, dengan nilai bawaan untuk pengembangan lokal. */
export const env = {
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: process.env.DATABASE_URL ?? 'file:./data/absen-kilat.db',
  uploadDir: path.resolve(process.env.UPLOAD_DIR ?? './uploads'),
};
