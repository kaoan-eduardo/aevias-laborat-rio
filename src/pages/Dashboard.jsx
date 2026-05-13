import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users, FlaskConical, FileText, Inbox, ChevronRight,
  Zap, Bell, Clock
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const STATUS_CONFIG = {
  aberta: { label: 'Aberta', color: 'bg-amber-100 text-amber-700' },
  material_recebido: { label: 'Mat. Recebido', color: 'bg-blue-100 text-blue-700' },
  finalizada: { label: 'Finalizada', color: 'bg-emerald-100 text-emerald-700' },
  cancelada: { label: 'Cancelada', color: 'bg-red-100 text-red-700' },
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ clientes: 0, ensaios: 0, fas: 0, amostras: 0, fasRecentes: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [clientes, ensaios, fas, amostras] = await Promise.all([
        base44.entities.Cliente.list(),
        base44.entities.Ensaio.list(),
        base44.entities.FAS.list('-created_date', 20),
        base44.entities.RecebimentoAmostra.list('-created_date', 20),
      ]);
      setStats({
        clientes: clientes.length,
        ensaios: ensaios.length,
        fas: fas.length,
        amostras: amostras.length,
        fasRecentes: fas.slice(0, 5),
      });
      setLoading(false);
    };
    load();
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Bom dia,';
    if (h < 18) return 'Boa tarde,';
    return 'Boa noite,';
  };

  const firstName = user?.full_name?.split(' ')[0] || 'usuário';
  const role = user?.role || 'auxiliar';

  const STAT_CARDS = [
    { label: 'Clientes', value: stats.clientes, sub: 'cadastrados', icon: Users, path: '/clientes', color: 'text-[#566E3D]', bg: 'bg-[#566E3D]/10' },
    { label: 'Ensaios', value: stats.ensaios, sub: 'no catálogo', icon: FlaskConical, path: '/ensaios', color: 'text-[#00233B]', bg: 'bg-[#00233B]/10' },
    { label: 'Fichas de Serviço (FAS)', value: stats.fas, sub: 'fichas registradas', icon: FileText, path: '/fas', color: 'text-[#566E3D]', bg: 'bg-[#566E3D]/10' },
    { label: 'Amostras recebidas', value: stats.amostras, sub: 'esta semana', icon: Inbox, path: '/recebimento', color: 'text-[#00233B]', bg: 'bg-[#00233B]/10' },
  ];

  const QUICK_ACTIONS = [
    { label: 'Nova FAS', icon: FileText, path: '/fas/nova', color: 'text-[#566E3D]', bg: 'bg-[#566E3D]/10' },
    { label: 'Novo Ensaio', icon: FlaskConical, path: '/ensaios', color: 'text-[#00233B]', bg: 'bg-[#00233B]/10' },
    { label: 'Adicionar Cliente', icon: Users, path: '/clientes', color: 'text-[#566E3D]', bg: 'bg-[#566E3D]/10' },
    { label: 'Receber Amostra', icon: Inbox, path: '/recebimento', color: 'text-[#00233B]', bg: 'bg-[#00233B]/10' },
  ];

  return (
    <div className="min-h-full bg-[#F2F1EF] p-6 space-y-6">

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-[#00233B] text-white shadow-xl" style={{ minHeight: 200 }}>
        {/* Road image */}
        <img
          src="https://images.unsplash.com/photo-1486325212027-8081e485255e?w=900&q=80&auto=format&fit=crop"
          alt="estrada"
          className="absolute right-0 top-0 h-full w-[45%] object-cover opacity-60"
        />
        {/* Overlay gradient */}
        <div className="absolute right-0 top-0 h-full w-[55%] bg-gradient-to-l from-transparent to-[#00233B]" />

        {/* Content */}
        <div className="relative z-10 p-8 max-w-lg">
          <p className="text-white/70 text-base mb-1">{greeting()}</p>
          <h1 className="font-exo text-4xl font-bold leading-tight mb-3">{firstName}</h1>
          <div className="w-10 h-1 rounded-full bg-[#566E3D] mb-4" />
          <p className="text-white/60 text-sm leading-relaxed">
            Bem-vindo ao <span className="text-[#BFCF99] font-semibold">AE Laboratório</span>. Veja o resumo de atividades e indicadores do dia.
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(card => {
          const Icon = card.icon;
          return (
            <Link key={card.label} to={card.path}>
              <div className="bg-white rounded-2xl p-5 border border-[#EFEBDC] shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${card.color}`} />
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-[#566E3D] transition-colors" />
                </div>
                <p className="font-exo text-3xl font-bold text-[#00233B] mb-1">
                  {loading ? <span className="animate-pulse text-muted-foreground text-lg">—</span> : card.value}
                </p>
                <p className="text-xs font-semibold text-[#00233B]/70 leading-tight">{card.label}</p>
                <p className="text-xs text-muted-foreground">{card.sub}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-6">

        {/* Recent FAS */}
        <div className="bg-white rounded-3xl p-6 border border-[#EFEBDC] shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#566E3D]" />
              <h3 className="font-exo text-lg font-bold text-[#00233B]">Fichas de Serviço Recentes</h3>
            </div>
            <Link to="/fas" className="text-sm text-[#566E3D] font-semibold flex items-center gap-1 hover:opacity-70 transition-opacity">
              Ver todas <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-14 bg-[#F2F1EF] rounded-xl animate-pulse" />)}
            </div>
          ) : stats.fasRecentes.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">Nenhuma FAS cadastrada ainda.</p>
          ) : (
            <div className="space-y-2">
              {stats.fasRecentes.map(fas => (
                <Link key={fas.id} to={`/fas/${fas.id}`}>
                  <div className="flex items-center justify-between px-4 py-3.5 rounded-2xl bg-[#F2F1EF] hover:bg-[#EFEBDC] transition-all group cursor-pointer">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                        <FileText className="w-4 h-4 text-[#566E3D]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#00233B] font-mono-data">{fas.numero_fas || fas.numero_proposta}</p>
                        <p className="text-xs text-[#00233B]/50 truncate">{fas.razao_social} · {fas.nome_solicitante || fas.responsavel}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge className={`${STATUS_CONFIG[fas.status]?.color} text-xs border-0`}>
                        {STATUS_CONFIG[fas.status]?.label}
                      </Badge>
                      <ChevronRight className="w-4 h-4 text-[#00233B]/30 group-hover:text-[#566E3D] transition-colors" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Quick Actions */}
          <div className="bg-[#00233B] rounded-3xl p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-[#BFCF99]" />
              <h3 className="font-exo text-base font-bold text-white">Ações rápidas</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {QUICK_ACTIONS.map(action => {
                const Icon = action.icon;
                return (
                  <Link key={action.label} to={action.path}>
                    <div className="bg-white/10 hover:bg-white/20 rounded-2xl p-3.5 text-center cursor-pointer transition-all border border-white/10 hover:border-white/20 group">
                      <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center mx-auto mb-2">
                        <Icon className="w-4 h-4 text-[#BFCF99]" />
                      </div>
                      <p className="text-white text-xs font-medium leading-tight">{action.label}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Notifications placeholder */}
          <div className="bg-white rounded-3xl p-6 border border-[#EFEBDC] shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#566E3D]" />
                <h3 className="font-exo text-base font-bold text-[#00233B]">Notificações</h3>
              </div>
            </div>
            <div className="space-y-4">
              {stats.fasRecentes.slice(0, 1).map(fas => (
                <div key={fas.id} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#BFCF99] mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-[#00233B]">{fas.numero_fas} foi {STATUS_CONFIG[fas.status]?.label?.toLowerCase()}</p>
                    <p className="text-xs text-muted-foreground">recentemente</p>
                  </div>
                </div>
              ))}
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-[#566E3D] mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-[#00233B]">Verificações Diárias</p>
                  <p className="text-xs text-muted-foreground">Acesse o módulo de verificações</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-[#00233B]">Equipamentos</p>
                  <p className="text-xs text-muted-foreground">Verifique calibrações pendentes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}