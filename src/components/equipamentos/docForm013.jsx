import { COMMON_STYLES } from '@/components/equipamentos/verificacoes/docUtils';

function fmt(date) {
  if (!date) return '';
  const d = new Date(date + 'T12:00:00');
  return d.toLocaleDateString('pt-BR');
}

function sim(val) {
  return val ? 'Sim' : 'Não';
}

function row(label, value) {
  return `
    <tr>
      <td style="background:#eee;font-weight:bold;width:220px;padding:4px 6px;border:1px solid #ccc;font-size:8px">${label}</td>
      <td style="padding:4px 6px;border:1px solid #ccc;font-size:9px">${value || ''}</td>
    </tr>`;
}

export function buildForm013Html(eq) {
  const hoje = new Date().toLocaleDateString('pt-BR');

  // Linhas de calibração
  const calRows = (eq.historico_calibracao || []).map((c) => `
    <tr>
      <td>${c.numero_certificado || ''}</td>
      <td>${c.orgao || ''}</td>
      <td>${c.titulo || ''}</td>
      <td style="text-align:center">${sim(c.identificacao_lab)}</td>
      <td style="text-align:center">${sim(c.selo_rbc)}</td>
      <td style="text-align:center">${sim(c.identificacao_certificado)}</td>
      <td style="text-align:center">${sim(c.numero_paginas)}</td>
      <td style="text-align:center">${sim(c.nome_endereco_cliente)}</td>
      <td style="text-align:center">${sim(c.descricao_item_calibrado)}</td>
      <td style="text-align:center">${sim(c.identificacao_metodo)}</td>
      <td style="text-align:center">${sim(c.data_calibracao)}</td>
      <td style="text-align:center">${sim(c.nome_autorizou)}</td>
      <td style="text-align:center">${sim(c.rastreabilidade)}</td>
      <td style="text-align:center">${sim(c.certificado_aceito)}</td>
    </tr>
    <tr>
      <td colspan="14" style="padding:0">
        <table style="width:100%;border-collapse:collapse;font-size:7.5px">
          <tr>
            <td style="background:#dde;font-weight:bold;text-align:center;padding:3px;border:1px solid #ccc">Erro máx. admissível (ref)</td>
            <td style="background:#dde;font-weight:bold;text-align:center;padding:3px;border:1px solid #ccc">Erro máx. obtido 1</td>
            <td style="background:#dde;font-weight:bold;text-align:center;padding:3px;border:1px solid #ccc">Erro máx. admissível 1</td>
            <td style="background:#dde;font-weight:bold;text-align:center;padding:3px;border:1px solid #ccc">Erro máx. obtido 2</td>
            <td style="background:#dde;font-weight:bold;text-align:center;padding:3px;border:1px solid #ccc">Erro máx. admissível 2</td>
            <td style="background:#dde;font-weight:bold;text-align:center;padding:3px;border:1px solid #ccc">Erro máx. obtido 3</td>
            <td style="background:#dde;font-weight:bold;text-align:center;padding:3px;border:1px solid #ccc">Atende ao especificado?</td>
            <td style="background:#dde;font-weight:bold;text-align:center;padding:3px;border:1px solid #ccc">Periodicidade</td>
            <td style="background:#dde;font-weight:bold;text-align:center;padding:3px;border:1px solid #ccc">Data calibração</td>
            <td style="background:#dde;font-weight:bold;text-align:center;padding:3px;border:1px solid #ccc">Próxima calibração</td>
            <td style="background:#dde;font-weight:bold;text-align:center;padding:3px;border:1px solid #ccc">Item em uso?</td>
            <td style="background:#dde;font-weight:bold;text-align:center;padding:3px;border:1px solid #ccc">Observações</td>
            <td style="background:#dde;font-weight:bold;text-align:center;padding:3px;border:1px solid #ccc">Data da análise</td>
            <td style="background:#dde;font-weight:bold;text-align:center;padding:3px;border:1px solid #ccc">Responsável</td>
          </tr>
          <tr>
            <td style="text-align:center;padding:3px;border:1px solid #ccc">${c.erro_maximo_admissivel_ref || ''}</td>
            <td style="text-align:center;padding:3px;border:1px solid #ccc">${c.erro_maximo_obtido_1 || ''}</td>
            <td style="text-align:center;padding:3px;border:1px solid #ccc">${c.erro_maximo_admissivel_1 || ''}</td>
            <td style="text-align:center;padding:3px;border:1px solid #ccc">${c.erro_maximo_obtido_2 || ''}</td>
            <td style="text-align:center;padding:3px;border:1px solid #ccc">${c.erro_maximo_admissivel_2 || ''}</td>
            <td style="text-align:center;padding:3px;border:1px solid #ccc;font-weight:bold;background:#ffe">${c.erro_maximo_obtido_3 || ''}</td>
            <td style="text-align:center;padding:3px;border:1px solid #ccc">${sim(c.atende_especificado)}</td>
            <td style="text-align:center;padding:3px;border:1px solid #ccc">${c.periodicidade || ''}</td>
            <td style="text-align:center;padding:3px;border:1px solid #ccc">${c.data_calibracao_resultado || ''}</td>
            <td style="text-align:center;padding:3px;border:1px solid #ccc">${c.proxima_calibracao || ''}</td>
            <td style="text-align:center;padding:3px;border:1px solid #ccc">${sim(c.item_em_uso)}</td>
            <td style="text-align:center;padding:3px;border:1px solid #ccc">${c.observacoes_resultado || ''}</td>
            <td style="text-align:center;padding:3px;border:1px solid #ccc">${c.data_analise || ''}</td>
            <td style="text-align:center;padding:3px;border:1px solid #ccc">${c.responsavel_analise || ''}</td>
          </tr>
        </table>
      </td>
    </tr>`).join('');

  // Linhas vazias de calibração (mínimo 5)
  const calEmpty = Math.max(0, 5 - (eq.historico_calibracao || []).length);
  const calEmptyRows = Array.from({ length: calEmpty }).map(() => `
    <tr><td colspan="14" style="height:20px;border:1px solid #ccc"></td></tr>
    <tr><td colspan="14" style="height:16px;border:1px solid #ccc;background:#f9f9f9"></td></tr>`).join('');

  // Linhas de manutenção
  const manRows = (eq.historico_manutencao || []).map((m) => `
    <tr>
      <td style="text-align:center">${m.data || ''}</td>
      <td>${m.descricao_problema || ''}</td>
      <td style="text-align:center">${m.form011_etiqueta_nc || ''}</td>
      <td style="text-align:center">${m.responsavel || ''}</td>
      <td style="text-align:center">${m.status_form012 || ''}</td>
      <td style="text-align:center">${m.data_aprovacao || ''}</td>
      <td style="text-align:center">${m.fornecedor || ''}</td>
      <td>${m.detalhes_execucao || ''}</td>
      <td style="text-align:center">${m.ordem_compra || ''}</td>
      <td style="text-align:center">${m.data_ordem_compra || ''}</td>
      <td style="text-align:center">${m.nota_fiscal || ''}</td>
      <td style="text-align:center">${m.data_recebimento || ''}</td>
      <td style="text-align:center">${m.inspecao_recebimento || ''}</td>
      <td style="text-align:center">${m.analise_critica || ''}</td>
      <td style="text-align:center">${m.status_form012_final || ''}</td>
    </tr>`).join('');

  const manEmpty = Math.max(0, 4 - (eq.historico_manutencao || []).length);
  const manEmptyRows = Array.from({ length: manEmpty }).map(() =>
    `<tr><td colspan="15" style="height:20px;border:1px solid #ccc"></td></tr>`).join('');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>FORM 013 — Ficha de Equipamento — ${eq.identificacao_interna}</title>
<style>
  ${COMMON_STYLES}
  body { font-family: Arial, sans-serif; font-size: 9px; color: #000; background: #fff; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #ccc; padding: 3px 5px; font-size: 8px; vertical-align: middle; }
  th { background: #d0d8e0; font-weight: bold; text-align: center; }
  .section-title {
    background: #c8d8e8;
    font-weight: bold;
    font-size: 9px;
    text-align: center;
    padding: 5px;
    letter-spacing: 1px;
    border: 1px solid #aaa;
  }
  .header-logo { font-weight: 900; font-size: 13px; color: #003366; letter-spacing: -0.5px; }
  .header-sub { font-size: 7px; color: #333; }
  .doc-id-box { font-size: 7px; text-align: center; }
  .id-badge { font-size: 20px; font-weight: bold; font-family: monospace; color: #003366; }
  .legend-lc { background: #c8d8e8; }
  .legend-qua { background: #d0e8d0; }
  .legend-op { background: #e8e0d0; }
  @media print { button { display: none !important; } }
</style>
</head>
<body>

<button onclick="window.print()" style="position:fixed;top:10px;right:10px;z-index:999;padding:8px 18px;background:#003366;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:13px">🖨️ Imprimir</button>

<!-- Cabeçalho -->
<table style="margin-bottom:4px">
  <tr>
    <td style="width:160px;border:1px solid #aaa;padding:6px 10px">
      <div class="header-logo">AFIRMAEVIAS</div>
      <div class="header-sub">engenharia viária</div>
    </td>
    <td style="text-align:center;font-weight:bold;font-size:13px;letter-spacing:2px;border:1px solid #aaa">
      FICHA DE EQUIPAMENTO
    </td>
    <td style="width:130px;border:1px solid #aaa;padding:4px" class="doc-id-box">
      <table style="width:100%;font-size:7px;border:none">
        <tr>
          <td style="border:none;font-weight:bold;background:#d0d8e0">Identificação do doc. Nº</td>
          <td style="border:none;background:#d0d8e0">FORM 013</td>
        </tr>
        <tr>
          <td style="border:none;font-weight:bold">Emissão</td>
          <td style="border:none">Revisão</td>
        </tr>
        <tr>
          <td style="border:none">25/03/2025</td>
          <td style="border:none">03</td>
        </tr>
      </table>
      <div style="text-align:right;font-size:7px;margin-top:2px">Atualizado em: ${hoje}</div>
    </td>
  </tr>
</table>

<!-- Identificação geral -->
<table style="margin-bottom:4px">
  <tr>
    <td style="background:#eee;font-weight:bold;width:220px">Responsável pela atualização:</td>
    <td>${eq.responsavel_atualizacao || ''}</td>
    <td style="width:160px;border-left:2px solid #aaa" rowspan="5">
      <div style="text-align:center;padding:4px">
        <div style="font-size:8px;font-weight:bold">Identificação unívoca:</div>
        <div class="id-badge">${eq.identificacao_interna || ''}</div>
      </div>
    </td>
  </tr>
  <tr>
    <td style="background:#eee;font-weight:bold">Nome do equipamento:</td>
    <td>${eq.nome || ''}</td>
  </tr>
  <tr>
    <td style="background:#eee;font-weight:bold">Software e versão do firmware:</td>
    <td>${eq.software_firmware || 'N.A.'}</td>
  </tr>
  <tr>
    <td style="background:#eee;font-weight:bold">Fabricante:</td>
    <td>${eq.fabricante || ''}</td>
  </tr>
  <tr>
    <td style="background:#eee;font-weight:bold">Modelo:</td>
    <td>${eq.modelo || ''}</td>
  </tr>
</table>

<table style="margin-bottom:4px">
  <tr>
    <td style="background:#eee;font-weight:bold;width:220px">Número de série:</td>
    <td>${eq.numero_serie || ''}</td>
    <td style="background:#eee;font-weight:bold;width:140px">Resolução:</td>
    <td>${eq.precisao || ''}</td>
  </tr>
  <tr>
    <td style="background:#eee;font-weight:bold">Data de entrada em serviço:</td>
    <td>${fmt(eq.data_entrada_servico)}</td>
    <td style="background:#eee;font-weight:bold">Faixa nominal máxima:</td>
    <td>${eq.faixa_nominal_maxima || ''}</td>
  </tr>
  <tr>
    <td style="background:#eee;font-weight:bold">Erro máximo admissível (EMA):</td>
    <td>${eq.erro_maximo_admissivel || ''}</td>
    <td style="background:#eee;font-weight:bold">Frequência de calibração:</td>
    <td>${eq.frequencia_calibracao || ''}</td>
  </tr>
  <tr>
    <td style="background:#eee;font-weight:bold">Categoria:</td>
    <td>${eq.categoria || ''}</td>
    <td style="background:#eee;font-weight:bold">Localização:</td>
    <td>${eq.localizacao || ''}</td>
  </tr>
</table>

<!-- Pontos de Calibração -->
<div class="section-title">PONTOS DE CALIBRAÇÃO</div>
<table style="margin-bottom:4px">
  <tr><td style="height:40px;font-size:9px">${eq.pontos_calibracao || ''}</td></tr>
</table>

<!-- Critérios de Aceitação -->
<div class="section-title">CRITÉRIOS DE ACEITAÇÃO</div>
<table style="margin-bottom:4px">
  <tr><td style="height:30px;font-size:9px">${eq.criterios_aceitacao || ''}</td></tr>
</table>

<!-- Observações -->
<div class="section-title">OBSERVAÇÕES</div>
<table style="margin-bottom:8px">
  <tr><td style="height:35px;font-size:9px">${eq.observacoes || ''}</td></tr>
</table>

<!-- CALIBRAÇÃO -->
<div class="section-title">CALIBRAÇÃO</div>
<table style="margin-bottom:2px;font-size:7px">
  <thead>
    <tr>
      <th rowspan="2" style="width:90px">IDENTIFICAÇÃO<br>Número do certificado</th>
      <th colspan="13" style="background:#c8d8e8">ANÁLISE DAS INFORMAÇÕES DO CERTIFICADO</th>
    </tr>
    <tr>
      <th style="writing-mode:vertical-rl;transform:rotate(180deg);height:70px;min-width:28px">Órgão</th>
      <th style="writing-mode:vertical-rl;transform:rotate(180deg);height:70px;min-width:28px">Título</th>
      <th style="writing-mode:vertical-rl;transform:rotate(180deg);height:70px;min-width:28px">Identificação do lab.</th>
      <th style="writing-mode:vertical-rl;transform:rotate(180deg);height:70px;min-width:28px">Selo RBC e nº CAL</th>
      <th style="writing-mode:vertical-rl;transform:rotate(180deg);height:70px;min-width:28px">Identificação do certificado</th>
      <th style="writing-mode:vertical-rl;transform:rotate(180deg);height:70px;min-width:28px">Número de páginas</th>
      <th style="writing-mode:vertical-rl;transform:rotate(180deg);height:70px;min-width:28px">Nome e endereço do cliente</th>
      <th style="writing-mode:vertical-rl;transform:rotate(180deg);height:70px;min-width:28px">Descrição do item calibrado</th>
      <th style="writing-mode:vertical-rl;transform:rotate(180deg);height:70px;min-width:28px">Identificação do método utilizado</th>
      <th style="writing-mode:vertical-rl;transform:rotate(180deg);height:70px;min-width:28px">Data da calibração</th>
      <th style="writing-mode:vertical-rl;transform:rotate(180deg);height:70px;min-width:28px">Nome e função da pessoa que autorizou</th>
      <th style="writing-mode:vertical-rl;transform:rotate(180deg);height:70px;min-width:28px">Rastreabilidade das medições</th>
      <th style="writing-mode:vertical-rl;transform:rotate(180deg);height:70px;min-width:28px">Certificado pode ser aceito?</th>
    </tr>
  </thead>
  <tbody>
    ${calRows}
    ${calEmptyRows}
  </tbody>
</table>

<!-- MANUTENÇÃO -->
<div class="section-title">MANUTENÇÃO</div>
<table style="font-size:7px">
  <thead>
    <tr>
      <th colspan="4" style="background:#c8d8e8">LC</th>
      <th colspan="2" style="background:#d0e8d0">QUA</th>
      <th colspan="7" style="background:#e8e0d0">OP</th>
      <th colspan="2" style="background:#c8d8e8">LC</th>
      <th style="background:#d0e8d0">QUA</th>
    </tr>
    <tr>
      <th style="writing-mode:vertical-rl;transform:rotate(180deg);height:60px;min-width:26px">Data</th>
      <th style="writing-mode:vertical-rl;transform:rotate(180deg);height:60px;min-width:40px">Descrição do problema apresentado</th>
      <th style="writing-mode:vertical-rl;transform:rotate(180deg);height:60px;min-width:28px">FORM 011 — Etiqueta NC</th>
      <th style="writing-mode:vertical-rl;transform:rotate(180deg);height:60px;min-width:28px">Responsável</th>
      <th style="writing-mode:vertical-rl;transform:rotate(180deg);height:60px;min-width:28px">Status FORM 012</th>
      <th style="writing-mode:vertical-rl;transform:rotate(180deg);height:60px;min-width:28px">Data da aprovação</th>
      <th style="writing-mode:vertical-rl;transform:rotate(180deg);height:60px;min-width:28px">Fornecedor</th>
      <th style="min-width:100px">Detalhes da execução do Serviço</th>
      <th style="writing-mode:vertical-rl;transform:rotate(180deg);height:60px;min-width:28px">Ordem de compra</th>
      <th style="writing-mode:vertical-rl;transform:rotate(180deg);height:60px;min-width:28px">Data ordem de compra</th>
      <th style="writing-mode:vertical-rl;transform:rotate(180deg);height:60px;min-width:28px">Nota Fiscal</th>
      <th style="writing-mode:vertical-rl;transform:rotate(180deg);height:60px;min-width:28px">Data do recebimento</th>
      <th style="writing-mode:vertical-rl;transform:rotate(180deg);height:60px;min-width:40px">Inspeção de recebimento</th>
      <th style="writing-mode:vertical-rl;transform:rotate(180deg);height:60px;min-width:28px">Análise Crítica</th>
      <th style="writing-mode:vertical-rl;transform:rotate(180deg);height:60px;min-width:28px">Status FORM 012</th>
    </tr>
  </thead>
  <tbody>
    ${manRows}
    ${manEmptyRows}
  </tbody>
</table>

<!-- Legenda -->
<table style="width:160px;margin-top:8px;font-size:7px">
  <tr><td colspan="2" style="font-weight:bold;border:none;padding:2px 0">Legenda</td></tr>
  <tr><td class="legend-lc" style="width:30px;font-weight:bold">LC</td><td class="legend-lc">Laboratório Central</td></tr>
  <tr><td class="legend-qua" style="font-weight:bold">QUA</td><td class="legend-qua">Qualidade</td></tr>
  <tr><td class="legend-op" style="font-weight:bold">OP</td><td class="legend-op">Operações</td></tr>
</table>

</body>
</html>`;
}