/**
 * Download sequencial do PDF principal + anexos
 */
export async function baixarPDFComAnexos(pdfBlob, anexos, nomeBase) {
  // Primeiro, salva o PDF principal
  const linkPdf = document.createElement('a');
  linkPdf.href = URL.createObjectURL(pdfBlob);
  linkPdf.download = `${nomeBase}.pdf`;
  document.body.appendChild(linkPdf);
  linkPdf.click();
  document.body.removeChild(linkPdf);
  URL.revokeObjectURL(linkPdf.href);

  // Depois, baixa cada anexo em sequência
  if (anexos && anexos.length > 0) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    for (const anexo of anexos) {
      const link = document.createElement('a');
      link.href = anexo.url;
      link.download = anexo.nome;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }
}