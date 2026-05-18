import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Plus, Search, FlaskConical, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import EnsaioModal from '@/components/ensaios/EnsaioModal';

const CATEGORIA_CONFIG = {
  asfalto: { label: 'Asfalto', color: 'bg-amber-100 text-amber-800' },
  agregado: { label: 'Agregado', color: 'bg-gray-100 text-gray-800' },
  solos: { label: 'Solos', color: 'bg-emerald-100 text-emerald-800' },
  concreto: { label: 'Concreto', color: 'bg-blue-100 text-blue-700' },
  outros: { label: 'Outros', color: 'bg-pink-100 text-pink-800' },
  projeto: { label: 'Projeto', color: 'bg-blue-200 text-blue-800' },
  mraf: { label: 'MRAF', color: 'bg-purple-100 text-purple-800' }
};

export default function Ensaios() {
  const { user } = useAuth();
  const [ensaios, setEnsaios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState('todos');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEnsaio, setEditingEnsaio] = useState(null);

  const role = user?.role || 'tecnico';
  const canEdit = role === 'admin' || role === 'gestor';

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.Ensaio.list('nome');
    setEnsaios(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = ensaios.filter(e => {
    const matchSearch = e.nome?.toLowerCase().includes(search.toLowerCase()) ||
      e.norma?.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoriaFilter === 'todos' || e.categoria === categoriaFilter;
    return matchSearch && matchCat;
  });

  const handleNew = () => { setEditingEnsaio(null); setModalOpen(true); };
  const handleEdit = (e) => { setEditingEnsaio(e); setModalOpen(true); };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cadastro de Ensaios</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Catálogo técnico de ensaios realizados</p>
        </div>
        {canEdit && (
          <Button onClick={handleNew} className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Ensaio
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou norma..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          {['todos','agregado', 'asfalto', 'solos', 'concreto', 'outros', 'projeto', 'mraf'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoriaFilter(cat)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors border ${
                categoriaFilter === cat
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-muted-foreground border-border hover:border-primary/50'
              }`}
            >
              {cat === 'todos' ? 'Todos' : CATEGORIA_CONFIG[cat]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[1,2,3,4,5].map(i => <div key={i} className="h-12 bg-muted rounded animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <FlaskConical className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">{search ? 'Nenhum ensaio encontrado.' : 'Nenhum ensaio cadastrado ainda.'}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Ensaio</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Norma</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Categoria</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Unidade</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Prazo (dias)</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Status</th>
                    {canEdit && <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Ações</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map(e => {
                    const cat = CATEGORIA_CONFIG[e.categoria] || CATEGORIA_CONFIG.outros;
                    return (
                      <tr key={e.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-medium text-foreground">{e.nome}</td>
                        <td className="px-4 py-3 text-muted-foreground font-mono-data text-xs">{e.norma}</td>
                        <td className="px-4 py-3">
                          <Badge className={cat.color + ' text-xs'}>{cat.label}</Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{e.unidade_padrao || '—'}</td>
                        <td className="px-4 py-3 text-muted-foreground font-mono-data">{e.prazo_padrao_dias || '—'}</td>
                        <td className="px-4 py-3">
                          <Badge className={e.ativo !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}>
                            {e.ativo !== false ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </td>
                        {canEdit && (
                          <td className="px-4 py-3 text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(e)} className="h-8 w-8">
                              <Edit2 className="w-3.5 h-3.5" />
                            </Button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <EnsaioModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        ensaio={editingEnsaio}
        onSaved={load}
      />
    </div>
  );
}