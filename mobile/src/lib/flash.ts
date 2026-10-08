import type { Icon } from '@/components/icons';

/**
 * Pesan "flash" lintas layar: disetel sebelum navigasi (mis. sesudah absen
 * berhasil) lalu ditampilkan sekali sebagai banner oleh layar tujuan.
 */
export type FlashMessage = { title: string; body?: string; icon?: Icon };

let pending: FlashMessage | null = null;

export function setFlash(message: FlashMessage) {
  pending = message;
}

/** Ambil pesan yang tertunda dan kosongkan antreannya. */
export function consumeFlash(): FlashMessage | null {
  const m = pending;
  pending = null;
  return m;
}
