// FORM 069 — Checagem Diária de Densidade
import { fmt_date, fmt_mes_ano, dias_no_mes, situacaoCell, COMMON_STYLES, docHeader } from './docUtils';

export function buildDensidadeHtml(v) {
  const registros = v.registros || [];
  const total = dias_no_mes(v.mes_ano);
  const rows = Array.from({ length: 31 }, (_, i) => {
    const r = registros[i] || {};
    const ativo = i < total;
    const diaStr = ativo
      ? (() => {
          const [y, m] = (v.mes_ano || '').split('-').map(Number);
          return `${String(i+1).padStart(2,'0')}/${String(m).padStart(2,'0')}`;
        })()
      : '';
    const rubricaCell = ativo
      ? (r.rubrica_url
          ? `<img src="${r.rubrica_url}" style="height:30px;max-width:100px;object-fit:contain;vertical-align:middle"> <span style="font-size:7px">${r.responsavel || ''}</span>`
          : (r.responsavel || ''))
      : '';
    return `
      <tr style="height:15px">
        <td style="text-align:center;width:50px">${ativo ? diaStr : ''}</td>
        <td style="width:55px;text-align:center">${ativo ? (r.horario || '') : ''}</td>
        <td style="width:70px;text-align:center">${ativo ? (r.temperatura || '') : ''}</td>
        <td style="width:80px;text-align:center">${ativo ? (r.densidade_com_amostra || '') : ''}</td>
        <td style="width:80px;text-align:center">${ativo ? (r.densidade_sem_amostra || '') : ''}</td>
        <td style="text-align:center">${ativo ? situacaoCell(r.situacao) : ''}</td>
        <td>${rubricaCell}</td>
      </tr>`;
  }).join('');

  const aprovado = (v.resultado_geral === 'aprovado');
  const reprovado = (v.resultado_geral === 'reprovado');

  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
  <title>Checagem Diária de Densidade — ${fmt_mes_ano(v.mes_ano)}</title>
  <style>${COMMON_STYLES}</style></head><body>
  <div class="top-bar">
    <span class="top-bar-title">Checagem Diária de Densidade — ${v.equipamento_identificacao || ''} · ${fmt_mes_ano(v.mes_ano)}</span>
    <button class="btn-print" onclick="window.print()">&#128438; Gerar PDF</button>
  </div>
  <div class="doc">
    ${docHeader('CHECAGEM DIÁRIA DE DENSIDADE', 'FORM 069', '25/07/2025', '03', v.mes_ano)}

    <div class="section-header">SOLUÇÃO VERIFICADA</div>
    <table style="margin-bottom:4px">
      <tr>
        <td style="width:160px;background:#eee;font-weight:bold">Descrição da solução:</td>
        <td>${v.solucao_descricao || ''}</td>
        <td style="width:50px;background:#eee;font-weight:bold">Lote:</td>
        <td style="width:120px">${v.solucao_lote || ''}</td>
      </tr>
    </table>

    <div class="section-header" style="margin-top:4px">EQUIPAMENTOS DE REFERÊNCIA</div>
    <table style="margin-bottom:4px">
      <thead>
        <tr>
          <th style="width:130px">Teste Realizado</th>
          <th>Descrição do equipamento</th>
          <th style="width:120px">Identificação</th>
          <th style="width:120px">Data de Calibração</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td rowspan="2" style="text-align:center;background:#f5f5f5">Solução com Amostra</td>
          <td>Proveta</td>
          <td style="text-align:center">${v.proveta_com_amostra_id || ''}</td>
          <td style="text-align:center">N/A</td>
        </tr>
        <tr>
          <td>Densímetro</td>
          <td style="text-align:center">${v.densimetro_com_amostra_id || ''}</td>
          <td style="text-align:center">N/A</td>
        </tr>
        <tr>
          <td rowspan="2" style="text-align:center;background:#f5f5f5">Solução sem Amostra</td>
          <td>Proveta</td>
          <td style="text-align:center">${v.proveta_sem_amostra_id || ''}</td>
          <td style="text-align:center">N/A</td>
        </tr>
        <tr>
          <td>Densímetro</td>
          <td style="text-align:center">${v.densimetro_sem_amostra_id || ''}</td>
          <td style="text-align:center">N/A</td>
        </tr>
      </tbody>
    </table>

    <div class="section-header" style="margin-top:4px">CHECAGEM DIÁRIA DE DENSIDADE</div>
    <div style="border:1px solid #999;border-top:none;padding:2px 6px;font-size:7px;background:#f5f5f5;text-align:center;margin-bottom:2px">
      Variação permitida da solução saturada de Sulfato de sódio: Entre 1.151 e 1.174 &nbsp;·&nbsp;
      Variação permitida da solução saturada de Magnésio: Entre 1.295 e 1.308
    </div>
    <table>
      <thead>
        <tr>
          <th style="width:50px">Data</th>
          <th style="width:55px">Horário</th>
          <th style="width:70px">Temperatura</th>
          <th colspan="2" style="text-align:center">Densidade da Solução (g/cm³)</th>
          <th>Situação</th>
          <th>Responsável</th>
        </tr>
        <tr>
          <th></th><th></th><th></th>
          <th style="width:80px">Com Amostra</th>
          <th style="width:80px">Sem Amostra</th>
          <th></th><th></th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
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
      <span>FORM 069 — REV 03 — 25/07/2025</span><span>Página 1 de 1</span>
    </div>
  </div></body></html>`;
}