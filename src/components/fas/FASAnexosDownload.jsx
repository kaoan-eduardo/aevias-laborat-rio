import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';

/**
 * Utilidade para gerenciar downloads de múltiplos anexos
 * Agrupa anexos em um ZIP ou download sequencial
 */
export async function baixarAnexosJuntos(anexos, nomeBase = 'anexos') {
  if (!anexos || anexos.length === 0) return;

  // Se apenas 1 anexo, baixa direto
  if (anexos.length === 1) {
    window.open(anexos[0].url, '_blank');
    return;
  }

  // Para múltiplos anexos, cria um container com todos os arquivos
  // Nota: Sem biblioteca JSZip nativa, usa download sequencial com delay
  for (const anexo of anexos) {
    const link = document.createElement('a');
    link.href = anexo.url;
    link.download = anexo.nome;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Pequeno delay entre downloads para evitar bloqueios
    await new Promise(resolve => setTimeout(resolve, 300));
  }
}

/**
 * Componente para exibir preview de anexos no documento
 */
export function AnexosPreview({ anexos = [] }) {
  if (!anexos.length) {
    return (
      <div style={{ 
        border: '1px solid #ccc', 
        padding: '6px', 
        minHeight: '30px',
        fontSize: '8px',
        color: '#888'
      }}>
        Nenhum anexo
      </div>
    );
  }

  return (
    <div style={{ 
      border: '1px solid #ccc', 
      padding: '6px',
      fontSize: '8px'
    }}>
      {anexos.map((anexo, idx) => (
        <div key={idx} style={{ marginBottom: idx < anexos.length - 1 ? '4px' : 0 }}>
          <span style={{ fontWeight: 'bold' }}>Anexo {idx + 1}:</span> {anexo.nome}
          {anexo.tamanho && (
            <span style={{ color: '#888', marginLeft: '4px' }}>
              ({(anexo.tamanho / 1024).toFixed(1)} KB)
            </span>
          )}
        </div>
      ))}
    </div>
  );
}