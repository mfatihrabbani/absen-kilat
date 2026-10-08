import { StyleSheet, View, type ViewProps } from 'react-native';

import { Colors, Radius } from '@/constants/theme';

/** Permukaan putih dengan garis tipis dan sudut 20 (`.ak-card`). */
export function Card({ style, ...rest }: ViewProps) {
  return <View style={[styles.card, style]} {...rest} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: Colors.border,
    borderRadius: Radius.card,
  },
});
