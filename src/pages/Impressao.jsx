import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { buildFASHtml } from '@/components/fas/FASDocumento';
import * as pdfjsLib from 'pdfjs-dist';

const DOC_WIDTH = 794;

function ScaledPage({ children, extraClass = '', extraTop = 0 }) {
  const [scale, setScale] = useState(1);
  const wrapRef = useRef(null);

  useEffect(() => {
    function calc() {
      const available = window.innerWidth - 32; // 16px padding each side
      setScale(Math.min(1, available / DOC_WIDTH));
    }
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

  const scaledHeight = DOC_WIDTH * scale; // placeholder height (overridden below for iframes)

  return (
    <div
      className={extraClass}
      style={{
        display: 'flex',
        justifyContent: 'center',
        marginTop: extraTop,
        marginBottom: 0,
      }}
    >
      <div
        ref={wrapRef}
        style={{
          width: DOC_WIDTH * scale,
          overflow: 'visible',
        }}
      >
        <div style={{
          transformOrigin: 'top left',
          transform: `scale(${scale})`,
          width: DOC_WIDTH,
        }}>
          {children}
        </div>
      </div>
    </div>
  );
}

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
    <div style={{ width: 794, margin: '0 auto', padding: '16px', fontFamily: 'Arial', fontSize: '11px', color: '#c00', background: '#fff1f1', border: '1px solid #fcc' }}>
      Erro ao carregar "{nome}": {error}
    </div>
  );

  return (
    <div style={{ position: 'relative' }}>
      {loading && (
        <div style={{ width: 794, margin: '0 auto', padding: '24px', fontFamily: 'Arial', fontSize: '11px', color: '#666', textAlign: 'center', background: '#fff' }}>
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
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { background: #e8ecef; }
        @media print {
          html, body { background: #fff; }
          .no-print { display: none !important; }
          .page-break { page-break-before: always; break-before: page; }
        }
      `}</style>

      {/* Barra de controle */}
      <div className="no-print" style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: '#1a3a5c', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
      }}>
        <span style={{ fontFamily: 'Arial', fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.5px' }}>
          Visualização para Impressão
        </span>
        <button
          onClick={() => window.print()}
          style={{
            padding: '7px 22px', background: '#fff', color: '#1a3a5c',
            border: 'none', borderRadius: '5px', cursor: 'pointer',
            fontWeight: 'bold', fontSize: '13px'
          }}
        >
          🖨 Imprimir / Salvar PDF
        </button>
      </div>

      {/* Conteúdo */}
      <div style={{ paddingTop: 56, paddingBottom: 40 }}>

        {/* FAS */}
        <ScaledPage>
          <iframe
            srcDoc={fasHtml}
            style={{ width: 794, minHeight: 1123, border: 'none', display: 'block', background: '#fff' }}
            title="FAS"
            scrolling="no"
            onLoad={e => {
              try {
                const h = e.target.contentDocument?.body?.scrollHeight;
                if (h) e.target.style.height = h + 'px';
              } catch (_) {}
            }}
          />
        </ScaledPage>

        {/* Anexos PDF */}
        {anexos.map((anexo, i) => (
          <ScaledPage key={i} extraClass="page-break" extraTop={32}>
            <PdfAnexo url={anexo.url} nome={anexo.nome} />
          </ScaledPage>
        ))}

      </div>
    </>
  );
}