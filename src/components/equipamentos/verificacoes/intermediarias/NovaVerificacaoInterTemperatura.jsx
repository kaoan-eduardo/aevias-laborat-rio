import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { currentMonthSP } from '@/lib/dateUtils';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AnaliseCritica from '../AnaliseCritica';
import EquipamentoSelectorStep from './EquipamentoSelectorStep';
import EqReferenciaSection from './EqReferenciaSection';
import { podeAnaliseCritica } from '@/business-rules/acessos';
import {
  buildRegistrosTemperaturaIntermediaria,
  calcularVariacaoTemperaturaIntermediaria,
  avaliarSituacaoTemperaturaIntermediaria,
  TEMPERATURA_INTERMEDIARIA_LIMITE_PCT,
} from '@/business-rules/verificacoesIntermediarias.js';
import { listarEquipamentosParaVerificacaoIntermediaria, listarTermometrosIntermediario } from '@/services/equipamentosIntermediarioService';

const SIT_BADGE = s => s === 'aprovado'
  ? 'bg-green-100 text-green-700'
  : s === 'reprovado'
  ? 'bg-red-100 text-red-700'
  : 'text-muted-foreground';

function TabelaTemperatura({ titulo, linhas, onChange, disabled }) {
  return (
    <section className="rounded-lg border border-border overflow-hidden">
      <div className="bg-muted/50 px-4 py-2 text-xs font-semibold uppercase tracking-wide">{titulo}</div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-muted/30">
            <tr>
              <th className="px-3 py-2 text-left font-semibold w-28">Data</th>
              <th className="px-3 py-2 text-left font-semibold w-20">T1/T2</th>
              <th className="px-3 py-2 text-left font-semibold">Temperatura (°C)</th>
              <th className="px-3 py-2 text-left font-semibold">Variação (%)</th>
              <th className="px-3 py-2 text-center font-semibold">Situação</th>
              <th className="px-3 py-2 text-left font-semibold">Responsável</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {linhas.map((linha, i) => (
              <tr key={i} className={linha.situacao === 'reprovado' ? 'bg-red-50' : 'hover:bg-muted/20'}>
                <td className="px-2 py-1.5">
                  <Input type="date" value={linha.data} onChange={e => onChange(i, 'data', e.target.value)} disabled={disabled} className="h-7 text-xs" />
                </td>
                <td className="px-2 py-1.5">
                  <Input value={linha.t1_t2} onChange={e => onChange(i, 't1_t2', e.target.value)} disabled={disabled} className="h-7 text-xs" placeholder="T1/T2" />
                </td>
                <td className="px-2 py-1.5">
                  <Input type="number" value={linha.temperatura_celsius} onChange={e => onChange(i, 'temperatura_celsius', e.target.value)} disabled={disabled} className="h-7 text-xs" placeholder="°C" />
                </td>
                <td className="px-2 py-1.5 text-center">
                  <span className={`font-mono-data ${SIT_BADGE(linha.situacao)}`}>
                    {linha.variacao_pct !== '' ? `${linha.variacao_pct}%` : '—'}
                  </span>
                </td>
                <td className="px-2 py-1.5 text-center">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${SIT_BADGE(linha.situacao)}`}>
                    {linha.situacao === 'aprovado' ? 'Aprovado' : linha.situacao === 'reprovado' ? 'Reprovado' : '—'}
                  </span>
                </td>
                <td className="px-2 py-1.5">
                  <Input value={linha.responsavel} onChange={e => onChange(i, 'responsavel', e.target.value)} disabled={disabled} className="h-7 text-xs" placeholder="Nome" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function NovaVerificacaoInterTemperatura({ onBack, onSaved }) {
  const { user } = useAuth();
  const canAnaliseCritica = podeAnaliseCritica(user);
  const [step, setStep] = useState(1);
  const [equipamentos, setEquipamentos] = useState([]);
  const [loadingEq, setLoadingEq] = useState(true);
  const [equipamento, setEquipamento] = useState(null);

  const [mesAno, setMesAno] = useState('');
  const [eqRefId, setEqRefId] = useState('');
  const [eqRefDesc, setEqRefDesc] = useState('');
  const [eqRefCal, setEqRefCal] = useState('');
  const [termometros, setTermometros] = useState([]);
  const [dados, setDados] = useState(buildRegistrosTemperaturaIntermediaria());
  const [outrasInfoGeral, setOutrasInfoGeral] = useState('');
  const [resultadoGeral, setResultadoGeral] = useState('em_andamento');
  const [acResponsavel, setAcResponsavel] = useState('');
  const [acData, setAcData] = useState('');
  const [acRubricaUrl, setAcRubricaUrl] = useState('');
  const [erros, setErros] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    listarEquipamentosParaVerificacaoIntermediaria('temperatura')
      .then(data => { setEquipamentos(data); setLoadingEq(false); });
  }, []);

  useEffect(() => {
    if (!equipamento) return;
    setMesAno(currentMonthSP());
    setDados(buildRegistrosTemperaturaIntermediaria());
    listarTermometrosIntermediario().then(terms => {
      setTermometros(terms);
      if (terms.length === 1) {
        setEqRefId(terms[0].identificacao_interna || '');
        setEqRefDesc(terms[0].nome || '');
        setEqRefCal(terms[0].data_calibracao || '');
      }
    });
  }, [equipamento]);

  const updateLinha = (secao, idx, field, value) => {
    setDados(prev => {
      const linhas = [...prev[secao]];
      const updated = { ...linhas[idx], [field]: value };

      if (field === 'temperatura_celsius') {
        // Calcula variação usando a temperatura de referência do equipamento de referência
        // campo eqRefTemp não disponível aqui — usamos a fórmula com T1 se preenchido
        // Na planilha, a variação é calculada quando se tem temp padrão e temp equipamento
        // Aqui a coluna "Temperatura" É a temperatura medida no equipamento
        // A variação será preenchida manualmente ou calculada quando o user digitar o valor de referência
      }

      // Calcula variação se t1_t2 e temperatura_celsius estiverem preenchidos
      if ((field === 'temperatura_celsius' || field === 't1_t2') && updated.t1_t2 && updated.temperatura_celsius) {
        const variacao = calcularVariacaoTemperaturaIntermediaria(updated.t1_t2, updated.temperatura_celsius);
        updated.variacao_pct = variacao;
        updated.situacao = avaliarSituacaoTemperaturaIntermediaria(variacao);
      }

      linhas[idx] = updated;
      return { ...prev, [secao]: linhas };
    });
  };

  const handleSave = async () => {
    const novosErros = {};
    if (!mesAno) novosErros.mesAno = true;
    if (!eqRefId) novosErros.eqRefId = true;
    if (!eqRefCal) novosErros.eqRefCal = true;
    if (Object.keys(novosErros).length > 0) { setErros(novosErros); return; }
    setErros({});
    setSaving(true);
    await base44.entities.VerificacaoIntermediaria.create({
      equipamento_id: equipamento.id,
      equipamento_identificacao: equipamento.identificacao_interna,
      equipamento_nome: equipamento.nome,
      tipo: 'temperatura',
      mes_ano: mesAno,
      eq_referencia_identificacao: eqRefId,
      eq_referencia_descricao: eqRefDesc,
      eq_referencia_data_calibracao: eqRefCal,
      registros: [...dados.checagem_principal, ...dados.outras_checagens],
      outras_informacoes: outrasInfoGeral,
      resultado_geral: resultadoGeral,
      analise_critica_responsavel: acResponsavel,
      analise_critica_data: acData,
      analise_critica_rubrica_url: acRubricaUrl,
    });
    setSaving(false);
    onSaved();
  };

  if (step === 1) return (
    <EquipamentoSelectorStep
      titulo="Nova Verificação Intermediária — Temperatura"
      subtitulo="Passo 1 de 2 — Selecione o equipamento"
      equipamentos={equipamentos}
      isLoading={loadingEq}
      emptyMessage="Nenhum equipamento de temperatura com verificação intermediária obrigatória."
      onBack={onBack}
      onSelect={eq => { setEquipamento(eq); setStep(2); }}
    />
  );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setStep(1)}><ChevronLeft className="w-5 h-5" /></Button>
          <div>
            <h1 className="text-xl font-bold">Checagem Intermediária — Temperatura</h1>
            <p className="text-sm text-muted-foreground">
              <span className="font-mono-data font-semibold text-primary">{equipamento?.identificacao_interna}</span> · {equipamento?.nome}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button>
        </div>
      </div>

      {Object.keys(erros).length > 0 && (
        <p className="text-sm text-destructive font-medium">Preencha todos os campos obrigatórios (*) antes de salvar.</p>
      )}

      <div className="grid grid-cols-2 gap-4 max-w-sm">
        <div className="space-y-1.5">
          <Label className="text-xs">Mês/Ano *</Label>
          <Input type="month" value={mesAno} onChange={e => { setMesAno(e.target.value); setErros(p => ({...p, mesAno: false})); }} className={erros.mesAno ? 'border-destructive' : ''} />
        </div>
      </div>

      <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Equipamento Verificado</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Descrição</Label>
            <Input value={equipamento?.nome || ''} disabled className="text-xs mt-1.5" />
          </div>
          <div>
            <Label className="text-xs">Identificação</Label>
            <Input value={equipamento?.identificacao_interna || ''} disabled className="text-xs mt-1.5" />
          </div>
        </div>
      </div>

      <EqReferenciaSection
        eqRefId={eqRefId} eqRefDesc={eqRefDesc} eqRefCal={eqRefCal}
        opcoes={termometros} placeholderSelect="Selecione o termômetro"
        erros={erros}
        onIdChange={val => {
          const t = termometros.find(x => x.identificacao_interna === val);
          setEqRefId(val); setEqRefDesc(t?.nome || ''); setEqRefCal(t?.data_calibracao || '');
          setErros(p => ({...p, eqRefId: false}));
        }}
        onDescChange={setEqRefDesc}
        onCalChange={val => { setEqRefCal(val); setErros(p => ({...p, eqRefCal: false})); }}
      />

      <div className="rounded-lg border bg-blue-50 p-3 text-xs text-blue-800">
        <p className="font-semibold">Variação Permitida: Termômetros ≤ {TEMPERATURA_INTERMEDIARIA_LIMITE_PCT}% · Estufas ≤ {TEMPERATURA_INTERMEDIARIA_LIMITE_PCT}% · Banhos Maria ≤ {TEMPERATURA_INTERMEDIARIA_LIMITE_PCT}%</p>
        <p className="mt-0.5 text-blue-600">V = (Temperatura do padrão − Temperatura do equipamento) / Temperatura do padrão × 100</p>
      </div>

      <TabelaTemperatura
        titulo="Checagem Intermediária"
        linhas={dados.checagem_principal}
        onChange={(i, f, v) => updateLinha('checagem_principal', i, f, v)}
      />

      <AnaliseCritica
        resultadoGeral={dados.analise_critica_principal.resultado}
        onResultadoChange={v => setDados(p => ({ ...p, analise_critica_principal: { ...p.analise_critica_principal, resultado: v } }))}
        responsavel={dados.analise_critica_principal.responsavel}
        onResponsavelChange={v => setDados(p => ({ ...p, analise_critica_principal: { ...p.analise_critica_principal, responsavel: v } }))}
        data={dados.analise_critica_principal.data}
        onDataChange={v => setDados(p => ({ ...p, analise_critica_principal: { ...p.analise_critica_principal, data: v } }))}
        rubricaUrl="" onRubricaConfirm={() => {}}
        nomeUsuario={user?.nome_exibicao || user?.full_name || ''}
        disabled={!canAnaliseCritica}
      />

      <TabelaTemperatura
        titulo="Outras Checagens"
        linhas={dados.outras_checagens}
        onChange={(i, f, v) => updateLinha('outras_checagens', i, f, v)}
      />

      <AnaliseCritica
        resultadoGeral={resultadoGeral} onResultadoChange={setResultadoGeral}
        responsavel={acResponsavel} onResponsavelChange={setAcResponsavel}
        data={acData} onDataChange={setAcData}
        rubricaUrl={acRubricaUrl} onRubricaConfirm={setAcRubricaUrl}
        nomeUsuario={user?.nome_exibicao || user?.full_name || ''}
        disabled={!canAnaliseCritica}
      />

      <div className="space-y-1.5 max-w-lg">
        <Label className="text-xs">Outras Informações</Label>
        <Textarea value={outrasInfoGeral} onChange={e => setOutrasInfoGeral(e.target.value)} className="h-20 text-xs" />
      </div>

      <div className="flex justify-end gap-2 pb-6">
        <Button variant="outline" onClick={onBack}>Cancelar</Button>
        <Button onClick={handleSave} disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button>
      </div>
    </div>
  );
}