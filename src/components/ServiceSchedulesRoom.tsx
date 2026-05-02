import { 
  Clock, 
  Calendar, 
  Users, 
  ChevronRight,
  Plus,
  X,
  Check
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSchedules } from '../stores/dataStore';

export default function ServiceSchedulesRoom() {
  const { schedules, loading, error, fetchSchedules, addSchedule } = useSchedules();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [newSchedule, setNewSchedule] = useState({ date: '', service_type: 'Domingo', role: '', member_name: '' });

  useEffect(() => {
    fetchSchedules();
  }, []);

  const groupedByDate = useMemo(() => {
    const groups: Record<string, typeof schedules> = {};
    schedules.forEach(s => {
      if (!groups[s.date]) groups[s.date] = [];
      groups[s.date].push(s);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [schedules]);

  const handleCreateSchedule = async () => {
    if (!newSchedule.role.trim() || !newSchedule.date) return;
    setIsSubmitting(true);
    const success = await addSchedule({
      date: newSchedule.date,
      service_type: newSchedule.service_type,
      role: newSchedule.role,
      member_name: newSchedule.member_name || null,
      member_id: null,
      notes: null,
    });
    if (success) {
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setIsModalOpen(false);
        setNewSchedule({ date: '', service_type: 'Domingo', role: '', member_name: '' });
      }, 2000);
    }
    setIsSubmitting(false);
  };

  const activeCount = schedules.length;

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-nexus-text uppercase tracking-tight">Escalas de Culto & Ministérios</h2>
          <p className="text-sm text-nexus-text-muted">Programação e distribuição de funções por culto.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-6 py-2.5 gold-gradient text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-nexus-orange/10 hover:brightness-110 transition-all">
          <Plus size={18} /> Nova Escala
        </button>
      </div>

      <div className="glass-card p-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-nexus-yellow/10 rounded-lg text-nexus-yellow"><Clock size={20} /></div>
          <div>
            <p className="text-2xl font-black text-nexus-text">{activeCount}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-nexus-text-muted">Escalações Ativas</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="glass-card p-12 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-nexus-yellow border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-sm text-nexus-text-muted">A carregar escalas...</p>
        </div>
      ) : error ? (
        <div className="glass-card p-12 text-center">
          <p className="text-sm text-red-400">Erro: {error}</p>
        </div>
      ) : groupedByDate.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Calendar size={48} className="mx-auto text-nexus-text-muted mb-4 opacity-50" />
          <h3 className="text-lg font-bold text-nexus-text mb-2">Sem escalas definidas</h3>
          <p className="text-sm text-nexus-text-muted">Comece por criar a primeira escala de culto.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedByDate.map(([date, items]) => (
            <div key={date} className="glass-card overflow-hidden">
              <div className="p-4 bg-nexus-card/30 border-b border-nexus-border flex items-center justify-between">
                <h3 className="text-sm font-black text-nexus-text flex items-center gap-2">
                  <Calendar size={16} className="text-nexus-orange" /> {new Date(date).toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })}
                </h3>
                <span className="text-[10px] font-bold text-nexus-text-muted">{items.length} escalações</span>
              </div>
              <div className="divide-y divide-nexus-border/30">
                {items.map((item) => (
                  <div key={item.id} className="p-4 flex items-center justify-between hover:bg-nexus-card/40 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-nexus-card border border-nexus-border flex items-center justify-center text-nexus-yellow">
                        <Users size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-nexus-text group-hover:text-nexus-yellow transition-colors">{item.member_name || 'N/A'}</p>
                        <p className="text-[10px] text-nexus-text-muted font-bold uppercase">{item.role} • {item.service_type}</p>
                      </div>
                    </div>
                    <button className="p-2 text-nexus-text-muted hover:text-nexus-yellow transition-colors"><ChevronRight size={18} /></button>
                  </div>
                ))}
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
                <h3 className="text-lg font-black text-nexus-text uppercase">Nova Escala</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-nexus-text-muted hover:text-nexus-text"><X size={20} /></button>
              </div>
              <div className="space-y-4">
                <div><label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">Data</label>
                  <input type="date" value={newSchedule.date} onChange={(e) => setNewSchedule(p => ({ ...p, date: e.target.value }))} className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl p-3 text-sm text-nexus-text focus:ring-1 focus:ring-nexus-yellow" /></div>
                <div><label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">Tipo de Serviço</label>
                  <select value={newSchedule.service_type} onChange={(e) => setNewSchedule(p => ({ ...p, service_type: e.target.value }))} className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl p-3 text-sm text-nexus-text focus:ring-1 focus:ring-nexus-yellow">
                    <option>Domingo</option><option>Quarta-feira</option><option>Sexta-feira</option><option>Especial</option>
                  </select></div>
                <div><label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">Função</label>
                  <input type="text" value={newSchedule.role} onChange={(e) => setNewSchedule(p => ({ ...p, role: e.target.value }))} placeholder="Ex: Pregador, Louvor" className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl p-3 text-sm text-nexus-text focus:ring-1 focus:ring-nexus-yellow" /></div>
                <div><label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">Nome do Membro</label>
                  <input type="text" value={newSchedule.member_name} onChange={(e) => setNewSchedule(p => ({ ...p, member_name: e.target.value }))} className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl p-3 text-sm text-nexus-text focus:ring-1 focus:ring-nexus-yellow" /></div>
              </div>
              <div className="flex gap-3 mt-6 relative">
                {isSuccess ? (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute inset-0 z-10 flex items-center justify-center bg-emerald-500 rounded-xl text-white font-bold text-xs uppercase tracking-widest gap-2"><Check size={18} /> Escala Criada</motion.div>
                ) : null}
                <button disabled={isSubmitting || isSuccess} onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-nexus-card hover:bg-nexus-border text-nexus-text rounded-xl text-sm font-black uppercase tracking-widest transition-all disabled:opacity-50">Cancelar</button>
                <button 
                  disabled={isSubmitting || isSuccess || !newSchedule.role.trim() || !newSchedule.date}
                  onClick={handleCreateSchedule} 
                  className="flex-1 py-3 gold-gradient text-white rounded-xl text-sm font-black uppercase tracking-widest hover:brightness-110 shadow-xl shadow-nexus-orange/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >Criar Escala</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
