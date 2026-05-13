import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const MODELOS = {
  balanca: 'Balança',
  temperatura: 'Temperatura',
  densidade: 'Densidade',
};

const calcDiferenca = (ref, obtido) => {
  if (ref == null || obtido == null || ref === '' || obtido === '') return '';
  return Math.abs(Number(obtido) - Number(ref)).toFixed(4);
};

const dentroDaTol = (diferenca, tolerancia) => {
  if (diferenca === '' || tolerancia == null || tolerancia === '') return null;
  return Number(diferenca) <= Number(tolerancia);
};

export default function VerificacaoDiariaModal({ open, onClose, equipamento, user, onSaved }) {
  const [modelo, setModelo] = useState('');
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [responsavel, setResponsavel] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [campos, setCampos] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setModelo('');
      setData(new Date().toISOString().split('T')[0]);
      setResponsavel(user?.full_name || '');
      setObservacoes('');
      setCampos({});
    }
  }, [open, user]);

  const setC = (field, value) => setCampos(prev => {
    const next = { ...prev, [field]: value };
    // Calcular diferença automaticamente
    if (modelo === 'balanca') {
      const ref = field === 'massa_padrao_g' ? value : prev.massa_padrao_g;
      const obt = field === 'leitura_obtida_g' ? value : prev.leitura_obtida_g;
      const dif = calcDiferenca(ref, obt);
      next.diferenca_g = dif;
      next.dentro_tolerancia = dentroDaTol(dif, next.tolerancia_g ?? prev.tolerancia_g);
    } else if (modelo === 'temperatura') {
      const ref = field === 'temperatura_referencia_c' ? value : prev.temperatura_referencia_c;
      const obt = field === 'temperatura_obtida_c' ? value : prev.temperatura_obtida_c;
      const dif = calcDiferenca(ref, obt);
      next.diferenca_c = dif;
      next.dentro_tolerancia = dentroDaTol(dif, next.tolerancia_c ?? prev.tolerancia_c);
    } else if (modelo === 'densidade') {
      const ref = field === 'densidade_referencia' ? value : prev.densidade_referencia;
      const obt = field === 'densidade_obtida' ? value : prev.densidade_obtida;
      const dif = calcDiferenca(ref, obt);
      next.diferenca = dif;
      next.dentro_tolerancia = dentroDaTol(dif, next.tolerancia ?? prev.tolerancia);
    }
    return next;
  });

  const aprovado = campos.dentro_tolerancia === true;

  const handleSave = async () => {
    if (!modelo || !data || !responsavel) return;
    setSaving(true);

    const payload = {
      equipamento_id: equipamento.id,
      equipamento_identificacao: equipamento.identificacao_interna,
      equipamento_nome: equipamento.nome,
      modelo,
      data_verificacao: data,
      responsavel: responsavel.trim(),
      aprovado,
      observacoes: observacoes.trim(),
    };

    if (modelo === 'balanca') payload.campos_balanca = campos;
    if (modelo === 'temperatura') payload.campos_temperatura = campos;
    if (modelo === 'densidade') payload.campos_densidade = campos;

    await base44.entities.VerificacaoDiaria.create(payload);
    setSaving(false);
    onSaved();
  };

  const canSave = modelo && data && responsavel.trim();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Verificação Interna Diária</DialogTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Equipamento: <span className="font-semibold font-mono-data">{equipamento?.identificacao_interna}</span> — {equipamento?.nome}
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Cabeçalho */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Modelo de Verificação *</Label>
              <Select value={modelo} onValueChange={v => { setModelo(v); setCampos({}); }}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {Object.entries(MODELOS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Data da Verificação *</Label>
              <Input type="date" value={data} onChange={e => setData(e.target.value)} max={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs">Responsável *</Label>
              <Input value={responsavel} onChange={e => setResponsavel(e.target.value)} placeholder="Nome do laboratorista" />
            </div>
          </div>

          {/* Campos específicos por modelo */}
          {modelo === 'balanca' && (
            <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Dados — Balança</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Massa Padrão (g)</Label>
                  <Input type="number" step="0.0001" value={campos.massa_padrao_g ?? ''} onChange={e => setC('massa_padrao_g', e.target.value)} placeholder="0.0000" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Leitura Obtida (g)</Label>
                  <Input type="number" step="0.0001" value={campos.leitura_obtida_g ?? ''} onChange={e => setC('leitura_obtida_g', e.target.value)} placeholder="0.0000" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Diferença (g) — automático</Label>
                  <Input readOnly value={campos.diferenca_g ?? ''} className="bg-muted/40 text-muted-foreground" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Tolerância (g)</Label>
                  <Input type="number" step="0.0001" value={campos.tolerancia_g ?? ''} onChange={e => setC('tolerancia_g', e.target.value)} placeholder="0.0100" />
                </div>
              </div>
              {campos.dentro_tolerancia != null && (
                <p className={`text-xs font-semibold ${campos.dentro_tolerancia ? 'text-green-600' : 'text-red-600'}`}>
                  {campos.dentro_tolerancia ? '✔ Dentro da tolerância — APROVADO' : '✘ Fora da tolerância — REPROVADO'}
                </p>
              )}
            </div>
          )}

          {modelo === 'temperatura' && (
            <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Dados — Temperatura</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Temperatura de Referência (°C)</Label>
                  <Input type="number" step="0.1" value={campos.temperatura_referencia_c ?? ''} onChange={e => setC('temperatura_referencia_c', e.target.value)} placeholder="0.0" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Temperatura Obtida (°C)</Label>
                  <Input type="number" step="0.1" value={campos.temperatura_obtida_c ?? ''} onChange={e => setC('temperatura_obtida_c', e.target.value)} placeholder="0.0" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Diferença (°C) — automático</Label>
                  <Input readOnly value={campos.diferenca_c ?? ''} className="bg-muted/40 text-muted-foreground" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Tolerância (°C)</Label>
                  <Input type="number" step="0.1" value={campos.tolerancia_c ?? ''} onChange={e => setC('tolerancia_c', e.target.value)} placeholder="1.0" />
                </div>
              </div>
              {campos.dentro_tolerancia != null && (
                <p className={`text-xs font-semibold ${campos.dentro_tolerancia ? 'text-green-600' : 'text-red-600'}`}>
                  {campos.dentro_tolerancia ? '✔ Dentro da tolerância — APROVADO' : '✘ Fora da tolerância — REPROVADO'}
                </p>
              )}
            </div>
          )}

          {modelo === 'densidade' && (
            <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Dados — Densidade</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5 col-span-2">
                  <Label className="text-xs">Líquido Padrão</Label>
                  <Input value={campos.liquido_padrao ?? ''} onChange={e => setC('liquido_padrao', e.target.value)} placeholder="Ex: Água destilada" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Densidade de Referência (g/cm³)</Label>
                  <Input type="number" step="0.0001" value={campos.densidade_referencia ?? ''} onChange={e => setC('densidade_referencia', e.target.value)} placeholder="0.9970" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Densidade Obtida (g/cm³)</Label>
                  <Input type="number" step="0.0001" value={campos.densidade_obtida ?? ''} onChange={e => setC('densidade_obtida', e.target.value)} placeholder="0.9970" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Diferença — automático</Label>
                  <Input readOnly value={campos.diferenca ?? ''} className="bg-muted/40 text-muted-foreground" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Tolerância</Label>
                  <Input type="number" step="0.0001" value={campos.tolerancia ?? ''} onChange={e => setC('tolerancia', e.target.value)} placeholder="0.0010" />
                </div>
              </div>
              {campos.dentro_tolerancia != null && (
                <p className={`text-xs font-semibold ${campos.dentro_tolerancia ? 'text-green-600' : 'text-red-600'}`}>
                  {campos.dentro_tolerancia ? '✔ Dentro da tolerância — APROVADO' : '✘ Fora da tolerância — REPROVADO'}
                </p>
              )}
            </div>
          )}

          {/* Observações */}
          <div className="space-y-1.5">
            <Label className="text-xs">Observações (opcional)</Label>
            <Textarea value={observacoes} onChange={e => setObservacoes(e.target.value)} placeholder="Anotações adicionais..." rows={2} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving || !canSave}>
            {saving ? 'Registrando...' : 'Registrar Verificação'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}