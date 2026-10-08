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

export function setMockPrefs(prefs: NotificationPrefs) {
  mockPrefs = prefs;
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
