import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Search, Users, Edit2, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import UsuarioModal from '@/components/usuarios/UsuarioModal';

const ROLE_LABELS = {
  admin: { label: 'Administrador', color: 'bg-red-100 text-red-700' },
  user: { label: 'Usuário', color: 'bg-blue-100 text-blue-700' },
};

export default function Usuarios() {
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState(null);

  const role = user?.role || 'user';
  const isAdmin = role === 'admin';

  const load = async () => {
    setLoading(true);
    const res = await base44.functions.invoke('listarUsuarios', {});
    setUsuarios(res.data?.usuarios || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const displayName = (u) => u.nome_exibicao || u.full_name || '—';

  const filtered = usuarios.filter(u =>
    displayName(u).toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.cargo?.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (u) => { setEditingUsuario(u); setModalOpen(true); };

  const handleToggle = async (u) => {
    await base44.functions.invoke('atualizarUsuario', { userId: u.id, data: { ativo: !u.ativo } });
    load();
  };

  if (!isAdmin) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-8 text-center">
            <Users className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="font-semibold text-red-800">Acesso Restrito</p>
            <p className="text-sm text-red-600 mt-1">Apenas administradores podem gerenciar usuários.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Usuários</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Gerencie os níveis de acesso e dados dos usuários</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, e-mail ou cargo..."
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
              {[1, 2, 3, 4].map(i => <div key={i} className="h-12 bg-muted rounded animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">{search ? 'Nenhum usuário encontrado.' : 'Nenhum usuário cadastrado ainda.'}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Nome</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">E-mail</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Cargo</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Nível de Acesso</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map(u => {
                    const roleInfo = ROLE_LABELS[u.role] || { label: u.role || '—', color: 'bg-gray-100 text-gray-600' };
                    const isSelf = u.id === user?.id;
                    return (
                      <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                              {displayName(u).charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{displayName(u)}</p>
                              {isSelf && <span className="text-xs text-muted-foreground">(você)</span>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs font-mono-data">{u.email}</td>
                        <td className="px-4 py-3 text-muted-foreground">{u.cargo || '—'}</td>
                        <td className="px-4 py-3">
                          <Badge className={roleInfo.color}>{roleInfo.label}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={u.ativo !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}>
                            {u.ativo !== false ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(u)}>
                              <Edit2 className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost" size="icon" className="h-8 w-8"
                              onClick={() => handleToggle(u)}
                              disabled={isSelf}
                              title={isSelf ? 'Não é possível desativar a si mesmo' : ''}
                            >
                              {u.ativo !== false
                                ? <ToggleRight className="w-4 h-4 text-green-600" />
                                : <ToggleLeft className="w-4 h-4 text-gray-400" />
                              }
                            </Button>
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

      <UsuarioModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        usuario={editingUsuario}
        onSaved={load}
        currentUserRole={role}
      />
    </div>
  );
}