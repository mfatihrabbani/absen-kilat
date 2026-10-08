import { sql } from 'drizzle-orm';
import { index, integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

/**
 * Akun pengguna. Bentuknya mengikuti tabel `user` milik Better Auth
 * (id teks, email unik, status verifikasi), ditambah preferensi notifikasi.
 */
export const users = sqliteTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'boolean' }).notNull().default(false),
  /** URL foto profil. */
  image: text('image'),
  /** Preferensi notifikasi dalam bentuk JSON string. */
  notificationPrefs: text('notification_prefs'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

/** Kolom `created_at`/`updated_at` baru untuk tiap tabel (builder kolom tidak boleh dipakai ulang). */
const timestamps = () => ({
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

/** Sesi login Better Auth (token disimpan aplikasi di secure storage). */
export const sessions = sqliteTable(
  'session',
  {
    id: text('id').primaryKey(),
    expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
    token: text('token').notNull().unique(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    ...timestamps(),
  },
  (t) => [index('session_user_idx').on(t.userId)],
);

/** Kredensial login Better Auth; untuk email & kata sandi, `password` berisi hash. */
export const accounts = sqliteTable(
  'account',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: integer('access_token_expires_at', { mode: 'timestamp_ms' }),
    refreshTokenExpiresAt: integer('refresh_token_expires_at', { mode: 'timestamp_ms' }),
    scope: text('scope'),
    password: text('password'),
    ...timestamps(),
  },
  (t) => [index('account_user_idx').on(t.userId)],
);

/** Token sekali pakai Better Auth: verifikasi email & reset kata sandi. */
export const verifications = sqliteTable(
  'verification',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
    ...timestamps(),
  },
  (t) => [index('verification_identifier_idx').on(t.identifier)],
);

/** Satu catatan absen masuk/keluar: foto selfie, lokasi GPS, waktu, dan status. */
export const attendances = sqliteTable(
  'attendances',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type', { enum: ['in', 'out'] }).notNull(),
    /** Path relatif file foto di folder upload. */
    photoPath: text('photo_path').notNull(),
    latitude: real('latitude'),
    longitude: real('longitude'),
    /** Akurasi GPS dalam meter. */
    accuracy: real('accuracy'),
    /** Waktu absen sebenarnya. */
    timestamp: integer('timestamp', { mode: 'timestamp_ms' }).notNull(),
    status: text('status', { enum: ['on_time', 'late'] }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => [index('attendances_user_time_idx').on(t.userId, t.timestamp)],
);

export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type AttendanceRow = typeof attendances.$inferSelect;
export type NewAttendanceRow = typeof attendances.$inferInsert;
