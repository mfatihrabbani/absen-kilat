import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { CameraColors } from '@/constants/camera-theme';
import { Radius, Spacing } from '@/constants/theme';

/** Tombol bulat 44px transparan di layar kamera (`.p-absen__round`). */
export function RoundButton({
  label,
  onPress,
  pressed: on,
  disabled,
  children,
}: {
  label: string;
  onPress: () => void;
  /** Keadaan toggle aktif (mis. lampu kilat menyala). */
  pressed?: boolean;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled, checked: on }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.round,
        on && { backgroundColor: CameraColors.ink },
        pressed && { transform: [{ scale: 0.97 }] },
        disabled && { opacity: 0.4 },
      ]}>
      {children}
    </Pressable>
  );
}

/** Tombol rana 78px: cincin krem dengan isi bulat yang mengecil saat ditekan. */
export function ShutterButton({ onPress, disabled }: { onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Ambil foto selfie"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.shutter, disabled && { opacity: 0.4 }]}>
      {({ pressed }) => (
        <View style={[styles.shutterFill, pressed && { transform: [{ scale: 0.9 }] }]} />
      )}
    </Pressable>
  );
}

/** Kepala layar kamera: tombol tutup, judul, dan sub-judul jam. */
export function CameraHeader({
  title,
  sub,
  leading,
}: {
  title: string;
  sub: string;
  leading: ReactNode;
}) {
  return (
    <View style={styles.top}>
      <View style={styles.side}>{leading}</View>
      <View style={styles.heading}>
        <AppText variant="navTitle" style={{ color: CameraColors.ink }} accessibilityRole="header">
          {title}
        </AppText>
        <AppText variant="label" weight="regular" numeric style={{ color: CameraColors.inkMuted }}>
          {sub}
        </AppText>
      </View>
      <View style={styles.side} />
    </View>
  );
}

const styles = StyleSheet.create({
  round: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    backgroundColor: CameraColors.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutter: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 4,
    borderColor: CameraColors.ink,
    padding: 4,
  },
  shutterFill: { flex: 1, borderRadius: 999, backgroundColor: CameraColors.ink },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingTop: Spacing.one,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
  },
  side: { width: 44 },
  heading: { flex: 1, alignItems: 'center' },
});
