import { useEffect, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { base44 } from '@/api/base44Client';
import { gerarNumeroProtocolo } from '@/utils/fasHelpers';

// ─── Sync Engine ────────────────────────────────────────────────────────────

export async function dispararSincronizacao() {
  const fila = await db.syncQueue.orderBy('timestamp').toArray();
  if (fila.length === 0) return;

  for (const item of fila) {
    try {
      if (item.action === 'CREATE_AMOSTRA') {
        const payload = { ...item.payload };

        // Faz upload das fotos que estavam pendentes (base64 → URL)
        if (payload.fotos?.length) {
          payload.fotos = await Promise.all(
            payload.fotos.map(async (foto) => {
              if (!foto.pendente_upload) return foto;
              try {
                // Converte dataURL base64 de volta para File/Blob
                const res = await fetch(foto.url);
                const blob = await res.blob();
                const file = new File([blob], foto.nome || 'foto.jpg', { type: blob.type });
                const { file_url } = await base44.integrations.Core.UploadFile({ file });
                return { url: file_url, nome: foto.nome, data_upload: foto.data_upload };
              } catch {
                // Se falhar o upload da foto individual, mantém a foto sem a flag
                return { url: foto.url, nome: foto.nome, data_upload: foto.data_upload };
              }
            })
          );
        }

        const criado = await base44.entities.RecebimentoAmostra.create(payload);

        // Atualiza o registro local: statusSync → 'synced', salva id definitivo do backend
        await db.amostras
          .where('idLocal')
          .equals(item.payload.idLocal)
          .modify({ statusSync: 'synced', idBackend: criado.id });

        // Remove da fila
        await db.syncQueue.delete(item.id);
      }
    } catch {
      // Marca como erro mas não bloqueia os próximos
      await db.amostras
        .where('idLocal')
        .equals(item.payload.idLocal)
        .modify({ statusSync: 'error' });
    }
  }
}

// Registra listener global de reconexão (chamado uma vez no boot do app)
let listenerRegistrado = false;
export function registrarListenerOnline() {
  if (listenerRegistrado) return;
  listenerRegistrado = true;
  window.addEventListener('online', () => {
    dispararSincronizacao();
  });
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAmostrasOffline() {
  // Reativo: atualiza em tempo real via IndexedDB
  const amostrasLocais = useLiveQuery(
    () => db.amostras.orderBy('_localId').reverse().toArray(),
    [],
    []
  );

  useEffect(() => {
    registrarListenerOnline();
  }, []);

  const criarAmostra = useCallback(async (dadosForm, totalRecebimentos) => {
    const idLocal = crypto.randomUUID();
    const payload = {
      ...dadosForm,
      idLocal,
      numero_protocolo: gerarNumeroProtocolo(totalRecebimentos),
      status: 'a_definir',
    };

    // 1. Salva imediatamente no IndexedDB com status pendente
    await db.amostras.add({ ...payload, statusSync: 'pending' });

    // 2. Adiciona na fila de sincronização (Outbox Pattern)
    await db.syncQueue.add({
      action: 'CREATE_AMOSTRA',
      payload,
      timestamp: Date.now(),
    });

    // 3. Se online, dispara sincronização em background imediatamente
    if (navigator.onLine) {
      dispararSincronizacao();
    }
  }, []);

  const pendentesCount = amostrasLocais?.filter(a => a.statusSync === 'pending' || a.statusSync === 'error').length ?? 0;

  return { amostrasLocais, criarAmostra, pendentesCount };
}