// Ponto de entrada para impressão das verificações intermediárias
import { buildInterBalancaHtml } from './docInterBalanca';
import { buildInterTemperaturaHtml } from './docInterTemperatura';
import { buildInterPaquimetroHtml } from './docInterPaquimetro';

const BUILDERS = {
  balanca:     buildInterBalancaHtml,
  temperatura: buildInterTemperaturaHtml,
  paquimetro:  buildInterPaquimetroHtml,
};

export function openVerificacaoInterImpressao(verificacao) {
  const build = BUILDERS[verificacao.tipo];
  if (!build) return;
  const html = build(verificacao);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}