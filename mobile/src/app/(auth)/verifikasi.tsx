import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { AuthIntro } from '@/components/form/auth-intro';
import { TextLink } from '@/components/form/form-bits';
import { OtpInput } from '@/components/form/otp-input';
import { FieldError } from '@/components/form/text-field';
import { EnvelopeSimpleIcon, EnvelopeSimpleOpenIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { PushedScreen } from '@/components/ui/pushed-screen';
import { AppText } from '@/components/ui/text';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useCountdown } from '@/hooks/use-countdown';
import { setFlash } from '@/lib/flash';
import { getPendingEmail, resendVerification, verifyEmail } from '@/services/auth';

const CODE_LENGTH = 6;

/** Verifikasi email dengan kode 6 digit setelah daftar; aktifkan akun lalu masuk ke beranda. */
export default function VerifikasiScreen() {
  const router = useRouter();
  const email = getPendingEmail() ?? '';
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);
  const cooldown = useCountdown(30);
  const { start: startCooldown } = cooldown;

  // Kode baru saja dikirim saat daftar — mulai jeda kirim ulang.
  useEffect(() => {
    startCooldown();
  }, [startCooldown]);

  const submit = async (value = code) => {
    if (busy || value.length !== CODE_LENGTH) return;
    setBusy(true);
    setError(null);
    try {
      await verifyEmail({ email, code: value });
      setFlash({ title: 'Email terverifikasi', body: 'Akunmu aktif. Selamat datang di Absen Kilat.' });
      router.replace('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memverifikasi. Coba lagi.');
      setCode('');
      inputRef.current?.focus();
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    if (cooldown.remaining > 0) return;
    await resendVerification(email);
    setError(null);
    setNotice(`Kode baru terkirim. Cek kotak masuk ${email}.`);
    cooldown.start();
  };

  return (
    <PushedScreen title="Verifikasi Email" back={{ label: 'Daftar', fallback: '/daftar' }}>
      <AuthIntro
        top={
          <View style={styles.icon}>
            <EnvelopeSimpleOpenIcon size={30} color={Colors.text} />
          </View>
        }
        title="Verifikasi email"
        lead={
          <>
            Masukkan 6 digit kode yang kami kirim ke{' '}
            <AppText weight="medium">{email || 'emailmu'}</AppText>.
          </>
        }
      />

      <View style={styles.form}>
        <View style={styles.field}>
          <AppText variant="bodySm" weight="medium">
            Kode verifikasi
          </AppText>
          <OtpInput
            ref={inputRef}
            label="Kode verifikasi"
            value={code}
            autoFocus
            invalid={!!error}
            onChange={(v) => {
              setCode(v);
              setError(null);
              if (v.length === CODE_LENGTH) submit(v);
            }}
          />
          {error && <FieldError message={error} />}
        </View>
        <Button
          block
          variant="primary"
          label="Verifikasi"
          disabled={code.length !== CODE_LENGTH}
          busy={busy}
          busyLabel="Memverifikasi…"
          onPress={() => submit()}
        />
      </View>

      <View style={styles.resend}>
        <View style={styles.row}>
          <AppText variant="bodySm" color="textMuted">
            Tidak menerima kode?
          </AppText>
          <TextLink
            label={cooldown.remaining > 0 ? `Kirim ulang dalam ${cooldown.remaining} dtk` : 'Kirim ulang'}
            disabled={cooldown.remaining > 0}
            onPress={resend}
          />
        </View>
        <AppText variant="bodySm" color="textMuted" style={styles.center}>
          Kamu juga bisa membuka tautan verifikasi di email yang sama.
        </AppText>
        {notice && (
          <View style={styles.notice} accessibilityLiveRegion="polite">
            <EnvelopeSimpleIcon size={16} weight="fill" color={Colors.accent} />
            <AppText variant="bodySm" style={styles.flex}>
              {notice}
            </AppText>
          </View>
        )}
      </View>
    </PushedScreen>
  );
}

const styles = StyleSheet.create({
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
  form: { gap: Spacing.four },
  field: { gap: Spacing.two },
  resend: { gap: Spacing.two },
  row: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: Spacing.one },
  center: { textAlign: 'center' },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    alignSelf: 'center',
    marginTop: Spacing.two,
  },
  flex: { flexShrink: 1 },
});
