import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';

/** Judul editorial (serif) + paragraf pengantar di atas form autentikasi. */
export function AuthIntro({
  title,
  lead,
  top,
}: {
  title: string;
  lead?: ReactNode;
  /** Elemen di atas judul, mis. logo atau ikon. */
  top?: ReactNode;
}) {
  return (
    <View style={[styles.intro, !!top && styles.withTop]}>
      {top}
      <AppText variant="editorial" accessibilityRole="header">
        {title}
      </AppText>
      {lead ? (
        <AppText color="textMuted" style={top ? undefined : styles.lead}>
          {lead}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  intro: {},
  withTop: { gap: Spacing.two },
  lead: { marginTop: Spacing.two },
});
