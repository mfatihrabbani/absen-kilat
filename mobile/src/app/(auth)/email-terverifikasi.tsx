import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AuthResult } from '@/components/form/auth-intro';
import { CalendarXIcon, CheckCircleIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { PushedScreen } from '@/components/ui/pushed-screen';
import { Colors, Spacing } from '@/constants/theme';

/** Pesan untuk kode galat dari tautan verifikasi Better Auth (`?error=...`). */
const ERROR_TEXT: Record<string, string> = {
  token_expired: 'Tautan verifikasi sudah kedaluwarsa. Minta kode atau tautan baru.',
  invalid_token: 'Tautan verifikasi tidak valid. Pastikan kamu membuka tautan terbaru dari email.',
  user_not_found: 'Akun untuk tautan ini tidak ditemukan. Coba daftar ulang.',
};

/**
 * Konfirmasi setelah membuka tautan verifikasi dari email
 * (`absenkilat://email-terverifikasi`, dengan `?error=...` bila gagal).
 */
export default function EmailTerverifikasiScreen() {
  const router = useRouter();
  const { error } = useLocalSearchParams<{ error?: string }>();

  return (
    <PushedScreen title="Verifikasi Email" back={null}>
      {error ? (
        <>
          <AuthResult
            icon={CalendarXIcon}
            title="Verifikasi gagal"
            body={ERROR_TEXT[error] ?? 'Tautan verifikasi tidak bisa dipakai. Minta tautan baru.'}
          />
          <View style={styles.actions}>
            <Button
              block
              variant="primary"
              label="Masukkan kode verifikasi"
              onPress={() => router.replace('/verifikasi')}
            />
            <Button block label="Kembali ke Masuk" onPress={() => router.replace('/masuk')} />
          </View>
        </>
      ) : (
        <>
          <AuthResult
            icon={CheckCircleIcon}
            iconColor={Colors.positive}
            title="Email terverifikasi"
            body="Akunmu sudah aktif. Sekarang kamu bisa absen dengan selfie dan lokasi."
          />
          <View style={styles.actions}>
            <Button block variant="primary" label="Mulai absen" onPress={() => router.replace('/')} />
          </View>
        </>
      )}
    </PushedScreen>
  );
}

const styles = StyleSheet.create({
  actions: { gap: Spacing.three },
});
