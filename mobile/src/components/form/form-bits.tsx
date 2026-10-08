import { Pressable, StyleSheet, View, type PressableProps } from 'react-native';

import { CheckCircleIcon, LightningIcon, WarningCircleIcon } from '@/components/icons';
import { AppText } from '@/components/ui/text';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { checkPassword, PASSWORD_RULES } from '@/lib/validation';

/** Daftar aturan kata sandi yang tercentang hijau saat terpenuhi (`.ak-rules`). */
export function PasswordRules({
  value,
  extra = [],
}: {
  value: string;
  /** Aturan tambahan, mis. "Berbeda dari kata sandi saat ini". */
  extra?: { label: string; ok: boolean }[];
}) {
  const checks = checkPassword(value);
  const rules = [...PASSWORD_RULES.map((r) => ({ label: r.label, ok: checks[r.key] })), ...extra];
  return (
    <View style={styles.rules}>
      {rules.map((r) => (
        <View
          key={r.label}
          style={styles.rule}
          accessible
          accessibilityLabel={`${r.label}: ${r.ok ? 'terpenuhi' : 'belum terpenuhi'}`}>
          <CheckCircleIcon size={18} weight="fill" color={r.ok ? Colors.positive : Colors.textFaint} />
          <AppText variant="bodySm" color={r.ok ? 'text' : 'textMuted'}>
            {r.label}
          </AppText>
        </View>
      ))}
    </View>
  );
}

/** Kotak peringatan bergaris merah di atas form (`.ak-alert`). */
export function FormAlert({ message }: { message: string }) {
  return (
    <View style={styles.alert} accessibilityRole="alert" accessibilityLiveRegion="assertive">
      <WarningCircleIcon size={20} weight="fill" color={Colors.danger} />
      <AppText variant="bodySm" style={styles.flex}>
        {message}
      </AppText>
    </View>
  );
}

/** Tautan teks bergaris bawah (`.ak-textlink`). */
export function TextLink({
  label,
  disabled,
  style,
  ...rest
}: Omit<PressableProps, 'children'> & { label: string }) {
  return (
    <Pressable
      accessibilityRole="link"
      disabled={disabled}
      hitSlop={6}
      style={(state) => [
        styles.textLink,
        state.pressed && { opacity: 0.6 },
        typeof style === 'function' ? style(state) : style,
      ]}
      {...rest}>
      <AppText
        variant="bodySm"
        weight="medium"
        color={disabled ? 'textMuted' : 'text'}
        style={!disabled && styles.underline}>
        {label}
      </AppText>
    </Pressable>
  );
}

/** Logo Absen Kilat: kotak hitam dengan kilat oranye + nama aplikasi. */
export function Brand() {
  return (
    <View style={styles.brand} accessibilityRole="header" accessibilityLabel="Absen Kilat">
      <View style={styles.brandMark}>
        <LightningIcon size={18} weight="fill" color={Colors.accent} />
      </View>
      <AppText weight="semibold" style={styles.brandName}>
        Absen Kilat
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  rules: { gap: 6 },
  rule: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  alert: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: Radius.compact,
    borderWidth: 1,
    borderColor: Colors.danger,
    backgroundColor: Colors.surface,
  },
  flex: { flex: 1 },
  textLink: { paddingVertical: Spacing.two },
  underline: { textDecorationLine: 'underline' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  brandMark: {
    width: 32,
    height: 32,
    borderRadius: Radius.compact,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: { letterSpacing: -0.3 },
});
