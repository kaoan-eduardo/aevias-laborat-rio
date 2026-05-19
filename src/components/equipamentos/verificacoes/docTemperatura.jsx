// FORM 051 — Checagem Diária de Temperatura
import { fmt_date, fmt_mes_ano, dias_no_mes, situacaoCell, COMMON_STYLES, docHeader } from './docUtils';

export function buildTemperaturaHtml(v) {
  const registros = v.registros || [];
  const total = dias_no_mes(v.mes_ano);
  const rows = Array.from({ length: 31 }, (_, i) => {
    const r = registros[i] || {};
    const ativo = i < total;
    const rubricaCell = ativo
      ? (r.rubrica_url
          ? `<img src="${r.rubrica_url}" style="height:50px;max-width:150px;object-fit:contain;vertical-align:middle"> <span style="font-size:7px">${r.responsavel || ''}</span>`
          : (r.responsavel || ''))
      : '';
    return `
      <tr style="height:15px">
        <td style="text-align:center;width:25px;${!ativo ? 'color:#ccc' : ''}">${i + 1}</td>
        <td style="width:110px">${ativo ? (r.valor_referencia || '') : ''}</td>
        <td style="width:110px">${ativo ? (r.valor_medido || '') : ''}</td>
        <td style="width:80px">${ativo ? (r.variacao || '') : ''}</td>
        <td style="text-align:center">${ativo ? situacaoCell(r.situacao) : ''}</td>
        <td>${rubricaCell}</td>
      </tr>`;
  }).join('');

  const aprovado = (v.resultado_geral === 'aprovado');
  const reprovado = (v.resultado_geral === 'reprovado');

  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
  <title>Checagem Diária de Temperatura — ${fmt_mes_ano(v.mes_ano)}</title>
  <style>${COMMON_STYLES}</style></head><body>
  <div class="top-bar">
    <span class="top-bar-title">Checagem Diária de Temperatura — ${v.equipamento_identificacao || ''} · ${fmt_mes_ano(v.mes_ano)}</span>
    <button class="btn-print" onclick="window.print()">&#128438; Gerar PDF</button>
  </div>
  <div class="doc">
    ${docHeader('CHECAGEM DIÁRIA DE TEMPERATURA', 'FORM 051', '02/09/2025', '04', v.mes_ano)}

    <div class="section-header">EQUIPAMENTO VERIFICADO</div>
    <table style="margin-bottom:4px">
      <tr>
        <td style="width:160px;background:#eee;font-weight:bold">Descrição do equipamento:</td>
        <td>${v.equipamento_nome || ''}</td>
        <td style="width:120px;background:#eee;font-weight:bold">Identificação:</td>
        <td style="width:140px">${v.equipamento_identificacao || ''}</td>
      </tr>
    </table>

    <div class="section-header" style="margin-top:4px">EQUIPAMENTO DE REFERÊNCIA</div>
    <table style="margin-bottom:4px">
      <tr>
        <td style="width:160px;background:#eee;font-weight:bold" rowspan="2">Descrição do equipamento:</td>
        <td rowspan="2">${v.eq_referencia_descricao || ''}</td>
        <td style="background:#eee;font-weight:bold;width:120px">Identificação:</td>
        <td style="width:140px">${v.eq_referencia_identificacao || ''}</td>
      </tr>
      <tr>
        <td style="background:#eee;font-weight:bold">Data da calibração:</td>
        <td>${fmt_date(v.eq_referencia_data_calibracao)}</td>
      </tr>
    </table>

    <div class="section-header" style="margin-top:4px">CHECAGEM DIÁRIA</div>
    <table style="margin-bottom:1px">
      <tr>
        <td colspan="6" style="background:#eee;padding:3px 6px;font-size:7px">
          <strong>Limite permitido:</strong> &nbsp;
          −18°C = |3,0°C| &nbsp;·&nbsp; 25°C = |0,5°C| &nbsp;·&nbsp; 40–60°C = |2,0°C| &nbsp;·&nbsp; 60–80°C = |3,0°C| &nbsp;·&nbsp;
          80–100°C = |4,0°C| &nbsp;·&nbsp; 100–120°C = |5,0°C| &nbsp;·&nbsp; 120–140°C = |6,0°C| &nbsp;·&nbsp;
          140–160°C = |7,0°C| &nbsp;·&nbsp; 160–180°C = |8,0°C|
        </td>
      </tr>
      <tr>
        <th style="width:25px">Dia</th>
        <th style="width:110px">Temperatura de referência (°C)</th>
        <th style="width:110px">Temperatura medida (°C)</th>
        <th style="width:80px">Variação (°C)</th>
        <th>Situação</th>
        <th>Responsável</th>
      </tr>
      ${rows}
    </table>

    <div class="section-header" style="margin-top:6px">OUTRAS INFORMAÇÕES</div>
    <div style="border:1px solid #999;min-height:36px;padding:4px 6px;font-size:8px;margin-bottom:4px">${v.outras_informacoes || '&nbsp;'}</div>

    <div class="section-header" style="margin-top:4px">FÓRMULA</div>
    <div style="border:1px solid #999;padding:5px 10px;text-align:center;font-style:italic;font-size:8.5px;margin-bottom:4px">
      v = Temperatura de referência − |Temperatura medida|
    </div>

    <div class="section-header" style="margin-top:4px">ANÁLISE CRÍTICA</div>
    <table style="margin-bottom:6px">
      <tr style="height:24px">
        <td style="width:80px;text-align:center">
          <span style="display:inline-block;width:9px;height:9px;border:1px solid #555;background:${aprovado ? '#222' : '#fff'}"></span> Aprovado
        </td>
        <td>Variações abaixo do máximo permitido em todos os pontos verificados do equipamento.</td>
      </tr>
      <tr style="height:24px">
        <td style="text-align:center">
          <span style="display:inline-block;width:9px;height:9px;border:1px solid #555;background:${reprovado ? '#222' : '#fff'}"></span> Reprovado
        </td>
        <td>&nbsp;</td>
      </tr>
    </table>

    <table>
      <tr>
        <td style="background:#eee;font-weight:bold;width:100px">Realizado por:</td>
        <td>${v.analise_critica_rubrica_url ? `<img src="${v.analise_critica_rubrica_url}" style="height:40px;max-width:150px;object-fit:contain;vertical-align:middle"> <span style="font-size:7px">${v.analise_critica_responsavel || ''}</span>` : (v.analise_critica_responsavel || '')}</td>
        <td style="background:#eee;font-weight:bold;width:50px">Data:</td>
        <td style="width:110px">${v.analise_critica_data ? fmt_date(v.analise_critica_data) : ''}</td>
      </tr>
    </table>

    <div class="doc-footer" style="margin-top:8px">
      <span>FORM 051 — REV 04 — 02/09/2025</span><span>Página 1 de 1</span>
    </div>
  </div></body></html>`;
}