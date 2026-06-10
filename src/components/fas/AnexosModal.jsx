import { useEffect } from 'react';
import { Paperclip, Download, X, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AnexosModal({ fas, onClose }) {
  const anexos = fas.anexos || [];

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleDownload = async (anexo) => {
    const response = await fetch(anexo.url);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = anexo.nome;
    link.click();
    URL.revokeObjectURL(url);
  };

  // formatSize duplicada com FASAnexos — TODO: mover para utils se mais reutilizações surgirem
  const formatSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div className="flex items-center gap-2">
            <Paperclip className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm">
              Anexos — {fas.numero_proposta || fas.numero_fas}
            </span>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 max-h-[60vh] overflow-y-auto">
          {anexos.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">Nenhum anexo cadastrado nesta FAS.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {anexos.map((anexo, i) => (
                <li key={i} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/60 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{anexo.nome}</p>
                      {anexo.tamanho && (
                        <p className="text-xs text-muted-foreground">{formatSize(anexo.tamanho)}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-shrink-0 gap-1.5 text-xs"
                    onClick={() => handleDownload(anexo)}
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t flex justify-end">
          <Button variant="ghost" size="sm" onClick={onClose}>Fechar</Button>
        </div>
      </div>
    </div>
  );
}