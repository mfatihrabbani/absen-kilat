/**
 * Token desain "Sunlit Ledger" (DesainPakeAI): kanvas krem, aksi pil hitam,
 * dan sinyal aktivitas oranye. Aplikasi hanya memakai mode terang.
 */

export const Colors = {
  primary: '#000000',
  primaryHover: '#4f4f4f',
  onPrimary: '#ffffff',
  accent: '#fa5d00',
  accentSoft: 'rgba(250, 93, 0, 0.10)',
  accentText: '#c1490b',
  onAccent: '#1d1e1c',
  canvas: '#fbf5f0',
  canvasTranslucent: 'rgba(251, 245, 240, 0.94)',
  surface: '#ffffff',
  surfaceTranslucent: 'rgba(255, 255, 255, 0.94)',
  surfaceMuted: '#f3ebe4',
  surfaceSubtle: '#f8f5f1',
  text: '#1d1e1c',
  textSoft: '#2c222d',
  textMuted: '#6a696a',
  textFaint: '#858585',
  border: 'rgba(29, 30, 28, 0.10)',
  borderStrong: '#999999',
  positive: '#23a40c',
  positiveText: '#1b7a0a',
  positiveSoft: 'rgba(35, 164, 12, 0.12)',
  warning: '#f18d2a',
  warningStrong: '#d97012',
  warningText: '#a95d05',
  warningSoft: 'rgba(241, 141, 42, 0.14)',
  danger: '#cb5c5b',
  dangerText: '#b2403f',
  backdrop: 'rgba(29, 30, 28, 0.40)',
  bannerBg: 'rgba(29, 30, 28, 0.94)',
} as const;

export type ColorName = keyof typeof Colors;

/** Keluarga font per ketebalan — Android tidak bisa men-sintesis `fontWeight` untuk font kustom. */
export const Fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  editorial: 'IBMPlexSerif_400Regular',
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 12,
  four: 16,
  five: 20,
  six: 24,
  eight: 32,
  ten: 40,
  sixteen: 64,
} as const;

export const Radius = {
  compact: 10,
  image: 16,
  card: 20,
  control: 30,
  sheet: 28,
  pill: 9999,
} as const;

export const Shadow = {
  md: {
    shadowColor: 'rgb(123, 85, 31)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.21,
    shadowRadius: 5,
    elevation: 3,
  },
  nav: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 8,
  },
  segment: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
} as const;

/** Jam kerja (menit sejak 00:00): masuk paling lambat 08.00, pulang 17.00. */
export const Shift = {
  start: 8 * 60,
  end: 17 * 60,
} as const;

export const MaxContentWidth = 600;
