export const docHeader = (titulo, form, emissao, revisao, mesAno) => `
  <table style="width:100%;border-collapse:collapse;margin-bottom:6px">
    <tr>
      <td style="border:1.5px solid #555;padding:6px 10px;width:140px;text-align:center;vertical-align:middle">
        <div style="font-weight:900;font-size:10px;letter-spacing:2px">AFIRMAEVIAS</div>
        <div style="font-size:6px;letter-spacing:3px;color:#555">e n g e n h a r i a</div>
      </td>
      <td style="border:1.5px solid #555;padding:4px 8px;text-align:center;font-weight:bold;font-size:11px;vertical-align:middle">
        ${titulo}
      </td>
      <td style="border:1.5px solid #555;padding:4px 8px;width:160px;vertical-align:middle;text-align:center">
        <div style="font-size:7px;color:#555">Identificação do Documento Nº</div>
        <div style="font-weight:bold;font-size:9px">${form}</div>
        
        <table style="width:100%;border-collapse:collapse;margin-top:3px">
          <tr>
            <th style="border:1px solid #999;padding:1px 4px;font-size:7px">Emissão</th>
            <th style="border:1px solid #999;padding:1px 4px;font-size:7px">Revisão</th>
          </tr>
          <tr>
            <td style="border:1px solid #999;padding:1px 4px;font-size:7px;text-align:center">${emissao}</td>
            <td style="border:1px solid #999;padding:1px 4px;font-size:7px;text-align:center">${revisao}</td>
          </tr>
        </table>
        <div style="margin-top:3px;font-size:7px">Mês/Ano: <strong>${mesAno ? fmt_mes_ano(mesAno) : '___________'}</strong></div>
      </td>
    </tr>
  </table>`;