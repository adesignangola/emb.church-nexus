import { useState, FormEvent } from 'react';
import { useAuth, UserRole } from '../stores/authStore';
import { User, Phone, Mail, Briefcase, Save, CheckCircle2, AlertCircle } from 'lucide-react';
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
  const { profile, updateProfile, fetchProfile } = useAuth();
  const { show } = useToast();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-black text-nexus-text uppercase tracking-tight">O Meu Perfil</h2>
        <p className="text-sm text-nexus-text-muted mt-1">Gerir os seus dados pessoais</p>
      </div>

      <div className="glass-card p-6 border-nexus-border">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-nexus-yellow/20 flex items-center justify-center text-nexus-yellow font-bold text-xl">
            {getInitials(profile.full_name)}
          </div>
          <div>
            <p className="text-lg font-bold text-nexus-text">{profile.full_name}</p>
            <p className="text-sm text-nexus-yellow font-bold uppercase tracking-wider">{ROLE_LABELS[profile.role] || profile.role}</p>
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
                value={ROLE_LABELS[profile.role] || profile.role}
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
    </div>
  );
}
