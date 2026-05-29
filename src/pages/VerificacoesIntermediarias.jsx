import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { formatMesAno } from '@/lib/dateUtils';
import { Plus, ClipboardList, ClipboardCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import NovaVerificacaoIntermediaria from '@/components/equipamentos/verificacoes/intermediarias/NovaVerificacaoIntermediaria';
import VerificacaoInterDetalhe from '@/components/equipamentos/verificacoes/intermediarias/VerificacaoInterDetalhe';

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

const CARGOS_GESTOR = ['Coordenadora Técnica', 'Encarregado', 'Auxiliar da Qualidade'];

export default function VerificacoesIntermediarias() {
  const { user } = useAuth();
  const [verificacoes, setVerificacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('lista'); // 'lista' | 'nova' | 'detalhe'
  const [verificacaoAtiva, setVerificacaoAtiva] = useState(null);

  const isGestor = user?.role === 'admin' || CARGOS_GESTOR.includes(user?.cargo || '');

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.VerificacaoIntermediaria.list('-created_date');
    setVerificacoes(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const visibleVerificacoes = isGestor
    ? verificacoes
    : verificacoes.filter(v => v.resultado_geral === 'em_andamento');

  if (view === 'nova') {
    return (
      <NovaVerificacaoIntermediaria
        onBack={() => { setView('lista'); load(); }}
        onSaved={() => { setView('lista'); load(); }}
      />
    );
  }

  if (view === 'detalhe' && verificacaoAtiva) {
    return (
      <VerificacaoInterDetalhe
        verificacao={verificacaoAtiva}
        onBack={() => { setVerificacaoAtiva(null); setView('lista'); load(); }}
        onSaved={() => { setVerificacaoAtiva(null); setView('lista'); load(); }}
      />
    );
  }

  return (
    <main className="p-6 max-w-7xl mx-auto space-y-5">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Verificações Intermediárias</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Checagens intermediárias de balanças, temperatura e paquímetros</p>
        </div>
        <Button onClick={() => setView('nova')} className="gap-2">
          <Plus className="w-4 h-4" aria-hidden="true" />
          Nova Verificação
        </Button>
      </header>

      {loading ? (
        <div className="space-y-3" aria-busy="true">
          {[1,2,3].map(i => <div key={i} className="h-16 bg-muted rounded animate-pulse" />)}
        </div>
      ) : visibleVerificacoes.length === 0 ? (
        <div className="py-16 text-center border border-dashed rounded-xl">
          <ClipboardList className="w-10 h-10 text-muted-foreground mx-auto mb-3" aria-hidden="true" />
          <p className="text-muted-foreground">
            {isGestor ? 'Nenhuma verificação intermediária registrada ainda.' : 'Nenhuma verificação em andamento.'}
          </p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm" aria-label="Lista de verificações intermediárias">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-muted-foreground">Equipamento</th>
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-muted-foreground">Tipo</th>
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-muted-foreground">Mês/Ano</th>
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-muted-foreground">Analisado por</th>
                    <th scope="col" className="px-4 py-3 text-center font-semibold text-muted-foreground">Resultado</th>
                    <th scope="col" className="px-4 py-3 text-center font-semibold text-muted-foreground">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {visibleVerificacoes.map(v => (
                    <tr key={v.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono-data text-xs font-semibold text-primary">{v.equipamento_identificacao}</span>
                        <span className="ml-2 text-muted-foreground text-xs">{v.equipamento_nome}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{TIPO_LABELS[v.tipo] || v.tipo}</td>
                      <td className="px-4 py-3 text-xs capitalize text-muted-foreground">{formatMesAno(v.mes_ano)}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{v.analise_critica_responsavel || '—'}</td>
                      <td className="px-4 py-3 text-center">
                        <Badge className={RESULTADO_COLOR[v.resultado_geral] || 'bg-muted text-muted-foreground'}>
                          {RESULTADO_LABEL[v.resultado_geral] || v.resultado_geral}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Button
                          variant="ghost" size="sm" className="text-xs gap-1.5"
                          aria-label={`Abrir verificação de ${v.equipamento_nome}`}
                          onClick={() => { setVerificacaoAtiva(v); setView('detalhe'); }}
                        >
                          <ClipboardCheck className="w-3.5 h-3.5" aria-hidden="true" />
                          Abrir
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  );
}