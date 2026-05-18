// FORM 017 — Checagem Diária das Balanças
import { fmt_date, fmt_mes_ano, dias_no_mes, situacaoCell, COMMON_STYLES, docHeader } from './docUtils';

export function buildBalancaHtml(v) {
  const registros = v.registros || [];
  const total = dias_no_mes(v.mes_ano);
  const rows = Array.from({ length: 31 }, (_, i) => {
    const r = registros[i] || {};
    const ativo = i < total;
    const rubricaCell = ativo
      ? (r.rubrica_url
          ? `<img src="${r.rubrica_url}" style="height:50px;max-width:100px;object-fit:contain;vertical-align:middle"> <span style="font-size:7px">${r.responsavel || ''}</span>`
          : (r.responsavel || ''))
      : '';
    return `
      <tr style="height:15px;${!ativo ? 'color:#bbb' : ''}">
        <td style="text-align:center;width:30px;${!ativo ? 'color:#ccc' : ''}">${i + 1}</td>
        <td style="width:180px">${ativo ? (r.valor_medido || '') : ''}</td>
        <td style="text-align:center">${ativo ? situacaoCell(r.situacao) : ''}</td>
        <td>${rubricaCell}</td>
      </tr>`;
  }).join('');

  const aprovado = (v.resultado_geral === 'aprovado');
  const reprovado = (v.resultado_geral === 'reprovado');

  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
  <title>Checagem Diária das Balanças — ${fmt_mes_ano(v.mes_ano)}</title>
  <style>${COMMON_STYLES}</style></head><body>
  <div class="top-bar">
    <span class="top-bar-title">Checagem Diária das Balanças — ${v.equipamento_identificacao || ''} · ${fmt_mes_ano(v.mes_ano)}</span>
    <button class="btn-print" onclick="window.print()">&#128438; Gerar PDF</button>
  </div>
  <div class="doc">
    ${docHeader('CHECAGEM DIÁRIA DAS BALANÇAS', 'FORM 017', '04/03/2025', '03', v.mes_ano)}

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
        <td rowspan="2">CONJUNTO PESO PADRÃO &nbsp; ${v.eq_referencia_descricao || ''}</td>
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
        <td colspan="4" style="background:#eee;padding:3px 6px;font-size:7.5px">
          <strong>Limites permitidos:</strong> &nbsp;&nbsp;
          MÍNIMO: ${v.limites_permitidos ? v.limites_permitidos.split('/')[0] : '1991,11'} &nbsp;&nbsp;&nbsp;
          MÁXIMO: ${v.limites_permitidos ? v.limites_permitidos.split('/')[1] : '2011,72'}
        </td>
      </tr>
      <tr>
        <th style="width:30px">Dia</th>
        <th style="width:180px">Resultado obtido (g)</th>
        <th>Situação</th>
        <th>Responsável</th>
      </tr>
      ${rows}
    </table>

    <div class="section-header" style="margin-top:6px">OUTRAS INFORMAÇÕES</div>
    <div style="border:1px solid #999;min-height:36px;padding:4px 6px;font-size:8px;margin-bottom:4px">${v.outras_informacoes || '&nbsp;'}</div>

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
        <td>${v.analise_critica_rubrica_url ? `<img src="${v.analise_critica_rubrica_url}" style="height:40px;max-width:120px;object-fit:contain;vertical-align:middle"> <span style="font-size:7px">${v.analise_critica_responsavel || ''}</span>` : (v.analise_critica_responsavel || '')}</td>
        <td style="background:#eee;font-weight:bold;width:50px">Data:</td>
        <td style="width:110px">${v.analise_critica_data ? fmt_date(v.analise_critica_data) : ''}</td>
      </tr>
    </table>

    <div style="display:flex;justify-content:space-between;border-top:1px solid #ccc;margin-top:8px;padding-top:3px;font-size:7px;color:#888">
      <span>FORM 017 — REV 03 — 04/03/2025</span>
      <span class="page-counter"></span>
    </div>
  </div></body>`;
}