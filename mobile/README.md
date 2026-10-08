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

## Server

Aplikasi memakai API di `../server` (lihat `server/README.md`): jalankan `npm run dev` di sana dulu.
Alamat server ditentukan otomatis dari komputer yang menjalankan Metro (`http://<ip-komputer>:4000`);
atur `EXPO_PUBLIC_API_URL` untuk server lain. Sesi login (Better Auth) disimpan di SecureStore.

Skenario uji:

- Masuk dengan **budi.santoso@contoh.id** / **rahasia123** (berisi riwayat 20 hari kerja).
- Daftar akun baru → kode verifikasi 6 digit muncul di terminal server (tanpa SMTP).
- Lupa kata sandi → tautan reset muncul di terminal server; buka dari HP/browser yang sama.
- Absen masuk lalu keluar: status terlambat dihitung server (batas 08.00 WIB); absen ketiga ditolak.
- Percobaan masuk dibatasi 5 kali/menit — pesan "Terlalu banyak percobaan" itu disengaja.

Foto selfie contoh berupa ilustrasi kartun, bukan foto orang.

## Struktur

| Folder | Isi |
| --- | --- |
| `src/app` | Layar (Expo Router): `(tabs)` Beranda & Riwayat, `(auth)` masuk/daftar/verifikasi/sandi, `absen`, `detail/[id]`, `profil`, `ganti-sandi` |
| `src/components` | Komponen UI (`ui/`), form, dan komponen per layar |
| `src/services` | Akses API: absen, autentikasi (Better Auth), profil |
| `src/lib/api*.ts`, `src/lib/auth-client.ts` | Alamat server, `apiFetch`, klien Better Auth |
| `src/hooks`, `src/lib` | Hook data/sesi dan utilitas (tanggal, status absen, pengingat, banner) |
| `src/constants/theme.ts` | Token desain (warna, font Inter/IBM Plex Serif, jarak, radius) |
