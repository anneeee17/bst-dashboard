import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface SensorCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  borderColor: string;
  trend?: 'up' | 'down' | 'stable';
}

export default function SensorCard({
  label,
  value,
  unit,
  icon: Icon,
  color,
  bgColor,
  borderColor,
  trend,
}: SensorCardProps) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border ${borderColor} bg-white shadow-sm hover:shadow-md transition-shadow duration-300`}>
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full ${bgColor} opacity-10 translate-x-6 -translate-y-6`} />
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">{label}</span>
          <div className={`p-2 rounded-xl ${bgColor}`}>
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
        </div>
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold text-gray-900 tabular-nums">
            {typeof value === 'number' ? value.toLocaleString('id-ID') : value}
          </span>
          {unit && <span className={`text-base font-semibold ${color} mb-1`}>{unit}</span>}
        </div>
        {trend && (
          <div className="mt-2 flex items-center gap-1">
            <span className={`text-xs font-medium ${trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-red-400' : 'text-gray-400'}`}>
              {trend === 'up' ? '▲' : trend === 'down' ? '▼' : '—'} {trend === 'stable' ? 'Stabil' : trend === 'up' ? 'Naik' : 'Turun'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
