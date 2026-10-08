import { eq } from 'drizzle-orm';

import { DEMO_USER_ID } from '../lib/demo-user';
import { officeDateKey, officeDayRange, statusFor } from '../lib/attendance-rules';
import { client, db } from './index';
import { attendances, users } from './schema';

/** Pengguna contoh untuk pengembangan lokal (sebelum autentikasi aktif). */
export const DEMO_USER = {
  id: DEMO_USER_ID,
  name: 'Rina Kartika',
  email: 'rina.kartika@contoh.id',
  emailVerified: true,
};

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
        photoPath: `https://i.pravatar.cc/600?img=${(seed % 12) + 32}`,
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
