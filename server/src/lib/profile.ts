import type { Request } from 'express';
import { z } from 'zod';

import type { User } from '../db/schema';
import { publicFileUrl } from './serialize';

/** Preferensi notifikasi; disimpan sebagai JSON di kolom `notification_prefs`. */
export const notificationPrefsSchema = z.object({
  reminderIn: z.boolean(),
  reminderOut: z.boolean(),
  weekly: z.boolean(),
});
export type NotificationPrefs = z.infer<typeof notificationPrefsSchema>;

export const DEFAULT_PREFS: NotificationPrefs = { reminderIn: true, reminderOut: true, weekly: false };

/** Baca preferensi dari JSON tersimpan; nilai rusak/kosong diganti bawaan. */
export function parsePrefs(raw: string | null): NotificationPrefs {
  if (!raw) return { ...DEFAULT_PREFS };
  try {
    const parsed = notificationPrefsSchema.partial().safeParse(JSON.parse(raw));
    return { ...DEFAULT_PREFS, ...(parsed.success ? parsed.data : {}) };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

/** Bentuk JSON profil untuk aplikasi (sama dengan tipe `Profile` di mobile). */
export function toProfileDto(req: Request, user: User) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerified,
    image: user.image ? publicFileUrl(req, user.image) : null,
    notificationPrefs: parsePrefs(user.notificationPrefs),
  };
}
