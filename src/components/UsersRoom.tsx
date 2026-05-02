import { 
  UserPlus, 
  ShieldCheck, 
  Key, 
  Mail, 
  Trash2, 
  Edit3, 
  MoreVertical,
  Check,
  X,
  Lock,
  Unlock,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useRef } from 'react';
import { useToast } from '../lib/toastStore';
import { useAuth, UserRole } from '../stores/authStore';
import { useProfiles } from '../stores/dataStore';

export default function UsersRoom() {
  const { profiles, loading, error, fetchProfiles, updateProfile, deleteProfile } = useProfiles();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({ name: '', email: '', role: 'SECRETARY' as UserRole });
  const [editRole, setEditRole] = useState<UserRole>('SECRETARY');
  const modalRef = useRef<HTMLDivElement>(null);
  const { show } = useToast();
  const { register } = useAuth();

  useEffect(() => {
    fetchProfiles();
  }, []);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Nome é obrigatório';
    if (!formData.email.trim()) errors.email = 'Email é obrigatório';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Email inválido';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInvite = async () => {
    if (!validateForm()) return;
    const password = Math.random().toString(36).slice(-8) + 'A1!';
    const success = await register(formData.email, password, formData.name, formData.role);
    if (success) {
      show(`Convite enviado para ${formData.name}`, 'success');
      setIsAddModalOpen(false);
      setFormData({ name: '', email: '', role: 'SECRETARY' });
      setFormErrors({});
      fetchProfiles();
    } else {
      show('Erro ao criar utilizador. Tente novamente.', 'error');
    }
  };

  const handleEditRole = async () => {
    if (!selectedUser) return;
    await updateProfile(selectedUser.id, { role: editRole });
    show(`Permissões de ${selectedUser.full_name} atualizadas para ${editRole}`, 'success');
    setIsEditModalOpen(false);
    setSelectedUser(null);
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    await deleteProfile(selectedUser.id);
    show(`Utilizador ${selectedUser.full_name} eliminado`, 'success');
    setIsDeleteModalOpen(false);
    setSelectedUser(null);
  };

  useEffect(() => {
    if (!isAddModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsAddModalOpen(false);
        setFormErrors({});
        setFormData({ name: '', email: '', role: 'SECRETARY' });
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isAddModalOpen]);

  useEffect(() => {
    if (isAddModalOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isAddModalOpen]);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'PASTOR': return 'bg-nexus-orange/10 text-nexus-orange border-nexus-orange/20';
      case 'SECRETARY': return 'bg-nexus-yellow/10 text-nexus-yellow border-nexus-yellow/20';
      case 'TREASURER': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'ADMIN': return 'bg-nexus-text/10 text-nexus-text border-nexus-text/20';
      default: return 'bg-nexus-card text-nexus-text-muted border-nexus-border';
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-nexus-text uppercase tracking-tight">Gestão de Utilizadores</h2>
          <p className="text-sm text-nexus-text-muted">Acessos exclusivos e permissões individuais por sessão.</p>
        </div>
        <button 
          onClick={() => {
            setIsAddModalOpen(true);
            setFormErrors({});
            setFormData({ name: '', email: '', role: 'SECRETARY' });
          }}
          className="flex items-center justify-center gap-2 px-6 py-2.5 gold-gradient text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-nexus-orange/10 hover:brightness-110 active:scale-95 transition-all"
        >
          <UserPlus size={18} />
          Convidar Operador
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="space-y-6">
           <div className="glass-card p-6 border-nexus-border">
              <h4 className="text-[10px] font-black text-nexus-text-muted uppercase tracking-[0.2em] mb-4">Estrutura de Acesso</h4>
              <div className="space-y-4">
                 {[
                   { role: 'Pastor', desc: 'Isolamento de Gabinete Digital', color: 'bg-nexus-orange' },
                   { role: 'Secretária', desc: 'Marcações e Gestão de Membros', color: 'bg-nexus-yellow' },
                   { role: 'Tesoureiro', desc: 'Fluxo Financeiro e Dízimos', color: 'bg-emerald-500' },
                   { role: 'Admin', desc: 'Controlo Geral e Auditoria', color: 'bg-nexus-text' },
                 ].map(r => (
                   <div key={r.role} className="flex gap-3">
                      <div className={`w-1 h-8 rounded-full ${r.color} shrink-0 opacity-80`} />
                      <div>
                         <p className="text-xs font-black text-nexus-text">{r.role}</p>
                         <p className="text-[10px] text-nexus-text-muted font-bold leading-tight">{r.desc}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           <div className="glass-card p-6 border-nexus-orange/20 bg-nexus-orange/5">
              <div className="flex gap-3 items-start">
                 <ShieldCheck className="text-nexus-orange shrink-0" size={20} />
                 <div>
                    <h4 className="text-[10px] font-black text-nexus-orange uppercase tracking-widest mb-1">Auditoria Ativa</h4>
                    <p className="text-[10px] text-nexus-text-muted font-bold leading-relaxed">
                      Cada ação é assinada digitalmente e vinculada à sessão do utilizador, garantindo rastreabilidade total.
                    </p>
                 </div>
              </div>
           </div>
        </div>

        <div className="lg:col-span-3">
           <div className="glass-card overflow-hidden border-nexus-border">
             {loading ? (
               <div className="p-12 text-center">
                 <div className="animate-spin w-8 h-8 border-2 border-nexus-yellow border-t-transparent rounded-full mx-auto mb-4" />
                 <p className="text-sm text-nexus-text-muted">A carregar utilizadores...</p>
               </div>
             ) : error ? (
               <div className="p-12 text-center">
                 <p className="text-sm text-red-400">Erro: {error}</p>
               </div>
             ) : profiles.length === 0 ? (
               <div className="p-12 text-center">
                 <ShieldCheck size={48} className="mx-auto text-nexus-text-muted mb-4 opacity-50" />
                 <h3 className="text-lg font-bold text-nexus-text mb-2">Nenhum utilizador registado</h3>
                 <p className="text-sm text-nexus-text-muted">Comece por convidar o primeiro operador.</p>
               </div>
             ) : (
               <table className="w-full text-left">
                 <thead>
                   <tr className="bg-nexus-card/50 border-b border-nexus-border text-[10px] font-black text-nexus-text-muted uppercase tracking-widest">
                     <th className="px-6 py-4">Sessão / Operador</th>
                     <th className="px-6 py-4">Papel Atribuído</th>
                     <th className="px-6 py-4">Email</th>
                     <th className="px-6 py-4 text-right">Controlo</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-nexus-border/30">
                   {profiles.map((user) => (
                     <tr key={user.id} className="hover:bg-nexus-card/30 transition-all group">
                       <td className="px-6 py-4">
                         <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-nexus-card border border-nexus-border flex items-center justify-center text-nexus-text-muted font-black group-hover:text-nexus-yellow transition-colors">
                               {user.full_name.charAt(0)}
                            </div>
                            <div>
                               <p className="text-sm font-black text-nexus-text group-hover:text-nexus-yellow transition-colors">{user.full_name}</p>
                               <p className="text-[10px] text-nexus-text-muted font-bold uppercase tracking-widest">{user.email}</p>
                            </div>
                         </div>
                       </td>
                       <td className="px-6 py-4">
                          <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-widest ${getRoleBadge(user.role)}`}>
                             {user.role}
                          </span>
                       </td>
                       <td className="px-6 py-4 text-xs font-mono text-nexus-text-muted">
                         {user.email}
                       </td>
                       <td className="px-6 py-4 text-right whitespace-nowrap">
                           <div className="flex items-center justify-end gap-2">
                              <button onClick={() => { setSelectedUser(user); setEditRole(user.role); setIsEditModalOpen(true); }} className="p-2 text-nexus-border hover:text-nexus-yellow transition-colors" title="Editar Permissões">
                                 <Key size={16} />
                              </button>
                              <button onClick={() => { setSelectedUser(user); setIsDeleteModalOpen(true); }} className="p-2 text-nexus-border hover:text-rose-500 transition-colors" title="Eliminar Utilizador">
                                 <Trash2 size={16} />
                              </button>
                           </div>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             )}
           </div>
        </div>
      </div>

      {/* Add User Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsAddModalOpen(false); setFormErrors({}); }}
              className="absolute inset-0 bg-nexus-bg/80 backdrop-blur-sm"
            />
            <motion.div
              ref={modalRef}
              tabIndex={-1}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md glass-card p-8 space-y-6 border-nexus-border focus:outline-none"
              role="dialog"
              aria-modal="true"
              aria-label="Convidar novo utilizador"
            >
               <div className="flex items-center justify-between border-b border-nexus-border pb-4">
                  <h3 className="text-xl font-black text-nexus-text uppercase tracking-tight">Expandir Equipa Ministerial</h3>
                  <button onClick={() => { setIsAddModalOpen(false); setFormErrors({}); }} className="text-nexus-text-muted hover:text-nexus-text transition-colors" aria-label="Fechar">
                     <X size={24} />
                  </button>
               </div>

               <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="user-name" className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">
                      Nome do Operador <span className="text-rose-500">*</span>
                    </label>
                    <input 
                      id="user-name"
                      type="text" 
                      value={formData.name}
                      onChange={(e) => { setFormData(prev => ({ ...prev, name: e.target.value })); setFormErrors(prev => ({ ...prev, name: '' })); }}
                      placeholder="Ex: Lucas Ferreira" 
                      className={`w-full bg-nexus-card border rounded-xl p-3.5 text-xs text-nexus-text focus:outline-none focus:ring-1 ${formErrors.name ? 'border-rose-500 focus:ring-rose-500' : 'border-nexus-border focus:ring-nexus-yellow'}`}
                      aria-required="true"
                      aria-invalid={!!formErrors.name}
                    />
                    {formErrors.name && <p className="text-xs text-rose-400 font-medium">{formErrors.name}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="user-email" className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">
                      Email Nexus Corporativo <span className="text-rose-500">*</span>
                    </label>
                    <input 
                      id="user-email"
                      type="email" 
                      value={formData.email}
                      onChange={(e) => { setFormData(prev => ({ ...prev, email: e.target.value })); setFormErrors(prev => ({ ...prev, email: '' })); }}
                      placeholder="nome@nexus.com" 
                      className={`w-full bg-nexus-card border rounded-xl p-3.5 text-xs text-nexus-text focus:outline-none focus:ring-1 ${formErrors.email ? 'border-rose-500 focus:ring-rose-500' : 'border-nexus-border focus:ring-nexus-yellow'}`}
                      aria-required="true"
                      aria-invalid={!!formErrors.email}
                    />
                    {formErrors.email && <p className="text-xs text-rose-400 font-medium">{formErrors.email}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="user-role" className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">
                      Papel de Acesso <span className="text-rose-500">*</span>
                    </label>
                    <select 
                      id="user-role"
                      value={formData.role}
                      onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as UserRole }))}
                      className="w-full bg-nexus-card border border-nexus-border rounded-xl p-3.5 text-xs text-nexus-text focus:outline-none focus:ring-1 focus:ring-nexus-yellow appearance-none"
                    >
                       <option value="SECRETARY">Secretária / Gestão</option>
                       <option value="TREASURER">Tesoureiro / Financeiro</option>
                       <option value="PASTOR">Pastor (Área Restrita)</option>
                       <option value="DEPT_LEADER">Líder de Departamento</option>
                       <option value="ADMIN">Administrador de TI</option>
                    </select>
                  </div>
               </div>

               <div className="pt-4 flex gap-3">
                  <button 
                    onClick={() => { setIsAddModalOpen(false); setFormErrors({}); setFormData({ name: '', email: '', role: 'SECRETARY' }); }} 
                    className="flex-1 py-3.5 bg-nexus-card hover:bg-nexus-bg text-nexus-text-muted rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-nexus-border"
                  >
                    Recuar
                  </button>
                  <button onClick={handleInvite} className="flex-1 py-3.5 gold-gradient text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 shadow-xl shadow-nexus-orange/20 transition-all">
                    Emitir Convite
                  </button>
               </div>
            </motion.div>
          </div>
        )}
       </AnimatePresence>

       {/* Edit Role Modal */}
       <AnimatePresence>
         {isEditModalOpen && selectedUser && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEditModalOpen(false)} className="absolute inset-0 bg-nexus-bg/80 backdrop-blur-sm" />
             <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-sm glass-card p-8 space-y-6 border-nexus-border">
                <div className="flex items-center justify-between border-b border-nexus-border pb-4">
                   <h3 className="text-lg font-black text-nexus-text uppercase">Editar Permissões</h3>
                   <button onClick={() => setIsEditModalOpen(false)} className="text-nexus-text-muted hover:text-nexus-text"><X size={24} /></button>
                </div>
                <div className="space-y-4">
                   <p className="text-sm text-nexus-text-muted font-bold">{selectedUser.full_name}</p>
                   <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">Novo Papel</label>
                     <select value={editRole} onChange={(e) => setEditRole(e.target.value as UserRole)} className="w-full bg-nexus-card border border-nexus-border rounded-xl p-3.5 text-xs text-nexus-text focus:outline-none focus:ring-1 focus:ring-nexus-yellow">
                        <option value="SECRETARY">Secretária / Gestão</option>
                        <option value="TREASURER">Tesoureiro / Financeiro</option>
                        <option value="PASTOR">Pastor (Área Restrita)</option>
                        <option value="DEPT_LEADER">Líder de Departamento</option>
                        <option value="ADMIN">Administrador de TI</option>
                     </select>
                   </div>
                </div>
                <div className="pt-4 flex gap-3">
                   <button onClick={() => setIsEditModalOpen(false)} className="flex-1 py-3.5 bg-nexus-card hover:bg-nexus-bg text-nexus-text-muted rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-nexus-border">Cancelar</button>
                   <button onClick={handleEditRole} className="flex-1 py-3.5 gold-gradient text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 shadow-xl shadow-nexus-orange/20 transition-all">Guardar</button>
                </div>
             </motion.div>
           </div>
         )}
       </AnimatePresence>

       {/* Delete Confirmation Modal */}
       <AnimatePresence>
         {isDeleteModalOpen && selectedUser && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDeleteModalOpen(false)} className="absolute inset-0 bg-nexus-bg/80 backdrop-blur-sm" />
             <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-sm glass-card p-8 space-y-6 border-rose-500/30">
                <div className="flex items-center gap-3">
                   <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500"><AlertTriangle size={24} /></div>
                   <div>
                     <h3 className="text-lg font-black text-nexus-text uppercase">Eliminar Utilizador</h3>
                     <p className="text-xs text-nexus-text-muted font-bold">Esta ação não pode ser desfeita.</p>
                   </div>
                </div>
                <p className="text-sm text-nexus-text-muted text-center font-bold">Tem a certeza que deseja eliminar <span className="text-nexus-text font-black">{selectedUser.full_name}</span>?</p>
                <div className="pt-2 flex gap-3">
                   <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3.5 bg-nexus-card hover:bg-nexus-bg text-nexus-text-muted rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-nexus-border">Cancelar</button>
                   <button onClick={handleDeleteUser} className="flex-1 py-3.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-rose-500/20 transition-all">Eliminar</button>
                </div>
             </motion.div>
           </div>
         )}
       </AnimatePresence>
    </div>
  );
}
