import { useRouter } from 'expo-router';
import { ActivityIndicator, StyleSheet } from 'react-native';

import { AvatarButton } from '@/components/avatar-button';
import { DayRow } from '@/components/attendance/day-row';
import { TodayCard } from '@/components/beranda/today-card';
import { buildWeek, WeekStrip } from '@/components/beranda/week-strip';
import { WarningCircleIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { LargeTitleScreen } from '@/components/ui/large-title-screen';
import { ListGroup } from '@/components/ui/list';
import { Section, SectionHead } from '@/components/ui/section';
import { Colors, Spacing } from '@/constants/theme';
import { useAttendanceHistory } from '@/hooks/use-attendance-history';
import { useNow } from '@/hooks/use-now';
import { formatDayMonth, greeting, toDateKey } from '@/lib/date';

/** Beranda (tab "Absen"): ringkasan absen hari ini, minggu ini, dan riwayat terakhir. */
export default function BerandaScreen() {
  const router = useRouter();
  const now = useNow();
  const { records, loaded, error, refreshing, refresh } = useAttendanceHistory();
  const todayKey = toDateKey(now);

  const week = buildWeek(records, now);
  const recent = Object.keys(records)
    .filter((k) => k !== todayKey && records[k].in && records[k].out)
    .sort()
    .reverse()
    .slice(0, 3);

  const openRiwayat = (date: string) => router.navigate({ pathname: '/riwayat', params: { date } });

  return (
    <LargeTitleScreen
      eyebrow={formatDayMonth(now)}
      title={greeting(now)}
      actions={<AvatarButton />}
      refreshing={refreshing}
      onRefresh={refresh}>
      {!loaded ? (
        <ActivityIndicator style={styles.loader} color={Colors.accent} />
      ) : error ? (
        <EmptyState
          icon={WarningCircleIcon}
          title="Gagal memuat"
          body={error}
          action={<Button label="Coba lagi" onPress={refresh} />}
        />
      ) : (
        [
          <TodayCard key="today" record={records[todayKey]} now={now} />,

          <Section key="week">
            <SectionHead title="Minggu ini" meta={week.summary} />
            <WeekStrip
              days={week.days}
              todayKey={todayKey}
              summary={week.summary}
              onSelect={openRiwayat}
            />
          </Section>,

          <Section key="history">
            <SectionHead title="Terakhir" link={{ label: 'Lihat semua', href: '/riwayat' }} />
            {recent.length > 0 ? (
              <ListGroup>
                {recent.map((key) => {
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
              </ListGroup>
            ) : (
              <EmptyState
                icon={WarningCircleIcon}
                title="Belum ada riwayat"
                body="Absen pertamamu akan muncul di sini."
              />
            )}
          </Section>,
        ]
      )}
    </LargeTitleScreen>
  );
}

const styles = StyleSheet.create({
  loader: { marginTop: Spacing.sixteen },
});
