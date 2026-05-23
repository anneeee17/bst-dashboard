import React from 'react';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';

interface ConnectionStatusProps {
  connected: boolean;
  error: string | null;
  lastUpdate?: number;
}

export default function ConnectionStatus({ connected, error, lastUpdate }: ConnectionStatusProps) {
  return (
    <div className="flex items-center gap-3">
      {error ? (
        <span className="flex items-center gap-1.5 text-red-500 text-sm font-medium">
          <AlertCircle className="w-4 h-4" />
          Error: {error}
        </span>
      ) : connected ? (
        <span className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium">
          <span className="relative flex w-2 h-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full w-2 h-2 bg-emerald-500" />
          </span>
          <Wifi className="w-4 h-4" />
          Live
          {lastUpdate && (
            <span className="text-gray-400 font-normal ml-1">
              — {new Date(lastUpdate).toLocaleTimeString('id-ID')}
            </span>
          )}
        </span>
      ) : (
        <span className="flex items-center gap-1.5 text-gray-400 text-sm font-medium">
          <WifiOff className="w-4 h-4" />
          Menghubungkan...
        </span>
      )}
    </div>
  );
}
