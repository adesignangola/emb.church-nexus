import { 
  ShieldCheck, 
  Users, 
  Briefcase, 
  ChevronRight,
  Crown
} from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { useLeadership, useDepartments } from '../stores/dataStore';

export default function LeadershipRoom() {
  const { positions, loading, error, fetchPositions } = useLeadership();
  const { departments, fetchDepartments } = useDepartments();

  useEffect(() => {
    fetchPositions();
    fetchDepartments();
  }, []);

  const getDeptName = (deptId: string | null) => {
    if (!deptId) return 'Geral';
    return departments.find(d => d.id === deptId)?.name || 'N/A';
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-lg font-black text-nexus-text uppercase tracking-tight">Organograma & Liderança</h2>
        <p className="text-sm text-nexus-text-muted">Estrutura hierárquica e cargos ministeriais da igreja.</p>
      </div>

      {loading ? (
        <div className="glass-card p-12 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-nexus-yellow border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-sm text-nexus-text-muted">A carregar organograma...</p>
        </div>
      ) : error ? (
        <div className="glass-card p-12 text-center">
          <p className="text-sm text-red-400">Erro: {error}</p>
        </div>
      ) : positions.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Crown size={48} className="mx-auto text-nexus-text-muted mb-4 opacity-50" />
          <h3 className="text-lg font-bold text-nexus-text mb-2">Sem posições definidas</h3>
          <p className="text-sm text-nexus-text-muted">Configure a estrutura de liderança da igreja.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {positions.map((pos) => (
            <div key={pos.id} className="glass-card p-5 hover:border-nexus-orange/30 transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-nexus-orange/10 rounded-lg text-nexus-orange">
                  <ShieldCheck size={18} />
                </div>
                <span className="text-[9px] font-black text-nexus-text-muted bg-nexus-card px-2 py-1 rounded border border-nexus-border">Nível {pos.level}</span>
              </div>
              <h3 className="text-sm font-black text-nexus-text group-hover:text-nexus-yellow transition-colors mb-1">{pos.title}</h3>
              <p className="text-[10px] text-nexus-text-muted font-bold mb-3">{getDeptName(pos.department_id)}</p>
              <div className="flex items-center justify-between pt-3 border-t border-nexus-border/50">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-nexus-card border border-nexus-border flex items-center justify-center text-[10px] font-bold text-nexus-yellow">
                    {pos.leader_name?.charAt(0) || '?'}
                  </div>
                  <span className="text-[10px] text-nexus-text-muted font-bold">{pos.leader_name || 'Vago'}</span>
                </div>
                <button className="p-1 text-nexus-text-muted hover:text-nexus-yellow transition-colors"><ChevronRight size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
