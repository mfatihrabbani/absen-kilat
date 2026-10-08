import { CameraView, useCameraPermissions, type CameraType } from 'expo-camera';
import { Image } from 'expo-image';
import { useImperativeHandle, useRef, useState, type Ref } from 'react';
import { ActivityIndicator, Linking, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import Svg, { Ellipse } from 'react-native-svg';

import { CameraIcon, UserIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { AppText } from '@/components/ui/text';
import { CameraColors } from '@/constants/camera-theme';
import { Spacing } from '@/constants/theme';

export type CapturedPhoto = { uri: string; width: number; height: number };

export type SelfieCameraHandle = {
  /** Ambil foto; mengembalikan `null` bila kamera belum siap atau gagal. */
  capture: () => Promise<CapturedPhoto | null>;
};

type Props = {
  ref?: Ref<SelfieCameraHandle>;
  facing: CameraType;
  flash: boolean;
  /** Foto yang sudah diambil — ditampilkan diam menggantikan pratinjau. */
  photo: CapturedPhoto | null;
  onReadyChange?: (ready: boolean) => void;
};

/** Bingkai oval putus-putus tempat wajah diposisikan; menjadi garis penuh setelah foto diambil. */
function FaceGuide({ captured }: { captured: boolean }) {
  return (
    <Svg style={StyleSheet.absoluteFill} viewBox="0 0 230 300">
      <Ellipse
        cx={115}
        cy={150}
        rx={114}
        ry={149}
        fill="none"
        stroke={captured ? CameraColors.ink : CameraColors.inkMuted}
        strokeWidth={2}
        strokeDasharray={captured ? undefined : '6 5'}
      />
    </Svg>
  );
}

/**
 * Pratinjau kamera selfie (expo-camera) dengan bingkai wajah, efek kilat saat
 * memotret, dan penanganan izin kamera.
 */
export function SelfieCamera({ ref, facing, flash, photo, onReadyChange }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const camera = useRef<CameraView>(null);
  const [ready, setReady] = useState(false);
  const flashOpacity = useSharedValue(0);

  useImperativeHandle(
    ref,
    () => ({
      capture: async () => {
        if (!camera.current || !ready) return null;
        flashOpacity.value = withSequence(
          withTiming(0.9, { duration: 30 }),
          withTiming(0, { duration: 260 }),
        );
        try {
          const pic = await camera.current.takePictureAsync({ quality: 0.6, shutterSound: false });
          return pic ? { uri: pic.uri, width: pic.width, height: pic.height } : null;
        } catch {
          return null;
        }
      },
    }),
    [ready, flashOpacity],
  );

  const flashStyle = useAnimatedStyle(() => ({ opacity: flashOpacity.value }));

  const setCameraReady = (value: boolean) => {
    setReady(value);
    onReadyChange?.(value);
  };

  if (!permission) {
    return <ActivityIndicator color={CameraColors.ink} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permission}>
        <View style={styles.permissionIcon}>
          <CameraIcon size={30} color={CameraColors.ink} />
        </View>
        <AppText variant="headingSm" style={styles.permissionTitle}>
          Izinkan akses kamera
        </AppText>
        <AppText variant="bodySm" style={styles.permissionBody}>
          Kamera depan dipakai untuk foto selfie sebagai bukti kehadiran.
        </AppText>
        <Button
          label={permission.canAskAgain ? 'Izinkan kamera' : 'Buka Pengaturan'}
          onPress={() => (permission.canAskAgain ? requestPermission() : Linking.openSettings())}
          style={styles.permissionBtn}
        />
      </View>
    );
  }

  return (
    <>
      <CameraView
        ref={camera}
        style={StyleSheet.absoluteFill}
        facing={facing}
        flash={flash ? 'screen' : 'off'}
        mirror={facing === 'front'}
        animateShutter={false}
        onCameraReady={() => setCameraReady(true)}
        onMountError={() => setCameraReady(false)}
      />
      {photo && (
        <Image source={photo.uri} style={StyleSheet.absoluteFill} contentFit="cover" />
      )}
      <View
        style={[styles.face, facing === 'back' && styles.faceDim]}
        pointerEvents="none"
        importantForAccessibility="no-hide-descendants">
        {!ready && !photo && (
          <UserIcon
            size={230}
            weight="fill"
            color={CameraColors.silhouette}
            style={styles.silhouette}
          />
        )}
        <FaceGuide captured={!!photo} />
      </View>
      <Animated.View pointerEvents="none" style={[styles.flash, flashStyle]} />
    </>
  );
}

const styles = StyleSheet.create({
  face: { width: 230, height: 300, alignItems: 'center', justifyContent: 'center' },
  faceDim: { opacity: 0.35 },
  silhouette: { transform: [{ translateY: 28 }] },
  flash: { ...StyleSheet.absoluteFill, backgroundColor: '#ffffff' },
  permission: { alignItems: 'center', gap: Spacing.three, paddingHorizontal: Spacing.six },
  permissionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionTitle: { color: CameraColors.ink, textAlign: 'center' },
  permissionBody: { color: 'rgba(246, 243, 238, 0.75)', textAlign: 'center', maxWidth: 300 },
  permissionBtn: { marginTop: Spacing.two },
});
