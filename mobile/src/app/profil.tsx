import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ProfileHeader } from '@/components/profil/profile-header';
import { GroupLabel, ProfileRow, SwitchRow } from '@/components/profil/rows';
import { EnvelopeSimpleIcon, LockKeyIcon, SignOutIcon, UserIcon, WarningCircleIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ListGroup } from '@/components/ui/list';
import { PushedScreen } from '@/components/ui/pushed-screen';
import { Colors, Spacing } from '@/constants/theme';
import { useProfile } from '@/hooks/use-profile';
import type { NotificationPrefs } from '@/types/profile';

const NOTIFICATIONS: { key: keyof NotificationPrefs; title: string; subtitle: string }[] = [
  { key: 'reminderIn', title: 'Pengingat absen masuk', subtitle: 'Hari kerja, pukul 07.45' },
  { key: 'reminderOut', title: 'Pengingat absen keluar', subtitle: 'Hari kerja, pukul 17.00' },
  { key: 'weekly', title: 'Ringkasan mingguan', subtitle: 'Setiap Jumat sore' },
];

/** Profil Saya: identitas, pengaturan akun & notifikasi, dan keluar. */
export default function ProfilScreen() {
  const { profile, setProfile, error, reload } = useProfile();

  const back = { label: 'Absen', fallback: '/' as const };

  if (!profile) {
    return (
      <PushedScreen title="Profil Saya" back={back}>
        {error ? (
          <EmptyState
            icon={WarningCircleIcon}
            title="Gagal memuat profil"
            body={error}
            action={<Button label="Coba lagi" onPress={reload} />}
          />
        ) : (
          <ActivityIndicator style={styles.loader} color={Colors.accent} />
        )}
      </PushedScreen>
    );
  }

  const setPref = (key: keyof NotificationPrefs, value: boolean) =>
    setProfile({ ...profile, notificationPrefs: { ...profile.notificationPrefs, [key]: value } });

  return (
    <PushedScreen title="Profil Saya" back={back}>
      <ProfileHeader profile={profile} onChangePhoto={() => {}} />

      <View>
        <GroupLabel>Akun</GroupLabel>
        <ListGroup>
          <ProfileRow icon={UserIcon} title="Nama" subtitle={profile.name} onPress={() => {}} />
          <ProfileRow icon={EnvelopeSimpleIcon} title="Email" subtitle={profile.email} />
          <ProfileRow icon={LockKeyIcon} title="Ganti kata sandi" onPress={() => {}} />
        </ListGroup>
      </View>

      <View>
        <GroupLabel>Notifikasi</GroupLabel>
        <ListGroup>
          {NOTIFICATIONS.map((n) => (
            <SwitchRow
              key={n.key}
              title={n.title}
              subtitle={n.subtitle}
              value={profile.notificationPrefs[n.key]}
              onValueChange={(v) => setPref(n.key, v)}
            />
          ))}
        </ListGroup>
      </View>

      <ListGroup>
        <ProfileRow icon={SignOutIcon} title="Keluar" danger onPress={() => {}} />
      </ListGroup>
    </PushedScreen>
  );
}

const styles = StyleSheet.create({
  loader: { marginTop: Spacing.sixteen },
});
