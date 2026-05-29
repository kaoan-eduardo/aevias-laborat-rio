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
  buildRegistrosBalancaIntermediaria,
  calcularVariacaoBalancaIntermediaria,
  avaliarSituacaoBalancaIntermediaria,
  BALANCA_INTERMEDIARIA_LIMITE_PCT,
} from '@/business-rules/verificacoesIntermediarias.js';
import { listarEquipamentosParaVerificacaoIntermediaria, listarPesosPadraoIntermediario } from '@/services/equipamentosIntermediarioService';

export default function NovaVerificacaoInterBalanca({ onBack, onSaved }) {
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
  const [pesosPadrao, setPesosPadrao] = useState([]);
  const [registros, setRegistros] = useState(buildRegistrosBalancaIntermediaria());
  const [outrasInfo, setOutrasInfo] = useState('');
  const [resultadoGeral, setResultadoGeral] = useState('em_andamento');
  const [acResponsavel, setAcResponsavel] = useState('');
  const [acData, setAcData] = useState('');
  const [acRubricaUrl, setAcRubricaUrl] = useState('');
  const [erros, setErros] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    listarEquipamentosParaVerificacaoIntermediaria('balanca')
      .then(data => { setEquipamentos(data); setLoadingEq(false); });
  }, []);

  useEffect(() => {
    if (!equipamento) return;
    setMesAno(currentMonthSP());
    setRegistros(buildRegistrosBalancaIntermediaria());
    listarPesosPadraoIntermediario().then(pesos => {
      setPesosPadrao(pesos);
      if (pesos.length === 1) {
        setEqRefId(pesos[0].identificacao_interna || '');
        setEqRefDesc(pesos[0].nome || '');
        setEqRefCal(pesos[0].data_calibracao || '');
      }
    });
  }, [equipamento]);

  const handlePesoSelect = (val) => {
    const p = pesosPadrao.find(x => x.identificacao_interna === val);
    setEqRefId(val);
    setEqRefDesc(p?.nome || '');
    setEqRefCal(p?.data_calibracao || '');
    setErros(prev => ({ ...prev, eqRefId: false }));
  };

  const updatePosicao = (regIdx, posIdx, value) => {
    setRegistros(prev => prev.map((r, i) => {
      if (i !== regIdx) return r;
      const novasPosicoes = [...r.posicoes];
      novasPosicoes[posIdx] = value;
      const novasVariacoes = novasPosicoes.map(pos =>
        calcularVariacaoBalancaIntermediaria(r.valor_certificado, pos)
      );
      const situacao = novasVariacoes.every(v => v === '' || avaliarSituacaoBalancaIntermediaria(v) === 'aprovado')
        && novasPosicoes.some(p => p !== '')
        ? novasVariacoes.some(v => avaliarSituacaoBalancaIntermediaria(v) === 'reprovado') ? 'reprovado' : 'aprovado'
        : '';
      return { ...r, posicoes: novasPosicoes, variacoes: novasVariacoes, situacao };
    }));
  };

  const updateCertificado = (regIdx, value) => {
    setRegistros(prev => prev.map((r, i) => {
      if (i !== regIdx) return r;
      const novasVariacoes = r.posicoes.map(pos =>
        calcularVariacaoBalancaIntermediaria(value, pos)
      );
      const situacao = novasVariacoes.every(v => v === '' || avaliarSituacaoBalancaIntermediaria(v) === 'aprovado')
        && r.posicoes.some(p => p !== '')
        ? novasVariacoes.some(v => avaliarSituacaoBalancaIntermediaria(v) === 'reprovado') ? 'reprovado' : 'aprovado'
        : '';
      return { ...r, valor_certificado: value, variacoes: novasVariacoes, situacao };
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
      tipo: 'balanca',
      mes_ano: mesAno,
      eq_referencia_identificacao: eqRefId,
      eq_referencia_descricao: eqRefDesc,
      eq_referencia_data_calibracao: eqRefCal,
      registros,
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
      titulo="Nova Verificação Intermediária — Balança"
      subtitulo="Passo 1 de 2 — Selecione a balança"
      equipamentos={equipamentos}
      isLoading={loadingEq}
      emptyMessage="Nenhuma balança em uso com verificação intermediária obrigatória."
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
            <h1 className="text-xl font-bold">Checagem Intermediária — Balança</h1>
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

      <EqReferenciaSection
        eqRefId={eqRefId} eqRefDesc={eqRefDesc} eqRefCal={eqRefCal}
        opcoes={pesosPadrao} placeholderSelect="Selecione o peso padrão"
        erros={erros}
        onIdChange={handlePesoSelect}
        onDescChange={setEqRefDesc}
        onCalChange={val => { setEqRefCal(val); setErros(p => ({...p, eqRefCal: false})); }}
      />

      <div className="rounded-lg border bg-blue-50 p-3 text-xs text-blue-800">
        <p className="font-semibold">Variação permitida: ≤ {BALANCA_INTERMEDIARIA_LIMITE_PCT}%</p>
        <p className="mt-0.5 text-blue-600">V = (Massa Peso Padrão − Massa Equipamento) / Massa Peso Padrão × 100</p>
      </div>

      <div className="space-y-4">
        {registros.map((reg, regIdx) => (
          <section key={reg.medicao} className="rounded-lg border border-border overflow-hidden">
            <div className="bg-muted/50 px-4 py-2 text-xs font-semibold uppercase tracking-wide">
              Checagem Intermediária — Medição {reg.medicao}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold w-40">Medição</th>
                    <th className="px-3 py-2 text-left font-semibold w-32">Valor certificado (g)</th>
                    <th className="px-3 py-2 text-center font-semibold" colSpan={5}>Valor observado nas posições (g)</th>
                  </tr>
                  <tr className="border-t border-border">
                    <th className="px-3 py-1 text-left"></th>
                    <th className="px-3 py-1 text-left"></th>
                    {[1,2,3,4,5].map(p => (
                      <th key={p} className="px-2 py-1 text-center font-semibold">{p}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-border">
                    <td className="px-3 py-2 font-semibold">{reg.medicao}</td>
                    <td className="px-2 py-2">
                      <Input
                        type="number" value={reg.valor_certificado}
                        onChange={e => updateCertificado(regIdx, e.target.value)}
                        className="h-7 text-xs" placeholder="g"
                      />
                    </td>
                    {reg.posicoes.map((pos, posIdx) => (
                      <td key={posIdx} className="px-2 py-2">
                        <Input
                          type="number" value={pos}
                          onChange={e => updatePosicao(regIdx, posIdx, e.target.value)}
                          className="h-7 text-xs" placeholder="g"
                        />
                      </td>
                    ))}
                  </tr>
                  <tr className="border-t border-border bg-muted/10">
                    <td className="px-3 py-1.5 font-semibold text-muted-foreground">Variação encontrada (%)</td>
                    <td></td>
                    {reg.variacoes.map((v, i) => {
                      const situacao = avaliarSituacaoBalancaIntermediaria(v);
                      return (
                        <td key={i} className="px-2 py-1.5 text-center">
                          <span className={`font-mono-data text-xs ${situacao === 'reprovado' ? 'text-red-600 font-bold' : situacao === 'aprovado' ? 'text-green-700' : 'text-muted-foreground'}`}>
                            {v !== '' ? `${v}%` : '—'}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>

      <div className="space-y-1.5 max-w-lg">
        <Label className="text-xs">Outras Informações</Label>
        <Textarea value={outrasInfo} onChange={e => setOutrasInfo(e.target.value)} className="h-20 text-xs" />
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