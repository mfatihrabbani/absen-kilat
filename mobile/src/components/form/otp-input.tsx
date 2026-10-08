import { useEffect, useState, type Ref } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { AppText } from '@/components/ui/text';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';

type Props = {
  ref?: Ref<TextInput>;
  value: string;
  onChange: (value: string) => void;
  length?: number;
  invalid?: boolean;
  label: string;
  autoFocus?: boolean;
};

/** Kursor berkedip di kotak aktif. */
function Caret() {
  const opacity = useSharedValue(1);
  useEffect(() => {
    // Tampil 500 ms, hilang 500 ms (seperti `steps(1)` di desain).
    opacity.value = withRepeat(
      withSequence(
        withDelay(500, withTiming(0, { duration: 0 })),
        withDelay(500, withTiming(1, { duration: 0 })),
      ),
      -1,
    );
  }, [opacity]);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={[styles.caret, style]} />;
}

/**
 * Input kode OTP: satu TextInput tak terlihat di atas deretan kotak angka,
 * sehingga isi otomatis dari SMS/email (`one-time-code`) tetap berfungsi.
 */
export function OtpInput({ ref, value, onChange, length = 6, invalid, label, autoFocus }: Props) {
  const [focused, setFocused] = useState(false);
  const active = Math.min(value.length, length - 1);

  return (
    <View style={styles.wrap}>
      <View style={styles.cells} importantForAccessibility="no-hide-descendants">
        {Array.from({ length }, (_, i) => {
          const isActive = focused && i === active;
          return (
            <View
              key={i}
              style={[
                styles.cell,
                isActive && styles.cellActive,
                invalid && styles.cellInvalid,
              ]}>
              {value[i] ? (
                <AppText numeric style={styles.digit}>
                  {value[i]}
                </AppText>
              ) : isActive ? (
                <Caret />
              ) : null}
            </View>
          );
        })}
      </View>
      <TextInput
        ref={ref}
        value={value}
        onChangeText={(t) => onChange(t.replace(/\D/g, '').slice(0, length))}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        keyboardType="number-pad"
        inputMode="numeric"
        autoComplete="one-time-code"
        textContentType="oneTimeCode"
        maxLength={length}
        autoFocus={autoFocus}
        caretHidden
        accessibilityLabel={label}
        aria-invalid={invalid}
        style={styles.hiddenInput}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'relative' },
  cells: { flexDirection: 'row', gap: Spacing.two },
  cell: {
    flex: 1,
    height: 60,
    borderRadius: Radius.compact,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellActive: { borderColor: Colors.text, boxShadow: `0 0 0 3px ${Colors.accentSoft}` },
  cellInvalid: { borderColor: Colors.danger },
  digit: { fontFamily: Fonts.medium, fontSize: 22, lineHeight: 28 },
  caret: { width: 2, height: 24, backgroundColor: Colors.text },
  hiddenInput: {
    ...StyleSheet.absoluteFill,
    opacity: 0.011,
    color: 'transparent',
    fontSize: 16,
  },
});
