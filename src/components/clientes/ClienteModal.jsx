import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const formatCNPJ = (v) => {
  const n = v.replace(/\D/g, '').slice(0, 14);
  return n.replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
};

const generateCodigo = (total) => `CLI-${String(total + 1).padStart(4, '0')}`;

export default function ClienteModal({ open, onClose, cliente, onSaved, totalClientes }) {
  const isEdit = !!cliente;
  const [form, setForm] = useState({
    codigo: '', razao_social: '', cnpj: '', endereco: '',
    responsavel: '', email: '', telefone: '', ativo: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (isEdit) {
        setForm({
          codigo: cliente.codigo || '',
          razao_social: cliente.razao_social || '',
          cnpj: cliente.cnpj || '',
          endereco: cliente.endereco || '',
          responsavel: cliente.responsavel || '',
          email: cliente.email || '',
          telefone: cliente.telefone || '',
          ativo: cliente.ativo !== false,
        });
      } else {
        setForm({
          codigo: generateCodigo(totalClientes),
          razao_social: '', cnpj: '', endereco: '',
          responsavel: '', email: '', telefone: '', ativo: true,
        });
      }
    }
  }, [open, cliente, totalClientes]);

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleSave = async () => {
    if (!form.razao_social || !form.cnpj) return;
    setSaving(true);
    if (isEdit) {
      await base44.entities.Cliente.update(cliente.id, form);
    } else {
      await base44.entities.Cliente.create(form);
    }
    setSaving(false);
    onSaved();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Código</Label>
              <Input value={form.codigo} disabled className="font-mono-data bg-muted text-muted-foreground" />
            </div>
            <div className="space-y-1.5">
              <Label>CNPJ *</Label>
              <Input
                value={form.cnpj}
                onChange={e => set('cnpj', formatCNPJ(e.target.value))}
                placeholder="00.000.000/0000-00"
                className="font-mono-data"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Razão Social *</Label>
            <Input value={form.razao_social} onChange={e => set('razao_social', e.target.value)} placeholder="Nome da empresa" />
          </div>
          <div className="space-y-1.5">
            <Label>Endereço</Label>
            <Input value={form.endereco} onChange={e => set('endereco', e.target.value)} placeholder="Endereço completo" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Responsável</Label>
              <Input value={form.responsavel} onChange={e => set('responsavel', e.target.value)} placeholder="Nome do responsável" />
            </div>
            <div className="space-y-1.5">
              <Label>Telefone</Label>
              <Input value={form.telefone} onChange={e => set('telefone', e.target.value)} placeholder="(00) 00000-0000" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>E-mail</Label>
            <Input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="contato@empresa.com" />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving || !form.razao_social || !form.cnpj}>
            {saving ? 'Salvando...' : isEdit ? 'Salvar Alterações' : 'Cadastrar Cliente'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}