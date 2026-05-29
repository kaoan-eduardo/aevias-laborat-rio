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
  buildRegistrosPaquimetroIntermediario,
  calcularVariacaoPaquimetro,
  avaliarSituacaoPaquimetro,
  PAQUIMETRO_LIMITE_PCT,
} from '@/business-rules/verificacoesIntermediarias.js';
import { listarEquipamentosParaVerificacaoIntermediaria } from '@/services/equipamentosIntermediarioService';

const SIT_BADGE = s => s === 'aprovado'
  ? 'bg-green-100 text-green-700'
  : s === 'reprovado'
  ? 'bg-red-100 text-red-700'
  : 'text-muted-foreground';

export default function NovaVerificacaoInterPaquimetro({ onBack, onSaved }) {
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
  const [blocos, setBlocos] = useState(buildRegistrosPaquimetroIntermediario());
  const [outrasInfo, setOutrasInfo] = useState('');
  const [resultadoGeral, setResultadoGeral] = useState('em_andamento');
  const [acResponsavel, setAcResponsavel] = useState('');
  const [acData, setAcData] = useState('');
  const [acRubricaUrl, setAcRubricaUrl] = useState('');
  const [erros, setErros] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    listarEquipamentosParaVerificacaoIntermediaria('paquimetro')
      .then(data => { setEquipamentos(data); setLoadingEq(false); });
  }, []);

  useEffect(() => {
    if (!equipamento) return;
    setMesAno(currentMonthSP());
    setBlocos(buildRegistrosPaquimetroIntermediario());
  }, [equipamento]);

  const updateBloco = (blocoIdx, field, value) => {
    setBlocos(prev => prev.map((b, i) => {
      if (i !== blocoIdx) return b;
      const updated = { ...b, [field]: value };
      if (field === 'valor_referencia_mm' || field === 'resultado_obtido') {
        const ref = field === 'valor_referencia_mm' ? value : b.valor_referencia_mm;
        const res = field === 'resultado_obtido' ? value : b.resultado_obtido;
        const variacao = calcularVariacaoPaquimetro(ref, res);
        updated.variacao_pct = variacao;
        updated.situacao = avaliarSituacaoPaquimetro(variacao);
      }
      return updated;
    }));
  };

  const updateLeitura = (blocoIdx, leituraIdx, field, value) => {
    setBlocos(prev => prev.map((b, i) => {
      if (i !== blocoIdx) return b;
      const leituras = b.leituras.map((l, li) => li === leituraIdx ? { ...l, [field]: value } : l);
      return { ...b, leituras };
    }));
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
      tipo: 'paquimetro',
      mes_ano: mesAno,
      eq_referencia_identificacao: eqRefId,
      eq_referencia_descricao: eqRefDesc,
      eq_referencia_data_calibracao: eqRefCal,
      registros: blocos,
      outras_informacoes: outrasInfo,
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
      titulo="Nova Verificação Intermediária — Paquímetro"
      subtitulo="Passo 1 de 2 — Selecione o paquímetro"
      equipamentos={equipamentos}
      isLoading={loadingEq}
      emptyMessage="Nenhum paquímetro em uso com verificação intermediária obrigatória."
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
            <h1 className="text-xl font-bold">Checagem Intermediária — Paquímetro</h1>
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
        opcoes={[]} placeholderSelect=""
        erros={erros}
        onIdChange={val => { setEqRefId(val); setErros(p => ({...p, eqRefId: false})); }}
        onDescChange={setEqRefDesc}
        onCalChange={val => { setEqRefCal(val); setErros(p => ({...p, eqRefCal: false})); }}
      />

      <div className="rounded-lg border bg-blue-50 p-3 text-xs text-blue-800">
        <p className="font-semibold">Variação permitida: ≤ {PAQUIMETRO_LIMITE_PCT}%</p>
        <p className="mt-0.5 text-blue-600">V = (Valor de referência − Resultado obtido) / Valor de referência × 100</p>
      </div>

      <div className="space-y-4">
        {blocos.map((bloco, blocoIdx) => (
          <section key={bloco.bloco} className="rounded-lg border border-border overflow-hidden">
            <div className="bg-muted/50 px-4 py-2 text-xs font-semibold uppercase tracking-wide flex items-center justify-between">
              <span>Checagem Intermediária — Bloco {bloco.bloco} · Variação permitida: {PAQUIMETRO_LIMITE_PCT}%</span>
              {bloco.situacao && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${SIT_BADGE(bloco.situacao)}`}>
                  {bloco.situacao === 'aprovado' ? 'Aprovado' : 'Reprovado'}
                </span>
              )}
            </div>
            <div className="p-4 grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Valor de referência (mm)</Label>
                <Input
                  type="number" value={bloco.valor_referencia_mm}
                  onChange={e => updateBloco(blocoIdx, 'valor_referencia_mm', e.target.value)}
                  className="text-xs" placeholder="mm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Resultado obtido</Label>
                <Input
                  type="number" value={bloco.resultado_obtido}
                  onChange={e => updateBloco(blocoIdx, 'resultado_obtido', e.target.value)}
                  className="text-xs" placeholder="mm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Variação (%)</Label>
                <Input
                  value={bloco.variacao_pct !== '' ? `${bloco.variacao_pct}%` : ''}
                  readOnly disabled
                  className={`text-xs cursor-not-allowed ${bloco.situacao === 'aprovado' ? 'bg-green-50 text-green-700' : bloco.situacao === 'reprovado' ? 'bg-red-50 text-red-700' : ''}`}
                  placeholder="—"
                />
              </div>
            </div>
            <div className="border-t border-border">
              <table className="w-full text-xs">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="px-3 py-1.5 text-left font-semibold">#</th>
                    <th className="px-3 py-1.5 text-center font-semibold">Situação</th>
                    <th className="px-3 py-1.5 text-left font-semibold">Responsável</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {bloco.leituras.map((l, li) => (
                    <tr key={li}>
                      <td className="px-3 py-1.5 text-muted-foreground">{l.numero}</td>
                      <td className="px-3 py-1.5 text-center">
                        <div className="flex items-center justify-center gap-3 text-xs">
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input type="radio" name={`sit-${blocoIdx}-${li}`} checked={l.situacao === 'aprovado'} onChange={() => updateLeitura(blocoIdx, li, 'situacao', 'aprovado')} />
                            Aprovado
                          </label>
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input type="radio" name={`sit-${blocoIdx}-${li}`} checked={l.situacao === 'reprovado'} onChange={() => updateLeitura(blocoIdx, li, 'situacao', 'reprovado')} />
                            Reprovado
                          </label>
                        </div>
                      </td>
                      <td className="px-2 py-1.5">
                        <Input value={l.responsavel} onChange={e => updateLeitura(blocoIdx, li, 'responsavel', e.target.value)} className="h-7 text-xs" placeholder="Nome" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-3 border-t border-border">
              <Label className="text-xs">Outras Informações</Label>
              <Textarea value={bloco.outras_informacoes} onChange={e => updateBloco(blocoIdx, 'outras_informacoes', e.target.value)} className="h-16 text-xs mt-1.5" />
            </div>
          </section>
        ))}
      </div>

      <AnaliseCritica
        resultadoGeral={resultadoGeral} onResultadoChange={setResultadoGeral}
        responsavel={acResponsavel} onResponsavelChange={setAcResponsavel}
        data={acData} onDataChange={setAcData}
        rubricaUrl={acRubricaUrl} onRubricaConfirm={setAcRubricaUrl}
        nomeUsuario={user?.nome_exibicao || user?.full_name || ''}
        disabled={!canAnaliseCritica}
      />

      <div className="flex justify-end gap-2 pb-6">
        <Button variant="outline" onClick={onBack}>Cancelar</Button>
        <Button onClick={handleSave} disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button>
      </div>
    </div>
  );
}