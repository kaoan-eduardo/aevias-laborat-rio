import { Link } from 'react-router-dom';
import { Users, FlaskConical, FileText, Inbox, ChevronRight, Zap, Bell, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useGreeting } from '@/hooks/useGreeting';
import { useUserRole } from '@/hooks/useUserRole';

const FAS_STATUS_CONFIG = {
  aberta:            { label: 'Aberta',         color: 'bg-amber-100 text-amber-700' },
  material_recebido: { label: 'Mat. Recebido',  color: 'bg-blue-100 text-blue-700' },
  finalizada:        { label: 'Finalizada',     color: 'bg-emerald-100 text-emerald-700' },
  cancelada:         { label: 'Cancelada',      color: 'bg-red-100 text-red-700' },
};

const STAT_CARDS = [
  { label: 'Clientes',          statKey: 'totalClientes', sub: 'cadastrados',       icon: Users,        path: '/clientes',    color: 'text-[#566E3D]', bg: 'bg-[#566E3D]/10' },
  { label: 'Ensaios',           statKey: 'totalEnsaios',  sub: 'no catálogo',       icon: FlaskConical, path: '/ensaios',     color: 'text-[#00233B]', bg: 'bg-[#00233B]/10' },
  { label: 'FAS',               statKey: 'totalFas',      sub: 'fichas registradas', icon: FileText,    path: '/fas',         color: 'text-[#566E3D]', bg: 'bg-[#566E3D]/10' },
  { label: 'Amostras recebidas',statKey: 'totalAmostras', sub: 'esta semana',       icon: Inbox,        path: '/recebimento', color: 'text-[#00233B]', bg: 'bg-[#00233B]/10' },
];

const QUICK_ACTIONS = [
  { label: 'Nova FAS',         icon: FileText,     path: '/fas/nova' },
  { label: 'Novo Ensaio',      icon: FlaskConical, path: '/ensaios' },
  { label: 'Adicionar Cliente',icon: Users,        path: '/clientes' },
  { label: 'Receber Amostra',  icon: Inbox,        path: '/recebimento' },
];

// ── Sub-componentes ──────────────────────────────────────────────────────────

function StatCardSkeleton() {
  return <div className="h-32 bg-[#F2F1EF] rounded-2xl animate-pulse" aria-hidden="true" />;
}

function StatCard({ card, value, isLoading }) {
  const Icon = card.icon;
  return (
    <Link to={card.path} aria-label={`${card.label}: ${isLoading ? 'carregando' : value} ${card.sub}`}>
      <article className="bg-white rounded-2xl p-5 border border-[#EFEBDC] shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center`} aria-hidden="true">
            <Icon className={`w-6 h-6 ${card.color}`} />
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-[#566E3D] transition-colors" aria-hidden="true" />
        </div>
        <p className="font-exo text-3xl font-bold text-[#00233B] mb-1">
          {isLoading ? <span className="animate-pulse text-muted-foreground text-lg" aria-label="Carregando">—</span> : value}
        </p>
        <p className="text-xs font-semibold text-[#00233B]/70 leading-tight">{card.label}</p>
        <p className="text-xs text-muted-foreground">{card.sub}</p>
      </article>
    </Link>
  );
}

function FasRecenteItem({ fas }) {
  const statusCfg = FAS_STATUS_CONFIG[fas.status];
  return (
    <Link to={`/fas/${fas.id}`} aria-label={`FAS ${fas.numero_fas || fas.numero_proposta} — ${statusCfg?.label}`}>
      <div className="flex items-center justify-between px-4 py-3.5 rounded-2xl bg-[#F2F1EF] hover:bg-[#EFEBDC] transition-all group">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm" aria-hidden="true">
            <FileText className="w-4 h-4 text-[#566E3D]" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-[#00233B] font-mono-data">{fas.numero_fas || fas.numero_proposta}</p>
            <p className="text-xs text-[#00233B]/50 truncate">{fas.razao_social} · {fas.nome_solicitante || fas.responsavel}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {statusCfg && (
            <Badge className={`${statusCfg.color} text-xs border-0`}>{statusCfg.label}</Badge>
          )}
          <ChevronRight className="w-4 h-4 text-[#00233B]/30 group-hover:text-[#566E3D] transition-colors" aria-hidden="true" />
        </div>
      </div>
    </Link>
  );
}

function QuickActionButton({ action }) {
  const Icon = action.icon;
  return (
    <Link to={action.path} aria-label={action.label}>
      <div className="bg-white/10 hover:bg-white/20 rounded-2xl p-3.5 text-center transition-all border border-white/10 hover:border-white/20 group">
        <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center mx-auto mb-2" aria-hidden="true">
          <Icon className="w-4 h-4 text-[#BFCF99]" />
        </div>
        <p className="text-white text-xs font-medium leading-tight">{action.label}</p>
      </div>
    </Link>
  );
}

// ── Página principal ─────────────────────────────────────────────────────────

export default function Dashboard() {
  const { stats, isLoading } = useDashboardData();
  const greeting = useGreeting();
  const { displayName } = useUserRole();

  return (
    <main className="min-h-full bg-[#F2F1EF] space-y-6 pt-6 pb-6 pr-6 pl-4">

      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-[#00233B] text-white shadow-xl" style={{ minHeight: 200 }} aria-label="Boas-vindas">
        <img
          src="https://media.base44.com/images/public/69fdf070216c826565ee0876/edb5bf300_Imagemapp.jpg"
          alt=""
          aria-hidden="true"
          className="absolute right-0 top-0 h-full w-[45%] object-cover opacity-60"
          style={{ filter: 'saturate(0.3) hue-rotate(190deg) brightness(0.5)' }}
        />
        <div className="absolute right-0 top-0 h-full w-[55%] bg-gradient-to-l from-transparent to-[#00233B]/75" aria-hidden="true" />
        <div className="relative z-10 p-8 max-w-lg">
          <p className="text-white/70 text-base mb-1">{greeting}</p>
          <h1 className="font-exo text-4xl font-bold leading-tight mb-3">{displayName}</h1>
          <div className="w-10 h-1 rounded-full bg-[#566E3D] mb-4" aria-hidden="true" />
          <p className="text-white/60 text-sm leading-relaxed">
            Bem-vindo ao <span className="text-[#BFCF99] font-semibold">AE Laboratório</span>.
            Veja o resumo de atividades e indicadores do dia.
          </p>
        </div>
      </section>

      {/* Indicadores */}
      <section aria-label="Indicadores gerais">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading
            ? Array.from({ length: 4 }, (_, i) => <StatCardSkeleton key={i} />)
            : STAT_CARDS.map(card => (
                <StatCard key={card.label} card={card} value={stats[card.statKey]} isLoading={false} />
              ))
          }
        </div>
      </section>

      {/* Conteúdo principal */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-6">

        {/* FAS Recentes */}
        <section className="bg-white rounded-3xl p-6 border border-[#EFEBDC] shadow-sm" aria-label="FAS recentes">
          <header className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#566E3D]" aria-hidden="true" />
              <h2 className="font-exo text-lg font-bold text-[#00233B]">FAS Recentes</h2>
            </div>
            <Link to="/fas" className="text-sm text-[#566E3D] font-semibold flex items-center gap-1 hover:opacity-70 transition-opacity" aria-label="Ver todas as FAS">
              Ver todas <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </header>

          {isLoading ? (
            <div className="space-y-3" aria-busy="true" aria-label="Carregando FAS recentes">
              {[1, 2, 3].map(i => <div key={i} className="h-14 bg-[#F2F1EF] rounded-xl animate-pulse" aria-hidden="true" />)}
            </div>
          ) : stats.fasRecentes.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">Nenhuma FAS cadastrada ainda.</p>
          ) : (
            <ul className="space-y-2" role="list">
              {stats.fasRecentes.map(fas => (
                <li key={fas.id}><FasRecenteItem fas={fas} /></li>
              ))}
            </ul>
          )}
        </section>

        {/* Coluna direita */}
        <aside className="space-y-5" aria-label="Atalhos e notificações">

          {/* Ações rápidas */}
          <section className="bg-[#00233B] rounded-3xl p-6 shadow-xl" aria-label="Ações rápidas">
            <header className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-[#BFCF99]" aria-hidden="true" />
              <h2 className="font-exo text-base font-bold text-white">Ações rápidas</h2>
            </header>
            <nav aria-label="Atalhos de navegação rápida">
              <ul className="grid grid-cols-2 gap-3" role="list">
                {QUICK_ACTIONS.map(action => (
                  <li key={action.label}><QuickActionButton action={action} /></li>
                ))}
              </ul>
            </nav>
          </section>

          {/* Notificações */}
          <section className="bg-white rounded-3xl p-6 border border-[#EFEBDC] shadow-sm" aria-label="Notificações">
            <header className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-[#566E3D]" aria-hidden="true" />
              <h2 className="font-exo text-base font-bold text-[#00233B]">Notificações</h2>
            </header>
            <ul className="space-y-4" role="list">
              {stats.fasRecentes.slice(0, 1).map(fas => (
                <li key={fas.id} className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-[#BFCF99] mt-1.5 flex-shrink-0" aria-hidden="true" />
                  <div>
                    <p className="text-xs font-semibold text-[#00233B]">{fas.numero_fas} foi {FAS_STATUS_CONFIG[fas.status]?.label?.toLowerCase()}</p>
                    <p className="text-xs text-muted-foreground">recentemente</p>
                  </div>
                </li>
              ))}
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-[#566E3D] mt-1.5 flex-shrink-0" aria-hidden="true" />
                <div>
                  <p className="text-xs font-semibold text-[#00233B]">Verificações Diárias</p>
                  <p className="text-xs text-muted-foreground">Acesse o módulo de verificações</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" aria-hidden="true" />
                <div>
                  <p className="text-xs font-semibold text-[#00233B]">Equipamentos</p>
                  <p className="text-xs text-muted-foreground">Verifique calibrações pendentes</p>
                </div>
              </li>
            </ul>
          </section>

        </aside>
      </div>
    </main>
  );
}