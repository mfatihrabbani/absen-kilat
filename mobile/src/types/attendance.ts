/** Jenis absen: masuk (`in`) atau keluar (`out`). */
export type AttendanceType = 'in' | 'out';

/** Status kehadiran yang dihitung server saat absen dicatat. */
export type AttendanceStatus = 'on_time' | 'late';

/**
 * Satu catatan absen sebagaimana dikirim oleh `GET /api/attendance`.
 * Bentuknya mengikuti tabel `attendances` (camelCase), dengan `photoUrl`
 * berisi URL foto yang bisa langsung ditampilkan.
 */
export interface Attendance {
  id: number;
  type: AttendanceType;
  photoUrl: string;
  latitude: number | null;
  longitude: number | null;
  /** Akurasi GPS dalam meter saat absen diambil. */
  accuracy: number | null;
  /** Waktu absen sebenarnya, ISO 8601. */
  timestamp: string;
  status: AttendanceStatus;
  createdAt: string;
}

/** Pasangan absen masuk & keluar dalam satu hari. */
export interface DayRecord {
  in?: Attendance;
  out?: Attendance;
}

/** Peta `YYYY-MM-DD` → catatan hari itu. */
export type DayRecords = Record<string, DayRecord>;
