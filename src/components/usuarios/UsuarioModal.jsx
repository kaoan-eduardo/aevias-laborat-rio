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
{ value: 'auxiliar', label: 'Auxiliar' }];


export default function UsuarioModal({ open, onClose, usuario, onSaved, currentUserRole }) {
  const [form, setForm] = useState({ cargo: '', role: 'auxiliar', ativo: true, nome_exibicao: '' });
  const [saving, setSaving] = useState(false);

  const canEditNomeExibicao = currentUserRole === 'admin' || currentUserRole === 'gestor';

  useEffect(() => {
    if (usuario) {
      setForm({
        cargo: usuario.cargo || '',
        role: usuario.role || 'auxiliar',
        ativo: usuario.ativo !== false,
        nome_exibicao: usuario.nome_exibicao || ''
      });
    }
  }, [usuario]);

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSave = async () => {
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

        <div className="space-y-4 py-1">
          <div className="space-y-1.5 hidden">
            <Label>Nome</Label>
            <Input value={usuario?.full_name?.replace(/./g, '•') || ''} readOnly className="bg-muted text-muted-foreground font-mono tracking-widest" />
          </div>

          <div className="space-y-1.5">
            <Label>Nome de Exibição</Label>
            <Input
              value={form.nome_exibicao}
              onChange={(e) => set('nome_exibicao', e.target.value)}
              placeholder="Como o usuário aparece no sistema..."
              disabled={!canEditNomeExibicao}
              className={!canEditNomeExibicao ? 'bg-muted text-muted-foreground' : ''} />
            
            {!canEditNomeExibicao &&
            <p className="text-xs text-muted-foreground">Apenas admins e gestores podem editar</p>
            }
          </div>

          <div className="space-y-1.5">
            <Label>E-mail</Label>
            <Input value={usuario?.email || ''} readOnly className="bg-muted text-muted-foreground" />
          </div>

          <div className="space-y-1.5">
            <Label>Cargo</Label>
            <Input
              value={form.cargo}
              onChange={(e) => set('cargo', e.target.value)}
              placeholder="Ex: Engenheiro de Materiais, Técnico de Laboratório..." />
            
          </div>

          <div className="space-y-1.5">
            <Label>Nível de Acesso</Label>
            <Select value={form.role} onValueChange={(v) => set('role', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) =>
                <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between py-2 border-t border-border">
            <div>
              <p className="text-sm font-medium text-foreground">Usuário Ativo</p>
              <p className="text-xs text-muted-foreground">Usuários inativos não conseguem acessar o sistema</p>
            </div>
            <Switch checked={form.ativo} onCheckedChange={(v) => set('ativo', v)} />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>);

}