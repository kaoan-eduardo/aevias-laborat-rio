import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { ChevronDown, ChevronUp, ClipboardList } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const TIPO_LABELS = { balanca: 'Balança', temperatura: 'Temperatura', densidade: 'Densidade' };

const SITUACAO_COLOR = {
  aprovado: 'bg-green-100 text-green-700',
  reprovado: 'bg-red-100 text-red-700',
  em_andamento: 'bg-yellow-100 text-yellow-700',
};

function VerificacaoCard({ v }) {
  const [expanded, setExpanded] = useState(false);

  const mesAnoLabel = v.mes_ano
    ? new Date(v.mes_ano + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    : v.mes_ano;

  const registrosPreenchidos = (v.registros || []).filter(r =>
    r.valor_medido || r.valor_referencia || r.densidade_com_amostra
  );

  return (
    <div className="rounded-lg border border-border bg-card">
      <button
        className="w-full flex items-center justify-between px-4 py-3 text-left"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-semibold text-foreground capitalize">{TIPO_LABELS[v.tipo] || v.tipo}</span>
          <span className="text-xs text-muted-foreground">{mesAnoLabel}</span>
          <Badge className={SITUACAO_COLOR[v.resultado_geral] || 'bg-muted text-muted-foreground'}>
            {v.resultado_geral === 'em_andamento' ? 'Em andamento' : v.resultado_geral === 'aprovado' ? 'Aprovado' : 'Reprovado'}
          </Badge>
          {registrosPreenchidos.length > 0 && (
            <span className="text-xs text-muted-foreground">{registrosPreenchidos.length} registro(s)</span>
          )}
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-border pt-3">
          {/* Cabeçalho */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div><span className="text-muted-foreground">Realizado por: </span><span>{v.realizado_por || '—'}</span></div>
            <div><span className="text-muted-foreground">Data: </span><span>{v.data_finalizacao ? new Date(v.data_finalizacao + 'T12:00:00').toLocaleDateString('pt-BR') : '—'}</span></div>
            {v.eq_referencia_identificacao && (
              <div><span className="text-muted-foreground">Equip. Ref.: </span><span className="font-mono-data">{v.eq_referencia_identificacao}</span></div>
            )}
            {v.eq_referencia_data_calibracao && (
              <div><span className="text-muted-foreground">Calib. Ref.: </span><span>{new Date(v.eq_referencia_data_calibracao + 'T12:00:00').toLocaleDateString('pt-BR')}</span></div>
            )}
            {v.solucao_descricao && (
              <div><span className="text-muted-foreground">Solução: </span><span>{v.solucao_descricao} — Lote: {v.solucao_lote || '—'}</span></div>
            )}
          </div>

          {/* Tabela de registros */}
          {(v.registros || []).length > 0 && (
            <div className="overflow-x-auto rounded border border-border">
              <table className="w-full text-xs">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="px-2 py-1.5 text-center font-semibold">Dia</th>
                    {v.tipo === 'balanca' && <th className="px-2 py-1.5 text-left font-semibold">Resultado (g)</th>}
                    {v.tipo === 'temperatura' && <>
                      <th className="px-2 py-1.5 text-left font-semibold">Ref. (°C)</th>
                      <th className="px-2 py-1.5 text-left font-semibold">Medido (°C)</th>
                      <th className="px-2 py-1.5 text-left font-semibold">Variação (°C)</th>
                    </>}
                    {v.tipo === 'densidade' && <>
                      <th className="px-2 py-1.5 text-left font-semibold">Horário</th>
                      <th className="px-2 py-1.5 text-left font-semibold">Temp.</th>
                      <th className="px-2 py-1.5 text-left font-semibold">c/ Amostra</th>
                      <th className="px-2 py-1.5 text-left font-semibold">s/ Amostra</th>
                    </>}
                    <th className="px-2 py-1.5 text-center font-semibold">Situação</th>
                    <th className="px-2 py-1.5 text-left font-semibold">Responsável</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {v.registros.filter(r => r.valor_medido || r.valor_referencia || r.densidade_com_amostra || r.densidade_sem_amostra || r.horario).map((r, i) => (
                    <tr key={i} className={r.situacao === 'reprovado' ? 'bg-red-50' : ''}>
                      <td className="px-2 py-1 text-center font-mono-data text-muted-foreground">{r.dia}</td>
                      {v.tipo === 'balanca' && <td className="px-2 py-1">{r.valor_medido || '—'}</td>}
                      {v.tipo === 'temperatura' && <>
                        <td className="px-2 py-1">{r.valor_referencia || '—'}</td>
                        <td className="px-2 py-1">{r.valor_medido || '—'}</td>
                        <td className="px-2 py-1">{r.variacao || '—'}</td>
                      </>}
                      {v.tipo === 'densidade' && <>
                        <td className="px-2 py-1">{r.horario || '—'}</td>
                        <td className="px-2 py-1">{r.temperatura || '—'}</td>
                        <td className="px-2 py-1">{r.densidade_com_amostra || '—'}</td>
                        <td className="px-2 py-1">{r.densidade_sem_amostra || '—'}</td>
                      </>}
                      <td className="px-2 py-1 text-center">
                        {r.situacao ? (
                          <Badge className={r.situacao === 'aprovado' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                            {r.situacao === 'aprovado' ? 'Aprovado' : 'Reprovado'}
                          </Badge>
                        ) : '—'}
                      </td>
                      <td className="px-2 py-1 text-muted-foreground">{r.responsavel || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {v.outras_informacoes && (
            <div className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Outras informações: </span>{v.outras_informacoes}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function VerificacoesLista({ equipamentoId }) {
  const [verificacoes, setVerificacoes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!equipamentoId) return;
    base44.entities.VerificacaoDiaria.filter({ equipamento_id: equipamentoId }, '-created_date')
      .then(data => { setVerificacoes(data); setLoading(false); });
  }, [equipamentoId]);

  if (loading) return <p className="text-xs text-muted-foreground py-2">Carregando verificações...</p>;

  if (verificacoes.length === 0) {
    return (
      <div className="text-center py-6 border border-dashed rounded-lg">
        <ClipboardList className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-xs text-muted-foreground">Nenhuma verificação diária registrada.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {verificacoes.map(v => <VerificacaoCard key={v.id} v={v} />)}
    </div>
  );
}