import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import {
  Users, FlaskConical, FileText, LayoutDashboard,
  ChevronLeft, ChevronRight, LogOut, Menu, X, Shield, UserCog, Package, Inbox
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { path: '/', label: 'Início', icon: LayoutDashboard, roles: ['admin', 'gestor', 'tecnico', 'auxiliar'] },
  { path: '/clientes', label: 'Clientes', icon: Users, roles: ['admin', 'gestor', 'auxiliar'] },
  { path: '/ensaios', label: 'Ensaios', icon: FlaskConical, roles: ['admin', 'gestor', 'tecnico'] },
  { path: '/fas', label: 'Fichas de Serviço (FAS)', icon: FileText, roles: ['admin', 'gestor', 'auxiliar'] },
  { path: '/materiais', label: 'Materiais', icon: Package, roles: ['admin', 'gestor', 'tecnico', 'auxiliar'] },
  { path: '/recebimento', label: 'Recebimento de Amostras', icon: Inbox, roles: ['auxiliar', 'gestor'] },
];

const BOTTOM_NAV_ITEMS = [
  { path: '/usuarios', label: 'Usuários', icon: UserCog, roles: ['admin'] },
];

const ROLE_LABELS = {
  admin: { label: 'Administrador', color: 'bg-red-100 text-red-700' },
  gestor: { label: 'Gestor/Coord.', color: 'bg-purple-100 text-purple-700' },
  tecnico: { label: 'Técnico/Lab.', color: 'bg-blue-100 text-blue-700' },
  auxiliar: { label: 'Auxiliar', color: 'bg-green-100 text-green-700' },
};

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const role = user?.role || 'auxiliar';
  const visibleItems = NAV_ITEMS.filter(item => item.roles.includes(role));
  const visibleBottomItems = BOTTOM_NAV_ITEMS.filter(item => item.roles.includes(role));
  const roleInfo = ROLE_LABELS[role] || ROLE_LABELS['auxiliar'];

  const handleLogout = () => base44.auth.logout();

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-5 border-b border-sidebar-border">
        {!collapsed ? (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-5 h-5 text-sidebar-primary" />
              <span className="font-bold text-sidebar-foreground text-base tracking-wide">AELaboratório</span>
            </div>
                     </div>
        ) : (
          <Shield className="w-5 h-5 text-sidebar-primary mx-auto" />
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {visibleItems.map(item => {
          const Icon = item.icon;
          const active = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Nav */}
      {visibleBottomItems.length > 0 && (
        <div className="px-2 pb-2 space-y-1">
          {visibleBottomItems.map(item => {
            const Icon = item.icon;
            const active = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150',
                  active
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </div>
      )}

      {/* User */}
      <div className="px-3 py-4 border-t border-sidebar-border">
        {!collapsed ? (
          <div className="space-y-2">
            <div className="px-1">
              <p className="text-xs font-medium text-sidebar-foreground truncate">{user?.full_name || 'Usuário'}</p>
              <p className="text-xs text-sidebar-foreground/50 truncate">{user?.email}</p>
              <span className={cn('inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium', roleInfo.color)}>
                {roleInfo.label}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="w-full justify-start text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <LogOut className="w-3.5 h-3.5 mr-2" />
              Sair
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="w-full text-sidebar-foreground/60 hover:text-sidebar-foreground"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden md:flex flex-col bg-sidebar transition-all duration-300 border-r border-sidebar-border flex-shrink-0',
          collapsed ? 'w-16' : 'w-60'
        )}
      >
        <SidebarContent />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-1/2 -translate-y-1/2 -right-3 bg-sidebar border border-sidebar-border rounded-full p-1 text-sidebar-foreground/50 hover:text-sidebar-foreground z-10"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="relative z-50 w-64 bg-sidebar flex flex-col">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar (mobile) */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-card border-b border-border">
          <button onClick={() => setMobileOpen(true)}>
            <Menu className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <span className="font-bold text-foreground text-sm">Controle Laboratório</span>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}