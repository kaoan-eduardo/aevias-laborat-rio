import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Plus, Search, Wrench, Eye, Pencil, AlertTriangle, ClipboardCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import EquipamentoModal from '@/components/equipamentos/EquipamentoModal';
import EquipamentoDetalhes from '@/components/equipamentos/EquipamentoDetalhes';
import VerificacaoModal from '@/components/equipamentos/verificacoes/VerificacaoModal';
import { STATUS_EQUIPAMENTO, isCalibracaoVencida, isCalibracaoProxima } from '@/utils/equipamentoHelpers';

export default function Equipamentos() {
  const { user } = useAuth();
  const [equipamentos, setEquipamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEq, setEditingEq] = useState(null);
  const [detalhesEq, setDetalhesEq] = useState(null);

  const [verificacaoEq, setVerificacaoEq] = useState(null);

  const role = user?.role || 'auxiliar';
  const canEdit = role === 'admin' || role === 'gestor';
  const isLaboratorista = role === 'laboratorista' || role === 'auxiliar' || role === 'admin' || role === 'gestor';

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

  const handleNew = () => { setEditingEq(null); setModalOpen(true); };
  const handleEdit = (eq) => { setEditingEq(eq); setModalOpen(true); setDetalhesEq(null); };
  const handleSaved = () => { setModalOpen(false); setEditingEq(null); load(); };
  const handleVerificacaoSaved = () => { setVerificacaoEq(null); };

  return (
    <>
      <div className="p-6 max-w-7xl mx-auto space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Equipamentos</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Gestão e rastreabilidade de equipamentos de laboratório</p>
          </div>
          {canEdit && (
            <Button onClick={handleNew} className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Equipamento
            </Button>
          )}
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
                              {isLaboratorista && eq.status === 'em_uso' && eq.obrigatorio_verificacao_diaria && (
                                <Button
                                  variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-green-600"
                                  title="Checagem Diária"
                                  onClick={() => setVerificacaoEq(eq)}
                                >
                                  <ClipboardCheck className="w-3.5 h-3.5" />
                                </Button>
                              )}
                              {canEdit && (
                                <Button
                                  variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary"
                                  title="Editar"
                                  onClick={() => handleEdit(eq)}
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

      <EquipamentoModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingEq(null); }}
        equipamento={editingEq}
        onSaved={handleSaved}
      />

      {detalhesEq && (
        <EquipamentoDetalhes
          equipamento={detalhesEq}
          canEdit={canEdit}
          onClose={() => setDetalhesEq(null)}
          onEdit={() => handleEdit(detalhesEq)}
        />
      )}

      {verificacaoEq && (
        <VerificacaoModal
          open={!!verificacaoEq}
          onClose={() => setVerificacaoEq(null)}
          equipamento={verificacaoEq}
          onSaved={handleVerificacaoSaved}
        />
      )}
    </>
  );
}