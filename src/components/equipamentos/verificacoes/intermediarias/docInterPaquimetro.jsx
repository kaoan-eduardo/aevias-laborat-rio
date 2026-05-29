// FORM 082 — Checagem Intermediária dos Paquímetros
import { fmt_date, fmt_mes_ano, COMMON_STYLES, docHeader } from '../docUtils';

export function buildInterPaquimetroHtml(v) {
  const registros = v.registros || [];
  const aprovado = v.resultado_geral === 'aprovado';
  const reprovado = v.resultado_geral === 'reprovado';

  const checkbox = (checked) =>
    `<span style="display:inline-block;width:9px;height:9px;border:1px solid #555;background:${checked ? '#222' : '#fff'};vertical-align:middle"></span>`;

  const situacaoInline = (sit) => {
    const ap = sit === 'aprovado';
    const re = sit === 'reprovado';
    return `<span style="font-size:7.5px">${checkbox(ap)} APROVADO &nbsp; ${checkbox(re)} REPROVADO</span>`;
  };

  // Cada bloco de medição (até 4 blocos, 2 leituras por bloco)
  const blocos = [0, 1, 2, 3].map(idx => {
    const reg = registros[idx] || {};
    const posicoes = reg.posicoes || ['', ''];
    const variacoes = reg.variacoes || ['', ''];
    const leituras = reg.leituras || [];
    const sit0 = leituras[0]?.situacao || posicoes[0] ? (reg.situacao || '') : '';
    const sit1 = leituras[1]?.situacao || posicoes[1] ? (reg.situacao || '') : '';

    return `
      <div class="section-header" style="margin-top:4px">
        CHECAGEM INTERMEDIÁRIA<br><span style="font-size:7px;font-weight:400">Variação permitida: 2%</span>
      </div>
      <table>
        <tr>
          <th style="width:110px">Valor de referência (mm)</th>
          <th style="width:90px">Resultado obtido</th>
          <th style="width:70px">Variação (%)</th>
          <th>Situação</th>
          <th style="width:110px">Responsável</th>
        </tr>
        <tr style="height:18px">
          <td style="text-align:center" rowspan="2">${reg.valor_certificado || ''}</td>
          <td style="text-align:center">${posicoes[0] || ''}</td>
          <td style="text-align:center;font-size:7.5px">${variacoes[0] !== '' && variacoes[0] != null ? variacoes[0] + '%' : ''}</td>
          <td style="text-align:center">${situacaoInline(leituras[0]?.situacao || '')}</td>
          <td>${leituras[0]?.responsavel || ''}</td>
        </tr>
        <tr style="height:18px">
          <td style="text-align:center">${posicoes[1] || ''}</td>
          <td style="text-align:center;font-size:7.5px">${variacoes[1] !== '' && variacoes[1] != null ? variacoes[1] + '%' : ''}</td>
          <td style="text-align:center">${situacaoInline(leituras[1]?.situacao || '')}</td>
          <td>${leituras[1]?.responsavel || ''}</td>
        </tr>
      </table>
      <div style="border:1px solid #bbb;border-top:none;padding:3px 6px;font-size:7.5px;font-weight:700;text-align:center;background:#f9f9f9">OUTRAS INFORMAÇÕES</div>
      <div style="border:1px solid #bbb;border-top:none;min-height:20px;padding:3px 6px;font-size:8px">${reg.outras_informacoes || '&nbsp;'}</div>
    `;
  }).join('');

  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
  <title>Checagem Intermediária dos Paquímetros — ${fmt_mes_ano(v.mes_ano)}</title>
  <style>${COMMON_STYLES}
    .top-bar { display:flex; align-items:center; justify-content:space-between; background:#00233B; color:#fff; padding:6px 14px; margin-bottom:8px; border-radius:4px; font-size:9px; font-family:'Poppins',Arial,sans-serif; }
    .top-bar-title { font-weight:600; }
    .btn-print { background:#566E3D; color:#fff; border:none; padding:5px 12px; border-radius:4px; font-size:8px; cursor:pointer; font-family:'Poppins',Arial,sans-serif; }
    .doc { max-width:720px; margin:0 auto; padding:0 8px 24px; }
    @media print { .top-bar { display:none; } .doc { max-width:100%; padding:0; } }
  </style></head><body>
  <div class="top-bar">
    <span class="top-bar-title">Checagem Intermediária dos Paquímetros — ${v.equipamento_identificacao || ''} · ${fmt_mes_ano(v.mes_ano)}</span>
    <button class="btn-print" onclick="window.print()">&#128438; Gerar PDF</button>
  </div>
  <div class="doc">

    ${docHeader('CHECAGEM INTERMEDIÁRIA\nDOS PAQUÍMETROS', 'FORM 082', '04/03/2025', '02', v.mes_ano)}

    <div class="section-header" style="margin-top:4px">EQUIPAMENTO VERIFICADO</div>
    <table>
      <tr>
        <td class="lbl" style="width:180px">Descrição do equipamento:</td>
        <td>${v.equipamento_nome || ''}</td>
        <td class="lbl" style="width:110px">Identificação:</td>
        <td style="width:130px">${v.equipamento_identificacao || ''}</td>
      </tr>
    </table>

    <div class="section-header" style="margin-top:4px">EQUIPAMENTO DE REFERÊNCIA</div>
    <table>
      <tr>
        <td class="lbl" style="width:180px" rowspan="2">Descrição do equipamento:</td>
        <td rowspan="2">${v.eq_referencia_descricao || ''}</td>
        <td class="lbl" style="width:110px">Identificação:</td>
        <td style="width:130px">${v.eq_referencia_identificacao || ''}</td>
      </tr>
      <tr>
        <td class="lbl">Data da calibração:</td>
        <td>${v.eq_referencia_data_calibracao ? fmt_date(v.eq_referencia_data_calibracao) : ''}</td>
      </tr>
    </table>

    ${blocos}

    <div class="section-header" style="margin-top:6px">FÓRMULA</div>
    <table>
      <tr>
        <td style="text-align:center;padding:10px;font-size:9px">
          <em>V = (Valor de referência − Resultado obtido) / Valor de referência × 100</em>
        </td>
      </tr>
    </table>

    <div class="section-header" style="margin-top:4px">ANÁLISE CRÍTICA</div>
    <table>
      <tr style="height:26px">
        <td style="width:80px;padding:4px 8px;font-size:8px">${checkbox(aprovado)} Aprovado</td>
        <td></td>
      </tr>
      <tr style="height:26px">
        <td style="padding:4px 8px;font-size:8px">${checkbox(reprovado)} Reprovado</td>
        <td></td>
      </tr>
      <tr>
        <td class="lbl" style="padding:4px 8px">Realizado por:</td>
        <td style="padding:4px 8px;font-size:8px">
          ${v.analise_critica_rubrica_url
            ? `<img src="${v.analise_critica_rubrica_url}" style="height:36px;max-width:120px;object-fit:contain;vertical-align:middle"> <span style="font-size:7px">${v.analise_critica_responsavel || ''}</span>`
            : (v.analise_critica_responsavel || '')}
          <span style="float:right"><strong>Data:</strong> ${v.analise_critica_data ? fmt_date(v.analise_critica_data) : ''}</span>
        </td>
      </tr>
    </table>

    <div style="text-align:right;font-size:7px;color:#888;margin-top:6px">FORM 082 — REV 02 — 04/03/2025 &nbsp;|&nbsp; Página 1 de 1</div>
  </div></body></html>`;
}