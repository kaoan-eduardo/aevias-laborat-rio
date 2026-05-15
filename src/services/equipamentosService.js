// Serviço de acesso a dados de Equipamentos
// Centraliza filtros e chamadas de API — sem lógica de UI

import { base44 } from '@/api/base44Client';

async function listarEmUso() {
  return base44.entities.Equipamento.filter({ status: 'em_uso' }, 'identificacao_interna');
}

export async function listarEquipamentosParaVerificacao(tipo) {
  const todos = await base44.entities.Equipamento.filter(
    { status: 'em_uso', obrigatorio_verificacao_diaria: true },
    'identificacao_interna'
  );

  const CATEGORIAS_POR_TIPO = {
    balanca: ['balança', 'balanca'],
    temperatura: ['temperatura', 'estufa', 'banho maria', 'banho-maria', 'forno'],
  };

  const categorias = CATEGORIAS_POR_TIPO[tipo] || [];
  return todos.filter(eq =>
    categorias.some(cat => eq.categoria?.toLowerCase() === cat.toLowerCase())
  );
}

export async function listarPesosPadrao() {
  const todos = await listarEmUso();
  return todos.filter(eq =>
    eq.categoria?.toLowerCase().includes('peso padrão') ||
    eq.categoria?.toLowerCase().includes('peso padrao') ||
    eq.nome?.toLowerCase().includes('peso padrão') ||
    eq.nome?.toLowerCase().includes('peso padrao') ||
    eq.categoria?.toLowerCase().includes('conjunto de peso')
  );
}

export async function listarTermometros() {
  const todos = await listarEmUso();
  return todos.filter(eq =>
    eq.categoria?.toLowerCase().includes('termômetro') ||
    eq.categoria?.toLowerCase().includes('termometro') ||
    eq.nome?.toLowerCase().includes('termômetro') ||
    eq.nome?.toLowerCase().includes('termometro')
  );
}

export async function listarVidrarias() {
  const todos = await listarEmUso();
  return todos.filter(eq => eq.categoria === 'Vidraria');
}