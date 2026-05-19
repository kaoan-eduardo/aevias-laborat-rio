import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Printer, X } from 'lucide-react';
import { BRAND_CSS, BRAND, BRAND_STYLES } from '@/lib/brandColors';

const sim_nao = (val) => val ? 'Sim' : 'Não';
const fmt_date = (d) => d ? new Date(d).toLocaleDateString('pt-BR') : '—';

export function buildFASHtml(fas) {
  const itens = fas.itens || [];
  const andamento = fas.andamento || [];
  const LINHAS_ENSAIO = 43;
  const linhasVazias = Math.max(0, LINHAS_ENSAIO - itens.length);

  const itensRows = itens.map(item => `
    <tr>
      <td style="border:1px solid #ccc;padding:2px 4px;text-align:center">${item.ensaio_nome ? 'ENSAIOS' : ''}</td>
      <td style="border:1px solid #ccc;padding:2px 4px">${item.ensaio_nome || ''}</td>
      <td style="border:1px solid #ccc;padding:2px 4px">${item.norma || ''}</td>
      <td style="border:1px solid #ccc;padding:2px 4px;text-align:center">${item.quantidade ? String(item.quantidade).padStart(2,'0') : ''}</td>
      <td style="border:1px solid #ccc;padding:2px 4px;text-align:center">${item.unidade || ''}</td>
      <td style="border:1px solid #ccc;padding:2px 4px;text-align:center">${item.prazo_dias ? item.prazo_dias + ' Dias Úteis' : ''}</td>
      <td style="border:1px solid #ccc;padding:2px 4px;text-align:center">${sim_nao(item.declaracao_confidencialidade)}</td>
      <td style="border:1px solid #ccc;padding:2px 4px;text-align:center">${sim_nao(item.exige_simbolo)}</td>
    </tr>`).join('');

  const emptyRows = Array.from({length: linhasVazias}).map(() =>
    `<tr style="height:14px">${Array.from({length:8}).map(()=>'<td style="border:1px solid #ccc;padding:2px 4px">&nbsp;</td>').join('')}</tr>`
  ).join('');

  const andamentoRows = andamento.map(a =>
    `<tr style="height:14px"><td style="border:1px solid #ccc;padding:2px 6px">${a.data ? fmt_date(a.data) : ''}</td><td style="border:1px solid #ccc;padding:2px 6px">${a.atividade || ''}</td></tr>`
  ).join('');

  const emptyAndamento = Array.from({length: Math.max(0, 3 - andamento.length)}).map(() =>
    `<tr style="height:14px"><td style="border:1px solid #ccc;padding:2px 6px">&nbsp;</td><td style="border:1px solid #ccc;padding:2px 6px">&nbsp;</td></tr>`
  ).join('');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>FAS - ${fas.numero_fas || fas.numero_proposta}</title>
  <style>${BRAND_CSS}
    /* sec-hdr is already defined in BRAND_CSS */
  </style>
</head>
<body>
<div class="top-bar">
  <span class="top-bar-title">Formulário de Aprovação de Serviço — PC n° ${fas.numero_proposta || '—'}</span>
  <button class="top-bar-btn" onclick="window.print()">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"/></svg>
    Gerar PDF
  </button>
</div>
<div class="doc">
  <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1.5px solid #000;padding-bottom:6px;margin-bottom:8px">
    <div style="min-width:160px;display:flex;flex-direction:column;align-items:flex-start;gap:2px">
      <img src="https://media.base44.com/images/public/69fdf070216c826565ee0876/4cb4a9760_image.png" style="max-width:140px;height:auto;display:block"/>
      <div style="font-size:7px;margin-top:2px;color:#888;font-family:'Poppins',Arial,sans-serif">FORM 045 A- REV 00 - 07/07/2025</div>
    </div>
    <div style="text-align:center;flex:1;padding:0 16px">
      <div style="font-weight:800;font-size:13px;font-family:'Exo 2',Arial,sans-serif;color:#333">FORMULÁRIO DE APROVAÇÃO DE SERVIÇO</div>
    </div>
    <div style="border:1px solid #000;padding:6px 10px;text-align:center;min-width:140px">
      <div style="font-size:8px;font-weight:bold">Proposta Comercial / Rev.</div>
      <div style="font-weight:bold;font-size:10px;margin-top:2px">PC n° ${fas.numero_proposta || '—'}</div>
    </div>
  </div>

  <table style="width:100%;border-collapse:collapse;margin-bottom:4px">
    <tbody>
      <tr><td style="border:1px solid ${BRAND.cellBorder};padding:3px 6px;width:120px;font-weight:700;background:${BRAND.labelBg};white-space:nowrap;font-family:'Exo 2',Arial,sans-serif;color:${BRAND.labelText}">Contratante</td><td style="border:1px solid ${BRAND.cellBorder};padding:3px 8px;font-family:'Poppins',Arial,sans-serif">${fas.razao_social || ''}</td></tr>
      <tr><td style="border:1px solid ${BRAND.cellBorder};padding:3px 6px;width:120px;font-weight:700;background:${BRAND.labelBg};white-space:nowrap;font-family:'Exo 2',Arial,sans-serif;color:${BRAND.labelText}">CNPJ</td><td style="border:1px solid ${BRAND.cellBorder};padding:3px 8px;font-family:'Poppins',Arial,sans-serif">${fas.cnpj || ''}</td></tr>
      <tr><td style="border:1px solid ${BRAND.cellBorder};padding:3px 6px;width:120px;font-weight:700;background:${BRAND.labelBg};white-space:nowrap;font-family:'Exo 2',Arial,sans-serif;color:${BRAND.labelText}">Responsável</td><td style="border:1px solid ${BRAND.cellBorder};padding:3px 8px;font-family:'Poppins',Arial,sans-serif">${fas.responsavel || ''}</td></tr>
      <tr><td style="border:1px solid ${BRAND.cellBorder};padding:3px 6px;width:120px;font-weight:700;background:${BRAND.labelBg};white-space:nowrap;font-family:'Exo 2',Arial,sans-serif;color:${BRAND.labelText}">E-mail para envio:</td><td style="border:1px solid ${BRAND.cellBorder};padding:3px 8px;font-family:'Poppins',Arial,sans-serif">${fas.email_envio || ''}</td></tr>
      <tr><td style="border:1px solid ${BRAND.cellBorder};padding:3px 6px;font-weight:700;background:${BRAND.labelBg};font-family:'Exo 2',Arial,sans-serif;color:${BRAND.labelText}">Anotação de Responsabilidade Técnica (ART):</td><td style="border:1px solid ${BRAND.cellBorder};padding:3px 8px;text-align:center;font-family:'Poppins',Arial,sans-serif"><span style="border:1px solid ${BRAND.footerBorder};padding:1px 12px;background:${BRAND.labelBg}">${sim_nao(fas.exige_art)}</span></td></tr>
    </tbody>
  </table>

  <div class="sec-hdr" style="margin-top:6px">ENSAIOS</div>
  <table style="width:100%;border-collapse:collapse;margin-bottom:6px">
    <thead>
      <tr style="background:${BRAND.tableHeaderBg}">
        <th style="border:1px solid ${BRAND.tableHeaderBorder};padding:2px 4px;font-weight:700;text-align:center;font-size:8px;font-family:'Exo 2',Arial,sans-serif;color:${BRAND.tableHeaderText}">Objetivo</th>
        <th style="border:1px solid ${BRAND.tableHeaderBorder};padding:2px 4px;font-weight:700;text-align:center;font-size:8px;font-family:'Exo 2',Arial,sans-serif;color:${BRAND.tableHeaderText}">Serviço</th>
        <th style="border:1px solid ${BRAND.tableHeaderBorder};padding:2px 4px;font-weight:700;text-align:center;font-size:8px;font-family:'Exo 2',Arial,sans-serif;color:${BRAND.tableHeaderText}">Norma</th>
        <th style="border:1px solid ${BRAND.tableHeaderBorder};padding:2px 4px;font-weight:700;text-align:center;font-size:8px;font-family:'Exo 2',Arial,sans-serif;color:${BRAND.tableHeaderText}">Quantidade</th>
        <th style="border:1px solid ${BRAND.tableHeaderBorder};padding:2px 4px;font-weight:700;text-align:center;font-size:8px;font-family:'Exo 2',Arial,sans-serif;color:${BRAND.tableHeaderText}">Unidade</th>
        <th style="border:1px solid ${BRAND.tableHeaderBorder};padding:2px 4px;font-weight:700;text-align:center;font-size:8px;font-family:'Exo 2',Arial,sans-serif;color:${BRAND.tableHeaderText}">Prazo</th>
        <th style="border:1px solid ${BRAND.tableHeaderBorder};padding:2px 4px;font-weight:700;text-align:center;font-size:8px;font-family:'Exo 2',Arial,sans-serif;color:${BRAND.tableHeaderText}">Decl. De Conf.</th>
        <th style="border:1px solid ${BRAND.tableHeaderBorder};padding:2px 4px;font-weight:700;text-align:center;font-size:8px;font-family:'Exo 2',Arial,sans-serif;color:${BRAND.tableHeaderText}">Símbolo</th>
      </tr>
    </thead>
    <tbody>${itensRows}${emptyRows}</tbody>
  </table>

  <div class="sec-hdr">OBSERVAÇÕES DA PROPOSTA</div>
  <div style="border:1px solid #bbb;min-height:60px;padding:4px 6px;margin-bottom:6px;font-size:9px;font-family:'Poppins',Arial,sans-serif">${fas.observacoes || ''}</div>

  <div class="sec-hdr">ANDAMENTO DAS ATIVIDADES</div>
  <table style="width:100%;border-collapse:collapse;margin-bottom:6px">
    <thead>
      <tr style="background:${BRAND.tableHeaderBg}">
        <th style="border:1px solid ${BRAND.tableHeaderBorder};padding:2px 6px;width:120px;text-align:left;font-family:'Exo 2',Arial,sans-serif;color:${BRAND.tableHeaderText}">Data</th>
        <th style="border:1px solid ${BRAND.tableHeaderBorder};padding:2px 6px;text-align:left;font-family:'Exo 2',Arial,sans-serif;color:${BRAND.tableHeaderText}">Descrição</th>
      </tr>
    </thead>
    <tbody>${andamentoRows}${emptyAndamento}</tbody>
  </table>

  <div class="sec-hdr">CONSIDERAÇÕES</div>
  <div style="border:1px solid #bbb;min-height:36px;padding:4px 6px;margin-bottom:8px;font-family:'Poppins',Arial,sans-serif">&nbsp;</div>

  <table style="width:100%;border-collapse:collapse;margin-bottom:8px">
    <tbody>
      <tr><td style="border:1px solid ${BRAND.cellBorder};padding:3px 6px;width:120px;font-weight:700;background:${BRAND.labelBg};font-family:'Exo 2',Arial,sans-serif;color:${BRAND.labelText}">Solicitante:</td><td style="border:1px solid ${BRAND.cellBorder};padding:3px 8px;font-family:'Poppins',Arial,sans-serif">${fas.nome_solicitante || ''}</td></tr>
      <tr><td style="border:1px solid ${BRAND.cellBorder};padding:3px 6px;font-weight:700;background:${BRAND.labelBg};font-family:'Exo 2',Arial,sans-serif;color:${BRAND.labelText}">Data:</td><td style="border:1px solid ${BRAND.cellBorder};padding:3px 8px;font-family:'Poppins',Arial,sans-serif">${fmt_date(fas.data_solicitacao)}</td></tr>
    </tbody>
  </table>

  <div style="display:flex;justify-content:space-between;border-top:1px solid ${BRAND.footerBorder};padding-top:4px;font-size:7px;color:${BRAND.footerText};font-family:'Exo 2',Arial,sans-serif">
    <span>FORM 045 A- REV 00 - 07/07/2025</span>
    <span>Página 1 de 1</span>
  </div>
</div>
</body>
</html>`;
}

export function openFASInNewTab(fas) {
  if (fas.id) {
    window.open(`/impressao/fas/${fas.id}`, '_blank');
    return;
  }
  const html = buildFASHtml(fas);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}

export default function FASDocumento({ fas, onClose }) {
  const docRef = useRef(null);

  const handlePrint = () => {
    const html = buildFASHtml(fas);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const newTab = window.open(url, '_blank');
    setTimeout(() => { newTab.print(); }, 800);
  };

  const itens = fas.itens || [];
  const andamento = fas.andamento || [];
  const LINHAS_ENSAIO = 43; // Alinhado com buildFASHtml para consistência visual
  const linhasVazias = Math.max(0, LINHAS_ENSAIO - itens.length);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex-shrink-0 flex items-center justify-between px-5 py-3 bg-white border-b shadow-sm">
        <span className="font-semibold text-foreground text-sm">
          Visualizar FAS — {fas.numero_proposta || fas.numero_fas}
        </span>
        <div className="flex gap-2">
          <Button size="sm" className="gap-2" onClick={handlePrint}>
            <Printer className="w-4 h-4" />
            Imprimir PDF
          </Button>
          <Button size="sm" variant="ghost" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Scroll area */}
      <div className="flex-1 overflow-auto bg-gray-200 flex justify-center py-6 px-4">
        {/* A4 document preview */}
        <div
          ref={docRef}
          style={{ width: '794px', minHeight: '1123px', background: '#fff', fontFamily: 'Arial, sans-serif', fontSize: '9px', color: '#000', padding: '8px 12px', boxSizing: 'border-box' }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1.5px solid #000', paddingBottom: '6px', marginBottom: '8px' }}>
            <div style={{ minWidth: '160px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
              <img src="https://media.base44.com/images/public/69fdf070216c826565ee0876/69f355834_image.png" style={{ maxWidth: '140px', height: 'auto', display: 'block' }} />
              <div style={{ fontSize: '7px', marginTop: '2px', color: '#888', fontFamily: "'Poppins', Arial, sans-serif" }}>FORM 045 A- REV 00 - 07/07/2025</div>
            </div>
            <div style={{ textAlign: 'center', flex: 1, padding: '0 16px' }}>
              <div style={{ fontWeight: '800', fontSize: '13px', fontFamily: "'Exo 2', Arial, sans-serif", color: '#333' }}>FORMULÁRIO DE APROVAÇÃO DE SERVIÇO</div>
            </div>
            <div style={{ border: '1px solid #000', padding: '6px 10px', textAlign: 'center', minWidth: '140px' }}>
              <div style={{ fontSize: '8px', fontWeight: 'bold' }}>Proposta Comercial / Rev.</div>
              <div style={{ fontWeight: 'bold', fontSize: '10px', marginTop: '2px' }}>PC n° {fas.numero_proposta || '—'}</div>
            </div>
          </div>

          {/* Campos Contratante */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '4px' }}>
            <tbody>
              {[
                ['Contratante', fas.razao_social || ''],
                ['CNPJ', fas.cnpj || ''],
                ['Responsável', fas.responsavel || ''],
                ['E-mail para envio:', fas.email_envio || ''],
              ].map(([label, value], i) => (
                <tr key={i}>
                  <td style={BRAND_STYLES.labelCell({ width: '120px', whiteSpace: 'nowrap' })}>{label}</td>
                  <td style={BRAND_STYLES.valueCell()}>{value}</td>
                </tr>
              ))}
              <tr>
                <td style={BRAND_STYLES.labelCell()}>Anotação de Responsabilidade Técnica (ART):</td>
                <td style={{ ...BRAND_STYLES.valueCell(), textAlign: 'center' }}>
                  <span style={{ border: `1px solid ${BRAND.footerBorder}`, padding: '1px 12px', background: BRAND.labelBg }}>{sim_nao(fas.exige_art)}</span>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Ensaios header */}
          <div style={{ ...BRAND_STYLES.sectionHdr(), marginTop: '6px' }}>
            ENSAIOS
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '6px' }}>
            <thead>
              <tr style={{ background: BRAND.tableHeaderBg }}>
                {['Objetivo', 'Serviço', 'Norma', 'Quantidade', 'Unidade', 'Prazo', 'Decl. De Conf.', 'Símbolo'].map(h => (
                  <th key={h} style={{ border: `1px solid ${BRAND.tableHeaderBorder}`, padding: '2px 4px', fontWeight: '700', textAlign: 'center', fontSize: '8px', fontFamily: BRAND.fontHeader, color: BRAND.tableHeaderText }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {itens.map((item, i) => (
                <tr key={i}>
                  <td style={{ border: '1px solid #ccc', padding: '2px 4px', textAlign: 'center' }}>{item.ensaio_nome ? 'ENSAIOS' : ''}</td>
                  <td style={{ border: '1px solid #ccc', padding: '2px 4px' }}>{item.ensaio_nome || ''}</td>
                  <td style={{ border: '1px solid #ccc', padding: '2px 4px' }}>{item.norma || ''}</td>
                  <td style={{ border: '1px solid #ccc', padding: '2px 4px', textAlign: 'center' }}>{item.quantidade ? String(item.quantidade).padStart(2, '0') : ''}</td>
                  <td style={{ border: '1px solid #ccc', padding: '2px 4px', textAlign: 'center' }}>{item.unidade || ''}</td>
                  <td style={{ border: '1px solid #ccc', padding: '2px 4px', textAlign: 'center' }}>{item.prazo_dias ? `${item.prazo_dias} Dias Úteis` : ''}</td>
                  <td style={{ border: '1px solid #ccc', padding: '2px 4px', textAlign: 'center' }}>{sim_nao(item.declaracao_confidencialidade)}</td>
                  <td style={{ border: '1px solid #ccc', padding: '2px 4px', textAlign: 'center' }}>{sim_nao(item.exige_simbolo)}</td>
                </tr>
              ))}
              {Array.from({ length: linhasVazias }).map((_, i) => (
                <tr key={`empty-${i}`} style={{ height: '14px' }}>
                  {Array.from({ length: 8 }).map((__, j) => (
                    <td key={j} style={{ border: '1px solid #ccc', padding: '2px 4px' }}>&nbsp;</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Observações */}
          <div style={BRAND_STYLES.sectionHdr()}>
            OBSERVAÇÕES DA PROPOSTA
          </div>
          <div style={{ border: '1px solid #bbb', minHeight: '65px', padding: '4px 6px', marginBottom: '6px', fontSize: '9px', fontFamily: "'Poppins', Arial, sans-serif" }}>
            {fas.observacoes || ''}
          </div>

          {/* Andamento */}
          <div style={BRAND_STYLES.sectionHdr()}>
            ANDAMENTO DAS ATIVIDADES
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '6px' }}>
            <thead>
              <tr style={{ background: BRAND.tableHeaderBg }}>
                <th style={{ border: `1px solid ${BRAND.tableHeaderBorder}`, padding: '2px 6px', width: '120px', textAlign: 'left', fontFamily: BRAND.fontHeader, color: BRAND.tableHeaderText }}>Data</th>
                <th style={{ border: `1px solid ${BRAND.tableHeaderBorder}`, padding: '2px 6px', textAlign: 'left', fontFamily: BRAND.fontHeader, color: BRAND.tableHeaderText }}>Descrição</th>
              </tr>
            </thead>
            <tbody>
              {andamento.length === 0 && (
                <tr style={{ height: '14px' }}>
                  <td style={{ border: '1px solid #ccc', padding: '2px 6px' }}>&nbsp;</td>
                  <td style={{ border: '1px solid #ccc', padding: '2px 6px' }}>&nbsp;</td>
                </tr>
              )}
              {andamento.map((a, i) => (
                <tr key={i} style={{ height: '14px' }}>
                  <td style={{ border: '1px solid #ccc', padding: '2px 6px' }}>{a.data ? fmt_date(a.data) : ''}</td>
                  <td style={{ border: '1px solid #ccc', padding: '2px 6px' }}>{a.atividade || ''}</td>
                </tr>
              ))}
              {Array.from({ length: Math.max(0, 3 - andamento.length) }).map((_, i) => (
                <tr key={`ea-${i}`} style={{ height: '14px' }}>
                  <td style={{ border: '1px solid #ccc', padding: '2px 6px' }}>&nbsp;</td>
                  <td style={{ border: '1px solid #ccc', padding: '2px 6px' }}>&nbsp;</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Considerações */}
          <div style={BRAND_STYLES.sectionHdr()}>
            CONSIDERAÇÕES
          </div>
          <div style={{ border: '1px solid #bbb', minHeight: '65px', padding: '4px 6px', marginBottom: '6px', fontSize: '9px', fontFamily: "'Poppins', Arial, sans-serif" }}>
            {fas.consideracoes || ''}
          </div>

          {/* Rodapé assinatura */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
            <tbody>
              <tr>
                <td style={BRAND_STYLES.labelCell({ width: '120px' })}>Solicitante:</td>
...
                <td style={BRAND_STYLES.labelCell()}>Data:</td>
                <td style={BRAND_STYLES.valueCell()}>{fmt_date(fas.data_solicitacao)}</td>
              </tr>
            </tbody>
          </table>

          {/* Footer */}
          <div style={BRAND_STYLES.footer()}>
            <span>FORM 045 A- REV 00 - 07/07/2025</span>
            <span>Página 1 de 1</span>
          </div>
        </div>
      </div>
    </div>
  );
}