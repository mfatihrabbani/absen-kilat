import { randomUUID } from 'node:crypto';

import { and, eq } from 'drizzle-orm';

import { auth } from '../auth';

import { DEMO_USER_ID } from '../lib/demo-user';
import { officeDateKey, officeDayRange, statusFor } from '../lib/attendance-rules';
import { client, db } from './index';
import { accounts, attendances, users } from './schema';

/** Kata sandi akun contoh — hanya untuk pengembangan lokal. */
export const DEMO_PASSWORD = 'rahasia123';

/** Pengguna contoh untuk pengembangan lokal. */
export const DEMO_USER = {
  id: DEMO_USER_ID,
  name: 'Budi Santoso',
  email: 'budi.santoso@contoh.id',
  emailVerified: true,
};

/**
 * Foto selfie contoh: ilustrasi kartun laki-laki (DiceBear avataaars), bukan foto orang sungguhan.
 * Dipakai untuk semua catatan contoh agar wajahnya konsisten.
 */
const DEMO_SELFIE_URL =
  'https://api.dicebear.com/9.x/avataaars/png?seed=budi-santoso&size=600&top=shortFlat&facialHair=beardLight&facialHairProbability=100&accessoriesProbability=0&clothing=collarAndSweater&clothesColor=262e33&eyes=default&eyebrows=defaultNatural&mouth=smile&skinColor=d08b5b&hairColor=2c1b18&facialHairColor=2c1b18&backgroundColor=f3ebe4';

/** Jam masuk/keluar 20 hari kerja terakhir (sama dengan data tiruan aplikasi; `null` = tidak hadir). */
const FIXTURE_TIMES: ([string, string] | null)[] = [
  ['07.54', '17.08'], ['08.17', '17.02'], ['07.49', '17.15'], ['07.58', '17.04'], ['07.41', '17.21'],
  ['08.06', '17.10'], ['07.52', '17.03'], null, ['07.47', '17.12'], ['07.55', '17.06'],
  ['07.50', '17.01'], ['08.02', '17.09'], ['07.44', '17.05'], ['07.57', '17.18'], ['07.53', '17.02'],
  ['08.11', '17.07'], ['07.48', '17.11'], ['07.51', '17.04'], ['07.56', '17.09'], ['07.46', '17.13'],
];

/** Waktu pada tanggal kantor `dateKey` jam `HH.MM`. */
function at(dateKey: string, time: string, seconds: number): Date {
  const { start } = officeDayRange(dateKey);
  const [h, m] = time.split('.').map(Number) as [number, number];
  return new Date(start.getTime() + ((h * 60 + m) * 60 + seconds) * 1000);
}

await db.insert(users).values(DEMO_USER).onConflictDoNothing();

// Pastikan akun contoh bisa login dengan email & kata sandi (akun `credential` Better Auth).
const credential = await db.query.accounts.findFirst({
  where: and(eq(accounts.userId, DEMO_USER.id), eq(accounts.providerId, 'credential')),
});
if (!credential) {
  const ctx = await auth.$context;
  await db.insert(accounts).values({
    id: randomUUID(),
    accountId: DEMO_USER.id,
    providerId: 'credential',
    userId: DEMO_USER.id,
    password: await ctx.password.hash(DEMO_PASSWORD),
  });
  console.log(`Akun contoh: ${DEMO_USER.email} / ${DEMO_PASSWORD}`);
}

const existing = await db.$count(attendances, eq(attendances.userId, DEMO_USER.id));
if (existing > 0) {
  console.log(`Seed dilewati: ${DEMO_USER.email} sudah punya ${existing} catatan absen.`);
} else {
  const rows: (typeof attendances.$inferInsert)[] = [];
  let day = new Date();
  let i = 0;
  while (i < FIXTURE_TIMES.length) {
    day = new Date(day.getTime() - 86_400_000);
    const key = officeDateKey(day);
    const dow = new Date(`${key}T12:00:00Z`).getUTCDay();
    if (dow === 0 || dow === 6) continue;
    const t = FIXTURE_TIMES[i++];
    if (!t) continue;
    const seed = Number(key.slice(8));
    for (const [type, time] of [['in', t[0]], ['out', t[1]]] as const) {
      const ts = at(key, time, (seed * (type === 'in' ? 7 : 13)) % 60);
      rows.push({
        userId: DEMO_USER.id,
        type,
        photoPath: DEMO_SELFIE_URL,
        latitude: -6.20088 + seed * 0.00001,
        longitude: 106.84557 - seed * 0.00002,
        accuracy: 5 + (seed % 8),
        timestamp: ts,
        status: statusFor(type, ts),
      });
    }
  }
  await db.insert(attendances).values(rows);
  console.log(`Seed selesai: ${rows.length} catatan absen untuk ${DEMO_USER.email}.`);
}
client.close();
