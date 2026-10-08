import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, Line, Pattern, Rect } from 'react-native-svg';

import { ArrowDownLeftIcon, ArrowUpRightIcon, SignInIcon, TimerIcon, type Icon } from '@/components/icons';
import { Card } from '@/components/ui/card';
import { Segmented } from '@/components/ui/segmented';
import { AppText } from '@/components/ui/text';
import { Colors, Fonts, Radius, Shift, Spacing } from '@/constants/theme';
import { isLate, timeOf, workedMinutes } from '@/lib/attendance';
import { addDays, dayName, dayShort, formatDuration, fromDateKey, isWeekend, minutesOf, mondayOf, pad, toDateKey } from '@/lib/date';
import type { Attendance, DayRecord, DayRecords } from '@/types/attendance';

export type Range = 'week' | 'month';

type SegStatus = 'ok' | 'late' | 'missed' | 'today' | 'future';

const STATUS_TEXT: Record<SegStatus, string> = {
  ok: 'tepat waktu',
  late: 'terlambat',
  missed: 'tidak hadir',
  today: 'hari ini, belum absen',
  future: 'belum berjalan',
};

/** Rentang (Senin–Minggu atau satu bulan penuh) yang memuat `selected`. */
export function rangeOf(selected: string, range: Range) {
  const sel = fromDateKey(selected);
  if (range === 'week') {
    const start = mondayOf(sel);
    return { start, end: addDays(start, 6) };
  }
  return {
    start: new Date(sel.getFullYear(), sel.getMonth(), 1, 12),
    end: new Date(sel.getFullYear(), sel.getMonth() + 1, 0, 12),
  };
}

/** Segmen bergaris untuk hari terlambat (pola diagonal seperti desain). */
function LateSegment({ height }: { height: number }) {
  return (
    <Svg width="100%" height={height}>
      <Defs>
        <Pattern id="late" patternUnits="userSpaceOnUse" width={6} height={6} patternTransform="rotate(45)">
          <Rect width={6} height={6} fill={Colors.warning} />
          <Line x1={0} y1={0} x2={0} y2={6} stroke={Colors.warningStrong} strokeWidth={6} />
        </Pattern>
      </Defs>
      <Rect width="100%" height={height} fill="url(#late)" />
    </Svg>
  );
}

function Tile({ icon: IconCmp, label, children, divider }: { icon: Icon; label: string; children: ReactNode; divider?: boolean }) {
  return (
    <View style={[styles.tile, divider && styles.tileDivider]}>
      <View style={styles.k}>
        <IconCmp size={15} color={Colors.textMuted} />
        <AppText variant="caption" color="textMuted" numberOfLines={1}>
          {label}
        </AppText>
      </View>
      {children}
    </View>
  );
}

type Props = {
  records: DayRecords;
  selected: string;
  range: Range;
  onRangeChange: (r: Range) => void;
};

/** Ringkasan kehadiran minggu/bulan terpilih: jumlah hadir, bar per hari kerja, rerata masuk, total kerja. */
export function SummaryCard({ records, selected, range, onRangeChange }: Props) {
  const { start, end } = rangeOf(selected, range);
  const todayKey = toDateKey(new Date());

  const days: { date: Date; key: string; status: SegStatus }[] = [];
  for (let d = new Date(start); d <= end; d = addDays(d, 1)) {
    if (isWeekend(d)) continue;
    const key = toDateKey(d);
    const rec = records[key];
    let status: SegStatus = 'future';
    if (rec?.in) status = isLate(rec) ? 'late' : 'ok';
    else if (key === todayKey) status = 'today';
    else if (key < todayKey) status = 'missed';
    days.push({ date: d, key, status });
  }
  const count = (s: SegStatus) => days.filter((x) => x.status === s).length;
  const ok = count('ok');
  const late = count('late');
  const missed = count('missed');
  const present = ok + late;
  const due = present + missed;
  const pct = due ? Math.round((present / due) * 100) : null;
  const dense = days.length > 7;
  const segHeight = dense ? 10 : 12;

  const attended = days
    .map((x) => records[x.key])
    .filter((r): r is DayRecord & { in: Attendance } => !!r?.in);
  const avg = attended.length
    ? Math.round(attended.reduce((s, r) => s + minutesOf(timeOf(r.in)), 0) / attended.length)
    : null;
  const diff = avg === null ? 0 : avg - Shift.start;
  const closed = attended.filter((r) => r.out);
  const total = closed.reduce((s, r) => s + workedMinutes(r), 0);
  const perDay = closed.length ? Math.round(total / closed.length) : 0;

  const segColor = (s: SegStatus) =>
    s === 'ok'
      ? { backgroundColor: Colors.positive }
      : s === 'missed'
        ? { backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.borderStrong }
        : s === 'today'
          ? { backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.accent }
          : { backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.border };

  return (
    <View style={styles.overview}>
      <Segmented
        accessibilityLabel="Rentang ringkasan"
        value={range}
        onChange={onRangeChange}
        options={[
          { value: 'week', label: 'Minggu' },
          { value: 'month', label: 'Bulan' },
        ]}
      />
      <Card style={styles.card}>
        <View style={styles.att}>
          <View style={styles.attHead}>
            <View style={styles.shrink}>
              <AppText variant="caption" color="textMuted">
                Kehadiran
              </AppText>
              <View style={styles.attValue}>
                <AppText numeric style={styles.attCount}>
                  {present}
                </AppText>
                <AppText color="textMuted" style={styles.attOf}>
                  dari {due} hari kerja
                </AppText>
              </View>
            </View>
            <View
              accessible
              accessibilityLabel={pct === null ? 'Belum ada hari kerja yang selesai' : `Tingkat kehadiran ${pct} persen`}
              style={[
                styles.rate,
                pct === null
                  ? { backgroundColor: Colors.surfaceMuted }
                  : pct >= 80
                    ? { backgroundColor: Colors.positiveSoft }
                    : { backgroundColor: Colors.warningSoft },
              ]}>
              <AppText
                variant="caption"
                weight="semibold"
                numeric
                color={pct === null ? 'textMuted' : pct >= 80 ? 'positiveText' : 'text'}>
                {pct === null ? '–' : `${pct}%`}
              </AppText>
            </View>
          </View>

          <View
            accessible
            accessibilityRole="image"
            accessibilityLabel={`Kehadiran per hari kerja: ${days
              .map((x) => `${dayName(x.date)} ${x.date.getDate()} ${STATUS_TEXT[x.status]}`)
              .join(', ')}`}
            style={[styles.bar, { gap: dense ? 3 : 4 }]}>
            {days.map((x) => (
              <View
                key={x.key}
                style={[styles.seg, { height: segHeight, borderRadius: dense ? 3 : 4 }, x.status !== 'late' && segColor(x.status)]}>
                {x.status === 'late' && <LateSegment height={segHeight} />}
              </View>
            ))}
          </View>
          {range === 'week' && (
            <View style={[styles.bar, styles.barDays]} importantForAccessibility="no-hide-descendants">
              {days.map((x) => (
                <AppText
                  key={x.key}
                  style={styles.barDay}
                  weight={x.key === todayKey ? 'semibold' : 'medium'}
                  color={x.key === todayKey ? 'accentText' : 'textMuted'}>
                  {dayShort(x.date)}
                </AppText>
              ))}
            </View>
          )}

          <View style={styles.legend}>
            <LegendItem swatch={<View style={[styles.swatch, { backgroundColor: Colors.positive }]} />} label="Tepat waktu" value={ok} />
            <LegendItem
              swatch={
                <View style={styles.swatch}>
                  <LateSegment height={10} />
                </View>
              }
              label="Terlambat"
              value={late}
            />
            <LegendItem
              swatch={<View style={[styles.swatch, { borderWidth: 1.5, borderColor: Colors.borderStrong }]} />}
              label="Tidak hadir"
              value={missed}
            />
          </View>
        </View>

        <View style={styles.tiles}>
          <Tile icon={SignInIcon} label="Rerata masuk">
            <AppText numeric style={styles.tileValue}>
              {avg === null ? '--.--' : `${pad(Math.floor(avg / 60))}.${pad(avg % 60)}`}
            </AppText>
            <View style={styles.k}>
              {avg !== null && diff !== 0 &&
                (diff > 0 ? (
                  <ArrowUpRightIcon size={14} weight="bold" color={Colors.warningText} />
                ) : (
                  <ArrowDownLeftIcon size={14} weight="bold" color={Colors.positiveText} />
                ))}
              <AppText
                variant="caption"
                numberOfLines={1}
                style={styles.shrink}
                color={avg === null ? 'textMuted' : diff > 0 ? 'warningText' : 'positiveText'}>
                {avg === null
                  ? 'Belum ada absen'
                  : diff === 0
                    ? 'Tepat 08.00'
                    : `${Math.abs(diff)} m ${diff > 0 ? 'lewat' : 'sebelum'} 08.00`}
              </AppText>
            </View>
          </Tile>
          <Tile icon={TimerIcon} label="Total kerja" divider>
            <AppText numeric style={styles.tileValue} accessibilityLabel={formatDuration(total)}>
              {Math.floor(total / 60)}
              <AppText style={styles.unit}> j</AppText> {total % 60}
              <AppText style={styles.unit}> m</AppText>
            </AppText>
            <AppText variant="caption" color="textMuted" numberOfLines={1}>
              {closed.length ? `${formatDuration(perDay)} per hari` : 'Belum ada hari selesai'}
            </AppText>
          </Tile>
        </View>
      </Card>
    </View>
  );
}

function LegendItem({ swatch, label, value }: { swatch: ReactNode; label: string; value: number }) {
  return (
    <View style={styles.legendItem}>
      {swatch}
      <AppText variant="label" weight="regular" color="textMuted">
        {label}{' '}
        <AppText variant="label" numeric>
          {value}
        </AppText>
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  overview: { gap: Spacing.three },
  card: { overflow: 'hidden' },
  shrink: { flexShrink: 1 },
  att: { padding: Spacing.four, gap: Spacing.three },
  attHead: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing.three },
  attValue: { flexDirection: 'row', alignItems: 'baseline', gap: 6, flexWrap: 'wrap', marginTop: 2 },
  attCount: { fontFamily: Fonts.semibold, fontSize: 34, lineHeight: 38, letterSpacing: -1.2 },
  attOf: { fontSize: 15, lineHeight: 20 },
  rate: { paddingHorizontal: 10, paddingVertical: Spacing.one, borderRadius: Radius.pill },
  bar: { flexDirection: 'row' },
  seg: { flex: 1, overflow: 'hidden' },
  barDays: { marginTop: -6, gap: 4 },
  barDay: { flex: 1, textAlign: 'center', fontSize: 11, lineHeight: 14 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', columnGap: Spacing.four, rowGap: 6 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  swatch: { width: 10, height: 10, borderRadius: 3, overflow: 'hidden' },
  tiles: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: Colors.border },
  tile: { flex: 1, minWidth: 0, gap: 2, paddingTop: Spacing.three, paddingHorizontal: Spacing.four, paddingBottom: Spacing.four },
  tileDivider: { borderLeftWidth: 1, borderLeftColor: Colors.border },
  k: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  tileValue: { fontFamily: Fonts.semibold, fontSize: 28, lineHeight: 34, letterSpacing: -1, marginTop: 2 },
  unit: { fontFamily: Fonts.medium, fontSize: 15, letterSpacing: -0.2, color: Colors.textMuted },
});
