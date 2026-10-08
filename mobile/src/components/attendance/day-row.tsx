import { StyleSheet, View } from 'react-native';

import { CheckCircleIcon, ClockCountdownIcon } from '@/components/icons';
import { ListRow } from '@/components/ui/list';
import { AppText } from '@/components/ui/text';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { isLate, lateMinutes, statusLabel, timeOf, workedMinutes } from '@/lib/attendance';
import { dayShort, formatDuration, formatLongDate, formatTime, fromDateKey } from '@/lib/date';
import type { DayRecord } from '@/types/attendance';

/** Kotak tanggal kecil: singkatan hari (oranye) di atas angka tanggal. */
export function CalendarChip({ date }: { date: Date }) {
  return (
    <View style={styles.cal}>
      <AppText style={styles.calDow}>{dayShort(date)}</AppText>
      <AppText style={styles.calNum} numeric>
        {date.getDate()}
      </AppText>
    </View>
  );
}

type Props = {
  dateKey: string;
  record: DayRecord & { in: NonNullable<DayRecord['in']> };
  onPress?: () => void;
};

/** Baris riwayat satu hari: tanggal, jam masuk–keluar, status, dan lama kerja. */
export function DayRow({ dateKey, record, onPress }: Props) {
  const date = fromDateKey(dateKey);
  const late = isLate(record);
  const inTime = formatTime(timeOf(record.in));
  const outTime = record.out ? formatTime(timeOf(record.out)) : null;
  const worked = workedMinutes(record);

  const label =
    `${formatLongDate(date)}, masuk ${inTime}` +
    (outTime ? `, keluar ${outTime}, ${formatDuration(worked)}` : ', belum absen keluar') +
    `, ${statusLabel(record)}`;

  return (
    <ListRow chevron onPress={onPress} accessibilityLabel={label}>
      <CalendarChip date={date} />
      <View style={styles.main}>
        <AppText numeric numberOfLines={1} style={styles.title}>
          {inTime} – {outTime ?? 'sekarang'}
        </AppText>
        <View style={styles.sub}>
          {late ? (
            <ClockCountdownIcon size={14} weight="fill" color={Colors.warning} />
          ) : (
            <CheckCircleIcon size={14} weight="fill" color={Colors.positive} />
          )}
          <AppText variant="bodySm" color="textMuted" numberOfLines={1} style={styles.subText}>
            {late ? `Terlambat ${lateMinutes(record.in)} menit` : 'Tepat waktu'}
          </AppText>
        </View>
      </View>
      <AppText color="textMuted" numeric style={styles.dur}>
        {outTime ? formatDuration(worked) : 'Berjalan'}
      </AppText>
    </ListRow>
  );
}

const styles = StyleSheet.create({
  cal: {
    width: 40,
    height: 44,
    borderRadius: Radius.compact,
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calDow: {
    fontFamily: Fonts.semibold,
    fontSize: 10,
    lineHeight: 12,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
    color: Colors.accentText,
  },
  calNum: {
    fontFamily: Fonts.semibold,
    fontSize: 18,
    lineHeight: 21,
    letterSpacing: -0.4,
    color: Colors.text,
  },
  main: { flex: 1, minWidth: 0 },
  title: { lineHeight: 22 },
  sub: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  subText: { flexShrink: 1 },
  dur: { fontSize: 15 },
});
