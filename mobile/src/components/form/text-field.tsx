import { useState, type ReactNode, type Ref } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { EyeIcon, EyeSlashIcon, WarningCircleIcon } from '@/components/icons';
import { AppText } from '@/components/ui/text';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';

export type TextFieldProps = Omit<TextInputProps, 'style'> & {
  ref?: Ref<TextInput>;
  label: string;
  /** Pesan galat di bawah field; field diberi garis merah bila ada. */
  error?: string | null;
  /** Field kata sandi dengan tombol tampil/sembunyikan. */
  password?: boolean;
  /** Konten tambahan di bawah input (mis. daftar aturan kata sandi). */
  below?: ReactNode;
  /** Tandai field tidak valid tanpa pesan (pesan ditampilkan di tempat lain). */
  invalid?: boolean;
};

/** Field form berlabel (`.ak-field`): input 52px, cincin fokus oranye, galat dengan ikon. */
export function TextField({
  ref,
  label,
  error,
  password,
  below,
  invalid,
  onFocus,
  onBlur,
  ...rest
}: TextFieldProps) {
  const isInvalid = !!error || !!invalid;
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.field}>
      <AppText variant="bodySm" weight="medium" nativeID={`${label}-label`}>
        {label}
      </AppText>
      <View style={styles.control}>
        <TextInput
          ref={ref}
          accessibilityLabel={label}
          accessibilityHint={error ?? undefined}
          aria-invalid={isInvalid}
          placeholderTextColor={Colors.textFaint}
          secureTextEntry={password && !visible}
          autoCapitalize={password ? 'none' : rest.autoCapitalize}
          autoCorrect={password ? false : rest.autoCorrect}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[
            styles.input,
            password && styles.inputTrail,
            focused && styles.focused,
            isInvalid && styles.invalid,
          ]}
          {...rest}
        />
        {password && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={visible ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
            accessibilityState={{ checked: visible }}
            onPress={() => setVisible((v) => !v)}
            style={styles.trail}>
            {visible ? (
              <EyeSlashIcon size={22} color={Colors.textMuted} />
            ) : (
              <EyeIcon size={22} color={Colors.textMuted} />
            )}
          </Pressable>
        )}
      </View>
      {below}
      {error ? <FieldError message={error} /> : null}
    </View>
  );
}

/** Baris galat merah dengan ikon (`.ak-error`). */
export function FieldError({ message }: { message: string }) {
  return (
    <View style={styles.error} accessibilityRole="alert" accessibilityLiveRegion="polite">
      <WarningCircleIcon size={18} weight="fill" color={Colors.danger} style={styles.errorIcon} />
      <AppText variant="bodySm" style={styles.errorText}>
        {message}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: Spacing.two },
  control: { justifyContent: 'center' },
  input: {
    minHeight: 52,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: Radius.image,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    backgroundColor: Colors.surface,
    color: Colors.text,
    fontFamily: Fonts.regular,
    fontSize: 16,
  },
  inputTrail: { paddingRight: 52 },
  focused: {
    borderColor: Colors.text,
    boxShadow: `0 0 0 3px ${Colors.accentSoft}`,
  },
  invalid: { borderColor: Colors.danger },
  trail: {
    position: 'absolute',
    right: 4,
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  errorIcon: { marginTop: 1 },
  errorText: { flex: 1 },
});
