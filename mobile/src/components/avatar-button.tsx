import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';

import { IconButton } from '@/components/ui/icon-button';
import { AppText } from '@/components/ui/text';
import { initialsOf, useCurrentUser } from '@/hooks/use-current-user';

/** Avatar bulat di kanan atas — inisial atau foto profil — membuka Profil Saya. */
export function AvatarButton() {
  const router = useRouter();
  const user = useCurrentUser();
  return (
    <IconButton
      accessibilityLabel={`Buka Profil Saya, ${user.name}`}
      onPress={() => router.push('/profil')}>
      {user.image ? (
        <Image source={user.image} style={StyleSheet.absoluteFill} contentFit="cover" />
      ) : (
        <AppText variant="label">{initialsOf(user.name)}</AppText>
      )}
    </IconButton>
  );
}
