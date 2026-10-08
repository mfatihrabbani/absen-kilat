import { useRef, useState } from 'react';
import { Linking, Platform, StyleSheet, TextInput, View } from 'react-native';

import { AuthIntro, AuthResult } from '@/components/form/auth-intro';
import { TextLink } from '@/components/form/form-bits';
import { TextField } from '@/components/form/text-field';
import { PaperPlaneTiltIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { PushedScreen } from '@/components/ui/pushed-screen';
import { AppText } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';
import { useCountdown } from '@/hooks/use-countdown';
import { isValidEmail } from '@/lib/validation';
import { requestPasswordReset } from '@/services/auth';

/** Lupa kata sandi: minta tautan reset ke email, lalu tampilkan petunjuk cek email. */
export default function LupaSandiScreen() {
  const [step, setStep] = useState<'request' | 'sent'>('request');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [resending, setResending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const emailRef = useRef<TextInput>(null);
  const cooldown = useCountdown(30);

  const submit = async () => {
    if (busy) return;
    if (!isValidEmail(email)) {
      setError('Masukkan email yang valid.');
      emailRef.current?.focus();
      return;
    }
    setError(null);
    setBusy(true);
    try {
      await requestPasswordReset(email);
      setStep('sent');
      setNotice(null);
      cooldown.start();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal mengirim tautan. Coba lagi.');
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    if (cooldown.remaining > 0 || resending) return;
    setResending(true);
    try {
      await requestPasswordReset(email);
      setNotice(`Tautan baru terkirim. Cek kotak masuk ${email.trim()}.`);
      cooldown.start();
    } finally {
      setResending(false);
    }
  };

  const openMail = () => {
    // Buka aplikasi email bawaan (iOS: Mail, lainnya: penangan mailto).
    Linking.openURL(Platform.OS === 'ios' ? 'message:' : 'mailto:').catch(() => {});
  };

  return (
    <PushedScreen title="Lupa Kata Sandi" back={{ label: 'Masuk', fallback: '/masuk' }}>
      {step === 'request' ? (
        <>
          <AuthIntro
            title="Lupa kata sandi?"
            lead="Masukkan email akunmu. Kami kirim tautan untuk mengatur ulang kata sandi."
          />
          <View style={styles.form}>
            <TextField
              ref={emailRef}
              label="Email"
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                if (error && isValidEmail(v)) setError(null);
              }}
              placeholder="nama@email.com"
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="send"
              onSubmitEditing={submit}
              error={error}
            />
            <Button
              block
              variant="primary"
              label="Kirim tautan reset"
              busy={busy}
              busyLabel="Mengirim…"
              onPress={submit}
            />
          </View>
        </>
      ) : (
        <>
          <AuthResult
            icon={PaperPlaneTiltIcon}
            title="Cek email kamu"
            body={
              <>
                Kami mengirim tautan reset ke{' '}
                <AppText weight="medium">{email.trim()}</AppText>. Tautan berlaku selama 30 menit.
              </>
            }
          />
          <View style={styles.actions}>
            <Button block variant="primary" label="Buka aplikasi email" onPress={openMail} />
            <Button
              block
              label={cooldown.remaining > 0 ? `Kirim ulang dalam ${cooldown.remaining} dtk` : 'Kirim ulang'}
              disabled={cooldown.remaining > 0}
              busy={resending}
              busyLabel="Mengirim…"
              onPress={resend}
            />
            <TextLink
              label="Gunakan email lain"
              style={styles.center}
              onPress={() => {
                setStep('request');
                setTimeout(() => emailRef.current?.focus(), 50);
              }}
            />
          </View>
          {notice && (
            <AppText
              variant="bodySm"
              color="textMuted"
              style={styles.notice}
              accessibilityLiveRegion="polite">
              {notice}
            </AppText>
          )}
        </>
      )}
    </PushedScreen>
  );
}

const styles = StyleSheet.create({
  form: { gap: Spacing.four },
  actions: { gap: Spacing.three },
  center: { alignSelf: 'center' },
  notice: { textAlign: 'center' },
});
