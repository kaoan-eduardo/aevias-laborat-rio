import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { History } from 'lucide-react';
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

  const historico = [...(equipamento?.historico_status || [])].sort(
    (a, b) => new Date(b.data) - new Date(a.data)
  );

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

          {/* Histórico de status */}
          {equipamento && historico.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-semibold text-foreground uppercase tracking-wide">Histórico de Status</span>
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {historico.map((h, i) => {
                    const cfg = STATUS_EQUIPAMENTO[h.status];
                    return (
                      <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg bg-muted/30 border border-border">
                        <div className="flex-shrink-0 mt-0.5">
                          <Badge className={`${cfg?.color || 'bg-gray-100 text-gray-600'} text-xs`}>
                            {cfg?.label || h.status}
                          </Badge>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground">
                            {h.data ? new Date(h.data + 'T12:00:00').toLocaleDateString('pt-BR') : '—'}
                          </p>
                          {h.observacao && (
                            <p className="text-xs text-muted-foreground mt-0.5">{h.observacao}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
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