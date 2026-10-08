import type { CameraType } from 'expo-camera';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CameraHeader, RoundButton, ShutterButton } from '@/components/absen/camera-chrome';
import { ConfirmSheet } from '@/components/absen/confirm-sheet';
import { GpsPill } from '@/components/absen/gps-pill';
import {
  SelfieCamera,
  type CapturedPhoto,
  type SelfieCameraHandle,
} from '@/components/absen/selfie-camera';
import {
  ArrowCounterClockwiseIcon,
  CameraRotateIcon,
  CheckCircleIcon,
  LightningIcon,
  LightningSlashIcon,
  XIcon,
} from '@/components/icons';
import { Button } from '@/components/ui/button';
import { AppText } from '@/components/ui/text';
import { CameraColors } from '@/constants/camera-theme';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useCurrentLocation } from '@/hooks/use-current-location';
import { useNow } from '@/hooks/use-now';
import { useTodayAttendance } from '@/hooks/use-today-attendance';
import { formatTime } from '@/lib/date';
import { createAttendance } from '@/services/attendance';

/** Layar "Absen Sekarang": kamera selfie + GPS untuk absen masuk/keluar. */
export default function AbsenScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const now = useNow();
  const today = useTodayAttendance();
  const phase = today?.phase;
  const location = useCurrentLocation(phase === 'in' || phase === 'out');

  const camera = useRef<SelfieCameraHandle>(null);
  const [facing, setFacing] = useState<CameraType>('front');
  const [flash, setFlash] = useState(false);
  const [ready, setReady] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [photo, setPhoto] = useState<CapturedPhoto | null>(null);
  const [capturedAt, setCapturedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));
  const back = facing === 'back';

  const capture = async () => {
    if (capturing || back) return;
    setCapturing(true);
    setError(null);
    setCapturedAt(new Date());
    const shot = await camera.current?.capture();
    setCapturing(false);
    if (shot) setPhoto(shot);
    else setError('Gagal mengambil foto. Coba lagi.');
  };

  const retake = () => {
    setPhoto(null);
    setError(null);
  };

  const submit = async () => {
    if (!photo || location.status !== 'ready' || (phase !== 'in' && phase !== 'out')) return;
    await createAttendance({
      type: phase,
      photoUri: photo.uri,
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy,
    });
    close();
  };

  // Sheet konfirmasi terbuka begitu foto diambil dan lokasi GPS sudah siap.
  const confirming =
    !!photo && !!capturedAt && location.status === 'ready' && (phase === 'in' || phase === 'out');

  const guide = error
    ? error
    : photo
      ? 'Foto diambil'
      : back
        ? 'Absen wajib memakai kamera depan untuk selfie'
        : 'Posisikan wajah di dalam bingkai';

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar style="light" />
      <CameraHeader
        title={phase === 'out' ? 'Absen Keluar' : 'Absen Masuk'}
        sub={`${formatTime(now)} · Jam kerja 08.00–17.00`}
        leading={
          <RoundButton label="Tutup kamera" onPress={close}>
            <XIcon size={22} color={CameraColors.ink} />
          </RoundButton>
        }
      />

      <View style={styles.finder} accessibilityLabel={back ? 'Kamera belakang' : 'Kamera depan'}>
        {!today ? (
          <ActivityIndicator color={CameraColors.ink} />
        ) : phase === 'done' ? (
          <View style={styles.complete}>
            <View style={styles.completeIcon}>
              <CheckCircleIcon size={30} weight="fill" color={Colors.positive} />
            </View>
            <AppText variant="headingSm" style={styles.completeTitle}>
              Absen hari ini sudah lengkap
            </AppText>
            <AppText variant="bodySm" style={styles.completeBody}>
              Kamu sudah absen masuk dan keluar. Sampai jumpa besok.
            </AppText>
            <Button block label="Kembali ke Beranda" onPress={close} style={styles.completeBack} />
          </View>
        ) : (
          <>
            <GpsPill location={location} waiting={!!photo} />
            <SelfieCamera
              ref={camera}
              facing={facing}
              flash={flash}
              photo={photo}
              onReadyChange={setReady}
            />
            {ready && (
              <AppText
                variant="bodySm"
                style={styles.guide}
                accessibilityLiveRegion="polite"
                accessibilityRole={error ? 'alert' : 'text'}>
                {guide}
              </AppText>
            )}
          </>
        )}
      </View>

      {phase === 'done' ? (
        <View style={{ height: insets.bottom + Spacing.eight }} />
      ) : (
        <View style={[styles.controls, { paddingBottom: insets.bottom + Spacing.eight }]}>
          {photo ? (
            <RoundButton label="Ulangi foto" onPress={retake}>
              <ArrowCounterClockwiseIcon size={22} color={CameraColors.ink} />
            </RoundButton>
          ) : (
            <RoundButton
              label="Lampu kilat layar"
              pressed={flash}
              disabled={!ready}
              onPress={() => setFlash((f) => !f)}>
              {flash ? (
                <LightningIcon size={22} weight="fill" color={CameraColors.bg} />
              ) : (
                <LightningSlashIcon size={22} color={CameraColors.ink} />
              )}
            </RoundButton>
          )}
          <ShutterButton onPress={capture} disabled={!ready || back || capturing || !!photo} />
          <RoundButton
            label={back ? 'Ganti ke kamera depan' : 'Ganti ke kamera belakang'}
            disabled={!ready || !!photo}
            onPress={() => setFacing((f) => (f === 'front' ? 'back' : 'front'))}>
            <CameraRotateIcon size={22} color={CameraColors.ink} />
          </RoundButton>
        </View>
      )}
      {confirming && (
        <ConfirmSheet
          type={phase}
          photo={photo}
          coords={location.coords}
          capturedAt={capturedAt}
          onRetake={retake}
          onSubmit={submit}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: CameraColors.bg },
  finder: {
    flex: 1,
    marginHorizontal: Spacing.two,
    borderRadius: Radius.sheet,
    overflow: 'hidden',
    backgroundColor: CameraColors.finder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guide: {
    position: 'absolute',
    bottom: Spacing.six,
    left: Spacing.six,
    right: Spacing.six,
    textAlign: 'center',
    color: CameraColors.ink,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowRadius: 6,
  },
  complete: { alignItems: 'center', gap: Spacing.three, paddingHorizontal: Spacing.six },
  completeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeTitle: { color: CameraColors.ink, textAlign: 'center' },
  completeBody: { color: 'rgba(246, 243, 238, 0.75)', textAlign: 'center', maxWidth: 300 },
  completeBack: { marginTop: Spacing.three, maxWidth: 280 },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.five,
    paddingHorizontal: Spacing.eight,
  },
});
