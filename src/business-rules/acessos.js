/**
 * Regras de acesso por cargo.
 * Centraliza o controle de visibilidade de páginas e permissões de edição.
 *
 * Cargos:
 * - Coordenadora Técnica
 * - Encarregado
 * - Auxiliar da Qualidade
 * - Analista da Qualidade
 * - Laboratorista
 * - Auxiliar de Laboratório
 * - Assistente de Laboratório
 * - Estagiária
 * - Coordenadora Comercial
 */

// Páginas visíveis por cargo (além de admin que vê tudo)
export const PAGINAS_VISIVEIS = {
  'Coordenadora Técnica':    ['/', '/fas', '/recebimento', '/equipamentos', '/verificacoes', '/clientes', '/ensaios', '/materiais'],
  'Encarregado':             ['/', '/fas', '/recebimento', '/equipamentos', '/verificacoes', '/clientes', '/ensaios', '/materiais'],
  'Auxiliar da Qualidade':   ['/', '/fas', '/recebimento', '/equipamentos', '/verificacoes', '/clientes', '/ensaios', '/materiais'],
  'Analista da Qualidade':   ['/auditoria', '/verificacoes', '/equipamentos'],
  'Laboratorista':           ['/equipamentos', '/verificacoes'],
  'Auxiliar de Laboratório': ['/equipamentos', '/verificacoes'],
  'Assistente de Laboratório': ['/equipamentos', '/verificacoes'],
  'Estagiária':              ['/fas'],
  'Coordenadora Comercial':  ['/fas'],
};

// Cargos que podem EDITAR cada recurso
export const PODE_EDITAR = {
  fas:           ['Coordenadora Técnica', 'Encarregado', 'Auxiliar da Qualidade', 'Estagiária', 'Coordenadora Comercial'],
  recebimento:   ['Coordenadora Técnica', 'Encarregado', 'Auxiliar da Qualidade'],
  equipamentos:  ['Coordenadora Técnica', 'Encarregado', 'Auxiliar da Qualidade'],
  verificacoes:  ['Coordenadora Técnica', 'Encarregado', 'Auxiliar da Qualidade', 'Laboratorista', 'Auxiliar de Laboratório', 'Assistente de Laboratório'],
  cadastros:     ['Coordenadora Técnica', 'Encarregado', 'Auxiliar da Qualidade'],
};

/**
 * Retorna se o usuário pode ver uma determinada página.
 * Admin sempre pode ver tudo.
 */
export function podeVerPagina(user, path) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  const cargo = user.cargo;
  if (!cargo) return false;
  const paginas = PAGINAS_VISIVEIS[cargo] || [];
  return paginas.some((p) => path === p || path.startsWith(p + '/'));
}

/**
 * Retorna se o usuário pode editar um determinado recurso.
 * Admin sempre pode editar tudo.
 */
export function podeEditar(user, recurso) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  const cargo = user.cargo;
  if (!cargo) return false;
  return (PODE_EDITAR[recurso] || []).includes(cargo);
}

/**
 * Retorna a página inicial adequada para o cargo do usuário.
 */
export function paginaInicial(user) {
  if (!user) return '/';
  if (user.role === 'admin') return '/';
  const cargo = user.cargo;
  const paginas = PAGINAS_VISIVEIS[cargo] || [];
  if (paginas.includes('/')) return '/';
  return paginas[0] || '/';
}