import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';

import { groupByDay } from '@/lib/attendance';
import { addDays, toDateKey } from '@/lib/date';
import { showFlash } from '@/lib/flash';
import { listAttendances } from '@/services/attendance';
import type { DayRecords } from '@/types/attendance';

/** Berapa hari ke belakang yang dimuat untuk beranda & riwayat. */
const HISTORY_DAYS = 120;

type State = { records: DayRecords; error: string | null; loaded: boolean };

/**
 * Riwayat absen (dikelompokkan per tanggal) untuk `HISTORY_DAYS` terakhir.
 * Dimuat ulang setiap kali layar kembali fokus, mis. sesudah absen. Bila gagal
 * memperbarui data yang sudah tampil, data lama dipertahankan dan banner galat muncul.
 */
export function useAttendanceHistory() {
  const [state, setState] = useState<State>({ records: {}, error: null, loaded: false });
  const [refreshing, setRefreshing] = useState(false);
  const hasData = useRef(false);

  const fetchRecords = useCallback(async (manual: boolean) => {
    const today = new Date();
    try {
      const list = await listAttendances({
        from: toDateKey(addDays(today, -HISTORY_DAYS)),
        to: toDateKey(today),
      });
      hasData.current = true;
      setState({ records: groupByDay(list), error: null, loaded: true });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Gagal memuat riwayat absen';
      if (hasData.current) {
        if (manual) showFlash({ title: 'Gagal memperbarui', body: message, tone: 'error' });
        return;
      }
      setState((s) => ({ ...s, loaded: true, error: message }));
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchRecords(false);
    }, [fetchRecords]),
  );

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchRecords(true);
    setRefreshing(false);
  }, [fetchRecords]);

  return { ...state, refreshing, refresh };
}
