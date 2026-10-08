import type { ReactNode } from 'react';
import { Dimensions, Modal, Pressable, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import { Colors, Radius, Spacing } from '@/constants/theme';

type Close = (after?: () => void) => void;

type Props = {
  visible: boolean;
  /** Dipanggil sesudah animasi tutup selesai — set `visible` ke false di sini. */
  onClose: () => void;
  accessibilityLabel: string;
  /** Render-prop menerima `close(after?)` untuk menutup dengan animasi lalu menjalankan `after`. */
  children: (close: Close) => ReactNode;
};

const OFFSCREEN = Dimensions.get('window').height;
const DISMISS_DISTANCE = 90;
const CLOSE_MS = 220;

/**
 * Bottom sheet modal (`.ak-sheet`): geser naik saat dibuka, bisa ditutup dengan
 * menyeret pegangan ke bawah, mengetuk latar, atau tombol kembali Android.
 */
export function BottomSheet({ visible, onClose, accessibilityLabel, children }: Props) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(OFFSCREEN);
  const closing = useSharedValue(false);

  const open = () => {
    closing.value = false;
    translateY.value = OFFSCREEN;
    translateY.value = withTiming(0, { duration: 300, easing: Easing.bezier(0.32, 0.72, 0, 1) });
  };

  const close: Close = (after) => {
    if (closing.value) return;
    closing.value = true;
    translateY.value = withTiming(OFFSCREEN, { duration: CLOSE_MS, easing: Easing.in(Easing.ease) });
    setTimeout(() => {
      onClose();
      after?.();
    }, CLOSE_MS);
  };

  const dismiss = () => close();

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      translateY.value = Math.max(0, e.translationY);
    })
    .onEnd((e) => {
      if (e.translationY > DISMISS_DISTANCE || e.velocityY > 1200) scheduleOnRN(dismiss);
      else translateY.value = withSpring(0, { damping: 30, stiffness: 300 });
    });

  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [0, 400], [1, 0], 'clamp'),
  }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      navigationBarTranslucent
      onShow={open}
      onRequestClose={dismiss}>
      <GestureHandlerRootView style={styles.root}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={dismiss} accessibilityRole="button" accessibilityLabel="Tutup" />
        </Animated.View>
        <Animated.View
          accessibilityViewIsModal
          accessibilityLabel={accessibilityLabel}
          style={[styles.sheet, { paddingBottom: insets.bottom + Spacing.two }, sheetStyle]}>
          <GestureDetector gesture={pan}>
            <View style={styles.grab}>
              <View style={styles.grip} />
            </View>
          </GestureDetector>
          <View style={styles.body}>{children(close)}</View>
        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  backdrop: { backgroundColor: Colors.backdrop },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '92%',
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.sheet,
    borderTopRightRadius: Radius.sheet,
  },
  grab: {
    alignItems: 'center',
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
  },
  grip: {
    width: 36,
    height: 5,
    borderRadius: Radius.pill,
    backgroundColor: Colors.borderStrong,
    opacity: 0.5,
  },
  body: {
    paddingHorizontal: Spacing.five,
    gap: Spacing.four,
    paddingBottom: Spacing.four,
  },
});
