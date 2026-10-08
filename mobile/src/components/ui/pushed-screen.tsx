import { useRouter, type Href } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type ScrollViewProps } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CaretLeftIcon } from '@/components/icons';
import { FlashBanner } from '@/components/ui/banner';
import { AppText } from '@/components/ui/text';
import { Colors, MaxContentWidth, Spacing } from '@/constants/theme';

const NAV_HEIGHT = 44;

type Props = {
  /** Judul kecil di tengah bar navigasi (muncul saat menggulir). */
  title: string;
  /** Tombol kembali di kiri; `null` untuk menyembunyikannya. */
  back?: { label: string; fallback: Href } | null;
  /** Aksi di kanan bar navigasi. */
  actions?: ReactNode;
  children: ReactNode;
  keyboardShouldPersistTaps?: ScrollViewProps['keyboardShouldPersistTaps'];
};

/**
 * Kerangka layar dorongan (`mobile` layout): tombol kembali di kiri, judul
 * kecil di tengah yang muncul saat konten digulir, isi dengan padding 20.
 */
export function PushedScreen({ title, back, actions, children, keyboardShouldPersistTaps }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });
  const borderStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 24], [0, 1], 'clamp'),
  }));
  const titleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [40, 72], [0, 1], 'clamp'),
    transform: [{ translateY: interpolate(scrollY.value, [40, 72], [4, 0], 'clamp') }],
  }));

  const goBack = () => {
    if (!back) return;
    if (router.canGoBack()) router.back();
    else router.replace(back.fallback);
  };

  return (
    <View style={styles.root}>
      <View style={{ paddingTop: insets.top, backgroundColor: Colors.canvas, zIndex: 2 }}>
        <View style={styles.nav}>
          <Animated.View style={[styles.navTitle, titleStyle]} pointerEvents="none">
            <AppText variant="navTitle" numberOfLines={1} importantForAccessibility="no">
              {title}
            </AppText>
          </Animated.View>
          {back ? (
            <Pressable
              onPress={goBack}
              accessibilityRole="button"
              accessibilityLabel={`Kembali ke ${back.label}`}
              hitSlop={8}
              style={({ pressed }) => [styles.back, pressed && { opacity: 0.5 }]}>
              <CaretLeftIcon size={24} color={Colors.text} />
              <AppText weight="medium" style={styles.backLabel}>
                {back.label}
              </AppText>
            </Pressable>
          ) : (
            <View />
          )}
          <View style={styles.actions}>{actions}</View>
        </View>
        <Animated.View style={[styles.navBorder, borderStyle]} />
      </View>

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.eight }]}>
        {children}
      </Animated.ScrollView>

      <FlashBanner />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.canvas },
  nav: {
    height: NAV_HEIGHT,
    paddingHorizontal: Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navTitle: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 96,
  },
  back: { flexDirection: 'row', alignItems: 'center', gap: 2, minHeight: 44, paddingRight: Spacing.two },
  backLabel: { fontSize: 17, letterSpacing: -0.4 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  navBorder: { height: 1, backgroundColor: Colors.border },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.five,
    paddingTop: Spacing.one,
    gap: Spacing.six,
  },
});
