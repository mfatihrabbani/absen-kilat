import { useRouter, type Href } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type ViewProps } from 'react-native';

import { CaretRightIcon } from '@/components/icons';
import { AppText } from '@/components/ui/text';
import { Colors, Spacing } from '@/constants/theme';

/** Grup bagian halaman: judul + isi dengan jarak 8 (`.ak-section`). */
export function Section({ style, ...rest }: ViewProps) {
  return <View style={[styles.section, style]} {...rest} />;
}

type HeadProps = {
  title: string;
  meta?: ReactNode;
  link?: { label: string; href: Href };
};

/** Kepala bagian: judul 20px di kiri, meta atau tautan "Lihat semua" di kanan. */
export function SectionHead({ title, meta, link }: HeadProps) {
  const router = useRouter();
  return (
    <View style={styles.head}>
      <AppText variant="sectionTitle" accessibilityRole="header" numberOfLines={1}>
        {title}
      </AppText>
      {typeof meta === 'string' ? (
        <AppText color="textMuted" numeric numberOfLines={1} style={styles.meta}>
          {meta}
        </AppText>
      ) : (
        meta
      )}
      {link && (
        <Pressable
          accessibilityRole="link"
          onPress={() => router.navigate(link.href)}
          style={({ pressed }) => [styles.link, pressed && { opacity: 0.5 }]}
          hitSlop={8}>
          <AppText color="textMuted" numberOfLines={1} style={styles.metaText}>
            {link.label}
          </AppText>
          <CaretRightIcon size={15} color={Colors.textMuted} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: Spacing.two },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    paddingHorizontal: Spacing.one,
    minHeight: 25,
  },
  meta: { flexShrink: 1, fontSize: 15, lineHeight: 20 },
  metaText: { fontSize: 15, lineHeight: 20 },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingLeft: Spacing.two,
    flexShrink: 0,
  },
});
