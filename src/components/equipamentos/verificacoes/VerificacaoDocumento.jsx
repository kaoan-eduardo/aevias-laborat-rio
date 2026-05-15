/**
 * VerificacaoDocumento.jsx
 * Ponto de entrada — re-exporta builders e expõe openVerificacaoImpressao.
 *
 * Documentos separados por tipo:
 *   docBalanca.js    → FORM 017
 *   docTemperatura.js → FORM 051
 *   docDensidade.js  → FORM 069
 *   docUtils.js      → utilitários compartilhados
 */

export { buildBalancaHtml } from './docBalanca';
export { buildTemperaturaHtml } from './docTemperatura';
export { buildDensidadeHtml } from './docDensidade';

import { buildBalancaHtml } from './docBalanca';
import { buildTemperaturaHtml } from './docTemperatura';
import { buildDensidadeHtml } from './docDensidade';

const BUILDERS = {
  balanca: buildBalancaHtml,
  temperatura: buildTemperaturaHtml,
  densidade: buildDensidadeHtml,
};

/** Abre a impressão em nova aba de acordo com o tipo da verificação */
export function openVerificacaoImpressao(verificacao) {
  const build = BUILDERS[verificacao.tipo];
  if (!build) return;
  const html = build(verificacao);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}