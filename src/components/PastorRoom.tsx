import { 
  Scroll, 
  BookOpen, 
  Calendar, 
  ChevronRight,
  PenTool,
  Clock,
  Users,
  Plus,
  X,
  Check,
  Loader2,
  Tag,
  FileText,
  Trash2
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../stores/authStore';
import { useAppointments, useMembers, useSermons } from '../stores/dataStore';

export default function PastorRoom() {
  const { profile } = useAuth();
  const { appointments, loading: apptLoading, fetchAppointments } = useAppointments();
  const { members, fetchMembers } = useMembers();
  const { sermons, loading: sermonLoading, fetchSermons, addSermon, deleteSermon } = useSermons();
  const [activeTab, setActiveTab] = useState<'sermons' | 'notes' | 'appointments'>('appointments');
  const [isSermonModalOpen, setIsSermonModalOpen] = useState(false);
  const [isSermonSuccess, setIsSermonSuccess] = useState(false);
  const [isSermonLoading, setIsSermonLoading] = useState(false);
  const [sermonFormErrors, setSermonFormErrors] = useState<Record<string, string>>({});
  const [sermonFormData, setSermonFormData] = useState({
    title: '',
    bible_text: '',
    theme: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    tags: ''
  });

  useEffect(() => {
    fetchAppointments();
    fetchMembers();
    fetchSermons();
  }, []);

  const pastorAppointments = useMemo(() =>
    appointments.filter(a => a.pastor_id === profile?.id).sort((a, b) => {
      const dateA = new Date(a.date + 'T' + a.time);
      const dateB = new Date(b.date + 'T' + b.time);
      return dateA.getTime() - dateB.getTime();
    }),
    [appointments, profile?.id]
  );

  const activeMembersCount = members.filter(m => m.status === 'ACTIVE').length;

  const validateSermonForm = () => {
    const errors: Record<string, string> = {};
    if (!sermonFormData.title.trim()) errors.title = 'Título obrigatório';
    if (!sermonFormData.date) errors.date = 'Data obrigatória';
    setSermonFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSermonSubmit = async () => {
    if (!validateSermonForm()) return;
    setIsSermonLoading(true);
    try {
      const success = await addSermon({
        title: sermonFormData.title,
        preacher_id: profile?.id || null,
        date: sermonFormData.date,
        bible_text: sermonFormData.bible_text || null,
        theme: sermonFormData.theme || null,
        notes: sermonFormData.notes || null,
        file_url: null,
        tags: sermonFormData.tags.split(',').map(t => t.trim()).filter(Boolean)
      });
      if (success) {
        setIsSermonSuccess(true);
        setTimeout(() => {
          setIsSermonSuccess(false);
          setIsSermonModalOpen(false);
          setSermonFormData({
            title: '',
            bible_text: '',
            theme: '',
            date: new Date().toISOString().split('T')[0],
            notes: '',
            tags: ''
          });
          setSermonFormErrors({});
        }, 2000);
      }
    } finally {
      setIsSermonLoading(false);
    }
  };

  const handleDeleteSermon = async (id: string) => {
    if (window.confirm('Tem certeza que deseja eliminar este sermão?')) {
      await deleteSermon(id);
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-lg font-black text-nexus-text uppercase tracking-tight">Área do Pastor</h2>
        <p className="text-sm text-nexus-text-muted">Gestão pastoral, sermões e aconselhamento.</p>
      </div>

      <div className="glass-card p-6 bg-gradient-to-r from-nexus-orange/5 to-transparent border-nexus-orange/10">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-nexus-orange/10 border border-nexus-orange/20 flex items-center justify-center text-2xl font-black text-nexus-orange">
            {profile?.full_name?.charAt(0) || 'P'}
          </div>
          <div>
            <h3 className="text-lg font-black text-nexus-text">{profile?.full_name || 'Pastor'}</h3>
            <p className="text-[10px] font-bold text-nexus-text-muted uppercase tracking-widest">{profile?.role || 'PASTOR'}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-2xl font-black text-nexus-text">{activeMembersCount}</p>
            <p className="text-[10px] text-nexus-text-muted font-bold uppercase">Membros Ativos</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        {[
          { id: 'appointments' as const, label: 'Marcações', icon: Calendar },
          { id: 'sermons' as const, label: 'Sermões', icon: Scroll },
          { id: 'notes' as const, label: 'Notas', icon: PenTool },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab.id ? 'bg-nexus-orange text-white' : 'bg-nexus-card text-nexus-text-muted hover:bg-nexus-card/80 border border-nexus-border'
            }`}
          >
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'appointments' && (
        <div className="glass-card overflow-hidden">
          {apptLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-6 h-6 border-2 border-nexus-yellow border-t-transparent rounded-full mx-auto mb-2" />
              <p className="text-xs text-nexus-text-muted">A carregar marcações...</p>
            </div>
          ) : pastorAppointments.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar size={48} className="mx-auto text-nexus-text-muted mb-4 opacity-50" />
              <h3 className="text-lg font-bold text-nexus-text mb-2">Sem marcações</h3>
              <p className="text-sm text-nexus-text-muted">Nenhuma marcação pastoral agendada.</p>
            </div>
          ) : (
            <div className="divide-y divide-nexus-border/30">
              {pastorAppointments.map((ap) => (
                <div key={ap.id} className="p-4 flex items-center justify-between hover:bg-nexus-card/40 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-nexus-card flex flex-col items-center justify-center border border-nexus-border">
                      <Clock size={14} className="text-nexus-orange mb-0.5" />
                      <span className="text-[9px] font-bold text-nexus-text-muted">{ap.time.slice(0, 5)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-nexus-text group-hover:text-nexus-orange transition-colors">{ap.member_name}</p>
                      <p className="text-[10px] text-nexus-text-muted font-bold">{new Date(ap.date).toLocaleDateString('pt-PT')}</p>
                    </div>
                  </div>
                  <button className="p-2 text-nexus-text-muted hover:text-nexus-orange transition-colors"><ChevronRight size={18} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'sermons' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-nexus-text">{sermons.length} Sermões</h3>
            <button
              onClick={() => setIsSermonModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 gold-gradient text-white rounded-lg text-xs font-bold shadow-lg shadow-nexus-orange/10 hover:brightness-110 active:scale-95 transition-all"
            >
              <Plus size={16} /> Novo Sermão
            </button>
          </div>

          {sermonLoading ? (
            <div className="glass-card p-8 text-center">
              <div className="animate-spin w-6 h-6 border-2 border-nexus-yellow border-t-transparent rounded-full mx-auto mb-2" />
              <p className="text-xs text-nexus-text-muted">A carregar sermões...</p>
            </div>
          ) : sermons.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <Scroll size={48} className="mx-auto text-nexus-text-muted mb-4 opacity-50" />
              <h3 className="text-lg font-bold text-nexus-text mb-2">Sem sermões</h3>
              <p className="text-sm text-nexus-text-muted">Crie o seu primeiro sermão.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {sermons.map(sermon => (
                <div key={sermon.id} className="glass-card p-4 hover:bg-nexus-card/40 transition-all group">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-nexus-text group-hover:text-nexus-orange transition-colors">{sermon.title}</h4>
                      {sermon.theme && <p className="text-xs text-nexus-text-muted mt-1">{sermon.theme}</p>}
                      {sermon.bible_text && (
                        <p className="text-[10px] text-nexus-orange font-bold mt-1 flex items-center gap-1">
                          <FileText size={10} /> {sermon.bible_text}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[10px] text-nexus-text-muted font-bold">{new Date(sermon.date).toLocaleDateString('pt-PT')}</span>
                        {sermon.tags.map((tag, i) => (
                          <span key={i} className="text-[9px] px-2 py-0.5 rounded-full bg-nexus-orange/10 text-nexus-orange font-bold flex items-center gap-1">
                            <Tag size={8} /> {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteSermon(sermon.id)}
                      className="p-2 text-nexus-text-muted hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'notes' && (
        <div className="glass-card p-12 text-center">
          <BookOpen size={48} className="mx-auto text-nexus-text-muted mb-4 opacity-50" />
          <h3 className="text-lg font-bold text-nexus-text mb-2">Notas Pastorais</h3>
          <p className="text-sm text-nexus-text-muted">As notas pessoais serão guardadas aqui.</p>
        </div>
      )}

      <AnimatePresence>
        {isSermonModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg glass-card p-8 space-y-6 overflow-hidden border-nexus-border focus:outline-none"
              role="dialog"
              aria-modal="true"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-nexus-text uppercase tracking-tight">Novo Sermão</h3>
                <button onClick={() => setIsSermonModalOpen(false)} className="p-1.5 rounded-lg hover:bg-nexus-card text-nexus-text-muted transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="sermon-title" className="block text-[10px] font-bold text-nexus-text-muted uppercase tracking-widest mb-1.5">Título *</label>
                  <input
                    id="sermon-title"
                    type="text"
                    value={sermonFormData.title}
                    onChange={(e) => { setSermonFormData(prev => ({ ...prev, title: e.target.value })); setSermonFormErrors(prev => ({ ...prev, title: '' })); }}
                    placeholder="Título do sermão"
                    className={`w-full bg-nexus-card border rounded-xl p-2.5 text-sm focus:outline-none focus:ring-1 text-nexus-text ${sermonFormErrors.title ? 'border-rose-500 focus:ring-rose-500' : 'border-nexus-border focus:ring-nexus-yellow'}`}
                  />
                  {sermonFormErrors.title && <p className="text-xs text-rose-400 font-medium mt-1">{sermonFormErrors.title}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="sermon-date" className="block text-[10px] font-bold text-nexus-text-muted uppercase tracking-widest mb-1.5">Data *</label>
                    <input
                      id="sermon-date"
                      type="date"
                      value={sermonFormData.date}
                      onChange={(e) => { setSermonFormData(prev => ({ ...prev, date: e.target.value })); setSermonFormErrors(prev => ({ ...prev, date: '' })); }}
                      className={`w-full bg-nexus-card border rounded-xl p-2.5 text-sm text-nexus-text ${sermonFormErrors.date ? 'border-rose-500' : 'border-nexus-border'}`}
                    />
                    {sermonFormErrors.date && <p className="text-xs text-rose-400 font-medium mt-1">{sermonFormErrors.date}</p>}
                  </div>
                  <div>
                    <label htmlFor="sermon-theme" className="block text-[10px] font-bold text-nexus-text-muted uppercase tracking-widest mb-1.5">Tema</label>
                    <input
                      id="sermon-theme"
                      type="text"
                      value={sermonFormData.theme}
                      onChange={(e) => setSermonFormData(prev => ({ ...prev, theme: e.target.value }))}
                      placeholder="Tema geral"
                      className="w-full bg-nexus-card border border-nexus-border rounded-xl p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-nexus-yellow text-nexus-text"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="sermon-bible" className="block text-[10px] font-bold text-nexus-text-muted uppercase tracking-widest mb-1.5">Texto Bíblico</label>
                  <input
                    id="sermon-bible"
                    type="text"
                    value={sermonFormData.bible_text}
                    onChange={(e) => setSermonFormData(prev => ({ ...prev, bible_text: e.target.value }))}
                    placeholder="João 3:16"
                    className="w-full bg-nexus-card border border-nexus-border rounded-xl p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-nexus-yellow text-nexus-text"
                  />
                </div>

                <div>
                  <label htmlFor="sermon-tags" className="block text-[10px] font-bold text-nexus-text-muted uppercase tracking-widest mb-1.5">Tags</label>
                  <input
                    id="sermon-tags"
                    type="text"
                    value={sermonFormData.tags}
                    onChange={(e) => setSermonFormData(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="Fé, Graça, Amor (separadas por vírgula)"
                    className="w-full bg-nexus-card border border-nexus-border rounded-xl p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-nexus-yellow text-nexus-text"
                  />
                </div>

                <div>
                  <label htmlFor="sermon-notes" className="block text-[10px] font-bold text-nexus-text-muted uppercase tracking-widest mb-1.5">Notas</label>
                  <textarea
                    id="sermon-notes"
                    value={sermonFormData.notes}
                    onChange={(e) => setSermonFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Notas do sermão..."
                    rows={3}
                    className="w-full bg-nexus-card border border-nexus-border rounded-xl p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-nexus-yellow text-nexus-text resize-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3 relative">
                {isSermonSuccess ? (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute inset-0 z-10 flex items-center justify-center bg-emerald-500 rounded-xl text-white font-bold text-xs uppercase tracking-widest gap-2">
                    <Check size={18} /> Sermão Criado
                  </motion.div>
                ) : null}
                <button disabled={isSermonSuccess} onClick={() => setIsSermonModalOpen(false)} className="flex-1 py-3 bg-nexus-card hover:bg-nexus-card/80 text-nexus-text-muted rounded-xl text-xs font-bold uppercase tracking-widest transition-all border border-nexus-border">Cancelar</button>
                <button disabled={isSermonSuccess || isSermonLoading} onClick={handleSermonSubmit} className="flex-1 py-3 gold-gradient text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:brightness-110 shadow-lg shadow-nexus-orange/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {isSermonLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                  Confirmar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
