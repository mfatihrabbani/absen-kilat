import { mockFindById, mockListRange } from '@/mocks/attendances';
import type { Attendance } from '@/types/attendance';

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
