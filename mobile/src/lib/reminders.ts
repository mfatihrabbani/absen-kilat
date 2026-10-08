import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { NotificationPrefs } from '@/types/profile';

/** Senin–Jumat dalam format expo-notifications (1 = Minggu). */
const WORKDAYS = [2, 3, 4, 5, 6];
const FRIDAY = 6;
const CHANNEL_ID = 'pengingat';

// Tampilkan pengingat juga saat aplikasi sedang terbuka.
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

async function weekly(weekday: number, hour: number, minute: number, title: string, body: string) {
  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday,
      hour,
      minute,
      channelId: CHANNEL_ID,
    },
  });
}

/**
 * Jadwalkan ulang pengingat lokal sesuai preferensi: absen masuk 07.45 dan absen
 * keluar 17.00 di hari kerja, ringkasan mingguan Jumat 16.00.
 * Mengembalikan `false` bila izin notifikasi ditolak (pengingat tidak aktif).
 */
export async function syncReminders(prefs: NotificationPrefs): Promise<boolean> {
  if (Platform.OS === 'web') return true;
  await Notifications.cancelAllScheduledNotificationsAsync();
  const wantsAny = prefs.reminderIn || prefs.reminderOut || prefs.weekly;
  if (!wantsAny) return true;

  const perm = await Notifications.requestPermissionsAsync();
  if (!perm.granted) return false;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Pengingat absen',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const jobs: Promise<void>[] = [];
  for (const day of WORKDAYS) {
    if (prefs.reminderIn) {
      jobs.push(weekly(day, 7, 45, 'Waktunya absen masuk', 'Batas absen masuk pukul 08.00. Ambil selfie sekarang.'));
    }
    if (prefs.reminderOut) {
      jobs.push(weekly(day, 17, 0, 'Waktunya absen keluar', 'Jam kerja selesai. Jangan lupa absen keluar.'));
    }
  }
  if (prefs.weekly) {
    jobs.push(weekly(FRIDAY, 16, 0, 'Ringkasan minggu ini', 'Lihat rekap kehadiranmu minggu ini di Riwayat.'));
  }
  await Promise.all(jobs);
  return true;
}

/** Batalkan semua pengingat (mis. saat keluar dari akun). */
export async function clearReminders(): Promise<void> {
  if (Platform.OS === 'web') return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}
