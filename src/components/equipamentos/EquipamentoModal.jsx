import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
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
  obrigatorio_verificacao_diaria: false,
  obrigatorio_verificacao_intermediaria: false,
};

export default function EquipamentoModal({ open, onClose, equipamento, onSaved }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [statusOriginal, setStatusOriginal] = useState('em_uso');
  const [dataAlteracaoStatus, setDataAlteracaoStatus] = useState('');
  const [observacaoStatus, setObservacaoStatus] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      const base = equipamento ? { ...EMPTY_FORM, ...equipamento } : EMPTY_FORM;
      setForm(base);
      setStatusOriginal(base.status || 'em_uso');
      setDataAlteracaoStatus('');
      setObservacaoStatus('');
    }
  }, [open, equipamento]);

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const statusMudou = form.status !== statusOriginal;

  const handleSave = async () => {
    if (!form.identificacao_interna || !form.nome || !form.categoria) return;
    if (statusMudou && !dataAlteracaoStatus) return; // data obrigatória ao trocar status

    setSaving(true);

    let novoHistorico = equipamento?.historico_status || [];

    if (statusMudou) {
      novoHistorico = [
        ...novoHistorico,
        {
          status: form.status,
          data: dataAlteracaoStatus,
          observacao: observacaoStatus.trim() || '',
        },
      ];
    }

    const payload = { ...form, historico_status: novoHistorico };

    if (equipamento?.id) {
      await base44.entities.Equipamento.update(equipamento.id, payload);
    } else {
      // Novo equipamento: registrar status inicial no histórico
      const historicoInicial = [{
        status: form.status,
        data: dataAlteracaoStatus || new Date().toISOString().split('T')[0],
        observacao: 'Cadastro inicial',
      }];
      await base44.entities.Equipamento.create({ ...payload, historico_status: historicoInicial });
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

        <div className="space-y-5">
          {/* Dados gerais */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Identificação Interna *</Label>
              <Input value={form.identificacao_interna} onChange={e => set('identificacao_interna', e.target.value)} placeholder="Ex: LC-001" className="font-mono-data" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Nome *</Label>
              <Input value={form.nome} onChange={e => set('nome', e.target.value)} placeholder="Nome do equipamento" />
            </div>
            <div className="space-y-1.5">
  <Label htmlFor="categoria" className="text-xs font-medium">
    Categoria *
  </Label>
  
  <Select 
    value={form.categoria} 
    onValueChange={(value) => set('categoria', value)}
  >
    <SelectTrigger id="categoria" className="w-full">
      <SelectValue placeholder="Selecione uma categoria" />
    </SelectTrigger>
    
    <SelectContent>
      <SelectItem value="Vidraria">Vidraria</SelectItem>
      <SelectItem value="Soquete">Soquete</SelectItem>
      <SelectItem value="Cilindros">Cilindros</SelectItem>
      <SelectItem value="Banho Maria">Banho Maria</SelectItem>
      <SelectItem value="Estufa">Estufa</SelectItem>
      <SelectItem value="Balança">Balança</SelectItem>
      <SelectItem value="Termômetro">Termômetro</SelectItem>
      <SelectItem value="Soluções">Soluções</SelectItem>
    </SelectContent>
  </Select>
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

          {/* Obrigatoriedade de verificações */}
          <div className="flex flex-col sm:flex-row gap-4 pt-1">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <Checkbox
                checked={!!form.obrigatorio_verificacao_diaria}
                onCheckedChange={v => set('obrigatorio_verificacao_diaria', v)}
              />
              <span className="text-sm text-foreground">Verificação diária obrigatória</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <Checkbox
                checked={!!form.obrigatorio_verificacao_intermediaria}
                onCheckedChange={v => set('obrigatorio_verificacao_intermediaria', v)}
              />
              <span className="text-sm text-foreground">Verificação intermediária obrigatória</span>
            </label>
          </div>

          {/* Campos extras quando o status for alterado */}
          {(statusMudou || !equipamento) && (
            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
              <p className="text-xs font-semibold text-foreground">
                {equipamento ? 'Registrar alteração de status' : 'Data de cadastro'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Data da alteração *</Label>
                  <Input
                    type="date"
                    value={dataAlteracaoStatus}
                    onChange={e => setDataAlteracaoStatus(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Observação (opcional)</Label>
                  <Input
                    value={observacaoStatus}
                    onChange={e => setObservacaoStatus(e.target.value)}
                    placeholder="Ex: Enviado para calibração externa"
                  />
                </div>
              </div>
            </div>
          )}

        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button
            onClick={handleSave}
            disabled={saving || !form.identificacao_interna || !form.nome || !form.categoria || (statusMudou && !dataAlteracaoStatus)}
          >
            {saving ? 'Salvando...' : equipamento ? 'Salvar Alterações' : 'Cadastrar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}