import { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Camera, Upload, Trash2, Loader2, ZoomIn, X, ChevronLeft, ChevronRight, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Para uso no modal de novo recebimento (sem ID ainda):
//   <FotosRecebimento fotos={fotos} onChange={setFotos} />
//
// Para uso na página de detalhes (com ID):
//   <FotosRecebimento fotos={recebimento.fotos} recebimentoId={recebimento.id} onChange={updatedFotos => setRecebimento(r => ({...r, fotos: updatedFotos}))} />

export default function FotosRecebimento({ fotos = [], recebimentoId, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const inputRef = useRef(null);

  const lightboxPrev = () => setLightboxIdx(i => (i > 0 ? i - 1 : fotos.length - 1));
  const lightboxNext = () => setLightboxIdx(i => (i < fotos.length - 1 ? i + 1 : 0));

  useEffect(() => {
    if (lightboxIdx === null) return;
    const handler = (e) => {
      if (e.key === 'ArrowLeft') lightboxPrev();
      else if (e.key === 'ArrowRight') lightboxNext();
      else if (e.key === 'Escape') setLightboxIdx(null);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightboxIdx, fotos.length]);

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      if (!navigator.onLine) {
        // Offline: converte para base64 e salva localmente
        const uploads = await Promise.all(
          files.map(async (file) => ({
            url: await toBase64(file),
            nome: file.name,
            data_upload: new Date().toISOString().split('T')[0],
            pendente_upload: true,
          }))
        );
        onChange([...fotos, ...uploads]);
      } else {
        // Online: envia direto para o servidor
        const uploads = await Promise.all(
          files.map(async (file) => {
            const { file_url } = await base44.integrations.Core.UploadFile({ file });
            return {
              url: file_url,
              nome: file.name,
              data_upload: new Date().toISOString().split('T')[0],
            };
          })
        );
        const novasFotos = [...fotos, ...uploads];
        if (recebimentoId) {
          await base44.entities.RecebimentoAmostra.update(recebimentoId, { fotos: novasFotos });
        }
        onChange(novasFotos);
      }
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (idx) => {
    const novasFotos = fotos.filter((_, i) => i !== idx);
    if (recebimentoId) {
      await base44.entities.RecebimentoAmostra.update(recebimentoId, { fotos: novasFotos });
    }
    onChange(novasFotos);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">
            Fotos do Material {fotos.length > 0 && <span className="text-muted-foreground font-normal">({fotos.length})</span>}
          </span>
        </div>
        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleUpload}
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="gap-1.5 h-8 text-xs"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            {uploading ? 'Enviando...' : 'Adicionar fotos'}
          </Button>
        </div>
      </div>

      {fotos.length === 0 ? (
        <div
          className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/40 hover:bg-muted/20 transition-colors"
          onClick={() => !uploading && inputRef.current?.click()}
        >
          <Camera className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">Clique para adicionar fotos do material recebido</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {fotos.map((foto, idx) => (
            <div key={idx} className="relative group rounded-lg overflow-hidden border border-border aspect-square bg-muted">
              <img
                src={foto.url}
                alt={foto.nome || `Foto ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              {foto.pendente_upload && (
                <div className="absolute top-1 left-1 bg-amber-500/90 rounded-full p-0.5" title="Aguardando conexão para enviar">
                  <WifiOff className="w-2.5 h-2.5 text-white" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100">
                <button
                 type="button"
                 className="p-1.5 bg-white/90 rounded-full hover:bg-white transition-colors"
                 onClick={() => setLightboxIdx(idx)}
                 title="Ampliar"
                >
                  <ZoomIn className="w-3.5 h-3.5 text-foreground" />
                </button>
                <button
                 type="button"
                 className="p-1.5 bg-white/90 rounded-full hover:bg-red-50 transition-colors"
                 onClick={() => setConfirmDelete(idx)}
                 title="Remover"
                >
                 <Trash2 className="w-3.5 h-3.5 text-destructive" />
                </button>
              </div>
            </div>
          ))}
          {/* Botão de adicionar mais */}
          <div
            className="aspect-square border-2 border-dashed border-border rounded-lg flex items-center justify-center cursor-pointer hover:border-primary/40 hover:bg-muted/20 transition-colors"
            onClick={() => !uploading && inputRef.current?.click()}
          >
            {uploading ? (
              <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
            ) : (
              <Upload className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
        </div>
      )}

      {/* Confirmação de exclusão */}
      {confirmDelete !== null && (
        <div className="fixed inset-0 z-[110] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl shadow-xl p-6 max-w-sm w-full space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-full">
                <Trash2 className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="font-semibold text-sm">Excluir foto?</p>
                <p className="text-xs text-muted-foreground">Esta ação não pode ser desfeita.</p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" size="sm" onClick={() => setConfirmDelete(null)}>
                Cancelar
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => { handleDelete(confirmDelete); setConfirmDelete(null); }}
              >
                Excluir
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <div
          className="fixed inset-0 z-[100] bg-black/85 flex items-center justify-center p-4"
          onClick={() => setLightboxIdx(null)}
        >
          {/* Fechar */}
          <button
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10"
            onClick={() => setLightboxIdx(null)}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Contador */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/70 text-sm z-10">
            {lightboxIdx + 1} / {fotos.length}
          </div>

          {/* Seta esquerda */}
          {fotos.length > 1 && (
            <button
              className="absolute left-3 p-2 bg-white/10 hover:bg-white/25 rounded-full text-white transition-colors z-10"
              onClick={e => { e.stopPropagation(); lightboxPrev(); }}
            >
              <ChevronLeft className="w-7 h-7" />
            </button>
          )}

          {/* Imagem */}
          <img
            src={fotos[lightboxIdx]?.url}
            alt={fotos[lightboxIdx]?.nome || `Foto ${lightboxIdx + 1}`}
            className="max-w-full max-h-full rounded-lg shadow-2xl object-contain"
            onClick={e => e.stopPropagation()}
          />

          {/* Seta direita */}
          {fotos.length > 1 && (
            <button
              className="absolute right-3 p-2 bg-white/10 hover:bg-white/25 rounded-full text-white transition-colors z-10"
              onClick={e => { e.stopPropagation(); lightboxNext(); }}
            >
              <ChevronRight className="w-7 h-7" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}