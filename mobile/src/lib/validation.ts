/** Validasi sederhana di sisi aplikasi; server tetap memvalidasi ulang. */

export const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

export type PasswordRuleKey = 'length' | 'mix';

export const PASSWORD_RULES: { key: PasswordRuleKey; label: string }[] = [
  { key: 'length', label: 'Minimal 8 karakter' },
  { key: 'mix', label: 'Mengandung huruf dan angka' },
];

/** Status tiap aturan kata sandi baru. */
export function checkPassword(v: string): Record<PasswordRuleKey, boolean> {
  return { length: v.length >= 8, mix: /[a-z]/i.test(v) && /\d/.test(v) };
}

export const isStrongPassword = (v: string) => Object.values(checkPassword(v)).every(Boolean);
