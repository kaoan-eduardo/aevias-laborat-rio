// Utilitários compartilhados para geração de documentos de impressão

export const fmt_date = (d) => {
  if (!d) return '—';
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
    const [y, m, day] = d.split('-').map(Number);
    return `${String(day).padStart(2,'0')}/${String(m).padStart(2,'0')}/${y}`;
  }
  return new Date(d).toLocaleDateString('pt-BR');
};

export const fmt_mes_ano = (mesAno) => {
  if (!mesAno) return '—';
  const [y, m] = mesAno.split('-').map(Number);
  const d = new Date(y, m - 1, 15);
  const mes = d.toLocaleDateString('pt-BR', { month: 'long' });
  return `${mes.charAt(0).toUpperCase() + mes.slice(1)}/${y}`;
};

export const dias_no_mes = (mesAno) => {
  if (!mesAno) return 31;
  const [y, m] = mesAno.split('-').map(Number);
  return new Date(y, m, 0).getDate();
};

export const situacaoCell = (situacao) => {
  const ap = situacao === 'aprovado';
  const re = situacao === 'reprovado';
  return `
    <span style="display:inline-flex;align-items:center;gap:3px;font-size:7px">
      <span style="display:inline-block;width:8px;height:8px;border:1px solid #555;background:${ap ? '#222' : '#fff'}"></span>APROVADO
      &nbsp;
      <span style="display:inline-block;width:8px;height:8px;border:1px solid #555;background:${re ? '#222' : '#fff'}"></span>REPROVADO
    </span>`;
};

export const COMMON_STYLES = `
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

export const docHeader = (titulo, form, emissao, revisao, mesAno) => `
  <table style="width:100%;border-collapse:collapse;margin-bottom:6px">
    <tr>
      <td style="border:1.5px solid #555;padding:6px 10px;width:140px;text-align:center;vertical-align:middle">
        <img src="https://media.base44.com/images/public/69fdf070216c826565ee0876/4cb4a9760_image.png" style="max-width:120px;height:auto;display:block;margin:0 auto" />
      </td>
      <td style="border:1.5px solid #555;padding:4px 8px;text-align:center;font-weight:bold;font-size:11px;vertical-align:middle">
        ${titulo}
      </td>
      <td style="border:1.5px solid #555;padding:4px 8px;width:160px;vertical-align:middle;text-align:center">
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