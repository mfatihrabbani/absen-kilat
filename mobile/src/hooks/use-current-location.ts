import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';

export type Coords = { latitude: number; longitude: number; accuracy: number | null };

export type LocationState =
  | { status: 'searching'; coords: Coords | null }
  | { status: 'ready'; coords: Coords }
  | { status: 'denied'; canAskAgain: boolean }
  | { status: 'error'; message: string };

const toCoords = (l: Location.LocationObject): Coords => ({
  latitude: l.coords.latitude,
  longitude: l.coords.longitude,
  accuracy: l.coords.accuracy,
});

/** Akurasi (meter) yang dianggap cukup untuk absen. */
const GOOD_ACCURACY = 50;

/**
 * Pantau lokasi GPS perangkat selama layar aktif (`enabled`).
 * Status `ready` begitu ada titik dengan akurasi cukup; titik berikutnya
 * yang lebih akurat akan menggantikannya.
 */
export function useCurrentLocation(enabled: boolean) {
  const [state, setState] = useState<LocationState>({ status: 'searching', coords: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    let sub: Location.LocationSubscription | null = null;

    const accept = (loc: Location.LocationObject) => {
      if (cancelled) return;
      const next = toCoords(loc);
      setState((prev) => {
        const prevCoords = prev.status === 'ready' || prev.status === 'searching' ? prev.coords : null;
        // Pertahankan titik lama bila yang baru justru kurang akurat.
        const best =
          prevCoords && (prevCoords.accuracy ?? Infinity) < (next.accuracy ?? Infinity)
            ? prevCoords
            : next;
        return (best.accuracy ?? Infinity) <= GOOD_ACCURACY
          ? { status: 'ready', coords: best }
          : { status: 'searching', coords: best };
      });
    };

    (async () => {
      try {
        const perm = await Location.requestForegroundPermissionsAsync();
        if (cancelled) return;
        if (!perm.granted) {
          setState({ status: 'denied', canAskAgain: perm.canAskAgain });
          return;
        }
        const last = await Location.getLastKnownPositionAsync({ maxAge: 60_000 });
        if (last) accept(last);
        sub = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, timeInterval: 2000, distanceInterval: 0 },
          accept,
          (reason) => !cancelled && setState({ status: 'error', message: reason }),
        );
        if (cancelled) sub.remove();
      } catch (e) {
        if (!cancelled) {
          setState({
            status: 'error',
            message: e instanceof Error ? e.message : 'Lokasi tidak tersedia',
          });
        }
      }
    })();

    return () => {
      cancelled = true;
      sub?.remove();
    };
  }, [enabled, attempt]);

  const retry = useCallback(() => {
    setState({ status: 'searching', coords: null });
    setAttempt((n) => n + 1);
  }, []);

  return { ...state, retry };
}

/** `-6.20088, 106.84557` */
export const formatCoords = (c: Pick<Coords, 'latitude' | 'longitude'>) =>
  `${c.latitude.toFixed(5)}, ${c.longitude.toFixed(5)}`;
