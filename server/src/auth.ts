import { expo } from '@better-auth/expo';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { emailOTP } from 'better-auth/plugins';

import { db } from './db';
import { accounts, sessions, users, verifications } from './db/schema';
import { env } from './env';
import { verificationEmail } from './lib/email-templates';
import { sendMail } from './lib/mailer';

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
        await sendMail(verificationEmail({ to: email, otp, link: link.toString() }));
      },
    }),
  ],
});

export type AuthSession = typeof auth.$Infer.Session;
