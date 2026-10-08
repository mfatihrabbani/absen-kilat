import { StyleSheet, Text as RNText, type TextProps } from 'react-native';

import { Colors, Fonts, type ColorName } from '@/constants/theme';

const variants = StyleSheet.create({
  body: { fontFamily: Fonts.regular, fontSize: 16, lineHeight: 24, letterSpacing: -0.32 },
  bodySm: { fontFamily: Fonts.regular, fontSize: 14, lineHeight: 21, letterSpacing: -0.2 },
  caption: { fontFamily: Fonts.regular, fontSize: 13, lineHeight: 18 },
  label: { fontFamily: Fonts.semibold, fontSize: 12, lineHeight: 16 },
  eyebrow: {
    fontFamily: Fonts.semibold,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  largeTitle: { fontFamily: Fonts.semibold, fontSize: 34, lineHeight: 41, letterSpacing: -1 },
  sectionTitle: { fontFamily: Fonts.semibold, fontSize: 20, lineHeight: 25, letterSpacing: -0.5 },
  headingSm: { fontFamily: Fonts.medium, fontSize: 22, lineHeight: 26, letterSpacing: -0.66 },
  navTitle: { fontFamily: Fonts.semibold, fontSize: 17, lineHeight: 22, letterSpacing: -0.4 },
  editorial: { fontFamily: Fonts.editorial, fontSize: 34, lineHeight: 37, letterSpacing: -1.2 },
});

export type TextVariant = keyof typeof variants;

export type AppTextProps = TextProps & {
  variant?: TextVariant;
  color?: ColorName;
  weight?: keyof typeof Fonts;
  /** Angka dengan lebar tetap (jam, durasi, tanggal). */
  numeric?: boolean;
};

/** Teks dengan tipografi desain; `variant` menentukan ukuran, `weight` bisa menimpa ketebalan. */
export function AppText({
  variant = 'body',
  color = 'text',
  weight,
  numeric,
  style,
  ...rest
}: AppTextProps) {
  return (
    <RNText
      style={[
        variants[variant],
        { color: Colors[color] },
        weight && { fontFamily: Fonts[weight] },
        numeric && styles.numeric,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  numeric: { fontVariant: ['tabular-nums'] },
});
