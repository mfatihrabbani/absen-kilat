import { Stack } from 'expo-router';

import { Colors } from '@/constants/theme';
import { useSession } from '@/lib/session';

/**
 * Navigasi autentikasi. Masuk/daftar hanya untuk tamu, verifikasi untuk
 * akun yang emailnya belum terverifikasi;
 * lupa/atur sandi & konfirmasi verifikasi tetap bisa dibuka kapan pun (mis. dari email).
 */
export default function AuthLayout() {
  const session = useSession();
  const signedIn = session.status === 'signed-in';
  const verified = signedIn && session.user.emailVerified;
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.canvas } }}>
      <Stack.Protected guard={!signedIn}>
        <Stack.Screen name="masuk" />
        <Stack.Screen name="daftar" />
      </Stack.Protected>
      {/* Verifikasi: sesudah daftar, atau saat masuk dengan email yang belum diverifikasi. */}
      <Stack.Protected guard={!verified}>
        <Stack.Screen name="verifikasi" />
      </Stack.Protected>
      {/* Lupa sandi juga dibuka dari Ganti Kata Sandi saat sudah masuk. */}
      <Stack.Screen name="lupa-sandi" />
      <Stack.Screen name="atur-sandi" />
      <Stack.Screen name="email-terverifikasi" />
    </Stack>
  );
}
