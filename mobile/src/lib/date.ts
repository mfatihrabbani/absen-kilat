const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export const pad = (n: number) => String(n).padStart(2, '0');

/** Kunci tanggal lokal `YYYY-MM-DD`, dipakai sebagai parameter `?date=` ke API. */
export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Kebalikan `toDateKey`: Date lokal pukul 12.00 (aman dari pergeseran DST). */
export function fromDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d, 12);
}

export function addDays(date: Date, n: number): Date {
  const x = new Date(date);
  x.setDate(x.getDate() + n);
  return x;
}

/** Senin dari minggu yang memuat `date` (minggu dimulai Senin). */
export function mondayOf(date: Date): Date {
  const m = new Date(date);
  m.setHours(12, 0, 0, 0);
  m.setDate(m.getDate() - ((m.getDay() + 6) % 7));
  return m;
}

export const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6;

/** Menit sejak 00.00 waktu lokal. */
export const minutesOf = (date: Date) => date.getHours() * 60 + date.getMinutes();

/** `07.48` — format jam Indonesia. */
export function formatTime(date: Date): string {
  return `${pad(date.getHours())}.${pad(date.getMinutes())}`;
}

/** `07.48.12` */
export function formatTimeWithSeconds(date: Date): string {
  return `${formatTime(date)}.${pad(date.getSeconds())}`;
}

/** `Rabu` */
export const dayName = (date: Date) => DAYS[date.getDay()];

/** `Rab` */
export const dayShort = (date: Date) => DAYS[date.getDay()].slice(0, 3);

/** `Okt` */
export const monthShort = (date: Date) => MONTHS[date.getMonth()].slice(0, 3);

/** `Oktober 2026` */
export const monthLabel = (date: Date) => `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;

/** `Rabu, 7 Oktober` */
export function formatDayMonth(date: Date): string {
  return `${dayName(date)}, ${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

/** `Rabu, 7 Oktober 2026` */
export function formatLongDate(date: Date): string {
  return `${formatDayMonth(date)} ${date.getFullYear()}`;
}

/** `7 Okt` */
export const formatShortDate = (date: Date) => `${date.getDate()} ${monthShort(date)}`;

/** `5 – 11 Okt 2026` atau `29 Sep – 5 Okt 2026` untuk minggu yang dimulai `monday`. */
export function weekLabel(monday: Date): string {
  const sunday = addDays(monday, 6);
  return monday.getMonth() === sunday.getMonth()
    ? `${monday.getDate()} – ${sunday.getDate()} ${monthShort(sunday)} ${sunday.getFullYear()}`
    : `${formatShortDate(monday)} – ${formatShortDate(sunday)} ${sunday.getFullYear()}`;
}

/** `8 j 40 m`, `8 j`, atau `25 m`. */
export function formatDuration(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (!h) return `${m} m`;
  return m ? `${h} j ${m} m` : `${h} j`;
}

/** Sapaan sesuai jam: pagi/siang/sore/malam. */
export function greeting(date: Date): string {
  const h = date.getHours();
  if (h < 11) return 'Selamat pagi';
  if (h < 15) return 'Selamat siang';
  if (h < 18) return 'Selamat sore';
  return 'Selamat malam';
}
