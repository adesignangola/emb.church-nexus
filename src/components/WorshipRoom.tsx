import { 
  Church, 
  TrendingUp, 
  Users, 
  HandCoins, 
  Calendar,
  ChevronRight,
  Plus,
  X,
  Check,
  Mic2
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useWorship } from '../stores/dataStore';

export default function WorshipRoom() {
  const { services, loading, error, fetchServices, addService } = useWorship();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'Domingo',
    preacher: '',
    theme: '',
    bible_text: '',
    attendance_members: 0,
    attendance_visitors: 0,
    decisions: 0,
    offerings: 0,
    notes: '',
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const SERVICE_TYPES = ['Domingo', 'Quarta-feira', 'Sexta-feira', 'Domingo Tarde', 'Especial'];

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.date) errors.date = 'Data obrigatória';
    if (!formData.preacher.trim()) errors.preacher = 'Pregador obrigatório';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleConfirm = async () => {
    if (!validateForm()) return;
    await addService({
      date: formData.date,
      type: formData.type,
      preacher: formData.preacher,
      theme: formData.theme || null,
      bible_text: formData.bible_text || null,
      attendance_members: formData.attendance_members,
      attendance_visitors: formData.attendance_visitors,
      decisions: formData.decisions,
      offerings: formData.offerings,
      notes: formData.notes || null,
    });
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setIsModalOpen(false);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        type: 'Domingo',
        preacher: '',
        theme: '',
        bible_text: '',
        attendance_members: 0,
        attendance_visitors: 0,
        decisions: 0,
        offerings: 0,
        notes: '',
      });
      setFormErrors({});
    }, 2000);
  };

  const stats = useMemo(() => {
    const thisMonth = services.filter(s => new Date(s.date).getMonth() === new Date().getMonth());
    return {
      cultos: thisMonth.length,
      presentes: thisMonth.reduce((sum, s) => sum + (s.attendance_members || 0) + (s.attendance_visitors || 0), 0),
      decisoes: thisMonth.reduce((sum, s) => sum + (s.decisions || 0), 0),
      ofertas: thisMonth.reduce((sum, s) => sum + (s.offerings || 0), 0),
    };
  }, [services]);

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-nexus-text uppercase tracking-tight">Gestão de Cultos</h2>
          <p className="text-sm text-nexus-text-muted">Registos, presença e relatórios operacionais de cada culto.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-2.5 gold-gradient text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-nexus-orange/10 hover:brightness-110 transition-all"
        >
          <Plus size={18} /> Novo Registo
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Cultos este Mês', value: stats.cultos, icon: Church, color: 'text-nexus-orange' },
          { label: 'Total Presentes', value: stats.presentes.toLocaleString(), icon: Users, color: 'text-blue-400' },
          { label: 'Total Decisões', value: stats.decisoes, icon: TrendingUp, color: 'text-emerald-400' },
          { label: 'Total Ofertas', value: `${stats.ofertas.toLocaleString()}kz`, icon: HandCoins, color: 'text-amber-400' },
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

      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-nexus-yellow border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-sm text-nexus-text-muted">A carregar cultos...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <p className="text-sm text-red-400">Erro: {error}</p>
          </div>
        ) : services.length === 0 ? (
          <div className="p-12 text-center">
            <Church size={48} className="mx-auto text-nexus-text-muted mb-4 opacity-50" />
            <h3 className="text-lg font-bold text-nexus-text mb-2">Nenhum culto registado</h3>
            <p className="text-sm text-nexus-text-muted">Comece por registar o primeiro culto.</p>
          </div>
        ) : (
          <div className="divide-y divide-nexus-border/30">
            {services.map((service) => (
              <div key={service.id} className="p-5 flex items-center justify-between hover:bg-nexus-card/40 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-nexus-card border border-nexus-border flex flex-col items-center justify-center">
                    <Calendar size={14} className="text-nexus-yellow mb-0.5" />
                    <span className="text-[9px] font-bold text-nexus-text-muted">{new Date(service.date).getDate()}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-nexus-text group-hover:text-nexus-yellow transition-colors">{service.type}</p>
                    <p className="text-[10px] text-nexus-text-muted font-bold">{service.preacher} • {service.theme || 'Sem tema'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-right">
                  <div>
                    <p className="text-xs font-bold text-nexus-text">{(service.attendance_members || 0) + (service.attendance_visitors || 0)}</p>
                    <p className="text-[9px] text-nexus-text-muted font-bold uppercase">Presentes</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-emerald-400">{service.decisions || 0}</p>
                    <p className="text-[9px] text-nexus-text-muted font-bold uppercase">Decisões</p>
                  </div>
                  <button className="p-2 text-nexus-text-muted hover:text-nexus-yellow transition-colors"><ChevronRight size={18} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsModalOpen(false)} 
              className="absolute inset-0 bg-nexus-bg/80 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }} 
              className="relative w-full max-w-xl glass-card p-8 space-y-6 overflow-hidden border-nexus-border" 
              role="dialog" 
              aria-modal="true" 
              aria-label="Novo Registo de Culto"
            >
              <div className="flex items-center justify-between border-b border-nexus-border pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-nexus-yellow/10 rounded-lg text-nexus-yellow"><Church size={20} /></div>
                  <h3 className="text-xl font-bold text-nexus-text">Novo Registo de Culto</h3>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  disabled={isSuccess}
                  className="text-nexus-text-muted hover:text-nexus-text transition-colors disabled:opacity-50"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="svc-date" className="text-[10px] font-bold text-nexus-text-muted uppercase tracking-widest px-1">Data <span className="text-rose-500">*</span></label>
                    <input 
                      id="svc-date" 
                      type="date" 
                      value={formData.date} 
                      onChange={(e) => { setFormData(prev => ({ ...prev, date: e.target.value })); setFormErrors(prev => ({ ...prev, date: '' })); }} 
                      className={`w-full bg-nexus-card border rounded-xl p-2.5 text-sm text-nexus-text ${formErrors.date ? 'border-rose-500' : 'border-nexus-border'}`} 
                      aria-required="true" 
                    />
                    {formErrors.date && <p className="text-xs text-rose-400 font-medium">{formErrors.date}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="svc-type" className="text-[10px] font-bold text-nexus-text-muted uppercase tracking-widest px-1">Tipo de Culto</label>
                    <select 
                      id="svc-type" 
                      value={formData.type} 
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))} 
                      className="w-full bg-nexus-card border border-nexus-border rounded-xl p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-nexus-yellow appearance-none text-nexus-text"
                    >
                      {SERVICE_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="svc-preacher" className="text-[10px] font-bold text-nexus-text-muted uppercase tracking-widest px-1">Pregador <span className="text-rose-500">*</span></label>
                    <input 
                      id="svc-preacher" 
                      type="text" 
                      value={formData.preacher} 
                      onChange={(e) => { setFormData(prev => ({ ...prev, preacher: e.target.value })); setFormErrors(prev => ({ ...prev, preacher: '' })); }} 
                      placeholder="Nome do pregador" 
                      className={`w-full bg-nexus-card border rounded-xl p-2.5 text-sm focus:outline-none focus:ring-1 text-nexus-text ${formErrors.preacher ? 'border-rose-500 focus:ring-rose-500' : 'border-nexus-border focus:ring-nexus-yellow'}`} 
                      aria-required="true" 
                    />
                    {formErrors.preacher && <p className="text-xs text-rose-400 font-medium">{formErrors.preacher}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="svc-theme" className="text-[10px] font-bold text-nexus-text-muted uppercase tracking-widest px-1">Tema</label>
                    <input 
                      id="svc-theme" 
                      type="text" 
                      value={formData.theme} 
                      onChange={(e) => setFormData(prev => ({ ...prev, theme: e.target.value }))} 
                      placeholder="Tema da mensagem" 
                      className="w-full bg-nexus-card border border-nexus-border rounded-xl p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-nexus-yellow text-nexus-text" 
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="svc-bible" className="text-[10px] font-bold text-nexus-text-muted uppercase tracking-widest px-1">Texto Bíblico</label>
                    <input 
                      id="svc-bible" 
                      type="text" 
                      value={formData.bible_text} 
                      onChange={(e) => setFormData(prev => ({ ...prev, bible_text: e.target.value }))} 
                      placeholder="Ex: João 3:16" 
                      className="w-full bg-nexus-card border border-nexus-border rounded-xl p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-nexus-yellow text-nexus-text" 
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-nexus-text-muted uppercase tracking-widest px-1">Estatísticas do Culto</label>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label htmlFor="svc-members" className="text-[9px] font-bold text-nexus-text-muted uppercase tracking-widest">Membros</label>
                      <input id="svc-members" type="number" min="0" value={formData.attendance_members} onChange={(e) => setFormData(prev => ({ ...prev, attendance_members: parseInt(e.target.value) || 0 }))} className="w-full bg-nexus-card border border-nexus-border rounded-xl p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-nexus-yellow text-nexus-text" />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="svc-visitors" className="text-[9px] font-bold text-nexus-text-muted uppercase tracking-widest">Visitantes</label>
                      <input id="svc-visitors" type="number" min="0" value={formData.attendance_visitors} onChange={(e) => setFormData(prev => ({ ...prev, attendance_visitors: parseInt(e.target.value) || 0 }))} className="w-full bg-nexus-card border border-nexus-border rounded-xl p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-nexus-yellow text-nexus-text" />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="svc-decisions" className="text-[9px] font-bold text-nexus-text-muted uppercase tracking-widest">Decisões</label>
                      <input id="svc-decisions" type="number" min="0" value={formData.decisions} onChange={(e) => setFormData(prev => ({ ...prev, decisions: parseInt(e.target.value) || 0 }))} className="w-full bg-nexus-card border border-nexus-border rounded-xl p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-nexus-yellow text-nexus-text" />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="svc-offerings" className="text-[9px] font-bold text-nexus-text-muted uppercase tracking-widest">Ofertas (kz)</label>
                      <input id="svc-offerings" type="number" min="0" step="100" value={formData.offerings} onChange={(e) => setFormData(prev => ({ ...prev, offerings: parseInt(e.target.value) || 0 }))} className="w-full bg-nexus-card border border-nexus-border rounded-xl p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-nexus-yellow text-nexus-text" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="svc-notes" className="text-[10px] font-bold text-nexus-text-muted uppercase tracking-widest px-1">Notas</label>
                    <textarea 
                      id="svc-notes" 
                      value={formData.notes} 
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))} 
                      placeholder="Observações adicionais..." 
                      rows={3}
                      className="w-full bg-nexus-card border border-nexus-border rounded-xl p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-nexus-yellow text-nexus-text resize-none" 
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 flex gap-3 relative">
                {isSuccess ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="absolute inset-0 z-10 flex items-center justify-center bg-emerald-500 rounded-xl text-white font-bold text-xs uppercase tracking-widest gap-2"
                  >
                    <Check size={18} /> Culto Registado
                  </motion.div>
                ) : null}
                <button 
                  disabled={isSuccess} 
                  onClick={() => setIsModalOpen(false)} 
                  className="flex-1 py-3 bg-nexus-card hover:bg-nexus-card/80 text-nexus-text-muted rounded-xl text-xs font-bold uppercase tracking-widest transition-all border border-nexus-border"
                >
                  Cancelar
                </button>
                <button 
                  disabled={isSuccess} 
                  onClick={handleConfirm} 
                  className="flex-1 py-3 gold-gradient text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:brightness-110 shadow-lg shadow-nexus-orange/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirmar Registo
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
