import { Search, Bell, User, Settings, LogOut, Shield, X, CheckCheck, Trash2, Users, Calendar, DollarSign, MessageSquare, Music, MapPin, ChevronRight } from 'lucide-react';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../stores/authStore';
import { useNotifications, useMembers, useEvents, useFinancial } from '../stores/dataStore';
import { motion, AnimatePresence } from 'motion/react';

interface TopBarProps {
  title: string;
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrador',
  PASTOR: 'Pastor',
  SECRETARY: 'Secretária',
  TREASURER: 'Tesoureiro',
  DEPT_LEADER: 'Líder de Departamento',
  MEMBER: 'Membro',
};

const TYPE_COLORS: Record<string, string> = {
  MEMBER: 'bg-blue-500',
  FINANCIAL: 'bg-emerald-500',
  EVENT: 'bg-purple-500',
  SYSTEM: 'bg-slate-500',
  MESSAGE: 'bg-cyan-500',
  BIRTHDAY: 'bg-pink-500',
  SERVICE: 'bg-orange-500',
};

function formatTimeAgo(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return 'Agora';
  if (diff < 3600) return `${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return date.toLocaleDateString('pt-PT');
}

export default function TopBar({ title }: TopBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const { profile, logout } = useAuth();
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const { members } = useMembers();
  const { events } = useEvents();
  const { transactions } = useFinancial();
  const navigate = useNavigate();

  const displayName = profile?.full_name || 'Utilizador';
  const displayRole = profile?.roles ? profile.roles.map(r => ROLE_LABELS[r] || r).join(' & ') : '';
  const displayEmail = profile?.email || '';

  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return [];
    const q = searchQuery.toLowerCase();
    const results: Array<{ label: string; sub: string; icon: React.ElementType; path: string; type: string }> = [];

    members.filter(m => m.full_name.toLowerCase().includes(q) || m.email?.toLowerCase().includes(q) || m.phone?.includes(q)).slice(0, 5).forEach(m => {
      results.push({ label: m.full_name, sub: m.email || m.phone, icon: Users, path: '/members', type: 'Membro' });
    });

    events.filter(e => e.title.toLowerCase().includes(q) || e.description?.toLowerCase().includes(q) || e.location?.toLowerCase().includes(q)).slice(0, 3).forEach(e => {
      results.push({ label: e.title, sub: new Date(e.date).toLocaleDateString('pt-PT'), icon: Calendar, path: '/agenda', type: 'Evento' });
    });

    transactions.filter(t => t.description?.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)).slice(0, 3).forEach(t => {
      results.push({ label: t.description || t.category, sub: `${t.type === 'INCOME' ? '+' : '-'} ${t.amount.toFixed(2)} kz`, icon: DollarSign, path: '/financial', type: 'Transação' });
    });

    const pages = [
      { label: 'Dashboard', icon: Users, path: '/dashboard', type: 'Página', sub: 'Navegação' },
      { label: 'Membros', icon: Users, path: '/members', type: 'Página', sub: 'Navegação' },
      { label: 'Agenda', icon: Calendar, path: '/agenda', type: 'Página', sub: 'Navegação' },
      { label: 'Financeiro', icon: DollarSign, path: '/financial', type: 'Página', sub: 'Navegação' },
      { label: 'Comunicação', icon: MessageSquare, path: '/communication', type: 'Página', sub: 'Navegação' },
      { label: 'Cultos', icon: Music, path: '/worship', type: 'Página', sub: 'Navegação' },
      { label: 'Departamentos', icon: MapPin, path: '/departments', type: 'Página', sub: 'Navegação' },
      { label: 'Escolas', icon: MapPin, path: '/schools', type: 'Página', sub: 'Navegação' },
    ];
    pages.filter(p => p.label.toLowerCase().includes(q)).forEach(p => {
      results.push(p);
    });

    return results.slice(0, 10);
  }, [searchQuery, members, events, transactions]);

  const handleSearchSelect = (path: string) => {
    setSearchQuery('');
    setSearchFocused(false);
    navigate(path);
  };

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const handleNavigate = (path: string) => {
    setProfileOpen(false);
    setNotifOpen(false);
    navigate(path);
  };

  const handleNotifClick = (notif: typeof notifications[0]) => {
    markAsRead(notif.id);
    if (notif.action_url) {
      navigate(notif.action_url);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="h-16 border-b border-nexus-border flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-nexus-bg/80 backdrop-blur-md sticky top-0 z-30">
      <div className="flex items-center gap-3 min-w-0">
        <h1 className="text-base sm:text-lg lg:text-xl font-semibold text-nexus-text truncate">{title}</h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
        <div ref={searchRef} className="relative hidden lg:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-nexus-text-muted" size={18} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            placeholder="Pesquisar..." 
            className="pl-10 pr-4 py-1.5 bg-nexus-card/50 border border-nexus-border rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-nexus-yellow transition-all w-56 xl:w-64"
            aria-label="Pesquisa global"
          />
          {searchQuery && searchFocused && (
            <AnimatePresence>
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="absolute top-full mt-2 right-0 w-96 glass-card border-nexus-border overflow-hidden z-50 max-h-96 overflow-y-auto">
                {searchResults.length === 0 ? (
                  <div className="p-6 text-center text-sm text-nexus-text-muted">Sem resultados para "{searchQuery}"</div>
                ) : (
                  searchResults.map((result, i) => (
                    <button key={i} onClick={() => handleSearchSelect(result.path)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-nexus-yellow/5 transition-colors border-b border-nexus-border/30 last:border-0 text-left">
                      <result.icon size={16} className="text-nexus-text-muted shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-nexus-text truncate">{result.label}</p>
                        <p className="text-[10px] text-nexus-text-muted truncate">{result.sub}</p>
                      </div>
                      <span className="text-[9px] font-black text-nexus-text-muted uppercase bg-nexus-card px-2 py-0.5 rounded shrink-0">{result.type}</span>
                      <ChevronRight size={14} className="text-nexus-text-muted shrink-0" />
                    </button>
                  ))
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* NOTIFICATIONS */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
              className="p-2 text-nexus-text-muted hover:text-nexus-yellow transition-colors relative"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center px-1 border-2 border-nexus-bg">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-12 w-96 glass-card border-nexus-border overflow-hidden z-50"
                >
                  <div className="p-4 border-b border-nexus-border flex items-center justify-between">
                    <h3 className="text-sm font-bold text-nexus-text uppercase tracking-wider">Notificações</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-[10px] text-nexus-yellow hover:text-nexus-orange font-bold uppercase tracking-wider flex items-center gap-1"
                      >
                        <CheckCheck size={12} />
                        Marcar tudo
                      </button>
                    )}
                  </div>

                  <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <Bell size={32} className="text-nexus-text-muted mx-auto mb-2 opacity-50" />
                        <p className="text-sm text-nexus-text-muted">Sem notificações</p>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => handleNotifClick(notif)}
                          className={`px-4 py-3 border-b border-nexus-border/50 cursor-pointer transition-colors hover:bg-nexus-yellow/5 ${
                            !notif.is_read ? 'bg-nexus-yellow/5' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${TYPE_COLORS[notif.type] || 'bg-slate-500'}`} />
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium truncate ${!notif.is_read ? 'text-nexus-text' : 'text-slate-400'}`}>
                                {notif.title}
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notif.message}</p>
                              <p className="text-[10px] text-slate-600 mt-1">{formatTimeAgo(notif.created_at)}</p>
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }}
                              className="text-slate-600 hover:text-red-400 transition-colors p-1"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="h-8 w-[1px] bg-nexus-border mx-2"></div>

          {/* PROFILE */}
          <div ref={profileRef} className="relative">
            <button 
              onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
              className="flex items-center gap-2 group"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-nexus-text group-hover:text-nexus-yellow transition-colors">{displayName}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">{displayRole}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-nexus-yellow/20 flex items-center justify-center text-nexus-yellow text-xs font-bold group-hover:bg-nexus-yellow/30 transition-all">
                {getInitials(displayName)}
              </div>
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-12 w-72 glass-card border-nexus-border overflow-hidden z-50"
                >
                  <div className="p-4 border-b border-nexus-border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-nexus-yellow/20 flex items-center justify-center text-nexus-yellow font-bold text-sm">
                        {getInitials(displayName)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-nexus-text truncate">{displayName}</p>
                        <p className="text-[10px] text-slate-500 truncate">{displayEmail}</p>
                        <p className="text-[10px] text-nexus-yellow font-bold uppercase tracking-wider">{displayRole}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-2">
                    <button
                      onClick={() => handleNavigate('/profile')}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:text-nexus-yellow hover:bg-nexus-yellow/10 transition-all"
                    >
                      <User size={16} />
                      <span>O Meu Perfil</span>
                    </button>

                    <button
                      onClick={() => handleNavigate('/settings')}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:text-nexus-yellow hover:bg-nexus-yellow/10 transition-all"
                    >
                      <Settings size={16} />
                      <span>Definições do Sistema</span>
                    </button>

                    {profile?.roles.includes('ADMIN') && (
                      <button
                        onClick={() => handleNavigate('/audit')}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:text-nexus-yellow hover:bg-nexus-yellow/10 transition-all"
                      >
                        <Shield size={16} />
                        <span>Auditoria</span>
                      </button>
                    )}
                  </div>

                  <div className="p-2 border-t border-nexus-border">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <LogOut size={16} />
                      <span>Terminar Sessão</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
