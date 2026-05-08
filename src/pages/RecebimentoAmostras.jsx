import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Plus, Search, Package, Eye, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link, useNavigate } from 'react-router-dom';
import NovoRecebimento from '@/components/recebimento/NovoRecebimento';

export default function RecebimentoAmostras() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recebimentos, setRecebimentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const role = user?.role || 'auxiliar';
  const canAccess = role === 'admin' || role === 'auxiliar' || role === 'gestor';

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.RecebimentoAmostra.list('-created_date');
    setRecebimentos(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  if (!canAccess) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Acesso restrito. Apenas gestores e auxiliares podem acessar esta página.
      </div>
    );
  }

  const filtered = recebimentos.filter(r =>
    r.numero_protocolo?.toLowerCase().includes(search.toLowerCase()) ||
    r.cliente_nome?.toLowerCase().includes(search.toLowerCase()) ||
    r.numero_projeto?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Recebimento de Amostras</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Registro de protocolos de entrada de amostras</p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Protocolo
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por protocolo, cliente ou projeto..."
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
              <Package className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">{search ? 'Nenhum protocolo encontrado.' : 'Nenhum protocolo cadastrado ainda.'}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Protocolo</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Cliente</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Projeto</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Data de Entrada</th>
                    <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Amostras</th>
                    <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map(r => (
                    <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-mono-data text-xs font-semibold text-primary">{r.numero_protocolo}</td>
                      <td className="px-4 py-3 font-medium text-foreground text-xs">{r.cliente_nome || '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{r.numero_projeto || '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {r.data_entrada ? new Date(r.data_entrada).toLocaleDateString('pt-BR') : '—'}
                      </td>
                      <td className="px-4 py-3 text-center font-mono-data">{r.amostras?.length || 0}</td>
                      <td className="px-4 py-3 text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => navigate(`/recebimento/${r.id}`)}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
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