import { 
  Cake, 
  Calendar,
  ChevronRight,
  Users,
  Gift
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useMembers } from '../stores/dataStore';

export default function BirthdaysRoom() {
  const { members, loading, error, fetchMembers } = useMembers();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  useEffect(() => {
    fetchMembers();
  }, []);

  const birthdaysThisMonth = useMemo(() => {
    return members
      .filter(m => m.status === 'ACTIVE' && m.birth_date)
      .map(m => ({
        ...m,
        birthDay: new Date(m.birth_date!).getDate(),
        birthMonth: new Date(m.birth_date!).getMonth(),
      }))
      .filter(m => m.birthMonth === selectedMonth)
      .sort((a, b) => a.birthDay - b.birthDay);
  }, [members, selectedMonth]);

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const upcomingCount = useMemo(() => {
    const currentMonth = new Date().getMonth();
    return members
      .filter(m => m.status === 'ACTIVE' && m.birth_date && new Date(m.birth_date!).getMonth() === currentMonth)
      .length;
  }, [members]);

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-nexus-text uppercase tracking-tight">Aniversariantes do Mês</h2>
          <p className="text-sm text-nexus-text-muted">Celebrações e homenagens aos membros que fazem aniversário.</p>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="bg-nexus-card border border-nexus-border rounded-lg px-4 py-2 text-sm text-nexus-text"
          >
            {monthNames.map((name, idx) => (
              <option key={idx} value={idx}>{name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="glass-card p-6 bg-gradient-to-r from-nexus-yellow/5 to-nexus-orange/5 border-nexus-yellow/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-nexus-yellow/10 rounded-xl">
              <Gift size={24} className="text-nexus-yellow" />
            </div>
            <div>
              <p className="text-3xl font-black text-nexus-text">{upcomingCount}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-nexus-text-muted">Membros celebram a vida este mês</p>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="glass-card p-12 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-nexus-yellow border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-sm text-nexus-text-muted">A carregar aniversariantes...</p>
        </div>
      ) : error ? (
        <div className="glass-card p-12 text-center">
          <p className="text-sm text-red-400">Erro: {error}</p>
        </div>
      ) : birthdaysThisMonth.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Cake size={48} className="mx-auto text-nexus-text-muted mb-4 opacity-50" />
          <h3 className="text-lg font-bold text-nexus-text mb-2">Sem aniversariantes este mês</h3>
          <p className="text-sm text-nexus-text-muted">Nenhum membro registado faz aniversário em {monthNames[selectedMonth]}.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {birthdaysThisMonth.map((person) => (
            <div key={person.id} className="glass-card p-4 flex items-center gap-4 hover:border-nexus-yellow/30 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-nexus-card border border-nexus-border flex items-center justify-center text-lg font-black text-nexus-yellow group-hover:scale-110 transition-transform">
                {person.full_name.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-nexus-text group-hover:text-nexus-yellow transition-colors">{person.full_name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar size={12} className="text-nexus-text-muted" />
                  <span className="text-[10px] text-nexus-text-muted font-bold">Dia {person.birthDay} de {monthNames[selectedMonth]}</span>
                </div>
              </div>
              <ChevronRight size={16} className="text-nexus-border group-hover:text-nexus-yellow transition-colors" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
