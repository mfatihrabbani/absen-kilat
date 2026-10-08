import { createApp } from './app';
import { env } from './env';
import { checkMailer } from './lib/mailer';
import { ensureUploadDirs } from './lib/uploads';

await ensureUploadDirs();

// Tanpa host: dengarkan IPv4 & IPv6 sekaligus, sehingga `localhost` (::1 atau 127.0.0.1)
// dan IP LAN sama-sama mencapai server ini.
createApp().listen(env.port, () => {
  console.log(`Absen Kilat API berjalan di http://localhost:${env.port}`);
  void checkMailer();
});
