import type { ImageSource } from 'expo-image';
import { Platform } from 'react-native';

import { API_URL } from '@/lib/api-config';
import { lastSessionCookie, sessionCookie } from '@/lib/auth-client';
import { setSessionUser } from '@/lib/session';

export const NETWORK_ERROR =
  'Tidak bisa terhubung ke server. Pastikan server berjalan dan HP satu jaringan dengan komputer.';

/** Galat dari API dengan status HTTP dan pesan siap tampil. */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message);
  }
}

/**
 * Panggil API server dengan sesi pengguna (cookie Better Auth). Respons non-2xx
 * dilempar sebagai `ApiError`; 401 berarti sesi berakhir sehingga pengguna dikeluarkan.
 */
export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  if (Platform.OS !== 'web') {
    const cookie = await sessionCookie();
    if (cookie) headers.set('Cookie', cookie);
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { ...init, headers, credentials: 'include' });
  } catch {
    throw new ApiError(NETWORK_ERROR, 0);
  }

  const body = (await res.json().catch(() => null)) as {
    error?: { message?: string };
    message?: string;
    code?: string;
  } | null;
  if (!res.ok) {
    if (res.status === 401) setSessionUser(null);
    throw new ApiError(
      body?.error?.message ?? body?.message ?? `Permintaan gagal (${res.status})`,
      res.status,
      body?.code,
    );
  }
  return body as T;
}

/** Tambahkan file lokal (URI kamera/galeri) ke FormData — native memakai objek {uri}, web memakai Blob. */
export async function appendFile(
  form: FormData,
  field: string,
  file: { uri: string; name: string; type: string },
) {
  if (Platform.OS === 'web') {
    const blob = await (await fetch(file.uri)).blob();
    form.append(field, blob, file.name);
  } else {
    form.append(field, file as unknown as Blob);
  }
}

/** URL file upload server (mis. foto profil `avatars/...`) menjadi URL penuh. */
export function resolveUploadUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^(https?:|file:|data:|blob:)/.test(path)) return path;
  return `${API_URL}/uploads/${path.replace(/^\/+/, '')}`;
}

/**
 * Sumber gambar untuk foto privat di server (selfie absen): di HP disertai cookie
 * sesi karena hanya pemilik yang boleh membukanya; di web browser mengirim cookie sendiri.
 */
export function authImageSource(url: string): ImageSource {
  const cookie = lastSessionCookie();
  if (Platform.OS !== 'web' && cookie && url.startsWith(API_URL)) {
    return { uri: url, headers: { Cookie: cookie } };
  }
  return { uri: url };
}
