import { BRAND_CSS } from '@/lib/brandColors';

function fmt(date) {
  if (!date) return 'NA';
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [y, m, d] = date.split('-');
    return `${d}/${m}/${y}`;
  }
  try {
    return new Date(date).toLocaleDateString('pt-BR');
  } catch {
    return date;
  }
}

function addDias(dateStr, dias) {
  if (!dateStr || !dias) return 'NA';
  let d;
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    d = new Date(dateStr + 'T00:00:00');
  } else {
    d = new Date(dateStr);
  }
  if (isNaN(d)) return 'NA';
  d.setDate(d.getDate() + Number(dias));
  return d.toLocaleDateString('pt-BR');
}

function getStatusLabel(status) {
  const map = {
    em_uso: 'Em uso',
    em_calibracao: 'Em calibração',
    fora_de_uso: 'Retirado de uso',
    em_manutencao: 'Em manutenção',
    em_aquisicao: 'Em aquisição',
  };
  return map[status] || status || 'NA';
}

function getStatusColor(status) {
  if (status === 'em_uso') return '#d4edda';
  if (status === 'fora_de_uso') return '#f8d7da';
  if (status === 'em_calibracao') return '#fff3cd';
  if (status === 'em_manutencao') return '#fce5d4';
  return '#fff';
}

function getLastCalibracao(eq) {
  // Pegar o certificado mais recente do historico_calibracao
  const hist = eq.historico_calibracao;
  if (hist && hist.length > 0) {
    const last = hist[hist.length - 1];
    return {
      certificado: last.numero_certificado || 'NA',
    };
  }
  return { certificado: 'NA' };
}

function getLastVerificacaoInterna(eq) {
  // Verificação intermediária obrigatória
  if (!eq.obrigatorio_verificacao_intermediaria) return { periodo: 'NA', ultima: 'NA', proxima: 'NA' };
  
  // Periodicidade em dias
  const periMap = { quinzenal: 15, mensal: 30, trimestral: 90, semestral: 180, anual: 365 };
  const periodo = periMap[eq.periodicidade_verificacao] || 'NA';
  
  return { periodo, ultima: 'NA', proxima: 'NA' };
}

// Campos que constam no FORM 012 — qualquer alteração neles deve atualizar a data do documento
const FORM012_FIELDS = [
  'status', 'nome', 'identificacao_interna',
  'historico_calibracao', 'data_calibracao', 'validade_calibracao', 'frequencia_calibracao',
  'historico_manutencao',
  'obrigatorio_verificacao_intermediaria', 'periodicidade_verificacao',
  'obrigatorio_verificacao_diaria',
  'responsavel_atualizacao',
];

/**
 * Retorna a data de atualização mais recente entre todos os equipamentos
 * considerando apenas a data de última edição (updated_date) do registro.
 * O responsável é o `responsavel_atualizacao` do equipamento mais recente
 * (com fallback para o nome do usuário logado passado como parâmetro).
 */
function getForm012Meta(equipamentos, fallbackResponsavel) {
  let latestDate = null;
  let latestResponsavel = fallbackResponsavel || '';

  for (const eq of equipamentos) {
    const d = eq.updated_date ? new Date(eq.updated_date) : null;
    if (d && !isNaN(d)) {
      if (!latestDate || d > latestDate) {
        latestDate = d;
        latestResponsavel = eq.responsavel_atualizacao || fallbackResponsavel || '';
      }
    }
  }

  const dataFormatada = latestDate
    ? latestDate.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })
    : new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });

  return { dataFormatada, responsavel: latestResponsavel };
}

export function buildForm012Html(equipamentos, fallbackResponsavel) {
  const { dataFormatada: hoje, responsavel } = getForm012Meta(equipamentos, fallbackResponsavel);

  const statusMap = {
    em_uso: { label: 'Em uso', bg: '#d4edda', color: '#155724' },
    fora_de_uso: { label: 'Retirado de uso', bg: '#f8d7da', color: '#721c24' },
    em_calibracao: { label: 'Em calibração', bg: '#fff3cd', color: '#856404' },
    em_manutencao: { label: 'Em manutenção', bg: '#fce5d4', color: '#7d3c0a' },
    em_aquisicao: { label: 'Em aquisição', bg: '#e2e3e5', color: '#383d41' },
  };

  const periMap = { quinzenal: 15, mensal: 30, trimestral: 90, semestral: 180, anual: 365 };

  const rows = equipamentos.map(eq => {
    const st = statusMap[eq.status] || { label: eq.status || 'NA', bg: '#fff', color: '#000' };
    const { certificado } = getLastCalibracao(eq);
    
    // Calibração
    const dataCal = eq.data_calibracao || '';
    const validadeCal = eq.validade_calibracao || '';
    
    // Calcular periodicidade de calibração em dias
    let periodoCal = 'NA';
    if (dataCal && validadeCal) {
      const d1 = new Date(dataCal);
      const d2 = new Date(validadeCal);
      if (!isNaN(d1) && !isNaN(d2)) {
        const diff = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
        periodoCal = diff > 0 ? diff : 'NA';
      }
    } else if (eq.frequencia_calibracao) {
      const fmap = { anual: 365, semestral: 180, trimestral: 90, mensal: 30 };
      const fl = eq.frequencia_calibracao.toLowerCase();
      for (const [k, v] of Object.entries(fmap)) {
        if (fl.includes(k)) { periodoCal = v; break; }
      }
    }

    const proximaCal = validadeCal ? fmt(validadeCal) : (dataCal && periodoCal !== 'NA' ? addDias(dataCal, periodoCal) : 'NA');

    // Checagem intermediária (verificação interna 2)
    let periChecagem = 'NA';
    let ultimaChecagem = 'NA';
    let proximaChecagem = 'NA';
    if (eq.obrigatorio_verificacao_intermediaria && eq.periodicidade_verificacao) {
      periChecagem = periMap[eq.periodicidade_verificacao] || 'NA';
    }

    // Verificação diária
    let periDiaria = 'NA';
    let ultimaDiaria = 'NA';
    let proximaDiaria = 'NA';
    if (eq.obrigatorio_verificacao_diaria) {
      periDiaria = 1;
    }

    // Manutenção
    let ultimaManutencao = 'NA';
    let periManutencao = 'NA';
    let proximaManutencao = 'NA';
    if (eq.historico_manutencao && eq.historico_manutencao.length > 0) {
      const lastMan = eq.historico_manutencao[eq.historico_manutencao.length - 1];
      ultimaManutencao = lastMan.data ? lastMan.data : 'NA';
    }

    return `
    <tr style="font-size:7px;height:14px">
      <td style="border:1px solid #bbb;padding:2px 4px;font-weight:600;white-space:nowrap">${eq.identificacao_interna || 'NA'}</td>
      <td style="border:1px solid #bbb;padding:2px 4px">${eq.nome || 'NA'}</td>
      <td style="border:1px solid #bbb;padding:2px 4px;text-align:center;background:${st.bg};color:${st.color};white-space:nowrap">${st.label}</td>
      <td style="border:1px solid #bbb;padding:2px 4px;text-align:center">${certificado}</td>
      <td style="border:1px solid #bbb;padding:2px 4px;text-align:center">${fmt(dataCal)}</td>
      <td style="border:1px solid #bbb;padding:2px 4px;text-align:center">${periodoCal}</td>
      <td style="border:1px solid #bbb;padding:2px 4px;text-align:center">${proximaCal}</td>
      <td style="border:1px solid #bbb;padding:2px 4px;text-align:center">${periChecagem}</td>
      <td style="border:1px solid #bbb;padding:2px 4px;text-align:center">${ultimaChecagem}</td>
      <td style="border:1px solid #bbb;padding:2px 4px;text-align:center">${proximaChecagem}</td>
      <td style="border:1px solid #bbb;padding:2px 4px;text-align:center">${periDiaria}</td>
      <td style="border:1px solid #bbb;padding:2px 4px;text-align:center">${ultimaDiaria}</td>
      <td style="border:1px solid #bbb;padding:2px 4px;text-align:center">${proximaDiaria}</td>
      <td style="border:1px solid #bbb;padding:2px 4px;text-align:center">${ultimaManutencao}</td>
      <td style="border:1px solid #bbb;padding:2px 4px;text-align:center">${periManutencao}</td>
      <td style="border:1px solid #bbb;padding:2px 4px;text-align:center">${proximaManutencao}</td>
    </tr>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>FORM 012 — Controle de Equipamentos</title>
<style>
  ${BRAND_CSS}
  body { background: #e5e5e5; font-family: 'Poppins', Arial, sans-serif; }
  .doc { width: 1050px; background: #fff; padding: 10px 14px; margin: 0 auto; box-shadow: 0 2px 8px rgba(0,0,0,.15); }
  table { border-collapse: collapse; width: 100%; }
  td, th { border: 1px solid #bbb; font-size: 7px; vertical-align: middle; }
  .lbl { background: #F2F1EF; font-weight: 700; font-family: 'Exo 2', Arial, sans-serif; color: #00233B; padding: 2px 5px; }
  .sec-hdr { background: #BFCF99; color: #00233B; font-weight: 800; font-size: 8px; text-align: center; padding: 3px; letter-spacing: .8px; border: 1px solid #bbb; font-family: 'Exo 2', Arial, sans-serif; }
  .col-hdr { background: #F2F1EF; font-size: 7px; font-weight: 700; text-align: center; padding: 2px 3px; font-family: 'Exo 2', Arial, sans-serif; color: #00233B; }
  @media print {
    body { background: #fff; padding: 0; }
    .top-bar { display: none; }
    .doc { box-shadow: none; width: 100%; }
    @page { size: A3 landscape; margin: 6mm; }
  }
</style>
</head>
<body>

<div class="top-bar">
  <span style="font-weight:700;font-size:13px;color:#BFCF99;font-family:'Exo 2',Arial,sans-serif">FORM 012 — Controle de Equipamentos</span>
  <button onclick="window.print()" style="display:inline-flex;align-items:center;gap:6px;background:#566E3D;color:#fff;border:none;border-radius:6px;padding:7px 16px;font-size:12px;font-weight:600;cursor:pointer;font-family:'Exo 2',Arial,sans-serif">🖨️ Imprimir</button>
</div>

<div class="doc">

<!-- CABEÇALHO -->
<table style="margin-bottom:4px">
  <tr>
    <td style="width:140px;padding:6px 10px;border:1.5px solid #00233B;text-align:center;vertical-align:middle;background:#FFF">
      <img src="https://media.base44.com/images/public/69fdf070216c826565ee0876/4cb4a9760_image.png" style="max-width:120px;height:auto;display:block;margin:0 auto"/>
    </td>
    <td style="border:1.5px solid #00233B;text-align:center;font-weight:800;font-size:13px;letter-spacing:2px;vertical-align:middle;padding:6px;font-family:'Exo 2',Arial,sans-serif;color:#00233B">
      CONTROLE DE EQUIPAMENTOS
    </td>
    <td style="width:150px;border:1.5px solid #00233B;padding:4px 6px;vertical-align:top;font-size:7px;background:#FFF">
      <div style="font-weight:700;text-align:center;border-bottom:1px solid #00233b;padding-bottom:2px;margin-bottom:3px;font-family:'Exo 2',Arial,sans-serif;color:#00233b">Identificação do doc. Nº</div>
      <div style="text-align:center;font-weight:800;font-size:9px;margin-bottom:3px;font-family:'Exo 2',Arial,sans-serif;color:#00233B">FORM 012</div>
      <table style="width:100%">
        <tr>
          <th style="font-size:7px;padding:1px 3px">Emissão</th>
          <th style="font-size:7px;padding:1px 3px">Revisão</th>
        </tr>
        <tr>
          <td style="text-align:center;font-size:7px;padding:1px 3px">25/03/2025</td>
          <td style="text-align:center;font-size:7px;padding:1px 3px">02</td>
        </tr>
      </table>
    </td>
  </tr>
</table>

<!-- INFO RESPONSÁVEL -->
<table style="margin-bottom:4px;border:1.5px solid #555">
  <tr style="height:18px">
    <td class="lbl" style="width:180px">Responsável pela atualização</td>
    <td style="padding:2px 6px">${responsavel}</td>
    <td class="lbl" style="width:90px">Atualizado em</td>
    <td style="padding:2px 6px;text-align:center;width:90px">${hoje}</td>
  </tr>
</table>

<!-- LEGENDA -->
<div style="font-size:7px;margin-bottom:3px;color:#555"><strong>Legenda</strong> &nbsp; NA - Não se aplica</div>

<!-- TABELA PRINCIPAL -->
<table style="margin-bottom:0;width:100%;font-size:7px">
  <thead>
    <tr>
      <th rowspan="2" class="col-hdr" style="width:55px">Identificação</th>
      <th rowspan="2" class="col-hdr">Descrição do equipamento</th>
      <th rowspan="2" class="col-hdr" style="width:70px">Status</th>
      <th colspan="4" class="col-hdr" style="background:#BFCF99">Cronograma de calibração</th>
      <th colspan="3" class="col-hdr" style="background:#d4edda">Checagem intermediária</th>
      <th colspan="3" class="col-hdr" style="background:#e8f4fd">Verificação interna</th>
      <th colspan="3" class="col-hdr" style="background:#fce5d4">Cronograma de Manutenção</th>
    </tr>
    <tr>
      <th class="col-hdr" style="background:#BFCF99;width:65px">Certificado n°</th>
      <th class="col-hdr" style="background:#BFCF99;width:55px">Data da última calibração</th>
      <th class="col-hdr" style="background:#BFCF99;width:50px">Periodicidade (dias)</th>
      <th class="col-hdr" style="background:#BFCF99;width:55px">Data da próxima calibração</th>
      <th class="col-hdr" style="background:#d4edda;width:50px">Periodicidade (dias)</th>
      <th class="col-hdr" style="background:#d4edda;width:55px">Data da última verificação</th>
      <th class="col-hdr" style="background:#d4edda;width:55px">Data da próxima verificação</th>
      <th class="col-hdr" style="background:#e8f4fd;width:50px">Periodicidade (dias)</th>
      <th class="col-hdr" style="background:#e8f4fd;width:55px">Data da última verificação interna</th>
      <th class="col-hdr" style="background:#e8f4fd;width:55px">Data da próxima verificação interna</th>
      <th class="col-hdr" style="background:#fce5d4;width:55px">Data da última preventiva</th>
      <th class="col-hdr" style="background:#fce5d4;width:50px">Periodicidade (dias)</th>
      <th class="col-hdr" style="background:#fce5d4;width:55px">Data da próxima preventiva</th>
    </tr>
  </thead>
  <tbody>
    ${rows}
  </tbody>
</table>

<div style="font-size:6.5px;color:#888;margin-top:8px;text-align:right;font-family:'Exo 2',Arial,sans-serif">
  FORM 012 — REV 02 — 25/03/2025 &nbsp;|&nbsp; Página 1 de 1
</div>

</div>
</body>
</html>`;
}

export function openForm012(equipamentos, responsavel) {
  const html = buildForm012Html(equipamentos, responsavel);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}