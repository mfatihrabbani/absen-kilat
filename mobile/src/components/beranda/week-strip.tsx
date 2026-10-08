import { Pressable, StyleSheet, View } from 'react-native';

import { ProgressRing } from '@/components/beranda/progress-ring';
import { BriefcaseIcon, CheckIcon, ClockCountdownIcon, MinusIcon } from '@/components/icons';
import { Card } from '@/components/ui/card';
import { AppText } from '@/components/ui/text';
import { Colors, Radius, Shift, Spacing } from '@/constants/theme';
import { isLate, workedMinutes } from '@/lib/attendance';
import { addDays, dayShort, formatLongDate, isWeekend, mondayOf, toDateKey } from '@/lib/date';
import type { DayRecords } from '@/types/attendance';

type DayStatus = 'ok' | 'late' | 'missed' | 'weekend' | 'today' | 'working' | 'future';

const LABEL: Record<DayStatus, string> = {
  ok: 'tepat waktu',
  late: 'terlambat',
  missed: 'tidak ada catatan',
  weekend: 'akhir pekan',
  today: 'hari ini, belum absen',
  working: 'sedang bekerja',
  future: 'belum berjalan',
};

export type WeekDay = { date: Date; key: string; status: DayStatus; progress: number };

/** Hitung status 7 hari (Senin–Minggu) di minggu `now` beserta ringkasannya. */
export function buildWeek(records: DayRecords, now: Date) {
  const monday = mondayOf(now);
  const todayKey = toDateKey(now);
  let present = 0;
  let late = 0;
  let workdays = 0;

  const days: WeekDay[] = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(monday, i);
    const key = toDateKey(date);
    const rec = records[key];
    const isToday = key === todayKey;
    const future = key > todayKey;
    let status: DayStatus = 'future';
    let progress = 0;
    if (isWeekend(date)) status = 'weekend';
    else if (isToday && rec?.in && !rec.out) {
      status = 'working';
      progress = Math.min(1, workedMinutes(rec, now) / (Shift.end - Shift.start));
    } else if (rec?.in) status = isLate(rec) ? 'late' : 'ok';
    else if (isToday) status = 'today';
    else if (!future) status = 'missed';

    if (!isWeekend(date) && !future) workdays += 1;
    if (rec?.in) {
      present += 1;
      if (isLate(rec)) late += 1;
    }
    return { date, key, status, progress };
  });

  const summary = `${present} dari ${Math.max(workdays, present)} hari${late ? ` · ${late} terlambat` : ''}`;
  return { days, summary };
}

function Dot({ status, progress }: { status: DayStatus; progress: number }) {
  switch (status) {
    case 'ok':
      return (
        <View style={[styles.dot, styles.dotOk]}>
          <CheckIcon size={16} weight="bold" color={Colors.onPrimary} />
        </View>
      );
    case 'late':
      return (
        <View style={[styles.dot, styles.dotLate]}>
          <ClockCountdownIcon size={16} weight="bold" color={Colors.warningText} />
        </View>
      );
    case 'missed':
      return (
        <View style={[styles.dot, styles.dotMissed]}>
          <MinusIcon size={16} weight="bold" color={Colors.textFaint} />
        </View>
      );
    case 'weekend':
      return (
        <View style={styles.dot}>
          <View style={styles.weekendPip} />
        </View>
      );
    case 'today':
      return <View style={[styles.dot, styles.dotToday]} />;
    case 'working':
      return (
        <ProgressRing size={32} progress={progress} strokeWidth={14}>
          <BriefcaseIcon size={16} weight="fill" color={Colors.text} />
        </ProgressRing>
      );
    default:
      return <View style={[styles.dot, styles.dotFuture]} />;
  }
}

type Props = {
  days: WeekDay[];
  todayKey: string;
  summary: string;
  onSelect: (key: string) => void;
};

/** Strip 7 hari "Minggu ini": tiap hari bisa diketuk untuk membuka riwayat tanggal itu. */
export function WeekStrip({ days, todayKey, summary, onSelect }: Props) {
  return (
    <Card
      style={styles.week}
      accessibilityRole="none"
      accessibilityLabel={`Minggu ini: hadir ${summary}`}>
      {days.map((d) => {
        const isToday = d.key === todayKey;
        return (
          <Pressable
            key={d.key}
            accessibilityRole="button"
            accessibilityLabel={`${formatLongDate(d.date)}, ${LABEL[d.status]}`}
            onPress={() => onSelect(d.key)}
            style={({ pressed }) => [styles.day, pressed && styles.dayPressed]}>
            <AppText variant="label" color={isToday ? 'accentText' : 'textMuted'}>
              {dayShort(d.date)}
            </AppText>
            <Dot status={d.status} progress={d.progress} />
            <AppText
              variant="caption"
              numeric
              weight={isToday ? 'semibold' : 'medium'}
              color={isToday ? 'text' : 'textMuted'}
              style={styles.num}>
              {d.date.getDate()}
            </AppText>
          </Pressable>
        );
      })}
    </Card>
  );
}

const styles = StyleSheet.create({
  week: {
    flexDirection: 'row',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.one,
  },
  day: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: Spacing.one,
    borderRadius: Radius.compact,
  },
  dayPressed: { backgroundColor: Colors.surfaceSubtle },
  num: { lineHeight: 16 },
  dot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotOk: { backgroundColor: Colors.primary },
  dotLate: { borderWidth: 2, borderColor: Colors.warning, backgroundColor: Colors.surface },
  dotMissed: { borderWidth: 2, borderColor: Colors.border, backgroundColor: Colors.surfaceSubtle },
  dotToday: { borderWidth: 2, borderColor: Colors.accent },
  dotFuture: { borderWidth: 2, borderStyle: 'dashed', borderColor: Colors.borderStrong },
  weekendPip: { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.borderStrong },
});
