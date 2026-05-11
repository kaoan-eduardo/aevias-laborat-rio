import { PDFDocument } from 'pdf-lib';

/**
 * Combina PDF principal com anexos em um único documento
 */
export async function baixarPDFComAnexos(pdfBlob, anexos, nomeBase) {
  const { PDFDocument } = await import('pdf-lib');
  
  // Carrega o PDF principal
  const pdfPrincipalBuffer = await pdfBlob.arrayBuffer();
  const pdfDoc = await PDFDocument.load(pdfPrincipalBuffer);

  // Adiciona anexos ao documento
  if (anexos && anexos.length > 0) {
    for (const anexo of anexos) {
      try {
        const resposta = await fetch(anexo.url);
        const arrayBuffer = await resposta.arrayBuffer();
        const anexoPdf = await PDFDocument.load(arrayBuffer);
        const paginasAnexo = await pdfDoc.copyPages(anexoPdf, anexoPdf.getPageIndices());
        
        paginasAnexo.forEach(pagina => {
          pdfDoc.addPage(pagina);
        });
      } catch (erro) {
        console.warn(`Não foi possível incorporar anexo: ${anexo.nome}`, erro);
      }
    }
  }

  // Salva e faz download do PDF combinado
  const pdfCombinado = await pdfDoc.save();
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([pdfCombinado], { type: 'application/pdf' }));
  link.download = `${nomeBase}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}