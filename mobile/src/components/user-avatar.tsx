import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from '@/components/ui/text';
import { Colors, Fonts } from '@/constants/theme';
import { initialsOf } from '@/hooks/use-current-user';

type Props = {
  name: string;
  image: string | null;
  /** Diameter dalam piksel. */
  size: number;
  /** Huruf serif besar (profil) atau label kecil (tombol header). */
  variant?: 'display' | 'compact';
  style?: StyleProp<ViewStyle>;
};

/**
 * Foto profil bulat. Tanpa foto (atau bila foto gagal dimuat) tampil avatar
 * bawaan berupa inisial nama di atas latar krem.
 */
export function UserAvatar({ name, image, size, variant = 'display', style }: Props) {
  const [failed, setFailed] = useState<string | null>(null);
  const showImage = !!image && failed !== image;
  const fontSize = variant === 'display' ? Math.round(size * 0.375) : 12;

  return (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2 },
        variant === 'compact' && styles.compact,
        style,
      ]}
      accessible
      accessibilityRole="image"
      accessibilityLabel={showImage ? `Foto profil ${name}` : `Avatar ${initialsOf(name)}`}>
      {showImage ? (
        <Image
          source={image}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={150}
          onError={() => setFailed(image)}
        />
      ) : (
        <AppText
          numeric
          style={
            variant === 'display'
              ? { fontFamily: Fonts.editorial, fontSize, lineHeight: fontSize * 1.15, letterSpacing: -1 }
              : { fontFamily: Fonts.semibold, fontSize, lineHeight: 16 }
          }>
          {initialsOf(name) || '?'}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    overflow: 'hidden',
    backgroundColor: Colors.surfaceMuted,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compact: { backgroundColor: Colors.surface, borderWidth: 0 },
});
