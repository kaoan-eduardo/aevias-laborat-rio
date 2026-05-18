import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

export default function EnsaioModal({ open, onClose, ensaio, onSaved }) {
  const isEdit = !!ensaio;
  const [form, setForm] = useState({
    nome: '', norma: '', categoria: 'asfalto',
    unidade_padrao: '', prazo_padrao_dias: '', descricao: '', ativo: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (isEdit) {
        setForm({
          nome: ensaio.nome || '',
          norma: ensaio.norma || '',
          categoria: ensaio.categoria || 'asfalto',
          unidade_padrao: ensaio.unidade_padrao || '',
          prazo_padrao_dias: ensaio.prazo_padrao_dias || '',
          descricao: ensaio.descricao || '',
          ativo: ensaio.ativo !== false,
        });
      } else {
        setForm({ nome: '', norma: '', categoria: 'asfalto', unidade_padrao: '', prazo_padrao_dias: '', descricao: '', ativo: true });
      }
    }
  }, [open, ensaio]);

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleSave = async () => {
    if (!form.nome || !form.norma) return;
    setSaving(true);
    const payload = { ...form, prazo_padrao_dias: form.prazo_padrao_dias ? Number(form.prazo_padrao_dias) : undefined };
    if (isEdit) {
      await base44.entities.Ensaio.update(ensaio.id, payload);
    } else {
      await base44.entities.Ensaio.create(payload);
    }
    setSaving(false);
    onSaved();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar Ensaio' : 'Novo Ensaio'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Nome do Ensaio *</Label>
            <Input value={form.nome} onChange={e => set('nome', e.target.value)} placeholder="Ex: Granulometria por Peneiramento" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Norma *</Label>
              <Input value={form.norma} onChange={e => set('norma', e.target.value)} placeholder="Ex: ABNT NBR 7181" className="font-mono-data" />
            </div>
            <div className="space-y-1.5">
              <Label>Categoria *</Label>
              <Select value={form.categoria} onValueChange={v => set('categoria', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asfalto">Asfalto</SelectItem>
                  <SelectItem value="agregado">Agregado</SelectItem>
                  <SelectItem value="solos">Solos</SelectItem>
                  <SelectItem value="concreto">Concreto</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                  <SelectItem value="projeto">Projeto</SelectItem>
                  <SelectItem value="mraf">MRAF</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Unidade Padrão</Label>
              <Input value={form.unidade_padrao} onChange={e => set('unidade_padrao', e.target.value)} placeholder="Ex: amostra, kg, m³" />
            </div>
            <div className="space-y-1.5">
              <Label>Prazo Padrão (dias úteis)</Label>
              <Input type="number" value={form.prazo_padrao_dias} onChange={e => set('prazo_padrao_dias', e.target.value)} placeholder="Ex: 7" className="font-mono-data" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Descrição</Label>
            <Textarea value={form.descricao} onChange={e => set('descricao', e.target.value)} placeholder="Descrição técnica do ensaio..." rows={2} />
          </div>
          {isEdit && (
            <div className="flex items-center gap-3">
              <Switch checked={form.ativo} onCheckedChange={v => set('ativo', v)} />
              <Label>Ensaio ativo no catálogo</Label>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving || !form.nome || !form.norma}>
            {saving ? 'Salvando...' : isEdit ? 'Salvar Alterações' : 'Cadastrar Ensaio'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}