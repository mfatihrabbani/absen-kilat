import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { groupByDay } from '@/lib/attendance';
import { addDays, toDateKey } from '@/lib/date';
import { listAttendances } from '@/services/attendance';
import type { DayRecords } from '@/types/attendance';

/** Berapa hari ke belakang yang dimuat untuk beranda & riwayat. */
const HISTORY_DAYS = 120;

type State = { records: DayRecords; error: string | null; loaded: boolean };

/**
 * Riwayat absen (dikelompokkan per tanggal) untuk `HISTORY_DAYS` terakhir.
 * Dimuat ulang setiap kali layar kembali fokus, mis. sesudah absen.
 */
export function useAttendanceHistory() {
  const [state, setState] = useState<State>({ records: {}, error: null, loaded: false });
  const [refreshing, setRefreshing] = useState(false);

  const fetchRecords = useCallback(async () => {
    const today = new Date();
    try {
      const list = await listAttendances({
        from: toDateKey(addDays(today, -HISTORY_DAYS)),
        to: toDateKey(today),
      });
      setState({ records: groupByDay(list), error: null, loaded: true });
    } catch (e) {
      setState((s) => ({
        ...s,
        loaded: true,
        error: e instanceof Error ? e.message : 'Gagal memuat riwayat absen',
      }));
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchRecords();
    }, [fetchRecords]),
  );

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchRecords();
    setRefreshing(false);
  }, [fetchRecords]);

  return { ...state, refreshing, refresh };
}
