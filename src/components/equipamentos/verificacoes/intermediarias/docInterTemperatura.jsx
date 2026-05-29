// FORM 027 — Checagem Intermediária de Temperatura
import { fmt_date, fmt_mes_ano, COMMON_STYLES, docHeader } from '../docUtils';

export function buildInterTemperaturaHtml(v) {
  const registros = v.registros || [];
  const aprovado = v.resultado_geral === 'aprovado';
  const reprovado = v.resultado_geral === 'reprovado';

  // Separar registros principais (t1_t2 = "T1") dos outros (T2 / outras checagens)
  const checagemPrincipal = registros.filter(r => !r.t1_t2 || r.t1_t2 === 'T1' || registros.indexOf(r) < Math.ceil(registros.length / 2));
  const outrasChecagens = registros.filter(r => r.t1_t2 === 'T2' || registros.indexOf(r) >= Math.ceil(registros.length / 2));

  const checkbox = (checked) =>
    `<span style="display:inline-block;width:9px;height:9px;border:1px solid #555;background:${checked ? '#222' : '#fff'};vertical-align:middle"></span>`;

  const buildRows = (regs) => regs.map(reg => {
    const sit = reg.situacao || '';
    const ap = sit === 'aprovado';
    const re = sit === 'reprovado';
    return `
      <tr style="height:20px">
        <td>${reg.data ? fmt_date(reg.data) : ''}</td>
        <td style="text-align:center">${reg.t1_t2 || ''}</td>
        <td style="text-align:center">${reg.temperatura_celsius || ''}</td>
        <td style="text-align:center">${reg.variacao_pct !== '' && reg.variacao_pct != null ? reg.variacao_pct + '%' : ''}</td>
        <td style="text-align:center;font-size:7.5px">
          <span style="display:inline-block;width:8px;height:8px;border:1px solid #555;background:${ap ? '#222' : '#fff'};vertical-align:middle"></span> Aprovado
          &nbsp;
          <span style="display:inline-block;width:8px;height:8px;border:1px solid #555;background:${re ? '#222' : '#fff'};vertical-align:middle"></span> Reprovado
        </td>
        <td>${reg.responsavel || ''}</td>
      </tr>`;
  }).join('');

  const tabelaChecagem = (titulo, regs, resultado, responsavel, data, rubrica) => `
    <div class="section-header" style="margin-top:4px">${titulo}</div>
    <table>
      <tr>
        <td class="lbl" colspan="6" style="background:#BFCF9966;text-align:center;font-size:7.5px;padding:3px">
          <strong>Variação Permitida:</strong> &nbsp; Termômetros: ≤ 5,0% &nbsp;&nbsp; Estufas: ≤ 5,0% &nbsp;&nbsp; Banhos Maria: ≤ 5,0%
        </td>
      </tr>
      <tr>
        <th style="width:70px">Data</th>
        <th style="width:50px">T1/T2</th>
        <th style="width:90px">Temperatura (°C)</th>
        <th style="width:80px">Variação (%)</th>
        <th>Situação</th>
        <th style="width:100px">Responsável</th>
      </tr>
      ${regs.length > 0 ? buildRows(regs) : `
        <tr style="height:20px"><td></td><td></td><td></td><td></td><td></td><td></td></tr>
        <tr style="height:20px"><td></td><td></td><td></td><td></td><td></td><td></td></tr>
      `}
    </table>
    <table style="margin-top:2px">
      <tr>
        <td style="width:80px;font-weight:700;font-size:8px;background:#BFCF99;text-align:center;padding:3px">SITUAÇÃO</td>
        <td style="font-weight:700;font-size:8px;text-align:center;background:#BFCF99;padding:3px">ANÁLISE CRÍTICA</td>
      </tr>
      <tr style="height:26px">
        <td style="padding:4px 8px;font-size:8px">${checkbox(resultado === 'aprovado')} Aprovado</td>
        <td style="padding:4px 8px;font-size:8px;font-style:italic">Variações abaixo do máximo permitido em todos os pontos verificados do equipamento.</td>
      </tr>
      <tr style="height:26px">
        <td style="padding:4px 8px;font-size:8px">${checkbox(resultado === 'reprovado')} Reprovado</td>
        <td></td>
      </tr>
      <tr>
        <td class="lbl" style="padding:4px 8px;font-size:8px"><strong>Realizado por:</strong></td>
        <td style="padding:4px 8px;font-size:8px">
          ${rubrica ? `<img src="${rubrica}" style="height:36px;max-width:120px;object-fit:contain;vertical-align:middle"> <span style="font-size:7px">${responsavel || ''}</span>` : (responsavel || '')}
          <span style="float:right"><strong>Data:</strong> ${data ? fmt_date(data) : ''}</span>
        </td>
      </tr>
    </table>`;

  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
  <title>Checagem Intermediária de Temperatura — ${fmt_mes_ano(v.mes_ano)}</title>
  <style>${COMMON_STYLES}
    .top-bar { display:flex; align-items:center; justify-content:space-between; background:#00233B; color:#fff; padding:6px 14px; margin-bottom:8px; border-radius:4px; font-size:9px; font-family:'Poppins',Arial,sans-serif; }
    .top-bar-title { font-weight:600; }
    .btn-print { background:#566E3D; color:#fff; border:none; padding:5px 12px; border-radius:4px; font-size:8px; cursor:pointer; font-family:'Poppins',Arial,sans-serif; }
    .doc { max-width:720px; margin:0 auto; padding:0 8px 24px; }
    @media print { .top-bar { display:none; } .doc { max-width:100%; padding:0; } }
  </style></head><body>
  <div class="top-bar">
    <span class="top-bar-title">Checagem Intermediária de Temperatura — ${v.equipamento_identificacao || ''} · ${fmt_mes_ano(v.mes_ano)}</span>
    <button class="btn-print" onclick="window.print()">&#128438; Gerar PDF</button>
  </div>
  <div class="doc">

    ${docHeader('CHECAGEM INTERMEDIÁRIA DE TEMPERATURA', 'FORM 027', '04/03/2025', '04', v.mes_ano)}

    <div class="section-header" style="margin-top:4px">EQUIPAMENTO VERIFICADO</div>
    <table>
      <tr>
        <td class="lbl" style="width:180px">Descrição do equipamento</td>
        <td>${v.equipamento_nome || ''}</td>
        <td class="lbl" style="width:110px"><em>Identificação</em></td>
        <td style="width:130px">${v.equipamento_identificacao || ''}</td>
      </tr>
      <tr>
        <td class="lbl">Temperatura de checagem (1)</td>
        <td colspan="3">${registros[0]?.temperatura_celsius || ''}</td>
      </tr>
      <tr>
        <td class="lbl">Temperatura de checagem (2)</td>
        <td colspan="3">${registros[1]?.temperatura_celsius || ''}</td>
      </tr>
    </table>

    <div class="section-header" style="margin-top:4px">EQUIPAMENTO DE REFERÊNCIA (PADRÃO)</div>
    <table>
      <tr>
        <td class="lbl" style="width:180px" rowspan="2">Descrição do equipamento</td>
        <td rowspan="2">${v.eq_referencia_descricao || ''}</td>
        <td class="lbl" style="width:110px"><em>Identificação</em></td>
        <td style="width:130px">${v.eq_referencia_identificacao || ''}</td>
      </tr>
      <tr>
        <td class="lbl">Data de Calibração</td>
        <td>${v.eq_referencia_data_calibracao ? fmt_date(v.eq_referencia_data_calibracao) : ''}</td>
      </tr>
    </table>

    ${tabelaChecagem('CHECAGEM INTERMEDIÁRIA', registros, v.resultado_geral, v.analise_critica_responsavel, v.analise_critica_data, v.analise_critica_rubrica_url)}

    <div class="section-header" style="margin-top:8px">OUTRAS CHECAGENS</div>
    <table>
      <tr>
        <th style="width:70px">Data</th>
        <th style="width:50px">T1/T2</th>
        <th style="width:90px">Temperatura (°C)</th>
        <th style="width:80px">Variação (%)</th>
        <th>Situação</th>
        <th style="width:100px">Responsável</th>
      </tr>
      <tr style="height:20px"><td></td><td></td><td></td><td></td><td></td><td></td></tr>
      <tr style="height:20px"><td></td><td></td><td></td><td></td><td></td><td></td></tr>
    </table>
    <table style="margin-top:2px">
      <tr>
        <td style="width:80px;font-weight:700;font-size:8px;background:#BFCF99;text-align:center;padding:3px">SITUAÇÃO</td>
        <td style="font-weight:700;font-size:8px;text-align:center;background:#BFCF99;padding:3px">ANÁLISE CRÍTICA</td>
      </tr>
      <tr style="height:26px">
        <td style="padding:4px 8px;font-size:8px"><span style="display:inline-block;width:9px;height:9px;border:1px solid #555;background:#fff;vertical-align:middle"></span> Aprovado</td>
        <td style="padding:4px 8px;font-size:8px;font-style:italic">Variações abaixo do máximo permitido em todos os pontos verificados do equipamento.</td>
      </tr>
      <tr style="height:26px">
        <td style="padding:4px 8px;font-size:8px"><span style="display:inline-block;width:9px;height:9px;border:1px solid #555;background:#fff;vertical-align:middle"></span> Reprovado</td>
        <td></td>
      </tr>
      <tr>
        <td class="lbl" style="padding:4px 8px;font-size:8px"><strong>Realizado por:</strong></td>
        <td style="padding:4px 8px;font-size:8px"><span style="float:right"><strong>Data:</strong></span></td>
      </tr>
    </table>

    <div class="section-header" style="margin-top:8px">CÁLCULO DA VARIAÇÃO PERMITIDA</div>
    <table>
      <tr>
        <td style="text-align:center;padding:10px;font-size:9px">
          <em>V = (Temperatura do padrão − Temperatura do equipamento) / Temperatura do padrão × 100</em>
        </td>
      </tr>
    </table>

    <div style="text-align:right;font-size:7px;color:#888;margin-top:6px">FORM 027 — REV 04 — 04/03/2025 &nbsp;|&nbsp; Página 1 de 1</div>
  </div></body></html>`;
}