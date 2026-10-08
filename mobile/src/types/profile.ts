/** Preferensi notifikasi pengguna (disimpan server sebagai JSON di `notification_prefs`). */
export type NotificationPrefs = {
  /** Pengingat absen masuk, hari kerja pukul 07.45. */
  reminderIn: boolean;
  /** Pengingat absen keluar, hari kerja pukul 17.00. */
  reminderOut: boolean;
  /** Ringkasan mingguan setiap Jumat sore. */
  weekly: boolean;
};

export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  reminderIn: true,
  reminderOut: true,
  weekly: false,
};

/** Profil pengguna untuk layar Profil Saya. */
export type Profile = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  notificationPrefs: NotificationPrefs;
};
