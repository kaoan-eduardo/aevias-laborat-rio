// FORM 016 — Checagem Intermediária das Balanças
import { fmt_date, fmt_mes_ano, situacaoCell, COMMON_STYLES, docHeader } from '../docUtils';

export function buildInterBalancaHtml(v) {
  const registros = v.registros || [];
  const aprovado = v.resultado_geral === 'aprovado';
  const reprovado = v.resultado_geral === 'reprovado';

  const checkbox = (checked) =>
    `<span style="display:inline-block;width:9px;height:9px;border:1px solid #555;background:${checked ? '#222' : '#fff'};vertical-align:middle"></span>`;

  const medicaoRows = registros.map(reg => {
    const posicoes = reg.posicoes || ['', '', '', '', ''];
    const variacoes = reg.variacoes || ['', '', '', '', ''];
    return `
      <div class="section-header" style="margin-top:4px">CHECAGEM INTERMEDIÁRIA</div>
      <table>
        <tr>
          <th style="width:90px" rowspan="2">Medição</th>
          <th style="width:100px" rowspan="2">Valor certificado (g)</th>
          <th colspan="5">Valor observado nas posições (g)</th>
        </tr>
        <tr>
          <th style="width:60px">1</th>
          <th style="width:60px">2</th>
          <th style="width:60px">3</th>
          <th style="width:60px">4</th>
          <th style="width:60px">5</th>
        </tr>
        <tr style="height:18px">
          <td style="text-align:center;font-weight:700">${reg.medicao}</td>
          <td style="text-align:center">${reg.valor_certificado || ''}</td>
          ${posicoes.map(p => `<td style="text-align:center">${p || ''}</td>`).join('')}
        </tr>
        <tr>
          <td class="lbl">Variação encontrada (%)</td>
          <td></td>
          ${variacoes.map(vr => `<td style="text-align:center;font-size:7.5px">${vr !== '' && vr != null ? vr + '%' : ''}</td>`).join('')}
        </tr>
      </table>`;
  }).join('');

  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
  <title>Checagem Intermediária das Balanças — ${fmt_mes_ano(v.mes_ano)}</title>
  <style>${COMMON_STYLES}
    .top-bar { display:flex; align-items:center; justify-content:space-between; background:#00233B; color:#fff; padding:6px 14px; margin-bottom:8px; border-radius:4px; font-size:9px; font-family:'Poppins',Arial,sans-serif; }
    .top-bar-title { font-weight:600; }
    .btn-print { background:#566E3D; color:#fff; border:none; padding:5px 12px; border-radius:4px; font-size:8px; cursor:pointer; font-family:'Poppins',Arial,sans-serif; }
    .doc { max-width:720px; margin:0 auto; padding:0 8px 24px; }
    @media print { .top-bar { display:none; } .doc { max-width:100%; padding:0; } }
  </style></head><body>
  <div class="top-bar">
    <span class="top-bar-title">Checagem Intermediária das Balanças — ${v.equipamento_identificacao || ''} · ${fmt_mes_ano(v.mes_ano)}</span>
    <button class="btn-print" onclick="window.print()">&#128438; Gerar PDF</button>
  </div>
  <div class="doc">

    ${docHeader('CHECAGEM INTERMEDIÁRIA DAS BALANÇAS', 'FORM 016', '04/03/2025', '03', v.mes_ano)}

    <table style="margin-bottom:2px">
      <tr>
        <td class="lbl" style="width:110px">Responsável</td>
        <td>${v.analise_critica_responsavel || ''}</td>
        <td class="lbl" style="width:130px">Mês/Ano da Verificação</td>
        <td style="width:100px">${fmt_mes_ano(v.mes_ano)}</td>
      </tr>
    </table>

    <div class="section-header" style="margin-top:4px">EQUIPAMENTO VERIFICADO</div>
    <table>
      <tr>
        <td class="lbl" style="width:160px">Descrição do equipamento</td>
        <td>${v.equipamento_nome || ''}</td>
        <td class="lbl" style="width:110px"><em>Identificação</em></td>
        <td style="width:130px">${v.equipamento_identificacao || ''}</td>
      </tr>
    </table>

    <div class="section-header" style="margin-top:4px">EQUIPAMENTO DE REFERÊNCIA (PADRÃO)</div>
    <table>
      <tr>
        <td class="lbl" style="width:160px" rowspan="2">Descrição do equipamento</td>
        <td rowspan="2">${v.eq_referencia_descricao || ''}</td>
        <td class="lbl" style="width:110px"><em>Identificação</em></td>
        <td style="width:130px">${v.eq_referencia_identificacao || ''}</td>
      </tr>
      <tr>
        <td class="lbl"><em>Valor certificado</em></td>
        <td></td>
      </tr>
      <tr>
        <td colspan="2"></td>
        <td class="lbl">Data de Calibração</td>
        <td>${v.eq_referencia_data_calibracao ? fmt_date(v.eq_referencia_data_calibracao) : ''}</td>
      </tr>
    </table>

    <table style="margin-top:4px;margin-bottom:2px">
      <tr>
        <td style="width:50%;text-align:center;font-weight:700;font-size:8px;background:#f9f9f9;padding:6px">
          LOCALIZAÇÃO DOS PONTOS DE LEITURA<br><br>
          <div style="display:flex;justify-content:center;align-items:center;gap:10px">
            <img src="https://media.base44.com/images/public/69fdf070216c826565ee0876/8b170a954_image.png"
                 style="height:80px;object-fit:contain" alt="Pontos circular" />
            <img src="https://media.base44.com/images/public/69fdf070216c826565ee0876/6d87b1506_image.png"
                 style="height:80px;object-fit:contain" alt="Pontos retangular" />
          </div>
        </td>
        <td style="width:50%;text-align:center;font-weight:700;font-size:9px;background:#f9f9f9;padding:6px">
          VARIAÇÃO PERMITIDA<br><br>
          <span style="font-size:18px;color:#333">≤ 0,5%</span>
        </td>
      </tr>
    </table>

    ${medicaoRows}

    <table style="margin-top:8px">
      <tr>
        <td style="width:100px;padding:6px 8px;font-size:8px;font-weight:700;background:#BFCF99;text-align:center">SITUAÇÃO</td>
        <td style="font-weight:700;font-size:8px;text-align:center;background:#BFCF99">ANÁLISE CRÍTICA</td>
      </tr>
      <tr style="height:30px">
        <td style="padding:4px 8px;font-size:8px">${checkbox(aprovado)} Aprovado</td>
        <td style="padding:4px 8px;font-size:8px;font-style:italic">Variações abaixo do máximo permitido em todos os pontos verificados do equipamento.</td>
      </tr>
      <tr style="height:30px">
        <td style="padding:4px 8px;font-size:8px">${checkbox(reprovado)} Reprovado</td>
        <td></td>
      </tr>
      <tr>
        <td class="lbl" style="padding:4px 8px">Realizado por:</td>
        <td style="padding:4px 8px">
          ${v.analise_critica_rubrica_url
            ? `<img src="${v.analise_critica_rubrica_url}" style="height:40px;max-width:130px;object-fit:contain;vertical-align:middle"> <span style="font-size:7px">${v.analise_critica_responsavel || ''}</span>`
            : (v.analise_critica_responsavel || '')}
          <span style="float:right;font-size:8px"><strong>Data:</strong> ${v.analise_critica_data ? fmt_date(v.analise_critica_data) : ''}</span>
        </td>
      </tr>
    </table>

    <div class="section-header" style="margin-top:8px">CÁLCULO DA VARIAÇÃO PERMITIDA</div>
    <table>
      <tr>
        <td style="text-align:center;padding:10px;font-size:9px">
          <em>V = (Massa Peso Padrão − Massa Equipamento) / Massa Peso Padrão × 100</em>
        </td>
      </tr>
    </table>

    <div style="text-align:right;font-size:7px;color:#888;margin-top:6px">FORM 016 — REV 03 — 04/03/2025 &nbsp;|&nbsp; Página 1 de 1</div>
  </div></body></html>`;
}