import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { buildFASHtml } from '@/components/fas/FASDocumento';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

const RENDERERS = {
  fas: { entity: 'FAS', buildHtml: buildFASHtml },
};

function PdfAnexo({ url, nome }) {
  const containerRef = useRef(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function render() {
      try {
        const pdf = await pdfjsLib.getDocument({ url, withCredentials: false }).promise;
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          if (cancelled) break;
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 2 });
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.style.cssText = 'width:794px;height:auto;display:block;margin:0 auto;';
          await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
          if (!cancelled && containerRef.current) containerRef.current.appendChild(canvas);
        }
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    render();
    return () => { cancelled = true; };
  }, [url]);

  if (error) return (
    <div style={{ padding: '16px', fontFamily: 'Arial', fontSize: '11px', color: '#c00', background: '#fff1f1', border: '1px solid #fcc' }}>
      Erro ao carregar "{nome}": {error}
    </div>
  );

  return (
    <div>
      {loading && (
        <div style={{ padding: '24px', fontFamily: 'Arial', fontSize: '11px', color: '#666', textAlign: 'center', background: '#fff' }}>
          Carregando {nome}...
        </div>
      )}
      <div ref={containerRef} />
    </div>
  );
}

export default function Impressao() {
  const { tipo, id } = useParams();
  const [fasHtml, setFasHtml] = useState(null);
  const [iframeHeight, setIframeHeight] = useState(1123);
  const [anexos, setAnexos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unknown, setUnknown] = useState(false);

  useEffect(() => {
    const renderer = RENDERERS[tipo];
    if (!renderer) { setUnknown(true); setLoading(false); return; }
    base44.entities[renderer.entity].get(id).then(data => {
      setFasHtml(renderer.buildHtml(data));
      setAnexos(data.anexos || []);
      setLoading(false);
    });
  }, [tipo, id]);

  if (unknown) return (
    <div style={{ fontFamily: 'Arial', padding: '40px' }}>Tipo de formulário desconhecido.</div>
  );

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e8ecef', fontFamily: 'Arial', fontSize: '14px', color: '#555' }}>
      Carregando documento...
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#d1d5db' }}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-page { page-break-before: always; break-before: page; }
          body { background: #fff !important; margin: 0 !important; padding: 0 !important; }
          .print-area { padding: 0 !important; gap: 0 !important; }
          .doc-wrapper { box-shadow: none !important; width: 100% !important; }
          .doc-wrapper iframe { width: 100% !important; }
        }
      `}</style>

      {/* Barra de controle */}
      <div className="no-print" style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: '#1e3a5f', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.25)'
      }}>
        <span style={{ fontFamily: 'Arial', fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.5px' }}>
          Visualização para Impressão
        </span>
        <button
          onClick={() => window.print()}
          style={{
            padding: '7px 22px', background: '#fff', color: '#1e3a5f',
            border: 'none', borderRadius: '5px', cursor: 'pointer',
            fontWeight: 'bold', fontSize: '13px'
          }}
        >
          🖨 Imprimir / Salvar PDF
        </button>
      </div>

      {/* Área de documentos */}
      <div className="print-area" style={{ padding: '32px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>

        {/* FAS principal */}
        <div className="doc-wrapper" style={{ width: 794, maxWidth: '100%', background: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.15)', overflow: 'hidden' }}>
          <iframe
            srcDoc={fasHtml}
            style={{ width: 794, height: iframeHeight, border: 'none', display: 'block' }}
            title="FAS"
            scrolling="no"
            onLoad={e => {
              try {
                const h = e.target.contentDocument?.body?.scrollHeight;
                if (h && h > 100) setIframeHeight(h);
              } catch (_) {}
            }}
          />
        </div>

        {/* Anexos PDF */}
        {anexos.map((anexo, i) => (
          <div key={i} className="doc-wrapper print-page" style={{ width: 794, maxWidth: '100%', background: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.15)', overflow: 'hidden' }}>
            <PdfAnexo url={anexo.url} nome={anexo.nome} />
          </div>
        ))}

      </div>
    </div>
  );
}