import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { currentMonthSP } from '@/lib/dateUtils';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import RubricaButton from './RubricaButton';
import AnaliseCritica from './AnaliseCritica';
import { avaliarSituacaoTemperatura, buildRegistros } from '@/business-rules/verificacoes';
import { listarEquipamentosParaVerificacao, listarTermometros } from '@/services/equipamentosService';

export default function NovaVerificacaoTemperatura({ onBack, onSaved }) {
  const { user } = useAuth();
  const [step, setStep] = useState(1); // 1 = selecionar equipamento, 2 = preencher
  const [equipamentos, setEquipamentos] = useState([]);
  const [loadingEq, setLoadingEq] = useState(false);
  const [equipamento, setEquipamento] = useState(null);

  const [mesAno, setMesAno] = useState('');
  const [outrasInfo, setOutrasInfo] = useState('');
  const [resultadoGeral, setResultadoGeral] = useState('em_andamento');
  const [eqRefId, setEqRefId] = useState('');
  const [eqRefDesc, setEqRefDesc] = useState('');
  const [eqRefCal, setEqRefCal] = useState('');
  const [termometros, setTermometros] = useState([]);
  const [registros, setRegistros] = useState(buildRegistros());
  const [acResponsavel, setAcResponsavel] = useState('');
  const [acData, setAcData] = useState('');
  const [acRubricaUrl, setAcRubricaUrl] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoadingEq(true);
    listarEquipamentosParaVerificacao('temperatura').
    then((data) => {setEquipamentos(data);setLoadingEq(false);});
  }, []);

  useEffect(() => {
    if (!equipamento) return;
    setMesAno(currentMonthSP());
    setRegistros(buildRegistros());
    setEqRefId('');
    setEqRefDesc('');
    setEqRefCal('');
    listarTermometros().then((terms) => {
      setTermometros(terms);
      if (terms.length === 1) {
        setEqRefId(terms[0].identificacao_interna || '');
        setEqRefDesc(terms[0].nome || '');
        setEqRefCal(terms[0].data_calibracao || '');
      }
    });
  }, [equipamento]);

  const diasNoMes = mesAno ?
  new Date(Number(mesAno.split('-')[0]), Number(mesAno.split('-')[1]), 0).getDate() :
  31;

  const setRegTemperatura = (idx, field, value, currentReg) => {
    const ref = field === 'valor_referencia' ? value : currentReg.valor_referencia;
    const medido = field === 'valor_medido' ? value : currentReg.valor_medido;
    const variacao = ref !== '' && medido !== '' ?
    Math.abs(parseFloat(ref) - parseFloat(medido)).toFixed(2) :
    '';
    const situacao = avaliarSituacaoTemperatura(ref, variacao);
    setRegistros((prev) => prev.map((r, i) =>
    i === idx ? { ...r, [field]: value, variacao, situacao } : r
    ));
  };

  const confirmarRubrica = (idx, dataUrl) => {
    setRegistros((prev) => prev.map((r, i) =>
    i === idx ?
    { ...r, responsavel: r.responsavel || user?.nome_exibicao || user?.full_name || '', rubrica_url: dataUrl } :
    r
    ));
  };

  const handleSave = async () => {
    if (!mesAno || !equipamento) return;
    setSaving(true);
    await base44.entities.VerificacaoDiaria.create({
      equipamento_id: equipamento.id,
      equipamento_identificacao: equipamento.identificacao_interna,
      equipamento_nome: equipamento.nome,
      tipo: 'temperatura',
      mes_ano: mesAno,
      outras_informacoes: outrasInfo,
      resultado_geral: resultadoGeral,
      eq_referencia_identificacao: eqRefId,
      eq_referencia_descricao: eqRefDesc,
      eq_referencia_data_calibracao: eqRefCal,
      registros,
      analise_critica_responsavel: acResponsavel,
      analise_critica_data: acData,
      analise_critica_rubrica_url: acRubricaUrl
    });
    setSaving(false);
    onSaved();
  };

  // ── Step 1: Selecionar equipamento ──
  if (step === 1) {
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}><ChevronLeft className="w-5 h-5" /></Button>
          <div>
            <h1 className="text-xl font-bold">Nova Verificação — Temperatura</h1>
            <p className="text-sm text-muted-foreground">Passo 1 de 2 — Selecione o equipamento (LC)</p>
          </div>
        </div>
        {loadingEq ?
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-16 bg-muted rounded animate-pulse" />)}</div> :
        equipamentos.length === 0 ?
        <div className="py-12 text-center border border-dashed rounded-xl">
            <p className="text-muted-foreground text-sm">Nenhum equipamento de temperatura em uso com verificação diária obrigatória.</p>
          </div> :

        <div className="space-y-2">
            {equipamentos.map((eq) =>
          <button
            key={eq.id}
            onClick={() => {setEquipamento(eq);setStep(2);}}
            className="w-full rounded-lg border border-border hover:border-primary hover:bg-primary/5 px-4 py-3 text-left flex items-center justify-between transition-all">
            
                <div>
                  <span className="font-mono-data text-sm font-semibold text-primary">{eq.identificacao_interna}</span>
                  <span className="ml-3 text-sm text-foreground">{eq.nome}</span>
                  {eq.categoria && <span className="ml-2 text-xs text-muted-foreground">· {eq.categoria}</span>}
                </div>
                <ChevronLeft className="w-4 h-4 text-muted-foreground rotate-180" />
              </button>
          )}
          </div>
        }
      </div>);

  }

  // ── Step 2: Preencher verificação ──
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setStep(1)}><ChevronLeft className="w-5 h-5" /></Button>
          <div>
            <h1 className="text-xl font-bold">Verificação de Temperatura</h1>
            <p className="text-sm text-muted-foreground">
              Passo 2 de 2 — <span className="font-mono-data font-semibold text-primary">{equipamento?.identificacao_interna}</span> · {equipamento?.nome}
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

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs">Mês/Ano *</Label>
          <Input type="month" value={mesAno} onChange={(e) => setMesAno(e.target.value)} />
        </div>
        









        
      </div>

      <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Equipamento de Referência</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Identificação</Label>
            {termometros.length > 0 ?
            <Select value={eqRefId} onValueChange={(val) => {
              const eq = termometros.find((p) => p.identificacao_interna === val);
              setEqRefId(val);
              setEqRefDesc(eq?.nome || '');
              setEqRefCal(eq?.data_calibracao || '');
            }}>
                <SelectTrigger className="text-xs h-9"><SelectValue placeholder="Selecione o termômetro" /></SelectTrigger>
                <SelectContent>
                  {termometros.map((p) =>
                <SelectItem key={p.id} value={p.identificacao_interna}>{p.identificacao_interna} — {p.nome}</SelectItem>
                )}
                </SelectContent>
              </Select> :

            <div className="space-y-1">
                <Input value={eqRefId} onChange={(e) => setEqRefId(e.target.value)} placeholder="ID do equip. referência" className="text-xs" />
                <p className="text-xs text-amber-600">Nenhum termômetro encontrado nos equipamentos.</p>
              </div>
            }
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Descrição</Label>
            <Input value={eqRefDesc} onChange={(e) => setEqRefDesc(e.target.value)} className="text-xs" disabled={!!eqRefId} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Data de Calibração</Label>
            <Input type="date" value={eqRefCal} onChange={(e) => setEqRefCal(e.target.value)} className="text-xs" />
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-blue-50 p-3 text-xs text-blue-800 space-y-1">
        <p className="font-semibold">Fórmula: v = |Temperatura de referência − Temperatura medida|</p>
        <p>Limites: −18°C=|3,0| · 25°C=|0,5| · 40–60°C=|2,0| · 60–80°C=|3,0| · 80–100°C=|4,0| · 100–120°C=|5,0| · 120–140°C=|6,0| · 140–160°C=|7,0| · 160–180°C=|8,0|</p>
      </div>

      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Checagem Diária</p>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-2 py-2 text-center font-semibold w-10">Dia</th>
                <th className="px-2 py-2 text-left font-semibold">Temp. Referência (°C)</th>
                <th className="px-2 py-2 text-left font-semibold">Temp. Medida (°C)</th>
                <th className="px-2 py-2 text-left font-semibold">Variação (°C)</th>
                <th className="px-2 py-2 text-center font-semibold">Situação</th>
                <th className="px-2 py-2 text-left font-semibold">Responsável</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {registros.slice(0, diasNoMes).map((r, i) =>
              <tr key={i} className={r.situacao === 'reprovado' ? 'bg-red-50' : 'hover:bg-muted/20'}>
                  <td className="px-2 py-1 text-center font-mono-data text-muted-foreground">{r.dia}</td>
                  <td className="px-1 py-1">
                    <Input type="number" value={r.valor_referencia}
                  onChange={(e) => setRegTemperatura(i, 'valor_referencia', e.target.value, r)}
                  className="h-6 text-xs px-1.5" placeholder="°C" />
                  </td>
                  <td className="px-1 py-1">
                    <Input type="number" value={r.valor_medido}
                  onChange={(e) => setRegTemperatura(i, 'valor_medido', e.target.value, r)}
                  className="h-6 text-xs px-1.5" placeholder="°C" />
                  </td>
                  <td className="px-1 py-1">
                    <Input value={r.variacao} readOnly
                  className={`h-6 text-xs px-1.5 cursor-not-allowed ${r.situacao === 'aprovado' ? 'bg-green-50 text-green-700' : r.situacao === 'reprovado' ? 'bg-red-50 text-red-700' : 'bg-slate-50 opacity-80'}`}
                  placeholder="Δ" />
                  </td>
                  <td className="px-1 py-1 text-center">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${r.situacao === 'aprovado' ? 'bg-green-100 text-green-700' : r.situacao === 'reprovado' ? 'bg-red-100 text-red-700' : 'text-muted-foreground'}`}>
                      {r.situacao === 'aprovado' ? 'Aprovado' : r.situacao === 'reprovado' ? 'Reprovado' : '—'}
                    </span>
                  </td>
                  <td className="px-1 py-1">
                    <RubricaButton
                    nome={r.responsavel || user?.nome_exibicao || user?.full_name || ''}
                    rubricaUrl={r.rubrica_url}
                    responsavel={r.responsavel}
                    disabled={!r.valor_medido}
                    onConfirm={(dataUrl) => confirmarRubrica(i, dataUrl)} />
                  
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-1.5 max-w-lg">
        <Label className="text-xs">Outras Informações</Label>
        <Textarea value={outrasInfo} onChange={(e) => setOutrasInfo(e.target.value)} className="h-20 text-xs" />
      </div>

      <AnaliseCritica
        resultadoGeral={resultadoGeral}
        onResultadoChange={setResultadoGeral}
        responsavel={acResponsavel}
        onResponsavelChange={setAcResponsavel}
        data={acData}
        onDataChange={setAcData}
        rubricaUrl={acRubricaUrl}
        onRubricaConfirm={setAcRubricaUrl}
        nomeUsuario={user?.nome_exibicao || user?.full_name || ''} />
      

      <div className="flex justify-end gap-2 pb-6">
        <Button variant="outline" onClick={onBack}>Cancelar</Button>
        <Button onClick={handleSave} disabled={saving || !mesAno}>
          {saving ? 'Salvando...' : 'Salvar Verificação'}
        </Button>
      </div>
    </div>);

}