import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { AuthIntro } from '@/components/form/auth-intro';
import { PasswordRules, TextLink } from '@/components/form/form-bits';
import { TextField } from '@/components/form/text-field';
import { Button } from '@/components/ui/button';
import { PushedScreen } from '@/components/ui/pushed-screen';
import { AppText } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';
import { isStrongPassword, isValidEmail } from '@/lib/validation';
import { AuthError, signUp } from '@/services/auth';

type Errors = { name?: string; email?: string; password?: string };

/** Daftar akun baru dengan nama, email, dan kata sandi; lanjut ke verifikasi email. */
export default function DaftarScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const nameRef = useRef<TextInput>(null);

  const validate = (): Errors => ({
    name: name.trim() ? undefined : 'Nama wajib diisi.',
    email: isValidEmail(email) ? undefined : 'Masukkan email yang valid.',
    password: isStrongPassword(password)
      ? undefined
      : 'Kata sandi belum memenuhi aturan di atas.',
  });

  const submit = async () => {
    if (busy) return;
    const next = validate();
    setErrors(next);
    if (next.name) return nameRef.current?.focus();
    if (next.email) return emailRef.current?.focus();
    if (next.password) return passwordRef.current?.focus();

    setBusy(true);
    try {
      await signUp({ name: name.trim(), email: email.trim(), password });
      router.replace('/verifikasi');
    } catch (e) {
      if (e instanceof AuthError && e.field) {
        setErrors({ [e.field]: e.message });
        if (e.field === 'email') emailRef.current?.focus();
      } else {
        setErrors({ email: e instanceof Error ? e.message : 'Gagal membuat akun. Coba lagi.' });
      }
    } finally {
      setBusy(false);
    }
  };

  // Galat yang sudah tampil diperbarui saat pengguna mengetik.
  const revalidate = (field: keyof Errors) => {
    if (errors[field]) setErrors((e) => ({ ...e, [field]: validate()[field] }));
  };

  return (
    <PushedScreen title="Daftar" back={{ label: 'Masuk', fallback: '/masuk' }}>
      <AuthIntro
        title="Buat akun baru"
        lead="Satu akun untuk mencatat dan meninjau semua absensimu."
      />

      <View style={styles.form}>
        <TextField
          ref={nameRef}
          label="Nama lengkap"
          value={name}
          onChangeText={setName}
          onEndEditing={() => revalidate('name')}
          placeholder="Nama sesuai identitas"
          autoComplete="name"
          textContentType="name"
          autoCapitalize="words"
          returnKeyType="next"
          onSubmitEditing={() => emailRef.current?.focus()}
          error={errors.name}
        />
        <TextField
          ref={emailRef}
          label="Email"
          value={email}
          onChangeText={setEmail}
          onEndEditing={() => revalidate('email')}
          placeholder="nama@email.com"
          keyboardType="email-address"
          autoComplete="email"
          textContentType="emailAddress"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
          error={errors.email}
        />
        <TextField
          ref={passwordRef}
          label="Kata sandi"
          password
          value={password}
          onChangeText={(v) => {
            setPassword(v);
            if (errors.password && isStrongPassword(v)) setErrors((e) => ({ ...e, password: undefined }));
          }}
          placeholder="Buat kata sandi"
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="go"
          onSubmitEditing={submit}
          below={<PasswordRules value={password} />}
          error={errors.password}
        />
        <Button
          block
          variant="primary"
          label="Buat akun"
          busy={busy}
          busyLabel="Membuat akun…"
          onPress={submit}
        />
        <AppText variant="bodySm" color="textMuted" style={styles.center}>
          Dengan mendaftar, kamu setuju foto dan lokasi disimpan sebagai bukti kehadiran.
        </AppText>
      </View>

      <View style={styles.switch}>
        <AppText variant="bodySm" color="textMuted">
          Sudah punya akun?
        </AppText>
        <TextLink label="Masuk" onPress={() => router.replace('/masuk')} />
      </View>
    </PushedScreen>
  );
}

const styles = StyleSheet.create({
  form: { gap: Spacing.four },
  center: { textAlign: 'center' },
  switch: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: Spacing.one },
});
