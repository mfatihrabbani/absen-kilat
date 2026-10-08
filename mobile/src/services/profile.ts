import { getSession, setSessionUser } from '@/lib/session';
import { DEFAULT_NOTIFICATION_PREFS, type NotificationPrefs, type Profile } from '@/types/profile';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Preferensi notifikasi tiruan (per sesi aplikasi). */
let mockPrefs: NotificationPrefs = { ...DEFAULT_NOTIFICATION_PREFS };

/**
 * Profil pengguna yang sedang masuk.
 * Kontrak: `GET /api/profile` → `{ data: Profile }`. Sementara memakai data tiruan.
 */
export async function getProfile(): Promise<Profile> {
  await delay(250);
  const user = getSession().user;
  if (!user) throw new Error('Silakan masuk terlebih dahulu');
  return { ...user, notificationPrefs: { ...mockPrefs } };
}

/**
 * Ganti foto profil (`null` = hapus, kembali ke avatar inisial).
 * Kontrak: `PUT /api/profile/photo` (multipart `photo`) / `DELETE /api/profile/photo`
 * → `{ data: Profile }`.
 */
export async function updateProfilePhoto(image: { uri: string } | null): Promise<string | null> {
  await delay(500);
  const user = getSession().user;
  if (!user) throw new Error('Silakan masuk terlebih dahulu');
  const next = image?.uri ?? null;
  setSessionUser({ ...user, image: next });
  return next;
}

/**
 * Simpan preferensi notifikasi.
 * Kontrak: `PATCH /api/profile` `{ notificationPrefs }` → `{ data: Profile }`.
 */
export async function updateNotificationPrefs(prefs: NotificationPrefs): Promise<NotificationPrefs> {
  await delay(300);
  mockPrefs = { ...prefs };
  return mockPrefs;
}

/**
 * Ubah nama tampilan.
 * Kontrak: `PATCH /api/profile` `{ name }` → `{ data: Profile }`.
 */
export async function updateName(name: string): Promise<string> {
  await delay(500);
  const user = getSession().user;
  if (!user) throw new Error('Silakan masuk terlebih dahulu');
  setSessionUser({ ...user, name });
  return name;
}
