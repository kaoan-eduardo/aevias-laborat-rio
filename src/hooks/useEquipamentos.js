import { useState, useEffect, useCallback, useMemo } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Hook que gerencia a lista de equipamentos com busca e filtro por status.
 */
export function useEquipamentos() {
  const [equipamentos, setEquipamentos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');

  const fetchEquipamentos = useCallback(async () => {
    setIsLoading(true);
    const data = await base44.entities.Equipamento.list('-created_date');
    setEquipamentos(data || []);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchEquipamentos();
  }, [fetchEquipamentos]);

  const filteredEquipamentos = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return equipamentos.filter(eq => {
      const matchesSearch =
        eq.identificacao_interna?.toLowerCase().includes(query) ||
        eq.nome?.toLowerCase().includes(query) ||
        eq.categoria?.toLowerCase().includes(query);
      const matchesStatus = statusFilter === 'todos' || eq.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [equipamentos, searchQuery, statusFilter]);

  return {
    equipamentos,
    filteredEquipamentos,
    isLoading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    refetch: fetchEquipamentos,
  };
}