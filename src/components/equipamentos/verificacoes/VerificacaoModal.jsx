import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const TIPO_LABELS = { balanca: 'Balança', temperatura: 'Temperatura', densidade: 'Densidade' };

function buildRegistros() {
  return Array.from({ length: 31 }, (_, i) => ({
    dia: i + 1,
    valor_referencia: '',
    valor_medido: '',
    variacao: '',
    horario: '',
    temperatura: '',
    densidade_com_amostra: '',
    densidade_sem_amostra: '',
    situacao: '',
    responsavel: '',
  }));
}

export default function VerificacaoModal({ open, onClose, equipamento, onSaved }) {
  const { user } = useAuth();
  const [tipo, setTipo] = useState('balanca');
  const [mesAno, setMesAno] = useState('');
  const [realizado_por, setRealizadoPor] = useState('');
  const [outras_informacoes, setOutrasInfo] = useState('');
  const [resultado_geral, setResultadoGeral] = useState('em_andamento');
  const [eq_referencia_identificacao, setEqRefId] = useState('');
  const [eq_referencia_descricao, setEqRefDesc] = useState('');
  const [eq_referencia_data_calibracao, setEqRefCal] = useState('');
  const [solucao_descricao, setSolucaoDesc] = useState('');
  const [solucao_lote, setSolucaoLote] = useState('');
  const [registros, setRegistros] = useState(buildRegistros());
  const [saving, setSaving] = useState(false);

  const hoje = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (open) {
      const now = new Date();
      setMesAno(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
      setRealizadoPor(user?.full_name || '');
      setTipo('balanca');
      setRegistros(buildRegistros());
      setResultadoGeral('em_andamento');
      setOutrasInfo('');
      setEqRefId('');
      setEqRefDesc('');
      setEqRefCal(equipamento?.data_calibracao || '');
      setSolucaoDesc('');
      setSolucaoLote('');
    }
  }, [open, equipamento, user]);

  const setReg = (idx, field, value) => {
    setRegistros(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
  };

  const handleSave = async () => {
    if (!mesAno) return;
    setSaving(true);
    await base44.entities.VerificacaoDiaria.create({
      equipamento_id: equipamento.id,
      equipamento_identificacao: equipamento.identificacao_interna,
      equipamento_nome: equipamento.nome,
      tipo,
      mes_ano: mesAno,
      realizado_por,
      data_finalizacao: hoje,
      outras_informacoes,
      resultado_geral,
      eq_referencia_identificacao,
      eq_referencia_descricao,
      eq_referencia_data_calibracao,
      solucao_descricao,
      solucao_lote,
      registros,
    });
    setSaving(false);
    onSaved();
  };

  const diasNoMes = mesAno
    ? new Date(Number(mesAno.split('-')[0]), Number(mesAno.split('-')[1]), 0).getDate()
    : 31;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Verificação Diária — {equipamento?.identificacao_interna} · {equipamento?.nome}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Tipo e Mês */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Tipo de Verificação *</Label>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(TIPO_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Mês/Ano *</Label>
              <Input type="month" value={mesAno} onChange={e => setMesAno(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Resultado Geral</Label>
              <Select value={resultado_geral} onValueChange={setResultadoGeral}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="em_andamento">Em andamento</SelectItem>
                  <SelectItem value="aprovado">Aprovado</SelectItem>
                  <SelectItem value="reprovado">Reprovado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Equipamento Verificado (preenchido automaticamente) */}
          <div className="rounded-lg border bg-muted/20 p-3 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Equipamento Verificado</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-xs text-muted-foreground">Descrição: </span><span className="font-medium">{equipamento?.nome}</span></div>
              <div><span className="text-xs text-muted-foreground">Identificação: </span><span className="font-mono-data font-medium">{equipamento?.identificacao_interna}</span></div>
            </div>
          </div>

          {/* Equipamento de Referência */}
          <div className="rounded-lg border bg-muted/20 p-3 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Equipamento de Referência</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Identificação</Label>
                <Input value={eq_referencia_identificacao} onChange={e => setEqRefId(e.target.value)} placeholder="ID do equip. referência" className="text-xs" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Descrição</Label>
                <Input value={eq_referencia_descricao} onChange={e => setEqRefDesc(e.target.value)} placeholder="Descrição" className="text-xs" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Data de Calibração</Label>
                <Input type="date" value={eq_referencia_data_calibracao} onChange={e => setEqRefCal(e.target.value)} className="text-xs" />
              </div>
            </div>
          </div>

          {/* Campos específicos de Densidade */}
          {tipo === 'densidade' && (
            <div className="rounded-lg border bg-muted/20 p-3 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Solução Verificada</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Descrição da solução</Label>
                  <Input value={solucao_descricao} onChange={e => setSolucaoDesc(e.target.value)} placeholder="Ex: Sulfato de Sódio" className="text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Lote</Label>
                  <Input value={solucao_lote} onChange={e => setSolucaoLote(e.target.value)} placeholder="Lote" className="text-xs" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Variação permitida: Sulfato de Sódio: 1,151–1,174 · Magnésio: 1,295–1,308
              </p>
            </div>
          )}

          {/* Balança: limites */}
          {tipo === 'balanca' && (
            <div className="rounded-lg border bg-blue-50 p-3 text-xs text-blue-800">
              <p className="font-semibold">Limites permitidos: MÍNIMO 1991,11 g — MÁXIMO 2011,72 g</p>
              <p className="mt-0.5 text-blue-600">Conjunto Peso Padrão como referência.</p>
            </div>
          )}

          {/* Temperatura: fórmula */}
          {tipo === 'temperatura' && (
            <div className="rounded-lg border bg-blue-50 p-3 text-xs text-blue-800 space-y-1">
              <p className="font-semibold">Fórmula: v = Temperatura de referência − |Temperatura medida|</p>
              <p>Limites: −18°C=|3,0| · 25°C=|0,5| · 40–60°C=|2,0| · 60–80°C=|3,0| · 80–100°C=|4,0| · 100–120°C=|5,0| · 120–140°C=|6,0| · 140–160°C=|7,0| · 160–180°C=|8,0|</p>
            </div>
          )}

          {/* Tabela de registros diários */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Checagem Diária</p>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-xs">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-2 py-2 text-center font-semibold w-10">Dia</th>
                    {tipo === 'balanca' && <th className="px-2 py-2 text-left font-semibold">Resultado (g)</th>}
                    {tipo === 'temperatura' && <>
                      <th className="px-2 py-2 text-left font-semibold">Temp. Referência (°C)</th>
                      <th className="px-2 py-2 text-left font-semibold">Temp. Medida (°C)</th>
                      <th className="px-2 py-2 text-left font-semibold">Variação (°C)</th>
                    </>}
                    {tipo === 'densidade' && <>
                      <th className="px-2 py-2 text-left font-semibold">Horário</th>
                      <th className="px-2 py-2 text-left font-semibold">Temperatura</th>
                      <th className="px-2 py-2 text-left font-semibold">Dens. c/ Amostra</th>
                      <th className="px-2 py-2 text-left font-semibold">Dens. s/ Amostra</th>
                    </>}
                    <th className="px-2 py-2 text-center font-semibold">Situação</th>
                    <th className="px-2 py-2 text-left font-semibold">Responsável</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {registros.slice(0, diasNoMes).map((r, i) => (
                    <tr key={i} className="hover:bg-muted/20">
                      <td className="px-2 py-1 text-center font-mono-data text-muted-foreground">{r.dia}</td>
                      {tipo === 'balanca' && (
                        <td className="px-1 py-1">
                          <Input value={r.valor_medido} onChange={e => setReg(i, 'valor_medido', e.target.value)} className="h-6 text-xs px-1.5" placeholder="g" />
                        </td>
                      )}
                      {tipo === 'temperatura' && <>
                        <td className="px-1 py-1"><Input value={r.valor_referencia} onChange={e => setReg(i, 'valor_referencia', e.target.value)} className="h-6 text-xs px-1.5" placeholder="°C" /></td>
                        <td className="px-1 py-1"><Input value={r.valor_medido} onChange={e => setReg(i, 'valor_medido', e.target.value)} className="h-6 text-xs px-1.5" placeholder="°C" /></td>
                        <td className="px-1 py-1"><Input value={r.variacao} onChange={e => setReg(i, 'variacao', e.target.value)} className="h-6 text-xs px-1.5" placeholder="°C" /></td>
                      </>}
                      {tipo === 'densidade' && <>
                        <td className="px-1 py-1"><Input value={r.horario} onChange={e => setReg(i, 'horario', e.target.value)} className="h-6 text-xs px-1.5" placeholder="HH:MM" /></td>
                        <td className="px-1 py-1"><Input value={r.temperatura} onChange={e => setReg(i, 'temperatura', e.target.value)} className="h-6 text-xs px-1.5" placeholder="°C" /></td>
                        <td className="px-1 py-1"><Input value={r.densidade_com_amostra} onChange={e => setReg(i, 'densidade_com_amostra', e.target.value)} className="h-6 text-xs px-1.5" placeholder="g/cm³" /></td>
                        <td className="px-1 py-1"><Input value={r.densidade_sem_amostra} onChange={e => setReg(i, 'densidade_sem_amostra', e.target.value)} className="h-6 text-xs px-1.5" placeholder="g/cm³" /></td>
                      </>}
                      <td className="px-1 py-1 text-center">
                        <Select value={r.situacao} onValueChange={v => setReg(i, 'situacao', v)}>
                          <SelectTrigger className="h-6 text-xs px-1.5 w-28"><SelectValue placeholder="—" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value={null}>—</SelectItem>
                            <SelectItem value="aprovado">Aprovado</SelectItem>
                            <SelectItem value="reprovado">Reprovado</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-1 py-1">
                        <Input value={r.responsavel} onChange={e => setReg(i, 'responsavel', e.target.value)} className="h-6 text-xs px-1.5" placeholder="Nome" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Outras informações e Realizador */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Realizado por</Label>
              <Input value={realizado_por} onChange={e => setRealizadoPor(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Outras Informações</Label>
              <Textarea value={outras_informacoes} onChange={e => setOutrasInfo(e.target.value)} className="h-16 text-xs" />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving || !mesAno}>
            {saving ? 'Salvando...' : 'Salvar Verificação'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}