import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { CameraIcon, SealCheckIcon } from '@/components/icons';
import { Chip } from '@/components/ui/chip';
import { AppText } from '@/components/ui/text';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import { initialsOf } from '@/hooks/use-current-user';
import type { Profile } from '@/types/profile';

/** Identitas di atas profil: avatar 96px dengan tombol kamera, nama editorial, email & status verifikasi. */
export function ProfileHeader({
  profile,
  onChangePhoto,
}: {
  profile: Profile;
  onChangePhoto: () => void;
}) {
  return (
    <View style={styles.head}>
      <View style={styles.avatarWrap}>
        <View style={styles.avatar} importantForAccessibility="no-hide-descendants">
          {profile.image ? (
            <Image source={profile.image} style={StyleSheet.absoluteFill} contentFit="cover" />
          ) : (
            <AppText numeric style={styles.initials}>
              {initialsOf(profile.name)}
            </AppText>
          )}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ubah foto profil"
          hitSlop={6}
          onPress={onChangePhoto}
          style={({ pressed }) => [styles.avatarBtn, pressed && { transform: [{ scale: 0.95 }] }]}>
          <CameraIcon size={16} weight="fill" color={Colors.onPrimary} />
        </Pressable>
      </View>
      <AppText style={styles.name} accessibilityRole="header">
        {profile.name}
      </AppText>
      <View style={styles.email}>
        <AppText variant="bodySm" color="textMuted">
          {profile.email}
        </AppText>
        {profile.emailVerified && <Chip tone="ok" icon={SealCheckIcon} label="Terverifikasi" />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  head: { alignItems: 'center', gap: Spacing.two, paddingTop: Spacing.two },
  avatarWrap: { marginBottom: Spacing.two },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceMuted,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: { fontFamily: Fonts.editorial, fontSize: 36, lineHeight: 42, letterSpacing: -1 },
  avatarBtn: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: Colors.canvas,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontFamily: Fonts.editorial,
    fontSize: 30,
    lineHeight: 34,
    letterSpacing: -1,
    textAlign: 'center',
  },
  email: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
});
