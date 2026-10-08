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

export type SignInInput = { email: string; password: string };

/** Masuk dengan email & kata sandi. Galat tanpa `field` ditampilkan sebagai peringatan umum. */
export async function signIn(input: SignInInput): Promise<void> {
  await delay(900);
  if (input.password === 'salah12345') {
    throw new AuthError('Email atau kata sandi salah. Periksa lagi lalu coba masuk.');
  }
}

/** Email terakhir yang meminta reset kata sandi (ditampilkan di layar atur sandi). */
let resetEmail: string | null = null;
export const getResetEmail = () => resetEmail;

/**
 * Kirim tautan reset kata sandi ke email. Tautan membuka aplikasi di
 * `absenkilat://atur-sandi?token=...`. Selalu berhasil agar tidak membocorkan
 * apakah email terdaftar.
 */
export async function requestPasswordReset(email: string): Promise<void> {
  await delay(900);
  resetEmail = email.trim();
}

/** Simpan kata sandi baru memakai token dari tautan email. */
export async function resetPassword(input: { token: string; newPassword: string }): Promise<void> {
  await delay(900);
  if (input.token === 'kedaluwarsa') {
    throw new AuthError('Tautan reset tidak valid atau sudah kedaluwarsa. Minta tautan baru.');
  }
}
