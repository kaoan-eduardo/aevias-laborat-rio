const TZ = 'America/Sao_Paulo';

/** Retorna a data atual no fuso de São Paulo como objeto Date */
export function nowSP() {
  return new Date(new Date().toLocaleString('en-US', { timeZone: TZ }));
}

/** Retorna a data atual no formato YYYY-MM-DD no fuso de São Paulo */
export function todaySP() {
  const d = nowSP();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Retorna o mês atual no formato YYYY-MM no fuso de São Paulo */
export function currentMonthSP() {
  const d = nowSP();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

/**
 * Formata uma string YYYY-MM para "mês de YYYY" em PT-BR sem problemas de fuso.
 * Ex: "2026-04" → "abril de 2026"
 */
export function formatMesAno(mesAno) {
  if (!mesAno) return '—';
  const [year, month] = mesAno.split('-').map(Number);
  // Usa dia 15 para evitar qualquer problema de borda de fuso horário
  const d = new Date(year, month - 1, 15);
  return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}

/**
 * Formata uma string de data (YYYY-MM-DD ou ISO) em PT-BR no fuso de São Paulo.
 * Ex: "2026-04-10" → "10/04/2026"
 */
export function formatDateSP(dateStr, opts = {}) {
  if (!dateStr) return '—';
  // Parse seguro: se vier YYYY-MM-DD, usa construtor com partes para evitar UTC shift
  let date;
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, mo, d] = dateStr.split('-').map(Number);
    date = new Date(y, mo - 1, d);
  } else {
    date = new Date(dateStr);
  }
  return date.toLocaleDateString('pt-BR', { timeZone: TZ, ...opts });
}

/**
 * Formata um Date ou string ISO com hora em PT-BR no fuso de São Paulo.
 */
export function formatDateTimeSP(dateInput) {
  if (!dateInput) return '—';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  return date.toLocaleString('pt-BR', { timeZone: TZ });
}