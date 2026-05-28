import { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Upload, Download, FileText, Loader2, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatSize } from '@/utils/equipamentoHelpers';

// field: chave no objeto Equipamento (ex: 'docs_verificacao_diaria')
export default function DocUploadSection({ title, field, docs = [], equipamentoId, canEdit, onUpdate }) {
  const [uploading, setUploading] = useState(false);
  const [nomeDoc, setNomeDoc] = useState('');
  const [erro, setErro] = useState('');
  const inputRef = useRef(null);

  const sortedDocs = [...docs].sort((a, b) => new Date(b.data_upload) - new Date(a.data_upload));

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!nomeDoc.trim()) {
      setErro('Informe um nome para o documento antes de fazer o upload.');
      e.target.value = '';
      return;
    }
    setErro('');
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const novosDoc = [...docs, {
        nome: nomeDoc.trim(),
        url: file_url,
        tamanho: file.size,
        data_upload: new Date().toISOString().split('T')[0],
      }];
      await base44.entities.Equipamento.update(equipamentoId, { [field]: novosDoc });
      onUpdate(field, novosDoc);
      setNomeDoc('');
    } catch (err) {
      setErro(`Erro ao anexar: ${err?.message || 'Tente novamente.'}`);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (idx) => {
    // Deletar pelo índice original (não sorted)
    const docToDelete = sortedDocs[idx];
    const novosDoc = docs.filter(d => d !== docToDelete);
    await base44.entities.Equipamento.update(equipamentoId, { [field]: novosDoc });
    onUpdate(field, novosDoc);
  };

  const handleDownload = async (doc) => {
    const response = await fetch(doc.url);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = doc.nome;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <span className="text-xs text-muted-foreground">{docs.length} documento{docs.length !== 1 ? 's' : ''}</span>
      </div>

      {canEdit && (
        <div className="space-y-1.5">
          <div className="flex gap-2">
            <Input
              value={nomeDoc}
              onChange={e => { setNomeDoc(e.target.value); setErro(''); }}
              placeholder="Nome do documento..."
              className="h-8 text-xs flex-1"
            />
            <input ref={inputRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx" onChange={handleUpload} />
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 h-8 text-xs flex-shrink-0"
              disabled={uploading}
              onClick={() => {
                if (!nomeDoc.trim()) {
                  setErro('Informe um nome para o documento antes de fazer o upload.');
                  return;
                }
                setErro('');
                inputRef.current?.click();
              }}
            >
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              {uploading ? 'Enviando...' : 'Anexar'}
            </Button>
          </div>
          {erro && (
            <div className="flex items-center gap-1.5 text-xs text-destructive">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              {erro}
            </div>
          )}
        </div>
      )}

      {sortedDocs.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-4 border border-dashed rounded-lg">
          Nenhum documento anexado.
        </p>
      ) : (
        <div className="space-y-1.5">
          {sortedDocs.map((doc, idx) => (
            <div key={idx} className="flex items-center gap-3 p-2.5 rounded-lg border border-border bg-muted/20 hover:bg-muted/40 transition-colors">
              <FileText className="w-4 h-4 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{doc.nome}</p>
                <p className="text-xs text-muted-foreground">
                  {doc.data_upload ? new Date(doc.data_upload).toLocaleDateString('pt-BR') : ''}
                  {doc.tamanho ? ` · ${formatSize(doc.tamanho)}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => handleDownload(doc)} title="Download">
                  <Download className="w-3.5 h-3.5" />
                </Button>
                {canEdit && (
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(idx)} title="Remover">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}