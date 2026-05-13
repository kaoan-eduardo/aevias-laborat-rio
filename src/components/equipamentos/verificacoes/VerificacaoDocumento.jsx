/**
 * VerificacaoDocumento.jsx
 * Gera HTML de impressão fiel aos formulários FORM 017 (balança),
 * FORM 051 (temperatura) e FORM 069 (densidade).
 */

const fmt_date = (d) => {
  if (!d) return '—';
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
    const [y, m, day] = d.split('-').map(Number);
    return `${String(day).padStart(2,'0')}/${String(m).padStart(2,'0')}/${y}`;
  }
  return new Date(d).toLocaleDateString('pt-BR');
};

const fmt_mes_ano = (mesAno) => {
  if (!mesAno) return '—';
  const [y, m] = mesAno.split('-').map(Number);
  const d = new Date(y, m - 1, 15);
  const mes = d.toLocaleDateString('pt-BR', { month: 'long' });
  return `${mes.charAt(0).toUpperCase() + mes.slice(1)}/${y}`;
};

const dias_no_mes = (mesAno) => {
  if (!mesAno) return 31;
  const [y, m] = mesAno.split('-').map(Number);
  return new Date(y, m, 0).getDate();
};

const situacaoCell = (situacao) => {
  const ap = situacao === 'aprovado';
  const re = situacao === 'reprovado';
  return `
    <span style="display:inline-flex;align-items:center;gap:3px;font-size:7px">
      <span style="display:inline-block;width:8px;height:8px;border:1px solid #555;background:${ap ? '#222' : '#fff'}"></span>APROVADO
      &nbsp;
      <span style="display:inline-block;width:8px;height:8px;border:1px solid #555;background:${re ? '#222' : '#fff'}"></span>REPROVADO
    </span>`;
};

const COMMON_STYLES = `
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: Arial, sans-serif; font-size:8px; color:#000; background:#e8e8e8; padding:20px; }
  .top-bar { width:794px; margin:0 auto 12px auto; display:flex; align-items:center; justify-content:space-between; background:#fff; border-radius:8px; padding:10px 16px; box-shadow:0 1px 4px rgba(0,0,0,0.12); font-family:Arial,sans-serif; }
  .top-bar-title { font-weight:700; color:#1a1a1a; font-size:13px; }
  .btn-print { display:inline-flex; align-items:center; gap:6px; background:#1a1a1a; color:#fff; border:none; border-radius:6px; padding:7px 16px; font-size:12px; font-weight:600; cursor:pointer; }
  .doc { width:794px; min-height:1123px; background:#fff; padding:10px 14px; margin:0 auto; box-shadow:0 2px 8px rgba(0,0,0,0.12); }
  .section-header { background:#d0d0d0; border:1px solid #999; padding:3px 6px; text-align:center; font-weight:bold; font-size:8px; letter-spacing:.5px; }
  table { border-collapse:collapse; width:100%; }
  td, th { border:1px solid #999; font-size:8px; }
  th { background:#d8d8d8; font-weight:bold; text-align:center; padding:2px 4px; }
  td { padding:2px 4px; }
  .logo-box { border:1.5px solid #555; padding:4px 8px; display:inline-block; }
  @media print { body { background:#fff; padding:0; } .top-bar { display:none; } .doc { box-shadow:none; } }
`;

const docHeader = (titulo, form, emissao, revisao, mesAno) => `
  <table style="width:100%;border-collapse:collapse;margin-bottom:6px">
    <tr>
      <td style="border:1.5px solid #555;padding:6px 10px;width:140px;text-align:center;vertical-align:middle">
        <div style="font-weight:900;font-size:10px;letter-spacing:2px">AFIRMAEVIAS</div>
        <div style="font-size:6px;letter-spacing:3px;color:#555">e n g e n h a r i a</div>
      </td>
      <td style="border:1.5px solid #555;padding:4px 8px;text-align:center;font-weight:bold;font-size:11px;vertical-align:middle">
        ${titulo}
      </td>
      <td style="border:1.5px solid #555;padding:4px 8px;width:160px;vertical-align:top">
        <div style="font-size:7px;color:#555">Identificação do Documento Nº</div>
        <div style="font-weight:bold;font-size:9px">${form}</div>
        <table style="width:100%;border-collapse:collapse;margin-top:3px">
          <tr>
            <th style="border:1px solid #999;padding:1px 4px;font-size:7px">Emissão</th>
            <th style="border:1px solid #999;padding:1px 4px;font-size:7px">Revisão</th>
          </tr>
          <tr>
            <td style="border:1px solid #999;padding:1px 4px;font-size:7px;text-align:center">${emissao}</td>
            <td style="border:1px solid #999;padding:1px 4px;font-size:7px;text-align:center">${revisao}</td>
          </tr>
        </table>
        <div style="margin-top:3px;font-size:7px">Mês/Ano: <strong>${mesAno ? fmt_mes_ano(mesAno) : '___________'}</strong></div>
      </td>
    </tr>
  </table>`;

// ─── BALANÇA (FORM 017) ───────────────────────────────────────────────────────
export function buildBalancaHtml(v) {
  const registros = v.registros || [];
  const total = dias_no_mes(v.mes_ano);
  const rows = Array.from({ length: 31 }, (_, i) => {
    const r = registros[i] || {};
    const ativo = i < total;
    const rubricaCell = ativo
      ? (r.rubrica_url
          ? `<img src="${r.rubrica_url}" style="height:12px;max-width:80px;object-fit:contain;vertical-align:middle"> <span style="font-size:7px">${r.responsavel || ''}</span>`
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
        <td>BALANÇA &nbsp;&nbsp; ${v.equipamento_nome || ''}</td>
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
        <td>${v.realizado_por || ''}</td>
        <td style="background:#eee;font-weight:bold;width:50px">Data:</td>
        <td style="width:110px">${v.data_finalizacao ? fmt_date(v.data_finalizacao) : ''}</td>
      </tr>
    </table>

    <div style="display:flex;justify-content:space-between;border-top:1px solid #ccc;margin-top:8px;padding-top:3px;font-size:7px;color:#888">
      <span>FORM 017 — REV 03 — 04/03/2025</span><span>Página 1 de 1</span>
    </div>
  </div></body></html>`;
}

// ─── TEMPERATURA (FORM 051) ──────────────────────────────────────────────────
export function buildTemperaturaHtml(v) {
  const registros = v.registros || [];
  const total = dias_no_mes(v.mes_ano);
  const rows = Array.from({ length: 31 }, (_, i) => {
    const r = registros[i] || {};
    const ativo = i < total;
    const rubricaCell = ativo
      ? (r.rubrica_url
          ? `<img src="${r.rubrica_url}" style="height:12px;max-width:80px;object-fit:contain;vertical-align:middle"> <span style="font-size:7px">${r.responsavel || ''}</span>`
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
        <td>${v.realizado_por || ''}</td>
        <td style="background:#eee;font-weight:bold;width:50px">Data:</td>
        <td style="width:110px">${v.data_finalizacao ? fmt_date(v.data_finalizacao) : ''}</td>
      </tr>
    </table>

    <div style="display:flex;justify-content:space-between;border-top:1px solid #ccc;margin-top:8px;padding-top:3px;font-size:7px;color:#888">
      <span>FORM 051 — REV 04 — 02/09/2025</span><span>Página 1 de 1</span>
    </div>
  </div></body></html>`;
}

// ─── DENSIDADE (FORM 069) ────────────────────────────────────────────────────
export function buildDensidadeHtml(v) {
  const registros = v.registros || [];
  const total = dias_no_mes(v.mes_ano);
  const rows = Array.from({ length: 31 }, (_, i) => {
    const r = registros[i] || {};
    const ativo = i < total;
    // For density the "dia" comes from the record index; date = day of month
    const diaStr = ativo
      ? (() => {
          const [y, m] = (v.mes_ano || '').split('-').map(Number);
          return `${String(i+1).padStart(2,'0')}/${String(m).padStart(2,'0')}`;
        })()
      : '';
    const rubricaCell = ativo
      ? (r.rubrica_url
          ? `<img src="${r.rubrica_url}" style="height:12px;max-width:80px;object-fit:contain;vertical-align:middle"> <span style="font-size:7px">${r.responsavel || ''}</span>`
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
        <td>${v.realizado_por || ''}</td>
        <td style="background:#eee;font-weight:bold;width:50px">Data:</td>
        <td style="width:110px">${v.data_finalizacao ? fmt_date(v.data_finalizacao) : ''}</td>
      </tr>
    </table>

    <div style="display:flex;justify-content:space-between;border-top:1px solid #ccc;margin-top:8px;padding-top:3px;font-size:7px;color:#888">
      <span>FORM 069 — REV 03 — 25/07/2025</span><span>Página 1 de 1</span>
    </div>
  </div></body></html>`;
}

/** Abre a impressão em nova aba de acordo com o tipo da verificação */
export function openVerificacaoImpressao(verificacao) {
  const builders = {
    balanca: buildBalancaHtml,
    temperatura: buildTemperaturaHtml,
    densidade: buildDensidadeHtml,
  };
  const build = builders[verificacao.tipo];
  if (!build) return;
  const html = build(verificacao);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}