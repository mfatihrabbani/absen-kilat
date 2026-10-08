import { expo } from '@better-auth/expo';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';

import { db } from './db';
import { accounts, sessions, users, verifications } from './db/schema';
import { env } from './env';

/**
 * Konfigurasi Better Auth: login email & kata sandi, sesi di SQLite (Drizzle),
 * dan plugin Expo agar aplikasi mobile bisa memakai cookie sesi lewat secure storage.
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
  plugins: [expo()],
});

export type AuthSession = typeof auth.$Infer.Session;
