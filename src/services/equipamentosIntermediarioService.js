import { base44 } from '@/api/base44Client';

export async function listarEquipamentosParaVerificacaoIntermediaria(tipo) {
  const todos = await base44.entities.Equipamento.filter({
    obrigatorio_verificacao_intermediaria: true,
    status: 'em_uso',
  });

  if (tipo === 'balanca') {
    return todos.filter(e =>
      e.categoria?.toLowerCase().includes('balan') ||
      e.nome?.toLowerCase().includes('balan')
    );
  }
  if (tipo === 'temperatura') {
    return todos.filter(e =>
      e.categoria?.toLowerCase().includes('temp') ||
      e.nome?.toLowerCase().includes('temp') ||
      e.nome?.toLowerCase().includes('estufa') ||
      e.nome?.toLowerCase().includes('banho')
    );
  }
  if (tipo === 'paquimetro') {
    return todos.filter(e =>
      e.categoria?.toLowerCase().includes('paqu') ||
      e.nome?.toLowerCase().includes('paqu')
    );
  }
  return todos;
}

export async function listarPesosPadraoIntermediario() {
  const todos = await base44.entities.Equipamento.filter({ status: 'em_uso' });
  return todos.filter(e =>
    e.categoria?.toLowerCase().includes('peso') ||
    e.nome?.toLowerCase().includes('peso padrão') ||
    e.nome?.toLowerCase().includes('peso padrao')
  );
}

export async function listarTermometrosIntermediario() {
  const todos = await base44.entities.Equipamento.filter({ status: 'em_uso' });
  return todos.filter(e =>
    e.categoria?.toLowerCase().includes('term') ||
    e.nome?.toLowerCase().includes('termômetro') ||
    e.nome?.toLowerCase().includes('termometro')
  );
}