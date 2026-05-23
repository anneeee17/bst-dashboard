import React, { useEffect, useRef } from 'react';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import type { ChartPoint } from '../types/sensor';

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip, Legend);

interface RealtimeChartProps {
  label: string;
  data: ChartPoint[];
  color: string;
  fillColor: string;
  unit: string;
}

export default function RealtimeChart({ label, data, color, fillColor, unit }: RealtimeChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    chartRef.current = new Chart(canvasRef.current, {
      type: 'line',
      data: {
        labels: data.map((d) => d.time),
        datasets: [
          {
            label: `${label} (${unit})`,
            data: data.map((d) => d.value),
            borderColor: color,
            backgroundColor: fillColor,
            borderWidth: 2,
            pointRadius: 2,
            pointHoverRadius: 5,
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 200 },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.formattedValue} ${unit}`,
            },
          },
        },
        scales: {
          x: {
            ticks: {
              font: { size: 10 },
              maxTicksLimit: 8,
              color: '#9ca3af',
            },
            grid: { color: 'rgba(0,0,0,0.04)' },
          },
          y: {
            ticks: { font: { size: 10 }, color: '#9ca3af' },
            grid: { color: 'rgba(0,0,0,0.06)' },
          },
        },
      },
    });

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!chartRef.current || data.length === 0) return;
    chartRef.current.data.labels = data.map((d) => d.time);
    chartRef.current.data.datasets[0].data = data.map((d) => d.value);
    chartRef.current.update('none');
  }, [data]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">{label}</h3>
        <span className="text-xs text-gray-400 font-mono">{unit}</span>
      </div>
      <div className="h-40">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
