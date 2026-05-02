import { 
  UserPlus, 
  Search, 
  Filter, 
  Phone, 
  Mail, 
  MapPin,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  Users,
  X,
  CreditCard,
  Briefcase,
  Heart,
  Edit3,
  MessageSquare
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from '../lib/toastStore';
import { useMembers, useDepartments } from '../stores/dataStore';

const ITEMS_PER_PAGE = 5;

export default function MembersRoom() {
  const { members, loading, error, fetchMembers, addMember, updateMember, deleteMember } = useMembers();
  const { departments, fetchDepartments } = useDepartments();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<typeof members[0] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [memberDetailsOpen, setMemberDetailsOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    full_name: '',
    birth_date: '',
    gender: 'M' as 'M' | 'F' | 'O' | '',
    phone: '',
    email: '',
    address: '',
    baptism_date: '',
    membership_date: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE' | 'TRANSFERRED' | 'DECEASED',
    department_id: '',
    is_tither: false,
    marital_status: 'SINGLE' as 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED' | 'SEPARATED' | '',
    spouse_name: '',
    profession: '',
    notes: '',
  });
  const [addFormErrors, setAddFormErrors] = useState<Record<string, string>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const modalRef = useRef<HTMLDivElement>(null);
  const addModalRef = useRef<HTMLDivElement>(null);
  const { show } = useToast();

  useEffect(() => {
    fetchMembers();
    fetchDepartments();
  }, []);

  const selectedMember = selectedMemberId ? members.find(m => m.id === selectedMemberId) : null;

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phone.includes(searchTerm);
    const matchesStatus = filterStatus === 'ALL' || member.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / ITEMS_PER_PAGE));
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    if (!memberDetailsOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMemberDetailsOpen(false);
        setSelectedMemberId(null);
        setIsEditing(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [memberDetailsOpen]);

  useEffect(() => {
    if (memberDetailsOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [memberDetailsOpen]);

  const handleMemberClick = (id: string) => {
    setSelectedMemberId(id);
    setMemberDetailsOpen(true);
    setIsEditing(false);
  };

  const handleEditClick = () => {
    if (selectedMember) {
      setEditForm({ ...selectedMember });
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    if (editForm && selectedMemberId) {
      await updateMember(selectedMemberId, editForm);
      show(`Ficha de ${editForm.full_name} atualizada com sucesso!`, 'success');
      setSelectedMemberId(editForm.id);
      setIsEditing(false);
    }
  };

  const handleCloseModal = () => {
    setMemberDetailsOpen(false);
    setSelectedMemberId(null);
    setIsEditing(false);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleAddMember = () => {
    setAddForm({
      full_name: '',
      birth_date: '',
      gender: 'M',
      phone: '',
      email: '',
      address: '',
      baptism_date: '',
      membership_date: new Date().toISOString().split('T')[0],
      status: 'ACTIVE',
      department_id: '',
      is_tither: false,
      marital_status: 'SINGLE',
      spouse_name: '',
      profession: '',
      notes: '',
    });
    setAddFormErrors({});
    setAddModalOpen(true);
  };

  const validateAddForm = () => {
    const errors: Record<string, string> = {};
    if (!addForm.full_name.trim()) errors.full_name = 'Nome é obrigatório';
    if (!addForm.phone.trim()) errors.phone = 'Telefone é obrigatório';
    setAddFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddSubmit = async () => {
    if (!validateAddForm()) return;
    setIsAdding(true);
    const success = await addMember({
      ...addForm,
      gender: addForm.gender as 'M' | 'F' | 'O' | null,
      marital_status: addForm.marital_status || null,
      spouse_name: addForm.spouse_name || null,
      profession: addForm.profession || null,
      photo_url: null,
    });
    setIsAdding(false);
    if (success) {
      show(`${addForm.full_name} adicionado com sucesso!`, 'success');
      setAddModalOpen(false);
      await fetchMembers();
    } else {
      show('Erro ao adicionar membro. Tente novamente.', 'error');
    }
  };

  const handleExport = () => {
    const headers = ['Nome', 'Email', 'Telefone', 'Status', 'Departamento', 'Data de Membresia'];
    const rows = filteredMembers.map(m => [
      m.full_name, m.email, m.phone, m.status, getDepartmentName(m.department_id),
      m.membership_date ? new Date(m.membership_date).toLocaleDateString('pt-PT') : 'N/A'
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `membros_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    show(`${filteredMembers.length} membros exportados com sucesso!`, 'success');
  };

  const getDepartmentName = (deptId?: string) => {
    if (!deptId) return 'N/A';
    const dept = departments.find(d => d.id === deptId);
    return dept?.name || 'N/A';
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-nexus-text-muted" size={18} />
            <input 
              type="text" 
              placeholder="Pesquisar na base de membros..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-nexus-card/50 border border-nexus-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-nexus-yellow transition-all w-full sm:w-80"
              aria-label="Pesquisar membros"
            />
          </div>
          <button 
            onClick={() => setFilterModalOpen(true)}
            className="p-2 border border-nexus-border rounded-lg text-nexus-text-muted hover:text-nexus-yellow transition-colors hover:bg-nexus-card"
            aria-label="Filtrar membros"
          >
            <Filter size={20} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 border border-nexus-border rounded-lg text-nexus-text-muted text-sm font-medium hover:bg-nexus-card transition-colors"
          >
            <Download size={18} />
            Exportar
          </button>
          <button 
            onClick={handleAddMember}
            className="flex items-center gap-2 px-4 py-2 gold-gradient text-white rounded-lg text-sm font-bold shadow-lg shadow-nexus-orange/10 hover:brightness-110 active:scale-95 transition-all"
          >
            <UserPlus size={18} />
            Adicionar Membro
          </button>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-nexus-yellow border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-sm text-nexus-text-muted">A carregar membros...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <p className="text-sm text-red-400">Erro: {error}</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="p-12 text-center">
            <Users size={48} className="mx-auto text-nexus-text-muted mb-4 opacity-50" />
            <h3 className="text-lg font-bold text-nexus-text mb-2">
              {searchTerm ? 'Nenhum resultado encontrado' : 'Nenhum membro registado'}
            </h3>
            <p className="text-sm text-nexus-text-muted mb-6">
              {searchTerm 
                ? `Não encontrámos membros para "${searchTerm}". Tente outro termo.` 
                : 'Comece por adicionar o primeiro membro à base de dados.'}
            </p>
            {!searchTerm && (
              <button 
                onClick={handleAddMember}
                className="inline-flex items-center gap-2 px-6 py-2.5 gold-gradient text-white rounded-xl text-sm font-bold shadow-lg shadow-nexus-orange/10 hover:brightness-110 transition-all"
              >
                <UserPlus size={18} /> Adicionar Membro
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-nexus-card/50 border-b border-nexus-border">
                    <th className="px-6 py-4 text-xs font-bold text-nexus-text-muted uppercase tracking-widest">Nome</th>
                    <th className="px-6 py-4 text-xs font-bold text-nexus-text-muted uppercase tracking-widest">Estado</th>
                    <th className="px-6 py-4 text-xs font-bold text-nexus-text-muted uppercase tracking-widest">Departamento</th>
                    <th className="px-6 py-4 text-xs font-bold text-nexus-text-muted uppercase tracking-widest">Membro desde</th>
                    <th className="px-6 py-4 text-xs font-bold text-nexus-text-muted uppercase tracking-widest text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-nexus-border/30">
                  {paginatedMembers.map((member) => (
                    <tr 
                      key={member.id} 
                      onClick={() => handleMemberClick(member.id)}
                      className="hover:bg-nexus-card/40 transition-all cursor-pointer group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-nexus-card border border-nexus-border flex items-center justify-center text-nexus-yellow font-bold group-hover:scale-110 transition-transform">
                            {member.full_name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-nexus-text">{member.full_name}</p>
                            <p className="text-xs text-nexus-text-muted">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          member.status === 'ACTIVE' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${member.status === 'ACTIVE' ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                          {member.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-nexus-text-muted font-medium">
                        {getDepartmentName(member.department_id)}
                      </td>
                      <td className="px-6 py-4 text-sm text-nexus-text-muted font-mono">
                        {member.membership_date ? new Date(member.membership_date).toLocaleDateString('pt-PT') : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 text-nexus-text-muted hover:text-nexus-yellow transition-colors">
                          <ChevronRight size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="px-6 py-4 bg-nexus-card/30 border-t border-nexus-border flex items-center justify-between">
                <p className="text-xs text-nexus-text-muted">
                  Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredMembers.length)} de {filteredMembers.length} membros
                </p>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded bg-nexus-card border border-nexus-border text-nexus-text-muted hover:text-nexus-text transition-colors disabled:opacity-50"
                    aria-label="Página anterior"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-8 h-8 rounded text-xs font-bold transition-colors ${
                        page === currentPage 
                          ? 'bg-nexus-yellow text-white' 
                          : 'text-nexus-text-muted hover:bg-nexus-card'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button 
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded bg-nexus-card border border-nexus-border text-nexus-text-muted hover:text-nexus-text transition-colors disabled:opacity-50"
                    aria-label="Próxima página"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <AnimatePresence>
        {addModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAddModalOpen(false)}
              className="absolute inset-0 bg-nexus-bg/90 backdrop-blur-xl"
            />
            <motion.div
              ref={addModalRef}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl glass-card overflow-hidden shadow-2xl border-nexus-border"
            >
              <div className="p-6 border-b border-nexus-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-nexus-yellow/10 flex items-center justify-center">
                    <UserPlus size={20} className="text-nexus-yellow" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-nexus-text uppercase tracking-tight">Novo Membro</h3>
                    <p className="text-xs text-nexus-text-muted">Preencha os dados do membro</p>
                  </div>
                </div>
                <button onClick={() => setAddModalOpen(false)} className="p-2 hover:bg-nexus-card rounded-lg transition-colors">
                  <X size={18} className="text-nexus-text-muted" />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-1">
                    <label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest">Nome Completo <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      value={addForm.full_name}
                      onChange={(e) => setAddForm(prev => ({ ...prev, full_name: e.target.value }))}
                      className={`w-full bg-nexus-card/50 border rounded-xl px-4 py-2.5 text-sm text-nexus-text focus:outline-none focus:ring-1 focus:ring-nexus-yellow transition-all ${addFormErrors.full_name ? 'border-rose-500' : 'border-nexus-border'}`}
                      placeholder="Nome completo"
                    />
                    {addFormErrors.full_name && <p className="text-[10px] text-rose-400">{addFormErrors.full_name}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest">Telefone <span className="text-rose-500">*</span></label>
                    <input
                      type="tel"
                      value={addForm.phone}
                      onChange={(e) => setAddForm(prev => ({ ...prev, phone: e.target.value }))}
                      className={`w-full bg-nexus-card/50 border rounded-xl px-4 py-2.5 text-sm text-nexus-text focus:outline-none focus:ring-1 focus:ring-nexus-yellow transition-all ${addFormErrors.phone ? 'border-rose-500' : 'border-nexus-border'}`}
                      placeholder="+244 9XX XXX XXX"
                    />
                    {addFormErrors.phone && <p className="text-[10px] text-rose-400">{addFormErrors.phone}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest">Email</label>
                    <input
                      type="email"
                      value={addForm.email}
                      onChange={(e) => setAddForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl px-4 py-2.5 text-sm text-nexus-text focus:outline-none focus:ring-1 focus:ring-nexus-yellow transition-all"
                      placeholder="email@exemplo.com"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest">Data de Nascimento</label>
                    <input
                      type="date"
                      value={addForm.birth_date}
                      onChange={(e) => setAddForm(prev => ({ ...prev, birth_date: e.target.value }))}
                      className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl px-4 py-2.5 text-sm text-nexus-text focus:outline-none focus:ring-1 focus:ring-nexus-yellow transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest">Género</label>
                    <select
                      value={addForm.gender}
                      onChange={(e) => setAddForm(prev => ({ ...prev, gender: e.target.value as 'M' | 'F' | 'O' }))}
                      className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl px-4 py-2.5 text-sm text-nexus-text focus:outline-none focus:ring-1 focus:ring-nexus-yellow transition-all"
                    >
                      <option value="M">Masculino</option>
                      <option value="F">Feminino</option>
                      <option value="O">Outro</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest">Estado Civil</label>
                    <select
                      value={addForm.marital_status}
                      onChange={(e) => setAddForm(prev => ({ ...prev, marital_status: e.target.value as typeof addForm.marital_status }))}
                      className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl px-4 py-2.5 text-sm text-nexus-text focus:outline-none focus:ring-1 focus:ring-nexus-yellow transition-all"
                    >
                      <option value="SINGLE">Solteiro(a)</option>
                      <option value="MARRIED">Casado(a)</option>
                      <option value="DIVORCED">Divorciado(a)</option>
                      <option value="WIDOWED">Viúvo(a)</option>
                      <option value="SEPARATED">Separado(a)</option>
                    </select>
                  </div>

                  {addForm.marital_status === 'MARRIED' && (
                    <div className="col-span-2 space-y-1">
                      <label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest">Nome do Cônjuge</label>
                      <input
                        type="text"
                        value={addForm.spouse_name}
                        onChange={(e) => setAddForm(prev => ({ ...prev, spouse_name: e.target.value }))}
                        className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl px-4 py-2.5 text-sm text-nexus-text focus:outline-none focus:ring-1 focus:ring-nexus-yellow transition-all"
                        placeholder="Nome completo do cônjuge"
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest">Profissão</label>
                    <input
                      type="text"
                      value={addForm.profession}
                      onChange={(e) => setAddForm(prev => ({ ...prev, profession: e.target.value }))}
                      className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl px-4 py-2.5 text-sm text-nexus-text focus:outline-none focus:ring-1 focus:ring-nexus-yellow transition-all"
                      placeholder="Ex: Professor, Engenheiro"
                    />
                  </div>

                  <div className="col-span-2 space-y-1">
                    <label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest">Endereço</label>
                    <input
                      type="text"
                      value={addForm.address}
                      onChange={(e) => setAddForm(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl px-4 py-2.5 text-sm text-nexus-text focus:outline-none focus:ring-1 focus:ring-nexus-yellow transition-all"
                      placeholder="Endereço completo"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest">Data de Batismo</label>
                    <input
                      type="date"
                      value={addForm.baptism_date}
                      onChange={(e) => setAddForm(prev => ({ ...prev, baptism_date: e.target.value }))}
                      className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl px-4 py-2.5 text-sm text-nexus-text focus:outline-none focus:ring-1 focus:ring-nexus-yellow transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest">Departamento</label>
                    <select
                      value={addForm.department_id}
                      onChange={(e) => setAddForm(prev => ({ ...prev, department_id: e.target.value }))}
                      className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl px-4 py-2.5 text-sm text-nexus-text focus:outline-none focus:ring-1 focus:ring-nexus-yellow transition-all"
                    >
                      <option value="">Sem departamento</option>
                      {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest">Estado</label>
                    <select
                      value={addForm.status}
                      onChange={(e) => setAddForm(prev => ({ ...prev, status: e.target.value as typeof addForm.status }))}
                      className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl px-4 py-2.5 text-sm text-nexus-text focus:outline-none focus:ring-1 focus:ring-nexus-yellow transition-all"
                    >
                      <option value="ACTIVE">Ativo</option>
                      <option value="INACTIVE">Inativo</option>
                      <option value="TRANSFERRED">Transferido</option>
                      <option value="DECEASED">Falecido</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest">Dizimista</label>
                    <div className="flex items-center gap-3 mt-1">
                      <button
                        type="button"
                        onClick={() => setAddForm(prev => ({ ...prev, is_tither: true }))}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${addForm.is_tither ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-nexus-card/50 text-nexus-text-muted border border-nexus-border'}`}
                      >
                        Sim
                      </button>
                      <button
                        type="button"
                        onClick={() => setAddForm(prev => ({ ...prev, is_tither: false }))}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${!addForm.is_tither ? 'bg-nexus-card border border-nexus-border text-nexus-text' : 'bg-nexus-card/50 text-nexus-text-muted border border-nexus-border'}`}
                      >
                        Não
                      </button>
                    </div>
                  </div>

                  <div className="col-span-2 space-y-1">
                    <label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest">Notas</label>
                    <textarea
                      value={addForm.notes}
                      onChange={(e) => setAddForm(prev => ({ ...prev, notes: e.target.value }))}
                      rows={3}
                      className="w-full bg-nexus-card/50 border border-nexus-border rounded-xl px-4 py-2.5 text-sm text-nexus-text focus:outline-none focus:ring-1 focus:ring-nexus-yellow transition-all resize-none"
                      placeholder="Observações adicionais..."
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-nexus-border flex gap-3">
                <button
                  onClick={() => setAddModalOpen(false)}
                  className="flex-1 py-3 bg-nexus-card hover:bg-nexus-border text-nexus-text rounded-xl text-sm font-black uppercase tracking-widest transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddSubmit}
                  disabled={isAdding}
                  className="flex-1 py-3 gold-gradient text-white rounded-xl text-sm font-black uppercase tracking-widest hover:brightness-110 shadow-xl shadow-nexus-orange/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAdding ? 'A adicionar...' : 'Adicionar Membro'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {memberDetailsOpen && selectedMember && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label={`Detalhes de ${selectedMember.full_name}`}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-nexus-bg/90 backdrop-blur-xl"
            />
            <motion.div
              ref={modalRef}
              tabIndex={-1}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-3xl glass-card overflow-hidden shadow-2xl border-nexus-border focus:outline-none"
            >
              <div className="h-40 bg-gradient-to-r from-nexus-card via-nexus-bg to-nexus-card relative">
                <button 
                  onClick={handleCloseModal}
                  className="absolute top-4 right-4 z-10 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white/70 hover:text-white transition-all backdrop-blur-md"
                  aria-label="Fechar detalhes"
                >
                  <X size={20} />
                </button>
                
                <div className="absolute -bottom-16 left-10 p-1.5 rounded-3xl bg-nexus-bg shadow-2xl z-10">
                  <div className="w-32 h-32 bg-nexus-card rounded-2xl flex items-center justify-center text-5xl font-black text-nexus-yellow border border-nexus-border">
                    {selectedMember.full_name.charAt(0)}
                  </div>
                </div>

                <div className="absolute bottom-4 right-8 flex gap-2">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-md border ${
                    selectedMember.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-red-500/20 text-red-500 border-red-500/30'
                  }`}>
                    {selectedMember.status === 'ACTIVE' ? '● Membro em Dia' : '● Inativo'}
                  </span>
                </div>
              </div>

              <div className="pt-20 pb-10 px-10">
                <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-nexus-border pb-8 mb-8">
                  <div className="space-y-1">
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={editForm?.full_name || ''} 
                        onChange={(e) => setEditForm(prev => prev ? {...prev, full_name: e.target.value} : null)}
                        className="text-3xl font-black text-nexus-text bg-nexus-card border border-nexus-border rounded-lg px-2 focus:ring-1 focus:ring-nexus-yellow focus:outline-none"
                        aria-label="Nome completo"
                      />
                    ) : (
                      <h3 className="text-3xl font-black text-nexus-text tracking-tight leading-none">{selectedMember.full_name}</h3>
                    )}
                    <p className="text-nexus-orange/80 text-sm font-bold uppercase tracking-widest">{getDepartmentName(selectedMember.department_id)}</p>
                  </div>
                  
                  <div className="flex gap-3">
                    {isEditing ? (
                      <>
                        <button 
                          onClick={() => setIsEditing(false)}
                          className="px-6 py-2.5 bg-nexus-card hover:bg-nexus-border text-nexus-text rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                          Descartar
                        </button>
                        <button 
                          onClick={handleSave}
                          className="px-8 py-2.5 gold-gradient text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 shadow-xl shadow-nexus-orange/20 transition-all scale-105"
                        >
                          Guardar Alterações
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={handleEditClick}
                          className="px-6 py-2.5 bg-nexus-card hover:bg-nexus-border border border-nexus-border text-nexus-text-muted rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
                        >
                          <Edit3 size={14} /> Editar Ficha
                        </button>
                        <button 
                          onClick={() => { show(`A abrir comunicação com ${selectedMember.full_name}...`, 'info'); }}
                          className="px-6 py-2.5 gold-gradient text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 shadow-xl shadow-nexus-orange/20 transition-all flex items-center gap-2"
                        >
                          <MessageSquare size={14} /> Mensagem <ChevronRight size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-2 space-y-8">
                    <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                      {[
                        { icon: Mail, label: 'Email', value: selectedMember.email, field: 'email' as const },
                        { icon: Phone, label: 'Telefone', value: selectedMember.phone, field: 'phone' as const },
                        { icon: Calendar, label: 'Data de Nascimento', value: selectedMember.birth_date ? new Date(selectedMember.birth_date).toLocaleDateString('pt-PT') : 'N/A', field: 'birth_date' as const },
                        { icon: MapPin, label: 'Endereço', value: selectedMember.address || 'N/A', field: 'address' as const, colSpan: true },
                      ].map(item => (
                        <div key={item.label} className={`${item.colSpan ? 'col-span-2' : ''} space-y-1.5`}>
                          <p className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest flex items-center gap-2">
                            <item.icon size={12} className="text-nexus-yellow" /> {item.label}
                          </p>
                          {isEditing && editForm ? (
                            <input 
                              type="text" 
                              value={editForm[item.field] || ''} 
                              onChange={(e) => setEditForm(prev => prev ? {...prev, [item.field]: e.target.value} : null)}
                              className="w-full bg-nexus-card border border-nexus-border rounded-lg p-2 text-xs text-nexus-text"
                            />
                          ) : (
                            <p className="text-sm font-bold text-nexus-text">{item.value}</p>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="pt-6 border-t border-nexus-border">
                      <h4 className="text-[11px] font-black text-nexus-text-muted uppercase tracking-[0.2em] mb-4">Histórico Ministerial Recente</h4>
                      <div className="space-y-4">
                        {[
                          { date: 'Há 2 dias', activity: 'Presença no Culto de Domingo', type: 'Presença' },
                          { date: 'Há 1 semana', activity: 'Serviu no Ministério de Louvor', type: 'Serviço' },
                          { date: 'Há 1 mês', activity: 'Aniversário de Membresia (2 Anos)', type: 'Evento' },
                        ].map((act, i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-nexus-card/30 rounded-xl border border-nexus-border">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-nexus-yellow/40" />
                              <p className="text-xs font-bold text-nexus-text">{act.activity}</p>
                            </div>
                            <span className="text-[9px] font-mono text-nexus-text-muted">{act.date}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="glass-card p-6 bg-gradient-to-br from-nexus-orange/5 to-transparent border-nexus-orange/10">
                      <h4 className="text-[11px] font-black text-nexus-text uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Briefcase size={16} className="text-nexus-orange" /> Atribuições
                      </h4>
                      <div className="space-y-4">
                        <div className="p-3 bg-nexus-bg/50 rounded-xl border border-nexus-border">
                          <p className="text-[9px] text-nexus-text-muted font-black uppercase">Cargo Atualmente</p>
                          <p className="text-xs font-bold text-nexus-text">Líder Auxiliar</p>
                        </div>
                        <div className="p-3 bg-nexus-bg/50 rounded-xl border border-nexus-border">
                          <p className="text-[9px] text-nexus-text-muted font-black uppercase">Membro Desde</p>
                          <p className="text-xs font-bold text-nexus-text">{selectedMember.membership_date ? new Date(selectedMember.membership_date).toLocaleDateString('pt-PT') : 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="glass-card p-6 bg-emerald-500/5 border-emerald-500/10">
                      <h4 className="text-[11px] font-black text-nexus-text uppercase tracking-widest mb-4">Relatório de Fidelidade</h4>
                      <div className="flex items-end gap-2 mb-2">
                        <span className="text-2xl font-black text-emerald-400 leading-none">92%</span>
                        <span className="text-[9px] text-nexus-text-muted font-bold uppercase pb-1 tracking-tighter">Frequência</span>
                      </div>
                      <div className="w-full h-1.5 bg-nexus-bg rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[92%] transition-all duration-1000" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Filter Modal */}
      <AnimatePresence>
        {filterModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setFilterModalOpen(false)} className="absolute inset-0 bg-nexus-bg/90 backdrop-blur-xl" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-md glass-card overflow-hidden shadow-2xl border-nexus-border">
              <div className="p-6 border-b border-nexus-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-nexus-yellow/10 flex items-center justify-center">
                    <Filter size={20} className="text-nexus-yellow" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-nexus-text uppercase tracking-tight">Filtrar Membros</h3>
                    <p className="text-xs text-nexus-text-muted">Refine os resultados</p>
                  </div>
                </div>
                <button onClick={() => setFilterModalOpen(false)} className="p-2 hover:bg-nexus-card rounded-lg transition-colors">
                  <X size={18} className="text-nexus-text-muted" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-nexus-text-muted uppercase tracking-widest px-1">Estado</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[{ val: 'ALL', label: 'Todos' }, { val: 'ACTIVE', label: 'Ativos' }, { val: 'INACTIVE', label: 'Inativos' }, { val: 'TRANSFERRED', label: 'Transferidos' }, { val: 'DECEASED', label: 'Falecidos' }].map(opt => (
                      <button key={opt.val} onClick={() => setFilterStatus(opt.val)} className={`p-3 rounded-xl border text-xs font-bold transition-all ${filterStatus === opt.val ? 'bg-nexus-yellow/10 border-nexus-yellow text-nexus-yellow' : 'bg-nexus-card/50 border-nexus-border text-nexus-text-muted'}`}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-nexus-border flex gap-3">
                <button onClick={() => { setFilterStatus('ALL'); }} className="flex-1 py-3 bg-nexus-card hover:bg-nexus-border text-nexus-text rounded-xl text-sm font-black uppercase tracking-widest transition-all">
                  Limpar Filtros
                </button>
                <button onClick={() => setFilterModalOpen(false)} className="flex-1 py-3 gold-gradient text-white rounded-xl text-sm font-black uppercase tracking-widest hover:brightness-110 shadow-xl shadow-nexus-orange/20 transition-all">
                  Aplicar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
