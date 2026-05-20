import { BRAND_CSS } from '@/lib/brandColors';

function fmt(date) {
  if (!date) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [y, m, d] = date.split('-');
    return `${d}/${m}/${y}`;
  }
  return new Date(date).toLocaleDateString('pt-BR');
}

function simNao(val) {
  return val ? 'Sim' : 'Não';
}

const VTH = (txt, extra = '') =>
  `<th style="writing-mode:vertical-rl;transform:rotate(180deg);height:70px;min-width:26px;padding:2px;text-align:left;vertical-align:bottom;font-size:7px;${extra}">${txt}</th>`;

const VTH_MAN = (txt, extra = '') =>
  `<th style="writing-mode:vertical-rl;transform:rotate(180deg);height:60px;min-width:24px;padding:2px;text-align:left;vertical-align:bottom;font-size:7px;${extra}">${txt}</th>`;

export function buildForm013Html(eq) {
  const hoje = new Date().toLocaleDateString('pt-BR');

  // (linhas de calibração e resultados são geradas inline na tabela unificada)

  // ── Linhas de Manutenção ─────────────────────────────────────────────────
  const emptyManRow = `
    <tr style="height:18px">
      ${Array(15).fill('<td style="border:1px solid #bbb"></td>').join('')}
    </tr>`;

  const manRows = (eq.historico_manutencao || []).length > 0
    ? (eq.historico_manutencao || []).map((m) => `
    <tr style="font-size:7px">
      <td style="border:1px solid #bbb;text-align:center;padding:2px">${m.data || ''}</td>
      <td style="border:1px solid #bbb;padding:2px">${m.descricao_problema || ''}</td>
      <td style="border:1px solid #bbb;text-align:center;padding:2px">${m.form011_etiqueta_nc || ''}</td>
      <td style="border:1px solid #bbb;text-align:center;padding:2px">${m.responsavel || ''}</td>
      <td style="border:1px solid #bbb;text-align:center;padding:2px">${m.status_form012 || ''}</td>
      <td style="border:1px solid #bbb;text-align:center;padding:2px">${m.data_aprovacao || ''}</td>
      <td style="border:1px solid #bbb;text-align:center;padding:2px">${m.fornecedor || ''}</td>
      <td style="border:1px solid #bbb;text-align:center;padding:2px">${m.ordem_compra || ''}</td>
      <td style="border:1px solid #bbb;text-align:center;padding:2px">${m.data_ordem_compra || ''}</td>
      <td style="border:1px solid #bbb;text-align:center;padding:2px">${m.nota_fiscal || ''}</td>
      <td style="border:1px solid #bbb;text-align:center;padding:2px">${m.data_recebimento || ''}</td>
      <td style="border:1px solid #bbb;padding:2px">${m.detalhes_execucao || ''}</td>
      <td style="border:1px solid #bbb;text-align:center;padding:2px">${m.inspecao_recebimento || ''}</td>
      <td style="border:1px solid #bbb;text-align:center;padding:2px">${m.analise_critica || ''}</td>
      <td style="border:1px solid #bbb;text-align:center;padding:2px">${m.status_form012_final || ''}</td>
    </tr>`).join('')
    : Array(4).fill(emptyManRow).join('');

  const manEmptyExtra = Math.max(0, 4 - (eq.historico_manutencao || []).length);
  const manEmptyRows = Array(manEmptyExtra).fill(emptyManRow).join('');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>FORM 013 — ${eq.identificacao_interna || eq.nome}</title>
<style>
  ${BRAND_CSS}
  .doc { width: 794px; background: #fff; padding: 10px 12px; margin: 0 auto; box-shadow: 0 2px 8px rgba(0,0,0,.15); }
  table { border-collapse: collapse; width: 100%; }
  td, th { border: 1px solid #bbb; font-size: 7.5px; vertical-align: middle; }
  .sec { background: #00233B; color: #000F; font-weight: 800; font-size: 8px; text-align: center; padding: 4px; letter-spacing: .8px; border: 1px solid #00233B; margin-bottom: 0; font-family: 'Exo 2', Arial, sans-serif; }
  .id-badge { font-size: 22px; font-weight: 800; color: #00233B; font-family: 'Exo 2', Arial, sans-serif; letter-spacing: 1px; }
  .legend-lc { background: #BFCF99; color: #00233B; }
  .legend-qua { background: #566E3D; color: #fff; }
  .legend-op { background: #EFEBDC; color: #00233B; }
  @media print { body { background: #fff; padding: 0; } .top-bar { display: none; } .doc { box-shadow: none; } @page { size: A4; margin: 8mm; } }
</style>
</head>
<body>

<div class="top-bar">
  <span style="font-weight:700;font-size:13px;color:#BFCF99;font-family:'Exo 2',Arial,sans-serif">FORM 013 — Ficha de Equipamento</span>
  <button onclick="window.print()" style="display:inline-flex;align-items:center;gap:6px;background:#566E3D;color:#fff;border:none;border-radius:6px;padding:7px 16px;font-size:12px;font-weight:600;cursor:pointer;font-family:'Exo 2',Arial,sans-serif">🖨️ Imprimir</button>
</div>

<div class="doc">

<!-- ═══ CABEÇALHO ═══ -->
<table style="margin-bottom:4px">
  <tr>
    <td style="width:140px;padding:6px 10px;border:1.5px solid #00233B;text-align:center;vertical-align:middle;background:#FFF">
      <img src="https://media.base44.com/images/public/69fdf070216c826565ee0876/4cb4a9760_image.png" style="max-width:120px;height:auto;display:block;margin:0 auto"/>
    </td>
    <td style="border:1.5px solid #00233B;text-align:center;font-weight:800;font-size:13px;letter-spacing:2px;vertical-align:middle;padding:6px;font-family:'Exo 2',Arial,sans-serif;color:#00233B">
    FICHA DE EQUIPAMENTO
    </td>
    <td style="width:150px;border:1.5px solid #00233B;padding:4px 6px;vertical-align:top;font-size:7px;background:#FFF">
    <div style="font-weight:700;text-align:center;border-bottom:1px solid #00233b;padding-bottom:2px;margin-bottom:3px;font-family:'Exo 2',Arial,sans-serif;color:#00233b">Identificação do doc. Nº</div>
    <div style="text-align:center;font-weight:800;font-size:9px;margin-bottom:3px;font-family:'Exo 2',Arial,sans-serif;color:#00233B">FORM 013</div>
      <table style="width:100%">
        <tr>
          <th style="font-size:7px;padding:1px 3px">Emissão</th>
          <th style="font-size:7px;padding:1px 3px">Revisão</th>
        </tr>
        <tr>
          <td style="text-align:center;font-size:7px;padding:1px 3px">25/03/2025</td>
          <td style="text-align:center;font-size:7px;padding:1px 3px">03</td>
        </tr>
      </table>
    </td>
  </tr>
</table>

<!-- ═══ IDENTIFICAÇÃO ═══ -->
<table style="margin-bottom:0;border:1.5px solid #555">
  <tr>
    <td class="lbl" style="width:180px">Responsável pela atualização:</td>
    <td style="width:260px">${eq.responsavel_atualizacao || ''}</td>
    <td class="lbl" style="width:120px">Atualizado em:</td>
    <td style="text-align:center">${hoje}</td>
    <td rowspan="7" style="width:130px;border-left:2px solid #aaa;text-align:center;vertical-align:middle;padding:6px">
      <div style="font-size:7px;font-weight:bold;margin-bottom:4px">Identificação unívoca:</div>
      <div class="id-badge">${eq.identificacao_interna || ''}</div>
    </td>
  </tr>
  <tr>
    <td class="lbl">Nome do equipamento:</td>
    <td colspan="3">${eq.nome || ''}</td>
  </tr>
  <tr>
    <td class="lbl">Software e a versão do firmware (quando aplicável):</td>
    <td colspan="3">${eq.software_firmware || 'N.A.'}</td>
  </tr>
  <tr>
    <td class="lbl">Fabricante:</td>
    <td>${eq.fabricante || ''}</td>
    <td class="lbl">Resolução:</td>
    <td>${eq.precisao || ''}</td>
  </tr>
  <tr>
    <td class="lbl">Modelo:</td>
    <td>${eq.modelo || ''}</td>
    <td class="lbl">Faixa nominal máxima:</td>
    <td>${eq.faixa_nominal_maxima || ''}</td>
  </tr>
  <tr>
    <td class="lbl">Número de série:</td>
    <td>${eq.numero_serie || ''}</td>
    <td class="lbl">Frequência de calibração:</td>
    <td>${eq.frequencia_calibracao || ''}</td>
  </tr>
  <tr>
    <td class="lbl">Data de entrada em serviço:</td>
    <td>${fmt(eq.data_entrada_servico)}</td>
    <td class="lbl">Localização:</td>
    <td>${eq.localizacao || ''}</td>
  </tr>
</table>

<!-- ═══ UNIDADE / TOLERÂNCIA ═══ -->
<table style="margin-bottom:0;width:100%">
  <tr>
    <td style="border:1px solid #bbb;padding:2px 6px;font-weight:700;font-size:7.5px;background:#F2F1EF;width:160px;font-family:'Exo 2',Arial,sans-serif">UNIDADE DO EQUIPAMENTO:</td>
    <td style="border:1px solid #bbb;padding:2px 6px;font-size:7.5px;width:140px">${eq.unidade_equipamento || 'Ex.: kg, kgf, ºC, etc.'}</td>
    <td style="border:1px solid #bbb;padding:2px 6px;font-weight:700;font-size:7.5px;background:#F2F1EF;width:100px;font-family:'Exo 2',Arial,sans-serif">Tolerância:</td>
    <td style="border:1px solid #bbb;padding:2px 6px;font-size:7.5px;width:100px">${eq.tolerancia || ''}</td>
    <td style="border:1px solid #bbb;padding:2px 6px;font-size:7.5px"></td>
  </tr>
</table>

<!-- ═══ PONTOS DE CALIBRAÇÃO + CRITÉRIOS ═══ -->
<table style="margin-bottom:0;width:100%">
  <thead>
    <tr>
      <th style="background:#BFCF99;color:#333;font-family:'Exo 2',Arial,sans-serif;font-size:8px;text-align:center;padding:3px;width:50%">PONTOS DE CALIBRAÇÃO</th>
      <th style="background:#BFCF99;color:#333;font-family:'Exo 2',Arial,sans-serif;font-size:8px;text-align:center;padding:3px;width:50%">CRITÉRIOS DE ACEITAÇÃO</th>
    </tr>
  </thead>
  <tbody>
    ${(() => {
      const rawPts0 = eq.pontos_calibracao;
      const pts = (Array.isArray(rawPts0) ? rawPts0 : []).slice(0, 16);
      const rows = Array.from({ length: Math.max(pts.length, 1) }, (_, i) => {
        const p = pts[i] || {};
        return `<tr style="height:14px">
          <td style="border:1px solid #bbb;padding:2px 6px;font-size:7.5px;text-align:center">${p.ponto || ''}</td>
          <td style="border:1px solid #bbb;padding:2px 6px;font-size:7.5px;text-align:center">${p.criterio || ''}</td>
        </tr>`;
      });
      return rows.join('');
    })()}
  </tbody>
</table>

<!-- ═══ OBSERVAÇÕES ═══ -->
<div class="sec" style="margin-top:4px; background-color: #bfcf99;border: 1px solid #bbb">OBSERVAÇÕES</div>
<table style="margin-bottom:0"><tr><td style="height:32px;font-size:8px;border: 1px solid #bbb">${eq.observacoes || ''}</td></tr></table>

<!-- ═══ CALIBRAÇÃO ═══ -->
<div class="sec" style="margin-top:6px; background-color: #bfcf99;border: 1px solid #bbb">CALIBRAÇÃO</div>

<!-- CALIBRAÇÃO: colunas de erro obtido dinâmicas baseadas nos pontos de calibração -->
${(() => {
  const rawPts = eq.pontos_calibracao;
  const pts = (Array.isArray(rawPts) ? rawPts : []).slice(0, 16);
  const numPontos = Math.max(pts.length, 1);
  // cabeçalhos de erro obtido — um por ponto
  const erroCols = pts.length > 0
    ? pts.map((p, idx) => VTH(`Erro obtido — ${p.ponto || (idx + 1)}`))
    : [VTH('Erro obtido')];
  const numResultCols = numPontos + 5; // erros + Atende + Periodicidade + Em uso + Observações + Data + Responsável = +5 fixas... we count: atende(1)+period(1)+em_uso(1)+obs(1)+data(1)+resp(1)=6
  const totalResultCols = numPontos + 6;

  const calRows = (eq.historico_calibracao || []).length > 0
    ? (eq.historico_calibracao || []).map((c) => {
        const erros = (c.erros_obtidos || []);
        const erroTds = Array.from({ length: numPontos }, (_, idx) =>
          `<td style="border:1px solid #bbb;text-align:center;padding:2px">${erros[idx] || ''}</td>`
        ).join('');
        return `
    <tr style="font-size:7px">
      <td style="border:1px solid #bbb;padding:2px 3px">${c.numero_certificado || ''}</td>
      <td style="border:1px solid #bbb;text-align:center;padding:2px">${c.orgao || ''}</td>
      <td style="border:1px solid #bbb;text-align:center;padding:2px">${simNao(c.titulo)}</td>
      <td style="border:1px solid #bbb;text-align:center;padding:2px">${simNao(c.identificacao_lab)}</td>
      <td style="border:1px solid #bbb;text-align:center;padding:2px">${simNao(c.selo_rbc)}</td>
      <td style="border:1px solid #bbb;text-align:center;padding:2px">${simNao(c.identificacao_certificado)}</td>
      <td style="border:1px solid #bbb;text-align:center;padding:2px">${simNao(c.numero_paginas)}</td>
      <td style="border:1px solid #bbb;text-align:center;padding:2px">${simNao(c.nome_endereco_cliente)}</td>
      <td style="border:1px solid #bbb;text-align:center;padding:2px">${simNao(c.descricao_item_calibrado)}</td>
      <td style="border:1px solid #bbb;text-align:center;padding:2px">${simNao(c.identificacao_metodo)}</td>
      <td style="border:1px solid #bbb;text-align:center;padding:2px">${simNao(c.data_calibracao)}</td>
      <td style="border:1px solid #bbb;text-align:center;padding:2px">${simNao(c.nome_autorizou)}</td>
      <td style="border:1px solid #bbb;text-align:center;padding:2px">${simNao(c.rastreabilidade)}</td>
      <td style="border:1px solid #bbb;text-align:center;padding:2px">${simNao(c.certificado_aceito)}</td>
      <td style="border:none;background:#fff;padding:0"></td>
      ${erroTds}
      <td style="border:1px solid #bbb;text-align:center;padding:2px">${simNao(c.atende_especificado)}</td>
      <td style="border:1px solid #bbb;text-align:center;padding:2px">${c.periodicidade || ''}</td>
      <td style="border:1px solid #bbb;text-align:center;padding:2px">${simNao(c.item_em_uso)}</td>
      <td style="border:1px solid #bbb;text-align:center;padding:2px">${c.observacoes_resultado || ''}</td>
      <td style="border:1px solid #bbb;text-align:center;padding:2px">${c.data_analise || ''}</td>
      <td style="border:1px solid #bbb;text-align:center;padding:2px">${c.responsavel_analise || ''}</td>
    </tr>`;
      }).join('')
    : Array(5).fill(`<tr style="height:18px">
      ${Array(14).fill('<td style="border:1px solid #bbb"></td>').join('')}
      <td style="border:none;background:#fff;padding:0"></td>
      ${Array(totalResultCols).fill('<td style="border:1px solid #bbb"></td>').join('')}
    </tr>`).join('');

  const extraEmpty = Math.max(0, 5 - (eq.historico_calibracao || []).length);
  const emptyRows = Array(extraEmpty).fill(`<tr style="height:18px">
      ${Array(14).fill('<td style="border:1px solid #bbb"></td>').join('')}
      <td style="border:none;background:#fff;padding:0"></td>
      ${Array(totalResultCols).fill('<td style="border:1px solid #bbb"></td>').join('')}
    </tr>`).join('');

  return `
<table style="margin-bottom:0;width:100%">
  <thead>
    <tr>
      <th rowspan="2" style="vertical-align:middle;font-size:6.5px;text-align:center;background:#f2f1ef;min-width:70px">IDENTIFICAÇÃO<br><span style="font-weight:normal;font-size:6px">Nº do certificado</span></th>
      <th colspan="13" style="background:#f2f1ef;font-size:7px">ANÁLISE DAS INFORMAÇÕES DO CERTIFICADO</th>
      <td style="border:none;background:#fff;padding:0;width:4px"></td>
      <th colspan="${totalResultCols}" style="background:#f2f1ef;font-size:7px">ANÁLISE DOS RESULTADOS</th>
    </tr>
    <tr>
      ${VTH('Órgão')}
      ${VTH('Título')}
      ${VTH('Identificação do lab.')}
      ${VTH('Selo RBC e nº CAL')}
      ${VTH('Identificação do certificado')}
      ${VTH('Número de páginas')}
      ${VTH('Nome e endereço do cliente')}
      ${VTH('Descrição do item calibrado')}
      ${VTH('Identificação do método utilizado')}
      ${VTH('Data da calibração')}
      ${VTH('Nome e função da pessoa que autorizou a emissão do certificado')}
      ${VTH('Rastreabilidade das medições')}
      ${VTH('Certificado pode ser aceito?')}
      <td style="border:none;background:#fff;padding:0"></td>
      ${erroCols.join('')}
      ${VTH('Atende ao especificado?')}
      ${VTH('Periodicidade entre calibrações')}
      ${VTH('Item pode ser colocado em uso?')}
      ${VTH('Observações')}
      ${VTH('Data da análise')}
      ${VTH('Responsável pela análise')}
    </tr>
  </thead>
  <tbody>
    ${calRows}
    ${emptyRows}
  </tbody>
</table>`;
})()}

<!-- ═══ MANUTENÇÃO ═══ -->
<div class="sec" style="margin-top:6px;background-color: #bfcf99;border: 1px solid #bbb">MANUTENÇÃO</div>
<table style="margin-bottom:0">
  <thead>
    <tr>
      <th colspan="4" class="legend-lc" style="font-size:7px">LC</th>
      <th colspan="2" class="legend-qua" style="font-size:7px">QUA</th>
      <th colspan="6" style="background:#e8dcc8;font-size:7px">OP</th>
      <th colspan="1" class="legend-lc" style="font-size:7px">LC</th>
      <th colspan="1" class="legend-qua" style="font-size:7px">QUA</th>
      <th colspan="1" class="legend-lc" style="font-size:7px">LC</th>
    </tr>
    <tr>
      ${VTH_MAN('Data', 'background: #bfcf99')}
      ${VTH_MAN('Descrição do problema apresentado', 'background: #bfcf99')}
      ${VTH_MAN('FORM 011 - Etiqueta NC', 'background: #bfcf99')}
      ${VTH_MAN('Responsável', 'background: #bfcf99')}
      ${VTH_MAN('Status FORM 012', 'background: #566E3D; color: #ffffff !important;')}
      ${VTH_MAN('Data da aprovação','background: #566E3D;color: #ffffff !important;')}
      ${VTH_MAN('Fornecedor','background: #e8dcc8')}
      ${VTH_MAN('Ordem de compra','background: #e8dcc8')}
      ${VTH_MAN('Data ordem de compra','background: #e8dcc8')}
      ${VTH_MAN('Nota Fiscal','background: #e8dcc8')}
      ${VTH_MAN('Data do recebimento','background: #e8dcc8')}
      <th style="min-width:90px;font-size:7px;background: #e8dcc8">Detalhes da execução do Serviço</th>
      ${VTH_MAN('Inspeção de recebimento','background: #bfcf99')}
      ${VTH_MAN('Análise Crítica','background: #566E3D;color: #ffffff !important;')}
      ${VTH_MAN('Status FORM 012','background: #bfcf99')}
    </tr>
  </thead>
  <tbody>
    ${manRows}
    ${manEmptyRows}
  </tbody>
</table>

<!-- ═══ LEGENDA ═══ -->
<table style="width:180px;margin-top:8px;border:none">
  <tr><td colspan="2" style="border:none;font-weight:bold;font-size:8px;padding:2px 0">Legenda</td></tr>
  <tr>
    <td class="legend-lc" style="width:30px;font-weight:bold;border:1px solid #aaa;padding:2px 4px;font-size:7px">LC</td>
    <td class="legend-lc" style="border:1px solid #aaa;padding:2px 6px;font-size:7px">Laboratório Central</td>
  </tr>
  <tr>
    <td class="legend-qua" style="font-weight:bold;border:1px solid #aaa;padding:2px 4px;font-size:7px">QUA</td>
    <td class="legend-qua" style="border:1px solid #aaa;padding:2px 6px;font-size:7px">Qualidade</td>
  </tr>
  <tr>
    <td style="background:#e8dcc8;font-weight:bold;border:1px solid #aaa;padding:2px 4px;font-size:7px">OP</td>
    <td style="background:#e8dcc8;border:1px solid #aaa;padding:2px 6px;font-size:7px">Operações</td>
  </tr>
</table>

</div>
</body>
</html>`;
}