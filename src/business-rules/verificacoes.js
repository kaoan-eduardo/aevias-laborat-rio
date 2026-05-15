// Regras de negócio para Verificações Diárias
// Centraliza validações e limites — não contém lógica de UI

// ── Balança ──────────────────────────────────────────────
export const BALANCA_MIN = 1991.11;
export const BALANCA_MAX = 2011.72;

export function avaliarSituacaoBalanca(valorStr) {
  const v = parseFloat(String(valorStr).replace(',', '.'));
  if (isNaN(v) || valorStr === '') return '';
  return (v >= BALANCA_MIN && v <= BALANCA_MAX) ? 'aprovado' : 'reprovado';
}

// ── Temperatura ──────────────────────────────────────────
export function getLimiteTemperatura(ref) {
  const v = parseFloat(ref);
  if (isNaN(v)) return null;
  if (v === -18) return 3.0;
  if (v === 25) return 0.5;
  if (v >= 40 && v <= 60) return 2.0;
  if (v > 60 && v <= 80) return 3.0;
  if (v > 80 && v <= 100) return 4.0;
  if (v > 100 && v <= 120) return 5.0;
  if (v > 120 && v <= 140) return 6.0;
  if (v > 140 && v <= 160) return 7.0;
  if (v > 160 && v <= 180) return 8.0;
  return null;
}

export function avaliarSituacaoTemperatura(refStr, variacaoStr) {
  if (refStr === '' || variacaoStr === '') return '';
  const limite = getLimiteTemperatura(refStr);
  if (limite === null) return '';
  const variacao = Math.abs(parseFloat(variacaoStr));
  if (isNaN(variacao)) return '';
  return variacao <= limite ? 'aprovado' : 'reprovado';
}

// ── Densidade ────────────────────────────────────────────
export const LIMITES_DENSIDADE = {
  'Sulfato de Sódio':    { min: 1.151, max: 1.174 },
  'Sulfato de Magnésio': { min: 1.295, max: 1.308 },
};

export function avaliarSituacaoDensidade(solucao, comAmostra, semAmostra) {
  const limites = LIMITES_DENSIDADE[solucao];
  if (!limites) return '';
  const com = parseFloat(String(comAmostra).replace(',', '.'));
  const sem = parseFloat(String(semAmostra).replace(',', '.'));
  if (isNaN(com) || isNaN(sem) || comAmostra === '' || semAmostra === '') return '';
  return (com >= limites.min && com <= limites.max && sem >= limites.min && sem <= limites.max)
    ? 'aprovado'
    : 'reprovado';
}

// ── Utilitário ───────────────────────────────────────────
export function getHorarioSP() {
  return new Date().toLocaleTimeString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function buildRegistros() {
  return Array.from({ length: 31 }, (_, i) => ({
    dia: i + 1,
    valor_referencia: '',
    valor_medido: '',
    variacao: '',
    horario: '',
    temperatura: '',
    densidade_com_amostra: '',
    densidade_sem_amostra: '',
    situacao: '',
    responsavel: '',
    rubrica_url: '',
  }));
}