import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, StyleSheet, View } from 'react-native';
import Animated, { SlideInUp, SlideOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CheckCircleIcon } from '@/components/icons';
import { AppText } from '@/components/ui/text';
import { Colors, Radius, Shadow, Spacing } from '@/constants/theme';
import { consumeFlash, type FlashMessage } from '@/lib/flash';

const VISIBLE_MS = 3500;

/**
 * Banner gelap di atas layar (`.ak-banner`) untuk pesan sukses singkat.
 * Otomatis menampilkan pesan flash yang tertunda setiap layar mendapat fokus.
 */
export function FlashBanner() {
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState<FlashMessage | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useFocusEffect(
    useCallback(() => {
      const m = consumeFlash();
      if (!m) return;
      setMessage(m);
      AccessibilityInfo.announceForAccessibility(`${m.title}. ${m.body ?? ''}`);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setMessage(null), VISIBLE_MS);
    }, []),
  );

  useEffect(() => () => clearTimeout(timer.current), []);

  if (!message) return null;
  const IconCmp = message.icon ?? CheckCircleIcon;

  return (
    <Animated.View
      entering={SlideInUp.duration(300)}
      exiting={SlideOutUp.duration(220)}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={[styles.banner, { top: insets.top + 4 }]}>
      <View style={styles.icon}>
        <IconCmp size={20} weight="fill" color={Colors.accent} />
      </View>
      <View style={styles.body}>
        <AppText variant="bodySm" weight="semibold" color="onPrimary">
          {message.title}
        </AppText>
        {message.body && (
          <AppText variant="bodySm" color="onPrimary">
            {message.body}
          </AppText>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    left: Spacing.three,
    right: Spacing.three,
    zIndex: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: Radius.card,
    backgroundColor: Colors.bannerBg,
    ...Shadow.nav,
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  body: { flex: 1 },
});
