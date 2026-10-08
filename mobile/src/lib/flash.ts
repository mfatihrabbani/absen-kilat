import type { Icon } from '@/components/icons';

/**
 * Pesan "flash" untuk banner atas: disetel sebelum navigasi (mis. sesudah absen
 * berhasil) atau saat layar aktif, lalu ditampilkan sekali oleh layar yang fokus.
 */
export type FlashMessage = { title: string; body?: string; icon?: Icon };

let pending: FlashMessage | null = null;
const listeners = new Set<() => void>();

export function setFlash(message: FlashMessage) {
  pending = message;
  listeners.forEach((l) => l());
}

/** Ambil pesan yang tertunda dan kosongkan antreannya. */
export function consumeFlash(): FlashMessage | null {
  const m = pending;
  pending = null;
  return m;
}

/** Dengarkan pesan baru (untuk banner di layar yang sedang aktif). */
export function onFlash(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
