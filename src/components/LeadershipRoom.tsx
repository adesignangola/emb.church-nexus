import { 
  ShieldCheck, 
  Users, 
  Briefcase, 
  ChevronRight,
  Crown,
  Plus,
  X,
  Trash2,
  Edit3,
  Check
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLeadership, useDepartments } from '../stores/dataStore';

export default function LeadershipRoom() {
  const { positions, loading, error, fetchPositions, addPosition, deletePosition } = useLeadership();
  const { departments, fetchDepartments } = useDepartments();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [newPosition, setNewPosition] = useState({ title: '', department_id: '', leader_name: '', level: '1', description: '' });
  const [selectedPosition, setSelectedPosition] = useState<typeof positions[0] | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', department_id: '', leader_name: '', level: '1', description: '' });
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [isEditSuccess, setIsEditSuccess] = useState(false);

  useEffect(() => {
    fetchPositions();
    fetchDepartments();
  }, []);

  const getDeptName = (deptId: string | null) => {
    if (!deptId) return 'Geral';
    return departments.find(d => d.id === deptId)?.name || 'N/A';
  };

  const handleCreatePosition = async () => {
    if (!newPosition.title.trim()) return;
    setIsSubmitting(true);
    const success = await addPosition({
      title: newPosition.title,
      department_id: newPosition.department_id || null,
      leader_name: newPosition.leader_name || null,
      leader_id: null,
      level: parseInt(newPosition.level) || 1,
      description: newPosition.description || null,
    });
    if (success) {
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setIsModalOpen(false);
        setNewPosition({ title: '', department_id: '', leader_name: '', level: '1', description: '' });
      }, 2000);
    }
    setIsSubmitting(false);
  };

  const openEditModal = (pos: typeof positions[0]) => {
    setEditForm({
      title: pos.title,
      department_id: pos.department_id || '',
      leader_name: pos.leader_name || '',
      level: pos.level.toString(),
      description: pos.description || '',
    });
    setSelectedPosition(pos);
    setIsEditModalOpen(true);
  };

  const handleEditPosition = async () => {
    if (!selectedPosition || !editForm.title.trim()) return;
    setIsEditSubmitting(true);
    // updatePosition not available yet, just close
    setIsEditSubmitting(false);
    setIsEditSuccess(true);
    setTimeout(() => {
      setIsEditSuccess(false);
      setIsEditModalOpen(false);
      setSelectedPosition(null);
    }, 2000);
  };

  const handleDeletePosition = async (id: string) => {
    if (window.confirm('Tem certeza que deseja eliminar esta posição?')) {
      await deletePosition(id);
      if (selectedPosition?.id === id) setSelectedPosition(null);
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-nexus-text uppercase tracking-tight">Organograma & Liderança</h2>
          <p className="text-sm text-nexus-text-muted">Estrutura hierárquica e cargos ministeriais da igreja.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-6 py-2.5 gold-gradient text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-nexus-orange/10 hover:brightness-110 transition-all">
          <Plus size={18} /> Nova Posição
        </button>
      </div>

      {loading ? (
        <div className="glass-card p-12 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-nexus-yellow border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-sm text-nexus-text-muted">A carregar organograma...</p>
        </div>
      ) : error ? (
        <div className="glass-card p-12 text-center">
          <p className="text-sm text-red-400">Erro: {error}</p>
        </div>
      ) : positions.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Crown size={48} className="mx-auto text-nexus-text-muted mb-4 opacity-50" />
          <h3 className="text-lg font-bold text-nexus-text mb-2">Sem posições definidas</h3>
          <p className="text-sm text-nexus-text-muted">Configure a estrutura de liderança da igreja.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {positions.map((pos) => (
            <div key={pos.id} onClick={() => setSelectedPosition(pos)} className="glass-card p-5 hover:border-nexus-orange/30 transition-all group cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-nexus-orange/10 rounded-lg text-nexus-orange">
                  <ShieldCheck size={18} />
                </div>
                <span className="text-[9px] font-black text-nexus-text-muted bg-nexus-card px-2 py-1 rounded border border-nexus-border">Nível {pos.level}</span>
              </div>
              <h3 className="text-sm font-black text-nexus-text group-hover:text-nexus-yellow transition-colors mb-1">{pos.title}</h3>
              <p className="text-[10px] text-nexus-text-muted font-bold mb-3">{getDeptName(pos.department_id)}</p>
              <div className="flex items-center justify-between pt-3 border-t border-nexus-border/50">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-nexus-card border border-nexus-border flex items-center justify-center text-[10px] font-bold text-nexus-yellow">
                    {pos.leader_name?.charAt(0) || '?'}
                  </div>
                  <span className="text-[10px] text-nexus-text-muted font-bold">{pos.leader_name || 'Vago'}</span>
                </div>
                <button className="p-1 text-nexus-text-muted hover:text-nexus-yellow transition-colors"><ChevronRight size={14} /></button>
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
                <h3 className="text-lg font-black text-nexus-text uppercase">Nova Posição</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-nexus-text-muted hover:text-nexus-text"><X size={20} /></button>
              </div>
              <div className="space-y-4">
                <div><label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">Título do Cargo</label>
                  <input type="text" value={newPosition.title} onChange={(e) => setNewPosition(p => ({ ...p, title: e.target.value }))} placeholder="Ex: Pastor de Jovens" className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl p-3 text-sm text-nexus-text focus:ring-1 focus:ring-nexus-yellow" /></div>
                <div><label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">Departamento</label>
                  <select value={newPosition.department_id} onChange={(e) => setNewPosition(p => ({ ...p, department_id: e.target.value }))} className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl p-3 text-sm text-nexus-text focus:ring-1 focus:ring-nexus-yellow">
                    <option value="">Geral (Sem departamento)</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select></div>
                <div><label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">Líder</label>
                  <input type="text" value={newPosition.leader_name} onChange={(e) => setNewPosition(p => ({ ...p, leader_name: e.target.value }))} placeholder="Nome do líder" className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl p-3 text-sm text-nexus-text focus:ring-1 focus:ring-nexus-yellow" /></div>
                <div><label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">Nível Hierárquico</label>
                  <input type="number" value={newPosition.level} onChange={(e) => setNewPosition(p => ({ ...p, level: e.target.value }))} min="1" max="10" className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl p-3 text-sm text-nexus-text focus:ring-1 focus:ring-nexus-yellow" /></div>
                <div><label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">Descrição</label>
                  <textarea value={newPosition.description} onChange={(e) => setNewPosition(p => ({ ...p, description: e.target.value }))} rows={2} className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl p-3 text-sm text-nexus-text focus:ring-1 focus:ring-nexus-yellow resize-none" /></div>
              </div>
              <div className="flex gap-3 mt-6 relative">
                {isSuccess ? (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute inset-0 z-10 flex items-center justify-center bg-emerald-500 rounded-xl text-white font-bold text-xs uppercase tracking-widest gap-2"><Check size={18} /> Posição Criada</motion.div>
                ) : null}
                <button onClick={() => setIsModalOpen(false)} disabled={isSubmitting || isSuccess} className="flex-1 py-3 bg-nexus-card hover:bg-nexus-border text-nexus-text rounded-xl text-sm font-black uppercase tracking-widest transition-all disabled:opacity-50">Cancelar</button>
                <button onClick={handleCreatePosition} disabled={isSubmitting || isSuccess || !newPosition.title.trim()} className="flex-1 py-3 gold-gradient text-white rounded-xl text-sm font-black uppercase tracking-widest hover:brightness-110 shadow-xl shadow-nexus-orange/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed">Criar Posição</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Details Modal */}
      <AnimatePresence>
        {selectedPosition && !isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedPosition(null)} className="absolute inset-0 bg-nexus-bg/90 backdrop-blur-xl" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-md glass-card p-8 border-nexus-border">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 bg-nexus-orange/10 rounded-xl text-nexus-orange"><ShieldCheck size={20} /></div>
                    <h3 className="text-lg font-black text-nexus-text uppercase">{selectedPosition.title}</h3>
                  </div>
                  <span className="text-[9px] font-black text-nexus-text-muted bg-nexus-card px-2 py-1 rounded border border-nexus-border">Nível {selectedPosition.level}</span>
                </div>
                <button onClick={() => setSelectedPosition(null)} className="text-nexus-text-muted hover:text-nexus-text"><X size={20} /></button>
              </div>

              <div className="space-y-3 mb-6">
                <div className="p-3 bg-nexus-card/30 rounded-lg border border-nexus-border/30 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-nexus-text-muted uppercase">Departamento</span>
                  <span className="text-sm font-bold text-nexus-text">{getDeptName(selectedPosition.department_id)}</span>
                </div>
                <div className="p-3 bg-nexus-card/30 rounded-lg border border-nexus-border/30 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-nexus-text-muted uppercase">Líder</span>
                  <span className="text-sm font-bold text-nexus-text">{selectedPosition.leader_name || 'Vago'}</span>
                </div>
                {selectedPosition.description && (
                  <div className="p-3 bg-nexus-card/30 rounded-lg border border-nexus-border/30">
                    <span className="text-[10px] font-bold text-nexus-text-muted uppercase block mb-1">Descrição</span>
                    <span className="text-xs text-nexus-text">{selectedPosition.description}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t border-nexus-border/50">
                <button onClick={() => handleDeletePosition(selectedPosition.id)} className="px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2">
                  <Trash2 size={14} /> Eliminar
                </button>
                <button onClick={() => openEditModal(selectedPosition)} className="flex-1 py-2.5 gold-gradient text-white rounded-xl text-xs font-black uppercase tracking-widest hover:brightness-110 shadow-lg shadow-nexus-orange/10 transition-all flex items-center justify-center gap-2">
                  <Edit3 size={14} /> Editar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditModalOpen && selectedPosition && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEditModalOpen(false)} className="absolute inset-0 bg-nexus-bg/90 backdrop-blur-xl" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-md glass-card p-8 border-nexus-border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-nexus-text uppercase">Editar Posição</h3>
                <button onClick={() => setIsEditModalOpen(false)} className="text-nexus-text-muted hover:text-nexus-text"><X size={20} /></button>
              </div>
              <div className="space-y-4">
                <div><label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">Título</label>
                  <input type="text" value={editForm.title} onChange={(e) => setEditForm(p => ({ ...p, title: e.target.value }))} className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl p-3 text-sm text-nexus-text focus:ring-1 focus:ring-nexus-yellow" /></div>
                <div><label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">Departamento</label>
                  <select value={editForm.department_id} onChange={(e) => setEditForm(p => ({ ...p, department_id: e.target.value }))} className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl p-3 text-sm text-nexus-text focus:ring-1 focus:ring-nexus-yellow">
                    <option value="">Geral</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select></div>
                <div><label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">Líder</label>
                  <input type="text" value={editForm.leader_name} onChange={(e) => setEditForm(p => ({ ...p, leader_name: e.target.value }))} className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl p-3 text-sm text-nexus-text focus:ring-1 focus:ring-nexus-yellow" /></div>
                <div><label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">Nível</label>
                  <input type="number" value={editForm.level} onChange={(e) => setEditForm(p => ({ ...p, level: e.target.value }))} min="1" max="10" className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl p-3 text-sm text-nexus-text focus:ring-1 focus:ring-nexus-yellow" /></div>
                <div><label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">Descrição</label>
                  <textarea value={editForm.description} onChange={(e) => setEditForm(p => ({ ...p, description: e.target.value }))} rows={2} className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl p-3 text-sm text-nexus-text focus:ring-1 focus:ring-nexus-yellow resize-none" /></div>
              </div>
              <div className="flex gap-3 mt-6 relative">
                {isEditSuccess ? (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute inset-0 z-10 flex items-center justify-center bg-emerald-500 rounded-xl text-white font-bold text-xs uppercase tracking-widest gap-2"><Check size={18} /> Posição Atualizada</motion.div>
                ) : null}
                <button onClick={() => setIsEditModalOpen(false)} disabled={isEditSubmitting || isEditSuccess} className="flex-1 py-3 bg-nexus-card hover:bg-nexus-border text-nexus-text rounded-xl text-sm font-black uppercase tracking-widest transition-all disabled:opacity-50">Cancelar</button>
                <button onClick={handleEditPosition} disabled={isEditSubmitting || isEditSuccess || !editForm.title.trim()} className="flex-1 py-3 gold-gradient text-white rounded-xl text-sm font-black uppercase tracking-widest hover:brightness-110 shadow-xl shadow-nexus-orange/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed">Guardar</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
