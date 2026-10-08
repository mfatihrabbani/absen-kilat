import { StyleSheet, View } from 'react-native';

import type { Icon } from '@/components/icons';
import { AppText } from '@/components/ui/text';
import { Colors, Radius, Spacing } from '@/constants/theme';

type Tone = 'neutral' | 'ok' | 'late';

type ChipProps = {
  label: string;
  tone?: Tone;
  icon?: Icon;
};

/** Chip status kecil (`.ak-chip`). Warna selalu disertai teks + ikon, tidak warna saja. */
export function Chip({ label, tone = 'neutral', icon: IconCmp }: ChipProps) {
  const iconColor = tone === 'ok' ? Colors.positive : tone === 'late' ? Colors.warning : Colors.textSoft;
  return (
    <View style={styles.chip}>
      {IconCmp && <IconCmp size={14} weight="fill" color={iconColor} />}
      <AppText variant="label" color={tone === 'late' ? 'warningText' : 'textSoft'}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.one,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceMuted,
  },
});
