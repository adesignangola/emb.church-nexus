import { useState, FormEvent } from 'react';
import { useAuth } from '../stores/authStore';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, Eye, EyeOff, AlertCircle, Lock, Mail } from 'lucide-react';
import { motion } from 'motion/react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email é obrigatório.');
      return;
    }
    if (!password.trim()) {
      setError('Password é obrigatória.');
      return;
    }
    if (!email.includes('@')) {
      setError('Email inválido.');
      return;
    }

    const success = await login(email, password);
    if (success) {
      navigate(from, { replace: true });
    } else {
      setError('Credenciais inválidas. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-nexus-bg flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="glass-card p-8 border-nexus-border">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-nexus-yellow/10 flex items-center justify-center mx-auto mb-4">
              <Shield size={32} className="text-nexus-yellow" />
            </div>
            <h1 className="text-2xl font-black text-nexus-text uppercase tracking-tight">Nexus Church</h1>
            <p className="text-sm text-nexus-text-muted mt-1">Iniciar Sessão</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-400"
            >
              <AlertCircle size={18} />
              <p className="text-sm font-medium">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">
                Email <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-nexus-text-muted" size={16} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nome@nexus.com"
                  className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl pl-10 pr-4 py-3 text-sm text-nexus-text focus:outline-none focus:ring-1 focus:ring-nexus-yellow transition-all"
                  required
                  aria-required="true"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-nexus-text-muted" size={16} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl pl-10 pr-12 py-3 text-sm text-nexus-text focus:outline-none focus:ring-1 focus:ring-nexus-yellow transition-all"
                  required
                  aria-required="true"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-nexus-text-muted hover:text-nexus-text transition-colors"
                  aria-label={showPassword ? 'Ocultar password' : 'Mostrar password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 gold-gradient text-white rounded-xl text-sm font-black uppercase tracking-widest hover:brightness-110 shadow-xl shadow-nexus-orange/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'A entrar...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-nexus-border">
            <p className="text-[10px] font-bold text-nexus-text-muted uppercase tracking-widest text-center">
              Emb.Church Nexus <span className="text-nexus-orange">●</span> Acesso Restrito
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
