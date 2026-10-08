import { useRouter } from 'expo-router';

import { UserAvatar } from '@/components/user-avatar';
import { IconButton } from '@/components/ui/icon-button';
import { useCurrentUser } from '@/hooks/use-current-user';

/** Avatar bulat di kanan atas — foto profil atau inisial — membuka Profil Saya. */
export function AvatarButton() {
  const router = useRouter();
  const user = useCurrentUser();
  return (
    <IconButton
      accessibilityLabel={`Buka Profil Saya, ${user.name}`}
      onPress={() => router.push('/profil')}>
      <UserAvatar name={user.name} image={user.image} size={36} variant="compact" />
    </IconButton>
  );
}
