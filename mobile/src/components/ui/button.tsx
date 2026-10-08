import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import type { Icon } from '@/components/icons';
import { AppText } from '@/components/ui/text';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';

type Variant = 'primary' | 'secondary' | 'ghost';

export type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  variant?: Variant;
  icon?: Icon;
  /** Tampilkan spinner + `busyLabel`, tombol tidak bisa ditekan. */
  busy?: boolean;
  busyLabel?: string;
  block?: boolean;
  style?: StyleProp<ViewStyle>;
  trailing?: ReactNode;
};

/** Tombol pil desain: primary hitam, secondary bergaris, ghost transparan. */
export function Button({
  label,
  variant = 'secondary',
  icon: IconCmp,
  busy,
  busyLabel,
  block,
  disabled,
  style,
  trailing,
  ...rest
}: ButtonProps) {
  const inactive = disabled || busy;
  const fg = busy
    ? Colors.onPrimary
    : disabled
      ? Colors.textMuted
      : variant === 'primary'
        ? Colors.onPrimary
        : Colors.text;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inactive, busy: !!busy }}
      disabled={inactive}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        block && styles.block,
        pressed && !inactive && styles.pressed,
        pressed && !inactive && variant === 'primary' && { backgroundColor: Colors.primaryHover },
        disabled && !busy && styles.disabled,
        busy && styles.busy,
        style,
      ]}
      {...rest}>
      {busy ? (
        <ActivityIndicator size="small" color={Colors.onPrimary} />
      ) : (
        IconCmp && <IconCmp size={20} color={fg} />
      )}
      <AppText style={[styles.label, { color: fg }]}>{busy && busyLabel ? busyLabel : label}</AppText>
      {trailing}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.six,
    borderRadius: Radius.control,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  primary: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  secondary: { backgroundColor: Colors.surface, borderColor: Colors.borderStrong },
  ghost: { backgroundColor: 'transparent', borderColor: 'transparent' },
  block: { alignSelf: 'stretch' },
  pressed: { transform: [{ scale: 0.97 }] },
  disabled: { backgroundColor: Colors.surfaceMuted, borderColor: Colors.border },
  busy: { backgroundColor: Colors.primaryHover, borderColor: Colors.primaryHover },
  label: {
    fontFamily: Fonts.medium,
    fontSize: 17,
    lineHeight: 20,
    letterSpacing: -0.17,
  },
});
