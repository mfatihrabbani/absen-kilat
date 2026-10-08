import { useEffect, useState } from 'react';

import { groupByDay } from '@/lib/attendance';
import { toDateKey } from '@/lib/date';
import { getAttendance, listAttendances } from '@/services/attendance';
import type { Attendance, DayRecord } from '@/types/attendance';

type State =
  | { status: 'loading' }
  | { status: 'missing' }
  | { status: 'error'; message: string }
  | { status: 'ready'; attendance: Attendance; dateKey: string; day: DayRecord };

/** Muat satu absen beserta pasangan masuk/keluar di hari yang sama. */
export function useAttendanceDetail(id: number) {
  const [result, setResult] = useState<{ id: number; state: State } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const done = (state: State) => !cancelled && setResult({ id, state });
    (async () => {
      try {
        const attendance = Number.isFinite(id) ? await getAttendance(id) : null;
        if (!attendance) return done({ status: 'missing' });
        const dateKey = toDateKey(new Date(attendance.timestamp));
        const day = groupByDay(await listAttendances({ date: dateKey }))[dateKey] ?? {};
        done({
          status: 'ready',
          attendance,
          dateKey,
          day: { ...day, [attendance.type]: attendance },
        });
      } catch (e) {
        done({
          status: 'error',
          message: e instanceof Error ? e.message : 'Gagal memuat detail absen',
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return result?.id === id ? result.state : ({ status: 'loading' } as State);
}
