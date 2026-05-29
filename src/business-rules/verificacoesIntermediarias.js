// ============================================================
// Regras de negócio — Verificações Intermediárias
// ============================================================

// --- BALANÇA ---
export const BALANCA_INTERMEDIARIA_LIMITE_PCT = 0.5;

export function buildRegistrosBalancaIntermediaria() {
  return [1, 2, 3].map(n => ({
    medicao: n,
    valor_certificado: '',
    posicoes: ['', '', '', '', ''],
    variacoes: ['', '', '', '', ''],
    situacao: '',
    responsavel: '',
    outras_informacoes: '',
  }));
}

export function calcularVariacaoBalancaIntermediaria(valorCertificado, valorMedido) {
  const cert = parseFloat(valorCertificado);
  const med = parseFloat(valorMedido);
  if (isNaN(cert) || isNaN(med) || cert === 0) return '';
  const variacao = Math.abs((cert - med) / cert) * 100;
  return variacao.toFixed(3);
}

export function avaliarSituacaoBalancaIntermediaria(variacao) {
  if (variacao === '' || variacao === null || variacao === undefined) return '';
  const v = parseFloat(variacao);
  if (isNaN(v)) return '';
  return v <= BALANCA_INTERMEDIARIA_LIMITE_PCT ? 'aprovado' : 'reprovado';
}

// --- TEMPERATURA ---
export const TEMPERATURA_INTERMEDIARIA_LIMITE_PCT = 5;

export function buildRegistrosTemperaturaIntermediaria() {
  const linhaVazia = () => ({
    data: '',
    t1_t2: '',
    temperatura_celsius: '',
    variacao_pct: '',
    situacao: '',
    responsavel: '',
  });
  return {
    checagem_principal: Array.from({ length: 5 }, linhaVazia),
    outras_checagens: Array.from({ length: 5 }, linhaVazia),
    analise_critica_principal: { resultado: 'em_andamento', responsavel: '', data: '' },
  };
}

export function calcularVariacaoTemperaturaIntermediaria(tempPadrao, tempEquipamento) {
  const padrao = parseFloat(tempPadrao);
  const equip = parseFloat(tempEquipamento);
  if (isNaN(padrao) || isNaN(equip) || padrao === 0) return '';
  const variacao = Math.abs((padrao - equip) / padrao) * 100;
  return variacao.toFixed(2);
}

export function avaliarSituacaoTemperaturaIntermediaria(variacao) {
  if (variacao === '' || variacao === null || variacao === undefined) return '';
  const v = parseFloat(variacao);
  if (isNaN(v)) return '';
  return v <= TEMPERATURA_INTERMEDIARIA_LIMITE_PCT ? 'aprovado' : 'reprovado';
}

// --- PAQUÍMETRO ---
export const PAQUIMETRO_LIMITE_PCT = 2;

export function buildRegistrosPaquimetroIntermediario() {
  return [1, 2, 3, 4].map(n => ({
    bloco: n,
    valor_referencia_mm: '',
    resultado_obtido: '',
    variacao_pct: '',
    situacao: '',
    leituras: [1, 2, 3].map(num => ({ numero: num, situacao: '', responsavel: '' })),
    outras_informacoes: '',
  }));
}

export function calcularVariacaoPaquimetro(valorReferencia, resultadoObtido) {
  const ref = parseFloat(valorReferencia);
  const res = parseFloat(resultadoObtido);
  if (isNaN(ref) || isNaN(res) || ref === 0) return '';
  const variacao = Math.abs((ref - res) / ref) * 100;
  return variacao.toFixed(3);
}

export function avaliarSituacaoPaquimetro(variacao) {
  if (variacao === '' || variacao === null || variacao === undefined) return '';
  const v = parseFloat(variacao);
  if (isNaN(v)) return '';
  return v <= PAQUIMETRO_LIMITE_PCT ? 'aprovado' : 'reprovado';
}