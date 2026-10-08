import { randomUUID } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';

import multer from 'multer';

import { env } from '../env';
import { HttpError } from './http-error';

const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
};

/** Multer: simpan unggahan foto di memori (maks. 8 MB, hanya gambar) sebelum ditulis ke disk. */
export const photoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_PHOTO_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (EXT_BY_MIME[file.mimetype]) cb(null, true);
    else cb(new HttpError(415, 'Foto harus berupa gambar JPEG, PNG, WEBP, atau HEIC'));
  },
});

/**
 * Tulis foto ke `UPLOAD_DIR/<folder>/<uuid>.<ext>` dan kembalikan path relatifnya
 * (dipakai sebagai `photo_path` dan URL `/uploads/...`).
 */
export async function savePhoto(folder: string, file: Express.Multer.File): Promise<string> {
  const ext = EXT_BY_MIME[file.mimetype] ?? 'jpg';
  const rel = path.posix.join(folder, `${randomUUID()}.${ext}`);
  const abs = path.join(env.uploadDir, rel);
  await mkdir(path.dirname(abs), { recursive: true });
  await writeFile(abs, file.buffer);
  return rel;
}

/** Hapus file upload (abaikan bila sudah tidak ada). */
export async function removePhoto(rel: string) {
  if (/^https?:\/\//.test(rel)) return;
  await unlink(path.join(env.uploadDir, rel)).catch(() => {});
}
