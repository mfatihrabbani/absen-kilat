import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import type { Icon } from '@/components/icons';
import { AppText } from '@/components/ui/text';
import { Colors, Radius, Spacing } from '@/constants/theme';

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
        <AppText color="textMuted" style={top ? styles.leadAfterTop : styles.lead}>
          {lead}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  intro: {},
  withTop: { gap: Spacing.four },
  lead: { marginTop: Spacing.two },
  leadAfterTop: { marginTop: -Spacing.two },
});

/** Keadaan hasil di tengah (ikon bulat + judul editorial + penjelasan), mis. "Cek email kamu". */
export function AuthResult({
  icon: IconCmp,
  iconColor = Colors.text,
  title,
  body,
}: {
  icon: Icon;
  iconColor?: string;
  title: string;
  body: ReactNode;
}) {
  return (
    <View style={resultStyles.state}>
      <View style={resultStyles.icon}>
        <IconCmp size={30} weight={iconColor === Colors.text ? 'regular' : 'fill'} color={iconColor} />
      </View>
      <AppText variant="editorial" accessibilityRole="header" style={resultStyles.center}>
        {title}
      </AppText>
      <AppText color="textMuted" style={[resultStyles.center, resultStyles.body]}>
        {body}
      </AppText>
    </View>
  );
}

const resultStyles = StyleSheet.create({
  state: { alignItems: 'center', gap: Spacing.three, paddingTop: Spacing.six, paddingHorizontal: Spacing.four },
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
  body: { maxWidth: 320 },
});
