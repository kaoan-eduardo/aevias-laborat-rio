import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Link } from 'react-router-dom';
import { Users, FlaskConical, FileText, Clock, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const STATUS_CONFIG = {
  rascunho: { label: 'Rascunho', color: 'bg-gray-100 text-gray-600' },
  aguardando_aprovacao: { label: 'Aguardando Aprovação', color: 'bg-yellow-100 text-yellow-700' },
  aprovada: { label: 'Aprovada', color: 'bg-blue-100 text-blue-700' },
  em_andamento: { label: 'Em Andamento', color: 'bg-purple-100 text-purple-700' },
  concluida: { label: 'Concluída', color: 'bg-green-100 text-green-700' },
  cancelada: { label: 'Cancelada', color: 'bg-red-100 text-red-700' },
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ clientes: 0, ensaios: 0, fas: 0, fasRecentes: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [clientes, ensaios, fas] = await Promise.all([
        base44.entities.Cliente.list(),
        base44.entities.Ensaio.list(),
        base44.entities.FAS.list('-created_date', 10),
      ]);
      setStats({ clientes: clientes.length, ensaios: ensaios.length, fas: fas.length, fasRecentes: fas.slice(0, 5) });
      setLoading(false);
    };
    load();
  }, []);

  const role = user?.role || 'auxiliar';
  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-foreground">Início</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {greeting()}, {user?.full_name?.split(' ')[0] || 'usuário'} — {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Botões de Navegação Principal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {(role === 'admin' || role === 'gestor' || role === 'auxiliar') && (
          <Link to="/clientes">
            <Card className="hover:shadow-lg transition-all border-border cursor-pointer group hover:border-primary/30">
              <CardContent className="p-6 flex items-center gap-5">
                <div className="p-4 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">Clientes</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{loading ? '—' : stats.clientes} cadastrados</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        )}
        {(role === 'admin' || role === 'gestor' || role === 'tecnico') && (
          <Link to="/ensaios">
            <Card className="hover:shadow-lg transition-all border-border cursor-pointer group hover:border-blue-300">
              <CardContent className="p-6 flex items-center gap-5">
                <div className="p-4 rounded-xl bg-blue-50 group-hover:bg-blue-100 transition-colors">
                  <FlaskConical className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">Ensaios</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{loading ? '—' : stats.ensaios} no catálogo</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        )}
      </div>

      {/* FAS card separado menor */}
      {(role === 'admin' || role === 'gestor' || role === 'auxiliar') && (
        <Link to="/fas">
          <Card className="hover:shadow-md transition-all border-border cursor-pointer group hover:border-purple-300">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-50 group-hover:bg-purple-100 transition-colors">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-base font-semibold text-foreground">Fichas de Serviço (FAS)</p>
                <p className="text-sm text-muted-foreground">{loading ? '—' : stats.fas} fichas registradas</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      )}


      {/* Recent FAS */}
      {(role === 'admin' || role === 'gestor' || role === 'auxiliar') && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              Fichas de Serviço Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-10 bg-muted rounded animate-pulse" />)}
              </div>
            ) : stats.fasRecentes.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-6">Nenhuma FAS cadastrada ainda.</p>
            ) : (
              <div className="divide-y divide-border">
                {stats.fasRecentes.map(fas => (
                  <div key={fas.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground font-mono-data">{fas.numero_fas || fas.numero_proposta}</p>
                      <p className="text-xs text-muted-foreground truncate">{fas.razao_social} · {fas.nome_solicitante}</p>
                    </div>
                    <Badge className={STATUS_CONFIG[fas.status]?.color + ' text-xs flex-shrink-0'}>
                      {STATUS_CONFIG[fas.status]?.label}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Laboratorista message */}
      {role === 'tecnico' && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-5 flex items-center gap-4">
            <FlaskConical className="w-8 h-8 text-blue-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-blue-900">Área do Técnico/Laboratorista</p>
              <p className="text-sm text-blue-700 mt-1">
                Para preservar a imparcialidade, você tem acesso apenas aos ensaios pelo catálogo técnico, sem identificação de clientes ou propostas.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}