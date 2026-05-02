import { 
  MessageSquare, 
  Send, 
  Users, 
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Plus,
  X,
  Check
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useMessages, useMembers, useVisitors } from '../stores/dataStore';

const CHANNEL_LABELS: Record<string, string> = {
  WHATSAPP: 'WhatsApp',
  EMAIL: 'Email',
  SMS: 'SMS',
  BOTH: 'WhatsApp + Email',
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Rascunho',
  SENT: 'Enviado',
  FAILED: 'Falhou',
  SCHEDULED: 'Agendado',
};

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-nexus-card text-nexus-text-muted border-nexus-border',
  SENT: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  FAILED: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  SCHEDULED: 'bg-nexus-yellow/10 text-nexus-yellow border-nexus-yellow/20',
};

export default function CommunicationRoom() {
  const { messages, loading, error, fetchMessages, sendMessage } = useMessages();
  const { members, fetchMembers } = useMembers();
  const { visitors, fetchVisitors } = useVisitors();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [newMsg, setNewMsg] = useState({ title: '', body: '', channel: 'WHATSAPP' as const, target_audience: 'ALL' as const });

  useEffect(() => {
    fetchMessages();
    fetchMembers();
    fetchVisitors();
  }, []);

  const handleSendMsg = async () => {
    if (!newMsg.title.trim() || !newMsg.body.trim()) return;
    setIsSubmitting(true);
    const success = await sendMessage({
      title: newMsg.title,
      body: newMsg.body,
      channel: newMsg.channel,
      target_audience: newMsg.target_audience,
      status: 'SENT',
      scheduled_at: null,
    });
    if (success) {
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setIsModalOpen(false);
        setNewMsg({ title: '', body: '', channel: 'WHATSAPP', target_audience: 'ALL' });
      }, 2000);
    }
    setIsSubmitting(false);
  };

  const stats = useMemo(() => {
    const sent = messages.filter(m => m.status === 'SENT');
    return {
      total: messages.length,
      delivered: sent.reduce((sum, m) => sum + (m.delivery_count || 0), 0),
      rate: sent.length > 0 ? Math.round(sent.reduce((sum, m) => sum + (m.delivery_count || 0), 0) / Math.max(1, sent.reduce((sum, m) => sum + (m.sent_count || 0), 0)) * 100) : 0,
    };
  }, [messages]);

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-nexus-text uppercase tracking-tight">Central de Comunicação</h2>
          <p className="text-sm text-nexus-text-muted">Envio de mensagens via WhatsApp e Email para membros e visitantes.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-6 py-2.5 gold-gradient text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-nexus-orange/10 hover:brightness-110 transition-all">
          <Plus size={18} /> Nova Mensagem
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Enviadas', value: stats.total, icon: Send, color: 'text-blue-400' },
          { label: 'Entregues', value: stats.delivered, icon: CheckCircle, color: 'text-emerald-400' },
          { label: 'Taxa de Leitura', value: `${stats.rate}%`, icon: Users, color: 'text-amber-400' },
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
          <p className="text-sm text-nexus-text-muted">A carregar mensagens...</p>
        </div>
      ) : error ? (
        <div className="glass-card p-12 text-center">
          <p className="text-sm text-red-400">Erro: {error}</p>
        </div>
      ) : messages.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <MessageSquare size={48} className="mx-auto text-nexus-text-muted mb-4 opacity-50" />
          <h3 className="text-lg font-bold text-nexus-text mb-2">Sem mensagens</h3>
          <p className="text-sm text-nexus-text-muted">Comece por criar a primeira comunicação.</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="divide-y divide-nexus-border/30">
            {messages.map((msg) => (
              <div key={msg.id} className="p-5 flex items-center justify-between hover:bg-nexus-card/40 transition-all group">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border border-nexus-border ${
                    msg.status === 'SENT' ? 'bg-emerald-500/10 text-emerald-400' :
                    msg.status === 'FAILED' ? 'bg-rose-500/10 text-rose-400' :
                    'bg-nexus-card text-nexus-text-muted'
                  }`}>
                    {msg.status === 'SENT' ? <CheckCircle size={18} /> : msg.status === 'FAILED' ? <AlertCircle size={18} /> : <MessageSquare size={18} />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-nexus-text group-hover:text-nexus-yellow transition-colors">{msg.title}</p>
                    <p className="text-[10px] text-nexus-text-muted font-bold uppercase">{CHANNEL_LABELS[msg.channel]} • {msg.target_audience}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-widest ${STATUS_COLORS[msg.status] || STATUS_COLORS.DRAFT}`}>
                    {STATUS_LABELS[msg.status] || msg.status}
                  </span>
                  <div className="text-right">
                    <p className="text-xs font-bold text-nexus-text">{msg.delivery_count || 0}</p>
                    <p className="text-[9px] text-nexus-text-muted font-bold uppercase">Entregues</p>
                  </div>
                  <button className="p-2 text-nexus-text-muted hover:text-nexus-yellow transition-colors"><ChevronRight size={18} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-nexus-bg/90 backdrop-blur-xl" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-md glass-card p-8 border-nexus-border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-nexus-text uppercase">Nova Mensagem</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-nexus-text-muted hover:text-nexus-text"><X size={20} /></button>
              </div>
              <div className="space-y-4">
                <div><label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">Título</label>
                  <input type="text" value={newMsg.title} onChange={(e) => setNewMsg(p => ({ ...p, title: e.target.value }))} className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl p-3 text-sm text-nexus-text focus:ring-1 focus:ring-nexus-yellow" /></div>
                <div><label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">Canal</label>
                  <select value={newMsg.channel} onChange={(e) => setNewMsg(p => ({ ...p, channel: e.target.value as any }))} className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl p-3 text-sm text-nexus-text focus:ring-1 focus:ring-nexus-yellow">
                    <option value="WHATSAPP">WhatsApp</option><option value="EMAIL">Email</option><option value="BOTH">WhatsApp + Email</option>
                  </select></div>
                <div><label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">Público</label>
                  <select value={newMsg.target_audience} onChange={(e) => setNewMsg(p => ({ ...p, target_audience: e.target.value as any }))} className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl p-3 text-sm text-nexus-text focus:ring-1 focus:ring-nexus-yellow">
                    <option value="ALL">Todos</option><option value="MEMBERS">Apenas Membros</option><option value="VISITORS">Apenas Visitantes</option>
                  </select></div>
                <div><label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">Mensagem</label>
                  <textarea value={newMsg.body} onChange={(e) => setNewMsg(p => ({ ...p, body: e.target.value }))} rows={4} className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl p-3 text-sm text-nexus-text focus:ring-1 focus:ring-nexus-yellow resize-none" /></div>
              </div>
              <div className="flex gap-3 mt-6 relative">
                {isSuccess ? (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute inset-0 z-10 flex items-center justify-center bg-emerald-500 rounded-xl text-white font-bold text-xs uppercase tracking-widest gap-2"><Check size={18} /> Mensagem Enviada</motion.div>
                ) : null}
                <button disabled={isSubmitting || isSuccess} onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-nexus-card hover:bg-nexus-border text-nexus-text rounded-xl text-sm font-black uppercase tracking-widest transition-all disabled:opacity-50">Cancelar</button>
                <button 
                  disabled={isSubmitting || isSuccess || !newMsg.title.trim() || !newMsg.body.trim()}
                  onClick={handleSendMsg} 
                  className="flex-1 py-3 gold-gradient text-white rounded-xl text-sm font-black uppercase tracking-widest hover:brightness-110 shadow-xl shadow-nexus-orange/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >Enviar Mensagem</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
