import React, { useState, useEffect, useRef } from 'react';
import { Activity, Zap, Sun, Moon, Download, Wifi, WifiOff, Clock, Trash2, Lightbulb } from 'lucide-react';
import { useSensorData } from './hooks/useSensorData';
import ConnectionStatus from './components/ConnectionStatus';
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

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip, Legend);

interface HistoryEntry {
  timestamp: string;
  timestampFull: string;
  status_cahaya: string;
  lux_bh1750: number;
  tegangan_bst: number;
  adc_ads1115: number;
}

const MAX_HISTORY = 50;

function formatTimestampFull(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function CombinedChart({ luxData, teganganData, darkMode }: {
  luxData: { time: string; value: number }[];
  teganganData: { time: string; value: number }[];
  darkMode: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const gridColor = darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
    const tickColor = darkMode ? '#94a3b8' : '#6b7280';

    chartRef.current = new Chart(canvasRef.current, {
      type: 'line',
      data: {
        labels: luxData.map((d) => d.time),
        datasets: [
          {
            label: 'Lux BH1750 (lx)',
            data: luxData.map((d) => d.value),
            borderColor: '#10b981',
            backgroundColor: 'rgba(16,185,129,0.12)',
            borderWidth: 2,
            pointRadius: 2,
            pointHoverRadius: 5,
            fill: true,
            tension: 0.4,
            yAxisID: 'yLux',
          },
          {
            label: 'Tegangan BST (mV)',
            data: teganganData.map((d) => d.value),
            borderColor: '#378ADD',
            backgroundColor: 'rgba(55,138,221,0.10)',
            borderWidth: 2,
            pointRadius: 2,
            pointHoverRadius: 5,
            fill: true,
            tension: 0.4,
            yAxisID: 'yTeg',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 300 },
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            display: true,
            labels: { color: tickColor, font: { size: 12 }, usePointStyle: true, pointStyleWidth: 10 },
          },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const unit = ctx.dataset.yAxisID === 'yLux' ? 'lx' : 'mV';
                return ` ${ctx.dataset.label?.split(' ')[0]}: ${ctx.formattedValue} ${unit}`;
              },
            },
          },
        },
        scales: {
          x: {
            ticks: { font: { size: 10 }, maxTicksLimit: 8, color: tickColor },
            grid: { color: gridColor },
          },
          yLux: {
            type: 'linear',
            position: 'left',
            ticks: { font: { size: 10 }, color: '#10b981' },
            grid: { color: gridColor },
            title: { display: true, text: 'Lux (lx)', color: '#10b981', font: { size: 11 } },
          },
          yTeg: {
            type: 'linear',
            position: 'right',
            ticks: { font: { size: 10 }, color: '#378ADD' },
            grid: { drawOnChartArea: false },
            title: { display: true, text: 'Tegangan (mV)', color: '#378ADD', font: { size: 11 } },
          },
        },
      },
    });

    return () => { chartRef.current?.destroy(); chartRef.current = null; };
  }, []);

  useEffect(() => {
    if (!chartRef.current) return;
    chartRef.current.data.labels = luxData.map((d) => d.time);
    chartRef.current.data.datasets[0].data = luxData.map((d) => d.value);
    chartRef.current.data.datasets[1].data = teganganData.map((d) => d.value);
    chartRef.current.update('none');
  }, [luxData, teganganData]);

  return <canvas ref={canvasRef} />;
}

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [clock, setClock] = useState('');
  const prevTimestamp = useRef<number>(0);

  const { data, connected, error, histories } = useSensorData('/sensor');

  const teganganValues = history.map(h => h.tegangan_bst);
  const minTegangan = teganganValues.length > 0 ? Math.round(Math.min(...teganganValues)) : null;
  const maxTegangan = teganganValues.length > 0 ? Math.round(Math.max(...teganganValues)) : null;

  const teganganRangeMin = 900;
  const teganganRangeMax = 1300;
  const teganganPct = data
    ? Math.min(100, Math.max(0, ((Math.round(data.tegangan_bst) - teganganRangeMin) / (teganganRangeMax - teganganRangeMin)) * 100))
    : 0;

  const luxRangeMax = 1000;
  const luxPct = data
    ? Math.min(100, Math.max(0, (Math.round(data.lux_bh1750) / luxRangeMax) * 100))
    : 0;

  useEffect(() => {
    const tick = () => setClock(formatTimestampFull(Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!data) return;
    const ts = data.timestamp ?? Date.now();
    if (ts === prevTimestamp.current) return;
    prevTimestamp.current = ts;

    const entry: HistoryEntry = {
      timestamp: new Date(ts).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      timestampFull: formatTimestampFull(ts),
      status_cahaya: data.status_cahaya,
      lux_bh1750: data.lux_bh1750,
      tegangan_bst: data.tegangan_bst,
      adc_ads1115: data.adc_ads1115,
    };

    setHistory(prev => {
      const next = [entry, ...prev];
      return next.length > MAX_HISTORY ? next.slice(0, MAX_HISTORY) : next;
    });
  }, [data]);

  const bg = darkMode ? 'bg-slate-950 text-white' : 'bg-gray-50 text-gray-900';
  const cardBg = darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200';
  const subText = darkMode ? 'text-slate-400' : 'text-gray-500';
  const headerBg = darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100';

  const isTerangNow = data?.status_cahaya?.toLowerCase().includes('terang') ||
    data?.status_cahaya?.toLowerCase().includes('siang') ||
    data?.status_cahaya?.toLowerCase().includes('cerah');
  const statusIcon = isTerangNow ? '☀️' : '🌑';

  const exportPDF = async () => {
    if (history.length === 0 && !data) return;

    const script1 = document.createElement('script');
    script1.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    document.head.appendChild(script1);
    await new Promise(r => { script1.onload = r; });

    const script2 = document.createElement('script');
    script2.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js';
    document.head.appendChild(script2);
    await new Promise(r => { script2.onload = r; });

    const { jsPDF } = (window as any).jspdf;
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    doc.setFontSize(18);
    doc.setTextColor(55, 138, 221);
    doc.text('BST Sensor Monitor - Laporan Data', 14, 18);
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Diekspor pada: ${formatTimestampFull(Date.now())}`, 14, 26);
    doc.text(`Total Data: ${history.length} entri`, 14, 32);

    if (data) {
      doc.setFontSize(11);
      doc.setTextColor(30, 30, 30);
      doc.text('Data Terkini:', 14, 42);
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text(`Tegangan BST: ${Math.round(data.tegangan_bst)} mV   |   Lux BH1750: ${Math.round(data.lux_bh1750)} lx   |   Status: ${data.status_cahaya}`, 14, 49);
    }

    const rows = history.map((h, i) => [
      i + 1,
      h.timestampFull,
      h.status_cahaya,
      `${Math.round(h.lux_bh1750)} lx`,
      `${Math.round(h.tegangan_bst)} mV`,
    ]);

    (doc as any).autoTable({
      startY: 55,
      head: [['No', 'Timestamp', 'Status Cahaya', 'Lux BH1750', 'Tegangan BST']],
      body: rows,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [55, 138, 221], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 48 },
        2: { cellWidth: 35 },
        3: { cellWidth: 30, halign: 'right' },
        4: { cellWidth: 35, halign: 'right' },
      },
    });

    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Halaman ${i} dari ${pageCount}  —  BST Sensor Monitor`, 14, doc.internal.pageSize.height - 8);
    }

    doc.save(`BST_Report_${formatTimestampFull(Date.now()).replace(/[/:]/g, '-')}.pdf`);
  };

  return (
    <div className={`${bg} min-h-screen transition-all duration-300`}>
      {/* HEADER */}
      <header className={`${headerBg} border-b sticky top-0 z-40 shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-xl">
                <Activity className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold">BST Sensor Monitor</h1>
                <p className={`${subText} text-xs`}>Realtime Firebase Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg ${darkMode ? 'bg-slate-800' : 'bg-gray-100'} font-mono text-xs`}>
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>{clock}</span>
              </div>
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                ${connected ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                {connected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
                {connected ? 'Live' : 'Offline'}
              </div>
              <button
                onClick={exportPDF}
                disabled={history.length === 0 && !data}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white text-xs font-semibold transition"
              >
                <Download className="w-3.5 h-3.5" />
                Export PDF
              </button>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg ${darkMode ? 'bg-slate-800 text-yellow-300' : 'bg-gray-200 text-gray-700'} transition`}
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* HERO: SPLIT PANEL */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`${cardBg} border-l-4 border-l-blue-500 border-t border-r border-b rounded-r-2xl rounded-l-none p-6`}>
            <div className={`flex items-center gap-2 text-xs uppercase tracking-wider ${subText} mb-3`}>
              <Zap className="w-4 h-4 text-blue-400" />
              <span>Tegangan BST</span>
              <span className="ml-auto flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
                <span className="text-emerald-400 text-xs">Live</span>
              </span>
            </div>
            <div className="text-5xl font-bold tabular-nums leading-none" style={{ color: '#378ADD' }}>
              {data ? Math.round(data.tegangan_bst) : '—'}
            </div>
            <div className={`text-sm ${subText} mt-1`}>mV · {clock}</div>
            <div className="mt-4">
              <div className={`h-1.5 rounded-full overflow-hidden ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${teganganPct}%`, background: '#378ADD' }} />
              </div>
              <div className={`flex justify-between text-xs mt-1 ${subText}`}>
                <span>Min {minTegangan !== null ? minTegangan : teganganRangeMin} mV</span>
                <span>Max {maxTegangan !== null ? maxTegangan : teganganRangeMax} mV</span>
              </div>
            </div>
          </div>

          <div className={`${cardBg} border-l-4 border-l-emerald-500 border-t border-r border-b rounded-r-2xl rounded-l-none p-6`}>
            <div className={`flex items-center gap-2 text-xs uppercase tracking-wider ${subText} mb-3`}>
              <Lightbulb className="w-4 h-4 text-emerald-400" />
              <span>Intensitas Cahaya</span>
            </div>
            <div className="text-5xl font-bold tabular-nums leading-none text-emerald-400">
              {data ? Math.round(data.lux_bh1750) : '—'}
            </div>
            <div className={`text-sm ${subText} mt-1`}>lux</div>
            <div className="mt-4">
              <div className={`h-1.5 rounded-full overflow-hidden ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${luxPct}%`, background: '#10b981' }} />
              </div>
              <div className={`flex justify-between text-xs mt-1 ${subText}`}>
                <span>0 lx</span>
                <span>{luxRangeMax} lx</span>
              </div>
            </div>
          </div>
        </div>

        {/* STATUS PANEL */}
        <div className={`${cardBg} border rounded-2xl p-4`}>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-3 flex-1">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${isTerangNow ? 'bg-yellow-400/15' : darkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
                {statusIcon}
              </div>
              <div>
                <div className={`text-xs ${subText} uppercase tracking-wider`}>Status cahaya</div>
                <div className="font-semibold text-sm">{data?.status_cahaya ?? 'Menunggu...'}</div>
              </div>
            </div>
            <div className={`hidden sm:block w-px ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`} />
            <div className="flex items-center gap-3 flex-1">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-blue-500/15' : 'bg-blue-50'}`}>
                <Activity className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className={`text-xs ${subText} uppercase tracking-wider`}>Data tersimpan</div>
                <div className="font-semibold text-sm">{history.length} entri</div>
              </div>
            </div>
            <div className={`hidden sm:block w-px ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`} />
            <div className="flex items-center gap-3 flex-1">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
                <Zap className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className={`text-xs ${subText} uppercase tracking-wider`}>Min / Maks sesi ini</div>
                <div className="font-semibold text-sm">
                  {minTegangan !== null ? `${minTegangan} / ${maxTegangan} mV` : '— mV'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CHART */}
        <div className={`${cardBg} border rounded-2xl shadow-lg p-5`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold">📈 Grafik Lux & Tegangan BST</h2>
              <p className={`${subText} text-xs mt-0.5`}>Monitoring realtime intensitas cahaya vs tegangan output</p>
            </div>
            <div className="flex gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" /> Lux (lx)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-400 inline-block" /> Tegangan (mV)
              </span>
            </div>
          </div>
          <div className="h-64">
            <CombinedChart luxData={histories.lux} teganganData={histories.tegangan} darkMode={darkMode} />
          </div>
        </div>

        {/* RIWAYAT DATA */}
        <div className={`${cardBg} border rounded-2xl shadow-lg overflow-hidden`}>
          <div className={`flex items-center justify-between px-5 py-4 border-b ${darkMode ? 'border-slate-800' : 'border-gray-200'}`}>
            <div>
              <h2 className="text-lg font-bold">📋 Riwayat Data Sensor</h2>
              <p className={`${subText} text-xs mt-0.5`}>{history.length} entri tersimpan</p>
            </div>
            <button
              onClick={() => setHistory([])}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs transition"
            >
              <Trash2 className="w-3.5 h-3.5" /> Bersihkan
            </button>
          </div>

          {history.length === 0 ? (
            <div className={`text-center py-12 ${subText}`}>
              <Activity className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>Menunggu data masuk dari Firebase...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={`${darkMode ? 'bg-slate-800/60 text-slate-300' : 'bg-gray-50 text-gray-600'} text-xs uppercase tracking-wider`}>
                    <th className="px-4 py-3 text-left">#</th>
                    <th className="px-4 py-3 text-left">Timestamp</th>
                    <th className="px-4 py-3 text-left">Status Cahaya</th>
                    <th className="px-4 py-3 text-right">Lux (lx)</th>
                    <th className="px-4 py-3 text-right">Tegangan BST (mV)</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h, i) => {
                    const isTerang = h.status_cahaya?.toLowerCase().includes('terang') ||
                      h.status_cahaya?.toLowerCase().includes('siang') ||
                      h.status_cahaya?.toLowerCase().includes('cerah');
                    return (
                      <tr
                        key={i}
                        className={`border-t transition-colors
                          ${darkMode ? 'border-slate-800 hover:bg-slate-800/40' : 'border-gray-100 hover:bg-gray-50'}
                          ${i === 0 ? (darkMode ? 'bg-blue-500/5' : 'bg-blue-50') : ''}`}
                      >
                        <td className={`px-4 py-2.5 ${subText} font-mono text-xs`}>{history.length - i}</td>
                        <td className="px-4 py-2.5 font-mono text-xs">{h.timestampFull}</td>
                        <td className="px-4 py-2.5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
                            ${isTerang ? 'bg-yellow-400/15 text-yellow-400' : 'bg-slate-700/50 text-slate-300'}`}>
                            {isTerang ? '☀️' : '🌑'} {h.status_cahaya}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono text-emerald-400 font-semibold">{Math.round(h.lux_bh1750)}</td>
                        <td className="px-4 py-2.5 text-right font-mono text-blue-400 font-bold">{Math.round(h.tegangan_bst)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}