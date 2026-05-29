import { useState, useCallback } from 'react';
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
import { useEquipamentos } from '@/hooks/useEquipamentos';
import { useUserRole } from '@/hooks/useUserRole';

// ── Sub-componentes ──────────────────────────────────────────────────────────

function CalibracaoBadge({ validade }) {
  const vencida = isCalibracaoVencida(validade);
  const proxima = isCalibracaoProxima(validade);
  if (!validade) return <span className="text-muted-foreground">—</span>;

  const label = new Date(validade).toLocaleDateString('pt-BR');
  const colorClass = vencida ? 'text-red-600 font-medium' : proxima ? 'text-orange-600 font-medium' : 'text-muted-foreground';

  return (
    <div className="flex items-center gap-1.5">
      {(vencida || proxima) && (
        <AlertTriangle
          className={`w-3.5 h-3.5 flex-shrink-0 ${vencida ? 'text-red-500' : 'text-orange-500'}`}
          aria-label={vencida ? 'Calibração vencida' : 'Calibração próxima do vencimento'}
        />
      )}
      <span className={colorClass}>{label}</span>
    </div>
  );
}

function StatusFilterBar({ statusFilter, onStatusChange }) {
  const options = [{ key: 'todos', label: 'Todos' }, ...Object.entries(STATUS_EQUIPAMENTO).map(([k, v]) => ({ key: k, label: v.label }))];
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por status">
      {options.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onStatusChange(key)}
          aria-pressed={statusFilter === key}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors border ${
            statusFilter === key
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-background text-muted-foreground border-border hover:border-primary/50'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function EquipamentoRow({ eq, canEdit, onView, onEdit }) {
  const statusCfg = STATUS_EQUIPAMENTO[eq.status];
  return (
    <tr className="hover:bg-muted/30 transition-colors">
      <td className="px-4 py-3 font-mono-data text-xs font-semibold text-primary">{eq.identificacao_interna}</td>
      <td className="px-4 py-3 font-medium text-foreground">{eq.nome}</td>
      <td className="px-4 py-3 text-muted-foreground text-xs">{eq.categoria || '—'}</td>
      <td className="px-4 py-3 text-muted-foreground text-xs">{eq.precisao || '—'}</td>
      <td className="px-4 py-3 text-xs"><CalibracaoBadge validade={eq.validade_calibracao} /></td>
      <td className="px-4 py-3 text-center">
        <Badge className={`${statusCfg?.color} text-xs`}>{statusCfg?.label || eq.status}</Badge>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary"
            aria-label={`Visualizar detalhes de ${eq.nome}`}
            onClick={() => onView(eq)}
          >
            <Eye className="w-3.5 h-3.5" aria-hidden="true" />
          </Button>
          {canEdit && (
            <Button
              variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary"
              aria-label={`Editar ${eq.nome}`}
              onClick={() => onEdit(eq.id)}
            >
              <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}

// ── Página principal ─────────────────────────────────────────────────────────

export default function Equipamentos() {
  const navigate = useNavigate();
  const { user, canEditEquipamentos: canEdit } = useUserRole();
  const { equipamentos, filteredEquipamentos, isLoading, searchQuery, setSearchQuery, statusFilter, setStatusFilter } = useEquipamentos();

  const [detalhesEq, setDetalhesEq] = useState(null);
  const [verificacaoDetalhe, setVerificacaoDetalhe] = useState(null);
  const [showAlertaConfig, setShowAlertaConfig] = useState(false);

  const handleView = useCallback((eq) => setDetalhesEq(eq), []);
  const handleEdit = useCallback((id) => navigate(`/equipamentos/${id}/editar`), [navigate]);
  const handleCloseDetalhes = useCallback(() => setDetalhesEq(null), []);
  const handleOpenVerificacao = useCallback((v) => setVerificacaoDetalhe(v), []);

  return (
    <>
      <main className="p-6 max-w-7xl mx-auto space-y-5">
        <header className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Equipamentos</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Gestão e rastreabilidade de equipamentos de laboratório</p>
          </div>
          <div className="flex items-center gap-2">
            {canEdit && (
              <Button
                variant="outline" size="icon" className="h-9 w-9"
                aria-label="Configurar alertas de calibração"
                onClick={() => setShowAlertaConfig(true)}
              >
                <Bell className="w-4 h-4" aria-hidden="true" />
              </Button>
            )}
            <Button
              variant="outline" className="gap-2"
              onClick={() => openForm012(equipamentos, user?.full_name || '')}
            >
              <FileSpreadsheet className="w-4 h-4" aria-hidden="true" />
              FORM 012
            </Button>
            {canEdit && (
              <Button onClick={() => navigate('/equipamentos/novo')} className="gap-2">
                <Plus className="w-4 h-4" aria-hidden="true" />
                Novo Equipamento
              </Button>
            )}
          </div>
        </header>

        {/* Filtros */}
        <section aria-label="Filtros de equipamentos" className="flex flex-col sm:flex-row gap-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              placeholder="Buscar por ID, nome ou categoria..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9"
              aria-label="Buscar equipamento"
            />
          </div>
          <StatusFilterBar statusFilter={statusFilter} onStatusChange={setStatusFilter} />
        </section>

        {/* Tabela */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-3" aria-busy="true" aria-label="Carregando equipamentos">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-14 bg-muted rounded animate-pulse" aria-hidden="true" />)}
              </div>
            ) : filteredEquipamentos.length === 0 ? (
              <div className="p-12 text-center">
                <Wrench className="w-10 h-10 text-muted-foreground mx-auto mb-3" aria-hidden="true" />
                <p className="text-muted-foreground">
                  {searchQuery ? 'Nenhum equipamento encontrado.' : 'Nenhum equipamento cadastrado ainda.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm" aria-label="Lista de equipamentos">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th scope="col" className="px-4 py-3 text-left font-semibold text-muted-foreground">ID Interno</th>
                      <th scope="col" className="px-4 py-3 text-left font-semibold text-muted-foreground">Nome</th>
                      <th scope="col" className="px-4 py-3 text-left font-semibold text-muted-foreground">Categoria</th>
                      <th scope="col" className="px-4 py-3 text-left font-semibold text-muted-foreground">Precisão</th>
                      <th scope="col" className="px-4 py-3 text-left font-semibold text-muted-foreground">Validade Calibração</th>
                      <th scope="col" className="px-4 py-3 text-center font-semibold text-muted-foreground">Status</th>
                      <th scope="col" className="px-4 py-3 text-center font-semibold text-muted-foreground">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredEquipamentos.map(eq => (
                      <EquipamentoRow
                        key={eq.id}
                        eq={eq}
                        canEdit={canEdit}
                        onView={handleView}
                        onEdit={handleEdit}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {detalhesEq && (
        <EquipamentoDetalhes
          equipamento={detalhesEq}
          canEdit={canEdit}
          onClose={handleCloseDetalhes}
          onEdit={() => { navigate(`/equipamentos/${detalhesEq.id}/editar`); handleCloseDetalhes(); }}
          onOpenVerificacao={handleOpenVerificacao}
        />
      )}

      {showAlertaConfig && canEdit && (
        <ConfiguracaoAlertaEmail onClose={() => setShowAlertaConfig(false)} />
      )}

      {verificacaoDetalhe && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 overflow-y-auto" role="dialog" aria-modal="true" aria-label="Detalhe da verificação">
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