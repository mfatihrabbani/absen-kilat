import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { StatusMark } from '@/components/attendance/status';
import { CaretLeftIcon, CaretRightIcon } from '@/components/icons';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { AppText } from '@/components/ui/text';
import { Colors, Spacing } from '@/constants/theme';
import { statusLabel, toneOf } from '@/lib/attendance';
import { formatLongDate, fromDateKey, isWeekend, monthLabel, toDateKey } from '@/lib/date';
import type { DayRecords } from '@/types/attendance';

const DOWS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

type Props = {
  visible: boolean;
  onClose: () => void;
  records: DayRecords;
  selected: string;
  /** Bulan paling awal yang boleh dibuka (hari pertama bulan). */
  earliest: Date;
  onSelect: (key: string) => void;
};

/** Bottom sheet kalender bulanan untuk memilih tanggal riwayat. */
export function CalendarSheet({ visible, onClose, records, selected, earliest, onSelect }: Props) {
  const sel = fromDateKey(selected);
  // Dipasang ulang tiap kali dibuka, jadi selalu mulai dari bulan tanggal terpilih.
  const [month, setMonth] = useState(() => new Date(sel.getFullYear(), sel.getMonth(), 1));

  const today = new Date();
  const todayKey = toDateKey(today);
  const lead = (month.getDay() + 6) % 7;
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const canNext = month < new Date(today.getFullYear(), today.getMonth(), 1);
  const canPrev = month > earliest;

  const cells: (Date | null)[] = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from(
      { length: daysInMonth },
      (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1, 12),
    ),
  ];
  while (cells.length % 7) cells.push(null);
  const rows = Array.from({ length: cells.length / 7 }, (_, r) => cells.slice(r * 7, r * 7 + 7));

  const shift = (n: number) => setMonth(new Date(month.getFullYear(), month.getMonth() + n, 1));

  return (
    <BottomSheet visible={visible} onClose={onClose} accessibilityLabel="Pilih tanggal">
      {(close) => (
        <>
          <View style={styles.head}>
            <IconButton
              size={44}
              accessibilityLabel="Bulan sebelumnya"
              disabled={!canPrev}
              onPress={() => shift(-1)}>
              <CaretLeftIcon size={20} color={Colors.text} />
            </IconButton>
            <AppText
              variant="headingSm"
              accessibilityRole="header"
              accessibilityLiveRegion="polite">
              {monthLabel(month)}
            </AppText>
            <IconButton
              size={44}
              accessibilityLabel="Bulan berikutnya"
              disabled={!canNext}
              onPress={() => shift(1)}>
              <CaretRightIcon size={20} color={Colors.text} />
            </IconButton>
          </View>

          <View>
            <View style={styles.row} importantForAccessibility="no-hide-descendants">
              {DOWS.map((d) => (
                <AppText key={d} variant="label" color="textMuted" style={styles.dow}>
                  {d}
                </AppText>
              ))}
            </View>
            {rows.map((row, r) => (
              <View key={r} style={styles.row}>
                {row.map((d, c) => {
                  if (!d) return <View key={c} style={styles.cell} />;
                  const key = toDateKey(d);
                  const future = key > todayKey;
                  const active = key === selected;
                  const isToday = key === todayKey;
                  return (
                    <Pressable
                      key={c}
                      disabled={future}
                      onPress={() => close(() => onSelect(key))}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active, disabled: future }}
                      accessibilityLabel={`${formatLongDate(d)}, ${isWeekend(d) ? 'akhir pekan' : statusLabel(records[key])}`}
                      style={({ pressed }) => [
                        styles.cell,
                        styles.day,
                        pressed && { backgroundColor: Colors.surfaceMuted },
                        active && { backgroundColor: Colors.primary },
                      ]}>
                      <AppText
                        numeric
                        weight={isToday ? 'semibold' : 'regular'}
                        color={
                          active
                            ? 'onPrimary'
                            : future
                              ? 'textFaint'
                              : isToday
                                ? 'accentText'
                                : isWeekend(d)
                                  ? 'textMuted'
                                  : 'text'
                        }>
                        {d.getDate()}
                      </AppText>
                      <StatusMark tone={toneOf(records[key])} size={5} />
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>

          <View style={styles.legend} importantForAccessibility="no-hide-descendants">
            <View style={styles.legendItem}>
              <StatusMark tone="ok" />
              <AppText variant="label" weight="regular" color="textMuted">
                Tepat waktu
              </AppText>
            </View>
            <View style={styles.legendItem}>
              <StatusMark tone="late" />
              <AppText variant="label" weight="regular" color="textMuted">
                Terlambat
              </AppText>
            </View>
          </View>

          <View style={styles.actions}>
            <Button
              label="Hari ini"
              style={styles.flex1}
              onPress={() => close(() => onSelect(todayKey))}
            />
            <Button
              label="Selesai"
              variant="primary"
              style={styles.flex16}
              onPress={() => close()}
            />
          </View>
        </>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  row: { flexDirection: 'row', gap: 4, marginBottom: 4 },
  dow: { flex: 1, textAlign: 'center', fontSize: 11, paddingBottom: Spacing.one },
  cell: { flex: 1, aspectRatio: 1, maxHeight: 48 },
  day: { borderRadius: 999, alignItems: 'center', justifyContent: 'center', gap: 3 },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.four },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actions: { flexDirection: 'row', gap: Spacing.two },
  flex1: { flex: 1 },
  flex16: { flex: 1.6 },
});
