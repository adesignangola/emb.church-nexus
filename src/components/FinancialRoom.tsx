import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  Plus, 
  Filter, 
  CloudDownload,
  Calendar,
  Banknote,
  PieChart as PieChartIcon,
  X,
  Check,
  AlertCircle,
  Receipt
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useFinancial } from '../stores/dataStore';
import { useToast } from '../lib/toastStore';

export default function FinancialRoom() {
  const { transactions, loading, error, fetchTransactions, addTransaction } = useFinancial();
  const { show } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    type: 'INCOME' as 'INCOME' | 'EXPENSE',
    category: 'TITHE',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    payment_method: 'CASH',
    status: 'CONFIRMED' as 'PENDING' | 'CONFIRMED' | 'CANCELLED',
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const CATEGORY_LABELS: Record<string, string> = {
    TITHE: 'Dízimos',
    OFFERING: 'Ofertas',
    SPECIAL_OFFERING: 'Oferta Especial',
    DONATION: 'Doações',
    OPERATIONAL: 'Operacional',
    EVENT: 'Eventos',
    SALARY: 'Salários',
    EXTRAORDINARY: 'Extraordinário',
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.amount || parseFloat(formData.amount) <= 0) errors.amount = 'Valor inválido';
    if (!formData.description.trim()) errors.description = 'Descrição obrigatória';
    if (!formData.date) errors.date = 'Data obrigatória';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleConfirm = async () => {
    if (!validateForm()) return;
    await addTransaction({
      date: formData.date,
      type: formData.type,
      category: formData.category as any,
      amount: parseFloat(formData.amount),
      member_id: null,
      payment_method: formData.payment_method,
      description: formData.description,
      receipt_url: null,
      status: formData.status,
    });
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setIsModalOpen(false);
      setFormData({
        type: 'INCOME',
        category: 'TITHE',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        payment_method: 'CASH',
        status: 'CONFIRMED',
      });
      setFormErrors({});
    }, 2000);
  };

  const filteredTransactions = transactions.filter(t => filterType === 'ALL' || t.type === filterType);

  const totalIncome = transactions
    .filter(t => (filterType === 'ALL' || t.type === filterType) && t.type === 'INCOME' && t.status === 'CONFIRMED')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpense = transactions
    .filter(t => t.type === 'EXPENSE' && t.status === 'CONFIRMED')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const categoryDistribution = useMemo(() => {
    const cats: Record<string, number> = {};
    let total = 0;
    transactions.filter(t => t.type === 'INCOME' && t.status === 'CONFIRMED').forEach(t => {
      const label = t.category === 'TITHE' ? 'Dízimos' : t.category === 'OFFERING' ? 'Ofertas' : t.category === 'DONATION' ? 'Doações' : 'Outros';
      cats[label] = (cats[label] || 0) + Number(t.amount);
      total += Number(t.amount);
    });
    return Object.entries(cats).map(([label, value]) => ({
      label,
      value: total > 0 ? Math.round((value / total) * 100) : 0,
      color: label === 'Dízimos' ? 'bg-nexus-yellow' : label === 'Ofertas' ? 'bg-nexus-orange' : label === 'Doações' ? 'bg-emerald-500' : 'bg-nexus-text-muted',
    }));
  }, [transactions]);

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      {/* Financial Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
        <div className="glass-card p-6 border-l-4 border-l-emerald-500 bg-emerald-500/5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black uppercase text-nexus-text-muted tracking-widest">Total Entradas</span>
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <ArrowUpRight size={20} />
            </div>
          </div>
          <h2 className="text-2xl font-black text-nexus-text tracking-tighter">{totalIncome.toLocaleString()}kz</h2>
          <p className="text-[10px] text-emerald-400 mt-1 font-black uppercase tracking-widest">+15.2% vs mês anterior</p>
        </div>

        <div className="glass-card p-6 border-l-4 border-l-rose-500 bg-rose-500/5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black uppercase text-nexus-text-muted tracking-widest">Total Saídas</span>
            <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400">
              <ArrowDownRight size={20} />
            </div>
          </div>
          <h2 className="text-2xl font-black text-nexus-text tracking-tighter">{totalExpense.toLocaleString()}kz</h2>
          <p className="text-[10px] text-rose-400 mt-1 font-black uppercase tracking-widest">-4.5% vs mês anterior</p>
        </div>

        <div className="glass-card p-6 border-l-4 border-l-nexus-yellow bg-nexus-yellow/5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black uppercase text-nexus-text-muted tracking-widest">Saldo Atual</span>
            <div className="p-2 bg-nexus-yellow/10 rounded-lg text-nexus-yellow">
              <Wallet size={20} />
            </div>
          </div>
          <h2 className="text-2xl font-black text-nexus-text tracking-tighter">{(totalIncome - totalExpense).toLocaleString()}kz</h2>
          <p className="text-[10px] text-nexus-text-muted mt-1 font-black uppercase tracking-widest">Caixa Atualizado Agora</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Transactions List */}
        <div className="flex-[2] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-nexus-text-muted">Fluxo de Caixa Recente</h3>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  setFilterType(prev => prev === 'ALL' ? 'INCOME' : prev === 'INCOME' ? 'EXPENSE' : 'ALL');
                  show(`Filtro: ${filterType === 'ALL' ? 'Entradas' : filterType === 'INCOME' ? 'Saídas' : 'Todas'}`, 'info');
                }}
                className="flex items-center gap-2 px-4 py-2 border border-nexus-border rounded-xl text-nexus-text-muted text-[10px] font-black uppercase tracking-widest hover:bg-nexus-card transition-all"
              >
                <Filter size={16} />
                {filterType === 'ALL' ? 'Todas' : filterType === 'INCOME' ? 'Entradas' : 'Saídas'}
              </button>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 gold-gradient text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 shadow-lg shadow-nexus-orange/10 transition-all"
              >
                <Plus size={16} />
                Lançamento
              </button>
            </div>
          </div>

          <div className="glass-card overflow-hidden">
            {loading ? (
              <div className="p-6 sm:p-12 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-nexus-yellow border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-sm text-nexus-text-muted">A carregar transações...</p>
              </div>
            ) : error ? (
              <div className="p-6 sm:p-12 text-center">
                <p className="text-sm text-red-400">Erro: {error}</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="p-6 sm:p-12 text-center">
                <Banknote size={48} className="mx-auto text-nexus-text-muted mb-4 opacity-50" />
                <h3 className="text-lg font-bold text-nexus-text mb-2">Nenhuma transação registada</h3>
                <p className="text-sm text-nexus-text-muted">Comece por adicionar o primeiro lançamento financeiro.</p>
              </div>
            ) : (
              <div className="divide-y divide-nexus-border/30">
                {filteredTransactions.map((tx) => (
                  <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-nexus-card/40 transition-colors group cursor-default">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border border-nexus-border ${
                        tx.type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {tx.type === 'INCOME' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-nexus-text group-hover:text-nexus-yellow transition-colors">{tx.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-nexus-text-muted flex items-center gap-1">
                            <Calendar size={10} /> {tx.date}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-nexus-border">•</span>
                          <span className="text-[10px] font-black uppercase tracking-widest text-nexus-yellow">{tx.category}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-mono font-black ${
                        tx.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {tx.type === 'INCOME' ? '+' : '-'}{Number(tx.amount).toLocaleString()}kz
                      </p>
                      <p className="text-[9px] text-nexus-text-muted font-black uppercase mt-1">Saldado</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button className="w-full py-4 bg-nexus-card/30 hover:bg-nexus-card/50 text-nexus-text-muted text-[10px] font-black uppercase tracking-[0.2em] transition-colors border-t border-nexus-border/50">
              Consultar Extrato Anual
            </button>
          </div>
        </div>

        {/* Categories Analysis */}
        <div className="flex-1 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-nexus-text-muted">Distribuição</h3>
          <div className="glass-card p-6">
            <div className="space-y-6">
              {categoryDistribution.length === 0 ? (
                <div className="p-8 text-center">
                  <PieChartIcon size={32} className="mx-auto text-nexus-text-muted mb-2 opacity-50" />
                  <p className="text-xs text-nexus-text-muted">Sem dados de distribuição ainda.</p>
                </div>
              ) : (
                categoryDistribution.map((cat) => (
                  <div key={cat.label} className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                      <span className="text-nexus-text-muted">{cat.label}</span>
                      <span className="text-nexus-text">{cat.value}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-nexus-bg rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${cat.value}%` }} 
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className={`h-full ${cat.color} rounded-full shadow-[0_0_8px_rgba(255,180,0,0.2)]`}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-8 pt-8 border-t border-nexus-border">
              <button className="w-full flex items-center justify-center gap-2 py-3 bg-nexus-card hover:bg-nexus-yellow hover:text-white text-nexus-text-muted text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all border border-nexus-border shadow-md">
                <CloudDownload size={16} />
                Exportar Mapa PDF
              </button>
            </div>
          </div>
        </div>
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
              aria-label="Novo Lançamento Financeiro"
            >
              <div className="flex items-center justify-between border-b border-nexus-border pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-nexus-yellow/10 rounded-lg text-nexus-yellow"><Receipt size={20} /></div>
                  <h3 className="text-xl font-bold text-nexus-text">Novo Lançamento Financeiro</h3>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  disabled={isSuccess}
                  className="text-nexus-text-muted hover:text-nexus-text transition-colors disabled:opacity-50"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-nexus-text-muted uppercase tracking-widest px-1">Tipo de Movimento <span className="text-rose-500">*</span></label>
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => { setFormData(prev => ({ ...prev, type: 'INCOME' })); setFormErrors({}); }}
                        className={`p-3 rounded-xl border transition-all text-center ${formData.type === 'INCOME' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-nexus-bg/50 border-nexus-border hover:border-emerald-500/50 text-nexus-text-muted'}`}
                      >
                        <ArrowUpRight size={16} className="mx-auto mb-1" />
                        <span className="text-xs font-bold uppercase">Entrada</span>
                      </button>
                      <button 
                        onClick={() => { setFormData(prev => ({ ...prev, type: 'EXPENSE' })); setFormErrors({}); }}
                        className={`p-3 rounded-xl border transition-all text-center ${formData.type === 'EXPENSE' ? 'bg-rose-500/10 border-rose-500 text-rose-400' : 'bg-nexus-bg/50 border-nexus-border hover:border-rose-500/50 text-nexus-text-muted'}`}
                      >
                        <ArrowDownRight size={16} className="mx-auto mb-1" />
                        <span className="text-xs font-bold uppercase">Saída</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="tx-amount" className="text-[10px] font-bold text-nexus-text-muted uppercase tracking-widest px-1">Valor (kz) <span className="text-rose-500">*</span></label>
                    <input 
                      id="tx-amount" 
                      type="number" 
                      value={formData.amount} 
                      onChange={(e) => { setFormData(prev => ({ ...prev, amount: e.target.value })); setFormErrors(prev => ({ ...prev, amount: '' })); }} 
                      placeholder="0.00" 
                      className={`w-full bg-nexus-card border rounded-xl p-2.5 text-sm focus:outline-none focus:ring-1 text-nexus-text ${formErrors.amount ? 'border-rose-500 focus:ring-rose-500' : 'border-nexus-border focus:ring-nexus-yellow'}`} 
                      aria-required="true" 
                    />
                    {formErrors.amount && <p className="text-xs text-rose-400 font-medium">{formErrors.amount}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="tx-date" className="text-[10px] font-bold text-nexus-text-muted uppercase tracking-widest px-1">Data <span className="text-rose-500">*</span></label>
                    <input 
                      id="tx-date" 
                      type="date" 
                      value={formData.date} 
                      onChange={(e) => { setFormData(prev => ({ ...prev, date: e.target.value })); setFormErrors(prev => ({ ...prev, date: '' })); }} 
                      className={`w-full bg-nexus-card border rounded-xl p-2.5 text-sm text-nexus-text ${formErrors.date ? 'border-rose-500' : 'border-nexus-border'}`} 
                      aria-required="true" 
                    />
                    {formErrors.date && <p className="text-xs text-rose-400 font-medium">{formErrors.date}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="tx-desc" className="text-[10px] font-bold text-nexus-text-muted uppercase tracking-widest px-1">Descrição <span className="text-rose-500">*</span></label>
                    <textarea 
                      id="tx-desc" 
                      value={formData.description} 
                      onChange={(e) => { setFormData(prev => ({ ...prev, description: e.target.value })); setFormErrors(prev => ({ ...prev, description: '' })); }} 
                      placeholder="Detalhes do movimento..." 
                      rows={2}
                      className={`w-full bg-nexus-card border rounded-xl p-2.5 text-sm focus:outline-none focus:ring-1 text-nexus-text resize-none ${formErrors.description ? 'border-rose-500 focus:ring-rose-500' : 'border-nexus-border focus:ring-nexus-yellow'}`} 
                      aria-required="true" 
                    />
                    {formErrors.description && <p className="text-xs text-rose-400 font-medium">{formErrors.description}</p>}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="tx-category" className="text-[10px] font-bold text-nexus-text-muted uppercase tracking-widest px-1">Categoria <span className="text-rose-500">*</span></label>
                    <select 
                      id="tx-category" 
                      value={formData.category} 
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))} 
                      className="w-full bg-nexus-card border border-nexus-border rounded-xl p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-nexus-yellow appearance-none text-nexus-text"
                    >
                      {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="tx-payment" className="text-[10px] font-bold text-nexus-text-muted uppercase tracking-widest px-1">Método de Pagamento</label>
                    <select 
                      id="tx-payment" 
                      value={formData.payment_method} 
                      onChange={(e) => setFormData(prev => ({ ...prev, payment_method: e.target.value }))} 
                      className="w-full bg-nexus-card border border-nexus-border rounded-xl p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-nexus-yellow appearance-none text-nexus-text"
                    >
                      <option value="CASH">Numerário</option>
                      <option value="TRANSFER">Transferência</option>
                      <option value="MULTICAIXA">Multicaixa</option>
                      <option value="CHEQUE">Cheque</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="tx-status" className="text-[10px] font-bold text-nexus-text-muted uppercase tracking-widest px-1">Estado</label>
                    <select 
                      id="tx-status" 
                      value={formData.status} 
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))} 
                      className="w-full bg-nexus-card border border-nexus-border rounded-xl p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-nexus-yellow appearance-none text-nexus-text"
                    >
                      <option value="CONFIRMED">Confirmado</option>
                      <option value="PENDING">Pendente</option>
                      <option value="CANCELLED">Cancelado</option>
                    </select>
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
                    <Check size={18} /> Lançamento Registado
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
                  Confirmar Lançamento
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
