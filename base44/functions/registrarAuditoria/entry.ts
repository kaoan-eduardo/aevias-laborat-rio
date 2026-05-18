import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Campos que identificam o registro de forma legível por entidade
const DESCRICAO_CAMPO = {
  FAS: 'numero_fas',
  Cliente: 'razao_social',
  Equipamento: 'nome',
  Ensaio: 'nome',
  Material: 'nome',
  RecebimentoAmostra: 'numero_protocolo',
  VerificacaoDiaria: 'equipamento_nome',
};

// Campos ignorados no diff (ruído ou dados técnicos internos)
const CAMPOS_IGNORADOS = ['updated_date', 'created_date'];

function extrairDiff(oldData, newData) {
  if (!oldData || !newData) return { campos: [], anteriores: {}, novos: {} };

  const campos = [];
  const anteriores = {};
  const novos = {};

  for (const key of Object.keys(newData)) {
    if (CAMPOS_IGNORADOS.includes(key)) continue;
    const valorAntigo = JSON.stringify(oldData[key]);
    const valorNovo = JSON.stringify(newData[key]);
    if (valorAntigo !== valorNovo) {
      campos.push(key);
      anteriores[key] = oldData[key];
      novos[key] = newData[key];
    }
  }

  return { campos, anteriores, novos };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    const { event, data, old_data } = payload;
    const { type: eventType, entity_name, entity_id } = event;

    // Mapeamento de tipo de evento para ação legível
    const acaoMap = { create: 'criado', update: 'atualizado', delete: 'deletado' };
    const acao = acaoMap[eventType];
    if (!acao) return Response.json({ ok: true, skipped: 'evento desconhecido' });

    // Busca dados do usuário que criou/alterou o registro
    let usuario_email = data?.created_by || old_data?.created_by || 'sistema';
    let usuario_nome = usuario_email;

    // Tenta obter o nome completo do usuário
    if (usuario_email && usuario_email !== 'sistema') {
      const usuarios = await base44.asServiceRole.entities.User.filter({ email: usuario_email });
      if (usuarios?.length > 0) {
        usuario_nome = usuarios[0].full_name || usuario_email;
      }
    }

    // Descrição legível do registro
    const campodesc = DESCRICAO_CAMPO[entity_name];
    const entidade_descricao = (data || old_data)?.[campodesc] || entity_id;

    // Para updates, calcula o diff
    let campos_alterados = [];
    let valores_anteriores = null;
    let valores_novos = null;

    if (eventType === 'update') {
      const diff = extrairDiff(old_data, data);
      campos_alterados = diff.campos;
      valores_anteriores = JSON.stringify(diff.anteriores);
      valores_novos = JSON.stringify(diff.novos);

      // Sem mudanças relevantes, não registra
      if (campos_alterados.length === 0) {
        return Response.json({ ok: true, skipped: 'sem alterações relevantes' });
      }
    }

    await base44.asServiceRole.entities.AuditoriaLog.create({
      entidade: entity_name,
      entidade_id: entity_id,
      entidade_descricao: String(entidade_descricao),
      acao,
      usuario_email,
      usuario_nome,
      campos_alterados,
      valores_anteriores,
      valores_novos,
      data_hora: new Date().toISOString(),
    });

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});