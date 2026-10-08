import Constants from 'expo-constants';
import { Platform } from 'react-native';

const API_PORT = 4000;

/** Host komputer pengembang (IP LAN) dari URL dev server Expo, mis. `192.168.1.9:8081`. */
function devHost(): string | null {
  const hostUri = Constants.expoConfig?.hostUri ?? null;
  return hostUri ? hostUri.split(':')[0] : null;
}

function resolveApiUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return fromEnv;
  if (Platform.OS === 'web') {
    // Web dev: server di host yang sama dengan halaman (localhost atau IP LAN).
    if (typeof window !== 'undefined') {
      return `${window.location.protocol}//${window.location.hostname}:${API_PORT}`;
    }
    return `http://localhost:${API_PORT}`;
  }
  // Expo Go / dev build: server berjalan di komputer yang sama dengan Metro.
  const host = devHost();
  return `http://${host ?? 'localhost'}:${API_PORT}`;
}

/**
 * URL dasar API server Absen Kilat. Atur `EXPO_PUBLIC_API_URL` untuk server lain
 * (mis. produksi); tanpa itu dipakai komputer yang menjalankan Metro, port 4000.
 */
export const API_URL = resolveApiUrl().replace(/\/+$/, '');
