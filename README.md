# Absen Kilat

Aplikasi absensi pribadi di HP: absen masuk/keluar dengan **selfie + lokasi GPS**, riwayat kehadiran
dengan filter tanggal dan status tepat waktu/terlambat, autentikasi email, dan profil.

| Folder | Isi | Stack |
| --- | --- | --- |
| [`mobile/`](mobile) | Aplikasi iOS/Android | Expo (React Native), Expo Router, Better Auth client |
| [`server/`](server) | REST API | Express.js, Better Auth, SQLite + Drizzle ORM |

## Coba cepat

Butuh Node.js 20+ dan aplikasi **Expo Go** di HP. HP dan komputer harus **satu Wi-Fi**.

**1. Jalankan server** (terminal pertama):

```bash
cd server
npm install
npm run db:setup   # buat tabel + data contoh
npm run dev        # http://localhost:4000
```

**2. Jalankan aplikasi** (terminal kedua):

```bash
cd mobile
npm install
npx expo start
```

Pindai QR code dengan Expo Go (Android) atau Kamera (iOS), atau tekan `w` untuk membuka di browser.
Aplikasi otomatis memakai server di komputer yang sama (port 4000).

**3. Masuk** dengan akun contoh **budi.santoso@contoh.id** / **rahasia123** — sudah berisi riwayat
absen 20 hari kerja. Atau daftar akun baru: kode verifikasi email muncul di **terminal server**
(tanpa SMTP, email dicetak ke konsol).

> Semua foto contoh adalah ilustrasi kartun (DiceBear), bukan foto orang sungguhan.

### Kalau aplikasi tidak bisa terhubung ke server

- Pastikan server berjalan dan HP satu jaringan dengan komputer.
- Windows: izinkan Node.js di firewall untuk jaringan **Private** (atau buka port 4000).
- Server di alamat lain: jalankan aplikasi dengan `EXPO_PUBLIC_API_URL=http://<ip-server>:4000 npx expo start`.

## Dokumen

- [`server/README.md`](server/README.md) — endpoint API, alur autentikasi, variabel lingkungan.
- [`mobile/README.md`](mobile/README.md) — struktur aplikasi dan skenario uji.
- [`absen-kilat-PRD.md`](absen-kilat-PRD.md) — kebutuhan produk, alur pengguna, dan skema data.
