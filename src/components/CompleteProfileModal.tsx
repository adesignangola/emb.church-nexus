import { useState, FormEvent } from 'react';
import { useAuth } from '../stores/authStore';
import { User, Phone, Mail, Briefcase } from 'lucide-react';
import { motion } from 'motion/react';

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrador',
  PASTOR: 'Pastor',
  SECRETARY: 'Secretária',
  TREASURER: 'Tesoureiro',
  DEPT_LEADER: 'Líder de Dept.',
  MEMBER: 'Membro',
};

export default function CompleteProfileModal() {
  const { profile, user, fetchProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name === 'New User' || !profile?.full_name ? '' : profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!user || !profile) return null;

  const isIncomplete = 
    profile.full_name === 'New User' || 
    !profile.full_name || 
    profile.full_name.trim() === '';

  const isNewUser = profile.full_name === 'New User' || !profile.full_name || profile.full_name.trim() === '';

  if (!isIncomplete) return null;

  const modalTitle = isNewUser ? 'Bem-vindo!' : 'Dados Incompletos';
  const modalMessage = isNewUser 
    ? 'Preencha os seus dados pessoais para continuar.'
    : 'O seu perfil tem dados em falta. Preencha para continuar.';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) {
      setError('Nome completo é obrigatório.');
      return;
    }

    setIsLoading(true);
    try {
      const { updateProfile } = useAuth.getState();
      const success = await updateProfile({
        full_name: fullName.trim(),
        phone: phone.trim() || undefined,
      });

      if (success) {
        await fetchProfile();
      } else {
        setError('Erro ao salvar perfil. Tente novamente.');
      }
    } catch {
      setError('Erro ao salvar perfil. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="glass-card p-8 border-nexus-border relative">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-nexus-yellow/10 flex items-center justify-center mx-auto mb-4">
              <User size={32} className="text-nexus-yellow" />
            </div>
            <h2 className="text-xl font-black text-nexus-text uppercase tracking-tight">
              {modalTitle}
            </h2>
            <p className="text-sm text-nexus-text-muted mt-2">
              {modalMessage}
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="fullName" className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">
                Nome Completo <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-nexus-text-muted" size={16} />
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ex: João Silva"
                  className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl pl-10 pr-4 py-3 text-sm text-nexus-text focus:outline-none focus:ring-1 focus:ring-nexus-yellow transition-all"
                  autoFocus
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-nexus-text-muted" size={16} />
                <input
                  id="email"
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full bg-nexus-card/30 border border-nexus-border rounded-xl pl-10 pr-4 py-3 text-sm text-nexus-text-muted cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="phone" className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">
                Telefone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-nexus-text-muted" size={16} />
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+244 9XX XXX XXX"
                  className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl pl-10 pr-4 py-3 text-sm text-nexus-text focus:outline-none focus:ring-1 focus:ring-nexus-yellow transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="role" className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">
                Função
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-nexus-text-muted" size={16} />
                <input
                  id="role"
                  type="text"
                  value={profile.roles.map(r => ROLE_LABELS[r] || r).join(' & ')}
                  disabled
                  className="w-full bg-nexus-card/30 border border-nexus-border rounded-xl pl-10 pr-4 py-3 text-sm text-nexus-text-muted cursor-not-allowed"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 gold-gradient text-white rounded-xl text-sm font-black uppercase tracking-widest hover:brightness-110 shadow-xl shadow-nexus-orange/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {isLoading ? 'A salvar...' : 'Guardar e Continuar'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
