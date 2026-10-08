import { existsSync } from 'node:fs';
import path from 'node:path';

// Muat `.env` (bila ada) sebelum membaca konfigurasi.
if (existsSync('.env')) process.loadEnvFile('.env');

/** Konfigurasi server dari variabel lingkungan, dengan nilai bawaan untuk pengembangan lokal. */
export const env = {
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: process.env.DATABASE_URL ?? 'file:./data/absen-kilat.db',
  uploadDir: path.resolve(process.env.UPLOAD_DIR ?? './uploads'),
  /** Batas ukuran foto (MB): foto absen dan foto profil. */
  attendancePhotoMaxMb: Number(process.env.ATTENDANCE_PHOTO_MAX_MB ?? 8),
  avatarMaxMb: Number(process.env.AVATAR_MAX_MB ?? 5),
  /** URL publik server, dipakai Better Auth untuk tautan & cookie. */
  authUrl: process.env.BETTER_AUTH_URL ?? `http://localhost:${process.env.PORT ?? 4000}`,
  authSecret: process.env.BETTER_AUTH_SECRET ?? devSecret(),
  /**
   * Asal yang dipercaya untuk request auth: skema deep link aplikasi (`absenkilat://`,
   * Expo Go `exp://`) dan, saat pengembangan, Expo web di localhost/IP LAN.
   */
  trustedOrigins: (process.env.TRUSTED_ORIGINS ?? defaultTrustedOrigins())
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
  /** Tujuan redirect setelah tautan verifikasi email dibuka (deep link aplikasi). */
  appVerifiedUrl: process.env.APP_VERIFIED_URL ?? 'absenkilat://email-terverifikasi',
  smtp: {
    host: process.env.SMTP_HOST ?? '',
    port: Number(process.env.SMTP_PORT ?? 587),
    user: process.env.SMTP_USER ?? '',
    pass: process.env.SMTP_PASS ?? '',
    from: process.env.MAIL_FROM ?? 'Absen Kilat <no-reply@absenkilat.local>',
  },
};

function defaultTrustedOrigins(): string {
  const app = 'absenkilat://,exp://';
  if (process.env.NODE_ENV === 'production') return app;
  return `${app},http://localhost:*,http://127.0.0.1:*,http://192.168.*,http://10.*`;
}

/** Secret bawaan khusus pengembangan; produksi wajib mengisi `BETTER_AUTH_SECRET`. */
function devSecret(): string {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('BETTER_AUTH_SECRET wajib diisi di produksi');
  }
  return 'absen-kilat-dev-secret-ganti-di-produksi';
}
