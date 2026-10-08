import { Stack } from 'expo-router';

import { Colors } from '@/constants/theme';
import { useSession } from '@/lib/session';

/**
 * Navigasi autentikasi. Masuk/daftar/verifikasi/lupa sandi hanya untuk tamu;
 * atur sandi & konfirmasi verifikasi tetap bisa dibuka dari tautan email kapan pun.
 */
export default function AuthLayout() {
  const signedIn = useSession().status === 'signed-in';
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.canvas } }}>
      <Stack.Protected guard={!signedIn}>
        <Stack.Screen name="masuk" />
        <Stack.Screen name="daftar" />
        <Stack.Screen name="verifikasi" />
        <Stack.Screen name="lupa-sandi" />
      </Stack.Protected>
      <Stack.Screen name="atur-sandi" />
      <Stack.Screen name="email-terverifikasi" />
    </Stack>
  );
}
