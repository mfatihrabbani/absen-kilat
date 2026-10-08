import { ApiError, apiFetch, appendFile } from '@/lib/api';
import type { Attendance, AttendanceType } from '@/types/attendance';

export type AttendanceQuery = { date: string } | { from: string; to: string };

/**
 * Daftar absen milik pengguna, urut kronologis.
 * `GET /api/attendance?date=YYYY-MM-DD` atau `?from=YYYY-MM-DD&to=YYYY-MM-DD`.
 */
export async function listAttendances(query: AttendanceQuery): Promise<Attendance[]> {
  const params = new URLSearchParams(
    'date' in query ? { date: query.date } : { from: query.from, to: query.to },
  );
  const res = await apiFetch<{ data: Attendance[] }>(`/api/attendance?${params}`);
  return res.data;
}

/** Satu catatan absen (`GET /api/attendance/:id`); `null` bila tidak ditemukan. */
export async function getAttendance(id: number): Promise<Attendance | null> {
  try {
    const res = await apiFetch<{ data: Attendance }>(`/api/attendance/${id}`);
    return res.data;
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
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
 * Catat absen masuk/keluar (`POST /api/attendance`, multipart). Waktu & status
 * (tepat waktu/terlambat) ditentukan server; 409 bila sudah absen hari ini.
 */
export async function createAttendance(input: NewAttendance): Promise<Attendance> {
  const form = new FormData();
  form.append('type', input.type);
  if (input.latitude != null) form.append('latitude', String(input.latitude));
  if (input.longitude != null) form.append('longitude', String(input.longitude));
  if (input.accuracy != null) form.append('accuracy', String(input.accuracy));
  await appendFile(form, 'photo', { uri: input.photoUri, name: 'selfie.jpg', type: 'image/jpeg' });

  const res = await apiFetch<{ data: Attendance }>('/api/attendance', {
    method: 'POST',
    body: form,
  });
  return res.data;
}
