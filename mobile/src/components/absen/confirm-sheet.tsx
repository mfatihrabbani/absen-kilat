import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import type { CapturedPhoto } from '@/components/absen/selfie-camera';
import { MapPreview } from '@/components/attendance/map-preview';
import { StatusChip } from '@/components/attendance/status';
import { ArrowCounterClockwiseIcon, PaperPlaneTiltIcon, WarningCircleIcon } from '@/components/icons';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { AppText } from '@/components/ui/text';
import { Colors, Radius, Shift, Spacing } from '@/constants/theme';
import { formatCoords, type Coords } from '@/hooks/use-current-location';
import { formatTime, minutesOf } from '@/lib/date';
import type { AttendanceType } from '@/types/attendance';

type Props = {
  type: AttendanceType;
  photo: CapturedPhoto;
  coords: Coords;
  capturedAt: Date;
  /** Sheet ditutup tanpa mengirim (seret/latar/Ulangi) — kembali ke kamera. */
  onRetake: () => void;
  /** Kirim absen; lempar error untuk menampilkan pesan gagal. */
  onSubmit: () => Promise<void>;
};

/** Bottom sheet konfirmasi: foto + peta singkat lokasi + waktu & status, lalu Ulangi atau Kirim. */
export function ConfirmSheet({ type, photo, coords, capturedAt, onRetake, onSubmit }: Props) {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const late = type === 'in' && minutesOf(capturedAt) > Shift.start;
  const title = type === 'in' ? 'Konfirmasi Absen Masuk' : 'Konfirmasi Absen Keluar';

  return (
    <BottomSheet visible onClose={onRetake} accessibilityLabel={title} dismissible={!sending}>
      {(close) => (
        <>
          <View>
            <AppText variant="headingSm" accessibilityRole="header">
              {title}
            </AppText>
            <AppText variant="bodySm" color="textMuted" style={styles.sub}>
              Periksa foto dan lokasi sebelum dikirim.
            </AppText>
          </View>

          <View style={styles.proof}>
            <View
              style={styles.photo}
              accessible
              accessibilityRole="image"
              accessibilityLabel="Foto selfie yang baru diambil">
              <Image source={photo.uri} style={StyleSheet.absoluteFill} contentFit="cover" />
              <View style={styles.photoTag}>
                <Chip label="Selfie" />
              </View>
            </View>
            <View style={styles.mapCard}>
              <MapPreview latitude={coords.latitude} longitude={coords.longitude} style={styles.map} />
              <View style={styles.coords}>
                <AppText variant="label" numeric>
                  {formatCoords(coords)}
                </AppText>
                <AppText variant="label" weight="regular" color="textMuted">
                  {coords.accuracy != null
                    ? `Akurasi ±${Math.round(coords.accuracy)} m`
                    : 'Akurasi tidak diketahui'}
                </AppText>
              </View>
            </View>
          </View>

          <View style={styles.meta}>
            <AppText variant="bodySm" color="textMuted">
              Waktu absen
            </AppText>
            <View style={styles.metaValue}>
              <AppText numeric weight="medium" style={styles.time}>
                {formatTime(capturedAt)}
              </AppText>
              {type === 'in' && <StatusChip late={late} />}
            </View>
          </View>

          {error && (
            <View style={styles.alert} accessibilityRole="alert">
              <WarningCircleIcon size={20} weight="fill" color={Colors.danger} />
              <AppText variant="bodySm" style={styles.alertText}>
                {error}
              </AppText>
            </View>
          )}

          <View style={styles.actions}>
            <Button
              label="Ulangi"
              icon={ArrowCounterClockwiseIcon}
              disabled={sending}
              style={styles.flex1}
              onPress={() => close()}
            />
            <Button
              label="Kirim"
              variant="primary"
              icon={PaperPlaneTiltIcon}
              busy={sending}
              busyLabel="Mengirim…"
              style={styles.flex16}
              onPress={async () => {
                setSending(true);
                setError(null);
                try {
                  await onSubmit();
                } catch (e) {
                  setError(e instanceof Error ? e.message : 'Gagal mengirim absen. Coba lagi.');
                  setSending(false);
                }
              }}
            />
          </View>
        </>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sub: { marginTop: Spacing.one },
  proof: { flexDirection: 'row', gap: Spacing.three },
  photo: {
    width: 108,
    aspectRatio: 3 / 4,
    borderRadius: Radius.image,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceMuted,
  },
  photoTag: { position: 'absolute', left: Spacing.two, bottom: Spacing.two },
  mapCard: {
    flex: 1,
    minWidth: 0,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.image,
    overflow: 'hidden',
  },
  map: { flex: 1, minHeight: 80 },
  coords: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    minHeight: 52,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.compact,
  },
  metaValue: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  time: { fontSize: 19 },
  alert: {
    flexDirection: 'row',
    gap: Spacing.three,
    alignItems: 'flex-start',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: Radius.compact,
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  alertText: { flex: 1 },
  actions: { flexDirection: 'row', gap: Spacing.two },
  flex1: { flex: 1 },
  flex16: { flex: 1.6 },
});
