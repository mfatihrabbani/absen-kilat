import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { Colors, Shadow, Spacing } from '@/constants/theme';

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel: string;
};

/** Segmented control gaya iOS (`.p-riwayat__seg`). */
export function Segmented<T extends string>({ options, value, onChange, accessibilityLabel }: Props<T>) {
  return (
    <View style={styles.track} accessibilityRole="radiogroup" accessibilityLabel={accessibilityLabel}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(o.value)}
            style={[styles.option, active && styles.active]}>
            <AppText variant="caption" weight={active ? 'semibold' : 'medium'} style={styles.label}>
              {o.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    padding: 2,
    borderRadius: 9,
    backgroundColor: Colors.surfaceMuted,
  },
  option: {
    flex: 1,
    minHeight: 32,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.two,
  },
  active: { backgroundColor: Colors.surface, ...Shadow.segment },
  label: { letterSpacing: -0.1 },
});
