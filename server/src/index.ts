import { createApp } from './app';
import { env } from './env';

createApp().listen(env.port, '0.0.0.0', () => {
  console.log(`Absen Kilat API berjalan di http://localhost:${env.port}`);
});
