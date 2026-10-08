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
export type AttendanceRow = typeof attendances.$inferSelect;
export type NewAttendanceRow = typeof attendances.$inferInsert;
