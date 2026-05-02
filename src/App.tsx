import { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Dashboard from './components/Dashboard';
import MembersRoom from './components/MembersRoom';
import SecretaryRoom from './components/SecretaryRoom';
import KidsRoom from './components/KidsRoom';
import BirthdaysRoom from './components/BirthdaysRoom';
import UsersRoom from './components/UsersRoom';
import FinancialRoom from './components/FinancialRoom';
import WorshipRoom from './components/WorshipRoom';
import LeadershipRoom from './components/LeadershipRoom';
import DepartmentsRoom from './components/DepartmentsRoom';
import AgendaRoom from './components/AgendaRoom';
import PastorRoom from './components/PastorRoom';
import SchoolsRoom from './components/SchoolsRoom';
import CommunicationRoom from './components/CommunicationRoom';
import ServiceSchedulesRoom from './components/ServiceSchedulesRoom';
import SettingsRoom from './components/SettingsRoom';
import AuditLogRoom from './components/AuditLogRoom';
import UserProfile from './components/UserProfile';
import LoginPage from './components/LoginPage';
import UnauthorizedPage from './components/UnauthorizedPage';
import NotFoundPage from './components/NotFoundPage';
import ProtectedRoute from './components/ProtectedRoute';
import CompleteProfileModal from './components/CompleteProfileModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from './lib/toastStore';
import { useAuth } from './stores/authStore';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ROUTE_CONFIG: Record<string, { title: string; allowedRoles?: string[] }> = {
  '/dashboard': { title: 'Dashboard Geral' },
  '/secretary': { title: 'Painel de Operações & Secretaria' },
  '/members': { title: 'Base de Dados de Membros' },
  '/kids': { title: 'Departamento Infantil & Segurança' },
  '/birthdays': { title: 'Aniversariantes do Mês' },
  '/users': { title: 'Gestão de Utilizadores & Acessos', allowedRoles: ['ADMIN', 'PASTOR'] },
  '/financial': { title: 'Tesouraria / Gestão Financeira', allowedRoles: ['ADMIN', 'PASTOR', 'SECRETARY'] },
  '/worship': { title: 'Cultos & Relatórios Operacionais' },
  '/leadership': { title: 'Organograma & Liderança' },
  '/departments': { title: 'Gestão de Departamentos' },
  '/agenda': { title: 'Agenda & Calendário Anual' },
  '/pastor': { title: 'Área do Pastor (Restrita)', allowedRoles: ['PASTOR', 'ADMIN'] },
  '/schools': { title: 'Escolas Espirituais & Formação' },
  '/communication': { title: 'Central de Comunicação (WhatsApp/Email)' },
  '/schedules': { title: 'Escalas de Culto & Ministérios' },
  '/settings': { title: 'Definições do Sistema & Preferências', allowedRoles: ['ADMIN', 'PASTOR'] },
  '/audit': { title: 'Logs & Auditoria de Segurança', allowedRoles: ['ADMIN'] },
};

function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toasts, hide, hideAll } = useToast();
  const { isAuthenticated, logout, profile, needsPasswordChange } = useAuth();
  const needsProfileCompletion = isAuthenticated && profile && (
    profile.full_name === 'New User' || 
    !profile.full_name || 
    profile.full_name.trim() === ''
  );
  const [activePath, setActivePath] = useState(() => {
    const path = location.pathname;
    return path === '/' ? '/dashboard' : path;
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (location.pathname !== '/' && location.pathname !== '/login' && location.pathname !== '/unauthorized' && location.pathname !== '/not-found') {
      setActivePath(location.pathname);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (isAuthenticated && needsPasswordChange && location.pathname !== '/profile') {
      navigate('/profile', { replace: true });
    }
  }, [isAuthenticated, needsPasswordChange, location.pathname]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const getTitle = (path: string) => {
    return ROUTE_CONFIG[path]?.title || 'Nexus Church';
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setActivePath(path);
  };

  const handleLogout = async () => {
    await logout();
    hideAll();
    navigate('/login', { replace: true });
  };

  return (
    <>
      <AnimatePresence>
        {needsProfileCompletion && <CompleteProfileModal />}
      </AnimatePresence>

      <div className={`min-h-screen bg-nexus-bg flex ${needsProfileCompletion ? 'pointer-events-none blur-sm' : ''}`}>
        <Sidebar activeTab={activePath} setActiveTab={handleNavigate} onLogout={handleLogout} collapsed={sidebarCollapsed} onCollapseChange={setSidebarCollapsed} />

        <main className={`flex-1 min-h-screen flex flex-col transition-[margin] duration-200 ${sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]'}`}>
          <TopBar title={getTitle(activePath)} />

          <div className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 w-full max-w-[1440px] mx-auto">
          <ErrorBoundary>
            <AnimatePresence mode="wait">
              <motion.div
                key={activePath}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Routes location={location}>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/secretary" element={<SecretaryRoom />} />
                  <Route path="/members" element={<MembersRoom />} />
                  <Route path="/kids" element={<KidsRoom />} />
                  <Route path="/birthdays" element={<BirthdaysRoom />} />
                  <Route
                    path="/users"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN', 'PASTOR']}>
                        <UsersRoom />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/financial"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN', 'PASTOR', 'SECRETARY']}>
                        <FinancialRoom />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/worship" element={<WorshipRoom />} />
                  <Route path="/leadership" element={<LeadershipRoom />} />
                  <Route path="/departments" element={<DepartmentsRoom />} />
                  <Route path="/agenda" element={<AgendaRoom />} />
                  <Route
                    path="/pastor"
                    element={
                      <ProtectedRoute allowedRoles={['PASTOR', 'ADMIN']}>
                        <PastorRoom />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/schools" element={<SchoolsRoom />} />
                  <Route path="/communication" element={<CommunicationRoom />} />
                  <Route path="/schedules" element={<ServiceSchedulesRoom />} />
                  <Route path="/profile" element={<UserProfile />} />
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN', 'PASTOR']}>
                        <SettingsRoom />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/audit"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN']}>
                        <AuditLogRoom />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </motion.div>
            </AnimatePresence>
            </ErrorBoundary>
        </div>

        <footer className="px-6 py-4 text-center border-t border-slate-700/30">
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-600">
            Emb.Church Nexus <span className="text-nexus-orange">●</span> v1.0.0 Alpha <span className="text-nexus-orange">●</span> {new Date().getFullYear()}
          </p>
        </footer>
      </main>

      <AnimatePresence>
        {toasts.map((toast, index) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ delay: index * 0.05 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-3 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl shadow-black/50 min-w-[300px]"
            style={{ bottom: `${8 + index * 72}px` }}
          >
            <div className={`p-2 rounded-full ${
              toast.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' :
              toast.type === 'error' ? 'bg-red-500/20 text-red-400' :
              'bg-blue-500/20 text-blue-400'
            }`}>
              {toast.type === 'success' ? <CheckCircle2 size={18} /> : 
               toast.type === 'error' ? <AlertCircle size={18} /> : 
               <Info size={18} />}
            </div>
            <p className="text-sm font-semibold text-slate-100 flex-1">{toast.message}</p>
            <button onClick={() => hide(toast.id)} className="text-slate-500 hover:text-white transition-colors">
              <X size={16} />
            </button>
            <div className="absolute bottom-0 left-0 h-1 bg-nexus-orange rounded-full transition-all duration-[3000ms] w-full" 
                 style={{ animation: 'toast-progress 3s linear forwards' }} 
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/not-found" element={<NotFoundPage />} />
        <Route path="/*" element={<AppLayout />} />
      </Routes>
    </BrowserRouter>
  );
}
