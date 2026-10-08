import { randomUUID } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';

import multer from 'multer';

import { env } from '../env';
import { HttpError } from './http-error';

const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
};

/** Multer untuk satu foto di memori (hanya gambar, maks. `maxMb`) sebelum ditulis ke disk. */
function imageUpload(maxMb: number) {
  return multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: maxMb * 1024 * 1024, files: 1 },
    fileFilter: (_req, file, cb) => {
      if (EXT_BY_MIME[file.mimetype]) cb(null, true);
      else cb(new HttpError(415, 'Foto harus berupa gambar JPEG, PNG, WEBP, atau HEIC'));
    },
  });
}

/** Unggahan foto selfie absen (`ATTENDANCE_PHOTO_MAX_MB`, bawaan 8 MB). */
export const photoUpload = imageUpload(env.attendancePhotoMaxMb);

/** Unggahan foto profil (`AVATAR_MAX_MB`, bawaan 5 MB). */
export const avatarUpload = imageUpload(env.avatarMaxMb);

/** Subfolder foto profil di dalam `UPLOAD_DIR` (publik); folder lain = foto absen per pengguna (privat). */
export const AVATAR_DIR = 'avatars';

/** Pastikan folder upload ada saat server mulai. */
export async function ensureUploadDirs() {
  await mkdir(path.join(env.uploadDir, AVATAR_DIR), { recursive: true });
}

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
