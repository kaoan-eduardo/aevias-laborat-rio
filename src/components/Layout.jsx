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
import { podeVerPagina } from '@/business-rules/acessos';

// Itens do grupo "Cadastros"
const CADASTROS_ITEMS = [
{ path: '/clientes', label: 'Clientes', icon: Users },
{ path: '/ensaios', label: 'Ensaios', icon: FlaskConical },
{ path: '/materiais', label: 'Materiais', icon: Package }];

const NAV_ITEMS = [
{ path: '/', label: 'Início', icon: LayoutDashboard },
{ path: '/fas', label: 'FAS', icon: FileText },
{ path: '/recebimento', label: 'Recebimento de Amostras', icon: Inbox },
{ path: '/equipamentos', label: 'Equipamentos', icon: Wrench },
{ path: '/verificacoes', label: 'Verificações Diárias', icon: ClipboardCheck }];

const BOTTOM_NAV_ITEMS = [
{ path: '/usuarios', label: 'Usuários', icon: UserCog, adminOnly: true },
{ path: '/auditoria', label: 'Auditoria', icon: ShieldCheck }];

const ROLE_LABELS = {
  admin: { label: 'Administrador', color: 'bg-[#566E3D]/20 text-[#BFCF99]' },
  user: { label: 'Usuário', color: 'bg-white/10 text-white/80' }
};

function SidebarContent({ collapsed, setMobileOpen, visibleItems, visibleBottomItems, visibleCadastros, roleInfo, user, handleLogout }) {
  const location = useLocation();
  const cadastrosActive = CADASTROS_ITEMS.some((i) => location.pathname.startsWith(i.path));
  const [cadastrosOpen, setCadastrosOpen] = useState(cadastrosActive);

  return (
    <div className="flex flex-col h-full bg-[#00233B] rounded-[14px]">
      {/* Logo */}
      <div className={cn("border-b border-white/10 flex items-center justify-center pr-5 pt-5 pl-5 pb-4", collapsed && 'px-3')}>
        {!collapsed ?
        <img
          src="https://media.base44.com/images/public/69fdf070216c826565ee0876/2e0d01e80_AE-LogoHor_Negativo.png"
          alt="Afirma E-vias"
          className="h-10 object-contain mt-1" /> :


        <div className="w-9 h-9 rounded-xl bg-[#566E3D] flex items-center justify-center">
            <span className="text-white font-exo font-bold text-xs">AE</span>
          </div>
        }
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
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
                  <span className="flex-1 text-left text-xs">Cadastros</span>
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
  const visibleItems = NAV_ITEMS.filter((item) => podeVerPagina(user, item.path));
  const visibleCadastros = CADASTROS_ITEMS.filter((item) => podeVerPagina(user, item.path));
  const visibleBottomItems = BOTTOM_NAV_ITEMS.filter((item) =>
  item.adminOnly ? role === 'admin' : podeVerPagina(user, item.path)
  );
  const roleInfo = ROLE_LABELS[role] || ROLE_LABELS['user'];

  const handleLogout = () => base44.auth.logout();
  const sidebarProps = { collapsed, setMobileOpen, visibleItems, visibleCadastros, visibleBottomItems, roleInfo, user, handleLogout };

  return (
    <div className="flex h-screen bg-[#F2F1EF] overflow-hidden">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col flex-shrink-0 relative transition-all duration-300 w-[250px] rounded-2xl",
          collapsed ? 'w-[72px]' : ""
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
          <img
            src="https://media.base44.com/images/public/69fdf070216c826565ee0876/2e0d01e80_AE-LogoHor_Negativo.png"
            alt="Afirma E-vias"
            className="h-7 object-contain" />
          
        </header>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>);

}