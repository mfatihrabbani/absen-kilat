import type { ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { Colors, Radius } from '@/constants/theme';

type Props = Omit<PressableProps, 'style' | 'children'> & {
  /** Wajib untuk tombol ikon saja. */
  accessibilityLabel: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
};

/** Tombol bulat 36px bergaris tipis (`.ak-iconbtn`), area sentuh diperluas jadi 44px. */
export function IconButton({ size = 36, style, children, disabled, ...rest }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      hitSlop={Math.max(0, (44 - size) / 2)}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        { width: size, height: size },
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
      {...rest}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  pressed: { transform: [{ scale: 0.97 }], backgroundColor: Colors.surfaceSubtle },
  disabled: { opacity: 0.35 },
});
