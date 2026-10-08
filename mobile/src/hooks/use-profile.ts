import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { getProfile } from '@/services/profile';
import type { Profile } from '@/types/profile';

/** Profil pengguna; dimuat ulang saat layar mendapat fokus. `setProfile` untuk pembaruan optimistis. */
export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setProfile(await getProfile());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memuat profil');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return { profile, setProfile, error, reload: load };
}
