import { StyleSheet, View } from 'react-native';
import Svg, { Defs, Line, Pattern, Rect } from 'react-native-svg';

import { CheckCircleIcon, ClockCountdownIcon, type Icon } from '@/components/icons';
import { Chip } from '@/components/ui/chip';
import { AppText, type TextVariant } from '@/components/ui/text';
import { Colors, Spacing, type ColorName } from '@/constants/theme';
import type { DayTone } from '@/lib/attendance';

/**
 * Satu sumber kebenaran untuk tampilan status kehadiran.
 * Tepat waktu = hijau + ikon centang; Terlambat = oranye + ikon jam mundur.
 * Status selalu ditampilkan dengan ikon/pola + teks, tidak pernah warna saja.
 */
export const STATUS: Record<
  DayTone,
  { label: string; icon: Icon; color: string; textColor: ColorName }
> = {
  ok: {
    label: 'Tepat waktu',
    icon: CheckCircleIcon,
    color: Colors.positive,
    textColor: 'positiveText',
  },
  late: {
    label: 'Terlambat',
    icon: ClockCountdownIcon,
    color: Colors.warning,
    textColor: 'warningText',
  },
};

export const toneFromLate = (late: boolean): DayTone => (late ? 'late' : 'ok');

/** Ikon status berwarna. */
export function StatusIcon({ tone, size = 14 }: { tone: DayTone; size?: number }) {
  const { icon: IconCmp, color } = STATUS[tone];
  return <IconCmp size={size} weight="fill" color={color} />;
}

type InlineProps = {
  tone: DayTone;
  /** Teks pengganti label baku, mis. "Terlambat 17 menit". */
  label?: string;
  variant?: TextVariant;
  /** Warnai teksnya juga (default: hanya ikon yang berwarna, teks abu). */
  tinted?: boolean;
};

/** Ikon status + teks dalam satu baris, untuk sub-judul baris daftar dan metrik. */
export function StatusInline({ tone, label, variant = 'bodySm', tinted }: InlineProps) {
  return (
    <View style={styles.inline}>
      <StatusIcon tone={tone} size={14} />
      <AppText
        variant={variant}
        color={tinted && tone === 'late' ? STATUS.late.textColor : 'textMuted'}
        numberOfLines={1}
        style={styles.shrink}>
        {label ?? STATUS[tone].label}
      </AppText>
    </View>
  );
}

/** Chip "Tepat waktu" / "Terlambat". */
export function StatusChip({ late }: { late: boolean }) {
  const tone = toneFromLate(late);
  return <Chip tone={tone} icon={STATUS[tone].icon} label={STATUS[tone].label} />;
}

/** Titik kecil penanda status di kalender & strip minggu. */
export function StatusMark({ tone, size = 6 }: { tone: DayTone | null; size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: tone ? STATUS[tone].color : 'transparent',
      }}
    />
  );
}

/** Isian bergaris diagonal oranye untuk hari terlambat di grafik (`repeating-linear-gradient` desain). */
export function LateStripes({ height }: { height: number }) {
  return (
    <Svg width="100%" height={height}>
      <Defs>
        <Pattern
          id="late-stripes"
          patternUnits="userSpaceOnUse"
          width={6}
          height={6}
          patternTransform="rotate(45)">
          <Rect width={6} height={6} fill={Colors.warning} />
          <Line x1={0} y1={0} x2={0} y2={6} stroke={Colors.warningStrong} strokeWidth={6} />
        </Pattern>
      </Defs>
      <Rect width="100%" height={height} fill="url(#late-stripes)" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  inline: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one, minWidth: 0 },
  shrink: { flexShrink: 1 },
});
