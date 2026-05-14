import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Plus, Search, Building2, Edit2, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ClienteModal from '@/components/clientes/ClienteModal';

export default function Clientes() {
  const { user } = useAuth();
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);

  const role = user?.role || 'auxiliar';
  const canEdit = role === 'admin' || role === 'gestor';

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.Cliente.list('codigo');
    setClientes(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = clientes.filter(c =>
    c.razao_social?.toLowerCase().includes(search.toLowerCase()) ||
    c.cnpj?.includes(search) ||
    c.codigo?.toLowerCase().includes(search.toLowerCase())
  );

  const handleNew = () => { setEditingCliente(null); setModalOpen(true); };
  const handleEdit = (c) => { setEditingCliente(c); setModalOpen(true); };
  const handleToggle = async (c) => {
    await base44.entities.Cliente.update(c.id, { ativo: !c.ativo });
    load();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cadastro de Clientes</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Gerencie os clientes do laboratório</p>
        </div>
        {canEdit && (
          <Button onClick={handleNew} className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Cliente
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por razão social, CNPJ ou código..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[1,2,3,4].map(i => <div key={i} className="h-12 bg-muted rounded animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <Building2 className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">{search ? 'Nenhum cliente encontrado.' : 'Nenhum cliente cadastrado ainda.'}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Código</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Razão Social</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">CNPJ</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Responsável</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Data Cadastro</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Status</th>
                    {canEdit && <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Ações</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map(c => (
                    <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-mono-data text-xs font-medium text-primary">{c.codigo || '—'}</td>
                      <td className="px-4 py-3 font-medium text-foreground">{c.razao_social}</td>
                      <td className="px-4 py-3 text-muted-foreground font-mono-data text-xs">{c.cnpj || '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground">{c.responsavel || '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {c.created_date ? new Date(c.created_date).toLocaleDateString('pt-BR') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={c.ativo !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}>
                          {c.ativo !== false ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </td>
                      {canEdit && (
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(c)} className="h-8 w-8">
                              <Edit2 className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleToggle(c)} className="h-8 w-8">
                              {c.ativo !== false
                                ? <ToggleRight className="w-4 h-4 text-green-600" />
                                : <ToggleLeft className="w-4 h-4 text-gray-400" />
                              }
                            </Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <ClienteModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        cliente={editingCliente}
        onSaved={load}
        totalClientes={clientes.length}
      />
    </div>
  );
}