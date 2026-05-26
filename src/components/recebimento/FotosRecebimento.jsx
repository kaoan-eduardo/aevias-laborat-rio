import { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Camera, Upload, Trash2, Loader2, ZoomIn, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Para uso no modal de novo recebimento (sem ID ainda):
//   <FotosRecebimento fotos={fotos} onChange={setFotos} />
//
// Para uso na página de detalhes (com ID):
//   <FotosRecebimento fotos={recebimento.fotos} recebimentoId={recebimento.id} onChange={updatedFotos => setRecebimento(r => ({...r, fotos: updatedFotos}))} />

export default function FotosRecebimento({ fotos = [], recebimentoId, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const inputRef = useRef(null);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
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
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100">
                <button
                  type="button"
                  className="p-1.5 bg-white/90 rounded-full hover:bg-white transition-colors"
                  onClick={() => setLightbox(foto.url)}
                  title="Ampliar"
                >
                  <ZoomIn className="w-3.5 h-3.5 text-foreground" />
                </button>
                <button
                  type="button"
                  className="p-1.5 bg-white/90 rounded-full hover:bg-red-50 transition-colors"
                  onClick={() => handleDelete(idx)}
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

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            onClick={() => setLightbox(null)}
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={lightbox}
            alt="Foto ampliada"
            className="max-w-full max-h-full rounded-lg shadow-2xl"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}