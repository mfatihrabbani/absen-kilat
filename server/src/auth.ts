import { expo } from '@better-auth/expo';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { APIError, createAuthMiddleware } from 'better-auth/api';
import { emailOTP } from 'better-auth/plugins';

import { db } from './db';
import { accounts, sessions, users, verifications } from './db/schema';
import { env } from './env';
import { resetPasswordEmail, verificationEmail } from './lib/email-templates';
import { queueMail } from './lib/mailer';

/** Kata sandi baru harus mengandung huruf dan angka (sama dengan aturan di aplikasi). */
const passwordRule = createAuthMiddleware(async (ctx) => {
  const field =
    ctx.path === '/sign-up/email'
      ? 'password'
      : ctx.path === '/reset-password' || ctx.path === '/change-password'
        ? 'newPassword'
        : null;
  if (!field) return;
  const value = (ctx.body as Record<string, unknown> | undefined)?.[field];
  if (typeof value === 'string' && !(/[a-z]/i.test(value) && /\d/.test(value))) {
    throw new APIError('BAD_REQUEST', {
      message: 'Kata sandi harus mengandung huruf dan angka',
      code: 'PASSWORD_TOO_WEAK',
    });
  }
});

/**
 * Konfigurasi Better Auth: login email & kata sandi (wajib verifikasi email lewat
 * kode OTP), sesi di SQLite (Drizzle), dan plugin Expo agar aplikasi mobile bisa
 * memakai cookie sesi lewat secure storage.
 */
export const auth = betterAuth({
  baseURL: env.authUrl,
  basePath: '/api/auth',
  secret: env.authSecret,
  database: drizzleAdapter(db, {
    provider: 'sqlite',
    schema: { user: users, session: sessions, account: accounts, verification: verifications },
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    // Akun baru harus verifikasi email sebelum bisa masuk.
    requireEmailVerification: true,
    // Lupa kata sandi: tautan berlaku 30 menit dan membuka aplikasi
    // (`redirectTo` dari klien, mis. `absenkilat://atur-sandi?token=...`).
    resetPasswordTokenExpiresIn: 30 * 60,
    revokeSessionsOnPasswordReset: true,
    async sendResetPassword({ user, url }) {
      queueMail(resetPasswordEmail({ to: user.email, url }));
    },
  },
  emailVerification: {
    // Setelah kode/tautan verifikasi valid, pengguna langsung masuk.
    autoSignInAfterVerification: true,
  },
  user: {
    additionalFields: {
      notificationPrefs: { type: 'string', required: false, input: false },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 hari
    updateAge: 60 * 60 * 24, // perpanjang sesi sekali sehari
  },
  trustedOrigins: env.trustedOrigins,
  hooks: { before: passwordRule },
  // Batasi percobaan login/daftar/OTP per IP untuk mencegah tebak-tebakan kata sandi.
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    customRules: {
      '/sign-in/email': { window: 60, max: 5 },
      '/sign-up/email': { window: 60, max: 5 },
      '/email-otp/verify-email': { window: 60, max: 10 },
      '/email-otp/send-verification-otp': { window: 60, max: 3 },
      '/request-password-reset': { window: 60, max: 3 },
      '/reset-password': { window: 60, max: 5 },
    },
  },
  plugins: [
    expo(),
    // Verifikasi email memakai kode 6 digit (sesuai layar verifikasi aplikasi).
    emailOTP({
      otpLength: 6,
      expiresIn: 10 * 60,
      allowedAttempts: 5,
      sendVerificationOnSignUp: true,
      overrideDefaultEmailVerification: true,
      async sendVerificationOTP({ email, otp, type }) {
        if (type !== 'email-verification') return;
        const link = new URL('/api/verify-email-link', env.authUrl);
        link.searchParams.set('email', email);
        link.searchParams.set('otp', otp);
        queueMail(verificationEmail({ to: email, otp, link: link.toString() }));
      },
    }),
  ],
});

export type AuthSession = typeof auth.$Infer.Session;
