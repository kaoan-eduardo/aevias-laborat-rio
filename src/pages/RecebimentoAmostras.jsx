import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Plus, Search, Package, Eye, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import NovoRecebimento from '@/components/recebimento/NovoRecebimento';

const STATUS_CONFIG = {
  a_definir:       { label: 'A Definir',  color: 'bg-gray-100 text-gray-600' },
  iniciado:        { label: 'Iniciado',   color: 'bg-blue-100 text-blue-700' },
  concluido:       { label: 'Concluído',  color: 'bg-green-100 text-green-700' },
  cancelado:       { label: 'Cancelado',  color: 'bg-red-100 text-red-600' },
  // legado
  pendente_gestor: { label: 'A Definir',  color: 'bg-gray-100 text-gray-600' },
};

export default function RecebimentoAmostras() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recebimentos, setRecebimentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [expandedRows, setExpandedRows] = useState({});

  const toggleExpand = (id) => setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));

  const role = user?.role || 'auxiliar';
  const canCreate = role === 'auxiliar' || role === 'admin' || role === 'gestor';

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.RecebimentoAmostra.list('-created_date');
    setRecebimentos(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = recebimentos.filter(r =>
    r.numero_protocolo?.toLowerCase().includes(search.toLowerCase()) ||
    r.cliente_nome?.toLowerCase().includes(search.toLowerCase()) ||
    r.numero_projeto?.toLowerCase().includes(search.toLowerCase())
  );

  const pendentes = filtered.filter(r => r.status === 'a_definir').length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Recebimento de Amostras</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Registro de protocolos de entrada de amostras</p>
        </div>
        {canCreate && (
          <Button onClick={() => setModalOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Protocolo
          </Button>
        )}
      </div>

      {/* Alerta para gestor */}
      {(role === 'gestor' || role === 'admin') && pendentes > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 flex items-center gap-3">
          <span className="text-yellow-700 text-sm font-medium">
            ⚠️ {pendentes} protocolo{pendentes > 1 ? 's' : ''} aguardando definição de FAS e ensaios.
          </span>
        </div>
      )}

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por protocolo, cliente ou projeto..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[1,2,3,4].map(i => <div key={i} className="h-12 bg-muted rounded animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">{search ? 'Nenhum protocolo encontrado.' : 'Nenhum protocolo cadastrado ainda.'}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 w-8"></th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Protocolo</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Cliente</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Projeto</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Data Entrada</th>
                    <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Amostras</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map(r => {
                    const expanded = !!expandedRows[r.id];
                    const amostras = r.amostras || [];
                    return (
                      <>
                        <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-3 py-3">
                            {amostras.length > 0 && (
                              <button onClick={() => toggleExpand(r.id)} className="p-0.5 rounded hover:bg-muted transition-colors">
                                {expanded ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
                              </button>
                            )}
                          </td>
                          <td className="px-4 py-3 font-mono-data text-xs font-semibold text-primary">{r.numero_protocolo}</td>
                          <td className="px-4 py-3 font-medium text-foreground text-xs">{r.cliente_nome || '—'}</td>
                          <td className="px-4 py-3 text-muted-foreground text-xs">{r.numero_projeto || '—'}</td>
                          <td className="px-4 py-3 text-muted-foreground text-xs">
                            {r.data_entrada ? new Date(r.data_entrada).toLocaleDateString('pt-BR') : '—'}
                          </td>
                          <td className="px-4 py-3 text-center font-mono-data">{amostras.length}</td>
                          <td className="px-4 py-3">
                            <Badge className={STATUS_CONFIG[r.status]?.color + ' text-xs'}>
                              {STATUS_CONFIG[r.status]?.label || r.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/recebimento/${r.id}`)}>
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                          </td>
                        </tr>
                        {expanded && amostras.length > 0 && (
                          <tr key={r.id + '_expanded'} className="bg-muted/20">
                            <td colSpan={8} className="px-6 pb-3 pt-1">
                              <div className="rounded-md border border-border overflow-hidden">
                                <table className="w-full text-xs">
                                  <thead>
                                    <tr className="bg-muted/60 border-b border-border">
                                      <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Material</th>
                                      <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Procedência</th>
                                      <th className="px-3 py-2 text-center font-semibold text-muted-foreground">Qtd</th>
                                      <th className="px-3 py-2 text-right font-semibold text-muted-foreground">Peso (kg)</th>
                                      <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Data Coleta</th>
                                      <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Observação</th>
                                      <th className="px-3 py-2 text-center font-semibold text-muted-foreground">Suficiente?</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-border bg-white">
                                    {amostras.map(a => (
                                      <tr key={a.id} className="hover:bg-muted/10">
                                        <td className="px-3 py-2 font-medium text-foreground">{a.material_nome || '—'}</td>
                                        <td className="px-3 py-2 text-muted-foreground">{a.procedencia || '—'}</td>
                                        <td className="px-3 py-2 text-center font-mono-data">{a.quantidade ?? '—'}</td>
                                        <td className="px-3 py-2 text-right font-mono-data text-muted-foreground">{a.peso_kg ?? '—'}</td>
                                        <td className="px-3 py-2 text-muted-foreground">{a.data_coleta ? new Date(a.data_coleta).toLocaleDateString('pt-BR') : '—'}</td>
                                        <td className="px-3 py-2 text-muted-foreground">{a.observacao_recebimento || '—'}</td>
                                        <td className="px-3 py-2 text-center">
                                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${a.quantidade_suficiente ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                            {a.quantidade_suficiente ? 'Sim' : 'Não'}
                                          </span>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <NovoRecebimento
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={() => { setModalOpen(false); load(); }}
        totalRecebimentos={recebimentos.length}
      />
    </div>
  );
}