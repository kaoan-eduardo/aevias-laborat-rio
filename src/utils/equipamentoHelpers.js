export const STATUS_EQUIPAMENTO = {
  em_uso: { label: 'Em Uso', color: 'bg-green-100 text-green-700' },
  em_calibracao: { label: 'Em Calibração', color: 'bg-blue-100 text-blue-700' },
  fora_de_uso: { label: 'Fora de Uso', color: 'bg-red-100 text-red-600' },
  em_manutencao: { label: 'Em Manutenção', color: 'bg-yellow-100 text-yellow-700' },
  em_aquisicao: { label: 'Em Aquisição', color: 'bg-purple-100 text-purple-700' },
};

export const PERIODICIDADE_LABELS = {
  quinzenal: 'Quinzenal',
  mensal: 'Mensal',
  trimestral: 'Trimestral',
  semestral: 'Semestral',
  anual: 'Anual',
};

export const formatSize = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const isCalibracaoVencida = (validade) => {
  if (!validade) return false;
  return new Date(validade) < new Date();
};

export const isCalibracaoProxima = (validade) => {
  if (!validade) return false;
  const diff = new Date(validade) - new Date();
  return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000; // 30 dias
};