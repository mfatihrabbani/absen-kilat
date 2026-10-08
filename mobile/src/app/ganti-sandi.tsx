import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { AuthIntro } from '@/components/form/auth-intro';
import { FormAlert, PasswordRules, TextLink } from '@/components/form/form-bits';
import { TextField } from '@/components/form/text-field';
import { LockKeyIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { PushedScreen } from '@/components/ui/pushed-screen';
import { Spacing } from '@/constants/theme';
import { setFlash } from '@/lib/flash';
import { isStrongPassword } from '@/lib/validation';
import { AuthError, changePassword } from '@/services/auth';

type Errors = { current?: string; next?: string; confirm?: string };

/** Ganti kata sandi dari Profil: kata sandi saat ini + kata sandi baru dengan aturan. */
export default function GantiSandiScreen() {
  const router = useRouter();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [currentWrong, setCurrentWrong] = useState(false);
  const [alert, setAlert] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const currentRef = useRef<TextInput>(null);
  const nextRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const different = !!next && next !== current;
  const nextOk = isStrongPassword(next) && different;

  const submit = async () => {
    if (busy) return;
    const same = !!next && confirm === next;
    const nextErrors: Errors = {
      current: current ? undefined : 'Masukkan kata sandi saat ini.',
      next: nextOk ? undefined : 'Kata sandi baru belum memenuhi aturan di atas.',
      confirm: nextOk && !same ? 'Kata sandi tidak sama.' : undefined,
    };
    setErrors(nextErrors);
    setAlert(null);
    setCurrentWrong(false);
    if (nextErrors.current) return currentRef.current?.focus();
    if (nextErrors.next) return nextRef.current?.focus();
    if (nextErrors.confirm) return confirmRef.current?.focus();

    setBusy(true);
    try {
      await changePassword({ currentPassword: current, newPassword: next });
      setFlash({
        title: 'Kata sandi diperbarui',
        body: 'Gunakan kata sandi baru saat masuk berikutnya.',
        icon: LockKeyIcon,
      });
      router.back();
    } catch (e) {
      if (e instanceof AuthError && e.field === 'password') {
        // Kata sandi saat ini salah: tampilkan peringatan dan tandai field-nya.
        setAlert(e.message);
        setCurrentWrong(true);
        currentRef.current?.focus();
      } else {
        setAlert(e instanceof Error ? e.message : 'Gagal menyimpan kata sandi. Coba lagi.');
      }
      setBusy(false);
    }
  };

  return (
    <PushedScreen title="Ganti Kata Sandi" back={{ label: 'Profil', fallback: '/profil' }}>
      <AuthIntro
        title="Ganti kata sandi"
        lead="Gunakan kata sandi yang belum pernah dipakai di layanan lain."
      />

      <View style={styles.form}>
        {alert && <FormAlert message={alert} />}
        <View style={styles.field}>
          <TextField
            ref={currentRef}
            label="Kata sandi saat ini"
            password
            value={current}
            onChangeText={(v) => {
              setCurrent(v);
              setAlert(null);
              setCurrentWrong(false);
              if (errors.current && v) setErrors((e) => ({ ...e, current: undefined }));
            }}
            autoComplete="current-password"
            textContentType="password"
            returnKeyType="next"
            onSubmitEditing={() => nextRef.current?.focus()}
            error={errors.current}
            invalid={currentWrong}
          />
          <TextLink
            label="Lupa kata sandi saat ini?"
            style={styles.forgot}
            onPress={() => router.push('/lupa-sandi')}
          />
        </View>
        <TextField
          ref={nextRef}
          label="Kata sandi baru"
          password
          value={next}
          onChangeText={(v) => {
            setNext(v);
            if (errors.next && isStrongPassword(v) && v !== current) {
              setErrors((e) => ({ ...e, next: undefined }));
            }
          }}
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="next"
          onSubmitEditing={() => confirmRef.current?.focus()}
          below={
            <PasswordRules
              value={next}
              extra={[{ label: 'Berbeda dari kata sandi saat ini', ok: different }]}
            />
          }
          error={errors.next}
        />
        <TextField
          ref={confirmRef}
          label="Ulangi kata sandi baru"
          password
          value={confirm}
          onChangeText={(v) => {
            setConfirm(v);
            if (errors.confirm && v === next) setErrors((e) => ({ ...e, confirm: undefined }));
          }}
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
    </PushedScreen>
  );
}

const styles = StyleSheet.create({
  form: { gap: Spacing.four },
  field: { gap: Spacing.one },
  forgot: { alignSelf: 'flex-start' },
});
