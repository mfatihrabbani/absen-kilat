import * as Linking from 'expo-linking';

import { NETWORK_ERROR, resolveUploadUrl } from '@/lib/api';
import { authClient, sessionCookie } from '@/lib/auth-client';
import { getSession, setSessionUser, type SessionUser } from '@/lib/session';

/**
 * Layanan autentikasi lewat Better Auth (`/api/auth/*` di server):
 * daftar, masuk, verifikasi email dengan kode OTP, lupa/atur ulang sandi, ganti sandi, keluar.
 */

/** Galat autentikasi dengan pesan siap tampil; `field` menunjuk input yang bermasalah. */
export class AuthError extends Error {
  constructor(
    message: string,
    public field?: 'name' | 'email' | 'password' | 'code',
    /** Kode galat Better Auth asli, mis. `EMAIL_NOT_VERIFIED`. */
    public code?: string,
  ) {
    super(message);
  }
}

type BetterAuthError = { code?: string; message?: string; status: number };
type BetterAuthUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
};

/** Kode galat Better Auth → pesan aplikasi (dan field yang ditandai). */
const ERRORS: Record<string, [string, AuthError['field']?]> = {
  USER_ALREADY_EXISTS: ['Email ini sudah terdaftar. Masuk atau gunakan email lain.', 'email'],
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: ['Email ini sudah terdaftar. Masuk atau gunakan email lain.', 'email'],
  INVALID_EMAIL: ['Masukkan email yang valid.', 'email'],
  INVALID_EMAIL_OR_PASSWORD: ['Email atau kata sandi salah. Periksa lagi lalu coba masuk.'],
  INVALID_OTP: ['Kode salah atau sudah kedaluwarsa. Coba lagi atau kirim ulang kode.', 'code'],
  OTP_EXPIRED: ['Kode sudah kedaluwarsa. Kirim ulang kode baru.', 'code'],
  TOO_MANY_ATTEMPTS: ['Terlalu banyak percobaan. Kirim ulang kode baru.', 'code'],
  INVALID_TOKEN: ['Tautan reset tidak valid atau sudah kedaluwarsa. Minta tautan baru.'],
  INVALID_PASSWORD: ['Kata sandi saat ini salah. Coba lagi atau atur ulang lewat email.', 'password'],
  PASSWORD_TOO_SHORT: ['Kata sandi minimal 8 karakter.', 'password'],
  PASSWORD_TOO_WEAK: ['Kata sandi harus mengandung huruf dan angka.', 'password'],
};

function toAuthError(error: BetterAuthError): AuthError {
  if (error.status === 429) {
    return new AuthError('Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.');
  }
  const known = error.code ? ERRORS[error.code] : undefined;
  if (known) return new AuthError(known[0], known[1], error.code);
  return new AuthError(error.message || 'Terjadi kesalahan. Coba lagi.', undefined, error.code);
}

/** Jalankan aksi Better Auth; galat jaringan/server diubah menjadi `AuthError`. */
async function call<T>(
  request: Promise<{ data: T | null; error: BetterAuthError | null }>,
): Promise<T> {
  let result: { data: T | null; error: BetterAuthError | null };
  try {
    result = await request;
  } catch {
    throw new AuthError(NETWORK_ERROR);
  }
  if (result.error) throw toAuthError(result.error);
  // Simpan salinan cookie terbaru untuk memuat foto privat.
  await sessionCookie();
  return result.data as T;
}

/** User Better Auth → pengguna sesi aplikasi (URL foto profil dibuat lengkap). */
export function toSessionUser(user: BetterAuthUser): SessionUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerified,
    image: resolveUploadUrl(user.image),
  };
}

/** Pulihkan sesi tersimpan saat aplikasi dibuka; tanpa sesi valid → layar Masuk. */
export async function bootstrapSession(): Promise<void> {
  try {
    const { data } = await authClient.getSession();
    await sessionCookie();
    setSessionUser(data?.user ? toSessionUser(data.user) : null);
  } catch {
    setSessionUser(null);
  }
}

/** Email yang menunggu verifikasi (setelah daftar atau masuk dengan email belum terverifikasi). */
let pendingEmail: string | null = null;
export const getPendingEmail = () => pendingEmail;

export type SignUpInput = { name: string; email: string; password: string };

/** Daftar akun baru; server langsung mengirim kode verifikasi ke email. */
export async function signUp(input: SignUpInput): Promise<void> {
  const email = input.email.trim();
  await call(authClient.signUp.email({ name: input.name.trim(), email, password: input.password }));
  pendingEmail = email;
}

export type SignInInput = { email: string; password: string };

/**
 * Masuk dengan email & kata sandi. Mengembalikan `'verify'` bila email belum
 * terverifikasi — kode baru dikirim dan pengguna diarahkan ke layar verifikasi.
 */
export async function signIn(input: SignInInput): Promise<'ok' | 'verify'> {
  const email = input.email.trim();
  try {
    const data = await call(authClient.signIn.email({ email, password: input.password }));
    setSessionUser(toSessionUser(data.user));
    return 'ok';
  } catch (e) {
    if (e instanceof AuthError && e.code === 'EMAIL_NOT_VERIFIED') {
      pendingEmail = email;
      await resendVerification(email).catch(() => {});
      return 'verify';
    }
    throw e;
  }
}

/** Keluar dari sesi; sesi lokal tetap dibersihkan walau server tidak terjangkau. */
export async function signOut(): Promise<void> {
  try {
    await authClient.signOut();
  } finally {
    await sessionCookie();
    setSessionUser(null);
  }
}

/** Verifikasi email dengan kode 6 digit; server langsung membuat sesi (auto sign-in). */
export async function verifyEmail(input: { email: string; code: string }): Promise<void> {
  const data = await call(authClient.emailOtp.verifyEmail({ email: input.email, otp: input.code }));
  pendingEmail = null;
  if (data && 'user' in data && data.user) {
    setSessionUser(toSessionUser(data.user as BetterAuthUser));
  } else {
    await bootstrapSession();
  }
}

/** Kirim ulang kode verifikasi email. */
export async function resendVerification(email: string): Promise<void> {
  await call(authClient.emailOtp.sendVerificationOtp({ email, type: 'email-verification' }));
  pendingEmail = email;
}

/** Email terakhir yang meminta reset kata sandi (ditampilkan di layar atur sandi). */
let resetEmail: string | null = null;
export const getResetEmail = () => resetEmail;

/**
 * Kirim tautan reset kata sandi ke email. Tautan membuka aplikasi di layar
 * atur-sandi (`absenkilat://atur-sandi?token=...`, atau URL Expo Go saat pengembangan).
 */
export async function requestPasswordReset(email: string): Promise<void> {
  await call(
    authClient.requestPasswordReset({
      email: email.trim(),
      redirectTo: Linking.createURL('/atur-sandi'),
    }),
  );
  resetEmail = email.trim();
}

/** Simpan kata sandi baru memakai token dari tautan email. */
export async function resetPassword(input: { token: string; newPassword: string }): Promise<void> {
  await call(authClient.resetPassword({ token: input.token, newPassword: input.newPassword }));
}

/**
 * Ganti kata sandi akun yang sedang masuk; sesi di perangkat lain dikeluarkan dan
 * perangkat ini menerima cookie sesi baru.
 */
export async function changePassword(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  await call(
    authClient.changePassword({
      currentPassword: input.currentPassword,
      newPassword: input.newPassword,
      revokeOtherSessions: true,
    }),
  );
}

/** Perbarui pengguna di sesi lokal (mis. setelah ganti nama/foto). */
export function patchSessionUser(patch: Partial<SessionUser>) {
  const user = getSession().user;
  if (user) setSessionUser({ ...user, ...patch });
}
