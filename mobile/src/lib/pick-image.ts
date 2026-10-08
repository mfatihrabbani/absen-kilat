import * as ImagePicker from 'expo-image-picker';
import { Alert, Linking } from 'react-native';

export type PickedImage = { uri: string; mimeType: string; fileName: string };

const OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: 'images',
  allowsEditing: true,
  aspect: [1, 1],
  quality: 0.7,
};

/** Beri tahu pengguna izin kamera ditolak, dengan pintasan ke Pengaturan. */
function permissionDenied() {
  Alert.alert(
    'Izin kamera ditolak',
    'Izinkan akses kamera di Pengaturan untuk mengambil foto profil.',
    [
      { text: 'Batal', style: 'cancel' },
      { text: 'Buka Pengaturan', onPress: () => Linking.openSettings() },
    ],
  );
}

/**
 * Ambil foto persegi dari kamera atau galeri (dengan potong/crop bawaan).
 * Mengembalikan `null` bila dibatalkan atau izin ditolak.
 */
export async function pickProfileImage(source: 'camera' | 'gallery'): Promise<PickedImage | null> {
  if (source === 'camera') {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      permissionDenied();
      return null;
    }
  }
  const result =
    source === 'camera'
      ? await ImagePicker.launchCameraAsync({ ...OPTIONS, cameraType: ImagePicker.CameraType.front })
      : await ImagePicker.launchImageLibraryAsync(OPTIONS);
  const asset = result.canceled ? null : result.assets[0];
  if (!asset) return null;
  return {
    uri: asset.uri,
    mimeType: asset.mimeType ?? 'image/jpeg',
    fileName: asset.fileName ?? `avatar.${asset.mimeType === 'image/png' ? 'png' : 'jpg'}`,
  };
}
