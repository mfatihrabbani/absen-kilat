import { Dimensions, Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Icon } from '@/components/icons';
import { AppText } from '@/components/ui/text';
import { Colors, Fonts, Spacing } from '@/constants/theme';

export type ActionSheetOption = {
  label: string;
  icon?: Icon;
  danger?: boolean;
  onPress: () => void;
};

type Props = {
  /** Dipanggil setelah animasi tutup selesai. */
  onClose: () => void;
  title: string;
  message?: string;
  options: ActionSheetOption[];
  cancelLabel?: string;
};

const OFFSCREEN = Dimensions.get('window').height;
const CLOSE_MS = 220;

/**
 * Action sheet gaya iOS (`.ak-actionsheet`): grup pilihan + tombol Batal terpisah.
 * Dipasang saat dibuka dan dilepas lewat `onClose`; aksi dijalankan setelah sheet tertutup.
 */
export function ActionSheet({ onClose, title, message, options, cancelLabel = 'Batal' }: Props) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(OFFSCREEN);
  const closing = useSharedValue(false);

  const open = () => {
    translateY.value = withTiming(0, { duration: 300, easing: Easing.bezier(0.32, 0.72, 0, 1) });
  };

  const close = (after?: () => void) => {
    if (closing.value) return;
    closing.value = true;
    translateY.value = withTiming(OFFSCREEN, { duration: CLOSE_MS });
    setTimeout(() => {
      onClose();
      after?.();
    }, CLOSE_MS);
  };

  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [0, 400], [1, 0], 'clamp'),
  }));

  return (
    <Modal
      visible
      transparent
      animationType="none"
      statusBarTranslucent
      navigationBarTranslucent
      onShow={open}
      onRequestClose={() => close()}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => close()}
          accessibilityRole="button"
          accessibilityLabel={cancelLabel}
        />
      </Animated.View>
      <Animated.View
        accessibilityViewIsModal
        style={[styles.sheet, { paddingBottom: insets.bottom + Spacing.one }, sheetStyle]}>
        <View style={styles.group}>
          <View style={styles.head} accessible accessibilityRole="header">
            <AppText variant="caption" weight="semibold" style={styles.center}>
              {title}
            </AppText>
            {message ? (
              <AppText variant="caption" color="textMuted" style={styles.center}>
                {message}
              </AppText>
            ) : null}
          </View>
          {options.map((o) => (
            <SheetButton key={o.label} {...o} onPress={() => close(o.onPress)} />
          ))}
        </View>
        <View style={styles.group}>
          <SheetButton label={cancelLabel} strong onPress={() => close()} />
        </View>
      </Animated.View>
    </Modal>
  );
}

function SheetButton({
  label,
  icon: IconCmp,
  danger,
  strong,
  onPress,
}: {
  label: string;
  icon?: Icon;
  danger?: boolean;
  strong?: boolean;
  onPress: () => void;
}) {
  const color = danger ? Colors.dangerText : Colors.text;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        !strong && styles.divider,
        pressed && { backgroundColor: Colors.surfaceMuted },
      ]}>
      {IconCmp && <IconCmp size={20} color={color} />}
      <AppText style={[styles.buttonLabel, { color }, strong && { fontFamily: Fonts.semibold }]}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: { backgroundColor: Colors.backdrop },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: Spacing.two,
    gap: Spacing.two,
  },
  group: { backgroundColor: Colors.surface, borderRadius: 14, overflow: 'hidden' },
  head: {
    paddingTop: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
  },
  center: { textAlign: 'center' },
  button: {
    minHeight: 57,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  divider: { borderTopWidth: 1, borderTopColor: Colors.border },
  buttonLabel: { fontSize: 18, lineHeight: 24, letterSpacing: -0.4 },
});
