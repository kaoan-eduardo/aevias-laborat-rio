import { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Paperclip, Upload, Trash2, FileText, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// fasId é opcional: se não fornecido, opera em modo local (sem salvar no banco)
export default function FASAnexos({ fasId, anexos = [], isComercial, onChange }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);

    const novosAnexos = [...anexos];
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      novosAnexos.push({
        nome: file.name,
        url: file_url,
        tamanho: file.size,
        data_upload: new Date().toISOString().split('T')[0],
      });
    }

    if (fasId) {
      await base44.entities.FAS.update(fasId, { anexos: novosAnexos });
    }
    onChange(novosAnexos);
    setUploading(false);
    e.target.value = '';
  };

  const handleDelete = async (idx) => {
    const novosAnexos = anexos.filter((_, i) => i !== idx);
    if (fasId) {
      await base44.entities.FAS.update(fasId, { anexos: novosAnexos });
    }
    onChange(novosAnexos);
  };

  const formatSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <Paperclip className="w-4 h-4" />
          Anexos ({anexos.length})
        </CardTitle>
        {isComercial && (
          <>
            <input
              ref={inputRef}
              type="file"
              accept=".pdf"
              multiple
              className="hidden"
              onChange={handleUpload}
            />
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
            >
              {uploading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )}
              {uploading ? 'Enviando...' : 'Anexar PDF'}
            </Button>
          </>
        )}
      </CardHeader>
      <CardContent>
        {anexos.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum anexo adicionado.
          </p>
        ) : (
          <div className="space-y-2">
            {anexos.map((anexo, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/20 hover:bg-muted/40 transition-colors">
                <FileText className="w-4 h-4 text-red-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{anexo.nome}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatSize(anexo.tamanho)}
                    {anexo.data_upload && ` · ${new Date(anexo.data_upload).toLocaleDateString('pt-BR')}`}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <a href={anexo.url} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                  </a>
                  {isComercial && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(idx)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}