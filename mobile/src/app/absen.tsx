import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Ellipse } from 'react-native-svg';

import { CameraHeader, RoundButton, ShutterButton } from '@/components/absen/camera-chrome';
import {
  CameraRotateIcon,
  CheckCircleIcon,
  LightningSlashIcon,
  UserIcon,
  XIcon,
} from '@/components/icons';
import { Button } from '@/components/ui/button';
import { AppText } from '@/components/ui/text';
import { CameraColors } from '@/constants/camera-theme';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useNow } from '@/hooks/use-now';
import { useTodayAttendance } from '@/hooks/use-today-attendance';
import { formatTime } from '@/lib/date';

/** Layar "Absen Sekarang": kamera selfie + GPS untuk absen masuk/keluar. */
export default function AbsenScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const now = useNow();
  const today = useTodayAttendance();
  const phase = today?.phase;

  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

  return (
    <View style={[styles.root, { paddingTop: insets.top }]} accessibilityLabel="Kamera Absen">
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

      <View style={styles.finder}>
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
            <View style={styles.face} importantForAccessibility="no-hide-descendants">
              <UserIcon
                size={230}
                weight="fill"
                color={CameraColors.silhouette}
                style={styles.silhouette}
              />
              <Svg style={StyleSheet.absoluteFill} viewBox="0 0 230 300">
                <Ellipse
                  cx={115}
                  cy={150}
                  rx={114}
                  ry={149}
                  fill="none"
                  stroke={CameraColors.inkMuted}
                  strokeWidth={2}
                  strokeDasharray="6 5"
                />
              </Svg>
            </View>
            <AppText variant="bodySm" style={styles.guide}>
              Posisikan wajah di dalam bingkai
            </AppText>
          </>
        )}
      </View>

      {phase === 'done' ? (
        <View style={{ height: insets.bottom + Spacing.eight }} />
      ) : (
        <View style={[styles.controls, { paddingBottom: insets.bottom + Spacing.eight }]}>
          <RoundButton label="Lampu kilat layar" onPress={() => {}} disabled>
            <LightningSlashIcon size={22} color={CameraColors.ink} />
          </RoundButton>
          <ShutterButton onPress={() => {}} disabled />
          <RoundButton label="Ganti ke kamera belakang" onPress={() => {}} disabled>
            <CameraRotateIcon size={22} color={CameraColors.ink} />
          </RoundButton>
        </View>
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
  face: { width: 230, height: 300, alignItems: 'center', justifyContent: 'center' },
  silhouette: { transform: [{ translateY: 28 }] },
  guide: {
    marginTop: Spacing.four,
    color: CameraColors.inkSoft,
    textAlign: 'center',
    paddingHorizontal: Spacing.six,
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
