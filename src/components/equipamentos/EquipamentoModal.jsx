import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { STATUS_EQUIPAMENTO, PERIODICIDADE_LABELS } from '@/utils/equipamentoHelpers';

const EMPTY_FORM = {
  identificacao_interna: '',
  nome: '',
  categoria: '',
  precisao: '',
  data_calibracao: '',
  validade_calibracao: '',
  periodicidade_verificacao: '',
  status: 'em_uso',
};

export default function EquipamentoModal({ open, onClose, equipamento, onSaved }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(equipamento ? { ...EMPTY_FORM, ...equipamento } : EMPTY_FORM);
    }
  }, [open, equipamento]);

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleSave = async () => {
    if (!form.identificacao_interna || !form.nome || !form.categoria) return;
    setSaving(true);
    if (equipamento?.id) {
      await base44.entities.Equipamento.update(equipamento.id, form);
    } else {
      await base44.entities.Equipamento.create(form);
    }
    setSaving(false);
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{equipamento ? 'Editar Equipamento' : 'Novo Equipamento'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Identificação Interna *</Label>
              <Input value={form.identificacao_interna} onChange={e => set('identificacao_interna', e.target.value)} placeholder="Ex: EQ-001" className="font-mono-data" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Nome *</Label>
              <Input value={form.nome} onChange={e => set('nome', e.target.value)} placeholder="Nome do equipamento" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Categoria *</Label>
              <Input value={form.categoria} onChange={e => set('categoria', e.target.value)} placeholder="Ex: Medição, Pesagem..." />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Precisão</Label>
              <Input value={form.precisao} onChange={e => set('precisao', e.target.value)} placeholder="Ex: ±0,01 mm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Data de Calibração</Label>
              <Input type="date" value={form.data_calibracao} onChange={e => set('data_calibracao', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Validade da Calibração</Label>
              <Input type="date" value={form.validade_calibracao} onChange={e => set('validade_calibracao', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Periodicidade da Verificação Interna</Label>
              <Select value={form.periodicidade_verificacao} onValueChange={v => set('periodicidade_verificacao', v)}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {Object.entries(PERIODICIDADE_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Status</Label>
              <Select value={form.status} onValueChange={v => set('status', v)}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_EQUIPAMENTO).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button
            onClick={handleSave}
            disabled={saving || !form.identificacao_interna || !form.nome || !form.categoria}
          >
            {saving ? 'Salvando...' : equipamento ? 'Salvar Alterações' : 'Cadastrar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}