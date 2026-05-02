import { 
  ClipboardList, 
  UserSearch, 
  CalendarCheck, 
  Plus, 
  Clock, 
  ChevronRight,
  MousePointer2,
  Users,
  X,
  Check,
  AlertCircle,
  CalendarDays,
  UserPlus,
  ListChecks,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useAppointments, useProfiles, useVisitors, useWorship, useSchedules } from '../stores/dataStore';
import { useAuth } from '../stores/authStore';

const TYPE_LABELS: Record<string, string> = {
  COUNSELING: 'Aconselhamento',
  VISIT: 'Visita',
  PRESENTATION: 'Apresentação',
  MARRIAGE: 'Casamento',
  HOSPITAL: 'Visita Hospitalar',
  OTHER: 'Outro',
};

export default function SecretaryRoom() {
  const { appointments, loading: apptLoading, error: apptError, fetchAppointments, addAppointment } = useAppointments();
  const { profiles, fetchProfiles } = useProfiles();
  const { visitors, loading: visLoading, fetchVisitors, addVisitor } = useVisitors();
  const { addService } = useWorship();
  const { addSchedule } = useSchedules();
  const { profile: activeSecretary } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPastor, setSelectedPastor] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({ memberName: '', type: 'COUNSELING', date: '', time: '' });
  const modalRef = useRef<HTMLDivElement>(null);

  const [isVisitorModalOpen, setIsVisitorModalOpen] = useState(false);
  const [isVisitorSuccess, setIsVisitorSuccess] = useState(false);
  const [isVisitorLoading, setIsVisitorLoading] = useState(false);
  const [visitorFormErrors, setVisitorFormErrors] = useState<Record<string, string>>({});
  const [visitorFormData, setVisitorFormData] = useState({
    full_name: '', phone: '', email: '', address: '', 
    visit_date: new Date().toISOString().split('T')[0],
    service_type: 'Domingo', referred_by: '', notes: ''
  });
  const visitorModalRef = useRef<HTMLDivElement>(null);

  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isServiceSuccess, setIsServiceSuccess] = useState(false);
  const [isServiceLoading, setIsServiceLoading] = useState(false);
  const [serviceFormData, setServiceFormData] = useState({
    service_name: '', day: 'Domingo', time: '09:00', leader: ''
  });
  const serviceModalRef = useRef<HTMLDivElement>(null);

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isScheduleSuccess, setIsScheduleSuccess] = useState(false);
  const [isScheduleLoading, setIsScheduleLoading] = useState(false);
  const [scheduleFormData, setScheduleFormData] = useState({
    week_start: '', service_type: 'Domingo'
  });
  const scheduleModalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchAppointments();
    fetchProfiles();
    fetchVisitors();
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = useMemo(() =>
    appointments.filter(a => a.date === today).sort((a, b) => a.time.localeCompare(b.time)),
    [appointments, today]
  );

  const pastors = useMemo(() => profiles.filter(p => p.role === 'PASTOR'), [profiles]);
  const pendingVisitors = useMemo(() => visitors.filter(v => v.follow_up_status === 'PENDING').length, [visitors]);
  const becameMembers = useMemo(() => visitors.filter(v => v.follow_up_status === 'BECAME_MEMBER').length, [visitors]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.memberName.trim()) errors.memberName = 'Nome é obrigatório';
    if (!formData.date) errors.date = 'Data é obrigatória';
    if (!formData.time) errors.time = 'Hora é obrigatória';
    if (!selectedPastor) errors.pastor = 'Selecione um pastor';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleConfirm = async () => {
    if (!validateForm()) return;
    await addAppointment({
      date: formData.date,
      time: formData.time,
      member_name: formData.memberName,
      type: formData.type as any,
      status: 'PENDING',
      pastor_id: selectedPastor,
      notes: null,
    });
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setIsModalOpen(false);
      setSelectedPastor('');
      setFormData({ memberName: '', type: 'COUNSELING', date: '', time: '' });
      setFormErrors({});
    }, 2000);
  };

  useEffect(() => {
    if (!isModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSuccess) {
        setIsModalOpen(false);
        setFormErrors({});
        setFormData({ memberName: '', type: 'COUNSELING', date: '', time: '' });
        setSelectedPastor('');
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, isSuccess]);

  useEffect(() => {
    if (isModalOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isModalOpen]);

  const validateVisitorForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!visitorFormData.full_name.trim()) errors.full_name = 'Nome obrigatório';
    if (!visitorFormData.visit_date) errors.visit_date = 'Data obrigatória';
    setVisitorFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleVisitorSubmit = async () => {
    if (!validateVisitorForm()) return;
    setIsVisitorLoading(true);
    try {
      const success = await addVisitor({
        full_name: visitorFormData.full_name,
        phone: visitorFormData.phone,
        email: visitorFormData.email,
        address: visitorFormData.address,
        visit_date: visitorFormData.visit_date,
        service_type: visitorFormData.service_type,
        referred_by: visitorFormData.referred_by,
        notes: visitorFormData.notes,
        follow_up_status: 'PENDING',
      });
      if (success) {
        await fetchVisitors();
        setIsVisitorSuccess(true);
        setTimeout(() => {
          setIsVisitorSuccess(false);
          setIsVisitorModalOpen(false);
          setVisitorFormData({
            full_name: '', phone: '', email: '', address: '', 
            visit_date: new Date().toISOString().split('T')[0],
            service_type: 'Domingo', referred_by: '', notes: ''
          });
          setVisitorFormErrors({});
        }, 2000);
      }
    } finally {
      setIsVisitorLoading(false);
    }
  };

  const handleServiceSubmit = async () => {
    if (!serviceFormData.service_name.trim()) return;
    setIsServiceLoading(true);
    try {
      const today = new Date();
      const dayMap: Record<string, number> = {
        'Domingo': 0, 'Segunda': 1, 'Terça': 2, 'Quarta': 3, 'Quinta': 4, 'Sexta': 5, 'Sábado': 6
      };
      const daysUntil = dayMap[serviceFormData.day] ?? 0;
      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + ((daysUntil - today.getDay() + 7) % 7 || 7));
      
      const success = await addService({
        date: nextDate.toISOString().split('T')[0],
        type: serviceFormData.service_name,
        preacher: serviceFormData.leader || 'A definir',
        theme: null,
        bible_text: null,
        attendance_members: 0,
        attendance_visitors: 0,
        decisions: 0,
        offerings: 0,
        notes: null
      });
      if (success) {
        setIsServiceSuccess(true);
        setTimeout(() => {
          setIsServiceSuccess(false);
          setIsServiceModalOpen(false);
          setServiceFormData({ service_name: '', day: 'Domingo', time: '09:00', leader: '' });
        }, 2000);
      }
    } finally {
      setIsServiceLoading(false);
    }
  };

  const handleScheduleGenerate = async () => {
    if (!scheduleFormData.week_start) return;
    setIsScheduleLoading(true);
    try {
      const success = await addSchedule({
        date: scheduleFormData.week_start,
        service_type: scheduleFormData.service_type,
        role: 'Escala automática',
        member_id: null,
        member_name: 'A definir',
        notes: null
      });
      if (success) {
        setIsScheduleSuccess(true);
        setTimeout(() => {
          setIsScheduleSuccess(false);
          setIsScheduleModalOpen(false);
          setScheduleFormData({ week_start: '', service_type: 'Domingo' });
        }, 2000);
      }
    } finally {
      setIsScheduleLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between p-4 bg-nexus-yellow/5 rounded-xl border border-nexus-yellow/10 mb-4">
         <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-nexus-card flex items-center justify-center text-nexus-yellow">
               <Users size={16} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-nexus-text-muted tracking-widest">Sessão Exclusiva: Secretaria</p>
              <p className="text-xs font-medium text-nexus-text-muted">
                Ambiente de Trabalho: <span className="text-nexus-text font-bold">{activeSecretary?.full_name || 'N/A'}</span> 
                <span className="mx-2 text-nexus-border">|</span> 
                Papel: <span className="text-nexus-yellow font-bold text-[10px] uppercase">{activeSecretary?.role || 'N/A'}</span>
              </p>
            </div>
         </div>
         <span className="text-[10px] font-bold text-emerald-500 uppercase flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Ligado
         </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <button 
          onClick={() => setIsServiceModalOpen(true)}
          className="glass-card p-4 flex flex-col items-center justify-center gap-3 transition-all group hover:bg-nexus-yellow/10 border-dashed border-nexus-border"
        >
          <div className="p-3 rounded-full bg-nexus-card text-nexus-text-muted group-hover:text-nexus-yellow transition-colors">
            <ClipboardList size={20} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-nexus-text-muted group-hover:text-nexus-text">Novo Culto</span>
        </button>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="glass-card p-4 flex flex-col items-center justify-center gap-3 transition-all group hover:bg-nexus-yellow/10 border-dashed border-nexus-border"
        >
          <div className="p-3 rounded-full bg-nexus-card text-nexus-text-muted group-hover:text-nexus-yellow transition-colors">
            <CalendarCheck size={20} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-nexus-text-muted group-hover:text-nexus-text">Nova Marcação</span>
        </button>
        <button 
          onClick={() => setIsVisitorModalOpen(true)}
          className="glass-card p-4 flex flex-col items-center justify-center gap-3 transition-all group hover:bg-nexus-yellow/10 border-dashed border-nexus-border"
        >
          <div className="p-3 rounded-full bg-nexus-card text-nexus-text-muted group-hover:text-nexus-yellow transition-colors">
            <UserSearch size={20} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-nexus-text-muted group-hover:text-nexus-text">Entrada Visita</span>
        </button>
        <button 
          onClick={() => setIsScheduleModalOpen(true)}
          className="glass-card p-4 flex flex-col items-center justify-center gap-3 transition-all group hover:bg-nexus-yellow/10 border-dashed border-nexus-border"
        >
          <div className="p-3 rounded-full bg-nexus-card text-nexus-text-muted group-hover:text-nexus-yellow transition-colors">
            <MousePointer2 size={20} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-nexus-text-muted group-hover:text-nexus-text">Gerar Escala</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-widest text-nexus-text-muted">Marcações Pastoral (Hoje)</h3>
            <button className="text-xs text-nexus-yellow font-bold hover:underline">Ver Agenda Completa</button>
          </div>
          
          <div className="glass-card overflow-hidden">
            {apptLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin w-6 h-6 border-2 border-nexus-yellow border-t-transparent rounded-full mx-auto mb-2" />
                <p className="text-xs text-nexus-text-muted">A carregar marcações...</p>
              </div>
            ) : todayAppointments.length === 0 ? (
              <div className="p-8 text-center">
                <CalendarCheck size={32} className="mx-auto text-nexus-text-muted mb-2 opacity-50" />
                <p className="text-sm text-nexus-text-muted">Sem marcações para hoje.</p>
              </div>
            ) : (
              <div className="divide-y divide-nexus-border/30">
                {todayAppointments.map((ap) => (
                  <div key={ap.id} className="p-4 flex items-center justify-between hover:bg-nexus-card/40 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-nexus-card flex flex-col items-center justify-center border border-nexus-border">
                        <Clock size={16} className="text-nexus-yellow mb-0.5" />
                        <span className="text-[10px] font-bold text-nexus-text-muted">{ap.time.slice(0, 5)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-nexus-text group-hover:text-nexus-yellow transition-colors">{ap.member_name}</p>
                        <p className="text-[10px] text-nexus-text-muted font-bold uppercase">{TYPE_LABELS[ap.type] || ap.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                        ap.status === 'CONFIRMED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {ap.status === 'CONFIRMED' ? 'CONFIRMADO' : 'PENDENTE'}
                      </span>
                      <button className="p-2 text-nexus-text-muted hover:text-nexus-yellow transition-colors"><ChevronRight size={18} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
           <h3 className="text-sm font-bold uppercase tracking-widest text-nexus-text-muted">Follow-up: Visitantes</h3>
           <div className="glass-card p-6 bg-gradient-to-br from-nexus-card to-nexus-bg border-nexus-yellow/10">
              <div className="flex flex-col items-center text-center py-4">
                <Users size={40} className="text-nexus-yellow mb-4 opacity-50" />
                <p className="text-2xl font-black text-nexus-text">{pendingVisitors}</p>
                <p className="text-[10px] font-bold text-nexus-text-muted uppercase tracking-widest mt-1">Aguardam Contacto</p>
              </div>
              <div className="space-y-3 mt-6">
                <div className="p-3 bg-nexus-bg/50 rounded-xl border border-nexus-border flex items-center justify-between">
                   <span className="text-xs text-nexus-text-muted">Convertidos este mês</span>
                   <span className="text-xs font-bold text-emerald-400">+{becameMembers}</span>
                </div>
                <button className="w-full py-2.5 bg-nexus-yellow/5 hover:bg-nexus-yellow/10 text-nexus-yellow border border-nexus-yellow/20 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all">
                  Iniciar Ciclo de Contacto
                </button>
              </div>
           </div>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-nexus-bg/80 backdrop-blur-sm" />
            <motion.div ref={modalRef} tabIndex={-1} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-xl glass-card p-8 space-y-6 overflow-hidden border-nexus-border focus:outline-none" role="dialog" aria-modal="true" aria-label="Agendar atendimento pastoral">
               <div className="flex items-center justify-between border-b border-nexus-border pb-4">
                  <div className="flex items-center gap-3">
                     <div className="p-2 bg-nexus-yellow/10 rounded-lg text-nexus-yellow"><CalendarCheck size={20} /></div>
                     <h3 className="text-xl font-bold text-nexus-text">Agendar Atendimento Pastoral</h3>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="text-nexus-text-muted hover:text-nexus-text transition-colors"><X size={24} /></button>
               </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                 <div className="space-y-4">
                    <div className="space-y-1.5">
                       <label htmlFor="member-search" className="text-[10px] font-bold text-nexus-text-muted uppercase tracking-widest px-1">Nome do Membro/Visitante <span className="text-rose-500">*</span></label>
                       <div className="relative">
                          <UserSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-nexus-text-muted" size={14} />
                          <input id="member-search" type="text" value={formData.memberName} onChange={(e) => { setFormData(prev => ({ ...prev, memberName: e.target.value })); setFormErrors(prev => ({ ...prev, memberName: '' })); }} placeholder="Pesquisar na base..." className={`w-full bg-nexus-card border rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 text-nexus-text ${formErrors.memberName ? 'border-rose-500 focus:ring-rose-500' : 'border-nexus-border focus:ring-nexus-yellow'}`} aria-required="true" aria-invalid={!!formErrors.memberName} />
                       </div>
                       {formErrors.memberName && <p className="text-xs text-rose-400 font-medium">{formErrors.memberName}</p>}
                    </div>
                    <div className="space-y-1.5">
                       <label htmlFor="appt-type" className="text-[10px] font-bold text-nexus-text-muted uppercase tracking-widest px-1">Tipo de Atendimento <span className="text-rose-500">*</span></label>
                       <select id="appt-type" value={formData.type} onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))} className="w-full bg-nexus-card border border-nexus-border rounded-xl p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-nexus-yellow appearance-none text-nexus-text">
                          {Object.entries(TYPE_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                       </select>
                    </div>
                    <div className="space-y-1.5">
                       <label htmlFor="appt-date" className="text-[10px] font-bold text-nexus-text-muted uppercase tracking-widest px-1">Data Desejada <span className="text-rose-500">*</span></label>
                       <input id="appt-date" type="date" value={formData.date} onChange={(e) => { setFormData(prev => ({ ...prev, date: e.target.value })); setFormErrors(prev => ({ ...prev, date: '' })); }} className={`w-full bg-nexus-card border rounded-xl p-2.5 text-sm text-nexus-text ${formErrors.date ? 'border-rose-500' : ''}`} aria-required="true" />
                       {formErrors.date && <p className="text-xs text-rose-400 font-medium">{formErrors.date}</p>}
                    </div>
                    <div className="space-y-1.5">
                       <label htmlFor="appt-time" className="text-[10px] font-bold text-nexus-text-muted uppercase tracking-widest px-1">Hora <span className="text-rose-500">*</span></label>
                       <input id="appt-time" type="time" value={formData.time} onChange={(e) => { setFormData(prev => ({ ...prev, time: e.target.value })); setFormErrors(prev => ({ ...prev, time: '' })); }} className={`w-full bg-nexus-card border rounded-xl p-2.5 text-sm text-nexus-text ${formErrors.time ? 'border-rose-500' : 'border-nexus-border'}`} />
                       {formErrors.time && <p className="text-xs text-rose-400 font-medium">{formErrors.time}</p>}
                    </div>
                  </div>

                 <div className="space-y-4">
                    <label className="text-[10px] font-bold text-nexus-text-muted uppercase tracking-widest px-1">Selecionar Pastor <span className="text-rose-500">*</span></label>
                    {formErrors.pastor && <p className="text-xs text-rose-400 font-medium -mt-2">{formErrors.pastor}</p>}
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2">
                       {pastors.map((pastor) => (
                         <button key={pastor.id} onClick={() => setSelectedPastor(pastor.id)} className={`w-full p-3 rounded-xl border transition-all text-left ${selectedPastor === pastor.id ? 'bg-nexus-yellow/10 border-nexus-yellow' : 'bg-nexus-bg/50 border-nexus-border hover:border-nexus-yellow/50'}`}>
                            <div className="flex items-center justify-between">
                               <div>
                                  <p className={`text-xs font-bold ${selectedPastor === pastor.id ? 'text-nexus-yellow' : 'text-nexus-text'}`}>{pastor.full_name}</p>
                               </div>
                               {selectedPastor === pastor.id && <Check size={16} className="text-nexus-yellow" />}
                            </div>
                         </button>
                       ))}
                    </div>
                 </div>
              </div>

               <div className="pt-6 flex gap-3 relative">
                  {isSuccess ? (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute inset-0 z-10 flex items-center justify-center bg-emerald-500 rounded-xl text-white font-bold text-xs uppercase tracking-widest gap-2"><Check size={18} /> Marcação Realizada</motion.div>
                  ) : null}
                  <button disabled={isSuccess} onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-nexus-card hover:bg-nexus-card/80 text-nexus-text-muted rounded-xl text-xs font-bold uppercase tracking-widest transition-all border border-nexus-border">Cancelar</button>
                  <button disabled={!selectedPastor || isSuccess} onClick={handleConfirm} className="flex-1 py-3 gold-gradient text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:brightness-110 shadow-lg shadow-nexus-orange/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed">Confirmar Marcação</button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isVisitorModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsVisitorModalOpen(false)} className="absolute inset-0 bg-nexus-bg/80 backdrop-blur-sm" />
            <motion.div ref={visitorModalRef} tabIndex={-1} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-lg glass-card p-8 space-y-6 overflow-hidden border-nexus-border focus:outline-none" role="dialog" aria-modal="true">
              <div className="flex items-center justify-between border-b border-nexus-border pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-nexus-yellow/10 rounded-lg text-nexus-yellow"><UserPlus size={20} /></div>
                  <h3 className="text-xl font-bold text-nexus-text">Registar Visitante</h3>
                </div>
                <button onClick={() => setIsVisitorModalOpen(false)} disabled={isVisitorSuccess} className="text-nexus-text-muted hover:text-nexus-text transition-colors disabled:opacity-50"><X size={24} /></button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="vis-name" className="text-[10px] font-bold text-nexus-text-muted uppercase tracking-widest px-1">Nome Completo <span className="text-rose-500">*</span></label>
                  <input id="vis-name" type="text" value={visitorFormData.full_name} onChange={(e) => { setVisitorFormData(prev => ({ ...prev, full_name: e.target.value })); setVisitorFormErrors(prev => ({ ...prev, full_name: '' })); }} placeholder="Nome do visitante" className={`w-full bg-nexus-card border rounded-xl p-2.5 text-sm focus:outline-none focus:ring-1 text-nexus-text ${visitorFormErrors.full_name ? 'border-rose-500 focus:ring-rose-500' : 'border-nexus-border focus:ring-nexus-yellow'}`} />
                  {visitorFormErrors.full_name && <p className="text-xs text-rose-400 font-medium">{visitorFormErrors.full_name}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="vis-phone" className="text-[10px] font-bold text-nexus-text-muted uppercase tracking-widest px-1">Telefone</label>
                    <input id="vis-phone" type="tel" value={visitorFormData.phone} onChange={(e) => setVisitorFormData(prev => ({ ...prev, phone: e.target.value }))} placeholder="+244..." className="w-full bg-nexus-card border border-nexus-border rounded-xl p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-nexus-yellow text-nexus-text" />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="vis-email" className="text-[10px] font-bold text-nexus-text-muted uppercase tracking-widest px-1">Email</label>
                    <input id="vis-email" type="email" value={visitorFormData.email} onChange={(e) => setVisitorFormData(prev => ({ ...prev, email: e.target.value }))} placeholder="email@exemplo.com" className="w-full bg-nexus-card border border-nexus-border rounded-xl p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-nexus-yellow text-nexus-text" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="vis-date" className="text-[10px] font-bold text-nexus-text-muted uppercase tracking-widest px-1">Data da Visita <span className="text-rose-500">*</span></label>
                    <input id="vis-date" type="date" value={visitorFormData.visit_date} onChange={(e) => { setVisitorFormData(prev => ({ ...prev, visit_date: e.target.value })); setVisitorFormErrors(prev => ({ ...prev, visit_date: '' })); }} className={`w-full bg-nexus-card border rounded-xl p-2.5 text-sm text-nexus-text ${visitorFormErrors.visit_date ? 'border-rose-500' : 'border-nexus-border'}`} />
                    {visitorFormErrors.visit_date && <p className="text-xs text-rose-400 font-medium">{visitorFormErrors.visit_date}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="vis-service" className="text-[10px] font-bold text-nexus-text-muted uppercase tracking-widest px-1">Tipo de Culto</label>
                    <select id="vis-service" value={visitorFormData.service_type} onChange={(e) => setVisitorFormData(prev => ({ ...prev, service_type: e.target.value }))} className="w-full bg-nexus-card border border-nexus-border rounded-xl p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-nexus-yellow appearance-none text-nexus-text">
                      <option>Domingo</option><option>Quarta-feira</option><option>Sexta-feira</option><option>Especial</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="vis-referred" className="text-[10px] font-bold text-nexus-text-muted uppercase tracking-widest px-1">Indicado Por</label>
                  <input id="vis-referred" type="text" value={visitorFormData.referred_by} onChange={(e) => setVisitorFormData(prev => ({ ...prev, referred_by: e.target.value }))} placeholder="Nome de quem indicou" className="w-full bg-nexus-card border border-nexus-border rounded-xl p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-nexus-yellow text-nexus-text" />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="vis-notes" className="text-[10px] font-bold text-nexus-text-muted uppercase tracking-widest px-1">Notas</label>
                  <textarea id="vis-notes" value={visitorFormData.notes} onChange={(e) => setVisitorFormData(prev => ({ ...prev, notes: e.target.value }))} placeholder="Informações adicionais..." rows={2} className="w-full bg-nexus-card border border-nexus-border rounded-xl p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-nexus-yellow text-nexus-text resize-none" />
                </div>
              </div>

              <div className="pt-4 flex gap-3 relative">
                {isVisitorSuccess ? (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute inset-0 z-10 flex items-center justify-center bg-emerald-500 rounded-xl text-white font-bold text-xs uppercase tracking-widest gap-2"><Check size={18} /> Visitante Registado</motion.div>
                ) : null}
                <button disabled={isVisitorSuccess} onClick={() => setIsVisitorModalOpen(false)} className="flex-1 py-3 bg-nexus-card hover:bg-nexus-card/80 text-nexus-text-muted rounded-xl text-xs font-bold uppercase tracking-widest transition-all border border-nexus-border">Cancelar</button>
                <button disabled={isVisitorSuccess || isVisitorLoading} onClick={handleVisitorSubmit} className="flex-1 py-3 gold-gradient text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:brightness-110 shadow-lg shadow-nexus-orange/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {isVisitorLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                  Confirmar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isServiceModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsServiceModalOpen(false)} className="absolute inset-0 bg-nexus-bg/80 backdrop-blur-sm" />
            <motion.div ref={serviceModalRef} tabIndex={-1} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-md glass-card p-8 space-y-6 overflow-hidden border-nexus-border focus:outline-none" role="dialog" aria-modal="true">
              <div className="flex items-center justify-between border-b border-nexus-border pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-nexus-yellow/10 rounded-lg text-nexus-yellow"><CalendarDays size={20} /></div>
                  <h3 className="text-xl font-bold text-nexus-text">Agendar Novo Culto</h3>
                </div>
                <button onClick={() => setIsServiceModalOpen(false)} disabled={isServiceSuccess} className="text-nexus-text-muted hover:text-nexus-text transition-colors disabled:opacity-50"><X size={24} /></button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="svc-name" className="text-[10px] font-bold text-nexus-text-muted uppercase tracking-widest px-1">Nome do Culto <span className="text-rose-500">*</span></label>
                  <input id="svc-name" type="text" value={serviceFormData.service_name} onChange={(e) => setServiceFormData(prev => ({ ...prev, service_name: e.target.value }))} placeholder="Ex: Culto de Oração" className="w-full bg-nexus-card border border-nexus-border rounded-xl p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-nexus-yellow text-nexus-text" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="svc-day" className="text-[10px] font-bold text-nexus-text-muted uppercase tracking-widest px-1">Dia</label>
                    <select id="svc-day" value={serviceFormData.day} onChange={(e) => setServiceFormData(prev => ({ ...prev, day: e.target.value }))} className="w-full bg-nexus-card border border-nexus-border rounded-xl p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-nexus-yellow appearance-none text-nexus-text">
                      <option>Domingo</option><option>Segunda</option><option>Terça</option><option>Quarta</option><option>Quinta</option><option>Sexta</option><option>Sábado</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="svc-time" className="text-[10px] font-bold text-nexus-text-muted uppercase tracking-widest px-1">Hora</label>
                    <input id="svc-time" type="time" value={serviceFormData.time} onChange={(e) => setServiceFormData(prev => ({ ...prev, time: e.target.value }))} className="w-full bg-nexus-card border border-nexus-border rounded-xl p-2.5 text-sm text-nexus-text" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="svc-leader" className="text-[10px] font-bold text-nexus-text-muted uppercase tracking-widest px-1">Responsável</label>
                  <input id="svc-leader" type="text" value={serviceFormData.leader} onChange={(e) => setServiceFormData(prev => ({ ...prev, leader: e.target.value }))} placeholder="Nome do líder" className="w-full bg-nexus-card border border-nexus-border rounded-xl p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-nexus-yellow text-nexus-text" />
                </div>
              </div>

              <div className="pt-4 flex gap-3 relative">
                {isServiceSuccess ? (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute inset-0 z-10 flex items-center justify-center bg-emerald-500 rounded-xl text-white font-bold text-xs uppercase tracking-widest gap-2"><Check size={18} /> Culto Agendado</motion.div>
                ) : null}
                <button disabled={isServiceSuccess} onClick={() => setIsServiceModalOpen(false)} className="flex-1 py-3 bg-nexus-card hover:bg-nexus-card/80 text-nexus-text-muted rounded-xl text-xs font-bold uppercase tracking-widest transition-all border border-nexus-border">Cancelar</button>
                <button disabled={isServiceSuccess || isServiceLoading} onClick={handleServiceSubmit} className="flex-1 py-3 gold-gradient text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:brightness-110 shadow-lg shadow-nexus-orange/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {isServiceLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                  Confirmar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isScheduleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsScheduleModalOpen(false)} className="absolute inset-0 bg-nexus-bg/80 backdrop-blur-sm" />
            <motion.div ref={scheduleModalRef} tabIndex={-1} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-md glass-card p-8 space-y-6 overflow-hidden border-nexus-border focus:outline-none" role="dialog" aria-modal="true">
              <div className="flex items-center justify-between border-b border-nexus-border pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-nexus-yellow/10 rounded-lg text-nexus-yellow"><ListChecks size={20} /></div>
                  <h3 className="text-xl font-bold text-nexus-text">Gerar Escala Semanal</h3>
                </div>
                <button onClick={() => setIsScheduleModalOpen(false)} disabled={isScheduleSuccess} className="text-nexus-text-muted hover:text-nexus-text transition-colors disabled:opacity-50"><X size={24} /></button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="sched-week" className="text-[10px] font-bold text-nexus-text-muted uppercase tracking-widest px-1">Início da Semana</label>
                  <input id="sched-week" type="date" value={scheduleFormData.week_start} onChange={(e) => setScheduleFormData(prev => ({ ...prev, week_start: e.target.value }))} className="w-full bg-nexus-card border border-nexus-border rounded-xl p-2.5 text-sm text-nexus-text" />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="sched-type" className="text-[10px] font-bold text-nexus-text-muted uppercase tracking-widest px-1">Tipo de Serviço</label>
                  <select id="sched-type" value={scheduleFormData.service_type} onChange={(e) => setScheduleFormData(prev => ({ ...prev, service_type: e.target.value }))} className="w-full bg-nexus-card border border-nexus-border rounded-xl p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-nexus-yellow appearance-none text-nexus-text">
                    <option>Domingo</option><option>Quarta-feira</option><option>Sexta-feira</option><option>Todos</option>
                  </select>
                </div>

                <div className="p-4 bg-nexus-bg/50 rounded-xl border border-nexus-border">
                  <p className="text-xs text-nexus-text-muted text-center">A escala será gerada automaticamente com base nos pastores e líderes disponíveis.</p>
                </div>
              </div>

              <div className="pt-4 flex gap-3 relative">
                {isScheduleSuccess ? (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute inset-0 z-10 flex items-center justify-center bg-emerald-500 rounded-xl text-white font-bold text-xs uppercase tracking-widest gap-2"><Check size={18} /> Escala Gerada</motion.div>
                ) : null}
                <button disabled={isScheduleSuccess} onClick={() => setIsScheduleModalOpen(false)} className="flex-1 py-3 bg-nexus-card hover:bg-nexus-card/80 text-nexus-text-muted rounded-xl text-xs font-bold uppercase tracking-widest transition-all border border-nexus-border">Cancelar</button>
                <button disabled={isScheduleSuccess || isScheduleLoading} onClick={handleScheduleGenerate} className="flex-1 py-3 gold-gradient text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:brightness-110 shadow-lg shadow-nexus-orange/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {isScheduleLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                  Gerar Escala
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
