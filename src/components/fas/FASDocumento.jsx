import { useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';

const sim_nao = (val) => val ? 'Sim' : 'Não';
const fmt_date = (d) => d ? new Date(d).toLocaleDateString('pt-BR') : '—';

export default function FASDocumento({ fas, onClose }) {
  const docRef = useRef(null);

  const handlePrint = async () => {
    try {
      const response = await base44.functions.invoke('generateFASPDF', { fas });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `FAS-${fas.numero_fas || 'documento'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
    }
  };

  const printStyles = `
    @media print {
      html { margin: 0; padding: 0; }
      body { margin: 0 !important; padding: 0 !important; width: 100vw; overflow: hidden !important; }
      body::-webkit-scrollbar { display: none !important; width: 0 !important; }
      * { scrollbar-width: none !important; }
    }
  `;

  const itens = fas.itens || [];
  const andamento = fas.andamento || [];
  // Preenche até ter pelo menos 25 linhas na tabela de ensaios
  const LINHAS_ENSAIO = 25;
  const linhasVazias = Math.max(0, LINHAS_ENSAIO - itens.length);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex flex-col overflow-hidden">
      <style>{printStyles}</style>
      {/* Top bar */}
      <div className="flex-shrink-0 flex items-center justify-between px-5 py-3 bg-white border-b shadow-sm print:hidden">
        <span className="font-semibold text-foreground text-sm">
          Visualizar FAS — {fas.numero_proposta || fas.numero_fas}
        </span>
        <div className="flex gap-2">
          <Button size="sm" className="gap-2" onClick={handlePrint}>
            <Download className="w-4 h-4" />
            Baixar PDF
          </Button>
          <Button size="sm" variant="ghost" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Scroll area */}
      <div className="flex-1 overflow-auto bg-gray-200 flex justify-center py-6 px-4">
        {/* A4 document */}
        <div
          ref={docRef}
          style={{ width: '794px', minHeight: '1123px', background: '#fff', fontFamily: 'Arial, sans-serif', fontSize: '9px', color: '#000', padding: '8px 12px', boxSizing: 'border-box' }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1.5px solid #000', paddingBottom: '6px', marginBottom: '8px' }}>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '13px', letterSpacing: '1px', color: '#1a1a1a' }}>AFIRMAEVIAS</div>
              <div style={{ fontSize: '7px', color: '#666' }}>e n g e n h a r i a  n i v e l</div>
              <div style={{ fontSize: '7px', marginTop: '4px', color: '#888' }}>FORM 045 A- REV 00 - 07/07/2025</div>
            </div>
            <div style={{ textAlign: 'center', flex: 1, padding: '0 16px' }}>
              <div style={{ fontWeight: 'bold', fontSize: '13px' }}>FORMULÁRIO DE APROVAÇÃO DE SERVIÇO</div>
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
                ['Responsável', `${fas.responsavel || ''}`],
                ['E-mail para envio:', fas.email_envio || ''],
              ].map(([label, value], i) => (
                <tr key={i}>
                  <td style={{ border: '1px solid #ccc', padding: '3px 6px', width: '120px', fontWeight: 'bold', background: '#f5f5f5', whiteSpace: 'nowrap' }}>{label}</td>
                  <td style={{ border: '1px solid #ccc', padding: '3px 8px' }}>{value}</td>
                </tr>
              ))}
              <tr>
                <td style={{ border: '1px solid #ccc', padding: '3px 6px', fontWeight: 'bold', background: '#f5f5f5' }}>Anotação de Responsabilidade Técnica (ART):</td>
                <td style={{ border: '1px solid #ccc', padding: '3px 8px', textAlign: 'center' }}>
                  <span style={{ border: '1px solid #aaa', padding: '1px 12px', background: '#e9e9e9' }}>{sim_nao(fas.exige_art)}</span>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Ensaios header */}
          <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '9px', border: '1px solid #ccc', borderBottom: 'none', padding: '3px', background: '#f0f0f0', marginTop: '6px' }}>
            ENSAIOS
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '6px' }}>
            <thead>
              <tr style={{ background: '#f0f0f0' }}>
                {['Objetivo', 'Serviço', 'Norma', 'Quantidade', 'Unidade', 'Prazo', 'Decl. De Conf.', 'Símbolo'].map(h => (
                  <th key={h} style={{ border: '1px solid #ccc', padding: '2px 4px', fontWeight: 'bold', textAlign: 'center', fontSize: '8px' }}>{h}</th>
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
                  <td style={{ border: '1px solid #ccc', padding: '2px 4px', textAlign: 'center' }}>{sim_nao(fas.declaracao_confidencialidade)}</td>
                  <td style={{ border: '1px solid #ccc', padding: '2px 4px', textAlign: 'center' }}>{sim_nao(fas.exige_simbolo)}</td>
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
          <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '9px', border: '1px solid #ccc', borderBottom: 'none', padding: '3px', background: '#f0f0f0' }}>
            OBSERVAÇÕES DA PROPOSTA
          </div>
          <div style={{ border: '1px solid #ccc', minHeight: '60px', padding: '4px 6px', marginBottom: '6px', fontSize: '9px' }}>
            {fas.observacoes || ''}
          </div>

          {/* Andamento */}
          <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '9px', border: '1px solid #ccc', borderBottom: 'none', padding: '3px', background: '#f0f0f0' }}>
            ANDAMENTO DAS ATIVIDADES
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '6px' }}>
            <thead>
              <tr style={{ background: '#f0f0f0' }}>
                <th style={{ border: '1px solid #ccc', padding: '2px 6px', width: '120px', textAlign: 'left' }}>Data</th>
                <th style={{ border: '1px solid #ccc', padding: '2px 6px', textAlign: 'left' }}>Descrição</th>
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
              {Array.from({ length: Math.max(0, 5 - andamento.length) }).map((_, i) => (
                <tr key={`ea-${i}`} style={{ height: '14px' }}>
                  <td style={{ border: '1px solid #ccc', padding: '2px 6px' }}>&nbsp;</td>
                  <td style={{ border: '1px solid #ccc', padding: '2px 6px' }}>&nbsp;</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Considerações */}
          <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '9px', border: '1px solid #ccc', borderBottom: 'none', padding: '3px', background: '#f0f0f0' }}>
            CONSIDERAÇÕES
          </div>
          <div style={{ border: '1px solid #ccc', minHeight: '36px', padding: '4px 6px', marginBottom: '8px' }}>&nbsp;</div>

          {/* Rodapé assinatura */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
            <tbody>
              <tr>
                <td style={{ border: '1px solid #ccc', padding: '3px 6px', width: '120px', fontWeight: 'bold', background: '#f5f5f5' }}>Solicitante:</td>
                <td style={{ border: '1px solid #ccc', padding: '3px 8px' }}>{fas.nome_solicitante || ''}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #ccc', padding: '3px 6px', fontWeight: 'bold', background: '#f5f5f5' }}>Data:</td>
                <td style={{ border: '1px solid #ccc', padding: '3px 8px' }}>{fmt_date(fas.data_solicitacao)}</td>
              </tr>
            </tbody>
          </table>

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #ccc', paddingTop: '4px', fontSize: '7px', color: '#888' }}>
            <span>FORM 045 - REV 06 - 09/06/2025</span>
            <span>Página 1 de 1</span>
          </div>
        </div>
      </div>
    </div>
  );
}