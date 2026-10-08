import { getSession } from '@/lib/session';
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
