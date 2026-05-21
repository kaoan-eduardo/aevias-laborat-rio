import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Wrench, Eye, Pencil, AlertTriangle, FileSpreadsheet, Bell } from 'lucide-react';
import { openForm012 } from '@/components/equipamentos/Form012Document';
import ConfiguracaoAlertaEmail from '@/components/equipamentos/ConfiguracaoAlertaEmail';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import EquipamentoDetalhes from '@/components/equipamentos/EquipamentoDetalhes';
import VerificacaoDetalhe from '@/components/equipamentos/verificacoes/VerificacaoDetalhe';
import { STATUS_EQUIPAMENTO, isCalibracaoVencida, isCalibracaoProxima } from '@/utils/equipamentoHelpers';

export default function Equipamentos() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [equipamentos, setEquipamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [detalhesEq, setDetalhesEq] = useState(null);
  const [verificacaoDetalhe, setVerificacaoDetalhe] = useState(null);
  const [showAlertaConfig, setShowAlertaConfig] = useState(false);

  const role = user?.role || 'auxiliar';
  const canEdit = role === 'admin' || role === 'gestor';

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.Equipamento.list('-created_date');
    setEquipamentos(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = equipamentos.filter(eq => {
    const matchSearch =
      eq.identificacao_interna?.toLowerCase().includes(search.toLowerCase()) ||
      eq.nome?.toLowerCase().includes(search.toLowerCase()) ||
      eq.categoria?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'todos' || eq.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <>
      <div className="p-6 max-w-7xl mx-auto space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Equipamentos</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Gestão e rastreabilidade de equipamentos de laboratório</p>
          </div>
          <div className="flex items-center gap-2">
            {canEdit && (
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                title="Configurar alertas de calibração"
                onClick={() => setShowAlertaConfig(true)}
              >
                <Bell className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => openForm012(equipamentos, user?.full_name || '')}
            >
              <FileSpreadsheet className="w-4 h-4" />
              FORM 012
            </Button>
            {canEdit && (
              <Button onClick={() => navigate('/equipamentos/novo')} className="gap-2">
                <Plus className="w-4 h-4" />
                Novo Equipamento
              </Button>
            )}
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por ID, nome ou categoria..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {['todos', ...Object.keys(STATUS_EQUIPAMENTO)].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors border ${
                  statusFilter === s
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-muted-foreground border-border hover:border-primary/50'
                }`}
              >
                {s === 'todos' ? 'Todos' : STATUS_EQUIPAMENTO[s]?.label}
              </button>
            ))}
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-3">
                {[1,2,3,4].map(i => <div key={i} className="h-14 bg-muted rounded animate-pulse" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center">
                <Wrench className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">{search ? 'Nenhum equipamento encontrado.' : 'Nenhum equipamento cadastrado ainda.'}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-4 py-3 text-left font-semibold text-muted-foreground">ID Interno</th>
                      <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Nome</th>
                      <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Categoria</th>
                      <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Precisão</th>
                      <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Validade Calibração</th>
                      <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Status</th>
                      <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filtered.map(eq => {
                      const vencida = isCalibracaoVencida(eq.validade_calibracao);
                      const proxima = isCalibracaoProxima(eq.validade_calibracao);
                      return (
                        <tr key={eq.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 font-mono-data text-xs font-semibold text-primary">{eq.identificacao_interna}</td>
                          <td className="px-4 py-3 font-medium text-foreground">{eq.nome}</td>
                          <td className="px-4 py-3 text-muted-foreground text-xs">{eq.categoria || '—'}</td>
                          <td className="px-4 py-3 text-muted-foreground text-xs">{eq.precisao || '—'}</td>
                          <td className="px-4 py-3 text-xs">
                            <div className="flex items-center gap-1.5">
                              {vencida && <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />}
                              {!vencida && proxima && <AlertTriangle className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />}
                              <span className={vencida ? 'text-red-600 font-medium' : proxima ? 'text-orange-600 font-medium' : 'text-muted-foreground'}>
                                {eq.validade_calibracao ? new Date(eq.validade_calibracao).toLocaleDateString('pt-BR') : '—'}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Badge className={STATUS_EQUIPAMENTO[eq.status]?.color + ' text-xs'}>
                              {STATUS_EQUIPAMENTO[eq.status]?.label || eq.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary"
                                title="Visualizar detalhes"
                                onClick={() => setDetalhesEq(eq)}
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </Button>
                              {canEdit && (
                                <Button
                                  variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary"
                                  title="Editar"
                                  onClick={() => navigate(`/equipamentos/${eq.id}/editar`)}
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {detalhesEq && (
        <EquipamentoDetalhes
          equipamento={detalhesEq}
          canEdit={canEdit}
          onClose={() => setDetalhesEq(null)}
          onEdit={() => { navigate(`/equipamentos/${detalhesEq.id}/editar`); setDetalhesEq(null); }}
          onOpenVerificacao={v => setVerificacaoDetalhe(v)}
        />
      )}

      {showAlertaConfig && canEdit && (
        <ConfiguracaoAlertaEmail onClose={() => setShowAlertaConfig(false)} />
      )}

      {verificacaoDetalhe && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl my-6">
            <VerificacaoDetalhe
              verificacao={verificacaoDetalhe}
              isGestor={canEdit}
              onBack={() => setVerificacaoDetalhe(null)}
              onSaved={updated => setVerificacaoDetalhe(updated)}
            />
          </div>
        </div>
      )}

    </>
  );
}