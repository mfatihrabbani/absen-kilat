# Absen Kilat — Aplikasi Mobile

Aplikasi absensi pribadi (Expo + React Native, Expo Router): absen masuk/keluar dengan selfie dan
lokasi GPS, riwayat dengan filter tanggal, autentikasi, dan profil. Tampilan mengikuti desain
"Sunlit Ledger" dari DesainPakeAI.

## Menjalankan

```bash
cd mobile
npm install
npx expo start          # buka di Expo Go / emulator, atau tekan `w` untuk web
```

Pemeriksaan sebelum commit:

```bash
npx tsc --noEmit
npx expo lint
```

> Kamera (`expo-camera`), lokasi (`expo-location`), pemilih gambar, dan pengingat
> (`expo-notifications`) butuh perangkat/emulator; di web sebagian fitur terbatas.

## Data

Saat ini layanan di `src/services/*` masih memakai **data tiruan** (`src/mocks`), dengan kontrak
yang sama dengan API server di `../server` (lihat `server/README.md`). Akun tiruan:

- Masuk dengan email apa pun + kata sandi ≥ 8 karakter; `salah12345` menampilkan pesan gagal.
- Email berawalan `belum…` dianggap belum terverifikasi; kode `000000` ditolak.
- Daftar dengan `dipakai@contoh.com` menampilkan "email sudah terdaftar".

## Struktur

| Folder | Isi |
| --- | --- |
| `src/app` | Layar (Expo Router): `(tabs)` Beranda & Riwayat, `(auth)` masuk/daftar/verifikasi/sandi, `absen`, `detail/[id]`, `profil`, `ganti-sandi` |
| `src/components` | Komponen UI (`ui/`), form, dan komponen per layar |
| `src/services` | Akses data (absen, autentikasi, profil) |
| `src/hooks`, `src/lib` | Hook data/sesi dan utilitas (tanggal, status absen, pengingat, banner) |
| `src/constants/theme.ts` | Token desain (warna, font Inter/IBM Plex Serif, jarak, radius) |
