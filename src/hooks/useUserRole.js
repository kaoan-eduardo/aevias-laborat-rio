import { useMemo } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { podeEditar } from '@/business-rules/acessos';

/**
 * Centraliza a lógica de permissão baseada no cargo/role do usuário.
 * Evita repetição de `user?.role || 'auxiliar'` espalhada pelos componentes.
 */
export function useUserRole() {
  const { user } = useAuth();

  return useMemo(() => ({
    user,
    role: user?.role || 'auxiliar',
    isAdmin: user?.role === 'admin',
    canEditEquipamentos: user?.role === 'admin' || podeEditar(user, 'equipamentos'),
    canEditFas: user?.role === 'admin' || podeEditar(user, 'fas'),
    canEditRecebimento: user?.role === 'admin' || podeEditar(user, 'recebimento'),
    canEditVerificacoes: user?.role === 'admin' || podeEditar(user, 'verificacoes'),
    canEditCadastros: user?.role === 'admin' || podeEditar(user, 'cadastros'),
    displayName: user?.nome_exibicao || user?.full_name?.split(' ')[0] || 'usuário',
  }), [user]);
}