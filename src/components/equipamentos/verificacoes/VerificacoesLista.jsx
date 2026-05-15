import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { ChevronRight, ClipboardList } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { openVerificacaoImpressao } from './VerificacaoDocumento';

const TIPO_LABELS = { balanca: 'Balança', temperatura: 'Temperatura', densidade: 'Densidade' };

const SITUACAO_COLOR = {
  aprovado: 'bg-green-100 text-green-700',
  reprovado: 'bg-red-100 text-red-700',
  em_andamento: 'bg-yellow-100 text-yellow-700',
};

function VerificacaoCard({ v, onOpen }) {
  const mesAnoLabel = v.mes_ano
    ? new Date(v.mes_ano + '-02T12:00:00').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    : v.mes_ano;

  const registrosPreenchidos = (v.registros || []).filter(r =>
    r.valor_medido || r.valor_referencia || r.densidade_com_amostra
  );

  return (
    <button
      className="w-full rounded-lg border border-border bg-card flex items-center justify-between px-4 py-3 text-left hover:bg-muted/30 transition-colors"
      onClick={() => onOpen(v)}
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
      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
    </button>
  );
}

export default function VerificacoesLista({ equipamentoId, onOpenDetalhe }) {
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
      {verificacoes.map(v => <VerificacaoCard key={v.id} v={v} onOpen={openVerificacaoImpressao} />)}
    </div>
  );
}