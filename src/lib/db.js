import Dexie from 'dexie';

export const db = new Dexie('labAmostrasDB');

db.version(1).stores({
  // idLocal: UUID gerado no front-end, statusSync: 'pending' | 'synced' | 'error'
  amostras: '++_localId, idLocal, statusSync, numero_protocolo, cliente_id',
  // Outbox Pattern: fila de operações a sincronizar
  syncQueue: '++id, action, timestamp',
});

db.version(2).stores({
  amostras: '++_localId, idLocal, statusSync, numero_protocolo, cliente_id',
  syncQueue: '++id, action, timestamp',
  // Cache offline para selects
  clientes_cache: 'id, ativo',
  materiais_cache: 'id',
});