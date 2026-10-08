import nodemailer, { type Transporter } from 'nodemailer';

import { env } from '../env';

export type Mail = { to: string; subject: string; text: string; html?: string };

let transporter: Transporter | null = null;

/**
 * Kirim email lewat SMTP (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`).
 * Tanpa SMTP (pengembangan lokal), isi email dicetak ke konsol server.
 */
export async function sendMail(mail: Mail): Promise<void> {
  if (!env.smtp.host) {
    console.log(
      ['', '──────── EMAIL (dev, tidak dikirim) ────────', `Kepada : ${mail.to}`, `Subjek : ${mail.subject}`, '', mail.text, '────────────────────────────────────────────', ''].join('\n'),
    );
    return;
  }
  transporter ??= nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.port === 465,
    auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.pass } : undefined,
  });
  await transporter.sendMail({ from: env.smtp.from, ...mail });
}
