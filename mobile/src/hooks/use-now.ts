import { useEffect, useState } from 'react';

/** Waktu sekarang yang diperbarui tiap `intervalMs` (default 1 detik) untuk jam & progres kerja. */
export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}
