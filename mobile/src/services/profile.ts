import { apiFetch, appendFile } from '@/lib/api';
import { authClient } from '@/lib/auth-client';
import type { PickedImage } from '@/lib/pick-image';
import { AuthError, patchSessionUser } from '@/services/auth';
import type { NotificationPrefs, Profile } from '@/types/profile';

/** Profil pengguna yang sedang masuk (`GET /api/profile`); nama & foto di sesi ikut diselaraskan. */
export async function getProfile(): Promise<Profile> {
  const res = await apiFetch<{ data: Profile }>('/api/profile');
  patchSessionUser({ name: res.data.name, image: res.data.image });
  return res.data;
}

/**
 * Ganti foto profil (`POST /api/profile/photo`, multipart) atau hapus (`DELETE`),
 * kembali ke avatar inisial. Mengembalikan URL foto baru.
 */
export async function updateProfilePhoto(image: PickedImage | null): Promise<string | null> {
  let res: { data: Profile };
  if (image) {
    const form = new FormData();
    await appendFile(form, 'photo', { uri: image.uri, name: image.fileName, type: image.mimeType });
    res = await apiFetch<{ data: Profile }>('/api/profile/photo', { method: 'POST', body: form });
  } else {
    res = await apiFetch<{ data: Profile }>('/api/profile/photo', { method: 'DELETE' });
  }
  patchSessionUser({ image: res.data.image });
  return res.data.image;
}

/** Simpan preferensi notifikasi (`PUT /api/profile/notifications`). */
export async function updateNotificationPrefs(prefs: NotificationPrefs): Promise<NotificationPrefs> {
  const res = await apiFetch<{ data: Profile }>('/api/profile/notifications', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(prefs),
  });
  return res.data.notificationPrefs;
}

/** Ubah nama tampilan lewat Better Auth (`POST /api/auth/update-user`). */
export async function updateName(name: string): Promise<string> {
  const { error } = await authClient.updateUser({ name });
  if (error) throw new AuthError(error.message || 'Gagal menyimpan nama. Coba lagi.');
  patchSessionUser({ name });
  return name;
}
