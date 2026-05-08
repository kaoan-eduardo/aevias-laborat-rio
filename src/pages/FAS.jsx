import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Plus, Search, FileText, Eye, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

const STATUS_CONFIG = {
  rascunho: { label: 'Rascunho', color: 'bg-gray-100 text-gray-600' },
  aguardando_aprovacao: { label: 'Aguard. Aprovação', color: 'bg-yellow-100 text-yellow-700' },
  aprovada: { label: 'Aprovada', color: 'bg-blue-100 text-blue-700' },
  em_andamento: { label: 'Em Andamento', color: 'bg-purple-100 text-purple-700' },
  concluida: { label: 'Concluída', color: 'bg-green-100 text-green-700' },
  cancelada: { label: 'Cancelada', color: 'bg-red-100 text-red-600' },
};

export default function FAS() {
  const { user } = useAuth();
  const [fasList, setFasList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');

  const role = user?.role || 'auxiliar';
  const canCreate = role === 'admin' || role === 'gestor' || role === 'auxiliar';
  const canApprove = role === 'admin' || role === 'gestor';

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.FAS.list('-created_date');
    setFasList(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = fasList.filter(f => {
    const matchSearch = f.numero_fas?.toLowerCase().includes(search.toLowerCase()) ||
      f.numero_proposta?.toLowerCase().includes(search.toLowerCase()) ||
      f.razao_social?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'todos' || f.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleApprove = async (fas, newStatus) => {
    await base44.entities.FAS.update(fas.id, { status: newStatus });
    load();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Fichas de Aprovação de Serviço (FAS)</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Controle e aprovação de serviços laboratoriais</p>
        </div>
        {canCreate && (
          <Link to="/fas/nova">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nova FAS
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por FAS, proposta ou cliente..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {['todos', ...Object.keys(STATUS_CONFIG)].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors border ${
                statusFilter === s
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-muted-foreground border-border hover:border-primary/50'
              }`}
            >
              {s === 'todos' ? 'Todos' : STATUS_CONFIG[s]?.label}
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
              <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">{search ? 'Nenhuma FAS encontrada.' : 'Nenhuma FAS cadastrada ainda.'}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Nº FAS</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Nº Proposta</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Cliente</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Solicitante</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Data</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Ensaios</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map(fas => (
                    <tr key={fas.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-mono-data text-xs font-semibold text-primary">{fas.numero_fas || '—'}</td>
                      <td className="px-4 py-3 font-mono-data text-xs text-muted-foreground">{fas.numero_proposta}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground text-xs">{fas.razao_social}</p>
                        <p className="text-muted-foreground text-xs font-mono-data">{fas.cnpj}</p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{fas.nome_solicitante || '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {fas.data_solicitacao ? new Date(fas.data_solicitacao).toLocaleDateString('pt-BR') : '—'}
                      </td>
                      <td className="px-4 py-3 text-center font-mono-data text-sm">{fas.itens?.length || 0}</td>
                      <td className="px-4 py-3">
                        <Badge className={STATUS_CONFIG[fas.status]?.color + ' text-xs'}>
                          {STATUS_CONFIG[fas.status]?.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link to={`/fas/${fas.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                          </Link>
                          {canApprove && fas.status === 'aguardando_aprovacao' && (
                            <>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleApprove(fas, 'aprovada')}>
                                <CheckCircle className="w-3.5 h-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleApprove(fas, 'cancelada')}>
                                <XCircle className="w-3.5 h-3.5" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}