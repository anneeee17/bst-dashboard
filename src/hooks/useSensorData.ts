import { useState, useEffect, useRef } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../lib/firebase';
import type { SensorData, ChartPoint } from '../types/sensor';

const WINDOW_SECONDS = 60;

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

interface ChartPointWithTs extends ChartPoint {
  realTs: number;
}

export function useSensorData(path: string = '/sensor') {
  const [data, setData] = useState<SensorData | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const teganganHistory = useRef<ChartPointWithTs[]>([]);
  const adcHistory = useRef<ChartPointWithTs[]>([]);
  const luxHistory = useRef<ChartPointWithTs[]>([]);
  const [histories, setHistories] = useState<{
    tegangan: ChartPoint[];
    adc: ChartPoint[];
    lux: ChartPoint[];
  }>({ tegangan: [], adc: [], lux: [] });

  useEffect(() => {
    const sensorRef = ref(db, path);
    const unsub = onValue(
      sensorRef,
      (snapshot) => {
        const val = snapshot.val() as SensorData | null;
        if (val) {
          // Selalu pakai waktu nyata dari browser
          const now = Date.now();
          const timeLabel = formatTime(now);

          const pushWindowed = (arr: ChartPointWithTs[], value: number): ChartPointWithTs[] => {
            const entry: ChartPointWithTs = { time: timeLabel, value, realTs: now };
            const next = [...arr, entry];
            const cutoff = now - WINDOW_SECONDS * 1000;
            return next.filter(p => p.realTs >= cutoff);
          };

          teganganHistory.current = pushWindowed(teganganHistory.current, val.tegangan_bst ?? 0);
          adcHistory.current = pushWindowed(adcHistory.current, val.adc_ads1115 ?? 0);
          luxHistory.current = pushWindowed(luxHistory.current, val.lux_bh1750 ?? 0);

          setHistories({
            tegangan: teganganHistory.current.map(({ time, value }) => ({ time, value })),
            adc: adcHistory.current.map(({ time, value }) => ({ time, value })),
            lux: luxHistory.current.map(({ time, value }) => ({ time, value })),
          });

          // Override timestamp dengan waktu browser yang benar
          setData({ ...val, timestamp: now });
          setConnected(true);
          setError(null);
        }
      },
      (err) => {
        setError(err.message);
        setConnected(false);
      }
    );

    return () => unsub();
  }, [path]);

  return { data, connected, error, histories };
}