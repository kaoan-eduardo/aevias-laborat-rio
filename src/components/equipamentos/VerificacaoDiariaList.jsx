import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const MODELOS = {
  balanca: 'Balança',
  temperatura: 'Temperatura',
  densidade: 'Densidade',
};

function VerificacaoItem({ v }) {
  const [expanded, setExpanded] = useState(false);

  const campos =
    v.modelo === 'balanca' ? v.campos_balanca :
    v.modelo === 'temperatura' ? v.campos_temperatura :
    v.modelo === 'densidade' ? v.campos_densidade : null;

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        className="w-full flex items-center gap-3 px-3 py-2.5 bg-muted/20 hover:bg-muted/40 transition-colors text-left"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex-shrink-0">
          {v.aprovado
            ? <CheckCircle className="w-4 h-4 text-green-600" />
            : <XCircle className="w-4 h-4 text-red-500" />}
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-xs font-semibold text-foreground">{MODELOS[v.modelo] || v.modelo}</span>
          <span className="text-xs text-muted-foreground ml-2">
            {v.data_verificacao ? new Date(v.data_verificacao + 'T12:00:00').toLocaleDateString('pt-BR') : '—'}
          </span>
          <span className="text-xs text-muted-foreground ml-2">· {v.responsavel}</span>
        </div>
        <Badge className={v.aprovado ? 'bg-green-100 text-green-700 text-xs' : 'bg-red-100 text-red-700 text-xs'}>
          {v.aprovado ? 'Aprovado' : 'Reprovado'}
        </Badge>
        {expanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />}
      </button>

      {expanded && (
        <div className="px-4 py-3 bg-white space-y-2 text-xs">
          {v.modelo === 'balanca' && campos && (
            <div className="grid grid-cols-2 gap-x-6 gap-y-1">
              <Row label="Massa Padrão (g)" value={campos.massa_padrao_g} />
              <Row label="Leitura Obtida (g)" value={campos.leitura_obtida_g} />
              <Row label="Diferença (g)" value={campos.diferenca_g} />
              <Row label="Tolerância (g)" value={campos.tolerancia_g} />
            </div>
          )}
          {v.modelo === 'temperatura' && campos && (
            <div className="grid grid-cols-2 gap-x-6 gap-y-1">
              <Row label="Referência (°C)" value={campos.temperatura_referencia_c} />
              <Row label="Obtida (°C)" value={campos.temperatura_obtida_c} />
              <Row label="Diferença (°C)" value={campos.diferenca_c} />
              <Row label="Tolerância (°C)" value={campos.tolerancia_c} />
            </div>
          )}
          {v.modelo === 'densidade' && campos && (
            <div className="grid grid-cols-2 gap-x-6 gap-y-1">
              <Row label="Líquido Padrão" value={campos.liquido_padrao} />
              <Row label="Referência (g/cm³)" value={campos.densidade_referencia} />
              <Row label="Obtida (g/cm³)" value={campos.densidade_obtida} />
              <Row label="Diferença" value={campos.diferenca} />
              <Row label="Tolerância" value={campos.tolerancia} />
            </div>
          )}
          {v.observacoes && (
            <p className="text-muted-foreground pt-1 border-t border-border mt-2">
              <span className="font-semibold text-foreground">Obs.: </span>{v.observacoes}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

const Row = ({ label, value }) => (
  <div className="flex justify-between gap-2">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium text-foreground">{value ?? '—'}</span>
  </div>
);

export default function VerificacaoDiariaList({ equipamentoId, refreshKey }) {
  const [verificacoes, setVerificacoes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!equipamentoId) return;
    setLoading(true);
    base44.entities.VerificacaoDiaria.filter({ equipamento_id: equipamentoId }, '-data_verificacao', 30)
      .then(data => { setVerificacoes(data); setLoading(false); });
  }, [equipamentoId, refreshKey]);

  if (loading) return <p className="text-xs text-muted-foreground text-center py-3">Carregando...</p>;

  if (verificacoes.length === 0) return (
    <p className="text-xs text-muted-foreground text-center py-4 border border-dashed rounded-lg">
      Nenhuma verificação diária registrada.
    </p>
  );

  return (
    <div className="space-y-1.5">
      {verificacoes.map(v => <VerificacaoItem key={v.id} v={v} />)}
    </div>
  );
}