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
import { avaliarSituacaoBalanca, buildRegistros } from '@/business-rules/verificacoes';
import { listarEquipamentosParaVerificacao, listarPesosPadrao } from '@/services/equipamentosService';

export default function NovaVerificacaoBalanca({ onBack, onSaved }) {
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
  const [pesosPadrao, setPesosPadrao] = useState([]);
  const [registros, setRegistros] = useState(buildRegistros());
  const [acResponsavel, setAcResponsavel] = useState('');
  const [acData, setAcData] = useState('');
  const [acRubricaUrl, setAcRubricaUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [erros, setErros] = useState({});

  useEffect(() => {
    setLoadingEq(true);
    listarEquipamentosParaVerificacao('balanca').
    then((data) => {setEquipamentos(data);setLoadingEq(false);});
  }, []);

  useEffect(() => {
    if (!equipamento) return;
    setMesAno(currentMonthSP());
    setRegistros(buildRegistros());
    setEqRefId('');
    setEqRefDesc('');
    setEqRefCal('');
    listarPesosPadrao().then((pesos) => {
      setPesosPadrao(pesos);
      if (pesos.length === 1) {
        setEqRefId(pesos[0].identificacao_interna || '');
        setEqRefDesc(pesos[0].nome || '');
        setEqRefCal(pesos[0].data_calibracao || '');
      }
    });
  }, [equipamento]);

  const diasNoMes = mesAno ?
  new Date(Number(mesAno.split('-')[0]), Number(mesAno.split('-')[1]), 0).getDate() :
  31;

  const setRegBalanca = (idx, valor) => {
    const situacao = avaliarSituacaoBalanca(valor);
    setRegistros((prev) => prev.map((r, i) =>
    i === idx ? { ...r, valor_medido: valor, situacao } : r
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
    const novosErros = {};
    if (!mesAno) novosErros.mesAno = true;
    if (!eqRefId) novosErros.eqRefId = true;
    if (!eqRefCal) novosErros.eqRefCal = true;
    if (Object.keys(novosErros).length > 0) {setErros(novosErros);return;}
    setErros({});
    setSaving(true);
    await base44.entities.VerificacaoDiaria.create({
      equipamento_id: equipamento.id,
      equipamento_identificacao: equipamento.identificacao_interna,
      equipamento_nome: equipamento.nome,
      tipo: 'balanca',
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
            <h1 className="text-xl font-bold">Nova Verificação — Balança</h1>
            <p className="text-sm text-muted-foreground">Passo 1 de 2 — Selecione o equipamento (LC)</p>
          </div>
        </div>
        {loadingEq ?
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-16 bg-muted rounded animate-pulse" />)}</div> :
        equipamentos.length === 0 ?
        <div className="py-12 text-center border border-dashed rounded-xl">
            <p className="text-muted-foreground text-sm">Nenhuma balança em uso com verificação diária obrigatória.</p>
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
            <h1 className="text-xl font-bold">Verificação de Balança</h1>
            <p className="text-sm text-muted-foreground">
              Passo 2 de 2 — <span className="font-mono-data font-semibold text-primary">{equipamento?.identificacao_interna}</span> · {equipamento?.nome}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar Verificação'}
          </Button>
        </div>
      </div>

      {Object.keys(erros).length > 0 &&
      <p className="text-sm text-destructive font-medium">Preencha todos os campos obrigatórios (*) antes de salvar.</p>
      }

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs">Mês/Ano *</Label>
          <Input type="month" value={mesAno} onChange={(e) => {setMesAno(e.target.value);setErros((p) => ({ ...p, mesAno: false }));}} className={erros.mesAno ? 'border-destructive' : ''} />
        </div>
        









        
      </div>

      <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Equipamento de Referência</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Identificação *</Label>
            {pesosPadrao.length > 0 ?
            <Select value={eqRefId} onValueChange={(val) => {
              const eq = pesosPadrao.find((p) => p.identificacao_interna === val);
              setEqRefId(val);
              setEqRefDesc(eq?.nome || '');
              setEqRefCal(eq?.data_calibracao || '');
              setErros((p) => ({ ...p, eqRefId: false }));
            }}>
                <SelectTrigger className={`text-xs h-9 ${erros.eqRefId ? 'border-destructive' : ''}`}><SelectValue placeholder="Selecione o peso padrão" /></SelectTrigger>
                <SelectContent>
                  {pesosPadrao.map((p) =>
                <SelectItem key={p.id} value={p.identificacao_interna}>{p.identificacao_interna} — {p.nome}</SelectItem>
                )}
                </SelectContent>
              </Select> :

            <div className="space-y-1">
                <Input value={eqRefId} onChange={(e) => {setEqRefId(e.target.value);setErros((p) => ({ ...p, eqRefId: false }));}} placeholder="ID do equip. referência" className={`text-xs ${erros.eqRefId ? 'border-destructive' : ''}`} />
                <p className="text-xs text-amber-600">Nenhum "Conjunto de Peso Padrão" encontrado.</p>
              </div>
            }
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Descrição</Label>
            <Input value={eqRefDesc} onChange={(e) => setEqRefDesc(e.target.value)} className="text-xs" disabled={!!eqRefId} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Data de Calibração *</Label>
            <Input type="date" value={eqRefCal} onChange={(e) => {setEqRefCal(e.target.value);setErros((p) => ({ ...p, eqRefCal: false }));}} className={`text-xs ${erros.eqRefCal ? 'border-destructive' : ''}`} />
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-blue-50 p-3 text-xs text-blue-800">
        <p className="font-semibold">Limites permitidos: MÍNIMO 1991,11 g — MÁXIMO 2011,72 g</p>
        <p className="mt-0.5 text-blue-600">Conjunto Peso Padrão como referência.</p>
      </div>

      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Checagem Diária</p>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-2 py-2 text-center font-semibold w-10">Dia</th>
                <th className="px-2 py-2 text-left font-semibold">Resultado (g)</th>
                <th className="px-2 py-2 text-center font-semibold">Situação</th>
                <th className="px-2 py-2 text-left font-semibold">Responsável</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {registros.slice(0, diasNoMes).map((r, i) =>
              <tr key={i} className={r.situacao === 'reprovado' ? 'bg-red-50' : 'hover:bg-muted/20'}>
                  <td className="px-2 py-1 text-center font-mono-data text-muted-foreground">{r.dia}</td>
                  <td className="px-1 py-1">
                    <Input type="number" value={r.valor_medido} onChange={(e) => setRegBalanca(i, e.target.value)} className="h-6 text-xs px-1.5" placeholder="g" />
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
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar Verificação'}
        </Button>
      </div>
    </div>);

}