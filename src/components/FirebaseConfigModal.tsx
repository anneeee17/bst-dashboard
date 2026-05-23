import React, { useState } from 'react';
import { X, Database, AlertTriangle } from 'lucide-react';

interface FirebaseConfigModalProps {
  onClose: () => void;
}

export default function FirebaseConfigModal({ onClose }: FirebaseConfigModalProps) {
  const [copied, setCopied] = useState(false);

  const envExample = `VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id`;

  const dataStructure = `{
  "sensor": {
    "tegangan_bst": 3300,
    "adc_ads1115": 16384,
    "lux_bh1750": 512.5,
    "status_cahaya": "Terang",
    "timestamp": 1700000000000
  }
}`;

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-50 rounded-xl">
              <Database className="w-5 h-5 text-orange-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Konfigurasi Firebase</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-xl p-4">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700">
              Dashboard ini membutuhkan Firebase Realtime Database. Tambahkan variabel lingkungan berikut ke file <code className="bg-amber-100 px-1 rounded">.env</code> Anda.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-700">File .env</h3>
              <button
                onClick={() => copy(envExample)}
                className="text-xs text-sky-600 hover:text-sky-700 font-medium transition-colors"
              >
                {copied ? 'Tersalin!' : 'Salin'}
              </button>
            </div>
            <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 text-xs overflow-x-auto font-mono leading-relaxed">
              {envExample}
            </pre>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Struktur Data Firebase</h3>
            <p className="text-xs text-gray-500 mb-2">Simpan data sensor di path <code className="bg-gray-100 px-1 rounded">/sensor</code></p>
            <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 text-xs overflow-x-auto font-mono leading-relaxed">
              {dataStructure}
            </pre>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-semibold text-sm transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
