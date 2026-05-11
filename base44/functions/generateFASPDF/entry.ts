import PDFDocument from 'npm:pdfkit@0.13.0';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const fas = body.fas;

    const doc = new PDFDocument({
      bufferPages: true,
      margin: 20,
      size: 'A4',
      autoFirstPage: false
    });

    doc.addPage();

    // Header
    doc.fontSize(14).font('Helvetica-Bold').text('AFIRMAEVIAS', 40, 30);
    doc.fontSize(8).font('Helvetica').text('engenharia nivel', 40, 45);
    doc.fontSize(7).text('FORM 045 A- REV 00 - 07/07/2025', 40, 54);

    doc.fontSize(13).font('Helvetica-Bold').text('FORMULÁRIO DE APROVAÇÃO DE SERVIÇO', 200, 40);

    // Proposta box
    doc.rect(450, 30, 120, 45).stroke();
    doc.fontSize(8).font('Helvetica-Bold').text('Proposta Comercial / Rev.', 455, 35);
    doc.fontSize(10).font('Helvetica-Bold').text(`PC nº ${fas.numero_proposta || '—'}`, 455, 50);

    // Linha
    doc.moveTo(40, 85).lineTo(550, 85).stroke();

    // Contratante info
    const infoY = 100;
    const fieldWidth = 80;
    const fieldLabelX = 45;
    const fieldValueX = 130;
    const rowHeight = 18;

    const fields = [
      ['Contratante', fas.razao_social || ''],
      ['CNPJ', fas.cnpj || ''],
      ['Responsável', fas.responsavel || ''],
      ['E-mail para envio:', fas.email_envio || ''],
    ];

    doc.fontSize(9);
    fields.forEach((field, idx) => {
      const y = infoY + idx * rowHeight;
      doc.font('Helvetica-Bold').text(field[0], fieldLabelX, y);
      doc.font('Helvetica').text(field[1], fieldValueX, y);
    });

    // ART
    doc.font('Helvetica-Bold').text('ART:', fieldLabelX, infoY + fields.length * rowHeight);
    doc.font('Helvetica').text(fas.exige_art ? 'Sim' : 'Não', fieldValueX, infoY + fields.length * rowHeight);

    // Ensaios header
    const ensaiosY = infoY + (fields.length + 1) * rowHeight + 10;
    doc.fontSize(9).font('Helvetica-Bold').text('ENSAIOS', 40, ensaiosY);

    // Ensaios table
    const tableTop = ensaiosY + 20;
    const col1 = 45, col2 = 90, col3 = 180, col4 = 250, col5 = 300, col6 = 350, col7 = 400, col8 = 450;
    const headers = ['Objetivo', 'Serviço', 'Norma', 'Qtd', 'Unidade', 'Prazo', 'Conf.', 'Símb.'];
    const colWidths = [45, 90, 90, 50, 50, 50, 50, 40];

    doc.fontSize(8).font('Helvetica-Bold');
    let xPos = col1;
    headers.forEach((header, i) => {
      doc.text(header, xPos, tableTop, { width: colWidths[i], align: 'center' });
      xPos += colWidths[i];
    });

    // Table rows
    const itens = fas.itens || [];
    const LINHAS_ENSAIO = 25;
    const linhasVazias = Math.max(0, LINHAS_ENSAIO - itens.length);
    const totalLinhas = itens.length + linhasVazias;

    doc.fontSize(7).font('Helvetica');
    let rowY = tableTop + 15;
    const rowHeight2 = 12;

    for (let i = 0; i < totalLinhas; i++) {
      const item = itens[i];
      xPos = col1;

      const cellHeight = rowHeight2;
      if (item) {
        doc.text(item.ensaio_nome ? 'ENSAIOS' : '', xPos, rowY, { width: colWidths[0], align: 'center' });
        xPos += colWidths[0];
        doc.text(item.ensaio_nome || '', xPos, rowY, { width: colWidths[1] });
        xPos += colWidths[1];
        doc.text(item.norma || '', xPos, rowY, { width: colWidths[2] });
        xPos += colWidths[2];
        doc.text(String(item.quantidade || '').padStart(2, '0'), xPos, rowY, { width: colWidths[3], align: 'center' });
        xPos += colWidths[3];
        doc.text(item.unidade || '', xPos, rowY, { width: colWidths[4], align: 'center' });
        xPos += colWidths[4];
        doc.text(item.prazo_dias ? `${item.prazo_dias}d` : '', xPos, rowY, { width: colWidths[5], align: 'center' });
        xPos += colWidths[5];
        doc.text(fas.declaracao_confidencialidade ? 'Sim' : 'Não', xPos, rowY, { width: colWidths[6], align: 'center' });
        xPos += colWidths[6];
        doc.text(fas.exige_simbolo ? 'Sim' : 'Não', xPos, rowY, { width: colWidths[7], align: 'center' });
      }

      rowY += cellHeight;
    }

    // Observações
    const obsY = rowY + 15;
    doc.fontSize(9).font('Helvetica-Bold').text('OBSERVAÇÕES DA PROPOSTA', 40, obsY);
    doc.fontSize(7).font('Helvetica').text(fas.observacoes || '', 40, obsY + 18, { width: 510 });

    // Andamento
    const andamentoY = obsY + 80;
    doc.fontSize(9).font('Helvetica-Bold').text('ANDAMENTO DAS ATIVIDADES', 40, andamentoY);

    const andamento = fas.andamento || [];
    doc.fontSize(7).font('Helvetica');
    andamento.slice(0, 3).forEach((a, idx) => {
      const y = andamentoY + 20 + idx * 12;
      const date = a.data ? new Date(a.data).toLocaleDateString('pt-BR') : '';
      doc.text(date, 40, y, { width: 70 });
      doc.text(a.atividade || '', 115, y, { width: 400 });
    });

    // Rodapé
    const footerY = 750;
    doc.fontSize(7).font('Helvetica').text('FORM 045 - REV 06 - 09/06/2025', 40, footerY);
    doc.text('Página 1 de 1', 500, footerY);

    // Generate buffer
    const pdfBuffer = [];
    doc.on('data', (chunk) => pdfBuffer.push(chunk));

    return new Promise((resolve) => {
      doc.on('finish', () => {
        const buffer = Buffer.concat(pdfBuffer);
        resolve(new Response(buffer, {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="FAS-${fas.numero_fas || 'documento'}.pdf"`,
          },
        }));
      });
      doc.end();
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});