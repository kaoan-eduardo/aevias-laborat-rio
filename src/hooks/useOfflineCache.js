/**
 * useOfflineCache
 * Carrega e persiste no IndexedDB as listas usadas nos selects do módulo de recebimento.
 * Quando online: busca da API e atualiza o cache.
 * Quando offline: lê direto do cache local.
 */

import { db } from '@/lib/db';
import { base44 } from '@/api/base44Client';

/**
 * Carrega uma lista da API e salva no cache IndexedDB.
 * @param {string} tableName - nome da tabela Dexie (ex: 'clientes_cache')
 * @param {() => Promise<Array>} fetcher - função que busca os dados da API
 * @param {(items: Array) => Array} [filter] - filtro opcional antes de salvar
 */
async function loadAndCache(tableName, fetcher, filter) {
  if (navigator.onLine) {
    const items = await fetcher();
    const filtered = filter ? filter(items) : items;
    await db[tableName].clear();
    await db[tableName].bulkPut(filtered);
    return filtered;
  } else {
    return db[tableName].toArray();
  }
}

/** Clientes ativos */
export async function getClientes() {
  return loadAndCache(
    'clientes_cache',
    () => base44.entities.Cliente.list('razao_social'),
    (items) => items.filter(c => c.ativo !== false)
  );
}

/** Todos os materiais */
export async function getMateriais() {
  return loadAndCache(
    'materiais_cache',
    () => base44.entities.Material.list('nome')
  );
}

/** Todos os ensaios ativos */
export async function getEnsaios() {
  return loadAndCache(
    'ensaios_cache',
    () => base44.entities.Ensaio.list('nome'),
    (items) => items.filter(e => e.ativo !== false)
  );
}

/**
 * FAS disponíveis para um cliente.
 * FAS não é cacheada globalmente (depende do cliente), então:
 * - Online: busca da API normalmente
 * - Offline: retorna array vazio (FAS requer conectividade)
 */
export async function getFasDoCliente(clienteId, extraFilter) {
  if (!navigator.onLine) return [];
  const items = await base44.entities.FAS.filter({ cliente_id: clienteId });
  return extraFilter ? items.filter(extraFilter) : items;
}