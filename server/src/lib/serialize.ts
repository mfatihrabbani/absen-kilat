import type { Request } from 'express';

import type { AttendanceRow } from '../db/schema';

/** Bentuk JSON satu absen untuk aplikasi (sama dengan tipe `Attendance` di mobile). */
export type AttendanceDto = {
  id: number;
  type: 'in' | 'out';
  photoUrl: string;
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  timestamp: string;
  status: 'on_time' | 'late';
  createdAt: string;
};

/** URL dasar server sebagaimana diakses klien (mis. `http://192.168.1.5:3000`). */
export const baseUrlOf = (req: Request) => `${req.protocol}://${req.get('host')}`;

/** URL publik untuk file di folder upload; URL absolut (data contoh) dibiarkan apa adanya. */
export function publicFileUrl(req: Request, filePath: string): string {
  return /^https?:\/\//.test(filePath) ? filePath : `${baseUrlOf(req)}/uploads/${filePath}`;
}

export function toAttendanceDto(req: Request, row: AttendanceRow): AttendanceDto {
  return {
    id: row.id,
    type: row.type,
    photoUrl: publicFileUrl(req, row.photoPath),
    latitude: row.latitude,
    longitude: row.longitude,
    accuracy: row.accuracy,
    timestamp: row.timestamp.toISOString(),
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  };
}
