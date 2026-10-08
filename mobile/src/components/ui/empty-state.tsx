import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import type { Icon } from '@/components/icons';
import { AppText } from '@/components/ui/text';
import { Colors, Radius, Spacing } from '@/constants/theme';

type Props = {
  icon: Icon;
  title: string;
  body?: string;
  action?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** Keadaan kosong/hasil: ikon dalam lingkaran, judul, penjelasan, dan aksi opsional (`.ak-state`). */
export function EmptyState({ icon: IconCmp, title, body, action, style }: Props) {
  return (
    <View style={[styles.state, style]}>
      <View style={styles.icon}>
        <IconCmp size={30} color={Colors.text} />
      </View>
      <AppText variant="headingSm" style={styles.center}>
        {title}
      </AppText>
      {body && (
        <AppText variant="bodySm" color="textMuted" style={[styles.center, styles.body]}>
          {body}
        </AppText>
      )}
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  state: {
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.six,
    paddingHorizontal: Spacing.four,
  },
  icon: {
    width: 64,
    height: 64,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: { textAlign: 'center' },
  body: { maxWidth: 300 },
});
