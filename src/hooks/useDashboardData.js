import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Hook que carrega todos os dados necessários para o Dashboard.
 * Isola completamente a lógica de busca da camada de UI.
 */
export function useDashboardData() {
  const [stats, setStats] = useState({
    totalClientes: 0,
    totalEnsaios: 0,
    totalFas: 0,
    totalAmostras: 0,
    fasRecentes: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchAll() {
      const [clientes, ensaios, fas, amostras] = await Promise.all([
        base44.entities.Cliente.list(),
        base44.entities.Ensaio.list(),
        base44.entities.FAS.list('-created_date', 20),
        base44.entities.RecebimentoAmostra.list('-created_date', 20),
      ]);

      if (cancelled) return;

      setStats({
        totalClientes: clientes.length,
        totalEnsaios: ensaios.length,
        totalFas: fas.length,
        totalAmostras: amostras.length,
        fasRecentes: fas.slice(0, 5),
      });
      setIsLoading(false);
    }

    fetchAll();
    return () => { cancelled = true; };
  }, []);

  return { stats, isLoading };
}