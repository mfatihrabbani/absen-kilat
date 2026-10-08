import { Shift } from '@/constants/theme';
import { minutesOf, toDateKey } from '@/lib/date';
import type { Attendance, DayRecord, DayRecords } from '@/types/attendance';

/** Kelompokkan daftar absen per tanggal lokal menjadi pasangan masuk/keluar. */
export function groupByDay(list: Attendance[]): DayRecords {
  const records: DayRecords = {};
  for (const a of [...list].sort((x, y) => x.timestamp.localeCompare(y.timestamp))) {
    const key = toDateKey(new Date(a.timestamp));
    const rec = (records[key] ??= {});
    // Simpan absen masuk pertama dan absen keluar terakhir di hari itu.
    if (a.type === 'in' && !rec.in) rec.in = a;
    if (a.type === 'out') rec.out = a;
  }
  return records;
}

export const timeOf = (a: Attendance) => new Date(a.timestamp);

export const isLate = (rec: DayRecord | undefined) => rec?.in?.status === 'late';

/** Berapa menit absen masuk melewati batas 08.00 (0 bila tepat waktu). */
export function lateMinutes(a: Attendance): number {
  return Math.max(0, minutesOf(timeOf(a)) - Shift.start);
}

/** Lama kerja (menit) dari absen masuk sampai keluar, atau sampai `now` bila belum keluar. */
export function workedMinutes(rec: DayRecord | undefined, now?: Date): number {
  if (!rec?.in) return 0;
  const end = rec.out ? timeOf(rec.out) : now;
  if (!end) return 0;
  return Math.max(0, Math.round((end.getTime() - timeOf(rec.in).getTime()) / 60000));
}

export type DayTone = 'ok' | 'late';

export const toneOf = (rec: DayRecord | undefined): DayTone | null =>
  !rec?.in ? null : isLate(rec) ? 'late' : 'ok';

export const statusLabel = (rec: DayRecord | undefined) =>
  !rec?.in ? 'tidak ada catatan' : isLate(rec) ? 'terlambat' : 'tepat waktu';
