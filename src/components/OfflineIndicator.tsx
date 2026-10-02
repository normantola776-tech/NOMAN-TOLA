import React from 'react';
import { WifiOff } from 'lucide-react';
import { usePWAInstall } from '../utils/usePWAInstall.ts';

export const OfflineIndicator: React.FC = () => {
  const { isOnline } = usePWAInstall();

  if (isOnline) return null;

  return (
    <aside
      aria-label="Offline status"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xl animate-in slide-in-from-bottom-2"
    >
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
      </span>
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>Offline Mode — Cached study notes and local sessions available.</span>
    </aside>
  );
};
