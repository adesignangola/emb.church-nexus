import { 
  Briefcase, 
  Users, 
  Crown,
  ChevronRight,
  Plus,
  X,
  Check,
  Phone,
  Mail,
  Trash2,
  Edit3
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useDepartments, useMembers } from '../stores/dataStore';

export default function DepartmentsRoom() {
  const { departments, loading, error, fetchDepartments, addDepartment, updateDepartment, deleteDepartment } = useDepartments();
  const { members, fetchMembers } = useMembers();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [newDept, setNewDept] = useState({ name: '', description: '', leader_id: '' });
  const [selectedDept, setSelectedDept] = useState<typeof departments[0] | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', description: '', active: true });
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [isEditSuccess, setIsEditSuccess] = useState(false);

  useEffect(() => {
    fetchDepartments();
    fetchMembers();
  }, []);

  const getMemberCount = (deptId: string) => {
    return members.filter(m => m.department_id === deptId && m.status === 'ACTIVE').length;
  };

  const handleCreateDept = async () => {
    if (!newDept.name.trim()) return;
    setIsSubmitting(true);
    const success = await addDepartment({
      name: newDept.name,
      description: newDept.description,
      leader_id: newDept.leader_id || null,
      active: true,
    });
    if (success) {
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setIsModalOpen(false);
        setNewDept({ name: '', description: '', leader_id: '' });
      }, 2000);
    }
    setIsSubmitting(false);
  };

  const openDeptDetails = (dept: typeof departments[0]) => {
    setSelectedDept(dept);
  };

  const openEditModal = (dept: typeof departments[0]) => {
    setEditForm({ name: dept.name, description: dept.description || '', active: dept.active });
    setSelectedDept(dept);
    setIsEditModalOpen(true);
  };

  const handleEditDept = async () => {
    if (!selectedDept || !editForm.name.trim()) return;
    setIsEditSubmitting(true);
    const success = await updateDepartment(selectedDept.id, {
      name: editForm.name,
      description: editForm.description,
      active: editForm.active,
    });
    if (success) {
      setIsEditSuccess(true);
      setTimeout(() => {
        setIsEditSuccess(false);
        setIsEditModalOpen(false);
        setSelectedDept(null);
      }, 2000);
    }
    setIsEditSubmitting(false);
  };

  const handleDeleteDept = async (id: string) => {
    if (window.confirm('Tem certeza que deseja eliminar este departamento?')) {
      await deleteDepartment(id);
      if (selectedDept?.id === id) {
        setSelectedDept(null);
      }
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-nexus-text uppercase tracking-tight">Gestão de Departamentos</h2>
          <p className="text-sm text-nexus-text-muted">Estrutura organizacional e equipas ministeriais da igreja.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-6 py-2.5 gold-gradient text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-nexus-orange/10 hover:brightness-110 transition-all">
          <Plus size={18} /> Novo Departamento
        </button>
      </div>

      {loading ? (
        <div className="glass-card p-12 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-nexus-yellow border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-sm text-nexus-text-muted">A carregar departamentos...</p>
        </div>
      ) : error ? (
        <div className="glass-card p-12 text-center">
          <p className="text-sm text-red-400">Erro: {error}</p>
        </div>
      ) : departments.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Briefcase size={48} className="mx-auto text-nexus-text-muted mb-4 opacity-50" />
          <h3 className="text-lg font-bold text-nexus-text mb-2">Nenhum departamento registado</h3>
          <p className="text-sm text-nexus-text-muted">Comece por criar o primeiro departamento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => (
            <div key={dept.id} onClick={() => openDeptDetails(dept)} className="glass-card p-6 hover:border-nexus-orange/30 transition-all group cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-nexus-orange/10 rounded-xl text-nexus-orange">
                  <Briefcase size={20} />
                </div>
                <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-lg border tracking-widest ${
                  dept.active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-nexus-border/10 text-nexus-text-muted border-nexus-border'
                }`}>
                  {dept.active ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              <h3 className="text-sm font-black text-nexus-text group-hover:text-nexus-yellow transition-colors mb-1">{dept.name}</h3>
              <p className="text-[10px] text-nexus-text-muted font-bold mb-4 line-clamp-2">{dept.description}</p>
              <div className="flex items-center justify-between pt-4 border-t border-nexus-border/50">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-nexus-text-muted">
                  <Users size={12} />
                  <span>{getMemberCount(dept.id)} membros</span>
                </div>
                <button className="p-1.5 text-nexus-text-muted hover:text-nexus-yellow transition-colors">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-nexus-bg/90 backdrop-blur-xl" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-md glass-card p-8 border-nexus-border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-nexus-text uppercase">Novo Departamento</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-nexus-text-muted hover:text-nexus-text"><X size={20} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">Nome</label>
                  <input type="text" value={newDept.name} onChange={(e) => setNewDept(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Louvor e Adoração" className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl p-3 text-sm text-nexus-text focus:ring-1 focus:ring-nexus-yellow" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">Descrição</label>
                  <textarea value={newDept.description} onChange={(e) => setNewDept(p => ({ ...p, description: e.target.value }))} rows={3} className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl p-3 text-sm text-nexus-text focus:ring-1 focus:ring-nexus-yellow resize-none" />
                </div>
              </div>
              <div className="flex gap-3 mt-6 relative">
                {isSuccess ? (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute inset-0 z-10 flex items-center justify-center bg-emerald-500 rounded-xl text-white font-bold text-xs uppercase tracking-widest gap-2"><Check size={18} /> Departamento Criado</motion.div>
                ) : null}
                <button disabled={isSubmitting || isSuccess} onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-nexus-card hover:bg-nexus-border text-nexus-text rounded-xl text-sm font-black uppercase tracking-widest transition-all disabled:opacity-50">Cancelar</button>
                <button 
                  disabled={isSubmitting || isSuccess || !newDept.name.trim()}
                  onClick={handleCreateDept} 
                  className="flex-1 py-3 gold-gradient text-white rounded-xl text-sm font-black uppercase tracking-widest hover:brightness-110 shadow-xl shadow-nexus-orange/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >Criar Departamento</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedDept && !isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedDept(null)} className="absolute inset-0 bg-nexus-bg/90 backdrop-blur-xl" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-lg glass-card p-8 border-nexus-border max-h-[80vh] overflow-y-auto">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 bg-nexus-orange/10 rounded-xl text-nexus-orange">
                      <Briefcase size={20} />
                    </div>
                    <h3 className="text-lg font-black text-nexus-text uppercase">{selectedDept.name}</h3>
                  </div>
                  <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-lg border tracking-widest ${
                    selectedDept.active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-nexus-border/10 text-nexus-text-muted border-nexus-border'
                  }`}>
                    {selectedDept.active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <button onClick={() => setSelectedDept(null)} className="text-nexus-text-muted hover:text-nexus-text"><X size={20} /></button>
              </div>

              {selectedDept.description && (
                <p className="text-sm text-nexus-text-muted mb-6">{selectedDept.description}</p>
              )}

              <div className="mb-6">
                <h4 className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Users size={14} /> Membros ({getMemberCount(selectedDept.id)})
                </h4>
                {getMemberCount(selectedDept.id) === 0 ? (
                  <p className="text-sm text-nexus-text-muted text-center py-4">Nenhum membro neste departamento</p>
                ) : (
                  <div className="space-y-2">
                    {members.filter(m => m.department_id === selectedDept.id && m.status === 'ACTIVE').map(member => (
                      <div key={member.id} className="flex items-center gap-3 p-3 bg-nexus-card/30 rounded-lg border border-nexus-border/30">
                        <div className="w-8 h-8 rounded-full bg-nexus-orange/10 flex items-center justify-center text-xs font-bold text-nexus-orange">
                          {member.full_name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-nexus-text truncate">{member.full_name}</p>
                          <div className="flex items-center gap-2 text-[10px] text-nexus-text-muted">
                            {member.phone && <span className="flex items-center gap-1"><Phone size={10} /> {member.phone}</span>}
                          </div>
                        </div>
                        {member.is_tither && (
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-nexus-yellow/10 text-nexus-yellow border border-nexus-yellow/20">
                            Dízimo
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t border-nexus-border/50">
                <button
                  onClick={() => handleDeleteDept(selectedDept.id)}
                  className="px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2"
                >
                  <Trash2 size={14} /> Eliminar
                </button>
                <button
                  onClick={() => openEditModal(selectedDept)}
                  className="flex-1 py-2.5 gold-gradient text-white rounded-xl text-xs font-black uppercase tracking-widest hover:brightness-110 shadow-lg shadow-nexus-orange/10 transition-all flex items-center justify-center gap-2"
                >
                  <Edit3 size={14} /> Editar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isEditModalOpen && selectedDept && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEditModalOpen(false)} className="absolute inset-0 bg-nexus-bg/90 backdrop-blur-xl" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-md glass-card p-8 border-nexus-border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-nexus-text uppercase">Editar Departamento</h3>
                <button onClick={() => setIsEditModalOpen(false)} className="text-nexus-text-muted hover:text-nexus-text"><X size={20} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">Nome</label>
                  <input type="text" value={editForm.name} onChange={(e) => setEditForm(p => ({ ...p, name: e.target.value }))} className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl p-3 text-sm text-nexus-text focus:ring-1 focus:ring-nexus-yellow" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">Descrição</label>
                  <textarea value={editForm.description} onChange={(e) => setEditForm(p => ({ ...p, description: e.target.value }))} rows={3} className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl p-3 text-sm text-nexus-text focus:ring-1 focus:ring-nexus-yellow resize-none" />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setEditForm(p => ({ ...p, active: !p.active }))}
                    className={`w-12 h-6 rounded-full transition-all ${editForm.active ? 'bg-emerald-500' : 'bg-nexus-border'}`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white shadow transition-all ${editForm.active ? 'translate-x-6' : 'translate-x-0.5'}`} />
                  </button>
                  <span className="text-xs font-bold text-nexus-text-muted">{editForm.active ? 'Ativo' : 'Inativo'}</span>
                </div>
              </div>
              <div className="flex gap-3 mt-6 relative">
                {isEditSuccess ? (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute inset-0 z-10 flex items-center justify-center bg-emerald-500 rounded-xl text-white font-bold text-xs uppercase tracking-widest gap-2"><Check size={18} /> Departamento Atualizado</motion.div>
                ) : null}
                <button disabled={isEditSubmitting || isEditSuccess} onClick={() => setIsEditModalOpen(false)} className="flex-1 py-3 bg-nexus-card hover:bg-nexus-border text-nexus-text rounded-xl text-sm font-black uppercase tracking-widest transition-all disabled:opacity-50">Cancelar</button>
                <button
                  disabled={isEditSubmitting || isEditSuccess || !editForm.name.trim()}
                  onClick={handleEditDept}
                  className="flex-1 py-3 gold-gradient text-white rounded-xl text-sm font-black uppercase tracking-widest hover:brightness-110 shadow-xl shadow-nexus-orange/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >Guardar</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
