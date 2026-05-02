import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  Calendar,
  ChevronRight,
  Plus,
  X
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSchoolClasses } from '../stores/dataStore';
import { useToast } from '../lib/toastStore';

export default function SchoolsRoom() {
  const { classes, loading, error, fetchClasses } = useSchoolClasses();
  const { show } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClass, setNewClass] = useState({ name: '', description: '', teacher_name: '', status: 'ACTIVE' as const });

  useEffect(() => {
    fetchClasses();
  }, []);

  const stats = useMemo(() => ({
    active: classes.filter(c => c.status === 'ACTIVE').length,
    total: classes.reduce((sum, c) => sum + (c.enrolled_count || 0), 0),
    completed: classes.filter(c => c.status === 'COMPLETED').length,
  }), [classes]);

  const STATUS_LABELS: Record<string, string> = {
    ACTIVE: 'Ativa',
    COMPLETED: 'Concluída',
    PLANNED: 'Planeada',
  };

  const STATUS_COLORS: Record<string, string> = {
    ACTIVE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    COMPLETED: 'bg-nexus-card text-nexus-text-muted border-nexus-border',
    PLANNED: 'bg-nexus-yellow/10 text-nexus-yellow border-nexus-yellow/20',
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-nexus-text uppercase tracking-tight">Escolas Espirituais & Formação</h2>
          <p className="text-sm text-nexus-text-muted">Discipulado, classes bíblicas e formação ministerial.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-6 py-2.5 gold-gradient text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-nexus-orange/10 hover:brightness-110 transition-all">
          <Plus size={18} /> Nova Turma
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Matrículas Ativas', value: stats.total, icon: Users, color: 'text-blue-400' },
          { label: 'Turmas em Curso', value: stats.active, icon: BookOpen, color: 'text-emerald-400' },
          { label: 'Concluídas', value: stats.completed, icon: GraduationCap, color: 'text-amber-400' },
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
      ) : classes.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <GraduationCap size={48} className="mx-auto text-nexus-text-muted mb-4 opacity-50" />
          <h3 className="text-lg font-bold text-nexus-text mb-2">Sem turmas registadas</h3>
          <p className="text-sm text-nexus-text-muted">Comece por criar a primeira turma.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {classes.map((cls) => (
            <div key={cls.id} className="glass-card p-5 hover:border-nexus-orange/30 transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-nexus-orange/10 rounded-lg text-nexus-orange"><BookOpen size={18} /></div>
                <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-widest ${STATUS_COLORS[cls.status] || STATUS_COLORS.ACTIVE}`}>
                  {STATUS_LABELS[cls.status] || cls.status}
                </span>
              </div>
              <h3 className="text-sm font-black text-nexus-text group-hover:text-nexus-orange transition-colors mb-1">{cls.name}</h3>
              <p className="text-[10px] text-nexus-text-muted font-bold mb-3">{cls.description || 'Sem descrição'}</p>
              <div className="flex items-center justify-between pt-3 border-t border-nexus-border/50">
                <div className="flex items-center gap-4 text-[10px] text-nexus-text-muted font-bold">
                  <span className="flex items-center gap-1"><Users size={10} /> {cls.enrolled_count || 0} alunos</span>
                  <span className="flex items-center gap-1"><Calendar size={10} /> {cls.teacher_name || 'N/A'}</span>
                </div>
                <button className="p-1 text-nexus-text-muted hover:text-nexus-orange transition-colors"><ChevronRight size={14} /></button>
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
                <h3 className="text-lg font-black text-nexus-text uppercase">Nova Turma</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-nexus-text-muted hover:text-nexus-text"><X size={20} /></button>
              </div>
              <div className="space-y-4">
                <div><label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">Nome</label>
                  <input type="text" value={newClass.name} onChange={(e) => setNewClass(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Escola de Líderes" className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl p-3 text-sm text-nexus-text focus:ring-1 focus:ring-nexus-yellow" /></div>
                <div><label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">Professor(a)</label>
                  <input type="text" value={newClass.teacher_name} onChange={(e) => setNewClass(p => ({ ...p, teacher_name: e.target.value }))} className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl p-3 text-sm text-nexus-text focus:ring-1 focus:ring-nexus-yellow" /></div>
                <div><label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">Estado</label>
                  <select value={newClass.status} onChange={(e) => setNewClass(p => ({ ...p, status: e.target.value as any }))} className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl p-3 text-sm text-nexus-text focus:ring-1 focus:ring-nexus-yellow">
                    <option value="ACTIVE">Ativa</option><option value="PLANNED">Planeada</option><option value="COMPLETED">Concluída</option>
                  </select></div>
                <div><label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">Descrição</label>
                  <textarea value={newClass.description} onChange={(e) => setNewClass(p => ({ ...p, description: e.target.value }))} rows={3} className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl p-3 text-sm text-nexus-text focus:ring-1 focus:ring-nexus-yellow resize-none" /></div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-nexus-card hover:bg-nexus-border text-nexus-text rounded-xl text-sm font-black uppercase tracking-widest transition-all">Cancelar</button>
                <button onClick={() => { if (!newClass.name.trim()) return show('Nome é obrigatório', 'error'); show('Turma criada!', 'success'); setIsModalOpen(false); setNewClass({ name: '', description: '', teacher_name: '', status: 'ACTIVE' }); }} className="flex-1 py-3 gold-gradient text-white rounded-xl text-sm font-black uppercase tracking-widest hover:brightness-110 shadow-xl shadow-nexus-orange/20 transition-all">Criar Turma</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
