import { useState, useEffect } from 'react';
import { formatMesAno } from '@/lib/dateUtils';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Plus, ChevronLeft, ClipboardCheck, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import NovaVerificacao from '@/components/equipamentos/verificacoes/NovaVerificacao';
import VerificacaoDetalhe from '@/components/equipamentos/verificacoes/VerificacaoDetalhe';

const RESULTADO_COLOR = {
  em_andamento: 'bg-yellow-100 text-yellow-700',
  aprovado: 'bg-green-100 text-green-700',
  reprovado: 'bg-red-100 text-red-700',
};

const TIPO_LABELS = { balanca: 'Balança', temperatura: 'Temperatura', densidade: 'Densidade' };

export default function Verificacoes() {
  const { user } = useAuth();
  const [verificacoes, setVerificacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('lista'); // 'lista' | 'nova' | 'detalhe'
  const [selected, setSelected] = useState(null);

  const role = user?.role || 'auxiliar';
  const isGestor = role === 'admin' || role === 'gestor';

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.VerificacaoDiaria.list('-created_date');
    setVerificacoes(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // Laboratorista/auxiliar vê apenas em_andamento
  const visibleVerificacoes = isGestor
    ? verificacoes
    : verificacoes.filter(v => v.resultado_geral === 'em_andamento');

  if (view === 'nova') {
    return (
      <NovaVerificacao
        onBack={() => { setView('lista'); load(); }}
        onSaved={() => { setView('lista'); load(); }}
      />
    );
  }

  if (view === 'detalhe' && selected) {
    return (
      <VerificacaoDetalhe
        verificacao={selected}
        isGestor={isGestor}
        onBack={() => { setView('lista'); load(); }}
        onSaved={(updated) => { setSelected(updated); load(); }}
      />
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Verificações Diárias</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Controle de verificações internas de equipamentos</p>
        </div>
        <Button onClick={() => setView('nova')} className="gap-2">
          <Plus className="w-4 h-4" />
          Nova Verificação
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-16 bg-muted rounded animate-pulse" />)}
        </div>
      ) : visibleVerificacoes.length === 0 ? (
        <div className="py-16 text-center border border-dashed rounded-xl">
          <ClipboardList className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            {isGestor ? 'Nenhuma verificação registrada ainda.' : 'Nenhuma verificação em andamento.'}
          </p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Equipamento</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Tipo</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Mês/Ano</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Realizado por</th>
                    <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Resultado</th>
                    <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {visibleVerificacoes.map(v => {
                    const mesLabel = formatMesAno(v.mes_ano);
                    return (
                      <tr key={v.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <span className="font-mono-data text-xs font-semibold text-primary">{v.equipamento_identificacao}</span>
                          <span className="ml-2 text-muted-foreground text-xs">{v.equipamento_nome}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{TIPO_LABELS[v.tipo] || v.tipo}</td>
                        <td className="px-4 py-3 text-xs capitalize text-muted-foreground">{mesLabel}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{v.realizado_por || '—'}</td>
                        <td className="px-4 py-3 text-center">
                          <Badge className={RESULTADO_COLOR[v.resultado_geral] || 'bg-muted text-muted-foreground'}>
                            {v.resultado_geral === 'em_andamento' ? 'Em andamento' : v.resultado_geral === 'aprovado' ? 'Aprovado' : 'Reprovado'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Button
                            variant="ghost" size="sm" className="text-xs gap-1.5"
                            onClick={() => { setSelected(v); setView('detalhe'); }}
                          >
                            <ClipboardCheck className="w-3.5 h-3.5" />
                            Abrir
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}