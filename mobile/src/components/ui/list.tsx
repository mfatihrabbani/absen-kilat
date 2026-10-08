import { Children, Fragment, type ReactNode } from 'react';
import { Pressable, StyleSheet, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { CaretRightIcon } from '@/components/icons';
import { Card } from '@/components/ui/card';
import { Colors, Spacing } from '@/constants/theme';

/** Daftar berkelompok dalam kartu, tiap baris dipisah garis tipis (`.ak-list`). */
export function ListGroup({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const items = Children.toArray(children);
  return (
    <Card style={[styles.group, style]}>
      {items.map((child, i) => (
        <Fragment key={i}>
          {i > 0 && <View style={styles.divider} />}
          {child}
        </Fragment>
      ))}
    </Card>
  );
}

type RowProps = Omit<PressableProps, 'style' | 'children'> & {
  children: ReactNode;
  /** Tampilkan panah kanan (baris bisa dibuka). */
  chevron?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Satu baris daftar 56px; bila punya `onPress` akan berwarna saat ditekan. */
export function ListRow({ children, chevron, style, onPress, ...rest }: RowProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      style={({ pressed }) => [styles.row, pressed && styles.pressed, style]}
      {...rest}>
      {children}
      {chevron && <CaretRightIcon size={16} weight="bold" color={Colors.textFaint} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  group: { overflow: 'hidden' },
  divider: { height: 1, backgroundColor: Colors.border },
  row: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  pressed: { backgroundColor: Colors.surfaceSubtle },
});
