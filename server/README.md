# Absen Kilat — Server

API Express.js untuk aplikasi Absen Kilat. Data disimpan di SQLite (libsql) lewat Drizzle ORM.

## Menjalankan

```bash
cd server
npm install
cp .env.example .env      # opsional, nilai bawaan sudah cukup untuk lokal
npm run db:setup          # buat tabel (migrasi) + isi data contoh
npm run dev               # http://localhost:3000 (auto-reload)
```

Cek: `curl http://localhost:3000/api/health` → `{"ok":true}`.

Akun contoh dari `db:seed`: **rina.kartika@contoh.id** / **rahasia123**.

## Skrip

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Jalankan server dengan auto-reload |
| `npm start` | Jalankan server |
| `npm run db:generate` | Buat file migrasi baru dari `src/db/schema.ts` |
| `npm run db:migrate` | Terapkan migrasi ke database |
| `npm run db:seed` | Isi pengguna & riwayat absen contoh |
| `npm run db:setup` | `db:migrate` + `db:seed` |
| `npm run db:studio` | Buka Drizzle Studio |
| `npm run typecheck` | Pemeriksaan TypeScript |

## Variabel lingkungan

| Nama | Bawaan | Keterangan |
| --- | --- | --- |
| `PORT` | `3000` | Port HTTP |
| `DATABASE_URL` | `file:./data/absen-kilat.db` | Lokasi database SQLite |
| `UPLOAD_DIR` | `./uploads` | Folder foto absen |
| `BETTER_AUTH_URL` | `http://localhost:PORT` | URL publik server untuk Better Auth |
| `BETTER_AUTH_SECRET` | secret pengembangan | **Wajib** diisi di produksi |
| `TRUSTED_ORIGINS` | `absenkilat://,exp://,http://localhost:8081` | Asal yang dipercaya untuk request auth |

## Autentikasi

Memakai [Better Auth](https://better-auth.com) (email & kata sandi) di `/api/auth/*`,
mis. `POST /api/auth/sign-up/email`, `POST /api/auth/sign-in/email`, `POST /api/auth/sign-out`,
`GET /api/auth/get-session`. Aplikasi mobile memakai `@better-auth/expo` sehingga cookie sesi
disimpan di secure storage. Semua endpoint `/api/attendance` wajib login (401 bila tidak).

## API

Semua tanggal memakai zona waktu kantor (WIB). Error dikirim sebagai `{ "error": { "message": "..." } }`.

| Metode & path | Keterangan |
| --- | --- |
| `GET /api/health` | Cek server hidup |
| `GET /api/attendance?date=YYYY-MM-DD` | Absen pada satu tanggal |
| `GET /api/attendance?from=YYYY-MM-DD&to=YYYY-MM-DD` | Absen pada rentang tanggal (maks. 366 hari) |
| `GET /api/attendance/today` | Status absen hari ini: `in`, `out`, `next` (`in`/`out`/`done`), jam kerja, waktu server |
| `GET /api/attendance/:id` | Detail satu absen |
| `POST /api/attendance` | Catat absen (multipart: `photo`, `type` = `in`/`out`, `latitude`, `longitude`, `accuracy`). Waktu & status (`on_time`/`late`, batas 08.00) ditentukan server. Satu absen masuk & satu absen keluar per hari; keluar hanya setelah masuk (409 bila melanggar). |
