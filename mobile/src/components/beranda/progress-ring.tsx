import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { Colors } from '@/constants/theme';

type Props = Pick<ViewProps, 'accessible' | 'accessibilityRole' | 'accessibilityLabel'> & {
  size: number;
  /** 0..1 */
  progress: number;
  strokeWidth?: number;
  trackColor?: string;
  color?: string;
  /** Sembunyikan busur progres (mis. belum absen). */
  idle?: boolean;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** Cincin progres melingkar mulai dari arah jam 12, dengan isi di tengah. */
export function ProgressRing({
  size,
  progress,
  strokeWidth = 12,
  trackColor = Colors.surfaceMuted,
  color = Colors.accent,
  idle,
  children,
  style,
  ...a11y
}: Props) {
  // Ukuran viewBox 120 seperti desain; jari-jari menyesuaikan tebal garis.
  const r = 60 - strokeWidth / 2 - 2;
  const c = 2 * Math.PI * r;
  const p = Math.min(1, Math.max(0, progress));

  return (
    <View style={[{ width: size, height: size }, style]} {...a11y}>
      <Svg width={size} height={size} viewBox="0 0 120 120" style={styles.svg}>
        <Circle cx={60} cy={60} r={r} stroke={trackColor} strokeWidth={strokeWidth} fill="none" />
        {!idle && p > 0 && (
          <Circle
            cx={60}
            cy={60}
            r={r}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${c} ${c}`}
            strokeDashoffset={c * (1 - p)}
            fill="none"
          />
        )}
      </Svg>
      <View style={styles.center}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  svg: { transform: [{ rotate: '-90deg' }] },
  center: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
