import { 
  LayoutDashboard, 
  Users, 
  Banknote, 
  Church, 
  Briefcase,
  ClipboardList,
  Calendar, 
  ScrollText, 
  Settings, 
  LogOut,
  UserCircle,
  Menu,
  X,
  ShieldCheck,
  GraduationCap,
  MessageSquare,
  Clock,
  History,
  Baby,
  Cake,
  Key,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../stores/authStore';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  collapsed: boolean;
  onCollapseChange: (collapsed: boolean) => void;
}

export default function Sidebar({ activeTab, setActiveTab, onLogout, collapsed, onCollapseChange }: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [canScrollTop, setCanScrollTop] = useState(false);
  const [canScrollBottom, setCanScrollBottom] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  const checkScroll = () => {
    if (!navRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = navRef.current;
    setCanScrollTop(scrollTop > 2);
    setCanScrollBottom(scrollTop + clientHeight < scrollHeight - 2);
  };

  useEffect(() => {
    checkScroll();
    const handleResize = () => checkScroll();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { profile, hasRole } = useAuth();

  const menuItems = [
    { id: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['ADMIN', 'PASTOR', 'SECRETARY', 'TREASURER', 'DEPT_LEADER', 'MEMBER'] },
    { id: '/secretary', icon: ClipboardList, label: 'Secretaria', roles: ['SECRETARY', 'ADMIN'] },
    { id: '/members', icon: Users, label: 'Base de Membros', roles: ['ADMIN', 'SECRETARY', 'PASTOR', 'DEPT_LEADER'] },
    { id: '/kids', icon: Baby, label: 'Crianças', roles: ['ADMIN', 'SECRETARY', 'DEPT_LEADER'] },
    { id: '/birthdays', icon: Cake, label: 'Aniversariantes', roles: ['ADMIN', 'PASTOR', 'SECRETARY', 'TREASURER', 'DEPT_LEADER', 'MEMBER'] },
    { id: '/users', icon: Key, label: 'Utilizadores', roles: ['ADMIN'] },
    { id: '/financial', icon: Banknote, label: 'Financeiro', roles: ['ADMIN', 'TREASURER', 'PASTOR'] },
    { id: '/worship', icon: Church, label: 'Cultos', roles: ['ADMIN', 'SECRETARY', 'PASTOR'] },
    { id: '/departments', icon: Briefcase, label: 'Departamentos', roles: ['ADMIN', 'PASTOR', 'DEPT_LEADER'] },
    { id: '/schedules', icon: Clock, label: 'Escalas', roles: ['ADMIN', 'SECRETARY'] },
    { id: '/agenda', icon: Calendar, label: 'Agenda', roles: ['ADMIN', 'SECRETARY', 'PASTOR'] },
    { id: '/schools', icon: GraduationCap, label: 'Escolas', roles: ['ADMIN', 'SECRETARY', 'DEPT_LEADER'] },
    { id: '/leadership', icon: ShieldCheck, label: 'Liderança', roles: ['ADMIN', 'PASTOR'] },
    { id: '/communication', icon: MessageSquare, label: 'Comunicação', roles: ['ADMIN', 'SECRETARY'] },
    { id: '/pastor', icon: UserCircle, label: 'Área do Pastor', roles: ['ADMIN', 'PASTOR'] },
    { id: '/audit', icon: History, label: 'Auditoria', roles: ['ADMIN'] },
    { id: '/settings', icon: Settings, label: 'Definições', roles: ['ADMIN', 'PASTOR', 'SECRETARY'] },
  ].filter(item => {
    if (!profile) return false;
    return item.roles.some(role => profile.roles.includes(role as any));
  });

  return (
    <>
      {isMobileOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
        />
      )}

      <button 
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-nexus-card rounded-lg border border-nexus-border shadow-lg"
        aria-label={isMobileOpen ? 'Fechar menu' : 'Abrir menu'}
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <motion.aside
        initial={false}
        animate={{ 
          width: collapsed ? 72 : 260,
          x: isMobileOpen ? 0 : undefined,
        }}
        className={`fixed left-0 top-0 h-screen bg-nexus-card border-r border-nexus-border z-40 flex flex-col transition-[width] duration-200 overflow-hidden
          ${isMobileOpen ? 'flex' : 'hidden lg:flex'}
        `}
        role="navigation"
        aria-label="Menu principal"
      >
        <div className="flex items-center justify-between px-3 py-4 border-b border-nexus-border/50">
          <motion.div 
            className="flex items-center gap-3 overflow-hidden"
            animate={{ opacity: collapsed ? 0 : 1, x: collapsed ? -10 : 0 }}
            transition={{ duration: 0.15 }}
          >
            <div className="w-8 h-8 rounded bg-nexus-yellow flex-shrink-0 flex items-center justify-center font-bold text-white">
              EN
            </div>
            <span className="font-bold text-lg tracking-tight whitespace-nowrap">
              Nexus <span className="text-nexus-yellow">Church</span>
            </span>
          </motion.div>
          <button 
            onClick={() => onCollapseChange(!collapsed)}
            className="hidden lg:flex w-6 h-6 flex-shrink-0 items-center justify-center rounded-md hover:bg-nexus-border/50 text-nexus-text-muted hover:text-nexus-text transition-all"
            aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        <div className="relative flex-1 mt-2">
          <AnimatePresence>
            {canScrollTop && !collapsed && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-nexus-card to-transparent z-10 pointer-events-none" 
              />
            )}
          </AnimatePresence>

          <nav 
            ref={navRef}
            onScroll={checkScroll}
            className="flex-1 px-2 space-y-0.5 overflow-y-auto overflow-x-hidden py-2 scrollbar-thin scrollbar-thumb-nexus-border/30 scrollbar-track-transparent hover:scrollbar-thumb-nexus-border/50 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:transparent [&::-webkit-scrollbar-thumb]:bg-nexus-border/20 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:transition-colors hover:[&::-webkit-scrollbar-thumb]:bg-nexus-border/40"
          >
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (window.innerWidth < 1024) setIsMobileOpen(false);
                }}
                className={`w-full flex items-center gap-3 rounded-lg transition-all relative group ${
                  collapsed ? 'justify-center p-2.5' : 'px-3 py-2.5'
                } ${
                  activeTab === item.id 
                    ? 'text-nexus-yellow bg-nexus-yellow/10' 
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                }`}
                aria-current={activeTab === item.id ? 'page' : undefined}
                title={collapsed ? item.label : undefined}
              >
                <item.icon size={20} className="flex-shrink-0" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span 
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -5 }}
                      transition={{ duration: 0.1 }}
                      className="font-medium whitespace-nowrap text-sm"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                
                {activeTab === item.id && (
                  <motion.div 
                    layoutId="active-pill"
                    className="absolute left-0 w-1 h-6 bg-nexus-yellow rounded-r-full"
                  />
                )}
              </button>
            ))}
          </nav>

          <AnimatePresence>
            {canScrollBottom && !collapsed && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-nexus-card to-transparent z-10 pointer-events-none" 
              />
            )}
          </AnimatePresence>
        </div>

        <div className="p-2 border-t border-nexus-border">
          <button 
            onClick={onLogout}
            className={`w-full flex items-center rounded-lg transition-colors group ${
              collapsed ? 'justify-center p-2.5 text-slate-400 hover:text-red-400' : 'gap-3 px-3 py-2.5 text-slate-400 hover:text-red-400 hover:bg-slate-800/30'
            }`}
            aria-label="Terminar sessão"
            title={collapsed ? 'Sair' : undefined}
          >
            <LogOut size={20} />
            <AnimatePresence>
              {!collapsed && (
                <motion.span 
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -5 }}
                  transition={{ duration: 0.1 }}
                  className="font-medium text-sm"
                >
                  Sair
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>
    </>
  );
}
