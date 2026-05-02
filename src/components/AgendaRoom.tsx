import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  CalendarDays,
  X,
  Check
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useEvents } from '../stores/dataStore';

const MONTH_NAMES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

export default function AgendaRoom() {
  const { events, loading, error, fetchEvents, addEvent } = useEvents();
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', description: '', location: '', type: 'GENERAL' as const, time: '' });

  useEffect(() => {
    fetchEvents();
  }, []);

  const monthEvents = useMemo(() =>
    events.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [events, currentMonth, currentYear]
  );

  const handleCreateEvent = async () => {
    if (!newEvent.title.trim() || !newEvent.date) return;
    setIsSubmitting(true);
    const success = await addEvent({
      title: newEvent.title,
      date: newEvent.date,
      description: newEvent.description || null,
      location: newEvent.location || null,
      type: newEvent.type,
      time: null,
      end_date: null,
      image_url: null,
    });
    if (success) {
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setIsModalOpen(false);
        setNewEvent({ title: '', date: '', description: '', location: '', type: 'GENERAL', time: '' });
      }, 2000);
    }
    setIsSubmitting(false);
  };

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-nexus-text uppercase tracking-tight">Agenda & Calendário</h2>
          <p className="text-sm text-nexus-text-muted">Eventos, conferências e actividades da igreja.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-6 py-2.5 gold-gradient text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-nexus-orange/10 hover:brightness-110 transition-all">
          <Plus size={18} /> Novo Evento
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-nexus-border flex items-center justify-between">
          <button onClick={prevMonth} className="p-2 rounded-lg bg-nexus-card hover:bg-nexus-border transition-colors"><ChevronLeft size={18} /></button>
          <h3 className="text-lg font-black text-nexus-text">{MONTH_NAMES[currentMonth]} {currentYear}</h3>
          <button onClick={nextMonth} className="p-2 rounded-lg bg-nexus-card hover:bg-nexus-border transition-colors"><ChevronRight size={18} /></button>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-nexus-yellow border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-sm text-nexus-text-muted">A carregar eventos...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <p className="text-sm text-red-400">Erro: {error}</p>
          </div>
        ) : monthEvents.length === 0 ? (
          <div className="p-12 text-center">
            <CalendarDays size={48} className="mx-auto text-nexus-text-muted mb-4 opacity-50" />
            <h3 className="text-lg font-bold text-nexus-text mb-2">Sem eventos este mês</h3>
            <p className="text-sm text-nexus-text-muted">Adicione o primeiro evento para {MONTH_NAMES[currentMonth]}.</p>
          </div>
        ) : (
          <div className="divide-y divide-nexus-border/30">
            {monthEvents.map((event) => (
              <div key={event.id} className="p-5 flex items-center justify-between hover:bg-nexus-card/40 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-nexus-card border border-nexus-border flex flex-col items-center justify-center">
                    <Calendar size={14} className="text-nexus-orange mb-0.5" />
                    <span className="text-[10px] font-bold text-nexus-text-muted">{new Date(event.date).getDate()}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-nexus-text group-hover:text-nexus-orange transition-colors">{event.title}</p>
                    <p className="text-[10px] text-nexus-text-muted font-bold">{event.description || event.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-nexus-text-muted font-bold">{event.location || 'N/A'}</p>
                  <button className="p-2 text-nexus-text-muted hover:text-nexus-orange transition-colors mt-1"><ChevronRight size={18} /></button>
                </div>
              </div>
            ))}
          </div>
      )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-nexus-bg/90 backdrop-blur-xl" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-md glass-card p-8 border-nexus-border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-nexus-text uppercase">Novo Evento</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-nexus-text-muted hover:text-nexus-text"><X size={20} /></button>
              </div>
              <div className="space-y-4">
                <div><label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">Título</label>
                  <input type="text" value={newEvent.title} onChange={(e) => setNewEvent(p => ({ ...p, title: e.target.value }))} className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl p-3 text-sm text-nexus-text focus:ring-1 focus:ring-nexus-yellow" /></div>
                <div><label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">Data</label>
                  <input type="date" value={newEvent.date} onChange={(e) => setNewEvent(p => ({ ...p, date: e.target.value }))} className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl p-3 text-sm text-nexus-text focus:ring-1 focus:ring-nexus-yellow" /></div>
                <div><label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">Localização</label>
                  <input type="text" value={newEvent.location} onChange={(e) => setNewEvent(p => ({ ...p, location: e.target.value }))} className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl p-3 text-sm text-nexus-text focus:ring-1 focus:ring-nexus-yellow" /></div>
                <div><label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">Descrição</label>
                  <textarea value={newEvent.description} onChange={(e) => setNewEvent(p => ({ ...p, description: e.target.value }))} rows={3} className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl p-3 text-sm text-nexus-text focus:ring-1 focus:ring-nexus-yellow resize-none" /></div>
              </div>
              <div className="flex gap-3 mt-6 relative">
                {isSuccess ? (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute inset-0 z-10 flex items-center justify-center bg-emerald-500 rounded-xl text-white font-bold text-xs uppercase tracking-widest gap-2"><Check size={18} /> Evento Criado</motion.div>
                ) : null}
                <button disabled={isSubmitting || isSuccess} onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-nexus-card hover:bg-nexus-border text-nexus-text rounded-xl text-sm font-black uppercase tracking-widest transition-all disabled:opacity-50">Cancelar</button>
                <button 
                  disabled={isSubmitting || isSuccess || !newEvent.title.trim() || !newEvent.date}
                  onClick={handleCreateEvent} 
                  className="flex-1 py-3 gold-gradient text-white rounded-xl text-sm font-black uppercase tracking-widest hover:brightness-110 shadow-xl shadow-nexus-orange/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >Criar Evento</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
