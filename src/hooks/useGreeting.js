import { useMemo } from 'react';

/**
 * Retorna a saudação correta de acordo com o horário local.
 */
export function useGreeting() {
  return useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia,';
    if (hour < 18) return 'Boa tarde,';
    return 'Boa noite,';
  }, []);
}