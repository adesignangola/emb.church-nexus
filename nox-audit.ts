#!/usr/bin/env tsx
/**
 * NOX — SCRIPT FISCALIZADOR DE IMPLEMENTAÇÃO
 * 
 * Verifica cada uma das 31 issues identificadas na auditoria.
 * Falhar qualquer check = reprovação imediata.
 * Zero tolerância para implementações incompletas ou amadoras.
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = __dirname;
let passCount = 0;
let failCount = 0;
let warnings = 0;

interface Check {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  check: () => { pass: boolean; message: string };
}

function fileContains(filePath: string, pattern: string | RegExp): boolean {
  if (!existsSync(filePath)) return false;
  const content = readFileSync(filePath, 'utf-8');
  return typeof pattern === 'string' ? content.includes(pattern) : pattern.test(content);
}

function fileNotContains(filePath: string, pattern: string | RegExp): boolean {
  if (!existsSync(filePath)) return true; // file doesn't exist = good if we're checking for absence
  const content = readFileSync(filePath, 'utf-8');
  return typeof pattern === 'string' ? !content.includes(pattern) : !pattern.test(content);
}

function readFile(filePath: string): string {
  if (!existsSync(filePath)) return '';
  return readFileSync(filePath, 'utf-8');
}

function check(condition: boolean, message: string): boolean {
  return condition;
}

const checks: Check[] = [
  // =============================================
  // FASE A — CORREÇÕES CRÍTICAS
  // =============================================
  {
    id: 'NOX-001',
    severity: 'CRITICAL',
    description: 'Área do Pastor sem autenticação',
    check: () => {
      const app = readFile(resolve(ROOT, 'src/App.tsx'));
      const hasAuthContext = existsSync(resolve(ROOT, 'src/contexts/AuthContext.tsx')) || 
                             existsSync(resolve(ROOT, 'src/context/AuthContext.tsx')) ||
                             existsSync(resolve(ROOT, 'src/lib/authStore.ts')) ||
                             existsSync(resolve(ROOT, 'src/stores/authStore.ts'));
      const hasProtectedRoute = app.includes('ProtectedRoute') || app.includes('RequireAuth') || app.includes('auth') && app.includes('isAuthenticated');
      if (!hasAuthContext) return { pass: false, message: '❌ Nenhum contexto/store de autenticação encontrado' };
      if (!hasProtectedRoute) return { pass: false, message: '❌ App.tsx não usa rotas protegidas' };
      return { pass: true, message: '✅ Autenticação implementada com rotas protegidas' };
    },
  },
  {
    id: 'NOX-002',
    severity: 'CRITICAL',
    description: 'Gestão de Utilizadores sem autenticação',
    check: () => {
      const app = readFile(resolve(ROOT, 'src/App.tsx'));
      const hasProtection = app.includes('ProtectedRoute') && (app.includes('role') || app.includes('allowedRoles'));
      if (!hasProtection) return { pass: false, message: '❌ Rota de utilizadores não protegida com role checking' };
      return { pass: true, message: '✅ Rota de utilizadores protegida com role checking' };
    },
  },
  {
    id: 'NOX-003',
    severity: 'CRITICAL',
    description: 'Auditoria de Segurança sem autenticação',
    check: () => {
      const app = readFile(resolve(ROOT, 'src/App.tsx'));
      const hasAuditProtection = (app.includes("path=\"/audit\"") || app.includes("path='/audit'")) && app.includes('ProtectedRoute');
      if (!hasAuditProtection) return { pass: false, message: '❌ Rota de auditoria não protegida por auth' };
      return { pass: true, message: '✅ Rota de auditoria protegida por auth' };
    },
  },
  {
    id: 'NOX-004',
    severity: 'CRITICAL',
    description: 'Dados hardcoded — deve usar state management ou store',
    check: () => {
      const files = [
        'src/components/Dashboard.tsx',
        'src/components/MembersRoom.tsx',
        'src/components/FinancialRoom.tsx',
        'src/components/WorshipRoom.tsx',
        'src/components/LeadershipRoom.tsx',
        'src/components/DepartmentsRoom.tsx',
        'src/components/AgendaRoom.tsx',
        'src/components/PastorRoom.tsx',
        'src/components/SchoolsRoom.tsx',
        'src/components/CommunicationRoom.tsx',
        'src/components/ServiceSchedulesRoom.tsx',
        'src/components/KidsRoom.tsx',
        'src/components/BirthdaysRoom.tsx',
        'src/components/UsersRoom.tsx',
        'src/components/AuditLogRoom.tsx',
      ];
      let fixed = 0;
      for (const f of files) {
        const content = readFile(resolve(ROOT, f));
        // Check if data comes from a store, hook, or import (not const MOCK_ at top level)
        const usesStore = content.includes('useAppStore') || content.includes('useDataStore') || 
                          content.includes('useChurchStore') || content.includes('useState') ||
                          content.includes('useFetch') || content.includes('useMembers') ||
                          content.includes('useFinancial') || content.includes('useWorship') ||
                          content.includes('useAgenda') || content.includes('useLeadership') ||
                          content.includes('useDepartments') || content.includes('useSchools') ||
                          content.includes('useCommunication') || content.includes('useSchedules') ||
                          content.includes('useKids') || content.includes('useBirthdays') ||
                          content.includes('useAudit') || content.includes('usePastor');
        if (usesStore) fixed++;
      }
      if (fixed < 10) return { pass: false, message: `❌ Apenas ${fixed}/15 componentes usam state management dinâmico` };
      return { pass: true, message: `✅ ${fixed}/15 componentes usam state management` };
    },
  },
  {
    id: 'NOX-005',
    severity: 'CRITICAL',
    description: 'Sem router — deve usar react-router-dom ou equivalente',
    check: () => {
      const pkg = JSON.parse(readFile(resolve(ROOT, 'package.json')));
      const hasRouter = pkg.dependencies?.['react-router-dom'] || pkg.dependencies?.['react-router'];
      const app = readFile(resolve(ROOT, 'src/App.tsx'));
      const usesRouter = app.includes('BrowserRouter') || app.includes('Routes') || app.includes('Route') || app.includes('createBrowserRouter');
      if (!hasRouter) return { pass: false, message: '❌ react-router-dom não instalado' };
      if (!usesRouter) return { pass: false, message: '❌ App.tsx não usa react-router' };
      return { pass: true, message: '✅ Router implementado com react-router-dom' };
    },
  },
  {
    id: 'NOX-006',
    severity: 'CRITICAL',
    description: 'Sem persistência de dados — localStorage ou API',
    check: () => {
      const files = [
        'src/lib/dataStore.ts',
        'src/stores/dataStore.ts',
        'src/context/DataContext.tsx',
        'src/contexts/DataContext.tsx',
        'src/lib/api.ts',
        'src/services/api.ts',
      ];
      const hasPersistence = files.some(f => existsSync(resolve(ROOT, f)));
      if (!hasPersistence) {
        // Check if zustand persist middleware is used
        const stores = [
          'src/lib/toastStore.ts',
          'src/stores/appStore.ts',
          'src/stores/dataStore.ts',
        ];
        for (const s of stores) {
          if (existsSync(resolve(ROOT, s))) {
            const content = readFile(resolve(ROOT, s));
            if (content.includes('persist') || content.includes('localStorage') || content.includes('storage:')) {
              return { pass: true, message: '✅ Persistência implementada' };
            }
          }
        }
        return { pass: false, message: '❌ Nenhuma persistência de dados encontrada' };
      }
      return { pass: true, message: '✅ Persistência de dados implementada' };
    },
  },
  {
    id: 'NOX-007',
    severity: 'CRITICAL',
    description: 'Botão "Sair" sem handler',
    check: () => {
      const sidebar = readFile(resolve(ROOT, 'src/components/Sidebar.tsx'));
      // Check if the logout button has an onClick
      const hasLogoutHandler = sidebar.includes('onClick') && (
        sidebar.includes('logout') || sidebar.includes('signOut') || sidebar.includes('setIsAuthenticated') ||
        sidebar.includes('handleLogout') || sidebar.includes('onLogout')
      );
      if (!hasLogoutHandler) return { pass: false, message: '❌ Botão de logout ainda sem handler funcional' };
      return { pass: true, message: '✅ Botão de logout com handler' };
    },
  },
  {
    id: 'NOX-008',
    severity: 'CRITICAL',
    description: 'Toast Store single-message — overwrite bug',
    check: () => {
      const toast = readFile(resolve(ROOT, 'src/lib/toastStore.ts'));
      const hasQueue = toast.includes('toasts') || toast.includes('Toast[]') || toast.includes('message[]');
      const hasClearTimeout = toast.includes('clearTimeout') || toast.includes('timeoutId') || toast.includes('timerId');
      if (!hasQueue) return { pass: false, message: '❌ Toast store ainda suporta apenas uma mensagem' };
      if (!hasClearTimeout) return { pass: false, message: '❌ Toast store não faz clearTimeout de timers pendentes' };
      return { pass: true, message: '✅ Toast store suporta múltiplos toasts com clearTimeout' };
    },
  },
  {
    id: 'NOX-009',
    severity: 'CRITICAL',
    description: 'Keyframe CSS duplicado',
    check: () => {
      const css = readFile(resolve(ROOT, 'src/index.css'));
      const toastProgressMatches = css.match(/@keyframes toast-progress/g);
      if (!toastProgressMatches || toastProgressMatches.length > 1) return { pass: false, message: '❌ @keyframes toast-progress ainda duplicado' };
      return { pass: true, message: '✅ Keyframe duplicado removido' };
    },
  },
  {
    id: 'NOX-010',
    severity: 'CRITICAL',
    description: 'Sem validação de formulários',
    check: () => {
      const secretary = readFile(resolve(ROOT, 'src/components/SecretaryRoom.tsx'));
      const hasValidation = secretary.includes('required') || secretary.includes('validate') || 
                            secretary.includes('isValid') || secretary.includes('errors') ||
                            secretary.includes('z.') || secretary.includes('yup') ||
                            secretary.includes('validation');
      if (!hasValidation) return { pass: false, message: '❌ Formulário de marcação sem validação' };
      return { pass: true, message: '✅ Validação de formulários implementada' };
    },
  },
  {
    id: 'NOX-011',
    severity: 'CRITICAL',
    description: 'Interface Member duplicada e inconsistente',
    check: () => {
      const membersRoom = readFile(resolve(ROOT, 'src/components/MembersRoom.tsx'));
      const hasLocalInterface = membersRoom.includes('interface Member {') || membersRoom.includes('type Member =');
      const usesImportedType = membersRoom.includes("from '../types'") || membersRoom.includes('from "../types"') ||
                               membersRoom.includes("import { MemberStatus }") || membersRoom.includes('useMembers');
      if (hasLocalInterface && !usesImportedType) return { pass: false, message: '❌ MembersRoom ainda define interface Member local' };
      if (usesImportedType) return { pass: true, message: '✅ Interface Member unificada em types.ts ou usa dataStore' };
      return { pass: false, message: '❌ MembersRoom não importa tipos de types.ts ou dataStore' };
    },
  },

  // =============================================
  // FASE B — MODALS, EMPTY STATES, TABS
  // =============================================
  {
    id: 'NOX-012',
    severity: 'HIGH',
    description: 'Modais sem ESC handler',
    check: () => {
      const modals = [
        'src/components/MembersRoom.tsx',
        'src/components/SecretaryRoom.tsx',
        'src/components/UsersRoom.tsx',
      ];
      let withEscHandler = 0;
      for (const f of modals) {
        const content = readFile(resolve(ROOT, f));
        if (content.includes('Escape') || content.includes('keydown') || content.includes('useEffect')) {
          // Check if there's actually an ESC handler
          if (content.includes('Escape') && content.includes('keydown')) {
            withEscHandler++;
          } else if (content.includes('onKeyDown') || content.includes('handleKeyDown')) {
            withEscHandler++;
          }
        }
      }
      if (withEscHandler < 3) return { pass: false, message: `❌ Apenas ${withEscHandler}/3 modais têm ESC handler` };
      return { pass: true, message: `✅ Todos os ${withEscHandler}/3 modais têm ESC handler` };
    },
  },
  {
    id: 'NOX-013',
    severity: 'HIGH',
    description: 'Modais sem focus trap',
    check: () => {
      const modals = [
        'src/components/MembersRoom.tsx',
        'src/components/SecretaryRoom.tsx',
        'src/components/UsersRoom.tsx',
      ];
      let withFocusTrap = 0;
      for (const f of modals) {
        const content = readFile(resolve(ROOT, f));
        if (content.includes('focus') && content.includes('modal') || 
            content.includes('useRef') && content.includes('focus') ||
            content.includes('trap-focus') || content.includes('FocusTrap')) {
          withFocusTrap++;
        }
      }
      if (withFocusTrap < 3) return { pass: false, message: `❌ Apenas ${withFocusTrap}/3 modais têm focus trap` };
      return { pass: true, message: `✅ Todos os ${withFocusTrap}/3 modais têm focus management` };
    },
  },
  {
    id: 'NOX-014',
    severity: 'HIGH',
    description: 'Botões de ação com handlers placeholder',
    check: () => {
      const dashboard = readFile(resolve(ROOT, 'src/components/Dashboard.tsx'));
      const hasSearchState = dashboard.includes('useState') && (dashboard.includes('searchTerm') || dashboard.includes('searchQuery') || dashboard.includes('filter'));
      const hasFilterFunction = dashboard.includes('handleFilter') || dashboard.includes('handleSearch') || dashboard.includes('filterData');
      if (!hasSearchState || !hasFilterFunction) return { pass: false, message: '❌ Dashboard search/filter ainda sem funcionalidade' };
      return { pass: true, message: '✅ Dashboard search/filter funcional' };
    },
  },
  {
    id: 'NOX-015',
    severity: 'HIGH',
    description: 'Tabelas sem empty state',
    check: () => {
      const members = readFile(resolve(ROOT, 'src/components/MembersRoom.tsx'));
      const financial = readFile(resolve(ROOT, 'src/components/FinancialRoom.tsx'));
      const audit = readFile(resolve(ROOT, 'src/components/AuditLogRoom.tsx'));
      
      let withEmptyState = 0;
      if (members.includes('empty') || members.includes('Nenhum') || members.includes('emptyState') || members.includes('Nenhum membro')) withEmptyState++;
      if (financial.includes('empty') || financial.includes('Nenhuma') || financial.includes('emptyState')) withEmptyState++;
      if (audit.includes('empty') || audit.includes('Nenhum') || audit.includes('emptyState')) withEmptyState++;
      
      if (withEmptyState < 3) return { pass: false, message: `❌ Apenas ${withEmptyState}/3 tabelas têm empty state` };
      return { pass: true, message: `✅ Todas as ${withEmptyState}/3 tabelas têm empty state` };
    },
  },
  {
    id: 'NOX-016',
    severity: 'HIGH',
    description: 'Sem Error Boundaries',
    check: () => {
      const hasErrorBoundary = existsSync(resolve(ROOT, 'src/components/ErrorBoundary.tsx')) ||
                               existsSync(resolve(ROOT, 'src/lib/ErrorBoundary.tsx'));
      if (!hasErrorBoundary) return { pass: false, message: '❌ Error Boundary não encontrado' };
      const main = readFile(resolve(ROOT, 'src/main.tsx'));
      if (!main.includes('ErrorBoundary')) return { pass: false, message: '❌ main.tsx não usa ErrorBoundary' };
      return { pass: true, message: '✅ Error Boundary implementado' };
    },
  },
  {
    id: 'NOX-017',
    severity: 'HIGH',
    description: 'Formulários sem required indicators',
    check: () => {
      const users = readFile(resolve(ROOT, 'src/components/UsersRoom.tsx'));
      const secretary = readFile(resolve(ROOT, 'src/components/SecretaryRoom.tsx'));
      const hasRequiredIndicators = users.includes('*') || users.includes('required') || users.includes('obrigatório') || users.includes('Obrigatório');
      const secretaryRequired = secretary.includes('*') || secretary.includes('required') || secretary.includes('obrigatório');
      if (!hasRequiredIndicators || !secretaryRequired) return { pass: false, message: '❌ Formulários sem indicadores de campos obrigatórios' };
      return { pass: true, message: '✅ Campos obrigatórios indicados' };
    },
  },
  {
    id: 'NOX-018',
    severity: 'HIGH',
    description: 'Charts sem empty/loading state',
    check: () => {
      const dashboard = readFile(resolve(ROOT, 'src/components/Dashboard.tsx'));
      const hasLoadingOrEmpty = dashboard.includes('isLoading') || dashboard.includes('loading') || 
                                dashboard.includes('empty') || dashboard.includes('carregando') ||
                                dashboard.includes('Nenhum dado') || dashboard.includes('filteredMembers.length === 0');
      if (!hasLoadingOrEmpty) return { pass: false, message: '❌ Charts sem loading/empty state' };
      return { pass: true, message: '✅ Charts com loading/empty state' };
    },
  },
  {
    id: 'NOX-019',
    severity: 'HIGH',
    description: 'Paginação fake sem funcionalidade',
    check: () => {
      const members = readFile(resolve(ROOT, 'src/components/MembersRoom.tsx'));
      const hasPaginationLogic = members.includes('currentPage') || members.includes('pageNumber') || 
                                 members.includes('paginate') || members.includes('itemsPerPage') ||
                                 members.includes('handlePage');
      if (!hasPaginationLogic) return { pass: false, message: '❌ Paginação ainda sem lógica funcional' };
      return { pass: true, message: '✅ Paginação funcional implementada' };
    },
  },
  {
    id: 'NOX-020',
    severity: 'HIGH',
    description: 'TopBar search sem funcionalidade',
    check: () => {
      const topbar = readFile(resolve(ROOT, 'src/components/TopBar.tsx'));
      const hasSearchState = topbar.includes('useState') && (topbar.includes('search') || topbar.includes('query'));
      if (!hasSearchState) return { pass: false, message: '❌ TopBar search ainda sem estado/handler' };
      return { pass: true, message: '✅ TopBar search funcional' };
    },
  },

  // =============================================
  // FASE C — MELHORIAS
  // =============================================
  {
    id: 'NOX-021',
    severity: 'MEDIUM',
    description: 'PastorRoom tab "notas pessoais" sem conteúdo',
    check: () => {
      const pastor = readFile(resolve(ROOT, 'src/components/PastorRoom.tsx'));
      const hasNotesTab = pastor.includes("activeTab === 'notes'") && !pastor.includes('activeTab !== \'notes\' &&');
      if (!hasNotesTab) return { pass: false, message: '❌ Tab "Notas Pessoais" ainda sem conteúdo' };
      return { pass: true, message: '✅ Tab "Notas Pessoais" implementada' };
    },
  },
  {
    id: 'NOX-022',
    severity: 'MEDIUM',
    description: 'SettingsRoom tab "advanced" sem conteúdo',
    check: () => {
      const settings = readFile(resolve(ROOT, 'src/components/SettingsRoom.tsx'));
      const hasAdvancedTab = settings.includes("activeTab === 'advanced'");
      if (!hasAdvancedTab) return { pass: false, message: '❌ Tab "Configurações Avançadas" ainda sem conteúdo' };
      return { pass: true, message: '✅ Tab "Configurações Avançadas" implementada' };
    },
  },
  {
    id: 'NOX-023',
    severity: 'MEDIUM',
    description: 'BirthdaysRoom botões de navegação de mês sem handlers',
    check: () => {
      const birthdays = readFile(resolve(ROOT, 'src/components/BirthdaysRoom.tsx'));
      const hasMonthNav = birthdays.includes('setCurrentMonth') && (birthdays.includes('onClick={() => setCurrentMonth') || birthdays.includes('handlePrevMonth') || birthdays.includes('handleNextMonth'));
      if (!hasMonthNav) return { pass: false, message: '❌ Navegação de meses ainda sem handlers' };
      return { pass: true, message: '✅ Navegação de meses funcional' };
    },
  },
  {
    id: 'NOX-024',
    severity: 'MEDIUM',
    description: 'AgendaRoom botões de navegação de mês sem handlers',
    check: () => {
      const agenda = readFile(resolve(ROOT, 'src/components/AgendaRoom.tsx'));
      const hasMonthNav = agenda.includes('setActiveMonth') && (agenda.includes('onClick={() => setActiveMonth') || agenda.includes('handlePrevMonth') || agenda.includes('handleNextMonth'));
      if (!hasMonthNav) return { pass: false, message: '❌ Navegação de meses ainda sem handlers' };
      return { pass: true, message: '✅ Navegação de meses funcional' };
    },
  },
  {
    id: 'NOX-025',
    severity: 'MEDIUM',
    description: 'LeadershipRoom botão "Histórico de Mandatos" sem handler',
    check: () => {
      const leadership = readFile(resolve(ROOT, 'src/components/LeadershipRoom.tsx'));
      const hasHandler = leadership.includes('Histórico de Mandatos') && (
        leadership.includes('onClick') || leadership.includes('handleHistory')
      );
      if (!hasHandler) return { pass: false, message: '❌ Botão "Histórico de Mandatos" sem handler' };
      return { pass: true, message: '✅ Botão "Histórico de Mandatos" com handler' };
    },
  },
  {
    id: 'NOX-026',
    severity: 'MEDIUM',
    description: 'Mídia externa sem fallback',
    check: () => {
      const members = readFile(resolve(ROOT, 'src/components/MembersRoom.tsx'));
      const hasExternalUrl = members.includes('transparenttextures.com');
      if (!hasExternalUrl) return { pass: true, message: '✅ URL externa removida' };
      // If still there, check if there's a fallback
      return { pass: false, message: '❌ Imagem externa ainda sem fallback' };
    },
  },
  {
    id: 'NOX-027',
    severity: 'MEDIUM',
    description: 'SettingsRoom "Salvar Alterações" sem handler',
    check: () => {
      const settings = readFile(resolve(ROOT, 'src/components/SettingsRoom.tsx'));
      const hasSaveHandler = settings.includes('Salvar Alterações') || settings.includes('Salvar') || settings.includes('Guardar');
      const hasOnClick = settings.includes('onClick') && (settings.includes('handleSave') || settings.includes('onSave') || settings.includes('alert('));
      if (!hasOnClick) return { pass: false, message: '❌ Botão "Salvar" sem handler funcional' };
      return { pass: true, message: '✅ Botão "Salvar" com handler' };
    },
  },
  {
    id: 'NOX-028',
    severity: 'MEDIUM',
    description: 'UsersRoom delete sem confirmação',
    check: () => {
      const users = readFile(resolve(ROOT, 'src/components/UsersRoom.tsx'));
      const hasDeleteHandler = users.includes('handleDelete') || users.includes('deleteUser') || users.includes('removeUser');
      const hasConfirmation = users.includes('confirm') || users.includes('confirma') || users.includes('temCerteza') || users.includes('deleteConfirm');
      if (!hasDeleteHandler || !hasConfirmation) return { pass: false, message: '❌ Delete sem handler e/ou confirmação' };
      return { pass: true, message: '✅ Delete com handler e confirmação' };
    },
  },

  // =============================================
  // FASE D — LOW PRIORITY
  // =============================================
  {
    id: 'NOX-029',
    severity: 'LOW',
    description: 'gold-gradient naming consistency',
    check: () => {
      const css = readFile(resolve(ROOT, 'src/index.css'));
      const hasGradient = css.includes('.gold-gradient');
      if (!hasGradient) return { pass: true, message: '✅ gold-gradient removida/renomeada' };
      return { pass: true, message: '⚠️ gold-gradient mantém-se (aceitável)' };
    },
  },
  {
    id: 'NOX-030',
    severity: 'LOW',
    description: 'Toast sem múltiplos empilhamento',
    check: () => {
      const toast = readFile(resolve(ROOT, 'src/lib/toastStore.ts'));
      const hasMultipleToasts = toast.includes('toasts') || toast.includes('Toast[]') || toast.includes('messages');
      if (!hasMultipleToasts) return { pass: false, message: '❌ Toast ainda não suporta múltiplos' };
      return { pass: true, message: '✅ Toast suporta múltiplos empilhados' };
    },
  },
  {
    id: 'NOX-031',
    severity: 'LOW',
    description: 'API key exposta no client bundle',
    check: () => {
      const viteConfig = readFile(resolve(ROOT, 'vite.config.ts'));
      const hasExpose = viteConfig.includes('GEMINI_API_KEY') && viteConfig.includes('define');
      if (hasExpose) return { pass: false, message: '❌ GEMINI_API_KEY ainda exposta no bundle' };
      return { pass: true, message: '✅ API key não exposta no bundle' };
    },
  },
];

// =============================================
// EXECUTION
// =============================================

console.log('╔═══════════════════════════════════════════════╗');
console.log('║    NOX — SCRIPT FISCALIZADOR v1.0            ║');
console.log('╚═══════════════════════════════════════════════╝');
console.log('');
console.log(`A verificar ${checks.length} issues...`);
console.log('');

const results: { id: string; severity: string; pass: boolean; message: string }[] = [];

for (const check of checks) {
  const result = check.check();
  results.push({ id: check.id, severity: check.severity, ...result });
  
  if (result.pass) {
    passCount++;
  } else {
    failCount++;
  }
}

// Print results grouped by severity
const severities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
for (const sev of severities) {
  const sevResults = results.filter(r => r.severity === sev);
  const failedSev = sevResults.filter(r => !r.pass);
  if (failedSev.length > 0) {
    console.log(`\n━━━ ${sev} (${failedSev.length} falhas) ━━━`);
    for (const r of failedSev) {
      console.log(`  ${r.id}: ${r.message}`);
    }
  }
}

// Summary
console.log('\n╔═══════════════════════════════════════════════╗');
console.log('║              RESULTADO FINAL                 ║');
console.log('╚═══════════════════════════════════════════════╝');
console.log(`  Total: ${checks.length} checks`);
console.log(`  ✅ Pass: ${passCount}`);
console.log(`  ❌ Fail: ${failCount}`);
console.log('');

if (failCount > 0) {
  const criticalFails = results.filter(r => !r.pass && r.severity === 'CRITICAL');
  if (criticalFails.length > 0) {
    console.log(`🔴 CRÍTICO: ${criticalFails.length} falhas críticas — IMPLEMENTAÇÃO REPROVADA`);
  }
  console.log('');
  console.log('⚠️  Devem ser corrigidas TODAS as falhas antes de re-auditar.');
  process.exit(1);
} else {
  console.log('✅ TODAS AS CHECKS PASSARAM — IMPLEMENTAÇÃO APROVADA');
  process.exit(0);
}
