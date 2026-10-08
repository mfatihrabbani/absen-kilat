import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { AuthIntro } from '@/components/form/auth-intro';
import { Brand, FormAlert, TextLink } from '@/components/form/form-bits';
import { TextField } from '@/components/form/text-field';
import { Button } from '@/components/ui/button';
import { PushedScreen } from '@/components/ui/pushed-screen';
import { AppText } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';
import { isValidEmail } from '@/lib/validation';
import { AuthError, signIn } from '@/services/auth';

type Errors = { email?: string; password?: string };

/** Masuk dengan email & kata sandi; tautan ke lupa kata sandi dan daftar. */
export default function MasukScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [alert, setAlert] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const validate = (): Errors => ({
    email: isValidEmail(email) ? undefined : 'Masukkan email yang valid.',
    password: password.length >= 8 ? undefined : 'Kata sandi minimal 8 karakter.',
  });

  const submit = async () => {
    if (busy) return;
    const next = validate();
    setErrors(next);
    setAlert(null);
    if (next.email) return emailRef.current?.focus();
    if (next.password) return passwordRef.current?.focus();

    setBusy(true);
    try {
      await signIn({ email: email.trim(), password });
      setPassword('');
      router.replace('/');
    } catch (e) {
      if (e instanceof AuthError && e.field) setErrors({ [e.field]: e.message });
      else setAlert(e instanceof Error ? e.message : 'Gagal masuk. Coba lagi.');
      passwordRef.current?.focus();
    } finally {
      setBusy(false);
    }
  };

  return (
    <PushedScreen title="Masuk" back={null}>
      <View style={styles.top}>
        <AuthIntro
          top={<Brand />}
          title="Masuk ke akunmu"
          lead="Catat kehadiran dengan selfie dan lokasi dalam beberapa detik."
        />
      </View>

      <View style={styles.form}>
        {alert && <FormAlert message={alert} />}
        <TextField
          ref={emailRef}
          label="Email"
          value={email}
          onChangeText={(v) => {
            setEmail(v);
            setAlert(null);
            if (errors.email && isValidEmail(v)) setErrors((e) => ({ ...e, email: undefined }));
          }}
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
            setAlert(null);
            if (errors.password && v.length >= 8) setErrors((e) => ({ ...e, password: undefined }));
          }}
          placeholder="Minimal 8 karakter"
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={submit}
          error={errors.password}
        />
        <TextLink
          label="Lupa kata sandi?"
          style={styles.forgot}
          onPress={() => router.push('/lupa-sandi')}
        />
        <Button
          block
          variant="primary"
          label="Masuk"
          busy={busy}
          busyLabel="Memeriksa…"
          onPress={submit}
        />
      </View>

      <View style={styles.switch}>
        <AppText variant="bodySm" color="textMuted">
          Belum punya akun?
        </AppText>
        <TextLink label="Daftar" onPress={() => router.push('/daftar')} />
      </View>
    </PushedScreen>
  );
}

const styles = StyleSheet.create({
  top: { paddingTop: Spacing.two, paddingBottom: Spacing.two },
  form: { gap: Spacing.four },
  forgot: { alignSelf: 'flex-end', marginTop: -Spacing.two },
  switch: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: Spacing.one },
});
