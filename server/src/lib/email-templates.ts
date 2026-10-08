import type { Mail } from './mailer';

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/** Kerangka HTML email sederhana bernuansa desain aplikasi. */
function layout(body: string) {
  return `<!doctype html><html><body style="margin:0;background:#fbf5f0;font-family:Inter,Arial,sans-serif;color:#1d1e1c">
<div style="max-width:480px;margin:0 auto;padding:32px 24px">
<p style="font-weight:600;margin:0 0 24px">⚡ Absen Kilat</p>${body}
<p style="color:#858585;font-size:12px;margin-top:32px">Abaikan email ini bila kamu tidak memintanya.</p>
</div></body></html>`;
}

/** Email verifikasi: kode 6 digit + tautan yang langsung memverifikasi. */
export function verificationEmail(input: { to: string; otp: string; link: string }): Mail {
  return {
    to: input.to,
    subject: `Kode verifikasi Absen Kilat: ${input.otp}`,
    text: `Kode verifikasi akunmu: ${input.otp}\n\nMasukkan kode ini di aplikasi, atau buka tautan berikut dari ponselmu:\n${input.link}\n\nKode berlaku 10 menit.`,
    html: layout(`<h1 style="font-family:Georgia,serif;font-weight:400;font-size:28px;margin:0 0 8px">Verifikasi email</h1>
<p style="color:#6a696a;margin:0 0 24px">Masukkan kode ini di aplikasi. Kode berlaku 10 menit.</p>
<p style="font-size:32px;letter-spacing:8px;font-weight:600;margin:0 0 24px">${escape(input.otp)}</p>
<p><a href="${escape(input.link)}" style="display:inline-block;background:#000;color:#fff;text-decoration:none;padding:14px 24px;border-radius:30px">Verifikasi dari ponsel</a></p>`),
  };
}

/** Email reset kata sandi dengan tautan yang membuka aplikasi. */
export function resetPasswordEmail(input: { to: string; url: string }): Mail {
  return {
    to: input.to,
    subject: 'Atur ulang kata sandi Absen Kilat',
    text: `Kami menerima permintaan atur ulang kata sandi.\n\nBuka tautan berikut dari ponselmu (berlaku 30 menit):\n${input.url}`,
    html: layout(`<h1 style="font-family:Georgia,serif;font-weight:400;font-size:28px;margin:0 0 8px">Atur ulang kata sandi</h1>
<p style="color:#6a696a;margin:0 0 24px">Buka tautan ini dari ponselmu. Tautan berlaku selama 30 menit.</p>
<p><a href="${escape(input.url)}" style="display:inline-block;background:#000;color:#fff;text-decoration:none;padding:14px 24px;border-radius:30px">Atur kata sandi baru</a></p>`),
  };
}
