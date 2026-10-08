import { expoClient } from '@better-auth/expo/client';
import { createAuthClient } from 'better-auth/client';
import { emailOTPClient } from 'better-auth/client/plugins';
import * as SecureStore from 'expo-secure-store';

import { API_URL } from '@/lib/api-config';

/**
 * Klien Better Auth. Di HP, cookie sesi disimpan di SecureStore oleh plugin Expo;
 * di web, browser menyimpan cookie (`credentials: 'include'`).
 */
export const authClient = createAuthClient({
  baseURL: API_URL,
  fetchOptions: { credentials: 'include' },
  plugins: [
    expoClient({ scheme: 'absenkilat', storagePrefix: 'absenkilat', storage: SecureStore }),
    emailOTPClient(),
  ],
});

let cachedCookie = '';

/** Ambil cookie sesi terbaru (kosong di web) dan simpan salinannya untuk header gambar. */
export async function sessionCookie(): Promise<string> {
  try {
    cachedCookie = (await authClient.getCookie()) ?? '';
  } catch {
    cachedCookie = '';
  }
  return cachedCookie;
}

/** Cookie sesi terakhir yang diketahui (sinkron), untuk memuat foto privat dengan expo-image. */
export const lastSessionCookie = () => cachedCookie;
