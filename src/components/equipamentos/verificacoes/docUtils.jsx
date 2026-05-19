// Utilitários compartilhados para geração de documentos de impressão
import { BRAND_CSS, BRAND } from '@/lib/brandColors';

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

// Re-export BRAND_CSS so doc files can import from a single place
export { BRAND_CSS, BRAND };

export const COMMON_STYLES = BRAND_CSS + `
  .section-header {
    background: #566E3D; color: #F2F1EF; border: 1px solid #566E3D; border-bottom: none;
    padding: 3px 6px; text-align: center; font-weight: 800; font-size: 8px;
    letter-spacing: .5px; font-family: 'Exo 2', Arial, sans-serif;
  }
  table { border-collapse:collapse; width:100%; }
  td, th { border:1px solid #bbb; font-size:8px; }
  th { background:#BFCF99; color:#333; font-weight:700; text-align:center; padding:2px 4px; font-family:'Exo 2',Arial,sans-serif; }
  td { padding:2px 4px; font-family:'Poppins',Arial,sans-serif; }
  td.lbl { background:#F2F1EF; font-weight:700; font-family:'Exo 2',Arial,sans-serif; color:#333; }
  .logo-box { border:1.5px solid #566E3D; padding:4px 8px; display:inline-block; }
  @page { margin: 10mm; size: A4; }
`;

export const docHeader = (titulo, form, emissao, revisao, mesAno) => `
  <table style="width:100%;border-collapse:collapse;margin-bottom:6px">
    <tr>
      <td style="border:1.5px solid #aaa;padding:6px 10px;width:140px;text-align:center;vertical-align:middle;background:#F2F1EF">
        <img src="https://media.base44.com/images/public/69fdf070216c826565ee0876/4cb4a9760_image.png" style="max-width:120px;height:auto;display:block;margin:0 auto" />
      </td>
      <td style="border:1.5px solid #aaa;padding:4px 8px;text-align:center;font-weight:800;font-size:11px;vertical-align:middle;font-family:'Exo 2',Arial,sans-serif;color:#333">
        ${titulo}
      </td>
      <td style="border:1.5px solid #aaa;padding:4px 8px;width:160px;vertical-align:middle;text-align:center;background:#F2F1EF">
        <div style="font-size:7px;color:#566E3D;font-family:'Poppins',Arial,sans-serif">Identificação do Documento Nº</div>
        <div style="font-weight:800;font-size:9px;font-family:'Exo 2',Arial,sans-serif;color:#333">${form}</div>
        <table style="width:100%;border-collapse:collapse;margin-top:3px">
          <tr>
            <th style="border:1px solid #BFCF99;padding:1px 4px;font-size:7px;background:#BFCF99;color:#333;font-family:'Exo 2',Arial,sans-serif">Emissão</th>
            <th style="border:1px solid #BFCF99;padding:1px 4px;font-size:7px;background:#BFCF99;color:#333;font-family:'Exo 2',Arial,sans-serif">Revisão</th>
          </tr>
          <tr>
            <td style="border:1px solid #bbb;padding:1px 4px;font-size:7px;text-align:center;font-family:'Poppins',Arial,sans-serif">${emissao}</td>
            <td style="border:1px solid #bbb;padding:1px 4px;font-size:7px;text-align:center;font-family:'Poppins',Arial,sans-serif">${revisao}</td>
          </tr>
        </table>
        <div style="margin-top:3px;font-size:7px;font-family:'Poppins',Arial,sans-serif">Mês/Ano: <strong style="font-family:'Exo 2',Arial,sans-serif;color:#333">${mesAno ? fmt_mes_ano(mesAno) : '___________'}</strong></div>
      </td>
    </tr>
  </table>`;