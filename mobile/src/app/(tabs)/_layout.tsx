import { Tabs } from 'expo-router/js-tabs';
import { useEffect } from 'react';

import { CalendarBlankIcon, FingerprintIcon } from '@/components/icons';
import { Colors, Fonts } from '@/constants/theme';
import { syncReminders } from '@/lib/reminders';
import { getProfile } from '@/services/profile';

/** Tab bar bawah (`mobile-tabs` layout): Absen (beranda) dan Riwayat. */
export default function TabsLayout() {
  // Jadwalkan pengingat sesuai preferensi akun setiap kali aplikasi dibuka.
  useEffect(() => {
    getProfile()
      .then((p) => syncReminders(p.notificationPrefs))
      .catch(() => {});
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.text,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          backgroundColor: Colors.surfaceTranslucent,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: { fontFamily: Fonts.medium, fontSize: 10, letterSpacing: 0.1 },
        sceneStyle: { backgroundColor: Colors.canvas },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Absen',
          tabBarAccessibilityLabel: 'Absen, beranda',
          tabBarIcon: ({ focused }) => (
            <FingerprintIcon
              size={25}
              color={focused ? Colors.text : Colors.textMuted}
              weight={focused ? 'fill' : 'regular'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="riwayat"
        options={{
          title: 'Riwayat',
          tabBarIcon: ({ focused }) => (
            <CalendarBlankIcon
              size={25}
              color={focused ? Colors.text : Colors.textMuted}
              weight={focused ? 'fill' : 'regular'}
            />
          ),
        }}
      />
    </Tabs>
  );
}
