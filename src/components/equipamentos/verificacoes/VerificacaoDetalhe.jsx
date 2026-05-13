import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { formatMesAno } from '@/lib/dateUtils';
import { ChevronLeft, Save, PenLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import RubricaModal from './RubricaModal';

const BALANCA_MIN = 1991.11;
const BALANCA_MAX = 2011.72;

function avaliarSituacaoBalanca(valorStr) {
  const v = parseFloat(String(valorStr).replace(',', '.'));
  if (isNaN(v) || valorStr === '') return '';
  return (v >= BALANCA_MIN && v <= BALANCA_MAX) ? 'aprovado' : 'reprovado';
}


const TIPO_LABELS = { balanca: 'Balança', temperatura: 'Temperatura', densidade: 'Densidade' };

const RESULTADO_COLOR = {
  em_andamento: 'bg-yellow-100 text-yellow-700',
  aprovado: 'bg-green-100 text-green-700',
  reprovado: 'bg-red-100 text-red-700',
};

export default function VerificacaoDetalhe({ verificacao, isGestor, onBack, onSaved }) {
  const [data, setData] = useState({ ...verificacao });
  const [saving, setSaving] = useState(false);
  const [userName, setUserName] = useState('');
  const [rubricaModal, setRubricaModal] = useState(null); // { idx }

  // Bloqueado para não-gestores quando já foi finalizado (aprovado ou reprovado)
  const isFinalizado = data.resultado_geral !== 'em_andamento';
  const isReadOnly = !isGestor && isFinalizado;

  useEffect(() => {
    base44.auth.me().then(u => {
      if (u?.full_name) setUserName(u.full_name);
    });
  }, []);

  const setReg = (idx, field, value) => {
    setData(prev => ({
      ...prev,
      registros: prev.registros.map((r, i) => i === idx ? { ...r, [field]: value } : r),
    }));
  };

  // Balança: ao digitar resultado, avalia situação automaticamente
  const setRegBalanca = (idx, valor) => {
    const situacao = avaliarSituacaoBalanca(valor);
    setData(prev => ({
      ...prev,
      registros: prev.registros.map((r, i) =>
        i === idx ? { ...r, valor_medido: valor, situacao } : r
      ),
    }));
  };

  const abrirRubrica = (idx) => {
    if (isReadOnly) return;
    // pré-preenche nome se ainda não tiver
    if (!data.registros[idx].responsavel && userName) {
      setReg(idx, 'responsavel', userName);
    }
    setRubricaModal({ idx });
  };

  const confirmarRubrica = (dataUrl) => {
    const { idx } = rubricaModal;
    setData(prev => ({
      ...prev,
      registros: prev.registros.map((r, i) =>
        i === idx
          ? { ...r, responsavel: r.responsavel || userName, rubrica_url: dataUrl }
          : r
      ),
    }));
    setRubricaModal(null);
  };

  const mesLabel = formatMesAno(data.mes_ano);

  const diasNoMes = data.mes_ano
    ? new Date(Number(data.mes_ano.split('-')[0]), Number(data.mes_ano.split('-')[1]), 0).getDate()
    : 31;

  const handleSave = async () => {
    setSaving(true);
    const updated = await base44.entities.VerificacaoDiaria.update(data.id, data);
    setSaving(false);
    onSaved(updated);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      {rubricaModal && (
        <RubricaModal
          nome={data.registros[rubricaModal.idx]?.responsavel || userName}
          onConfirm={confirmarRubrica}
          onCancel={() => setRubricaModal(null)}
        />
      )}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}><ChevronLeft className="w-5 h-5" /></Button>
          <div>
            <h1 className="text-xl font-bold">
              Verificação de {TIPO_LABELS[data.tipo] || data.tipo}
              <Badge className={`ml-3 ${RESULTADO_COLOR[data.resultado_geral] || 'bg-muted text-muted-foreground'}`}>
                {data.resultado_geral === 'em_andamento' ? 'Em andamento' : data.resultado_geral === 'aprovado' ? 'Aprovado' : 'Reprovado'}
              </Badge>
            </h1>
            <p className="text-sm text-muted-foreground">
              <span className="font-mono-data font-semibold text-primary">{data.equipamento_identificacao}</span>
              {' · '}{data.equipamento_nome}{' · '}<span className="capitalize">{mesLabel}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isReadOnly && (
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              <Save className="w-4 h-4" />
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          )}
          {isReadOnly && (
            <Badge className="bg-green-100 text-green-700 px-3 py-1.5 text-xs">Verificação finalizada — somente leitura</Badge>
          )}
        </div>
      </div>

      {/* Cabeçalho editável */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs">Mês/Ano</Label>
          <Input type="month" value={data.mes_ano} onChange={e => setData(p => ({ ...p, mes_ano: e.target.value }))} disabled={!isGestor} />
        </div>
        {isGestor && (
          <div className="space-y-1.5">
            <Label className="text-xs">Resultado Geral</Label>
            <Select value={data.resultado_geral} onValueChange={v => setData(p => ({ ...p, resultado_geral: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="em_andamento">Em andamento</SelectItem>
                <SelectItem value="aprovado">Aprovado</SelectItem>
                <SelectItem value="reprovado">Reprovado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="space-y-1.5">
          <Label className="text-xs">Realizado por</Label>
          <Input value={data.realizado_por || ''} onChange={e => setData(p => ({ ...p, realizado_por: e.target.value }))} disabled={isReadOnly} />
        </div>
      </div>

      {/* Equipamento de Referência */}
      <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Equipamento de Referência</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Identificação</Label>
            <Input value={data.eq_referencia_identificacao || ''} onChange={e => setData(p => ({ ...p, eq_referencia_identificacao: e.target.value }))} className="text-xs" disabled={isReadOnly} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Descrição</Label>
            <Input value={data.eq_referencia_descricao || ''} onChange={e => setData(p => ({ ...p, eq_referencia_descricao: e.target.value }))} className="text-xs" disabled={isReadOnly} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Data de Calibração</Label>
            <Input type="date" value={data.eq_referencia_data_calibracao || ''} onChange={e => setData(p => ({ ...p, eq_referencia_data_calibracao: e.target.value }))} className="text-xs" disabled={isReadOnly} />
          </div>
        </div>
      </div>

      {/* Densidade: Solução */}
      {data.tipo === 'densidade' && (
        <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Solução Verificada</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Descrição da solução</Label>
              <Input value={data.solucao_descricao || ''} onChange={e => setData(p => ({ ...p, solucao_descricao: e.target.value }))} className="text-xs" disabled={isReadOnly} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Lote</Label>
              <Input value={data.solucao_lote || ''} onChange={e => setData(p => ({ ...p, solucao_lote: e.target.value }))} className="text-xs" disabled={isReadOnly} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Variação permitida: Sulfato de Sódio: 1,151–1,174 · Magnésio: 1,295–1,308</p>
        </div>
      )}

      {data.tipo === 'balanca' && (
        <div className="rounded-lg border bg-blue-50 p-3 text-xs text-blue-800">
          <p className="font-semibold">Limites permitidos: MÍNIMO 1991,11 g — MÁXIMO 2011,72 g</p>
        </div>
      )}

      {data.tipo === 'temperatura' && (
        <div className="rounded-lg border bg-blue-50 p-3 text-xs text-blue-800 space-y-1">
          <p className="font-semibold">Fórmula: v = Temperatura de referência − |Temperatura medida|</p>
          <p>Limites: −18°C=|3,0| · 25°C=|0,5| · 40–60°C=|2,0| · 60–80°C=|3,0| · 80–100°C=|4,0| · 100–120°C=|5,0| · 120–140°C=|6,0| · 140–160°C=|7,0| · 160–180°C=|8,0|</p>
        </div>
      )}

      {/* Tabela de registros */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Checagem Diária</p>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-2 py-2 text-center font-semibold w-10">Dia</th>
                {data.tipo === 'balanca' && <th className="px-2 py-2 text-left font-semibold">Resultado (g)</th>}
                {data.tipo === 'temperatura' && <>
                  <th className="px-2 py-2 text-left font-semibold">Temp. Referência (°C)</th>
                  <th className="px-2 py-2 text-left font-semibold">Temp. Medida (°C)</th>
                  <th className="px-2 py-2 text-left font-semibold">Variação (°C)</th>
                </>}
                {data.tipo === 'densidade' && <>
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
              {(data.registros || []).slice(0, diasNoMes).map((r, i) => (
                <tr key={i} className={r.situacao === 'reprovado' ? 'bg-red-50' : 'hover:bg-muted/20'}>
                  <td className="px-2 py-1 text-center font-mono-data text-muted-foreground">{r.dia}</td>
                  {data.tipo === 'balanca' && (
                    <td className="px-1 py-1"><Input value={r.valor_medido} onChange={e => setRegBalanca(i, e.target.value)} className="h-6 text-xs px-1.5" placeholder="g" disabled={isReadOnly} /></td>
                  )}
                  {data.tipo === 'temperatura' && <>
                    <td className="px-1 py-1"><Input value={r.valor_referencia} onChange={e => setReg(i, 'valor_referencia', e.target.value)} className="h-6 text-xs px-1.5" placeholder="°C" disabled={isReadOnly} /></td>
                    <td className="px-1 py-1"><Input value={r.valor_medido} onChange={e => setReg(i, 'valor_medido', e.target.value)} className="h-6 text-xs px-1.5" placeholder="°C" disabled={isReadOnly} /></td>
                    <td className="px-1 py-1"><Input value={r.variacao} onChange={e => setReg(i, 'variacao', e.target.value)} className="h-6 text-xs px-1.5" placeholder="°C" disabled={isReadOnly} /></td>
                  </>}
                  {data.tipo === 'densidade' && <>
                    <td className="px-1 py-1"><Input value={r.horario} onChange={e => setReg(i, 'horario', e.target.value)} className="h-6 text-xs px-1.5" placeholder="HH:MM" disabled={isReadOnly} /></td>
                    <td className="px-1 py-1"><Input value={r.temperatura} onChange={e => setReg(i, 'temperatura', e.target.value)} className="h-6 text-xs px-1.5" placeholder="°C" disabled={isReadOnly} /></td>
                    <td className="px-1 py-1"><Input value={r.densidade_com_amostra} onChange={e => setReg(i, 'densidade_com_amostra', e.target.value)} className="h-6 text-xs px-1.5" placeholder="g/cm³" disabled={isReadOnly} /></td>
                    <td className="px-1 py-1"><Input value={r.densidade_sem_amostra} onChange={e => setReg(i, 'densidade_sem_amostra', e.target.value)} className="h-6 text-xs px-1.5" placeholder="g/cm³" disabled={isReadOnly} /></td>
                  </>}
                  <td className="px-1 py-1 text-center">
                    {data.tipo === 'balanca' ? (
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${r.situacao === 'aprovado' ? 'bg-green-100 text-green-700' : r.situacao === 'reprovado' ? 'bg-red-100 text-red-700' : 'text-muted-foreground'}`}>
                        {r.situacao === 'aprovado' ? 'Aprovado' : r.situacao === 'reprovado' ? 'Reprovado' : '—'}
                      </span>
                    ) : (
                      <Select value={r.situacao} onValueChange={v => setReg(i, 'situacao', v)} disabled={isReadOnly}>
                        <SelectTrigger className="h-6 text-xs px-1.5 w-28"><SelectValue placeholder="—" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="aprovado">Aprovado</SelectItem>
                          <SelectItem value="reprovado">Reprovado</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </td>
                  <td className="px-1 py-1">
                    {data.tipo === 'balanca' ? (
                      <button
                        onClick={() => abrirRubrica(i)}
                        disabled={isReadOnly || !r.valor_medido}
                        className={`flex items-center gap-1.5 h-6 px-2 rounded border text-xs transition-all w-full
                          ${r.rubrica_url
                            ? 'border-green-300 bg-green-50 text-green-700'
                            : 'border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary'
                          } disabled:opacity-40 disabled:cursor-not-allowed`}
                      >
                        {r.rubrica_url
                          ? <><img src={r.rubrica_url} alt="rubrica" className="h-4 object-contain" /><span className="truncate text-[10px]">{r.responsavel}</span></>
                          : <><PenLine className="w-3 h-3" /><span className="truncate">{r.responsavel || 'Rubricar'}</span></>
                        }
                      </button>
                    ) : (
                      <Input value={r.responsavel || ''} onFocus={() => { if (!r.responsavel && userName && !isReadOnly) setReg(i, 'responsavel', userName); }} onChange={e => setReg(i, 'responsavel', e.target.value)} className="h-6 text-xs px-1.5" placeholder="Nome" disabled={isReadOnly} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Outras informações */}
      <div className="space-y-1.5 max-w-lg">
        <Label className="text-xs">Outras Informações</Label>
        <Textarea value={data.outras_informacoes || ''} onChange={e => setData(p => ({ ...p, outras_informacoes: e.target.value }))} className="h-20 text-xs" disabled={isReadOnly} />
      </div>

      <div className="flex justify-end gap-2 pb-6">
        <Button variant="outline" onClick={onBack}>Voltar</Button>
        {!isReadOnly && (
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="w-4 h-4" />
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        )}
      </div>
    </div>
  );
}