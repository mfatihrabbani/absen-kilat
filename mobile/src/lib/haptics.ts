import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/** Getaran singkat tanda berhasil; diabaikan di web atau bila perangkat tidak mendukung. */
export function hapticSuccess() {
  if (Platform.OS === 'web') return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}

/** Getaran ringan untuk aksi seperti menekan rana. */
export function hapticTap() {
  if (Platform.OS === 'web') return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}
