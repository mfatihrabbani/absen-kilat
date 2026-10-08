import { ActivityIndicator, Linking, Pressable, StyleSheet, View } from 'react-native';

import { MapPinIcon, WarningCircleIcon } from '@/components/icons';
import { AppText } from '@/components/ui/text';
import { CameraColors } from '@/constants/camera-theme';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { formatCoords, type LocationState } from '@/hooks/use-current-location';

type Props = { location: LocationState & { retry: () => void }; waiting?: boolean };

/** Pil status GPS di atas jendela kamera: mencari, ditemukan (+koordinat), atau gagal. */
export function GpsPill({ location, waiting }: Props) {
  let icon = <ActivityIndicator size="small" color={CameraColors.ink} style={styles.spinner} />;
  let title = waiting ? 'Menunggu lokasi GPS…' : 'Mencari lokasi GPS…';
  let detail: string | null = null;
  let onPress: (() => void) | undefined;

  if (location.status === 'ready') {
    icon = <MapPinIcon size={16} weight="fill" color={Colors.accent} />;
    const acc = location.coords.accuracy;
    title = `Lokasi ditemukan${acc != null ? ` · ±${Math.round(acc)} m` : ''}`;
    detail = formatCoords(location.coords);
  } else if (location.status === 'searching' && location.coords) {
    detail = `${formatCoords(location.coords)} · ±${Math.round(location.coords.accuracy ?? 0)} m`;
  } else if (location.status === 'denied') {
    icon = <WarningCircleIcon size={16} weight="fill" color={Colors.accent} />;
    title = 'Izin lokasi ditolak';
    detail = location.canAskAgain ? 'Ketuk untuk mengizinkan' : 'Ketuk untuk buka Pengaturan';
    onPress = location.canAskAgain ? location.retry : () => Linking.openSettings();
  } else if (location.status === 'error') {
    icon = <WarningCircleIcon size={16} weight="fill" color={Colors.accent} />;
    title = 'Lokasi tidak tersedia';
    detail = 'Ketuk untuk coba lagi';
    onPress = location.retry;
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityLiveRegion="polite"
      accessibilityLabel={[title, detail].filter(Boolean).join(', ')}
      style={styles.pill}>
      <View style={styles.icon}>{icon}</View>
      <View>
        <AppText variant="caption" weight="medium" style={styles.title}>
          {title}
        </AppText>
        {detail && (
          <AppText variant="label" weight="regular" numeric style={styles.detail}>
            {detail}
          </AppText>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    position: 'absolute',
    top: Spacing.four,
    alignSelf: 'center',
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: 6,
    paddingLeft: Spacing.two,
    paddingRight: Spacing.three,
    borderRadius: Radius.control,
    backgroundColor: CameraColors.pill,
  },
  icon: { width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  spinner: { transform: [{ scale: 0.7 }] },
  title: { color: CameraColors.ink, letterSpacing: -0.1 },
  detail: { color: CameraColors.inkMuted },
});
