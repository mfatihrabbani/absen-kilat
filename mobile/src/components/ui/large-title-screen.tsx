import { Children, type ReactNode } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FlashBanner } from '@/components/ui/banner';
import { AppText } from '@/components/ui/text';
import { Colors, MaxContentWidth, Spacing } from '@/constants/theme';

const NAV_HEIGHT = 44;

type Props = {
  title: string;
  eyebrow?: string;
  /** Aksi di kanan bar navigasi (avatar, tombol kalender, ...). */
  actions?: ReactNode;
  /**
   * Isi halaman. Tiap anak langsung menjadi anak ScrollView, sehingga
   * `stickyIndices` (dihitung dari 0 = anak pertama) bisa menempel di atas.
   */
  children: ReactNode;
  stickyIndices?: number[];
  refreshing?: boolean;
  onRefresh?: () => void;
};

/**
 * Kerangka layar tab bergaya iOS (`mobile-tabs` layout): judul besar ikut
 * menggulir, lalu judul kecil + garis bawah muncul di bar navigasi.
 */
export function LargeTitleScreen({
  title,
  eyebrow,
  actions,
  children,
  stickyIndices,
  refreshing,
  onRefresh,
}: Props) {
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });

  const borderStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [8, 40], [0, 1], 'clamp'),
  }));
  const titleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [40, 64], [0, 1], 'clamp'),
    transform: [{ translateY: interpolate(scrollY.value, [40, 64], [4, 0], 'clamp') }],
  }));

  const items = Children.toArray(children);

  return (
    <View style={styles.root}>
      <View style={{ paddingTop: insets.top, backgroundColor: Colors.canvas, zIndex: 2 }}>
        <View style={styles.nav}>
          <Animated.View style={[styles.navTitle, titleStyle]} pointerEvents="none">
            <AppText variant="navTitle" numberOfLines={1} importantForAccessibility="no">
              {title}
            </AppText>
          </Animated.View>
          <View style={styles.actions}>{actions}</View>
        </View>
        <Animated.View style={[styles.navBorder, borderStyle]} />
      </View>

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        stickyHeaderIndices={stickyIndices?.map((i) => i + 1)}
        contentContainerStyle={styles.content}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={!!refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.accent}
              colors={[Colors.accent]}
            />
          ) : undefined
        }>
        <View style={styles.hero}>
          {eyebrow && (
            <AppText variant="eyebrow" color="textMuted" numeric>
              {eyebrow}
            </AppText>
          )}
          <AppText variant="largeTitle" accessibilityRole="header">
            {title}
          </AppText>
        </View>
        {items}
      </Animated.ScrollView>

      <FlashBanner />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.canvas },
  nav: {
    height: NAV_HEIGHT,
    paddingHorizontal: Spacing.four,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  navTitle: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 72,
  },
  actions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  navBorder: { height: 1, backgroundColor: Colors.border },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.five,
    paddingBottom: Spacing.eight,
    gap: Spacing.six,
  },
  hero: { paddingTop: Spacing.one, paddingRight: 52 },
});
