import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const ROLES = [
  { value: 'admin', label: 'Administrador' },
  { value: 'gestor', label: 'Gestor/Coordenador' },
  { value: 'tecnico', label: 'Técnico/Laboratorista' },
  { value: 'auxiliar', label: 'Auxiliar' },
];

export default function UsuarioModal({ open, onClose, usuario, onSaved }) {
  const [form, setForm] = useState({ full_name: '', cargo: '', role: 'auxiliar', ativo: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (usuario) {
      setForm({
        full_name: usuario.full_name || '',
        cargo: usuario.cargo || '',
        role: usuario.role || 'auxiliar',
        ativo: usuario.ativo !== false,
      });
    }
  }, [usuario]);

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleSave = async () => {
    if (!form.full_name) return;
    setSaving(true);
    await base44.entities.User.update(usuario.id, form);
    setSaving(false);
    onSaved();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Usuário</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label>Nome Completo</Label>
            <Input
              value={form.full_name}
              onChange={e => set('full_name', e.target.value)}
              placeholder="Nome completo do usuário"
            />
          </div>

          <div className="space-y-1.5">
            <Label>E-mail</Label>
            <Input value={usuario?.email || ''} readOnly className="bg-muted text-muted-foreground" />
          </div>

          <div className="space-y-1.5">
            <Label>Cargo</Label>
            <Input
              value={form.cargo}
              onChange={e => set('cargo', e.target.value)}
              placeholder="Ex: Engenheiro de Materiais, Técnico de Laboratório..."
            />
          </div>

          <div className="space-y-1.5">
            <Label>Nível de Acesso</Label>
            <Select value={form.role} onValueChange={v => set('role', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map(r => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between py-2 border-t border-border">
            <div>
              <p className="text-sm font-medium text-foreground">Usuário Ativo</p>
              <p className="text-xs text-muted-foreground">Usuários inativos não conseguem acessar o sistema</p>
            </div>
            <Switch checked={form.ativo} onCheckedChange={v => set('ativo', v)} />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving || !form.full_name}>
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}