/** Batas jam masuk (menit sejak 00.00 waktu kantor): lewat 08.00 dihitung terlambat. */
export const SHIFT_START_MINUTES = 8 * 60;

/** Zona waktu kantor untuk menghitung status & tanggal absen (WIB). */
export const OFFICE_TZ_OFFSET_MINUTES = 7 * 60;

/** Menit sejak 00.00 pada zona waktu kantor. */
export function officeMinutesOf(date: Date): number {
  const shifted = new Date(date.getTime() + OFFICE_TZ_OFFSET_MINUTES * 60_000);
  return shifted.getUTCHours() * 60 + shifted.getUTCMinutes();
}

/** Status absen: absen masuk setelah 08.00 = `late`; absen keluar selalu `on_time`. */
export function statusFor(type: 'in' | 'out', at: Date): 'on_time' | 'late' {
  return type === 'in' && officeMinutesOf(at) > SHIFT_START_MINUTES ? 'late' : 'on_time';
}

/** Rentang waktu [awal, akhir) untuk tanggal kantor `YYYY-MM-DD`. */
export function officeDayRange(dateKey: string): { start: Date; end: Date } {
  const [y, m, d] = dateKey.split('-').map(Number) as [number, number, number];
  const start = new Date(Date.UTC(y, m - 1, d) - OFFICE_TZ_OFFSET_MINUTES * 60_000);
  return { start, end: new Date(start.getTime() + 86_400_000) };
}

/** Tanggal kantor `YYYY-MM-DD` dari sebuah waktu. */
export function officeDateKey(date: Date): string {
  return new Date(date.getTime() + OFFICE_TZ_OFFSET_MINUTES * 60_000).toISOString().slice(0, 10);
}
