import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { TextField } from '@/components/form/text-field';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { AppText } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';

type Props = {
  initialName: string;
  onClose: () => void;
  /** Simpan nama (sudah dirapikan); lempar error untuk menampilkan pesan gagal. */
  onSave: (name: string) => Promise<void>;
};

/** Bottom sheet "Ubah nama" dengan validasi nama wajib diisi. */
export function NameSheet({ initialName, onClose, onSave }: Props) {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <BottomSheet visible onClose={onClose} accessibilityLabel="Ubah nama" dismissible={!busy}>
      {(close) => {
        const save = async () => {
          const value = name.trim().replace(/\s+/g, ' ');
          if (!value) {
            setError('Nama wajib diisi.');
            return;
          }
          if (value === initialName) {
            close();
            return;
          }
          setBusy(true);
          try {
            await onSave(value);
            close();
          } catch (e) {
            setError(e instanceof Error ? e.message : 'Gagal menyimpan nama. Coba lagi.');
            setBusy(false);
          }
        };

        return (
          <>
            <View>
              <AppText variant="headingSm" accessibilityRole="header">
                Ubah nama
              </AppText>
              <AppText variant="bodySm" color="textMuted" style={styles.sub}>
                Nama tampil di Beranda dan di catatan absen.
              </AppText>
            </View>
            <TextField
              label="Nama lengkap"
              value={name}
              onChangeText={(v) => {
                setName(v);
                if (error && v.trim()) setError(null);
              }}
              autoFocus
              autoComplete="name"
              textContentType="name"
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={save}
              error={error}
            />
            <View style={styles.actions}>
              <Button label="Batal" style={styles.flex1} disabled={busy} onPress={() => close()} />
              <Button
                label="Simpan"
                variant="primary"
                style={styles.flex16}
                busy={busy}
                busyLabel="Menyimpan…"
                onPress={save}
              />
            </View>
          </>
        );
      }}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sub: { marginTop: Spacing.one },
  actions: { flexDirection: 'row', gap: Spacing.two },
  flex1: { flex: 1 },
  flex16: { flex: 1.6 },
});
