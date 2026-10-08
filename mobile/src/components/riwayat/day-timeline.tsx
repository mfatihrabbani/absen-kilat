import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { CalendarXIcon, CameraIcon, CaretRightIcon, ClockIcon, CoffeeIcon, SignInIcon, SignOutIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StatusChip } from '@/components/ui/chip';
import { EmptyState } from '@/components/ui/empty-state';
import { ListRow } from '@/components/ui/list';
import { AppText } from '@/components/ui/text';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import { isLate, timeOf, workedMinutes } from '@/lib/attendance';
import { formatDuration, formatTime, fromDateKey, isWeekend, toDateKey } from '@/lib/date';
import type { Attendance, AttendanceType, DayRecord } from '@/types/attendance';

function TimelineRow({
  type,
  item,
  late,
  pendingText,
}: {
  type: AttendanceType;
  item: Attendance | undefined;
  late?: boolean;
  pendingText?: string;
}) {
  const router = useRouter();
  const IconCmp = type === 'in' ? SignInIcon : SignOutIcon;
  const title = type === 'in' ? 'Absen masuk' : 'Absen keluar';
  const time = item ? formatTime(timeOf(item)) : null;

  return (
    <ListRow
      style={styles.row}
      onPress={item ? () => router.push(`/detail/${item.id}`) : undefined}
      accessibilityLabel={
        item
          ? `${title} ${time}${type === 'in' ? `, ${late ? 'terlambat' : 'tepat waktu'}` : ''}. Buka detail`
          : `${title}, ${pendingText}`
      }>
      <View style={[styles.dot, !item && styles.dotPending]}>
        <IconCmp size={18} weight="bold" color={item ? Colors.onPrimary : Colors.textFaint} />
      </View>
      <View style={styles.main}>
        <AppText style={styles.title}>{title}</AppText>
        {type === 'in' && item ? (
          <StatusChip late={!!late} />
        ) : (
          <AppText variant="bodySm" color="textMuted">
            {item ? (item.accuracy != null ? `Lokasi ±${Math.round(item.accuracy)} m` : 'Lokasi tercatat') : pendingText}
          </AppText>
        )}
      </View>
      <AppText numeric style={styles.time} color={item ? 'text' : 'textFaint'}>
        {time ?? '--.--'}
      </AppText>
      {item ? <CaretRightIcon size={16} weight="bold" color={Colors.textFaint} /> : <View style={styles.chevSpace} />}
    </ListRow>
  );
}

type Props = { dateKey: string; record: DayRecord | undefined; now: Date };

/** Linimasa satu hari: absen masuk → durasi kerja → absen keluar, atau keadaan kosong. */
export function DayTimeline({ dateKey, record, now }: Props) {
  const router = useRouter();
  const date = fromDateKey(dateKey);
  const isToday = dateKey === toDateKey(now);

  if (record?.in) {
    const worked = workedMinutes(record, now);
    return (
      <Card style={styles.card}>
        <TimelineRow type="in" item={record.in} late={isLate(record)} />
        <View style={styles.gap}>
          <View style={styles.lineCol}>
            {record.out ? (
              <View style={[styles.line, { backgroundColor: Colors.accent }]} />
            ) : (
              <View style={[styles.line, styles.lineDashed]} />
            )}
          </View>
          <AppText variant="caption" color="textMuted">
            <AppText variant="caption" weight="semibold">
              {formatDuration(worked)}
            </AppText>
            {record.out ? ' jam kerja' : ' sejauh ini'}
          </AppText>
        </View>
        <TimelineRow type="out" item={record.out} pendingText={isToday ? 'Belum absen keluar' : 'Tidak tercatat'} />
      </Card>
    );
  }

  const weekend = isWeekend(date);
  return (
    <Card>
      <EmptyState
        icon={weekend ? CoffeeIcon : isToday ? ClockIcon : CalendarXIcon}
        title={weekend ? 'Akhir pekan' : isToday ? 'Belum absen hari ini' : 'Tidak ada catatan'}
        body={
          weekend
            ? 'Tidak ada jadwal kerja pada tanggal ini.'
            : isToday
              ? 'Absen masuk sebelum 08.00 agar tercatat tepat waktu.'
              : 'Tidak ada absen masuk atau keluar pada tanggal ini.'
        }
        action={
          isToday && !weekend ? (
            <Button
              variant="primary"
              icon={CameraIcon}
              label="Absen sekarang"
              onPress={() => router.push({ pathname: '/absen', params: { type: 'in' } })}
            />
          ) : undefined
        }
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { paddingVertical: Spacing.one, overflow: 'hidden' },
  row: { paddingLeft: Spacing.four, paddingRight: Spacing.three },
  dot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotPending: {
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.borderStrong,
  },
  main: { flex: 1, minWidth: 0, gap: 2 },
  title: { lineHeight: 22 },
  time: { fontFamily: Fonts.semibold, fontSize: 22, lineHeight: 28, letterSpacing: -0.6 },
  chevSpace: { width: 16 },
  gap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    minHeight: 28,
  },
  lineCol: { width: 36, alignItems: 'center', alignSelf: 'stretch' },
  line: { width: 2, flex: 1, minHeight: 28 },
  lineDashed: {
    width: 0,
    borderLeftWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.borderStrong,
  },
});
