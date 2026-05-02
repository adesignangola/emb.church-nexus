import { useState, FormEvent } from 'react';
import { useAuth } from '../stores/authStore';
import type { UserRole } from '../stores/authStore';
import { User, Phone, Mail, Briefcase, Save, CheckCircle2, AlertCircle, Lock } from 'lucide-react';
import { motion } from 'motion/react';
import { useToast } from '../lib/toastStore';

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrador',
  PASTOR: 'Pastor',
  SECRETARY: 'Secretária',
  TREASURER: 'Tesoureiro',
  DEPT_LEADER: 'Líder de Departamento',
  MEMBER: 'Membro',
};

export default function UserProfile() {
  const { profile, updateProfile, fetchProfile, needsPasswordChange, updatePassword } = useAuth();
  const { show } = useToast();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-nexus-text-muted">A carregar perfil...</p>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      show('Nome completo é obrigatório.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const success = await updateProfile({
        full_name: fullName.trim(),
        phone: phone.trim() || undefined,
      });

      if (success) {
        await fetchProfile();
        show('Perfil atualizado com sucesso!', 'success');
      } else {
        show('Erro ao atualizar perfil. Tente novamente.', 'error');
      }
    } catch {
      show('Erro ao atualizar perfil. Tente novamente.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (!newPassword || newPassword.length < 8) {
      setPasswordError('A nova senha deve ter pelo menos 8 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('As senhas não coincidem');
      return;
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      setPasswordError('A senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula e 1 número');
      return;
    }

    setIsChangingPassword(true);
    try {
      const success = await updatePassword(newPassword);

      if (success) {
        show('Senha alterada com sucesso!', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordError('Erro ao alterar senha. Tente novamente.');
      }
    } catch {
      setPasswordError('Erro ao alterar senha. Tente novamente.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-black text-nexus-text uppercase tracking-tight">O Meu Perfil</h2>
        <p className="text-sm text-nexus-text-muted mt-1">Gerir os seus dados pessoais</p>
      </div>

      {needsPasswordChange && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 border-rose-500/30 bg-rose-500/5 flex items-start gap-3"
        >
          <AlertCircle className="text-rose-500 shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-sm font-bold text-rose-400">Senha temporária detectada</p>
            <p className="text-xs text-nexus-text-muted mt-1">Por segurança, deve alterar a sua senha antes de continuar a usar o sistema.</p>
          </div>
        </motion.div>
      )}

      <div className="glass-card p-6 border-nexus-border">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-nexus-yellow/20 flex items-center justify-center text-nexus-yellow font-bold text-xl">
            {getInitials(profile.full_name)}
          </div>
          <div>
            <p className="text-lg font-bold text-nexus-text">{profile.full_name}</p>
            <p className="text-sm text-nexus-yellow font-bold uppercase tracking-wider">{profile.roles.map(r => ROLE_LABELS[r] || r).join(' & ')}</p>
          </div>
        </div>

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
                className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl pl-10 pr-4 py-3 text-sm text-nexus-text focus:outline-none focus:ring-1 focus:ring-nexus-yellow transition-all"
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
            className="w-full py-3.5 gold-gradient text-white rounded-xl text-sm font-black uppercase tracking-widest hover:brightness-110 shadow-xl shadow-nexus-orange/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>A guardar...</>
            ) : (
              <>
                <Save size={16} />
                Guardar Alterações
              </>
            )}
          </button>
        </form>
      </div>

      {/* Password Change Section */}
      <div className="glass-card p-6 border-nexus-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-nexus-orange/20 flex items-center justify-center">
            <Lock className="text-nexus-orange" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-nexus-text">Alterar Senha</h3>
            <p className="text-xs text-nexus-text-muted">Atualize a sua senha de acesso</p>
          </div>
        </div>

        {needsPasswordChange && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20">
            <p className="text-xs text-rose-400 font-bold">
              ⚠️ Deve alterar a sua senha temporária para continuar a usar o sistema.
            </p>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="newPassword" className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">
              Nova Senha <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-nexus-text-muted" size={16} />
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl pl-10 pr-4 py-3 text-sm text-nexus-text focus:outline-none focus:ring-1 focus:ring-nexus-yellow transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="confirmPassword" className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">
              Confirmar Nova Senha <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-nexus-text-muted" size={16} />
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a nova senha"
                className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl pl-10 pr-4 py-3 text-sm text-nexus-text focus:outline-none focus:ring-1 focus:ring-nexus-yellow transition-all"
                required
              />
            </div>
          </div>

          {passwordError && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20">
              <p className="text-xs text-rose-400 font-bold">{passwordError}</p>
            </div>
          )}

          <div className="text-xs text-nexus-text-muted space-y-1">
            <p className="font-bold">A senha deve conter:</p>
            <ul className="list-disc list-inside space-y-0.5 ml-2">
              <li>Pelo menos 8 caracteres</li>
              <li>Pelo menos 1 letra minúscula</li>
              <li>Pelo menos 1 letra maiúscula</li>
              <li>Pelo menos 1 número</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={isChangingPassword || !newPassword || !confirmPassword}
            className="w-full py-3.5 gold-gradient text-white rounded-xl text-sm font-black uppercase tracking-widest hover:brightness-110 shadow-xl shadow-nexus-orange/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isChangingPassword ? (
              <>A alterar...</>
            ) : (
              <>
                <Lock size={16} />
                Alterar Senha
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
