// Utilitários para lógica de negócio da FAS
// Centraliza funções reutilizáveis conforme regra de arquitetura

export const gerarNumeroFAS = (total) => {
  const ano = new Date().getFullYear();
  return `FAS-${ano}-${String(total + 1).padStart(4, '0')}`;
};

export const gerarCodigoAmostra = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return 'AM-' + Array.from(
    { length: 6 },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join('');
};

export const gerarAndamentoInicial = (dataAtual) => [
  { atividade: 'Abertura da FAS', data: dataAtual, concluida: true },
  { atividade: 'Recebimento do Material', data: null, concluida: false },
  { atividade: 'Envio do Relatório', data: null, concluida: false },
];

export const atualizarAndamento = (andamento, atividade, dataAtual) => {
  return (andamento || []).map(a =>
    a.atividade === atividade ? { ...a, data: dataAtual, concluida: true } : a
  );
};

export const obterDataHoje = () => new Date().toISOString().split('T')[0];

export const gerarNumeroProtocolo = (total) => {
  const ano = new Date().getFullYear().toString().slice(-2);
  return `${String(total + 1).padStart(4, '0')}/${ano}`;
};