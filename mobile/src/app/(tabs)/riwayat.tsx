import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { DayRow } from '@/components/attendance/day-row';
import { CalendarDotsIcon, WarningCircleIcon } from '@/components/icons';
import { CalendarSheet } from '@/components/riwayat/calendar-sheet';
import { DayTimeline } from '@/components/riwayat/day-timeline';
import { rangeOf, SummaryCard, type Range } from '@/components/riwayat/summary-card';
import { WeekPager } from '@/components/riwayat/week-pager';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { EmptyState } from '@/components/ui/empty-state';
import { IconButton } from '@/components/ui/icon-button';
import { LargeTitleScreen } from '@/components/ui/large-title-screen';
import { ListGroup } from '@/components/ui/list';
import { Section, SectionHead } from '@/components/ui/section';
import { AppText } from '@/components/ui/text';
import { Colors, Spacing } from '@/constants/theme';
import { useAttendanceHistory } from '@/hooks/use-attendance-history';
import { useNow } from '@/hooks/use-now';
import { isLate, workedMinutes } from '@/lib/attendance';
import {
  addDays,
  formatDayMonth,
  formatShortDate,
  fromDateKey,
  monthLabel,
  mondayOf,
  toDateKey,
  weekLabel,
} from '@/lib/date';
import type { DayRecords } from '@/types/attendance';

const isDateKey = (s: unknown): s is string => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);

/** Kelompokkan tanggal yang punya absen per minggu (terbaru dulu) untuk feed aktivitas. */
function groupFeed(records: DayRecords, now: Date) {
  const thisMon = toDateKey(mondayOf(now));
  const lastMon = toDateKey(addDays(mondayOf(now), -7));
  const byWeek = new Map<string, string[]>();
  Object.keys(records)
    .filter((k) => records[k].in)
    .sort()
    .reverse()
    .forEach((key) => {
      const week = toDateKey(mondayOf(fromDateKey(key)));
      byWeek.set(week, [...(byWeek.get(week) ?? []), key]);
    });
  return [...byWeek.entries()].map(([week, dates]) => {
    const mon = fromDateKey(week);
    const total = dates.reduce((s, k) => s + workedMinutes(records[k]), 0);
    const late = dates.filter((k) => isLate(records[k])).length;
    return {
      week,
      dates,
      title:
        week === thisMon
          ? 'Minggu ini'
          : week === lastMon
            ? 'Minggu lalu'
            : `${formatShortDate(mon)} – ${formatShortDate(addDays(mon, 6))}`,
      meta: `${dates.length} hari · ${Math.floor(total / 60)} j${late ? ` · ${late} terlambat` : ''}`,
    };
  });
}

/** Riwayat: ringkasan minggu/bulan, pilih tanggal (strip minggu/kalender), linimasa hari, dan feed. */
export default function RiwayatScreen() {
  const router = useRouter();
  const now = useNow(30_000);
  const params = useLocalSearchParams<{ date?: string }>();
  const { records, loaded, error, refreshing, refresh } = useAttendanceHistory();
  const todayKey = toDateKey(now);

  const [selected, setSelected] = useState(() => (isDateKey(params.date) && params.date <= todayKey ? params.date : todayKey));
  const [range, setRange] = useState<Range>('week');
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Tanggal dari beranda (`/riwayat?date=...`) menimpa pilihan saat ini.
  const [lastParam, setLastParam] = useState(params.date);
  if (params.date !== lastParam) {
    setLastParam(params.date);
    if (isDateKey(params.date) && params.date <= todayKey) setSelected(params.date);
  }

  const earliestKey = Object.keys(records).sort()[0] ?? todayKey;
  const weeks = useMemo(() => {
    const list: Date[] = [];
    const last = mondayOf(fromDateKey(todayKey));
    for (let m = mondayOf(fromDateKey(earliestKey)); m <= last; m = addDays(m, 7)) list.push(m);
    return list;
  }, [earliestKey, todayKey]);
  const earliestMonth = useMemo(() => {
    const d = fromDateKey(earliestKey);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  }, [earliestKey]);

  const feed = groupFeed(records, now);
  const { start } = rangeOf(selected, range);
  const periodLabel = range === 'week' ? weekLabel(start) : monthLabel(fromDateKey(selected));

  const content = !loaded
    ? [<ActivityIndicator key="loading" style={styles.loader} color={Colors.accent} />]
    : error
      ? [
          <EmptyState
            key="error"
            icon={WarningCircleIcon}
            title="Gagal memuat"
            body={error}
            action={<Button label="Coba lagi" onPress={refresh} />}
          />,
        ]
      : [
          <SummaryCard key="summary" records={records} selected={selected} range={range} onRangeChange={setRange} />,

          <WeekPager key="pager" weeks={weeks} records={records} selected={selected} onSelect={setSelected} />,

          <Section key="day">
            <SectionHead
              title={formatDayMonth(fromDateKey(selected))}
              meta={selected === todayKey ? <Chip label="Hari ini" /> : undefined}
            />
            <DayTimeline dateKey={selected} record={records[selected]} now={now} />
          </Section>,

          ...feed.flatMap((g, i) => [
            <View key={`head-${g.week}`} style={[styles.groupHead, i > 0 && styles.groupHeadNext]}>
              <AppText variant="sectionTitle" accessibilityRole="header" numberOfLines={1}>
                {g.title}
              </AppText>
              <AppText variant="caption" color="textMuted" numeric numberOfLines={1} style={styles.shrink}>
                {g.meta}
              </AppText>
            </View>,
            <ListGroup key={`list-${g.week}`} style={styles.groupList}>
              {g.dates.map((key) => {
                const rec = records[key];
                const first = rec.in;
                return first ? (
                  <DayRow
                    key={key}
                    dateKey={key}
                    record={{ ...rec, in: first }}
                    onPress={() => router.push(`/detail/${first.id}`)}
                  />
                ) : null;
              })}
            </ListGroup>,
          ]),
        ];

  // Kepala grup feed menempel di atas saat menggulir; indeksnya relatif terhadap `content`.
  const stickyIndices = loaded && !error ? feed.map((_, i) => 3 + i * 2) : [];

  return (
    <>
      <LargeTitleScreen
        eyebrow={periodLabel}
        title="Riwayat"
        actions={
          <IconButton accessibilityLabel="Pilih tanggal dari kalender" onPress={() => setCalendarOpen(true)}>
            <CalendarDotsIcon size={20} color={Colors.text} />
          </IconButton>
        }
        stickyIndices={stickyIndices}
        refreshing={refreshing}
        onRefresh={refresh}>
        {content}
      </LargeTitleScreen>

      {calendarOpen && (
        <CalendarSheet
          visible
          onClose={() => setCalendarOpen(false)}
          records={records}
          selected={selected}
          earliest={earliestMonth}
          onSelect={setSelected}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  loader: { marginTop: Spacing.sixteen },
  shrink: { flexShrink: 1 },
  groupHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: Spacing.three,
    marginHorizontal: -Spacing.five,
    paddingHorizontal: Spacing.five + Spacing.one,
    paddingVertical: Spacing.two,
    backgroundColor: Colors.canvasTranslucent,
  },
  // Jarak antar grup 16 (gap konten 24 dikurangi 8).
  groupHeadNext: { marginTop: -Spacing.two },
  groupList: { marginTop: -Spacing.six },
});
