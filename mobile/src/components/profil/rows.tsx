import type { ReactNode } from 'react';
import { StyleSheet, Switch, View } from 'react-native';

import type { Icon } from '@/components/icons';
import { ListRow } from '@/components/ui/list';
import { AppText } from '@/components/ui/text';
import { Colors, Radius, Spacing } from '@/constants/theme';

/** Label kecil di atas grup daftar (`.ak-group-label`). */
export function GroupLabel({ children }: { children: string }) {
  return (
    <AppText variant="label" color="textMuted" accessibilityRole="header" style={styles.groupLabel}>
      {children}
    </AppText>
  );
}

/** Kotak ikon 32px di kiri baris (`.ak-row__icon`). */
export function RowIcon({ icon: IconCmp, danger }: { icon: Icon; danger?: boolean }) {
  return (
    <View style={[styles.rowIcon, danger && { backgroundColor: '#f8e3e2' }]}>
      <IconCmp size={18} color={danger ? Colors.dangerText : Colors.text} />
    </View>
  );
}

type InfoRowProps = {
  icon?: Icon;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  danger?: boolean;
  trailing?: ReactNode;
  accessibilityLabel?: string;
};

/** Baris profil: ikon, judul, sub-judul, dan panah bila bisa dibuka. */
export function ProfileRow({
  icon,
  title,
  subtitle,
  onPress,
  danger,
  trailing,
  accessibilityLabel,
}: InfoRowProps) {
  return (
    <ListRow
      onPress={onPress}
      chevron={!!onPress && !danger}
      accessibilityLabel={accessibilityLabel ?? [title, subtitle].filter(Boolean).join(', ')}>
      {icon && <RowIcon icon={icon} danger={danger} />}
      <View style={styles.main}>
        <AppText
          weight={danger ? 'medium' : 'regular'}
          color={danger ? 'dangerText' : 'text'}
          style={styles.title}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="bodySm" color="textMuted">
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {trailing}
    </ListRow>
  );
}

/** Baris dengan sakelar (pengaturan notifikasi). Seluruh baris bisa diketuk. */
export function SwitchRow({
  title,
  subtitle,
  value,
  onValueChange,
}: {
  title: string;
  subtitle: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  return (
    <ListRow
      onPress={() => onValueChange(!value)}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={`${title}, ${subtitle}`}>
      <View style={styles.main}>
        <AppText style={styles.title}>{title}</AppText>
        <AppText variant="bodySm" color="textMuted">
          {subtitle}
        </AppText>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: Colors.surfaceMuted, true: Colors.primary }}
        thumbColor={Colors.surface}
        ios_backgroundColor={Colors.surfaceMuted}
        // react-native-web memakai warna teal bawaan untuk thumb aktif.
        {...({ activeThumbColor: Colors.surface } as object)}
        importantForAccessibility="no-hide-descendants"
        accessibilityElementsHidden
      />
    </ListRow>
  );
}

const styles = StyleSheet.create({
  groupLabel: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.two },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: Radius.compact,
    backgroundColor: Colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  main: { flex: 1, minWidth: 0 },
  title: { lineHeight: 22 },
});
