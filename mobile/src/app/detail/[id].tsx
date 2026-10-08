import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { MapPreview } from '@/components/attendance/map-preview';
import { CalendarXIcon, UserIcon, WarningCircleIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StatusChip } from '@/components/attendance/status';
import { Chip } from '@/components/ui/chip';
import { EmptyState } from '@/components/ui/empty-state';
import { ListGroup, ListRow } from '@/components/ui/list';
import { PushedScreen } from '@/components/ui/pushed-screen';
import { AppText } from '@/components/ui/text';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useAttendanceDetail } from '@/hooks/use-attendance-detail';
import { lateMinutes, timeOf } from '@/lib/attendance';
import { formatLongDate, formatTime, formatTimeWithSeconds, fromDateKey } from '@/lib/date';
import type { AttendanceType } from '@/types/attendance';

const TYPE_TITLE: Record<AttendanceType, string> = { in: 'Absen Masuk', out: 'Absen Keluar' };

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <ListRow>
      <View style={styles.infoMain}>
        <AppText variant="bodySm" color="textMuted">
          {label}
        </AppText>
        {typeof children === 'string' ? (
          <AppText numeric style={styles.infoValue}>
            {children}
          </AppText>
        ) : (
          children
        )}
      </View>
    </ListRow>
  );
}

/** Detail satu absen: foto selfie, peta lokasi, waktu lengkap, status, koordinat, dan akurasi GPS. */
export default function DetailAbsenScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const state = useAttendanceDetail(Number(id));
  const [picked, setPicked] = useState<AttendanceType | null>(null);

  const back = { label: 'Riwayat', fallback: '/riwayat' as const };

  if (state.status !== 'ready') {
    return (
      <PushedScreen title="Detail Absen" back={back}>
        {state.status === 'loading' ? (
          <ActivityIndicator style={styles.loader} color={Colors.accent} />
        ) : (
          <Card>
            <EmptyState
              icon={state.status === 'missing' ? CalendarXIcon : WarningCircleIcon}
              title={state.status === 'missing' ? 'Catatan tidak ditemukan' : 'Gagal memuat'}
              body={
                state.status === 'missing'
                  ? 'Pilih entri absen dari halaman Riwayat.'
                  : state.message
              }
              action={<Button label="Buka Riwayat" onPress={() => router.navigate('/riwayat')} />}
            />
          </Card>
        )}
      </PushedScreen>
    );
  }

  const { day, dateKey } = state;
  const type = picked ?? state.attendance.type;
  const item = day[type] ?? state.attendance;
  const at = timeOf(item);
  const late = item.status === 'late';
  const coords =
    item.latitude != null && item.longitude != null
      ? `${item.latitude.toFixed(5)}, ${item.longitude.toFixed(5)}`
      : 'Tidak tersedia';

  return (
    <PushedScreen title={TYPE_TITLE[item.type]} back={back}>
      <View style={styles.title}>
        <AppText variant="bodySm" color="textMuted">
          {formatLongDate(fromDateKey(dateKey))}
        </AppText>
        <AppText variant="editorial" accessibilityRole="header" style={styles.heading}>
          {TYPE_TITLE[item.type]}
        </AppText>
      </View>

      <View style={styles.segment} accessibilityRole="radiogroup" accessibilityLabel="Jenis absen">
        {(['in', 'out'] as const).map((t) => {
          const active = t === item.type;
          const available = !!day[t];
          return (
            <ButtonSeg
              key={t}
              label={t === 'in' ? 'Masuk' : 'Keluar'}
              active={active}
              disabled={!available}
              onPress={() => setPicked(t)}
            />
          );
        })}
      </View>

      <View style={styles.proof} accessibilityLabel="Bukti kehadiran">
        <View
          style={styles.photo}
          accessible
          accessibilityRole="image"
          accessibilityLabel={`Foto selfie saat ${TYPE_TITLE[item.type].toLowerCase()} pukul ${formatTime(at)}`}>
          <UserIcon size={72} color={Colors.textMuted} style={styles.photoFallback} />
          <Image
            source={item.photoUrl}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={200}
          />
          <View style={styles.photoTag}>
            <Chip label={`Selfie · ${formatTime(at)}`} />
          </View>
        </View>
        <MapPreview latitude={item.latitude} longitude={item.longitude} style={styles.map} />
      </View>

      <ListGroup>
        <InfoRow label="Waktu">{`${formatTimeWithSeconds(at)} WIB`}</InfoRow>
        {item.type === 'in' ? (
          <InfoRow label="Status">
            <View style={styles.status}>
              <StatusChip late={late} />
              <AppText variant="bodySm" color="textMuted">
                {late ? `Lewat ${lateMinutes(item)} menit dari batas 08.00` : 'Batas masuk 08.00'}
              </AppText>
            </View>
          </InfoRow>
        ) : null}
        <InfoRow label="Koordinat">{coords}</InfoRow>
        <InfoRow label="Akurasi GPS">
          {item.accuracy != null ? `±${Math.round(item.accuracy)} m` : '–'}
        </InfoRow>
      </ListGroup>
    </PushedScreen>
  );
}

function ButtonSeg({
  label,
  active,
  disabled,
  onPress,
}: {
  label: string;
  active: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="radio"
      accessibilityState={{ selected: active, disabled }}
      style={[styles.segItem, active && styles.segActive, disabled && styles.segDisabled]}>
      <AppText variant="bodySm" weight="medium" color={active ? 'text' : 'textMuted'}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  loader: { marginTop: Spacing.sixteen },
  title: { paddingTop: Spacing.one },
  heading: { marginTop: 2 },
  segment: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surfaceMuted,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  segItem: {
    flex: 1,
    minHeight: 38,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segDisabled: { opacity: 0.45 },
  segActive: {
    backgroundColor: Colors.surface,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.10)',
  },
  proof: { flexDirection: 'row', gap: Spacing.three },
  photo: {
    flex: 1,
    aspectRatio: 3 / 4,
    borderRadius: Radius.image,
    backgroundColor: Colors.surfaceMuted,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoFallback: { position: 'absolute' },
  photoTag: { position: 'absolute', left: Spacing.two, bottom: Spacing.two },
  map: {
    flex: 1,
    borderRadius: Radius.image,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoMain: { flex: 1, minWidth: 0 },
  infoValue: { lineHeight: 22 },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flexWrap: 'wrap',
    marginTop: 2,
  },
});
