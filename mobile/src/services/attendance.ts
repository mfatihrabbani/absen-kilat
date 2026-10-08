import { mockCreate, mockFindById, mockListRange } from '@/mocks/attendances';
import type { Attendance, AttendanceType } from '@/types/attendance';

/** Simulasi latensi jaringan supaya state loading ikut teruji. */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export type AttendanceQuery = { date: string } | { from: string; to: string };

/**
 * Daftar absen milik pengguna, urut kronologis.
 * Kontrak: `GET /api/attendance?date=YYYY-MM-DD` atau
 * `GET /api/attendance?from=YYYY-MM-DD&to=YYYY-MM-DD` → `{ data: Attendance[] }`.
 * Sementara masih memakai data tiruan.
 */
export async function listAttendances(query: AttendanceQuery): Promise<Attendance[]> {
  await delay(300);
  return 'date' in query
    ? mockListRange(query.date, query.date)
    : mockListRange(query.from, query.to);
}

/**
 * Satu catatan absen milik pengguna.
 * Kontrak: `GET /api/attendance/:id` → `{ data: Attendance }`, 404 bila tidak ada.
 * Mengembalikan `null` bila tidak ditemukan.
 */
export async function getAttendance(id: number): Promise<Attendance | null> {
  await delay(200);
  return mockFindById(id) ?? null;
}

export type NewAttendance = {
  type: AttendanceType;
  /** URI lokal foto selfie dari kamera. */
  photoUri: string;
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
};

/**
 * Catat absen masuk/keluar. Waktu & status (tepat waktu/terlambat) ditentukan server.
 * Kontrak: `POST /api/attendance` (multipart: `photo`, `type`, `latitude`, `longitude`,
 * `accuracy`) → `201 { data: Attendance }`.
 */
export async function createAttendance(input: NewAttendance): Promise<Attendance> {
  await delay(900);
  return mockCreate({
    type: input.type,
    photoUrl: input.photoUri,
    latitude: input.latitude,
    longitude: input.longitude,
    accuracy: input.accuracy,
    timestamp: new Date().toISOString(),
  });
}
