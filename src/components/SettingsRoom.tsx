import { 
  Settings, 
  UserCog, 
  Mail, 
  Building2, 
  ShieldCheck, 
  Database,
  Type,
  ExternalLink,
  Save,
  Trash2,
  Upload,
  Download,
  Globe,
  Phone,
  MapPin,
  Calendar,
  BookOpen,
  Facebook,
  Instagram,
  Youtube,
  Loader2,
  Check,
  Users,
  Target,
  Link2,
  Image,
  Banknote,
  Languages,
  FileText,
  X,
  Edit3,
  ChevronRight,
  Plus,
  Pencil
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { useProfiles, useChurchProfile } from '../stores/dataStore';
import { useToast } from '../lib/toastStore';

export default function SettingsRoom() {
  const [activeTab, setActiveTab] = useState<'church' | 'users' | 'themes' | 'communications' | 'advanced'>('church');
  const [churchSubTab, setChurchSubTab] = useState<'general' | 'pastoral' | 'mission' | 'social' | 'media'>('general');
  const { profiles, fetchProfiles } = useProfiles();
  const { profile: church, loading: churchLoading, fetchChurchProfile, updateChurchProfile } = useChurchProfile();
  const { show } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [logSecurity, setLogSecurity] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);
  const [selectedUser, setSelectedUser] = useState<typeof profiles[0] | null>(null);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [themeForm, setThemeForm] = useState({ title: '', verse: '', year: '', type: 'annual' as 'annual' | 'monthly' });
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [templateContent, setTemplateContent] = useState('');

  const [form, setForm] = useState({
    name: '', legal_name: '', denomination: '', nif: '', registration_number: '',
    email: '', phone: '', secondary_phone: '', website: '',
    address: '', city: '', province: '', postal_code: '', country: 'Angola',
    latitude: '', longitude: '',
    senior_pastor_name: '', senior_pastor_phone: '', senior_pastor_email: '',
    assistant_pastor_name: '', church_president_name: '',
    founding_date: '', mission_statement: '', vision_statement: '',
    values_statement: '', history_notes: '', doctrine_statement: '',
    facebook_url: '', instagram_url: '', youtube_url: '', tiktok_url: '', whatsapp_group_url: '',
    logo_url: '', banner_url: '',
    membership_goal: '', current_members_count: '',
    fiscal_year_start_month: '1', default_currency: 'AOA', timezone: 'Africa/Luanda', language: 'pt',
  });

  useEffect(() => {
    fetchProfiles();
    fetchChurchProfile();
  }, []);

  useEffect(() => {
    if (church) {
      setForm({
        name: church.name || '',
        legal_name: church.legal_name || '',
        denomination: church.denomination || '',
        nif: church.nif || '',
        registration_number: church.registration_number || '',
        email: church.email || '',
        phone: church.phone || '',
        secondary_phone: church.secondary_phone || '',
        website: church.website || '',
        address: church.address || '',
        city: church.city || '',
        province: church.province || '',
        postal_code: church.postal_code || '',
        country: church.country || 'Angola',
        latitude: church.latitude?.toString() || '',
        longitude: church.longitude?.toString() || '',
        senior_pastor_name: church.senior_pastor_name || '',
        senior_pastor_phone: church.senior_pastor_phone || '',
        senior_pastor_email: church.senior_pastor_email || '',
        assistant_pastor_name: church.assistant_pastor_name || '',
        church_president_name: church.church_president_name || '',
        founding_date: church.founding_date || '',
        mission_statement: church.mission_statement || '',
        vision_statement: church.vision_statement || '',
        values_statement: church.values_statement || '',
        history_notes: church.history_notes || '',
        doctrine_statement: church.doctrine_statement || '',
        facebook_url: church.facebook_url || '',
        instagram_url: church.instagram_url || '',
        youtube_url: church.youtube_url || '',
        tiktok_url: church.tiktok_url || '',
        whatsapp_group_url: church.whatsapp_group_url || '',
        logo_url: church.logo_url || '',
        banner_url: church.banner_url || '',
        membership_goal: church.membership_goal?.toString() || '',
        current_members_count: church.current_members_count?.toString() || '',
        fiscal_year_start_month: church.fiscal_year_start_month?.toString() || '1',
        default_currency: church.default_currency || 'AOA',
        timezone: church.timezone || 'Africa/Luanda',
        language: church.language || 'pt',
      });
    }
  }, [church]);

  const handleSave = async () => {
    setIsSaving(true);
    const updates: any = { ...form };
    if (form.latitude) updates.latitude = parseFloat(form.latitude);
    if (form.longitude) updates.longitude = parseFloat(form.longitude);
    if (form.membership_goal) updates.membership_goal = parseInt(form.membership_goal);
    if (form.current_members_count) updates.current_members_count = parseInt(form.current_members_count);
    if (form.fiscal_year_start_month) updates.fiscal_year_start_month = parseInt(form.fiscal_year_start_month);
    if (form.founding_date) updates.founding_date = form.founding_date;
    if (!form.nif) updates.nif = null;
    if (!form.registration_number) updates.registration_number = null;
    if (!form.website) updates.website = null;
    if (!form.secondary_phone) updates.secondary_phone = null;
    if (!form.legal_name) updates.legal_name = null;
    
    const success = await updateChurchProfile(updates);
    setIsSaving(false);
    if (success) {
      setIsSaved(true);
      show('Perfil da igreja atualizado com sucesso!', 'success');
      setTimeout(() => setIsSaved(false), 2000);
    } else {
      show('Erro ao atualizar perfil da igreja.', 'error');
    }
  };

  const updateField = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Settings Navigation */}
        <div className="w-full lg:w-64 space-y-1">
          {[
            { id: 'church', label: 'Perfil da Igreja', icon: Building2 },
            { id: 'users', label: 'Utilizadores & Papéis', icon: UserCog },
            { id: 'themes', label: 'Temas Anuais/Mensais', icon: Type },
            { id: 'communications', label: 'Templates de Mensagem', icon: Mail },
            { id: 'advanced', label: 'Configurações Avançadas', icon: Database },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-bold ${
                activeTab === item.id 
                ? 'bg-nexus-yellow text-white shadow-lg shadow-nexus-yellow/20' 
                : 'text-nexus-text-muted hover:bg-nexus-card'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </div>

        {/* Settings Content Area */}
        <div className="flex-1 glass-card p-8 min-h-[600px] border-nexus-border">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              {activeTab === 'church' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-black text-nexus-text uppercase tracking-tight">Perfil Institucional</h3>
                      <p className="text-xs text-nexus-text-muted">Todas as informações oficiais da igreja.</p>
                    </div>
                    <button 
                      onClick={handleSave}
                      disabled={isSaving || isSaved}
                      className="flex items-center gap-2 px-4 py-2 border border-nexus-border bg-nexus-card rounded-xl text-[10px] font-black uppercase tracking-widest text-nexus-text-muted hover:text-nexus-text transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isSaving ? <Loader2 size={16} className="animate-spin" /> : isSaved ? <Check size={16} /> : <Save size={16} />}
                      {isSaving ? 'A guardar...' : isSaved ? 'Guardado!' : 'Guardar'}
                    </button>
                  </div>

                  {/* Sub-tabs */}
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { id: 'general' as const, label: 'Geral', icon: Building2 },
                      { id: 'pastoral' as const, label: 'Pastoral', icon: Users },
                      { id: 'mission' as const, label: 'Missão', icon: BookOpen },
                      { id: 'social' as const, label: 'Redes Sociais', icon: Globe },
                      { id: 'media' as const, label: 'Mídia', icon: Image },
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setChurchSubTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          churchSubTab === tab.id ? 'bg-nexus-orange text-white' : 'bg-nexus-card text-nexus-text-muted hover:bg-nexus-card/80 border border-nexus-border'
                        }`}
                      >
                        <tab.icon size={14} /> {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* General */}
                  {churchSubTab === 'general' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">Nome da Igreja *</label>
                          <input type="text" value={form.name} onChange={(e) => updateField('name', e.target.value)} className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl p-3 text-sm text-nexus-text focus:ring-1 focus:ring-nexus-yellow" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">Nome Legal</label>
                          <input type="text" value={form.legal_name} onChange={(e) => updateField('legal_name', e.target.value)} placeholder="Ex: Igreja Evangélica..." className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl p-3 text-sm text-nexus-text focus:ring-1 focus:ring-nexus-yellow" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">Denominação</label>
                          <input type="text" value={form.denomination} onChange={(e) => updateField('denomination', e.target.value)} className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl p-3 text-sm text-nexus-text focus:ring-1 focus:ring-nexus-yellow" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">NIF</label>
                          <input type="text" value={form.nif} onChange={(e) => updateField('nif', e.target.value)} placeholder="Número fiscal" className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl p-3 text-sm text-nexus-text focus:ring-1 focus:ring-nexus-yellow" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">Nº Registo</label>
                          <input type="text" value={form.registration_number} onChange={(e) => updateField('registration_number', e.target.value)} className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl p-3 text-sm text-nexus-text focus:ring-1 focus:ring-nexus-yellow" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1 flex items-center gap-1"><Calendar size={12} /> Data de Fundação</label>
                          <input type="date" value={form.founding_date} onChange={(e) => updateField('founding_date', e.target.value)} className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl p-3 text-sm text-nexus-text focus:ring-1 focus:ring-nexus-yellow" />
                        </div>
                      </div>

                      <div className="border-t border-nexus-border/50 pt-6">
                        <h4 className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest mb-4 flex items-center gap-2"><MapPin size={14} /> Endereço</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2 space-y-1.5">
                            <label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">Endereço Completo</label>
                            <input type="text" value={form.address} onChange={(e) => updateField('address', e.target.value)} placeholder="Rua, nº, bairro" className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl p-3 text-sm text-nexus-text focus:ring-1 focus:ring-nexus-yellow" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">Cidade</label>
                            <input type="text" value={form.city} onChange={(e) => updateField('city', e.target.value)} className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl p-3 text-sm text-nexus-text focus:ring-1 focus:ring-nexus-yellow" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">Província</label>
                            <input type="text" value={form.province} onChange={(e) => updateField('province', e.target.value)} className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl p-3 text-sm text-nexus-text focus:ring-1 focus:ring-nexus-yellow" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">Código Postal</label>
                            <input type="text" value={form.postal_code} onChange={(e) => updateField('postal_code', e.target.value)} className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl p-3 text-sm text-nexus-text focus:ring-1 focus:ring-nexus-yellow" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">País</label>
                            <input type="text" value={form.country} onChange={(e) => updateField('country', e.target.value)} className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl p-3 text-sm text-nexus-text focus:ring-1 focus:ring-nexus-yellow" />
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-nexus-border/50 pt-6">
                        <h4 className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest mb-4 flex items-center gap-2"><Phone size={14} /> Contactos</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">Email</label>
                            <input type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl p-3 text-sm text-nexus-text focus:ring-1 focus:ring-nexus-yellow" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">Telefone Principal</label>
                            <input type="tel" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} placeholder="+244..." className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl p-3 text-sm text-nexus-text focus:ring-1 focus:ring-nexus-yellow" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">Telefone Secundário</label>
                            <input type="tel" value={form.secondary_phone} onChange={(e) => updateField('secondary_phone', e.target.value)} className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl p-3 text-sm text-nexus-text focus:ring-1 focus:ring-nexus-yellow" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1 flex items-center gap-1"><Globe size={12} /> Website</label>
                            <input type="url" value={form.website} onChange={(e) => updateField('website', e.target.value)} placeholder="https://..." className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl p-3 text-sm text-nexus-text focus:ring-1 focus:ring-nexus-yellow" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Pastoral */}
                  {churchSubTab === 'pastoral' && (
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest mb-4 flex items-center gap-2"><Users size={14} /> Liderança Pastoral</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">Pastor Sênior</label>
                            <input type="text" value={form.senior_pastor_name} onChange={(e) => updateField('senior_pastor_name', e.target.value)} className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl p-3 text-sm text-nexus-text focus:ring-1 focus:ring-nexus-yellow" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">Telefone do Pastor</label>
                            <input type="tel" value={form.senior_pastor_phone} onChange={(e) => updateField('senior_pastor_phone', e.target.value)} className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl p-3 text-sm text-nexus-text focus:ring-1 focus:ring-nexus-yellow" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">Email do Pastor</label>
                            <input type="email" value={form.senior_pastor_email} onChange={(e) => updateField('senior_pastor_email', e.target.value)} className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl p-3 text-sm text-nexus-text focus:ring-1 focus:ring-nexus-yellow" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">Pastor Assistente</label>
                            <input type="text" value={form.assistant_pastor_name} onChange={(e) => updateField('assistant_pastor_name', e.target.value)} className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl p-3 text-sm text-nexus-text focus:ring-1 focus:ring-nexus-yellow" />
                          </div>
                          <div className="md:col-span-2 space-y-1.5">
                            <label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">Presidente da Igreja</label>
                            <input type="text" value={form.church_president_name} onChange={(e) => updateField('church_president_name', e.target.value)} className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl p-3 text-sm text-nexus-text focus:ring-1 focus:ring-nexus-yellow" />
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-nexus-border/50 pt-6">
                        <h4 className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest mb-4 flex items-center gap-2"><Target size={14} /> Metas</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">Meta de Membros</label>
                            <input type="number" value={form.membership_goal} onChange={(e) => updateField('membership_goal', e.target.value)} className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl p-3 text-sm text-nexus-text focus:ring-1 focus:ring-nexus-yellow" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">Membros Atuais</label>
                            <input type="number" value={form.current_members_count} onChange={(e) => updateField('current_members_count', e.target.value)} className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl p-3 text-sm text-nexus-text focus:ring-1 focus:ring-nexus-yellow" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mission */}
                  {churchSubTab === 'mission' && (
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">Missão</label>
                          <textarea value={form.mission_statement} onChange={(e) => updateField('mission_statement', e.target.value)} rows={3} placeholder="Qual é a missão da igreja..." className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl p-3 text-sm text-nexus-text focus:ring-1 focus:ring-nexus-yellow resize-none" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">Visão</label>
                          <textarea value={form.vision_statement} onChange={(e) => updateField('vision_statement', e.target.value)} rows={3} placeholder="Onde a igreja quer chegar..." className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl p-3 text-sm text-nexus-text focus:ring-1 focus:ring-nexus-yellow resize-none" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">Valores</label>
                          <textarea value={form.values_statement} onChange={(e) => updateField('values_statement', e.target.value)} rows={3} placeholder="Valores fundamentais da igreja..." className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl p-3 text-sm text-nexus-text focus:ring-1 focus:ring-nexus-yellow resize-none" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">Declaração Doutrinária</label>
                          <textarea value={form.doctrine_statement} onChange={(e) => updateField('doctrine_statement', e.target.value)} rows={4} placeholder="Princípios doutrinários..." className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl p-3 text-sm text-nexus-text focus:ring-1 focus:ring-nexus-yellow resize-none" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">História da Igreja</label>
                          <textarea value={form.history_notes} onChange={(e) => updateField('history_notes', e.target.value)} rows={4} placeholder="Breve história da igreja..." className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl p-3 text-sm text-nexus-text focus:ring-1 focus:ring-nexus-yellow resize-none" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Social */}
                  {churchSubTab === 'social' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1 flex items-center gap-1"><Facebook size={12} /> Facebook</label>
                          <input type="url" value={form.facebook_url} onChange={(e) => updateField('facebook_url', e.target.value)} placeholder="https://facebook.com/..." className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl p-3 text-sm text-nexus-text focus:ring-1 focus:ring-nexus-yellow" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1 flex items-center gap-1"><Instagram size={12} /> Instagram</label>
                          <input type="url" value={form.instagram_url} onChange={(e) => updateField('instagram_url', e.target.value)} placeholder="https://instagram.com/..." className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl p-3 text-sm text-nexus-text focus:ring-1 focus:ring-nexus-yellow" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1 flex items-center gap-1"><Youtube size={12} /> YouTube</label>
                          <input type="url" value={form.youtube_url} onChange={(e) => updateField('youtube_url', e.target.value)} placeholder="https://youtube.com/..." className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl p-3 text-sm text-nexus-text focus:ring-1 focus:ring-nexus-yellow" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">TikTok</label>
                          <input type="url" value={form.tiktok_url} onChange={(e) => updateField('tiktok_url', e.target.value)} placeholder="https://tiktok.com/..." className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl p-3 text-sm text-nexus-text focus:ring-1 focus:ring-nexus-yellow" />
                        </div>
                        <div className="md:col-span-2 space-y-1.5">
                          <label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1 flex items-center gap-1"><Link2 size={12} /> Grupo WhatsApp</label>
                          <input type="url" value={form.whatsapp_group_url} onChange={(e) => updateField('whatsapp_group_url', e.target.value)} placeholder="https://chat.whatsapp.com/..." className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl p-3 text-sm text-nexus-text focus:ring-1 focus:ring-nexus-yellow" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Media */}
                  {churchSubTab === 'media' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">URL do Logo</label>
                          <input type="url" value={form.logo_url} onChange={(e) => updateField('logo_url', e.target.value)} placeholder="https://.../logo.png" className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl p-3 text-sm text-nexus-text focus:ring-1 focus:ring-nexus-yellow" />
                          {form.logo_url && (
                            <div className="mt-2 p-4 bg-nexus-card/30 rounded-xl border border-nexus-border flex items-center justify-center">
                              <img src={form.logo_url} alt="Logo preview" className="h-16 object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
                            </div>
                          )}
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">URL do Banner</label>
                          <input type="url" value={form.banner_url} onChange={(e) => updateField('banner_url', e.target.value)} placeholder="https://.../banner.jpg" className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl p-3 text-sm text-nexus-text focus:ring-1 focus:ring-nexus-yellow" />
                          {form.banner_url && (
                            <div className="mt-2 p-4 bg-nexus-card/30 rounded-xl border border-nexus-border flex items-center justify-center">
                              <img src={form.banner_url} alt="Banner preview" className="h-16 w-full object-cover rounded-lg" onError={(e) => (e.currentTarget.style.display = 'none')} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'users' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-nexus-text uppercase tracking-tight">Utilizadores do Sistema</h3>
                    <button className="flex items-center gap-2 px-6 py-2.5 gold-gradient text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-nexus-orange/10 hover:brightness-110 active:scale-95 transition-all">
                      <UserCog size={16} /> Convidar Utilizador
                    </button>
                  </div>

                   <div className="space-y-3">
                     {profiles.map(u => (
                       <div key={u.id} onClick={() => setSelectedUser(u)} className="flex items-center justify-between p-4 bg-nexus-card/30 border border-nexus-border rounded-2xl hover:border-nexus-yellow/30 transition-all group cursor-pointer">
                         <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-xl bg-nexus-card border border-nexus-border flex items-center justify-center text-nexus-yellow shadow-md group-hover:scale-110 transition-transform">
                             <ShieldCheck size={20} />
                           </div>
                           <div>
                             <p className="text-sm font-black text-nexus-text group-hover:text-nexus-yellow transition-colors">{u.full_name}</p>
                             <p className="text-[10px] text-nexus-text-muted font-black tracking-widest uppercase">{u.email}</p>
                           </div>
                         </div>
                         <div className="flex items-center gap-4">
                             <span className="text-[9px] font-black text-nexus-yellow px-2.5 py-1 rounded-lg bg-nexus-yellow/5 border border-nexus-yellow/20 tracking-widest">{u.roles?.join(' & ')}</span>
                            <button className="p-2 text-nexus-text-muted hover:text-nexus-yellow transition-colors"><ChevronRight size={16} /></button>
                         </div>
                       </div>
                     ))}
                   </div>
                </div>
              )}

              {activeTab === 'themes' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-nexus-text uppercase tracking-tight">Gestão de Temas</h3>
                    <button 
                      onClick={() => { setThemeForm({ title: '', verse: '', year: new Date().getFullYear().toString(), type: 'annual' }); setIsThemeModalOpen(true); }}
                      className="flex items-center gap-2 px-4 py-2 gold-gradient text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-nexus-orange/10 hover:brightness-110 transition-all"
                    >
                      <Plus size={14} /> Novo Tema
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-nexus-yellow uppercase tracking-[0.2em]">Tema do Ano Ativo</h4>
                        <div className="glass-card p-6 border-nexus-yellow/30 bg-nexus-yellow/[0.02]">
                           <p className="text-sm font-black text-nexus-text uppercase tracking-tight">2024: O Ano da Celebração</p>
                           <p className="text-[10px] font-bold text-nexus-text-muted mt-2 uppercase tracking-widest">Romanos 11:36</p>
                           <button 
                             onClick={() => { setThemeForm({ title: 'O Ano da Celebração', verse: 'Romanos 11:36', year: '2024', type: 'annual' }); setIsThemeModalOpen(true); }}
                             className="mt-6 text-[10px] font-black text-nexus-yellow uppercase tracking-widest border border-nexus-yellow/20 px-4 py-2 rounded-lg hover:bg-nexus-yellow hover:text-white transition-all flex items-center gap-2"
                           >
                             <Pencil size={12} /> Editar Tema Anual
                           </button>
                        </div>
                     </div>
                     <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-nexus-text-muted uppercase tracking-[0.2em]">Fluxo de Temas Mensais</h4>
                        <div className="space-y-2">
                           {[
                             { month: 'Abril', title: 'Ressurreição', verse: '1 Coríntios 15:20' },
                             { month: 'Maio', title: 'Gratidão', verse: 'Salmo 107:1' },
                             { month: 'Junho', title: 'Família', verse: 'Josué 24:15' },
                           ].map(t => (
                             <div key={t.month} onClick={() => { setThemeForm({ title: t.title, verse: t.verse, year: t.month, type: 'monthly' }); setIsThemeModalOpen(true); }} className="p-3 bg-nexus-card/50 rounded-xl border border-nexus-border flex items-center justify-between group hover:border-nexus-yellow/30 transition-all cursor-pointer">
                               <div>
                                 <span className="text-xs font-bold text-nexus-text-muted group-hover:text-nexus-text transition-colors">{t.month}: {t.title}</span>
                                 <p className="text-[9px] text-nexus-text-muted mt-0.5">{t.verse}</p>
                               </div>
                               <button className="p-1 text-nexus-border group-hover:text-nexus-yellow transition-colors"><Edit3 size={14} /></button>
                             </div>
                           ))}
                        </div>
                     </div>
                  </div>
                </div>
              )}

              {activeTab === 'communications' && (
                 <div className="space-y-6">
                    <h3 className="text-lg font-black text-nexus-text uppercase tracking-tight">Templates Omnichannel</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {[
                         { name: 'Saudação de Aniversário', content: 'Olá {nome}! A igreja deseja-lhe um feliz aniversário. Que Deus continue a abençoá-lo(a).' },
                         { name: 'Lembrete de Culto', content: 'Lembrete: Culto de {tipo} às {hora}. Esperamos por si! {nome_igreja}' },
                         { name: 'Confirmação de Inscrição', content: 'A sua inscrição para {evento} foi confirmada. Data: {data}. Local: {local}.' },
                         { name: 'Nova Escala de Louvor', content: 'Escala de louvor para {data}: {nome} - {cargo}. Obrigado pela dedicação!' },
                         { name: 'Boas-vindas Visitante', content: 'Bem-vindo(a) à {nome_igreja}! Ficámos muito felizes com a sua visita. Esperamos vê-lo(a) novamente!' },
                         { name: 'Recibo de Dízimo', content: 'Recibo de Dízimo - {nome}: {valor}kz. Data: {data}. Deus abençoe a sua generosidade.' }
                       ].map(temp => (
                         <div key={temp.name} onClick={() => { setSelectedTemplate(temp.name); setTemplateContent(temp.content); setIsTemplateModalOpen(true); }} className="p-4 bg-nexus-card/20 border border-nexus-border rounded-2xl flex items-center justify-between group hover:border-nexus-orange/30 transition-all cursor-pointer">
                            <span className="text-xs font-black text-nexus-text-muted group-hover:text-nexus-text uppercase tracking-tight transition-colors">{temp.name}</span>
                            <button className="text-[9px] font-black text-nexus-orange opacity-0 group-hover:opacity-100 transition-all tracking-widest border border-nexus-orange/20 px-2.5 py-1 rounded-lg flex items-center gap-1">
                              <Pencil size={10} /> CONFIGURAR
                            </button>
                         </div>
                       ))}
                    </div>
                 </div>
              )}

              {activeTab === 'advanced' && (
                 <div className="space-y-6">
                    <h3 className="text-lg font-black text-nexus-text uppercase tracking-tight">Configurações Avançadas</h3>
                    <div className="space-y-6">
                      <div className="p-6 bg-nexus-card/30 rounded-2xl border border-nexus-border">
                        <h4 className="text-sm font-bold text-nexus-text mb-3 flex items-center gap-2">
                          <Database size={18} className="text-nexus-yellow" />
                          Gestão de Dados
                        </h4>
                        <p className="text-xs text-nexus-text-muted mb-4">Exportar ou importar dados do sistema.</p>
                        <div className="flex gap-3">
                           <button 
                             onClick={() => {
                               const data = { settings: { ...form }, exportedAt: new Date().toISOString() };
                               const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                               const url = URL.createObjectURL(blob);
                               const a = document.createElement('a');
                               a.href = url;
                               a.download = `nexus_church_profile_${new Date().toISOString().split('T')[0]}.json`;
                               a.click();
                               URL.revokeObjectURL(url);
                               show('Perfil exportado com sucesso!', 'success');
                             }}
                            className="px-4 py-2 bg-nexus-card border border-nexus-border text-nexus-text rounded-lg text-xs font-bold hover:bg-nexus-bg transition-all flex items-center gap-2"
                          >
                            <Download size={14} /> Exportar Dados
                          </button>
                           <button 
                             onClick={() => {
                               const input = document.createElement('input');
                               input.type = 'file';
                               input.accept = '.json';
                               input.onchange = (e) => {
                                 const file = (e.target as HTMLInputElement).files?.[0];
                                 if (!file) return;
                                 const reader = new FileReader();
                                 reader.onload = (ev) => {
                                   try {
                                     const data = JSON.parse(ev.target?.result as string);
                                     if (data.settings) {
                                       setForm(prev => ({ ...prev, ...data.settings }));
                                     }
                                     show('Dados importados com sucesso!', 'success');
                                   } catch {
                                     show('Ficheiro inválido. Selecione um backup JSON.', 'error');
                                   }
                                 };
                                 reader.readAsText(file);
                               };
                               input.click();
                             }}
                            className="px-4 py-2 bg-nexus-card border border-nexus-border text-nexus-text rounded-lg text-xs font-bold hover:bg-nexus-bg transition-all flex items-center gap-2"
                          >
                            <Upload size={14} /> Importar Dados
                          </button>
                        </div>
                      </div>
                      <div className="p-6 bg-nexus-card/30 rounded-2xl border border-nexus-border">
                        <h4 className="text-sm font-bold text-nexus-text mb-3 flex items-center gap-2">
                          <ShieldCheck size={18} className="text-nexus-orange" />
                          Segurança
                        </h4>
                        <p className="text-xs text-nexus-text-muted mb-4">Definições de segurança do sistema.</p>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-nexus-text">Registo de Logs de Segurança</span>
                            <button onClick={() => setLogSecurity(!logSecurity)} className={`w-9 h-5 rounded-full relative transition-colors ${logSecurity ? 'bg-emerald-500' : 'bg-nexus-bg border border-nexus-border'}`} role="switch" aria-checked={logSecurity}>
                              <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${logSecurity ? 'right-1' : 'left-1'}`}></div>
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-nexus-text">Verificação em Duas Etapas</span>
                            <button onClick={() => setTwoFactor(!twoFactor)} className={`w-9 h-5 rounded-full relative transition-colors ${twoFactor ? 'bg-emerald-500' : 'bg-nexus-bg border border-nexus-border'}`} role="switch" aria-checked={twoFactor}>
                              <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${twoFactor ? 'right-1' : 'left-1'}`}></div>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                 </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* User Details Modal */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedUser(null)} className="absolute inset-0 bg-nexus-bg/90 backdrop-blur-xl" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-md glass-card p-8 border-nexus-border">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-xl bg-nexus-card border border-nexus-border flex items-center justify-center text-nexus-yellow shadow-md text-lg font-black">
                      {selectedUser.full_name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-nexus-text">{selectedUser.full_name}</h3>
                       <span className="text-[9px] font-black text-nexus-yellow px-2.5 py-0.5 rounded bg-nexus-yellow/5 border border-nexus-yellow/20 tracking-widest">{selectedUser.roles?.join(' & ')}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedUser(null)} className="text-nexus-text-muted hover:text-nexus-text"><X size={20} /></button>
              </div>

              <div className="space-y-3 mb-6">
                <div className="p-3 bg-nexus-card/30 rounded-lg border border-nexus-border/30 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-nexus-text-muted uppercase">Email</span>
                  <span className="text-sm font-bold text-nexus-text">{selectedUser.email}</span>
                </div>
                <div className="p-3 bg-nexus-card/30 rounded-lg border border-nexus-border/30 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-nexus-text-muted uppercase">Telefone</span>
                  <span className="text-sm font-bold text-nexus-text">{selectedUser.phone || 'N/A'}</span>
                </div>
                <div className="p-3 bg-nexus-card/30 rounded-lg border border-nexus-border/30 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-nexus-text-muted uppercase">Criado em</span>
                  <span className="text-sm font-bold text-nexus-text">{new Date(selectedUser.created_at).toLocaleDateString('pt-PT')}</span>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t border-nexus-border/50">
                <button onClick={() => {}} className="px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2">
                  <Trash2 size={14} /> Remover
                </button>
                <button onClick={() => {}} className="flex-1 py-2.5 gold-gradient text-white rounded-xl text-xs font-black uppercase tracking-widest hover:brightness-110 shadow-lg shadow-nexus-orange/10 transition-all flex items-center justify-center gap-2">
                  <Edit3 size={14} /> Editar Papel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Theme Modal */}
      <AnimatePresence>
        {isThemeModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsThemeModalOpen(false)} className="absolute inset-0 bg-nexus-bg/90 backdrop-blur-xl" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-md glass-card p-8 border-nexus-border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-nexus-text uppercase">
                  {themeForm.type === 'annual' ? 'Tema Anual' : 'Tema Mensal'}
                </h3>
                <button onClick={() => setIsThemeModalOpen(false)} className="text-nexus-text-muted hover:text-nexus-text"><X size={20} /></button>
              </div>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <button onClick={() => setThemeForm(p => ({ ...p, type: 'annual' }))} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${themeForm.type === 'annual' ? 'bg-nexus-yellow text-white' : 'bg-nexus-card text-nexus-text-muted border border-nexus-border'}`}>Anual</button>
                  <button onClick={() => setThemeForm(p => ({ ...p, type: 'monthly' }))} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${themeForm.type === 'monthly' ? 'bg-nexus-yellow text-white' : 'bg-nexus-card text-nexus-text-muted border border-nexus-border'}`}>Mensal</button>
                </div>
                <div>
                  <label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">{themeForm.type === 'annual' ? 'Ano' : 'Mês/Período'}</label>
                  <input type="text" value={themeForm.year} onChange={(e) => setThemeForm(p => ({ ...p, year: e.target.value }))} className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl p-3 text-sm text-nexus-text focus:ring-1 focus:ring-nexus-yellow" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">Título do Tema</label>
                  <input type="text" value={themeForm.title} onChange={(e) => setThemeForm(p => ({ ...p, title: e.target.value }))} placeholder="Ex: O Ano da Celebração" className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl p-3 text-sm text-nexus-text focus:ring-1 focus:ring-nexus-yellow" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">Versículo Base</label>
                  <input type="text" value={themeForm.verse} onChange={(e) => setThemeForm(p => ({ ...p, verse: e.target.value }))} placeholder="Ex: Romanos 11:36" className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl p-3 text-sm text-nexus-text focus:ring-1 focus:ring-nexus-yellow" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setIsThemeModalOpen(false)} className="flex-1 py-3 bg-nexus-card hover:bg-nexus-border text-nexus-text rounded-xl text-sm font-black uppercase tracking-widest transition-all">Cancelar</button>
                <button onClick={() => { show('Tema guardado com sucesso!', 'success'); setIsThemeModalOpen(false); }} className="flex-1 py-3 gold-gradient text-white rounded-xl text-sm font-black uppercase tracking-widest hover:brightness-110 shadow-xl shadow-nexus-orange/20 transition-all">Guardar</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Template Configuration Modal */}
      <AnimatePresence>
        {isTemplateModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsTemplateModalOpen(false)} className="absolute inset-0 bg-nexus-bg/90 backdrop-blur-xl" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-lg glass-card p-8 border-nexus-border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-nexus-text uppercase">Template: {selectedTemplate}</h3>
                <button onClick={() => setIsTemplateModalOpen(false)} className="text-nexus-text-muted hover:text-nexus-text"><X size={20} /></button>
              </div>

              <div className="mb-4 p-3 bg-nexus-yellow/5 border border-nexus-yellow/20 rounded-xl">
                <p className="text-[10px] font-bold text-nexus-yellow uppercase tracking-widest mb-1">Variáveis disponíveis</p>
                <p className="text-[10px] text-nexus-text-muted">{`{nome}, {nome_igreja}, {data}, {hora}, {tipo}, {evento}, {local}, {valor}, {cargo}`}</p>
              </div>

              <div>
                <label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1 mb-2 block">Conteúdo da Mensagem</label>
                <textarea value={templateContent} onChange={(e) => setTemplateContent(e.target.value)} rows={6} className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl p-3 text-sm text-nexus-text focus:ring-1 focus:ring-nexus-yellow resize-none font-mono" />
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setIsTemplateModalOpen(false)} className="flex-1 py-3 bg-nexus-card hover:bg-nexus-border text-nexus-text rounded-xl text-sm font-black uppercase tracking-widest transition-all">Cancelar</button>
                <button onClick={() => { show('Template guardado!', 'success'); setIsTemplateModalOpen(false); }} className="flex-1 py-3 gold-gradient text-white rounded-xl text-sm font-black uppercase tracking-widest hover:brightness-110 shadow-xl shadow-nexus-orange/20 transition-all flex items-center justify-center gap-2">
                  <Save size={14} /> Guardar Template
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
