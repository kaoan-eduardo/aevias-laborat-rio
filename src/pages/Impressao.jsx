import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { buildFASHtml } from '@/components/fas/FASDocumento';
import * as pdfjsLib from 'pdfjs-dist';

// Worker local do pdfjs-dist
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

const RENDERERS = {
  fas: {
    entity: 'FAS',
    buildHtml: buildFASHtml,
  },
};

function PdfAnexo({ url, nome }) {
  const containerRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function render() {
      try {
        const loadingTask = pdfjsLib.getDocument({ url, withCredentials: false });
        const pdf = await loadingTask.promise;

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          if (cancelled) break;
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 1.5 });

          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.style.width = '794px';
          canvas.style.height = 'auto';
          canvas.style.display = 'block';
          canvas.style.pageBreakBefore = 'always';
          canvas.style.breakBefore = 'page';

          const ctx = canvas.getContext('2d');
          await page.render({ canvasContext: ctx, viewport }).promise;

          if (!cancelled && containerRef.current) {
            containerRef.current.appendChild(canvas);
          }
        }
      } catch (e) {
        if (!cancelled) setError(e.message);
      }
    }
    render();
    return () => { cancelled = true; };
  }, [url]);

  if (error) {
    return (
      <div style={{ pageBreakBefore: 'always', padding: '20px', fontFamily: 'Arial', fontSize: '11px', color: '#c00' }}>
        Erro ao carregar anexo "{nome}": {error}
      </div>
    );
  }

  return <div ref={containerRef} />;
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

  if (unknown) {
    return <div style={{ fontFamily: 'Arial', padding: '40px' }}>Tipo de formulário desconhecido.</div>;
  }

  if (loading) {
    return (
      <div style={{ fontFamily: 'Arial', padding: '40px', textAlign: 'center' }}>
        Carregando documento...
      </div>
    );
  }

  return (
    <div style={{ background: '#f0f0f0', padding: '20px' }}>
      <style>{`
        @media print {
          body { background: #fff; }
          .print-controls { display: none !important; }
          canvas { page-break-before: always; break-before: page; }
        }
      `}</style>

      {/* Botão de impressão */}
      <div className="print-controls" style={{ marginBottom: '16px', textAlign: 'center' }}>
        <button
          onClick={() => window.print()}
          style={{ padding: '8px 24px', background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}
        >
          Imprimir / Salvar PDF
        </button>
      </div>

      {/* FAS como iframe (preserva o HTML original exato) */}
      <iframe
        srcDoc={fasHtml}
        style={{ width: '794px', minHeight: '1123px', border: 'none', display: 'block', margin: '0 auto', background: '#fff' }}
        title="FAS"
      />

      {/* Anexos PDF renderizados como canvas */}
      {anexos.map((anexo, i) => (
        <div key={i} style={{ marginTop: '0', pageBreakBefore: 'always', breakBefore: 'page' }}>
          <PdfAnexo url={anexo.url} nome={anexo.nome} />
        </div>
      ))}
    </div>
  );
}