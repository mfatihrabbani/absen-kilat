/**
 * Layanan autentikasi. Sementara memakai data tiruan sampai Better Auth tersambung.
 * Kontrak server: Better Auth di `/api/auth/*` (sign-up/email, sign-in/email, ...).
 */

import { setSessionUser, type SessionUser } from '@/lib/session';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Akun contoh untuk data tiruan. */
const MOCK_USER: SessionUser = {
  id: 'demo-user',
  name: 'Rina Kartika',
  email: 'rina.kartika@contoh.id',
  emailVerified: true,
  image: null,
};

/** `budi.santoso@x.id` → `Budi Santoso` (nama tiruan dari email). */
const nameFromEmail = (email: string) =>
  email
    .split('@')[0]
    .split(/[._-]+/)
    .filter(Boolean)
    .map((p) => p[0].toUpperCase() + p.slice(1))
    .join(' ');

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
let pendingName: string | null = null;
export const getPendingEmail = () => pendingEmail;

export type SignUpInput = { name: string; email: string; password: string };

/** Daftar akun baru; akun belum aktif sampai email diverifikasi. */
export async function signUp(input: SignUpInput): Promise<void> {
  await delay(900);
  if (input.email.trim().toLowerCase() === 'dipakai@contoh.com') {
    throw new AuthError('Email ini sudah terdaftar. Masuk atau gunakan email lain.', 'email');
  }
  pendingEmail = input.email.trim();
  pendingName = input.name.trim();
}

export type SignInInput = { email: string; password: string };

/** Masuk dengan email & kata sandi. Galat tanpa `field` ditampilkan sebagai peringatan umum. */
export async function signIn(input: SignInInput): Promise<void> {
  await delay(900);
  if (input.password === 'salah12345') {
    throw new AuthError('Email atau kata sandi salah. Periksa lagi lalu coba masuk.');
  }
  const email = input.email.trim();
  setSessionUser(
    email.toLowerCase() === MOCK_USER.email
      ? MOCK_USER
      : { ...MOCK_USER, id: `mock-${email}`, email, name: nameFromEmail(email) },
  );
}

/** Keluar dari sesi saat ini. */
export async function signOut(): Promise<void> {
  await delay(300);
  setSessionUser(null);
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

/** Verifikasi email dengan kode 6 digit yang dikirim setelah daftar. */
export async function verifyEmail(input: { email: string; code: string }): Promise<void> {
  await delay(900);
  if (input.code === '000000') {
    throw new AuthError(
      'Kode salah atau sudah kedaluwarsa. Coba lagi atau kirim ulang kode.',
      'code',
    );
  }
  // Setelah verifikasi, pengguna langsung masuk.
  setSessionUser({
    ...MOCK_USER,
    id: `mock-${input.email}`,
    email: input.email,
    name: pendingName ?? nameFromEmail(input.email),
  });
}

/** Kirim ulang kode verifikasi email. */
export async function resendVerification(email: string): Promise<void> {
  await delay(600);
  pendingEmail = email;
}
