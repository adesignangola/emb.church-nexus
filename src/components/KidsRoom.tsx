import { 
  Baby, 
  Users, 
  BookOpen, 
  Calendar,
  ChevronRight,
  GraduationCap,
  Plus,
  X,
  Trash2,
  Edit3,
  Check
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useKidsGroups } from '../stores/dataStore';
import { useToast } from '../lib/toastStore';

export default function KidsRoom() {
  const { groups, loading, error, fetchGroups, addGroup, deleteGroup } = useKidsGroups();
  const { show } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', age_range: '', teacher_name: '', room: '' });
  const [selectedGroup, setSelectedGroup] = useState<typeof groups[0] | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', age_range: '', teacher_name: '', room: '' });
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [isEditSuccess, setIsEditSuccess] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  const stats = useMemo(() => ({
    total: groups.reduce((sum, g) => sum + (g.enrolled_count || 0), 0),
    groups: groups.length,
    teachers: groups.filter(g => g.teacher_name).length,
    rooms: groups.filter(g => g.room).length,
  }), [groups]);

  const handleCreateGroup = async () => {
    if (!newGroup.name.trim()) return show('Nome é obrigatório', 'error');
    setIsSubmitting(true);
    const success = await addGroup({
      name: newGroup.name,
      age_range: newGroup.age_range,
      teacher_name: newGroup.teacher_name || null,
      room: newGroup.room || null,
      enrolled_count: 0,
    });
    if (success) {
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setIsModalOpen(false);
        setNewGroup({ name: '', age_range: '', teacher_name: '', room: '' });
      }, 2000);
    }
    setIsSubmitting(false);
  };

  const openEditModal = (group: typeof groups[0]) => {
    setEditForm({ name: group.name, age_range: group.age_range || '', teacher_name: group.teacher_name || '', room: group.room || '' });
    setSelectedGroup(group);
    setIsEditModalOpen(true);
  };

  const handleDeleteGroup = async (id: string) => {
    if (window.confirm('Tem certeza que deseja eliminar esta turma?')) {
      await deleteGroup(id);
      show('Turma eliminada.', 'info');
      if (selectedGroup?.id === id) setSelectedGroup(null);
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-nexus-text uppercase tracking-tight">Departamento Infantil & Segurança</h2>
          <p className="text-sm text-nexus-text-muted">Gestão de turmas, professores e actividades infantis.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-6 py-2.5 gold-gradient text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-nexus-orange/10 hover:brightness-110 transition-all">
          <Plus size={18} /> Nova Turma
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Total Inscritos', value: stats.total, icon: Users, color: 'text-blue-400' },
          { label: 'Turmas Ativas', value: stats.groups, icon: Baby, color: 'text-pink-400' },
          { label: 'Professores', value: stats.teachers, icon: GraduationCap, color: 'text-emerald-400' },
          { label: 'Salas', value: stats.rooms, icon: BookOpen, color: 'text-amber-400' },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-5 flex items-start justify-between">
            <div>
              <p className="text-[10px] font-black uppercase text-nexus-text-muted tracking-widest">{stat.label}</p>
              <h3 className="text-xl font-black text-nexus-text mt-1">{stat.value}</h3>
            </div>
            <div className={`p-2 rounded-lg bg-nexus-card ${stat.color}`}><stat.icon size={18} /></div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="glass-card p-12 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-nexus-yellow border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-sm text-nexus-text-muted">A carregar turmas...</p>
        </div>
      ) : error ? (
        <div className="glass-card p-12 text-center">
          <p className="text-sm text-red-400">Erro: {error}</p>
        </div>
      ) : groups.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Baby size={48} className="mx-auto text-nexus-text-muted mb-4 opacity-50" />
          <h3 className="text-lg font-bold text-nexus-text mb-2">Sem turmas registadas</h3>
          <p className="text-sm text-nexus-text-muted">Comece por criar a primeira turma infantil.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => (
            <div key={group.id} onClick={() => setSelectedGroup(group)} className="glass-card p-5 hover:border-nexus-orange/30 transition-all group cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-pink-500/10 rounded-lg text-pink-400"><Baby size={18} /></div>
                <span className="text-[9px] font-black text-nexus-text-muted bg-nexus-card px-2 py-1 rounded border border-nexus-border">{group.age_range}</span>
              </div>
              <h3 className="text-sm font-black text-nexus-text group-hover:text-nexus-orange transition-colors mb-1">{group.name}</h3>
              <p className="text-[10px] text-nexus-text-muted font-bold mb-3">Prof: {group.teacher_name || 'N/A'}</p>
              <div className="flex items-center justify-between pt-3 border-t border-nexus-border/50">
                <span className="text-[10px] text-nexus-text-muted font-bold">{group.enrolled_count || 0} inscritos</span>
                <button className="p-1 text-nexus-text-muted hover:text-nexus-orange transition-colors"><ChevronRight size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-nexus-bg/90 backdrop-blur-xl" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-md glass-card p-8 border-nexus-border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-nexus-text uppercase">Nova Turma Infantil</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-nexus-text-muted hover:text-nexus-text"><X size={20} /></button>
              </div>
              <div className="space-y-4">
                <div><label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">Nome da Turma</label>
                  <input type="text" value={newGroup.name} onChange={(e) => setNewGroup(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Pequenos missionários" className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl p-3 text-sm text-nexus-text focus:ring-1 focus:ring-nexus-yellow" /></div>
                <div><label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">Faixa Etária</label>
                  <input type="text" value={newGroup.age_range} onChange={(e) => setNewGroup(p => ({ ...p, age_range: e.target.value }))} placeholder="Ex: 3-5 anos" className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl p-3 text-sm text-nexus-text focus:ring-1 focus:ring-nexus-yellow" /></div>
                <div><label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">Professor(a)</label>
                  <input type="text" value={newGroup.teacher_name} onChange={(e) => setNewGroup(p => ({ ...p, teacher_name: e.target.value }))} className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl p-3 text-sm text-nexus-text focus:ring-1 focus:ring-nexus-yellow" /></div>
                <div><label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">Sala</label>
                  <input type="text" value={newGroup.room} onChange={(e) => setNewGroup(p => ({ ...p, room: e.target.value }))} className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl p-3 text-sm text-nexus-text focus:ring-1 focus:ring-nexus-yellow" /></div>
              </div>
              <div className="flex gap-3 mt-6 relative">
                {isSuccess ? (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute inset-0 z-10 flex items-center justify-center bg-emerald-500 rounded-xl text-white font-bold text-xs uppercase tracking-widest gap-2"><Check size={18} /> Turma Criada</motion.div>
                ) : null}
                <button onClick={() => setIsModalOpen(false)} disabled={isSubmitting || isSuccess} className="flex-1 py-3 bg-nexus-card hover:bg-nexus-border text-nexus-text rounded-xl text-sm font-black uppercase tracking-widest transition-all disabled:opacity-50">Cancelar</button>
                <button onClick={handleCreateGroup} disabled={isSubmitting || isSuccess || !newGroup.name.trim()} className="flex-1 py-3 gold-gradient text-white rounded-xl text-sm font-black uppercase tracking-widest hover:brightness-110 shadow-xl shadow-nexus-orange/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed">Criar Turma</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Details Modal */}
      <AnimatePresence>
        {selectedGroup && !isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedGroup(null)} className="absolute inset-0 bg-nexus-bg/90 backdrop-blur-xl" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-md glass-card p-8 border-nexus-border">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 bg-pink-500/10 rounded-xl text-pink-400"><Baby size={20} /></div>
                    <h3 className="text-lg font-black text-nexus-text uppercase">{selectedGroup.name}</h3>
                  </div>
                  <span className="text-[9px] font-black text-nexus-text-muted bg-nexus-card px-2 py-1 rounded border border-nexus-border">{selectedGroup.age_range}</span>
                </div>
                <button onClick={() => setSelectedGroup(null)} className="text-nexus-text-muted hover:text-nexus-text"><X size={20} /></button>
              </div>

              <div className="space-y-3 mb-6">
                <div className="p-3 bg-nexus-card/30 rounded-lg border border-nexus-border/30 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-nexus-text-muted uppercase">Professor(a)</span>
                  <span className="text-sm font-bold text-nexus-text">{selectedGroup.teacher_name || 'N/A'}</span>
                </div>
                <div className="p-3 bg-nexus-card/30 rounded-lg border border-nexus-border/30 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-nexus-text-muted uppercase">Sala</span>
                  <span className="text-sm font-bold text-nexus-text">{selectedGroup.room || 'N/A'}</span>
                </div>
                <div className="p-3 bg-nexus-card/30 rounded-lg border border-nexus-border/30 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-nexus-text-muted uppercase">Inscritos</span>
                  <span className="text-sm font-bold text-nexus-text">{selectedGroup.enrolled_count || 0}</span>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t border-nexus-border/50">
                <button onClick={() => handleDeleteGroup(selectedGroup.id)} className="px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2">
                  <Trash2 size={14} /> Eliminar
                </button>
                <button onClick={() => openEditModal(selectedGroup)} className="flex-1 py-2.5 gold-gradient text-white rounded-xl text-xs font-black uppercase tracking-widest hover:brightness-110 shadow-lg shadow-nexus-orange/10 transition-all flex items-center justify-center gap-2">
                  <Edit3 size={14} /> Editar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditModalOpen && selectedGroup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEditModalOpen(false)} className="absolute inset-0 bg-nexus-bg/90 backdrop-blur-xl" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-md glass-card p-8 border-nexus-border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-nexus-text uppercase">Editar Turma</h3>
                <button onClick={() => setIsEditModalOpen(false)} className="text-nexus-text-muted hover:text-nexus-text"><X size={20} /></button>
              </div>
              <div className="space-y-4">
                <div><label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">Nome da Turma</label>
                  <input type="text" value={editForm.name} onChange={(e) => setEditForm(p => ({ ...p, name: e.target.value }))} className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl p-3 text-sm text-nexus-text focus:ring-1 focus:ring-nexus-yellow" /></div>
                <div><label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">Faixa Etária</label>
                  <input type="text" value={editForm.age_range} onChange={(e) => setEditForm(p => ({ ...p, age_range: e.target.value }))} className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl p-3 text-sm text-nexus-text focus:ring-1 focus:ring-nexus-yellow" /></div>
                <div><label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">Professor(a)</label>
                  <input type="text" value={editForm.teacher_name} onChange={(e) => setEditForm(p => ({ ...p, teacher_name: e.target.value }))} className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl p-3 text-sm text-nexus-text focus:ring-1 focus:ring-nexus-yellow" /></div>
                <div><label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">Sala</label>
                  <input type="text" value={editForm.room} onChange={(e) => setEditForm(p => ({ ...p, room: e.target.value }))} className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl p-3 text-sm text-nexus-text focus:ring-1 focus:ring-nexus-yellow" /></div>
              </div>
              <div className="flex gap-3 mt-6 relative">
                {isEditSuccess ? (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute inset-0 z-10 flex items-center justify-center bg-emerald-500 rounded-xl text-white font-bold text-xs uppercase tracking-widest gap-2"><Check size={18} /> Turma Atualizada</motion.div>
                ) : null}
                <button onClick={() => setIsEditModalOpen(false)} disabled={isEditSubmitting || isEditSuccess} className="flex-1 py-3 bg-nexus-card hover:bg-nexus-border text-nexus-text rounded-xl text-sm font-black uppercase tracking-widest transition-all disabled:opacity-50">Cancelar</button>
                <button onClick={handleEditGroup} disabled={isEditSubmitting || isEditSuccess || !editForm.name.trim()} className="flex-1 py-3 gold-gradient text-white rounded-xl text-sm font-black uppercase tracking-widest hover:brightness-110 shadow-xl shadow-nexus-orange/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed">Guardar</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
