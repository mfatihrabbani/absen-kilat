import { createApp } from './app';
import { env } from './env';
import { checkMailer } from './lib/mailer';
import { ensureUploadDirs } from './lib/uploads';

await ensureUploadDirs();

createApp().listen(env.port, '0.0.0.0', () => {
  console.log(`Absen Kilat API berjalan di http://localhost:${env.port}`);
  void checkMailer();
});
