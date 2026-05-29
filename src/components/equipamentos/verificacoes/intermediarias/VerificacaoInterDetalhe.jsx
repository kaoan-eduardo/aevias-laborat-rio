import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { formatMesAno } from '@/lib/dateUtils';
import { ChevronLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import AnaliseCritica from '../AnaliseCritica';
import { podeAnaliseCritica } from '@/business-rules/acessos';
import {
  avaliarSituacaoBalancaIntermediaria,
  avaliarSituacaoTemperaturaIntermediaria,
  avaliarSituacaoPaquimetro,
} from '@/business-rules/verificacoesIntermediarias.js';

const RESULTADO_COLOR = {
  em_andamento: 'bg-yellow-100 text-yellow-700',
  aprovado:     'bg-green-100 text-green-700',
  reprovado:    'bg-red-100 text-red-700',
};
const RESULTADO_LABEL = {
  em_andamento: 'Em andamento',
  aprovado:     'Aprovado',
  reprovado:    'Reprovado',
};
const TIPO_LABELS = {
  balanca:     'Balança (FORM 016)',
  temperatura: 'Temperatura (FORM 027)',
  paquimetro:  'Paquímetro (FORM 082)',
};

export default function VerificacaoInterDetalhe({ verificacao, onBack, onSaved }) {
  const { user } = useAuth();
  const canAnaliseCritica = podeAnaliseCritica(user);

  const [resultadoGeral, setResultadoGeral] = useState(verificacao.resultado_geral || 'em_andamento');
  const [acResponsavel, setAcResponsavel] = useState(verificacao.analise_critica_responsavel || '');
  const [acData, setAcData] = useState(verificacao.analise_critica_data || '');
  const [acRubricaUrl, setAcRubricaUrl] = useState(verificacao.analise_critica_rubrica_url || '');
  const [outrasInfo, setOutrasInfo] = useState(verificacao.outras_informacoes || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.VerificacaoIntermediaria.update(verificacao.id, {
      resultado_geral: resultadoGeral,
      analise_critica_responsavel: acResponsavel,
      analise_critica_data: acData,
      analise_critica_rubrica_url: acRubricaUrl,
      outras_informacoes: outrasInfo,
    });
    setSaving(false);
    onSaved();
  };

  const registros = verificacao.registros || [];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}><ChevronLeft className="w-5 h-5" /></Button>
          <div>
            <h1 className="text-xl font-bold">Checagem Intermediária — {TIPO_LABELS[verificacao.tipo] || verificacao.tipo}</h1>
            <p className="text-sm text-muted-foreground">
              <span className="font-mono-data font-semibold text-primary">{verificacao.equipamento_identificacao}</span>
              {' · '}{verificacao.equipamento_nome}
              {' · '}<span className="capitalize">{formatMesAno(verificacao.mes_ano)}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={RESULTADO_COLOR[verificacao.resultado_geral]}>
            {RESULTADO_LABEL[verificacao.resultado_geral]}
          </Badge>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="w-4 h-4" />
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>

      {/* Equipamento de referência */}
      {verificacao.eq_referencia_identificacao && (
        <div className="rounded-lg border bg-muted/30 px-4 py-3 text-xs space-y-0.5">
          <p className="font-semibold text-muted-foreground uppercase tracking-wide mb-1">Equipamento de Referência</p>
          <p><span className="font-semibold">Identificação:</span> {verificacao.eq_referencia_identificacao}</p>
          {verificacao.eq_referencia_descricao && <p><span className="font-semibold">Descrição:</span> {verificacao.eq_referencia_descricao}</p>}
          {verificacao.eq_referencia_data_calibracao && <p><span className="font-semibold">Data Calibração:</span> {verificacao.eq_referencia_data_calibracao}</p>}
        </div>
      )}

      {/* Registros — Balança */}
      {verificacao.tipo === 'balanca' && registros.length > 0 && (
        <div className="space-y-4">
          {registros.map((reg, regIdx) => (
            <section key={regIdx} className="rounded-lg border border-border overflow-hidden">
              <div className="bg-muted/50 px-4 py-2 text-xs font-semibold uppercase tracking-wide">
                Medição {reg.medicao}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-muted/30">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold">Valor Certificado (g)</th>
                      {[1,2,3,4,5].map(p => (
                        <th key={p} className="px-2 py-2 text-center font-semibold">Pos. {p}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-border">
                      <td className="px-3 py-2 font-mono-data">{reg.valor_certificado || '—'}</td>
                      {(reg.posicoes || []).map((pos, i) => (
                        <td key={i} className="px-2 py-2 text-center font-mono-data">{pos || '—'}</td>
                      ))}
                    </tr>
                    <tr className="border-t border-border bg-muted/10">
                      <td className="px-3 py-1.5 text-muted-foreground font-semibold">Variação (%)</td>
                      {(reg.variacoes || []).map((v, i) => {
                        const sit = avaliarSituacaoBalancaIntermediaria(v);
                        return (
                          <td key={i} className="px-2 py-1.5 text-center">
                            <span className={`font-mono-data ${sit === 'reprovado' ? 'text-red-600 font-bold' : sit === 'aprovado' ? 'text-green-700' : 'text-muted-foreground'}`}>
                              {v !== '' && v != null ? `${v}%` : '—'}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                    <tr className="border-t border-border">
                      <td className="px-3 py-1.5 text-muted-foreground font-semibold">Situação</td>
                      <td colSpan={5} className="px-2 py-1.5">
                        <Badge className={reg.situacao === 'aprovado' ? 'bg-green-100 text-green-700' : reg.situacao === 'reprovado' ? 'bg-red-100 text-red-700' : 'bg-muted text-muted-foreground'}>
                          {reg.situacao || '—'}
                        </Badge>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Registros — Temperatura */}
      {verificacao.tipo === 'temperatura' && registros.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-3 py-2 text-left font-semibold">T1/T2</th>
                <th className="px-3 py-2 text-left font-semibold">Valor Certificado</th>
                <th className="px-3 py-2 text-left font-semibold">Temp. (°C)</th>
                <th className="px-3 py-2 text-left font-semibold">Variação (%)</th>
                <th className="px-3 py-2 text-center font-semibold">Situação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {registros.map((reg, i) => {
                const sit = avaliarSituacaoTemperaturaIntermediaria(reg.variacao_pct);
                return (
                  <tr key={i} className="hover:bg-muted/20">
                    <td className="px-3 py-2 font-mono-data">{reg.t1_t2 || '—'}</td>
                    <td className="px-3 py-2 font-mono-data">{reg.valor_certificado || '—'}</td>
                    <td className="px-3 py-2 font-mono-data">{reg.temperatura_celsius || '—'}</td>
                    <td className="px-3 py-2">
                      <span className={`font-mono-data ${sit === 'reprovado' ? 'text-red-600 font-bold' : sit === 'aprovado' ? 'text-green-700' : 'text-muted-foreground'}`}>
                        {reg.variacao_pct !== '' && reg.variacao_pct != null ? `${reg.variacao_pct}%` : '—'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <Badge className={reg.situacao === 'aprovado' ? 'bg-green-100 text-green-700' : reg.situacao === 'reprovado' ? 'bg-red-100 text-red-700' : 'bg-muted text-muted-foreground'}>
                        {reg.situacao || '—'}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Registros — Paquímetro */}
      {verificacao.tipo === 'paquimetro' && registros.length > 0 && (
        <div className="space-y-4">
          {registros.map((reg, regIdx) => (
            <section key={regIdx} className="rounded-lg border border-border overflow-hidden">
              <div className="bg-muted/50 px-4 py-2 text-xs font-semibold uppercase tracking-wide">
                Medição {reg.medicao}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-muted/30">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold">Valor Certificado (mm)</th>
                      {[1,2,3].map(p => (
                        <th key={p} className="px-2 py-2 text-center font-semibold">Leitura {p}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-border">
                      <td className="px-3 py-2 font-mono-data">{reg.valor_certificado || '—'}</td>
                      {(reg.posicoes || []).map((pos, i) => (
                        <td key={i} className="px-2 py-2 text-center font-mono-data">{pos || '—'}</td>
                      ))}
                    </tr>
                    <tr className="border-t border-border bg-muted/10">
                      <td className="px-3 py-1.5 text-muted-foreground font-semibold">Variação (%)</td>
                      {(reg.variacoes || []).map((v, i) => {
                        const sit = avaliarSituacaoPaquimetro(v);
                        return (
                          <td key={i} className="px-2 py-1.5 text-center">
                            <span className={`font-mono-data ${sit === 'reprovado' ? 'text-red-600 font-bold' : sit === 'aprovado' ? 'text-green-700' : 'text-muted-foreground'}`}>
                              {v !== '' && v != null ? `${v}%` : '—'}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                    <tr className="border-t border-border">
                      <td className="px-3 py-1.5 text-muted-foreground font-semibold">Situação</td>
                      <td colSpan={3} className="px-2 py-1.5">
                        <Badge className={reg.situacao === 'aprovado' ? 'bg-green-100 text-green-700' : reg.situacao === 'reprovado' ? 'bg-red-100 text-red-700' : 'bg-muted text-muted-foreground'}>
                          {reg.situacao || '—'}
                        </Badge>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Outras informações */}
      <div className="space-y-1.5 max-w-lg">
        <Label className="text-xs">Outras Informações</Label>
        <Textarea value={outrasInfo} onChange={e => setOutrasInfo(e.target.value)} className="h-20 text-xs" />
      </div>

      {/* Análise Crítica */}
      <AnaliseCritica
        resultadoGeral={resultadoGeral} onResultadoChange={setResultadoGeral}
        responsavel={acResponsavel} onResponsavelChange={setAcResponsavel}
        data={acData} onDataChange={setAcData}
        rubricaUrl={acRubricaUrl} onRubricaConfirm={setAcRubricaUrl}
        nomeUsuario={user?.nome_exibicao || user?.full_name || ''}
        disabled={!canAnaliseCritica}
      />

      <div className="flex justify-end gap-2 pb-6">
        <Button variant="outline" onClick={onBack}>Voltar</Button>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          <Save className="w-4 h-4" />
          {saving ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </div>
  );
}