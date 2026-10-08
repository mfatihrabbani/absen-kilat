/** Pengguna yang sedang masuk. Sementara data tiruan sampai autentikasi tersambung. */
export type CurrentUser = {
  id: number;
  name: string;
  email: string;
  avatarUrl: string | null;
};

const MOCK_USER: CurrentUser = {
  id: 1,
  name: 'Rina Kartika',
  email: 'rina.kartika@contoh.id',
  avatarUrl: null,
};

export function useCurrentUser(): CurrentUser {
  return MOCK_USER;
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
