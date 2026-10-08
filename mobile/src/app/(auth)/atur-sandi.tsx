import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { AuthIntro, AuthResult } from '@/components/form/auth-intro';
import { FormAlert, PasswordRules } from '@/components/form/form-bits';
import { TextField } from '@/components/form/text-field';
import { CalendarXIcon, CheckCircleIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { PushedScreen } from '@/components/ui/pushed-screen';
import { AppText } from '@/components/ui/text';
import { Colors, Spacing } from '@/constants/theme';
import { isStrongPassword } from '@/lib/validation';
import { getResetEmail, resetPassword } from '@/services/auth';

/**
 * Atur kata sandi baru dari tautan email (`absenkilat://atur-sandi?token=...`).
 * Setelah berhasil, pengguna diarahkan untuk masuk lagi.
 */
export default function AturSandiScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token?: string }>();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
  const [alert, setAlert] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);
  const email = getResetEmail();

  const toLogin = () => router.replace('/masuk');

  const submit = async () => {
    if (busy || !token) return;
    const passOk = isStrongPassword(password);
    const same = !!password && confirm === password;
    setErrors({
      password: passOk ? undefined : 'Kata sandi belum memenuhi aturan di atas.',
      confirm: passOk && !same ? 'Kata sandi tidak sama.' : undefined,
    });
    setAlert(null);
    if (!passOk) return passwordRef.current?.focus();
    if (!same) return confirmRef.current?.focus();

    setBusy(true);
    try {
      await resetPassword({ token, newPassword: password });
      setPassword('');
      setConfirm('');
      setDone(true);
    } catch (e) {
      setAlert(e instanceof Error ? e.message : 'Gagal menyimpan kata sandi. Coba lagi.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <PushedScreen title="Atur Kata Sandi" back={{ label: 'Batal', fallback: '/masuk' }}>
      {!token ? (
        <>
          <AuthResult
            icon={CalendarXIcon}
            title="Tautan tidak valid"
            body="Tautan reset tidak lengkap atau sudah kedaluwarsa. Minta tautan baru dari halaman lupa kata sandi."
          />
          <Button
            block
            variant="primary"
            label="Minta tautan baru"
            onPress={() => router.replace('/lupa-sandi')}
          />
        </>
      ) : done ? (
        <>
          <AuthResult
            icon={CheckCircleIcon}
            iconColor={Colors.positive}
            title="Kata sandi diperbarui"
            body="Masuk dengan kata sandi barumu. Sesi di perangkat lain sudah dikeluarkan."
          />
          <Button block variant="primary" label="Masuk" onPress={toLogin} />
        </>
      ) : (
        <>
          <AuthIntro
            title="Atur kata sandi baru"
            lead={
              email ? (
                <>
                  Untuk akun <AppText weight="medium">{email}</AppText>.
                </>
              ) : (
                'Buat kata sandi baru untuk akunmu.'
              )
            }
          />
          <View style={styles.form}>
            {alert && <FormAlert message={alert} />}
            <TextField
              ref={passwordRef}
              label="Kata sandi baru"
              password
              value={password}
              onChangeText={(v) => {
                setPassword(v);
                if (errors.password && isStrongPassword(v)) {
                  setErrors((e) => ({ ...e, password: undefined }));
                }
              }}
              placeholder="Buat kata sandi"
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="next"
              onSubmitEditing={() => confirmRef.current?.focus()}
              below={<PasswordRules value={password} />}
              error={errors.password}
            />
            <TextField
              ref={confirmRef}
              label="Ulangi kata sandi baru"
              password
              value={confirm}
              onChangeText={(v) => {
                setConfirm(v);
                if (errors.confirm && v === password) setErrors((e) => ({ ...e, confirm: undefined }));
              }}
              placeholder="Ketik ulang kata sandi"
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="go"
              onSubmitEditing={submit}
              error={errors.confirm}
            />
            <Button
              block
              variant="primary"
              label="Simpan kata sandi"
              busy={busy}
              busyLabel="Menyimpan…"
              onPress={submit}
            />
          </View>
        </>
      )}
    </PushedScreen>
  );
}

const styles = StyleSheet.create({
  form: { gap: Spacing.four },
});
