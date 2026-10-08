import nodemailer, { type Transporter } from 'nodemailer';

import { env } from '../env';

export type Mail = { to: string; subject: string; text: string; html?: string };

let transporter: Transporter | null = null;

function smtp(): Transporter {
  transporter ??= nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.port === 465,
    auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.pass } : undefined,
  });
  return transporter;
}

/** Cetak email ke konsol (mode pengembangan tanpa SMTP). */
function printMail(mail: Mail) {
  console.log(
    [
      '',
      '──────── EMAIL (dev, tidak dikirim) ────────',
      `Kepada : ${mail.to}`,
      `Subjek : ${mail.subject}`,
      '',
      mail.text,
      '────────────────────────────────────────────',
      '',
    ].join('\n'),
  );
}

/**
 * Kirim email lewat SMTP (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`).
 * Tanpa SMTP (pengembangan lokal), isi email dicetak ke konsol server.
 */
export async function sendMail(mail: Mail): Promise<void> {
  if (!env.smtp.host) return printMail(mail);
  await smtp().sendMail({ from: env.smtp.from, ...mail });
}

/**
 * Kirim email di latar belakang: respons API tidak menunggu SMTP (lebih cepat dan
 * waktu respons tidak membocorkan apakah email terdaftar). Kegagalan dicatat ke log.
 */
export function queueMail(mail: Mail): void {
  sendMail(mail).catch((err) => {
    console.error(`[mailer] Gagal mengirim "${mail.subject}" ke ${mail.to}:`, err);
  });
}

/** Cek koneksi SMTP saat server mulai; tampilkan mode email yang aktif. */
export async function checkMailer(): Promise<void> {
  if (!env.smtp.host) {
    console.log('[mailer] SMTP_HOST kosong — email dicetak ke konsol (mode pengembangan).');
    return;
  }
  try {
    await smtp().verify();
    console.log(`[mailer] Terhubung ke SMTP ${env.smtp.host}:${env.smtp.port}.`);
  } catch (err) {
    console.error(`[mailer] Tidak bisa terhubung ke SMTP ${env.smtp.host}:${env.smtp.port}:`, err);
  }
}
