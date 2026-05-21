import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import {
  Users, FlaskConical, FileText, LayoutDashboard,
  LogOut, Menu, UserCog, Package, Inbox, Wrench, ClipboardCheck, ChevronLeft, ChevronRight,
  BookOpen, ChevronDown, ShieldCheck } from
'lucide-react';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';

// Itens do grupo "Cadastros"
const CADASTROS_ITEMS = [
{ path: '/clientes', label: 'Clientes', icon: Users, roles: ['admin', 'user'] },
{ path: '/ensaios', label: 'Ensaios', icon: FlaskConical, roles: ['admin', 'user'] },
{ path: '/materiais', label: 'Materiais', icon: Package, roles: ['admin', 'user'] }];


const NAV_ITEMS = [
{ path: '/', label: 'Início', icon: LayoutDashboard, roles: ['admin', 'user'] },
{ path: '/fas', label: 'FAS', icon: FileText, roles: ['admin', 'user'] },
{ path: '/recebimento', label: 'Recebimento de Amostras', icon: Inbox, roles: ['admin', 'user'] },
{ path: '/equipamentos', label: 'Equipamentos', icon: Wrench, roles: ['admin', 'user'] },
{ path: '/verificacoes', label: 'Verificações Diárias', icon: ClipboardCheck, roles: ['admin', 'user'] }];


const BOTTOM_NAV_ITEMS = [
{ path: '/usuarios', label: 'Usuários', icon: UserCog, roles: ['admin'] },
{ path: '/auditoria', label: 'Auditoria', icon: ShieldCheck, roles: ['admin'] }];


const ROLE_LABELS = {
  admin: { label: 'Administrador', color: 'bg-[#566E3D]/20 text-[#BFCF99]' },
  user: { label: 'Usuário', color: 'bg-white/10 text-white/80' }
};

function SidebarContent({ collapsed, setMobileOpen, visibleItems, visibleBottomItems, visibleCadastros, roleInfo, user, handleLogout }) {
  const location = useLocation();
  const cadastrosActive = CADASTROS_ITEMS.some((i) => location.pathname.startsWith(i.path));
  const [cadastrosOpen, setCadastrosOpen] = useState(cadastrosActive);

  return (
    <div className="flex flex-col h-full bg-[#00233B]">
      {/* Logo */}
      <div className={cn('px-5 py-6 border-b border-white/10', collapsed && 'px-3')}>
        {!collapsed ?
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#566E3D] flex items-center justify-center flex-shrink-0">
              <span className="text-white font-exo font-bold text-sm">AE</span>
            </div>
            <div>
              <p className="font-exo font-bold text-white text-base leading-tight">Afirma E-vias</p>
              <p className="text-white/50 text-xs">Laboratório Central</p>
            </div>
          </div> :

        <div className="w-10 h-10 rounded-2xl bg-[#566E3D] flex items-center justify-center mx-auto">
            <span className="text-white font-exo font-bold text-sm">AE</span>
          </div>
        }
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto pt-4 pb-4 pl-3 pr-4">
        {/* Início */}
        {visibleItems.filter((i) => i.path === '/').map((item) => {
          const Icon = item.icon;
          const active = location.pathname === '/';
          return (
            <Link key={item.path} to={item.path} onClick={() => setMobileOpen(false)}
            className={cn("flex items-center gap-3 px-4 py-2.5 rounded-2xl font-small transition-all duration-150 text-xs",
            active ? 'bg-white text-[#00233B] shadow-md' : 'text-white/65 hover:bg-white/10 hover:text-white'
            )}>
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>);

        })}

        {/* Grupo Cadastros */}
        {visibleCadastros.length > 0 &&
        <div>
            <button
            onClick={() => !collapsed && setCadastrosOpen((o) => !o)}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-small transition-all duration-150',
              cadastrosActive ? 'text-white' : 'text-white/65 hover:bg-white/10 hover:text-white'
            )}>
            
              <BookOpen className="w-4 h-4 flex-shrink-0" />
              {!collapsed &&
            <>
                  <span className="flex-1 text-left">Cadastros</span>
                  <ChevronDown className={cn('w-3.5 h-3.5 transition-transform duration-200', cadastrosOpen && 'rotate-180')} />
                </>
            }
            </button>
            {!collapsed && cadastrosOpen &&
          <div className="ml-3 mt-0.5 space-y-0.5 border-l border-white/10 pl-3">
                {visibleCadastros.map((item) => {
              const Icon = item.icon;
              const active = location.pathname.startsWith(item.path);
              return (
                <Link key={item.path} to={item.path} onClick={() => setMobileOpen(false)}
                className={cn('flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-small transition-all duration-150',
                active ? 'bg-white text-[#00233B] shadow-md' : 'text-white/60 hover:bg-white/10 hover:text-white'
                )}>
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate text-xs">{item.label}</span>
                    </Link>);

            })}
              </div>
          }
          </div>
        }

        {/* Demais itens (exceto Início) */}
        {visibleItems.filter((i) => i.path !== '/').map((item) => {
          const Icon = item.icon;
          const active = location.pathname.startsWith(item.path);
          return (
            <Link key={item.path} to={item.path} onClick={() => setMobileOpen(false)}
            className={cn("flex items-center gap-3 px-4 py-2.5 rounded-2xl font-small transition-all duration-150 text-xs",
            active ? 'bg-white text-[#00233B] shadow-md' : 'text-white/65 hover:bg-white/10 hover:text-white'
            )}>
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>);

        })}
      </nav>

      {/* Bottom nav */}
      {visibleBottomItems.length > 0 &&
      <div className="px-3 pb-2 space-y-1">
          {visibleBottomItems.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-2xl font-medium transition-all duration-150 text-xs",
                active ?
                'bg-white text-[#00233B] shadow-md' :
                'text-white/65 hover:bg-white/10 hover:text-white'
              )}>
              
                <Icon className="w-4 h-4 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>);

        })}
        </div>
      }

      {/* User card */}
      <div className="px-3 py-4 border-t border-white/10">
        {!collapsed ?
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#566E3D] flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xs">
                  {user?.full_name?.split(' ').map((n) => n[0]).slice(0, 2).join('') || 'U'}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-white text-xs font-semibold truncate">{user?.nome_exibicao || 'Usuário'}</p>
                <p className="text-white/50 text-xs truncate">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', roleInfo.color)}>
                {roleInfo.label}
              </span>
              <button
              onClick={handleLogout}
              className="text-white/40 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
              title="Sair">
              
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div> :

        <button
          onClick={handleLogout}
          className="w-full flex justify-center text-white/40 hover:text-white transition-colors p-2 rounded-xl hover:bg-white/10">
          
            <LogOut className="w-4 h-4" />
          </button>
        }
      </div>
    </div>);

}

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

  const role = user?.role || 'user';
  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(role));
  const visibleCadastros = CADASTROS_ITEMS.filter((item) => item.roles.includes(role));
  const visibleBottomItems = BOTTOM_NAV_ITEMS.filter((item) => item.roles.includes(role));
  const roleInfo = ROLE_LABELS[role] || ROLE_LABELS['user'];

  const handleLogout = () => base44.auth.logout();
  const sidebarProps = { collapsed, setMobileOpen, visibleItems, visibleCadastros, visibleBottomItems, roleInfo, user, handleLogout };

  return (
    <div className="flex h-screen bg-[#F2F1EF] overflow-hidden">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden md:flex flex-col flex-shrink-0 relative transition-all duration-300',
          collapsed ? 'w-[72px]' : 'w-[240px]'
        )}>
        
        <SidebarContent {...sidebarProps} />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-1/2 -translate-y-1/2 -right-3 bg-[#00233B] border border-white/20 rounded-full p-1 text-white/50 hover:text-white z-10 shadow-md">
          
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen &&
      <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="relative z-50 w-64 flex flex-col">
            <SidebarContent {...sidebarProps} />
          </aside>
        </div>
      }

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar (mobile) */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-[#00233B] border-b border-white/10">
          <button onClick={() => setMobileOpen(true)}>
            <Menu className="w-10 h-10 text-white" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#566E3D] flex items-center justify-center">
              <span className="text-white font-bold text-xs">AE</span>
            </div>
            <span className="font-exo font-bold text-white text-sm">Afirma E-vias</span>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>);

}