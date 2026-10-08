/**
 * Layanan autentikasi. Sementara memakai data tiruan sampai Better Auth tersambung.
 * Kontrak server: Better Auth di `/api/auth/*` (sign-up/email, sign-in/email, ...).
 */

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Galat autentikasi dengan pesan siap tampil; `field` menunjuk input yang bermasalah. */
export class AuthError extends Error {
  constructor(
    message: string,
    public field?: 'name' | 'email' | 'password' | 'code',
  ) {
    super(message);
  }
}

/** Email yang menunggu verifikasi setelah daftar (dipakai layar verifikasi). */
let pendingEmail: string | null = null;
export const getPendingEmail = () => pendingEmail;

export type SignUpInput = { name: string; email: string; password: string };

/** Daftar akun baru; akun belum aktif sampai email diverifikasi. */
export async function signUp(input: SignUpInput): Promise<void> {
  await delay(900);
  if (input.email.trim().toLowerCase() === 'dipakai@contoh.com') {
    throw new AuthError('Email ini sudah terdaftar. Masuk atau gunakan email lain.', 'email');
  }
  pendingEmail = input.email.trim();
}
