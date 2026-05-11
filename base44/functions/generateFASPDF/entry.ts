import { jsPDF } from 'npm:jspdf@4.2.1';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const fas = body.fas;

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 8;

    let yPos = margin;

    // Header
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('AFIRMAEVIAS', margin, yPos);
    
    doc.setFontSize(7);
    doc.setFont(undefined, 'normal');
    doc.text('engenharia nivel', margin, yPos + 5);
    doc.text('FORM 045 A- REV 00 - 07/07/2025', margin, yPos + 9);

    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('FORMULÁRIO DE APROVAÇÃO DE SERVIÇO', pageWidth / 2, yPos + 3, { align: 'center' });

    // Proposta box
    doc.setFontSize(7);
    doc.setFont(undefined, 'bold');
    doc.rect(155, yPos, 45, 12);
    doc.text('Proposta Comercial / Rev.', 157, yPos + 2);
    doc.setFontSize(9);
    doc.text(`PC nº ${fas.numero_proposta || '—'}`, 157, yPos + 8);

    yPos += 18;

    // Contratante info
    doc.setFontSize(8);
    doc.setFont(undefined, 'bold');
    const fields = [
      ['Contratante', fas.razao_social || ''],
      ['CNPJ', fas.cnpj || ''],
      ['Responsável', fas.responsavel || ''],
      ['E-mail para envio:', fas.email_envio || ''],
    ];

    fields.forEach(([label, value]) => {
      doc.text(label + ':', margin, yPos);
      doc.setFont(undefined, 'normal');
      doc.text(value, margin + 45, yPos);
      doc.setFont(undefined, 'bold');
      yPos += 4;
    });

    doc.text('ART:', margin, yPos);
    doc.setFont(undefined, 'normal');
    doc.text(fas.exige_art ? 'Sim' : 'Não', margin + 45, yPos);

    yPos += 7;

    // Ensaios Header
    doc.setFontSize(8);
    doc.setFont(undefined, 'bold');
    doc.text('ENSAIOS', margin, yPos);

    yPos += 5;

    // Table header
    const col1 = margin, col2 = 20, col3 = 55, col4 = 85, col5 = 100, col6 = 125, col7 = 150, col8 = 175;
    const headers = ['Objetivo', 'Serviço', 'Norma', 'Qtd', 'Unidade', 'Prazo', 'Conf.', 'Símb.'];
    const colX = [col1, col2, col3, col4, col5, col6, col7, col8];

    doc.setFontSize(6);
    doc.setFont(undefined, 'bold');
    headers.forEach((h, i) => {
      doc.text(h, colX[i], yPos);
    });

    yPos += 3;
    doc.setDrawColor(0);
    doc.line(margin, yPos, 200, yPos);

    yPos += 2;

    // Table rows
    const itens = fas.itens || [];
    const LINHAS_ENSAIO = 25;
    const linhasVazias = Math.max(0, LINHAS_ENSAIO - itens.length);

    doc.setFont(undefined, 'normal');
    doc.setFontSize(6);

    for (let i = 0; i < itens.length; i++) {
      const item = itens[i];
      doc.text(item.ensaio_nome ? 'ENSAIOS' : '', col1, yPos);
      doc.text(item.ensaio_nome || '', col2, yPos);
      doc.text(item.norma || '', col3, yPos);
      doc.text(String(item.quantidade || '').padStart(2, '0'), col4, yPos);
      doc.text(item.unidade || '', col5, yPos);
      doc.text(item.prazo_dias ? `${item.prazo_dias}d` : '', col6, yPos);
      doc.text(fas.declaracao_confidencialidade ? 'Sim' : 'Não', col7, yPos);
      doc.text(fas.exige_simbolo ? 'Sim' : 'Não', col8, yPos);
      yPos += 3;
    }

    // Empty rows
    for (let i = 0; i < linhasVazias; i++) {
      yPos += 3;
    }

    yPos += 3;

    // Observações
    doc.setFontSize(8);
    doc.setFont(undefined, 'bold');
    if (yPos > 230) {
      doc.addPage();
      yPos = margin;
    }
    doc.text('OBSERVAÇÕES DA PROPOSTA', margin, yPos);
    yPos += 4;
    
    doc.setFontSize(7);
    doc.setFont(undefined, 'normal');
    const obsText = doc.splitTextToSize(fas.observacoes || '', pageWidth - margin * 2);
    doc.text(obsText, margin, yPos);

    yPos += 15;

    // Andamento
    doc.setFontSize(8);
    doc.setFont(undefined, 'bold');
    if (yPos > 230) {
      doc.addPage();
      yPos = margin;
    }
    doc.text('ANDAMENTO DAS ATIVIDADES', margin, yPos);

    yPos += 4;
    doc.setFontSize(6);
    doc.setFont(undefined, 'normal');
    const andamento = fas.andamento || [];
    andamento.forEach(a => {
      const date = a.data ? new Date(a.data).toLocaleDateString('pt-BR') : '';
      doc.text(date, margin, yPos);
      doc.text(a.atividade || '', margin + 30, yPos);
      yPos += 3;
    });

    // Footer
    doc.setFontSize(6);
    doc.setFont(undefined, 'normal');
    doc.text('FORM 045 - REV 06 - 09/06/2025', margin, pageHeight - 5);
    doc.text('Página 1 de 1', pageWidth - margin - 20, pageHeight - 5);

    const pdfData = doc.output('arraybuffer');

    return new Response(pdfData, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="FAS-${fas.numero_fas || 'documento'}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});