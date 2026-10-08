import { Stack } from 'expo-router';

import { Colors } from '@/constants/theme';
import { useSession } from '@/lib/session';

/**
 * Navigasi autentikasi. Masuk/daftar/lupa sandi hanya untuk tamu, verifikasi untuk
 * akun yang emailnya belum terverifikasi;
 * atur sandi & konfirmasi verifikasi tetap bisa dibuka dari tautan email kapan pun.
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
        <Stack.Screen name="lupa-sandi" />
      </Stack.Protected>
      {/* Verifikasi: sesudah daftar, atau saat masuk dengan email yang belum diverifikasi. */}
      <Stack.Protected guard={!verified}>
        <Stack.Screen name="verifikasi" />
      </Stack.Protected>
      <Stack.Screen name="atur-sandi" />
      <Stack.Screen name="email-terverifikasi" />
    </Stack>
  );
}
