import type { Icon } from '@/components/icons';

/**
 * Pesan "flash" untuk banner atas, ditampilkan sekali oleh layar yang fokus.
 * - `setFlash`: tampil di layar berikutnya yang mendapat fokus (mis. sesudah absen lalu kembali).
 * - `showFlash`: tampil seketika di layar yang sedang aktif.
 */
export type FlashMessage = {
  title: string;
  body?: string;
  icon?: Icon;
  /** `error` untuk kegagalan: ikon merah dan diumumkan segera ke pembaca layar. */
  tone?: 'success' | 'error';
};

let pending: FlashMessage | null = null;
const listeners = new Set<() => void>();

export function setFlash(message: FlashMessage) {
  pending = message;
}

export function showFlash(message: FlashMessage) {
  pending = message;
  listeners.forEach((l) => l());
}

/** Ambil pesan yang tertunda dan kosongkan antreannya. */
export function consumeFlash(): FlashMessage | null {
  const m = pending;
  pending = null;
  return m;
}

/** Dengarkan `showFlash` (untuk banner di layar yang sedang aktif). */
export function onFlash(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
