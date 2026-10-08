import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { StatusMark } from '@/components/attendance/status';
import { CaretLeftIcon, CaretRightIcon } from '@/components/icons';
import { Card } from '@/components/ui/card';
import { AppText } from '@/components/ui/text';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { statusLabel, toneOf } from '@/lib/attendance';
import {
  addDays,
  dayShort,
  formatLongDate,
  fromDateKey,
  isWeekend,
  mondayOf,
  toDateKey,
  weekLabel,
} from '@/lib/date';
import type { DayRecords } from '@/types/attendance';

type Props = {
  /** Senin dari tiap minggu, terlama lebih dulu. */
  weeks: Date[];
  records: DayRecords;
  selected: string;
  onSelect: (key: string) => void;
};

/** Strip minggu yang bisa digeser per halaman, dengan tombol minggu sebelum/berikutnya. */
export function WeekPager({ weeks, records, selected, onSelect }: Props) {
  const listRef = useRef<FlatList<Date>>(null);
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(weeks.length - 1);
  const todayKey = toDateKey(new Date());
  const current = Math.min(weeks.length - 1, Math.max(0, index));

  // Gulir ke minggu yang memuat tanggal terpilih (mis. dipilih dari kalender).
  const selectedWeek = weeks.findIndex(
    (m) => toDateKey(m) === toDateKey(mondayOf(fromDateKey(selected))),
  );
  useEffect(() => {
    if (width && selectedWeek >= 0) {
      listRef.current?.scrollToOffset({ offset: selectedWeek * width, animated: false });
    }
  }, [selectedWeek, width]);

  const goTo = (i: number) => {
    const target = Math.min(weeks.length - 1, Math.max(0, i));
    listRef.current?.scrollToOffset({ offset: target * width, animated: true });
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!width) return;
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    if (i !== index) setIndex(i);
  };

  return (
    <View style={styles.section}>
      <View style={styles.head}>
        <AppText weight="semibold" numeric style={styles.label} accessibilityLiveRegion="polite">
          {weeks[current] ? weekLabel(weeks[current]) : ''}
        </AppText>
        <View style={styles.nav}>
          <NavButton
            label="Minggu sebelumnya"
            disabled={current <= 0}
            onPress={() => goTo(current - 1)}>
            <CaretLeftIcon
              size={18}
              weight="bold"
              color={current <= 0 ? Colors.textFaint : Colors.text}
            />
          </NavButton>
          <NavButton
            label="Minggu berikutnya"
            disabled={current >= weeks.length - 1}
            onPress={() => goTo(current + 1)}>
            <CaretRightIcon
              size={18}
              weight="bold"
              color={current >= weeks.length - 1 ? Colors.textFaint : Colors.text}
            />
          </NavButton>
        </View>
      </View>

      <Card style={styles.card}>
        <View onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}>
          {width > 0 && (
            <FlatList
              ref={listRef}
              data={weeks}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(m) => toDateKey(m)}
              initialScrollIndex={selectedWeek >= 0 ? selectedWeek : weeks.length - 1}
              getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
              onScroll={onScroll}
              scrollEventThrottle={32}
              renderItem={({ item: monday }) => (
                <View
                  style={[styles.page, { width }]}
                  accessibilityLabel={`Minggu ${weekLabel(monday)}`}>
                  {Array.from({ length: 7 }, (_, i) => {
                    const d = addDays(monday, i);
                    const key = toDateKey(d);
                    const rec = records[key];
                    const isToday = key === todayKey;
                    const future = key > todayKey;
                    const active = key === selected;
                    return (
                      <Pressable
                        key={key}
                        disabled={future}
                        onPress={() => onSelect(key)}
                        accessibilityRole="button"
                        accessibilityState={{ selected: active, disabled: future }}
                        accessibilityLabel={`${formatLongDate(d)}${isToday ? ', hari ini' : ''}, ${isWeekend(d) ? 'akhir pekan' : statusLabel(rec)}`}
                        style={styles.wday}>
                        {({ pressed }) => (
                          <>
                            <AppText variant="label" color="textMuted" style={styles.dow}>
                              {dayShort(d)}
                            </AppText>
                            <View
                              style={[
                                styles.num,
                                pressed && { backgroundColor: Colors.surfaceMuted },
                                active && {
                                  backgroundColor: isToday ? Colors.accent : Colors.primary,
                                },
                              ]}>
                              <AppText
                                numeric
                                weight={isToday || active ? 'semibold' : 'medium'}
                                style={styles.numText}
                                color={
                                  active
                                    ? isToday
                                      ? 'onAccent'
                                      : 'onPrimary'
                                    : future
                                      ? 'textFaint'
                                      : isToday
                                        ? 'accentText'
                                        : isWeekend(d)
                                          ? 'textMuted'
                                          : 'text'
                                }>
                                {d.getDate()}
                              </AppText>
                            </View>
                            <StatusMark tone={toneOf(rec)} />
                          </>
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              )}
            />
          )}
        </View>
      </Card>
    </View>
  );
}

function NavButton({
  label,
  disabled,
  onPress,
  children,
}: {
  label: string;
  disabled: boolean;
  onPress: () => void;
  children: ReactNode;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      hitSlop={4}
      style={({ pressed }) => [styles.navBtn, pressed && { backgroundColor: Colors.surfaceMuted }]}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: { gap: Spacing.two },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    paddingHorizontal: Spacing.one,
  },
  label: { fontSize: 15, lineHeight: 20, letterSpacing: -0.2 },
  nav: { flexDirection: 'row', gap: Spacing.one, marginVertical: -6, marginRight: -6 },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: { overflow: 'hidden', minHeight: 90 },
  page: {
    flexDirection: 'row',
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
    paddingHorizontal: Spacing.one,
  },
  wday: { flex: 1, alignItems: 'center', gap: Spacing.one },
  dow: { fontSize: 11, lineHeight: 14 },
  num: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  numText: { fontSize: 17, letterSpacing: -0.3 },
});
