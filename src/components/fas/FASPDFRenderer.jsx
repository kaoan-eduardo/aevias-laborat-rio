import { useState, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function FASPDFRenderer({ pdfUrl, pageWidth = 794 }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const renderPDF = async () => {
      try {
        const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
        const renderedImages = [];

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 2 });
          
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          
          const context = canvas.getContext('2d');
          await page.render({ canvasContext: context, viewport }).promise;
          
          renderedImages.push(canvas.toDataURL('image/png'));
        }

        setImages(renderedImages);
      } catch (error) {
        console.error('Erro ao renderizar PDF:', error);
      } finally {
        setLoading(false);
      }
    };

    renderPDF();
  }, [pdfUrl]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>Carregando PDF...</div>;
  }

  return (
    <div>
      {images.map((img, idx) => (
        <img
          key={idx}
          src={img}
          style={{
            width: '100%',
            maxWidth: `${pageWidth}px`,
            display: 'block',
            margin: '0 auto',
            marginBottom: '20px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
          alt={`Página ${idx + 1}`}
        />
      ))}
    </div>
  );
}