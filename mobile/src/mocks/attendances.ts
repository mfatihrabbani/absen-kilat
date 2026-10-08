import { Shift } from '@/constants/theme';
import { addDays, isWeekend, minutesOf, toDateKey } from '@/lib/date';
import type { Attendance, AttendanceType } from '@/types/attendance';

/**
 * Data tiruan absensi — dipakai selama backend belum tersambung.
 * Mengikuti fixture desain: 20 hari kerja terakhir (satu hari bolos),
 * ditambah absen masuk hari ini bila jamnya sudah lewat.
 */

const FIXTURE_TIMES: ([string, string] | null)[] = [
  ['07.54', '17.08'],
  ['08.17', '17.02'],
  ['07.49', '17.15'],
  ['07.58', '17.04'],
  ['07.41', '17.21'],
  ['08.06', '17.10'],
  ['07.52', '17.03'],
  null,
  ['07.47', '17.12'],
  ['07.55', '17.06'],
  ['07.50', '17.01'],
  ['08.02', '17.09'],
  ['07.44', '17.05'],
  ['07.57', '17.18'],
  ['07.53', '17.02'],
  ['08.11', '17.07'],
  ['07.48', '17.11'],
  ['07.51', '17.04'],
  ['07.56', '17.09'],
  ['07.46', '17.13'],
];

/**
 * Foto selfie tiruan: ilustrasi kartun laki-laki (DiceBear avataaars), bukan foto orang sungguhan.
 * Satu wajah yang sama untuk semua catatan, seperti selfie milik satu pengguna.
 */
const DEMO_SELFIE_URL =
  'https://api.dicebear.com/9.x/avataaars/png?seed=budi-santoso&size=600&top=shortFlat&facialHair=beardLight&facialHairProbability=100&accessoriesProbability=0&clothing=collarAndSweater&clothesColor=262e33&eyes=default&eyebrows=defaultNatural&mouth=smile&skinColor=d08b5b&hairColor=2c1b18&facialHairColor=2c1b18&backgroundColor=f3ebe4';

const BASE_LAT = -6.20088;
const BASE_LNG = 106.84557;

let nextId = 1;

function makeEntry(day: Date, type: AttendanceType, time: string): Attendance {
  const seed = day.getDate();
  const at = new Date(day);
  at.setHours(
    Number(time.slice(0, 2)),
    Number(time.slice(3, 5)),
    (seed * (type === 'in' ? 7 : 13)) % 60,
    0,
  );
  const id = nextId++;
  return {
    id,
    type,
    photoUrl: DEMO_SELFIE_URL,
    latitude: BASE_LAT + seed * 0.00001,
    longitude: BASE_LNG - seed * 0.00002,
    accuracy: 5 + (seed % 8),
    timestamp: at.toISOString(),
    status: type === 'in' && minutesOf(at) > Shift.start ? 'late' : 'on_time',
    createdAt: at.toISOString(),
  };
}

function seed(): Attendance[] {
  const now = new Date();
  const entries: Attendance[] = [];

  let d = new Date(now);
  d.setHours(12, 0, 0, 0);
  let i = 0;
  while (i < FIXTURE_TIMES.length) {
    d = addDays(d, -1);
    if (isWeekend(d)) continue;
    const t = FIXTURE_TIMES[i++];
    if (!t) continue;
    entries.push(makeEntry(d, 'in', t[0]), makeEntry(d, 'out', t[1]));
  }

  if (!isWeekend(now) && minutesOf(now) >= 7 * 60 + 52) {
    entries.push(makeEntry(now, 'in', '07.52'));
  }
  return entries;
}

export const mockAttendances: Attendance[] = seed();

/** Absen pada rentang tanggal `from`..`to` (inklusif, `YYYY-MM-DD`), urut kronologis. */
export function mockListRange(from: string, to: string): Attendance[] {
  return mockAttendances
    .filter((a) => {
      const key = toDateKey(new Date(a.timestamp));
      return key >= from && key <= to;
    })
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

export function mockFindById(id: number): Attendance | undefined {
  return mockAttendances.find((a) => a.id === id);
}

/** Simpan absen baru ke data tiruan (pengganti `POST /api/attendance`). */
export function mockCreate(input: Omit<Attendance, 'id' | 'status' | 'createdAt'>): Attendance {
  const at = new Date(input.timestamp);
  const created: Attendance = {
    ...input,
    id: nextId++,
    status: input.type === 'in' && minutesOf(at) > Shift.start ? 'late' : 'on_time',
    createdAt: new Date().toISOString(),
  };
  mockAttendances.push(created);
  return created;
}
