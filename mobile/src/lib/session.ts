import { useSyncExternalStore } from 'react';

/** Pengguna yang sedang masuk (bentuk `user` dari Better Auth). */
export type SessionUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
};

export type SessionState =
  | { status: 'loading'; user: null }
  | { status: 'signed-out'; user: null }
  | { status: 'signed-in'; user: SessionUser };

// Mulai 'loading' sampai sesi tersimpan dipulihkan (`bootstrapSession`).
let state: SessionState = { status: 'loading', user: null };
const listeners = new Set<() => void>();

/**
 * Simpan sesi aktif dan beri tahu pendengar (navigasi ikut berpindah
 * antara layar autentikasi dan aplikasi). `null` = keluar.
 */
export function setSessionUser(user: SessionUser | null) {
  state = user ? { status: 'signed-in', user } : { status: 'signed-out', user: null };
  listeners.forEach((l) => l());
}

export function setSessionLoading() {
  state = { status: 'loading', user: null };
  listeners.forEach((l) => l());
}

export const getSession = () => state;

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Status sesi terkini untuk komponen React. */
export function useSession(): SessionState {
  return useSyncExternalStore(subscribe, getSession, getSession);
}
