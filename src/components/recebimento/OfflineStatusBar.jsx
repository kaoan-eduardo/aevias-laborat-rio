import { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';
import { dispararSincronizacao } from '@/hooks/useAmostrasOffline';

export default function OfflineStatusBar({ pendentesCount }) {
  const [online, setOnline] = useState(navigator.onLine);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const setOn = () => setOnline(true);
    const setOff = () => setOnline(false);
    window.addEventListener('online', setOn);
    window.addEventListener('offline', setOff);
    return () => {
      window.removeEventListener('online', setOn);
      window.removeEventListener('offline', setOff);
    };
  }, []);

  const handleSyncManual = async () => {
    if (!online || syncing) return;
    setSyncing(true);
    await dispararSincronizacao();
    setSyncing(false);
  };

  if (online && pendentesCount === 0) return null;

  return (
    <div
      role={online ? 'status' : 'alert'}
      aria-live={online ? 'polite' : 'assertive'}
      aria-atomic="true"
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
        !online
          ? 'bg-orange-50 border border-orange-200 text-orange-700'
          : 'bg-blue-50 border border-blue-200 text-blue-700'
      }`}
    >
      {!online ? (
        <WifiOff className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
      ) : (
        <Wifi className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
      )}

      <span>
        {!online
          ? `Modo offline — ${pendentesCount} registro${pendentesCount !== 1 ? 's' : ''} salvo${pendentesCount !== 1 ? 's' : ''} no dispositivo. Será sincronizado ao reconectar.`
          : `${pendentesCount} registro${pendentesCount !== 1 ? 's' : ''} pendente${pendentesCount !== 1 ? 's' : ''} de sincronização.`}
      </span>

      {online && pendentesCount > 0 && (
        <button
          onClick={handleSyncManual}
          disabled={syncing}
          aria-label="Sincronizar agora"
          className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-semibold transition-colors disabled:opacity-60"
        >
          <RefreshCw className={`w-3 h-3 ${syncing ? 'animate-spin' : ''}`} aria-hidden="true" />
          {syncing ? 'Sincronizando...' : 'Sincronizar agora'}
        </button>
      )}
    </div>
  );
}