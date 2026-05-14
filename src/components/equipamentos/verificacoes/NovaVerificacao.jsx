import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { currentMonthSP } from '@/lib/dateUtils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import RubricaButton from './RubricaButton';

const BALANCA_MIN = 1991.11;
const BALANCA_MAX = 2011.72;

function avaliarSituacaoBalanca(valorStr) {
  const v = parseFloat(String(valorStr).replace(',', '.'));
  if (isNaN(v) || valorStr === '') return '';
  return (v >= BALANCA_MIN && v <= BALANCA_MAX) ? 'aprovado' : 'reprovado';
}

// Tabela de limites de variação por faixa de temperatura de referência
const LIMITES_TEMPERATURA = [
  { min: -Infinity, max: -18,  limite: 3.0 },
  { min: -18,       max: -18,  limite: 3.0 },
  { min: -17.99,    max: 25,   limite: 0.5 },
  { min: 25.01,     max: 60,   limite: 2.0 },
  { min: 60.01,     max: 80,   limite: 3.0 },
  { min: 80.01,     max: 100,  limite: 4.0 },
  { min: 100.01,    max: 120,  limite: 5.0 },
  { min: 120.01,    max: 140,  limite: 6.0 },
  { min: 140.01,    max: 160,  limite: 7.0 },
  { min: 160.01,    max: 180,  limite: 8.0 },
];

// Limites simplificados por pontos/faixas exatos conforme enunciado
function getLimiteTemperatura(ref) {
  const v = parseFloat(ref);
  if (isNaN(v)) return null;
  if (v === -18) return 3.0;
  if (v === 25) return 0.5;
  if (v >= 40 && v <= 60) return 2.0;
  if (v > 60 && v <= 80) return 3.0;
  if (v > 80 && v <= 100) return 4.0;
  if (v > 100 && v <= 120) return 5.0;
  if (v > 120 && v <= 140) return 6.0;
  if (v > 140 && v <= 160) return 7.0;
  if (v > 160 && v <= 180) return 8.0;
  return null;
}

function avaliarSituacaoTemperatura(refStr, variacaoStr) {
  if (refStr === '' || variacaoStr === '') return '';
  const limite = getLimiteTemperatura(refStr);
  if (limite === null) return '';
  const variacao = Math.abs(parseFloat(variacaoStr));
  if (isNaN(variacao)) return '';
  return variacao <= limite ? 'aprovado' : 'reprovado';
}

const TIPOS = [
  { value: 'balanca', label: 'Balança', desc: 'Verificação de massa com peso padrão' },
  { value: 'temperatura', label: 'Temperatura', desc: 'Verificação de termômetros e fornos' },
  { value: 'densidade', label: 'Densidade', desc: 'Verificação de densímetros' },
];

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
    rubrica_url: '',
  }));
}

export default function NovaVerificacao({ onBack, onSaved }) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [tipo, setTipo] = useState('');
  const [equipamentos, setEquipamentos] = useState([]);
  const [loadingEq, setLoadingEq] = useState(false);
  const [equipamento, setEquipamento] = useState(null);

  // Form fields
  const [mesAno, setMesAno] = useState('');
  const [realizadoPor, setRealizadoPor] = useState('');
  const [outrasInfo, setOutrasInfo] = useState('');
  const [resultadoGeral, setResultadoGeral] = useState('em_andamento');
  const [eqRefId, setEqRefId] = useState('');
  const [eqRefDesc, setEqRefDesc] = useState('');
  const [eqRefCal, setEqRefCal] = useState('');
  const [pesosPadrao, setPesosPadrao] = useState([]);
  const [termometros, setTermometros] = useState([]);
  const [solucaoDesc, setSolucaoDesc] = useState('');
  const [solucaoLote, setSolucaoLote] = useState('');
  const [registros, setRegistros] = useState(buildRegistros());
  const [saving, setSaving] = useState(false);

  const CATEGORIAS_POR_TIPO = {
    balanca: ['Balança', 'balanca', 'balança'],
    temperatura: ['Temperatura', 'temperatura', 'Estufa', 'estufa', 'Banho Maria', 'banho maria', 'Banho-Maria', 'banho-maria', 'Forno', 'forno'],
  };

  useEffect(() => {
    if (step === 2 && tipo) {
      if (tipo === 'densidade') {
        setEquipamento(null);
        setStep(3);
        return;
      }
      setLoadingEq(true);
      base44.entities.Equipamento.filter({ status: 'em_uso', obrigatorio_verificacao_diaria: true }, 'identificacao_interna')
        .then(data => {
          const categoriasPermitidas = CATEGORIAS_POR_TIPO[tipo] || [];
          const filtrado = data.filter(eq =>
            categoriasPermitidas.some(cat => eq.categoria?.toLowerCase() === cat.toLowerCase())
          );
          setEquipamentos(filtrado);
          setLoadingEq(false);
        });
    }
  }, [step, tipo]);

  useEffect(() => {
    if (step === 3) {
      setMesAno(currentMonthSP());
      setRealizadoPor(user?.full_name || '');
      setRegistros(buildRegistros());
      setEqRefCal('');
      setEqRefId('');
      setEqRefDesc('');

      if (tipo === 'balanca') {
        base44.entities.Equipamento.filter({ status: 'em_uso' }, 'identificacao_interna')
          .then(data => {
            const pesos = data.filter(eq =>
              eq.categoria?.toLowerCase().includes('peso padrão') ||
              eq.categoria?.toLowerCase().includes('peso padrao') ||
              eq.nome?.toLowerCase().includes('peso padrão') ||
              eq.nome?.toLowerCase().includes('peso padrao') ||
              eq.categoria?.toLowerCase().includes('conjunto de peso')
            );
            setPesosPadrao(pesos);
            if (pesos.length === 1) {
              setEqRefId(pesos[0].identificacao_interna || '');
              setEqRefDesc(pesos[0].nome || '');
              setEqRefCal(pesos[0].data_calibracao || '');
            }
          });
      }

      if (tipo === 'temperatura') {
        base44.entities.Equipamento.filter({ status: 'em_uso' }, 'identificacao_interna')
          .then(data => {
            const terms = data.filter(eq =>
              eq.categoria?.toLowerCase().includes('termômetro') ||
              eq.categoria?.toLowerCase().includes('termometro') ||
              eq.nome?.toLowerCase().includes('termômetro') ||
              eq.nome?.toLowerCase().includes('termometro')
            );
            setTermometros(terms);
            if (terms.length === 1) {
              setEqRefId(terms[0].identificacao_interna || '');
              setEqRefDesc(terms[0].nome || '');
              setEqRefCal(terms[0].data_calibracao || '');
            }
          });
      }
    }
  }, [step, equipamento, user, tipo]);

  const setReg = (idx, field, value) => {
    setRegistros(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
  };

  const setRegBalanca = (idx, valor) => {
    const situacao = avaliarSituacaoBalanca(valor);
    setRegistros(prev => prev.map((r, i) =>
      i === idx ? { ...r, valor_medido: valor, situacao } : r
    ));
  };

  const setRegTemperatura = (idx, field, value, currentReg) => {
    const ref = field === 'valor_referencia' ? value : currentReg.valor_referencia;
    const medido = field === 'valor_medido' ? value : currentReg.valor_medido;
    const variacao = (ref !== '' && medido !== '')
      ? Math.abs(parseFloat(ref) - parseFloat(medido)).toFixed(2)
      : '';
    const situacao = avaliarSituacaoTemperatura(ref, variacao);
    setRegistros(prev => prev.map((r, i) =>
      i === idx ? { ...r, [field]: value, variacao, situacao } : r
    ));
  };

  const confirmarRubrica = (idx, dataUrl) => {
    setRegistros(prev => prev.map((r, i) =>
      i === idx
        ? { ...r, responsavel: r.responsavel || user?.full_name || '', rubrica_url: dataUrl }
        : r
    ));
  };

  const diasNoMes = mesAno
    ? new Date(Number(mesAno.split('-')[0]), Number(mesAno.split('-')[1]), 0).getDate()
    : 31;

  const handleSave = async () => {
    if (!mesAno) return;
    if (tipo !== 'densidade' && !equipamento) return;
    setSaving(true);
    await base44.entities.VerificacaoDiaria.create({
      equipamento_id: equipamento?.id || '',
      equipamento_identificacao: equipamento?.identificacao_interna || '—',
      equipamento_nome: equipamento?.nome || 'Verificação de Densidade',
      tipo,
      mes_ano: mesAno,
      realizado_por: realizadoPor,
      outras_informacoes: outrasInfo,
      resultado_geral: resultadoGeral,
      eq_referencia_identificacao: eqRefId,
      eq_referencia_descricao: eqRefDesc,
      eq_referencia_data_calibracao: eqRefCal,
      solucao_descricao: solucaoDesc,
      solucao_lote: solucaoLote,
      registros,
    });
    setSaving(false);
    onSaved();
  };

  // ── STEP 1 ──
  if (step === 1) {
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}><ChevronLeft className="w-5 h-5" /></Button>
          <div>
            <h1 className="text-xl font-bold">Nova Verificação Diária</h1>
            <p className="text-sm text-muted-foreground">Passo 1 de 3 — Selecione o tipo de verificação</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {TIPOS.map(t => (
            <button
              key={t.value}
              onClick={() => { setTipo(t.value); setStep(2); }}
              className="rounded-xl border-2 border-border hover:border-primary p-6 text-left transition-all hover:bg-primary/5 focus:outline-none focus:border-primary"
            >
              <p className="font-semibold text-foreground text-base">{t.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{t.desc}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── STEP 2 ──
  if (step === 2) {
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setStep(1)}><ChevronLeft className="w-5 h-5" /></Button>
          <div>
            <h1 className="text-xl font-bold">Nova Verificação — {TIPOS.find(t => t.value === tipo)?.label}</h1>
            <p className="text-sm text-muted-foreground">Passo 2 de 3 — Selecione o equipamento (LC)</p>
          </div>
        </div>
        {loadingEq ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-muted rounded animate-pulse" />)}</div>
        ) : equipamentos.length === 0 ? (
          <div className="py-12 text-center border border-dashed rounded-xl">
            <p className="text-muted-foreground text-sm">
              Nenhum equipamento do tipo {TIPOS.find(t => t.value === tipo)?.label} em uso com verificação diária obrigatória.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {equipamentos.map(eq => (
              <button
                key={eq.id}
                onClick={() => { setEquipamento(eq); setStep(3); }}
                className="w-full rounded-lg border border-border hover:border-primary hover:bg-primary/5 px-4 py-3 text-left flex items-center justify-between transition-all"
              >
                <div>
                  <span className="font-mono-data text-sm font-semibold text-primary">{eq.identificacao_interna}</span>
                  <span className="ml-3 text-sm text-foreground">{eq.nome}</span>
                  {eq.categoria && <span className="ml-2 text-xs text-muted-foreground">· {eq.categoria}</span>}
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── STEP 3 ──
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setStep(tipo === 'densidade' ? 1 : 2)}><ChevronLeft className="w-5 h-5" /></Button>
          <div>
            <h1 className="text-xl font-bold">Verificação de {TIPOS.find(t => t.value === tipo)?.label}</h1>
            <p className="text-sm text-muted-foreground">
              {tipo === 'densidade'
                ? 'Passo 2 de 2 — Verificação sem LC vinculado'
                : <>Passo 3 de 3 — <span className="font-mono-data font-semibold text-primary">{equipamento?.identificacao_interna}</span> · {equipamento?.nome}</>
              }
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving || !mesAno}>
            {saving ? 'Salvando...' : 'Salvar Verificação'}
          </Button>
        </div>
      </div>

      {/* Mês e Resultado Geral */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs">Mês/Ano *</Label>
          <Input type="month" value={mesAno} onChange={e => setMesAno(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Resultado Geral</Label>
          <Select value={resultadoGeral} onValueChange={setResultadoGeral}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="em_andamento">Em andamento</SelectItem>
              <SelectItem value="aprovado">Aprovado</SelectItem>
              <SelectItem value="reprovado">Reprovado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Realizado por</Label>
          <Input value={realizadoPor} onChange={e => setRealizadoPor(e.target.value)} />
        </div>
      </div>

      {/* Equipamento de Referência */}
      <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Equipamento de Referência</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Identificação</Label>
            {tipo === 'balanca' && pesosPadrao.length > 0 ? (
              <Select value={eqRefId} onValueChange={val => {
                const eq = pesosPadrao.find(p => p.identificacao_interna === val);
                setEqRefId(val);
                setEqRefDesc(eq?.nome || '');
                setEqRefCal(eq?.data_calibracao || '');
              }}>
                <SelectTrigger className="text-xs h-9"><SelectValue placeholder="Selecione o peso padrão" /></SelectTrigger>
                <SelectContent>
                  {pesosPadrao.map(p => (
                    <SelectItem key={p.id} value={p.identificacao_interna}>{p.identificacao_interna} — {p.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : tipo === 'temperatura' && termometros.length > 0 ? (
              <Select value={eqRefId} onValueChange={val => {
                const eq = termometros.find(p => p.identificacao_interna === val);
                setEqRefId(val);
                setEqRefDesc(eq?.nome || '');
                setEqRefCal(eq?.data_calibracao || '');
              }}>
                <SelectTrigger className="text-xs h-9"><SelectValue placeholder="Selecione o termômetro" /></SelectTrigger>
                <SelectContent>
                  {termometros.map(p => (
                    <SelectItem key={p.id} value={p.identificacao_interna}>{p.identificacao_interna} — {p.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="space-y-1">
                <Input value={eqRefId} onChange={e => setEqRefId(e.target.value)} placeholder="ID do equip. referência" className="text-xs" />
                {tipo === 'balanca' && <p className="text-xs text-amber-600">Nenhum "Conjunto de Peso Padrão" encontrado.</p>}
                {tipo === 'temperatura' && <p className="text-xs text-amber-600">Nenhum termômetro encontrado nos equipamentos.</p>}
              </div>
            )}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Descrição</Label>
            <Input value={eqRefDesc} onChange={e => setEqRefDesc(e.target.value)} placeholder="Descrição" className="text-xs"
              disabled={(tipo === 'balanca' && !!eqRefId) || (tipo === 'temperatura' && !!eqRefId)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Data de Calibração</Label>
            <Input type="date" value={eqRefCal} onChange={e => setEqRefCal(e.target.value)} className="text-xs" />
          </div>
        </div>
      </div>

      {/* Campos específicos de Densidade */}
      {tipo === 'densidade' && (
        <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Solução Verificada</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Descrição da solução</Label>
              <Input value={solucaoDesc} onChange={e => setSolucaoDesc(e.target.value)} placeholder="Ex: Sulfato de Sódio" className="text-xs" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Lote</Label>
              <Input value={solucaoLote} onChange={e => setSolucaoLote(e.target.value)} placeholder="Lote" className="text-xs" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Variação permitida: Sulfato de Sódio: 1,151–1,174 · Magnésio: 1,295–1,308</p>
        </div>
      )}

      {tipo === 'balanca' && (
        <div className="rounded-lg border bg-blue-50 p-3 text-xs text-blue-800">
          <p className="font-semibold">Limites permitidos: MÍNIMO 1991,11 g — MÁXIMO 2011,72 g</p>
          <p className="mt-0.5 text-blue-600">Conjunto Peso Padrão como referência.</p>
        </div>
      )}

      {tipo === 'temperatura' && (
        <div className="rounded-lg border bg-blue-50 p-3 text-xs text-blue-800 space-y-1">
          <p className="font-semibold">Fórmula: v = |Temperatura de referência − Temperatura medida|</p>
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
                <tr key={i} className={r.situacao === 'reprovado' ? 'bg-red-50' : 'hover:bg-muted/20'}>
                  <td className="px-2 py-1 text-center font-mono-data text-muted-foreground">{r.dia}</td>
                  {tipo === 'balanca' && (
                    <td className="px-1 py-1">
                      <Input type="number" value={r.valor_medido} onChange={e => setRegBalanca(i, e.target.value)} className="h-6 text-xs px-1.5" placeholder="g" />
                    </td>
                  )}
                  {tipo === 'temperatura' && <>
                    <td className="px-1 py-1">
                      <Input type="number" value={r.valor_referencia}
                        onChange={e => setRegTemperatura(i, 'valor_referencia', e.target.value, r)}
                        className="h-6 text-xs px-1.5" placeholder="°C" />
                    </td>
                    <td className="px-1 py-1">
                      <Input type="number" value={r.valor_medido}
                        onChange={e => setRegTemperatura(i, 'valor_medido', e.target.value, r)}
                        className="h-6 text-xs px-1.5" placeholder="°C" />
                    </td>
                    <td className="px-1 py-1">
                      <Input value={r.variacao} readOnly
                        className={`h-6 text-xs px-1.5 cursor-not-allowed ${r.situacao === 'aprovado' ? 'bg-green-50 text-green-700' : r.situacao === 'reprovado' ? 'bg-red-50 text-red-700' : 'bg-slate-50 opacity-80'}`}
                        placeholder="Δ" />
                    </td>
                  </>}
                  {tipo === 'densidade' && <>
                    <td className="px-1 py-1"><Input value={r.horario} onChange={e => setReg(i, 'horario', e.target.value)} className="h-6 text-xs px-1.5" placeholder="HH:MM" /></td>
                    <td className="px-1 py-1"><Input value={r.temperatura} onChange={e => setReg(i, 'temperatura', e.target.value)} className="h-6 text-xs px-1.5" placeholder="°C" /></td>
                    <td className="px-1 py-1"><Input value={r.densidade_com_amostra} onChange={e => setReg(i, 'densidade_com_amostra', e.target.value)} className="h-6 text-xs px-1.5" placeholder="g/cm³" /></td>
                    <td className="px-1 py-1"><Input value={r.densidade_sem_amostra} onChange={e => setReg(i, 'densidade_sem_amostra', e.target.value)} className="h-6 text-xs px-1.5" placeholder="g/cm³" /></td>
                  </>}
                  <td className="px-1 py-1 text-center">
                    {(tipo === 'balanca' || tipo === 'temperatura') ? (
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${r.situacao === 'aprovado' ? 'bg-green-100 text-green-700' : r.situacao === 'reprovado' ? 'bg-red-100 text-red-700' : 'text-muted-foreground'}`}>
                        {r.situacao === 'aprovado' ? 'Aprovado' : r.situacao === 'reprovado' ? 'Reprovado' : '—'}
                      </span>
                    ) : (
                      <Select value={r.situacao} onValueChange={v => setReg(i, 'situacao', v)}>
                        <SelectTrigger className="h-6 text-xs px-1.5 w-28"><SelectValue placeholder="—" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="aprovado">Aprovado</SelectItem>
                          <SelectItem value="reprovado">Reprovado</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </td>
                  <td className="px-1 py-1">
                    <RubricaButton
                      nome={r.responsavel || user?.full_name || ''}
                      rubricaUrl={r.rubrica_url}
                      responsavel={r.responsavel}
                      disabled={tipo === 'balanca' ? !r.valor_medido : tipo === 'temperatura' ? !r.valor_medido : false}
                      onConfirm={dataUrl => confirmarRubrica(i, dataUrl)}
                    />
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
        <Textarea value={outrasInfo} onChange={e => setOutrasInfo(e.target.value)} className="h-20 text-xs" />
      </div>

      <div className="flex justify-end gap-2 pb-6">
        <Button variant="outline" onClick={onBack}>Cancelar</Button>
        <Button onClick={handleSave} disabled={saving || !mesAno}>
          {saving ? 'Salvando...' : 'Salvar Verificação'}
        </Button>
      </div>
    </div>
  );
}