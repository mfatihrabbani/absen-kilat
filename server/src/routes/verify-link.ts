import { eq } from 'drizzle-orm';
import { Router } from 'express';

import { auth } from '../auth';
import { db } from '../db';
import { users } from '../db/schema';
import { env } from '../env';

export const verifyLinkRouter = Router();

/**
 * `GET /api/verify-email-link?email=...&otp=...` — tautan di email verifikasi.
 * Memverifikasi kode lalu mengarahkan ke aplikasi (`APP_VERIFIED_URL`),
 * dengan `?error=invalid_token` bila kode salah/kedaluwarsa.
 */
verifyLinkRouter.get('/verify-email-link', async (req, res) => {
  const email = typeof req.query.email === 'string' ? req.query.email.trim().toLowerCase() : '';
  const otp = typeof req.query.otp === 'string' ? req.query.otp : '';
  let ok = false;
  try {
    await auth.api.verifyEmailOTP({ body: { email, otp } });
    ok = true;
  } catch {
    // Tautan lama dibuka lagi setelah akun aktif: tetap anggap berhasil.
    const user = email ? await db.query.users.findFirst({ where: eq(users.email, email) }) : null;
    ok = !!user?.emailVerified;
  }
  res.redirect(302, ok ? env.appVerifiedUrl : `${env.appVerifiedUrl}?error=invalid_token`);
});
