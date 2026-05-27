import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

const CONFIG = {
  synced: {
    label: 'Sincronizado',
    icon: CheckCircle2,
    className: 'bg-green-100 text-green-700',
  },
  pending: {
    label: 'Salvo no dispositivo',
    icon: Clock,
    className: 'bg-orange-100 text-orange-600',
  },
  error: {
    label: 'Erro ao sincronizar',
    icon: AlertCircle,
    className: 'bg-red-100 text-red-600',
  },
};

export default function SyncBadge({ statusSync }) {
  const config = CONFIG[statusSync];
  if (!config) return null;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.className}`}
      aria-label={`Status de sincronização: ${config.label}`}
    >
      <Icon className="w-3 h-3" aria-hidden="true" />
      {config.label}
    </span>
  );
}