import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Search, Package, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

export default function Materiais() {
  const [materiais, setMateriais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [novoNome, setNovoNome] = useState('');
  const [novaCategoria, setNovaCategoria] = useState('');
  const [editando, setEditando] = useState(null);
  const [salvando, setSalvando] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.Material.list('-created_date');
    setMateriais(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = materiais.filter(m =>
    m.nome?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSalvar = async () => {
    if (!novoNome.trim()) return;
    setSalvando(true);
    const payload = { nome: novoNome.trim() };
    if (novaCategoria) payload.categoria = novaCategoria;
    
    if (editando) {
      await base44.entities.Material.update(editando.id, payload);
      setEditando(null);
    } else {
      await base44.entities.Material.create(payload);
    }
    setNovoNome('');
    setNovaCategoria('');
    setSalvando(false);
    load();
  };

  const handleEditar = (m) => {
    setEditando(m);
    setNovoNome(m.nome);
    setNovaCategoria(m.categoria || '');
  };

  const handleCancelar = () => {
    setEditando(null);
    setNovoNome('');
    setNovaCategoria('');
  };

  const handleExcluir = async (m) => {
    await base44.entities.Material.delete(m.id);
    load();
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Materiais</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Cadastro de materiais do laboratório</p>
      </div>

      {/* Formulário */}
      <Card>
        <CardContent className="p-4">
          <p className="text-sm font-semibold text-foreground mb-3">
            {editando ? 'Editar Material' : 'Novo Material'}
          </p>
          <div className="flex gap-2">
            <Input
              placeholder="Nome do material..."
              value={novoNome}
              onChange={e => setNovoNome(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSalvar()}
              className="flex-1"
            />
            <Select value={novaCategoria} onValueChange={setNovaCategoria}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Categoria..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CAUQ">CAUQ</SelectItem>
                <SelectItem value="CONCRETO">CONCRETO</SelectItem>
                <SelectItem value="SOLO">SOLO</SelectItem>
                <SelectItem value="AGREGADO">AGREGADO</SelectItem>
                <SelectItem value="LIGANTES">LIGANTES</SelectItem>
                <SelectItem value="MRAF">MRAF</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSalvar} disabled={!novoNome.trim() || salvando} className="gap-2">
              <Plus className="w-4 h-4" />
              {editando ? 'Salvar' : 'Adicionar'}
            </Button>
            {editando && (
              <Button variant="outline" onClick={handleCancelar}>
                Cancelar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Busca */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar material..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Lista */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-10 bg-muted rounded animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">{search ? 'Nenhum material encontrado.' : 'Nenhum material cadastrado ainda.'}</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map(m => (
                <div key={m.id} className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{m.nome}</p>
                    {m.categoria && <p className="text-xs text-muted-foreground">{m.categoria}</p>}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditar(m)}>
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleExcluir(m)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}