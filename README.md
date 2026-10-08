# Absen Kilat

Aplikasi absensi pribadi di HP: absen masuk/keluar dengan **selfie + lokasi GPS**, riwayat kehadiran
dengan filter tanggal dan status tepat waktu/terlambat, autentikasi email, dan profil.

| Folder | Isi | Stack |
| --- | --- | --- |
| [`mobile/`](mobile) | Aplikasi iOS/Android | Expo (React Native), Expo Router |
| [`server/`](server) | REST API | Express.js, Better Auth, SQLite + Drizzle ORM |

## Coba cepat (aplikasi mobile)

Butuh Node.js 20+ dan aplikasi **Expo Go** di HP (satu Wi-Fi dengan komputer).

```bash
cd mobile
npm install
npx expo start
```

Pindai QR code dengan Expo Go (Android) atau Kamera (iOS), atau tekan `w` untuk membuka di browser.

Masuk dengan akun contoh **budi.santoso@contoh.id** / **rahasia123** (kata sandi apa pun ≥ 8
karakter juga bisa). Saat ini aplikasi memakai **data tiruan** — belum tersambung ke server — jadi
data kembali seperti semula setiap aplikasi dimuat ulang. Skenario uji lainnya ada di
[`mobile/README.md`](mobile/README.md).

> Semua foto contoh adalah ilustrasi kartun (DiceBear), bukan foto orang sungguhan.

## Server API

```bash
cd server
npm install
npm run db:setup   # buat tabel + data contoh
npm run dev        # http://localhost:3000
```

Daftar endpoint, alur autentikasi, dan variabel lingkungan ada di [`server/README.md`](server/README.md).
Tanpa konfigurasi SMTP, email (kode verifikasi, tautan reset sandi) dicetak ke konsol server.

## Dokumen

- [`absen-kilat-PRD.md`](absen-kilat-PRD.md) — kebutuhan produk, alur pengguna, dan skema data.
