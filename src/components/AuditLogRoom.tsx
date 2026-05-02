import { 
  History, 
  Search, 
  Filter, 
  ShieldAlert, 
  User, 
  Clock,
  ArrowRightLeft,
  Database,
  X
} from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { useAuditLogs } from '../stores/dataStore';

export default function AuditLogRoom() {
  const { logs, loading, error, fetchLogs } = useAuditLogs();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState<string>('ALL');
  const [selectedLog, setSelectedLog] = useState<typeof logs[0] | null>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = searchTerm === '' || 
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.entity_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.user_id || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterAction === 'ALL' || log.action === filterAction;
      return matchesSearch && matchesFilter;
    });
  }, [logs, searchTerm, filterAction]);

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-nexus-text uppercase tracking-tight">Logs & Auditoria Inviolável</h2>
          <p className="text-sm text-nexus-text-muted">Registo permanente de todas as operações vinculadas às sessões exclusivas.</p>
        </div>
        <div className="flex items-center gap-2">
           <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-nexus-text-muted" size={16} />
              <input type="text" placeholder="Pesquisar rastro digital..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-10 py-2.5 bg-nexus-card border border-nexus-border rounded-xl text-xs text-nexus-text focus:ring-1 focus:ring-nexus-yellow transition-all" aria-label="Pesquisar logs" />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-nexus-text-muted hover:text-nexus-text" aria-label="Limpar pesquisa">
                  <X size={14} />
                </button>
              )}
           </div>
           <select value={filterAction} onChange={(e) => setFilterAction(e.target.value)} className="bg-nexus-card border border-nexus-border rounded-xl px-3 py-2.5 text-xs text-nexus-text focus:ring-1 focus:ring-nexus-yellow" aria-label="Filtrar por ação">
             <option value="ALL">Todas as Ações</option>
             {Array.from(new Set(logs.map(l => l.action))).map(action => (
               <option key={action} value={action}>{action}</option>
             ))}
           </select>
        </div>
      </div>

      <div className="glass-card overflow-hidden border-nexus-border">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-nexus-yellow border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-sm text-nexus-text-muted">A carregar logs...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <p className="text-sm text-red-400">Erro: {error}</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center">
            <History size={48} className="mx-auto text-nexus-text-muted mb-4 opacity-50" />
            <h3 className="text-lg font-bold text-nexus-text mb-2">Nenhum registo de auditoria</h3>
            <p className="text-sm text-nexus-text-muted">As operações realizadas serão registadas aqui automaticamente.</p>
          </div>
        ) : (
          <>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-nexus-card/50 border-b border-nexus-border text-[10px] font-black text-nexus-text-muted uppercase tracking-[0.2em]">
                  <th className="px-6 py-4">Selo Temporal</th>
                  <th className="px-6 py-4">Agente/Sessão</th>
                  <th className="px-6 py-4">Operação</th>
                  <th className="px-6 py-4">Alvo da Ação</th>
                  <th className="px-6 py-4">Detalhes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nexus-border/30">
                {filteredLogs.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-nexus-text-muted">
                    {searchTerm ? `Sem resultados para "${searchTerm}"` : 'Nenhum registo corresponde ao filtro.'}
                  </td></tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-nexus-card/30 transition-all group">
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-2 text-[10px] font-mono font-black text-nexus-text-muted">
                            <Clock size={12} className="text-nexus-yellow opacity-50" />
                            {new Date(log.created_at).toLocaleString('pt-PT')}
                         </div>
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-nexus-card border border-nexus-border flex items-center justify-center">
                              <User size={12} className="text-nexus-text-muted" />
                            </div>
                            <span className="text-xs font-black text-nexus-text group-hover:text-nexus-yellow transition-colors">{log.user_id || 'Sistema'}</span>
                         </div>
                      </td>
                      <td className="px-6 py-4">
                         <span className="text-xs font-bold text-nexus-text">{log.action}</span>
                      </td>
                      <td className="px-6 py-4">
                         <span className="text-[10px] uppercase font-bold text-nexus-text-muted tracking-tight">{log.entity_type}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                         <button onClick={() => setSelectedLog(log)} className="p-2 text-nexus-border hover:text-nexus-yellow transition-colors" aria-label="Ver detalhes">
                            <ArrowRightLeft size={16} />
                         </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {filteredLogs.length > 0 && (
              <div className="px-6 py-3 bg-nexus-card/30 border-t border-nexus-border flex items-center justify-between">
                <p className="text-[10px] text-nexus-text-muted font-bold">{filteredLogs.length} registos</p>
                {searchTerm && (
                  <button onClick={() => { setSearchTerm(''); setFilterAction('ALL'); }} className="text-[10px] text-nexus-yellow font-bold hover:underline">Limpar filtros</button>
                )}
              </div>
            )}
          </>
        )}
        
        <div className="p-5 bg-nexus-card/30 border-t border-nexus-border flex items-center justify-center gap-4 text-center">
           <Database size={16} className="text-nexus-border" />
           <p className="text-[10px] text-nexus-text-muted font-black uppercase tracking-[0.2em] leading-relaxed">
             Protocolo de Segurança: Logs imutáveis e persistidos diretamente no núcleo do sistema para auditoria total.
           </p>
        </div>
      </div>

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedLog(null)} />
          <div className="relative w-full max-w-lg glass-card p-8 border-nexus-border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-nexus-text uppercase">Detalhes do Registo</h3>
              <button onClick={() => setSelectedLog(null)} className="text-nexus-text-muted hover:text-nexus-text" aria-label="Fechar">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              {[
                { label: 'ID', value: selectedLog.id },
                { label: 'Timestamp', value: new Date(selectedLog.created_at).toLocaleString('pt-PT') },
                { label: 'Agente', value: selectedLog.user_id || 'Sistema' },
                { label: 'Operação', value: selectedLog.action },
                { label: 'Entidade', value: selectedLog.entity_type },
                { label: 'Entidade ID', value: selectedLog.entity_id || 'N/A' },
                { label: 'IP', value: selectedLog.ip_address || 'N/A' },
              ].map(item => (
                <div key={item.label} className="flex justify-between items-start py-2 border-b border-nexus-border/30">
                  <span className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest">{item.label}</span>
                  <span className="text-xs font-mono text-nexus-text text-right max-w-[70%] break-all">{item.value}</span>
                </div>
              ))}
              {selectedLog.details && (
                <div className="py-2">
                  <span className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest block mb-2">Detalhes</span>
                  <pre className="text-xs font-mono text-nexus-text bg-nexus-card/50 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
