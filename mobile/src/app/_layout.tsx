import { IBMPlexSerif_400Regular } from '@expo-google-fonts/ibm-plex-serif';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  useFonts,
} from '@expo-google-fonts/inter';
import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { Colors } from '@/constants/theme';
import { useSession } from '@/lib/session';

SplashScreen.preventAutoHideAsync();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.text,
    background: Colors.canvas,
    card: Colors.canvas,
    text: Colors.text,
    border: Colors.border,
  },
};

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    IBMPlexSerif_400Regular,
  });
  const session = useSession();
  const ready = (fontsLoaded || !!fontError) && session.status !== 'loading';
  const signedIn = session.status === 'signed-in';

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={navTheme}>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.canvas } }}>
          {/* Layar aplikasi hanya untuk pengguna yang sudah masuk. */}
          <Stack.Protected guard={signedIn}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="detail/[id]" />
            <Stack.Screen
              name="absen"
              options={{
                presentation: 'fullScreenModal',
                animation: 'slide_from_bottom',
                contentStyle: { backgroundColor: '#11120f' },
              }}
            />
          </Stack.Protected>
          {/* Layar autentikasi; penjagaan per layar ada di `(auth)/_layout`. */}
          <Stack.Screen name="(auth)" />
        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
