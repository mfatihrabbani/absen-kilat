import { useRouter } from 'expo-router';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { ProgressRing } from '@/components/beranda/progress-ring';
import { STATUS, StatusIcon } from '@/components/attendance/status';
import {
  CameraIcon,
  CheckCircleIcon,
  MapPinIcon,
  SignInIcon,
  SignOutIcon,
  UserFocusIcon,
  type Icon,
} from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { AppText } from '@/components/ui/text';
import { Colors, Fonts, Radius, Shadow, Shift, Spacing } from '@/constants/theme';
import { isLate, timeOf, workedMinutes } from '@/lib/attendance';
import { formatDuration, formatTime, minutesOf } from '@/lib/date';
import type { DayRecord } from '@/types/attendance';

const SHIFT_LEN = Shift.end - Shift.start;

/** `5.12` — jam.menit untuk isi cincin. */
const clockDuration = (mins: number) => `${Math.floor(mins / 60)}.${String(mins % 60).padStart(2, '0')}`;

type Note = { text: string; tone?: 'ok' | 'late' };

function Metric({
  icon: IconCmp,
  label,
  value,
  note,
  divider,
}: {
  icon: Icon;
  label: string;
  value: string | null;
  note: Note;
  divider?: boolean;
}) {
  return (
    <View style={[styles.metric, divider && styles.metricDivider]}>
      <View style={styles.metricLabel}>
        <IconCmp size={15} color={Colors.textMuted} />
        <AppText variant="caption" color="textMuted">
          {label}
        </AppText>
      </View>
      <AppText numeric style={styles.metricValue} color={value ? 'text' : 'textFaint'}>
        {value ?? '--.--'}
      </AppText>
      <View style={styles.metricLabel}>
        {note.tone && <StatusIcon tone={note.tone} />}
        <AppText
          variant="caption"
          color={note.tone === 'late' ? STATUS.late.textColor : 'textMuted'}
          numberOfLines={1}
          style={styles.shrink}>
          {note.text}
        </AppText>
      </View>
    </View>
  );
}

type Props = { record: DayRecord | undefined; now: Date };

/** Kartu "Absen hari ini": cincin jam kerja, jam masuk/keluar, dan tombol absen. */
export function TodayCard({ record, now }: Props) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const compact = width < 360;

  const inAt = record?.in ? timeOf(record.in) : null;
  const outAt = record?.out ? timeOf(record.out) : null;
  const late = isLate(record);
  const nowMin = minutesOf(now);
  const worked = workedMinutes(record, now);
  const progress = inAt ? Math.min(1, worked / SHIFT_LEN) : 0;
  const done = !!(inAt && outAt);

  const ringBig = inAt ? clockDuration(worked) : formatTime(now);
  const ringSmall = !inAt
    ? nowMin <= Shift.start
      ? `${formatDuration(Shift.start - nowMin)} lagi jam masuk`
      : `lewat ${formatDuration(nowMin - Shift.start)}`
    : outAt
      ? 'total kerja'
      : 'dari 9 jam kerja';
  const ringLabel = !inAt
    ? `Belum absen. Sekarang ${formatTime(now)}, jam masuk 08.00.`
    : `${outAt ? 'Total kerja' : 'Sudah bekerja'} ${formatDuration(worked)} dari 9 jam, ${Math.round(progress * 100)} persen.`;

  const inNote: Note = inAt
    ? late
      ? { text: STATUS.late.label, tone: 'late' }
      : { text: STATUS.ok.label, tone: 'ok' }
    : { text: 'Batas 08.00' };
  const outNote: Note = outAt
    ? { text: 'Tercatat', tone: 'ok' }
    : inAt
      ? { text: nowMin < Shift.end ? `Sisa ${formatDuration(Shift.end - nowMin)}` : 'Sudah bisa pulang' }
      : { text: 'Jam pulang 17.00' };

  const ringSize = compact ? 112 : 128;

  return (
    <Card style={styles.card}>
      <View style={styles.head}>
        <AppText weight="semibold" style={styles.label} accessibilityRole="header">
          Absen hari ini
        </AppText>
        <Chip label={done ? 'Selesai' : inAt ? 'Sedang bekerja' : 'Belum absen'} />
      </View>

      <View style={[styles.body, compact && { gap: Spacing.three }]}>
        <ProgressRing
          size={ringSize}
          progress={progress}
          idle={!inAt}
          accessible
          accessibilityRole="image"
          accessibilityLabel={ringLabel}>
          <AppText numeric weight="semibold" style={[styles.ringBig, compact && { fontSize: 24 }]}>
            {ringBig}
          </AppText>
          <AppText variant="label" color="textMuted" weight="regular" style={styles.ringSmall}>
            {ringSmall}
          </AppText>
        </ProgressRing>

        <View style={styles.metrics}>
          <Metric icon={SignInIcon} label="Masuk" value={inAt && formatTime(inAt)} note={inNote} />
          <Metric icon={SignOutIcon} label="Keluar" value={outAt && formatTime(outAt)} note={outNote} divider />
        </View>
      </View>

      {done ? (
        <View style={styles.done}>
          <CheckCircleIcon size={20} weight="fill" color={Colors.positive} />
          <AppText weight="medium" style={styles.doneText}>
            Absen hari ini lengkap. Sampai jumpa besok.
          </AppText>
        </View>
      ) : (
        <>
          <Button
            block
            variant="primary"
            icon={inAt ? SignOutIcon : CameraIcon}
            label={inAt ? 'Absen Keluar' : 'Absen Masuk'}
            style={styles.cta}
            onPress={() => router.push({ pathname: '/absen', params: { type: inAt ? 'out' : 'in' } })}
          />
          <View style={styles.hint} accessible accessibilityLabel="Selfie dan lokasi GPS otomatis">
            <UserFocusIcon size={15} color={Colors.textMuted} />
            <AppText variant="caption" color="textMuted">
              Selfie
            </AppText>
            <AppText variant="caption" color="textMuted">
              ·
            </AppText>
            <MapPinIcon size={15} color={Colors.textMuted} />
            <AppText variant="caption" color="textMuted">
              Lokasi GPS otomatis
            </AppText>
          </View>
        </>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingTop: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
    gap: Spacing.four,
    ...Shadow.md,
  },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.three },
  label: { fontSize: 15, lineHeight: 20, letterSpacing: -0.2 },
  body: { flexDirection: 'row', alignItems: 'center', gap: Spacing.five },
  ringBig: { fontSize: 28, lineHeight: 32, letterSpacing: -1 },
  ringSmall: { textAlign: 'center', maxWidth: 84 },
  metrics: { flex: 1, minWidth: 0, gap: Spacing.three },
  metric: { gap: 2, minWidth: 0 },
  metricDivider: { paddingTop: Spacing.three, borderTopWidth: 1, borderTopColor: Colors.border },
  metricLabel: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  metricValue: { fontFamily: Fonts.semibold, fontSize: 24, lineHeight: 30, letterSpacing: -0.8 },
  shrink: { flexShrink: 1 },
  cta: { minHeight: 54 },
  done: {
    minHeight: 54,
    borderRadius: Radius.control,
    backgroundColor: Colors.surfaceSubtle,
    paddingHorizontal: Spacing.four,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  doneText: { fontSize: 15, flexShrink: 1, textAlign: 'center' },
  hint: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
});
