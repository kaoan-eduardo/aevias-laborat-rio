import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Cargos com permissão de leitura de equipamentos
const CARGOS_PERMITIDOS = [
  'Analista da Qualidade',
  'Coordenadora Tecnica',
  'Coordenadora Técnica',
  'Coordenadora Comercial',
  'Estagiaria',
  'Estagiária',
  'Encarregado',
  'Auxiliar da Qualidade',
  'Laboratorista',
  'Auxiliar de Laboratorio',
  'Auxiliar de Laboratório',
  'Assistente de Laboratorio',
  'Assistente de Laboratório',
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Não autenticado.' }, { status: 401 });
    }

    const isAdmin = user.role === 'admin';
    const cargoPermitido = CARGOS_PERMITIDOS.some(c => c.toLowerCase() === (user.cargo || '').toLowerCase());

    if (!isAdmin && !cargoPermitido) {
      return Response.json({ error: 'Acesso negado.' }, { status: 403 });
    }

    const equipamentos = await base44.asServiceRole.entities.Equipamento.list('-created_date');
    return Response.json({ equipamentos });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});