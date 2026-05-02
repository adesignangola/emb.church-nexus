import { 
  Users, 
  TrendingUp, 
  HandCoins, 
  UserPlus,
  Banknote,
  MapPin,
  Calendar,
  Baby,
  Heart,
  ChevronRight,
  Filter,
  Search
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useMemo, useEffect } from 'react';
import { useToast } from '../lib/toastStore';
import { useMembers, useFinancial, useEvents, useVisitors, useWorship } from '../stores/dataStore';

const COLORS = ['#cc8400', '#f97316', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];

export default function Dashboard() {
  const [filterType, setFilterType] = useState<'LOCATION' | 'AGE' | 'MARITAL' | 'TYPE'>('LOCATION');
  const [searchQuery, setSearchQuery] = useState('');
  const { members, loading: membersLoading, fetchMembers } = useMembers();
  const { transactions, loading: financialLoading, fetchTransactions } = useFinancial();
  const { events, fetchEvents } = useEvents();
  const { visitors, fetchVisitors } = useVisitors();
  const { services, fetchServices } = useWorship();
  const { show } = useToast();

  useEffect(() => {
    fetchMembers();
    fetchTransactions();
    fetchEvents();
    fetchVisitors();
    fetchServices();
  }, []);

  const activeMembers = members.filter(m => m.status === 'ACTIVE');
  const totalIncome = transactions
    .filter(t => t.type === 'INCOME' && t.status === 'CONFIRMED')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const thisMonthVisitors = useMemo(() => {
    const now = new Date();
    return visitors.filter(v => {
      const d = new Date(v.visit_date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
  }, [visitors]);

  const avgFrequency = useMemo(() => {
    if (services.length === 0) return 0;
    const totalAttendance = services.reduce((sum, s) => sum + (s.attendance_members || 0) + (s.attendance_visitors || 0), 0);
    return Math.round((totalAttendance / services.length) / activeMembers.length * 100) || 0;
  }, [services, activeMembers.length]);

  const ageDistribution = useMemo(() => {
    const ages = activeMembers.filter(m => m.birth_date).map(m => {
      const today = new Date();
      const birth = new Date(m.birth_date);
      return today.getFullYear() - birth.getFullYear();
    });
    const ranges = [
      { label: 'Crianças (0-12)', min: 0, max: 12 },
      { label: 'Jovens (13-25)', min: 13, max: 25 },
      { label: 'Adultos (26-50)', min: 26, max: 50 },
      { label: 'Séniores (50+)', min: 51, max: 150 },
    ];
    return ranges.map(r => {
      const count = ages.filter(a => a >= r.min && a <= r.max).length;
      return { label: r.label, value: ages.length > 0 ? Math.round((count / ages.length) * 100) : 0 };
    });
  }, [activeMembers]);

  const maritalDistribution = useMemo(() => {
    const withMarital = activeMembers.filter((m: any) => (m as any).marital_status);
    const counts: Record<string, number> = {};
    withMarital.forEach((m: any) => {
      const s = (m as any).marital_status;
      counts[s] = (counts[s] || 0) + 1;
    });
    const total = withMarital.length || 1;
    return [
      { label: 'Casados', value: counts['MARRIED'] || 0, total },
      { label: 'Solteiros', value: counts['SINGLE'] || 0, total },
      { label: 'Outros', value: (counts['DIVORCED'] || 0) + (counts['WIDOWED'] || 0) + (counts['SEPARATED'] || 0), total },
    ];
  }, [activeMembers]);

  const locationData = useMemo(() => {
    const areas: Record<string, number> = {};
    activeMembers.filter(m => m.address && m.address.trim()).forEach(m => {
      const area = m.address.split(',')[0].trim();
      areas[area] = (areas[area] || 0) + 1;
    });
    return Object.entries(areas)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({ name, value }));
  }, [activeMembers]);

  const chartData = useMemo(() => {
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
    return monthNames.map((name, i) => ({
      name,
      membros: Math.round(activeMembers.length * ((i + 1) / 6)),
    }));
  }, [activeMembers.length]);

  const financialData = useMemo(() => {
    const categories: Record<string, number> = {};
    transactions.filter(t => t.type === 'INCOME' && t.status === 'CONFIRMED').forEach(t => {
      const label = t.category === 'TITHE' ? 'Dízimos' : t.category === 'OFFERING' ? 'Ofertas' : t.category === 'DONATION' ? 'Doações' : 'Outros';
      categories[label] = (categories[label] || 0) + Number(t.amount);
    });
    return Object.entries(categories).map(([category, value]) => ({ category, value }));
  }, [transactions]);

  const filteredMembers = useMemo(() => {
    if (!searchQuery) return activeMembers;
    const q = searchQuery.toLowerCase();
    return activeMembers.filter(m =>
      m.full_name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.phone.includes(q)
    );
  }, [activeMembers, searchQuery]);

  const filteredByType = useMemo(() => {
    let result = filteredMembers;
    if (filterType === 'LOCATION') {
      const withAddr = result.filter(m => m.address && m.address.trim());
      const grouped: Record<string, typeof result> = {};
      withAddr.forEach(m => {
        const area = m.address.split(',')[0].trim();
        if (!grouped[area]) grouped[area] = [];
        grouped[area].push(m);
      });
      return Object.entries(grouped).sort((a, b) => b[1].length - a[1].length);
    }
    return [];
  }, [filteredMembers, filterType]);

  const handleFilterChange = (type: 'LOCATION' | 'AGE' | 'MARITAL' | 'TYPE') => {
    setFilterType(type);
    if (type === 'LOCATION') {
      show(`${filteredByType.length} bairros encontrados com ${filteredMembers.length} membros`, 'info');
    } else {
      show(`Mostrando ${filteredMembers.length} membros ativos`, 'info');
    }
  };

  const statsData = [
    { id: 1, label: 'Membros Ativos', value: activeMembers.length.toLocaleString(), trend: '+5.2%', icon: Users, color: 'text-blue-400' },
    { id: 2, label: 'Frequência Média', value: `${avgFrequency}%`, trend: '+3.1%', icon: TrendingUp, color: 'text-emerald-400' },
    { id: 3, label: 'Entradas (Mês)', value: `${totalIncome.toLocaleString()}kz`, trend: '+12.4%', icon: HandCoins, color: 'text-amber-400' },
    { id: 4, label: 'Visitantes', value: thisMonthVisitors.toString(), trend: '+8.3%', icon: UserPlus, color: 'text-violet-400' },
  ];

  const isLoading = membersLoading || financialLoading;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      {isLoading ? (
        <div className="flex items-center justify-center h-48 sm:h-64">
          <div className="animate-spin w-8 h-8 sm:w-10 sm:h-10 border-2 border-nexus-yellow border-t-transparent rounded-full" />
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {statsData.map((stat, i) => (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6 flex items-start justify-between group hover:border-nexus-orange/30 transition-all cursor-default"
              >
                <div>
                  <p className="text-nexus-text-muted text-sm font-medium mb-1">{stat.label}</p>
                  <h3 className="text-2xl font-bold text-nexus-text">{stat.value}</h3>
                  <p className="text-xs mt-2 font-medium">
                    <span className="text-emerald-400">{stat.trend}</span>
                    <span className="text-nexus-text-muted ml-1">vs mês anterior</span>
                  </p>
                </div>
                <div className={`p-3 rounded-xl bg-nexus-card ${stat.color} group-hover:scale-110 transition-transform`}>
                  <stat.icon size={24} />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Main Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            <div className="glass-card p-4 sm:p-6 h-[300px] sm:h-[350px] flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-nexus-text flex items-center gap-2">
                  <TrendingUp size={18} className="text-nexus-orange" />
                  Crescimento de Membros
                </h3>
              </div>
              <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorMembros" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--nexus-card)', border: '1px solid var(--nexus-border)', borderRadius: '8px' }} />
                    <Area type="monotone" dataKey="membros" stroke="#f97316" fillOpacity={1} fill="url(#colorMembros)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-card p-4 sm:p-6 h-[300px] sm:h-[350px] flex flex-col">
               <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="font-semibold text-nexus-text flex items-center gap-2">
                  <Banknote size={18} className="text-emerald-400" />
                  Distribuição Financeira
                </h3>
              </div>
              <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={financialData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} horizontal={false} />
                    <XAxis type="number" hide />
                    <YAxis dataKey="category" type="category" stroke="#94a3b8" fontSize={10} width={70} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: 'var(--nexus-card)', border: '1px solid var(--nexus-border)', borderRadius: '8px' }} />
                    <Bar dataKey="value" fill="#cc8400" radius={[0, 4, 4, 0]} barSize={15} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Demographics Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
             <div className="glass-card p-4 sm:p-6 min-h-[280px] sm:min-h-[300px] flex flex-col">
                <h4 className="text-sm font-bold text-slate-100 mb-6 flex items-center gap-2">
                   <MapPin size={16} className="text-blue-400" /> Residência (Top Bairros)
                </h4>
              <div className="flex-1">
                 {locationData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                          <Pie data={locationData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                             {locationData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                             ))}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: 'var(--nexus-card)', border: 'none', borderRadius: '8px' }} />
                       </PieChart>
                    </ResponsiveContainer>
                 ) : (
                    <div className="flex items-center justify-center h-full text-xs text-nexus-text-muted">Sem dados de localização</div>
                 )}
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                 {locationData.length > 0 ? locationData.map((loc, i) => (
                    <div key={loc.name} className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }}></div>
                       <span className="text-[10px] text-slate-400 font-bold uppercase">{loc.name}</span>
                    </div>
                 )) : (
                    <p className="col-span-2 text-[10px] text-slate-500 text-center">Adicione endereços aos membros</p>
                 )}
              </div>
             </div>

             <div className="glass-card p-4 sm:p-6">
                <h4 className="text-sm font-bold text-nexus-text mb-4 sm:mb-6 flex items-center gap-2">
                   <Baby size={16} className="text-pink-400" /> Faixa Etária
                </h4>
              <div className="space-y-3 sm:space-y-4">
                 {ageDistribution.map((age, idx) => (
                    <div key={age.label}>
                       <div className="flex justify-between text-[10px] font-bold text-nexus-text-muted uppercase mb-1.5">
                          <span>{age.label}</span>
                          <span>{age.value}%</span>
                       </div>
                       <div className="h-1.5 w-full bg-nexus-card rounded-full overflow-hidden">
                          <div className={`h-full ${['bg-pink-500', 'bg-nexus-orange', 'bg-emerald-500', 'bg-nexus-yellow'][idx]}`} style={{ width: `${age.value}%` }}></div>
                       </div>
                    </div>
                 ))}
                 {ageDistribution.every(a => a.value === 0) && (
                    <p className="text-[10px] text-nexus-text-muted text-center">Sem dados de nascimento</p>
                 )}
              </div>
             </div>

             <div className="glass-card p-4 sm:p-6">
                <h4 className="text-sm font-bold text-nexus-text mb-4 sm:mb-6 flex items-center gap-2">
                   <Heart size={16} className="text-red-400" /> Estado Civil
                </h4>
              <div className="space-y-3 sm:space-y-4">
                 {maritalDistribution.map(stat => (
                    <div key={stat.label} className="p-3 bg-nexus-bg/30 border border-nexus-border rounded-xl flex items-center justify-between">
                       <div>
                          <p className="text-[10px] font-bold text-nexus-text-muted uppercase">{stat.label}</p>
                          <p className="text-lg font-bold text-nexus-text">{stat.value}</p>
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] font-bold text-nexus-orange">{Math.round((stat.value/stat.total)*100)}%</p>
                       </div>
                    </div>
                 ))}
                 {maritalDistribution.every(s => s.value === 0) && (
                    <p className="text-[10px] text-nexus-text-muted text-center">Sem dados de estado civil</p>
                 )}
              </div>
             </div>
          </div>

          {/* Filterable Member Explorer */}
          <div className="space-y-3 sm:space-y-4">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <h3 className="font-bold text-nexus-text flex items-center gap-2">
                   <Filter size={18} className="text-nexus-orange" /> Explorador de Membros
                </h3>
                <div className="flex bg-nexus-card/50 p-1 rounded-lg border border-nexus-border overflow-x-auto">
                   <button 
                      onClick={() => handleFilterChange('LOCATION')}
                      className={`px-3 sm:px-4 py-1.5 text-[10px] font-bold rounded-md transition-all whitespace-nowrap ${filterType === 'LOCATION' ? 'bg-nexus-orange text-white' : 'text-nexus-text-muted'}`}
                   >
                      LOCALIZAÇÃO
                   </button>
                   <button 
                      onClick={() => handleFilterChange('AGE')}
                      className={`px-3 sm:px-4 py-1.5 text-[10px] font-bold rounded-md transition-all whitespace-nowrap ${filterType === 'AGE' ? 'bg-nexus-orange text-white' : 'text-nexus-text-muted'}`}
                   >
                      IDADE
                   </button>
                   <button 
                      onClick={() => handleFilterChange('MARITAL')}
                      className={`px-3 sm:px-4 py-1.5 text-[10px] font-bold rounded-md transition-all whitespace-nowrap ${filterType === 'MARITAL' ? 'bg-nexus-orange text-white' : 'text-nexus-text-muted'}`}
                   >
                      ESTADO CIVIL
                   </button>
                   <button 
                      onClick={() => handleFilterChange('TYPE')}
                      className={`px-3 sm:px-4 py-1.5 text-[10px] font-bold rounded-md transition-all whitespace-nowrap ${filterType === 'TYPE' ? 'bg-nexus-orange text-white' : 'text-nexus-text-muted'}`}
                   >
                      TIPO
                   </button>
                </div>
             </div>

             <div className="glass-card overflow-hidden">
                <div className="p-4 border-b border-nexus-border flex flex-col sm:flex-row gap-4">
                 <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-nexus-text-muted" size={16} />
                     <input 
                       type="text" 
                       value={searchQuery}
                       onChange={(e) => setSearchQuery(e.target.value)}
                       placeholder="Filtrar membros por nome, email ou telefone..." 
                       className="w-full pl-10 pr-4 py-2 bg-nexus-bg border border-nexus-border rounded-lg text-xs"
                       aria-label="Pesquisar membros por nome, email ou telefone"
                     />
                 </div>
                    <select className="bg-nexus-card border border-nexus-border rounded-lg px-4 py-2 text-xs text-nexus-text-muted" aria-label="Filtrar por grupo">
                       <option value="ALL">Todos os Resultados</option>
                       {filterType === 'LOCATION' && filteredByType.map(([area, members]) => (
                         <option key={area} value={area}>{area} ({members.length})</option>
                       ))}
                       {filterType === 'TYPE' && (
                         <>
                           <option value="MEMBER">Membro</option>
                           <option value="LEADER">Líder</option>
                           <option value="VISITOR">Visitante</option>
                         </>
                       )}
                    </select>
                </div>
                
                 <div className="divide-y divide-nexus-border/30">
                    {filteredMembers.length === 0 ? (
                      <div className="p-8 text-center">
                        <Users size={32} className="mx-auto text-nexus-text-muted mb-2 opacity-50" />
                        <p className="text-sm text-nexus-text-muted">
                          {searchQuery ? `Nenhum resultado para "${searchQuery}"` : 'Nenhum membro ativo'}
                        </p>
                      </div>
                    ) : (
                      filteredMembers.slice(0, 5).map(member => (
                        <div key={member.id} className="p-4 flex items-center justify-between hover:bg-nexus-card/40 transition-all cursor-default">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-nexus-card border border-nexus-border flex items-center justify-center font-bold text-nexus-yellow">
                                {member.full_name.charAt(0)}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-nexus-text">{member.full_name}</p>
                                <div className="flex gap-3 mt-0.5">
                                  <span className="text-[10px] text-nexus-text-muted font-bold uppercase">{member.address?.split(',')[0] || 'N/A'}</span>
                                  <span className="text-[10px] text-nexus-text-muted font-bold uppercase">•</span>
                                  <span className="text-[10px] text-nexus-text-muted font-bold uppercase">{member.birth_date ? new Date().getFullYear() - new Date(member.birth_date).getFullYear() : 'N/A'} Anos</span>
                                  <span className="text-[10px] text-nexus-text-muted font-bold uppercase">•</span>
                                  <span className="text-[10px] text-nexus-text-muted font-bold uppercase">Membro</span>
                                </div>
                              </div>
                           </div>
                           <button className="p-2 text-nexus-text-muted hover:text-nexus-orange transition-colors">
                              <ChevronRight size={20} />
                           </button>
                        </div>
                      ))
                    )}
                 </div>
                <button 
                  onClick={() => {
                    const data = filteredMembers.slice(0, 50).map(m => ({
                      Nome: m.full_name,
                      Email: m.email,
                      Telefone: m.phone,
                      Endereço: m.address || 'N/A',
                      Status: m.status,
                      'Data de Nascimento': m.birth_date || 'N/A'
                    }));
                    const headers = Object.keys(data[0] || {}).join(',');
                    const rows = data.map(r => Object.values(r).map(v => `"${v}"`).join(',')).join('\n');
                    const blob = new Blob([headers + '\n' + rows], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `relatorio_demografico_${new Date().toISOString().split('T')[0]}.csv`;
                    a.click();
                    URL.revokeObjectURL(url);
                    show(`Relatório demográfico exportado (${Math.min(filteredMembers.length, 50)} membros)`, 'success');
                  }} 
                  className="w-full py-3 bg-nexus-card/30 hover:bg-nexus-card/50 text-[10px] font-bold uppercase tracking-[0.2em] text-nexus-text-muted transition-colors"
                >
                   Exportar Relatório Demográfico
                </button>
             </div>
          </div>

          {/* Activity & Events */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            <div className="glass-card p-4 sm:p-6 lg:col-span-2">
              <h3 className="font-semibold text-nexus-text mb-6">Atividade Recente</h3>
              <div className="space-y-4">
                {transactions.slice(0, 4).map((tx, i) => (
                  <div key={tx.id || i} className="flex items-center gap-4 p-3 hover:bg-nexus-card transition-colors group cursor-default">
                    <div className="w-10 h-10 rounded-full bg-nexus-bg flex items-center justify-center border border-nexus-border text-nexus-orange">
                      {tx.type === 'INCOME' ? <Banknote size={18} /> : <UserPlus size={18} />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-nexus-text">{tx.description}</p>
                      <p className="text-xs text-nexus-text-muted">{new Date(tx.date).toLocaleDateString('pt-PT')} • {tx.type === 'INCOME' ? '+' : '-'}{Number(tx.amount).toLocaleString()}kz</p>
                    </div>
                  </div>
                ))}
                {transactions.length === 0 && (
                  <p className="text-sm text-nexus-text-muted text-center py-4">Sem atividade recente</p>
                )}
               </div>
             </div>

            <div className="glass-card p-4 sm:p-6">
              <h3 className="font-semibold text-nexus-text mb-6">Próximos Eventos</h3>
              <div className="space-y-6">
                {events.slice(0, 3).map((event, i) => (
                  <div key={event.id} className="relative pl-6 border-l border-nexus-border">
                    <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-nexus-orange shadow-[0_0_8px_rgba(249,115,22,0.5)]"></div>
                    <p className="text-xs font-bold text-nexus-orange uppercase tracking-widest mb-1">{new Date(event.date).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' })}</p>
                    <p className="text-sm font-semibold text-nexus-text mb-1">{event.title}</p>
                  </div>
                ))}
                {events.length === 0 && (
                  <p className="text-sm text-nexus-text-muted text-center py-4">Sem eventos próximos</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
