import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ProfileHeader } from '@/components/profil/profile-header';
import { GroupLabel, ProfileRow, SwitchRow } from '@/components/profil/rows';
import {
  CameraIcon,
  EnvelopeSimpleIcon,
  ImagesIcon,
  InfoIcon,
  LockKeyIcon,
  SignOutIcon,
  TrashIcon,
  UserIcon,
  WarningCircleIcon,
} from '@/components/icons';
import { ActionSheet } from '@/components/ui/action-sheet';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ListGroup } from '@/components/ui/list';
import { PushedScreen } from '@/components/ui/pushed-screen';
import { Colors, Spacing } from '@/constants/theme';
import { useProfile } from '@/hooks/use-profile';
import { setFlash } from '@/lib/flash';
import { pickProfileImage } from '@/lib/pick-image';
import { updateProfilePhoto } from '@/services/profile';
import type { NotificationPrefs } from '@/types/profile';

const NOTIFICATIONS: { key: keyof NotificationPrefs; title: string; subtitle: string }[] = [
  { key: 'reminderIn', title: 'Pengingat absen masuk', subtitle: 'Hari kerja, pukul 07.45' },
  { key: 'reminderOut', title: 'Pengingat absen keluar', subtitle: 'Hari kerja, pukul 17.00' },
  { key: 'weekly', title: 'Ringkasan mingguan', subtitle: 'Setiap Jumat sore' },
];

/** Profil Saya: identitas, pengaturan akun & notifikasi, dan keluar. */
export default function ProfilScreen() {
  const { profile, setProfile, error, reload } = useProfile();
  const [photoSheet, setPhotoSheet] = useState(false);
  const [savingPhoto, setSavingPhoto] = useState(false);

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

  const changePhoto = async (source: 'camera' | 'gallery' | 'remove') => {
    const picked = source === 'remove' ? null : await pickProfileImage(source);
    if (source !== 'remove' && !picked) return;
    const previous = profile.image;
    // Tampilkan foto baru (atau inisial) seketika; kembalikan bila gagal disimpan.
    setProfile((p) => (p ? { ...p, image: picked?.uri ?? null } : p));
    setSavingPhoto(true);
    try {
      const image = await updateProfilePhoto(picked);
      setProfile((p) => (p ? { ...p, image } : p));
      setFlash(
        picked
          ? {
              title: 'Foto profil diperbarui',
              body: source === 'camera' ? 'Foto dari kamera disimpan.' : 'Foto dari galeri disimpan.',
            }
          : {
              title: 'Foto profil dihapus',
              body: 'Inisial namamu dipakai sebagai avatar.',
              icon: InfoIcon,
            },
      );
    } catch (e) {
      setProfile((p) => (p ? { ...p, image: previous } : p));
      setFlash({
        title: 'Gagal menyimpan foto',
        body: e instanceof Error ? e.message : 'Coba lagi.',
        icon: WarningCircleIcon,
      });
    } finally {
      setSavingPhoto(false);
    }
  };

  const setPref = (key: keyof NotificationPrefs, value: boolean) =>
    setProfile({ ...profile, notificationPrefs: { ...profile.notificationPrefs, [key]: value } });

  return (
    <PushedScreen title="Profil Saya" back={back}>
      <ProfileHeader
        profile={profile}
        busy={savingPhoto}
        onChangePhoto={() => setPhotoSheet(true)}
      />

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

      {photoSheet && (
        <ActionSheet
          onClose={() => setPhotoSheet(false)}
          title="Ubah foto profil"
          message="Foto ini tampil di aplikasi, bukan sebagai bukti absen."
          options={[
            { label: 'Ambil foto', icon: CameraIcon, onPress: () => changePhoto('camera') },
            { label: 'Pilih dari galeri', icon: ImagesIcon, onPress: () => changePhoto('gallery') },
            ...(profile.image
              ? [{ label: 'Hapus foto', icon: TrashIcon, danger: true, onPress: () => changePhoto('remove') }]
              : []),
          ]}
        />
      )}
    </PushedScreen>
  );
}

const styles = StyleSheet.create({
  loader: { marginTop: Spacing.sixteen },
});
