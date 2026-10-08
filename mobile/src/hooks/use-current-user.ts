import { useSession, type SessionUser } from '@/lib/session';

/** Pengguna yang sedang masuk. */
export type CurrentUser = SessionUser;

const GUEST: CurrentUser = { id: '', name: 'Tamu', email: '', emailVerified: false, image: null };

/** Pengguna dari sesi aktif (layar aplikasi hanya terjangkau saat sudah masuk). */
export function useCurrentUser(): CurrentUser {
  return useSession().user ?? GUEST;
}

/** `Rina Kartika` → `RK` */
export function initialsOf(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
