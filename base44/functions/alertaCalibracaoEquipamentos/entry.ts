import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Busca configuração de email para alertas de calibração
    const configs = await base44.asServiceRole.entities.ConfiguracaoEmail.filter({ tipo: 'alerta_calibracao', ativo: true });

    if (!configs || configs.length === 0) {
      return Response.json({ message: 'Nenhuma configuração de alerta de calibração ativa encontrada.' });
    }

    const config = configs[0];
    const destinatarios = config.emails_destinatarios || ['aryenne.muniz@afirmaevias.com.br','alexandre.debortoli@afirmaevias.com.br','juan.carneiro@afirmaevias.com.br'];
    const diasAntecedencia = config.dias_antecedencia || 60;

    if (destinatarios.length === 0) {
      return Response.json({ message: 'Nenhum destinatário configurado.' });
    }

    // Data alvo: hoje + diasAntecedencia
    const hoje = new Date();
    const dataAlvo = new Date();
    dataAlvo.setDate(dataAlvo.getDate() + diasAntecedencia);

    // Formata para comparação YYYY-MM-DD
    const dataAlvoStr = dataAlvo.toISOString().split('T')[0];
    const hojeStr = hoje.toISOString().split('T')[0];

    // Busca todos os equipamentos com status em_uso ou em_calibracao
    const equipamentos = await base44.asServiceRole.entities.Equipamento.list();

    // Filtra equipamentos cuja validade_calibracao cai dentro da janela [hoje, hoje+60 dias]
    const equipamentosAlerta = equipamentos.filter(eq => {
      if (!eq.validade_calibracao) return false;
      if (eq.status === 'fora_de_uso') return false;
      const validade = eq.validade_calibracao.split('T')[0];
      return validade >= hojeStr && validade <= dataAlvoStr;
    });

    if (equipamentosAlerta.length === 0) {
      return Response.json({ message: 'Nenhum equipamento com calibração próxima encontrada.', enviados: 0 });
    }

    // Formata tabela de equipamentos para o email
    const linhasTabela = equipamentosAlerta.map(eq => {
      const validade = new Date(eq.validade_calibracao + 'T00:00:00');
      const diffDias = Math.round((validade - hoje) / (1000 * 60 * 60 * 24));
      const validadeFormatada = validade.toLocaleDateString('pt-BR');
      const urgencia = diffDias <= 30 ? '🔴' : diffDias <= 45 ? '🟡' : '🟢';
      return `<tr>
        <td style="padding:6px 10px;border:1px solid #ddd;font-weight:600;color:#00233B">${eq.identificacao_interna || '—'}</td>
        <td style="padding:6px 10px;border:1px solid #ddd">${eq.nome || '—'}</td>
        <td style="padding:6px 10px;border:1px solid #ddd">${eq.categoria || '—'}</td>
        <td style="padding:6px 10px;border:1px solid #ddd;text-align:center">${validadeFormatada}</td>
        <td style="padding:6px 10px;border:1px solid #ddd;text-align:center;font-weight:bold">${urgencia} ${diffDias} dias</td>
        <td style="padding:6px 10px;border:1px solid #ddd">${eq.localizacao || '—'}</td>
      </tr>`;
    }).join('');

    const htmlBody = `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;background:#f5f5f5;margin:0;padding:20px">
  <div style="max-width:700px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1)">
    
    <div style="background:#00233B;padding:24px 30px">
      <h1 style="color:#BFCF99;margin:0;font-size:20px;font-weight:800;letter-spacing:1px">⚠️ Alerta de Calibração</h1>
      <p style="color:#fff;margin:6px 0 0;font-size:13px;opacity:0.8">Afirma E-vias — Controle de Equipamentos de Laboratório</p>
    </div>

    <div style="padding:24px 30px">
      <p style="color:#333;font-size:14px;margin-top:0">
        Os equipamentos listados abaixo possuem calibração vencendo nos próximos <strong>${diasAntecedencia} dias</strong>.
        Providencie o agendamento da calibração para manter a rastreabilidade e conformidade.
      </p>

      <table style="width:100%;border-collapse:collapse;font-size:13px;margin:16px 0">
        <thead>
          <tr style="background:#566E3D;color:#fff">
            <th style="padding:8px 10px;text-align:left;border:1px solid #4a5e35">ID</th>
            <th style="padding:8px 10px;text-align:left;border:1px solid #4a5e35">Equipamento</th>
            <th style="padding:8px 10px;text-align:left;border:1px solid #4a5e35">Categoria</th>
            <th style="padding:8px 10px;text-align:center;border:1px solid #4a5e35">Validade</th>
            <th style="padding:8px 10px;text-align:center;border:1px solid #4a5e35">Dias restantes</th>
            <th style="padding:8px 10px;text-align:left;border:1px solid #4a5e35">Localização</th>
          </tr>
        </thead>
        <tbody>
          ${linhasTabela}
        </tbody>
      </table>

      <div style="background:#fff8e1;border-left:4px solid #f9a825;padding:12px 16px;border-radius:4px;font-size:12px;color:#555;margin-top:16px">
        <strong>Legenda:</strong> &nbsp;🔴 Menos de 30 dias &nbsp;|&nbsp; 🟡 Entre 30 e 45 dias &nbsp;|&nbsp; 🟢 Entre 45 e ${diasAntecedencia} dias
      </div>

      <p style="font-size:12px;color:#888;margin-top:24px;border-top:1px solid #eee;padding-top:16px">
        Este é um email automático gerado pelo sistema AE Laboratório em ${new Date().toLocaleDateString('pt-BR')}.<br>
        Para ajustar os destinatários ou desativar este alerta, acesse as configurações de equipamentos.
      </p>
    </div>
  </div>
</body>
</html>`;

    // Envia email para cada destinatário
    let enviados = 0;
    for (const email of destinatarios) {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: email,
        subject: `⚠️ Alerta: ${equipamentosAlerta.length} equipamento(s) com calibração vencendo em até ${diasAntecedencia} dias`,
        body: htmlBody,
        from_name: 'AE Laboratório — Controle de Equipamentos',
      });
      enviados++;
    }

    return Response.json({
      message: `Alertas enviados com sucesso.`,
      equipamentos_alerta: equipamentosAlerta.length,
      emails_enviados: enviados,
      destinatarios,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});