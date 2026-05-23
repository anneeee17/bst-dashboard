import React from 'react';
import { Sun, Cloud, Moon, CloudRain } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
}

function getStatusStyle(status: string): { bg: string; text: string; border: string; icon: React.ReactNode; label: string } {
  const s = status.toLowerCase();
  if (s.includes('terang') || s.includes('bright') || s.includes('sunny')) {
    return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: <Sun className="w-5 h-5" />, label: status };
  }
  if (s.includes('gelap') || s.includes('dark') || s.includes('night')) {
    return { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', icon: <Moon className="w-5 h-5" />, label: status };
  }
  if (s.includes('mendung') || s.includes('cloudy') || s.includes('overcast')) {
    return { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200', icon: <Cloud className="w-5 h-5" />, label: status };
  }
  if (s.includes('hujan') || s.includes('rain')) {
    return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: <CloudRain className="w-5 h-5" />, label: status };
  }
  return { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', icon: <Sun className="w-5 h-5" />, label: status };
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const style = getStatusStyle(status);
  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${style.bg} ${style.text} ${style.border} font-semibold text-sm`}>
      {style.icon}
      <span>{style.label}</span>
    </div>
  );
}
