import { useEffect, useState } from 'react';

import { groupByDay } from '@/lib/attendance';
import { toDateKey } from '@/lib/date';
import { listAttendances } from '@/services/attendance';
import type { AttendanceType, DayRecord } from '@/types/attendance';

/** Tahap absen hari ini: perlu absen masuk, perlu absen keluar, atau sudah lengkap. */
export type AbsenPhase = AttendanceType | 'done';

export const phaseOf = (rec: DayRecord | undefined): AbsenPhase =>
  !rec?.in ? 'in' : !rec.out ? 'out' : 'done';

/** Catatan absen hari ini beserta tahap berikutnya; `null` selama memuat. */
export function useTodayAttendance() {
  const [state, setState] = useState<{ record: DayRecord | undefined; phase: AbsenPhase } | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;
    const key = toDateKey(new Date());
    listAttendances({ date: key })
      .then((list) => groupByDay(list)[key])
      .catch(() => undefined)
      .then((record) => {
        if (!cancelled) setState({ record, phase: phaseOf(record) });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
