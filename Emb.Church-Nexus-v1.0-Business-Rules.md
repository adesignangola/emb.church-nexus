EMB.CHURCH NEXUS
Sistema Integrado de Gestão de Igreja

REGRAS DE NEGÓCIO
Versão 1.0 — Especificação Funcional Completa
Confidencial · Uso Interno

---

## 1. Introdução e Âmbito

Este documento descreve as regras de negócio que governam o comportamento do sistema Emb.Church Nexus. Cada regra define uma condição, restrição ou procedimento que deve ser respeitado em todas as circunstâncias, independentemente da interface de acesso ou do utilizador autenticado. As regras aqui definidas têm precedência sobre qualquer decisão de implementação técnica.

As regras de negócio estão organizadas por domínio funcional. Cada regra é identificada por um código único composto pelo prefixo do domínio e um número sequencial (ex: AC-001 para Controlo de Acesso, número 001). Qualquer alteração a uma regra de negócio deve ser documentada com versão, data e justificação.

---

## 2. Controlo de Acesso e Papéis (AC)

O sistema de controlo de acesso é o alicerce de segurança de toda a plataforma. Nenhuma excepção às regras abaixo é permitida, incluindo utilizadores com papel de Administrador, salvo onde explicitamente indicado.

### 2.1 Regras de Autenticação

| ID | Regra de Negócio | Descrição |
|----|------------------|-----------|
| AC-001 | Registo exclusivamente por convite | Não existe registo público no sistema. Todos os utilizadores são criados pelo Administrador ou convidados por link seguro gerado pelo sistema. Qualquer acesso sem credenciais válidas é rejeitado. |
| AC-002 | Associação obrigatória a uma organização | Todo o utilizador pertence a exactamente uma organização (church_id). Não existe utilizador sem organização associada. A tentativa de acesso sem associação a uma organização válida resulta em rejeição imediata. |
| AC-003 | Sessão e renovação de token | As sessões são geridas pelo Supabase Auth com renovação automática de token JWT. Quando a sessão expira, o utilizador é redirecionado para o ecrã de entrada sem perda de dados não guardados. |
| AC-004 | Recuperação de acesso | A recuperação de acesso é feita exclusivamente via email com link seguro gerado pelo Supabase Auth. Não existe recuperação por telefone ou por intervenção directa de outro utilizador. |

### 2.2 Regras de Papéis e Permissões

| ID | Regra de Negócio | Descrição |
|----|------------------|-----------|
| AC-005 | Seis papéis base do sistema | O sistema define exactamente seis papéis base: Administrador do Sistema, Pastor, Secretária, Tesoureiro, Líder de Departamento, e Membro. Não existe acesso ao sistema fora destes papéis. |
| AC-006 | Implementação ao nível do banco de dados | As permissões são implementadas ao nível do Row Level Security (RLS) do PostgreSQL. A validação no cliente ou na Edge Function é complementar e nunca substitui o RLS. |
| AC-007 | Exclusividade das notas do pastor | As notas pastorais, os sermões e as anotações pessoais do pastor são acessíveis exclusivamente pelo utilizador com papel Pastor. Nenhum outro papel — incluindo o Administrador — tem acesso a este conteúdo. |
| AC-008 | Acesso financeiro restrito | Os dados financeiros detalhados são acessíveis pelo Tesoureiro e pelo Pastor. A Secretária vê os dados financeiros globais de cultos apenas se tiver autorização específica configurada pelo Administrador. Os Líderes de Departamento e os Membros não têm acesso a dados financeiros da igreja. |
| AC-009 | Isolamento por organização | Um utilizador só pode aceder a dados onde o campo church_id corresponde ao identificador da sua organização. O cruzamento de dados entre organizações é impossível ao nível do RLS. |
| AC-010 | Criação e gestão de utilizadores | Apenas o Administrador pode criar, editar, desactivar e convidar utilizadores. A desactivação de um utilizador revoga imediatamente o seu acesso sem eliminar os seus registos históricos. |

> **REGRA CRÍTICA** — O RLS do PostgreSQL é a única garantia de isolamento de dados aceite pelo sistema. Nenhuma lógica de autorização implementada no cliente ou nas Edge Functions dispensa a política RLS correspondente na base de dados.

---

## 3. Gestão de Membros e Visitantes (MB)

### 3.1 Regras do Cadastro de Membros

| ID | Regra de Negócio | Descrição |
|----|------------------|-----------|
| MB-001 | Imutabilidade do registo de membro | Membros não são eliminados do sistema. Quando um membro deixa a comunidade, o seu registo é arquivado com data e razão (transferência, desligamento, falecimento ou outro). O histórico permanece consultável. |
| MB-002 | Estado do membro | Um membro pode estar em um de quatro estados: Activo, Inactivo, Transferido ou Falecido. A transição entre estados é sempre registada com data e utilizador responsável. |
| MB-003 | Flag de dizimista | A flag de dizimista é um campo informativo no perfil do membro. A sua activação ou desactivação é feita manualmente pelo Tesoureiro ou pela Secretária. O sistema não activa nem desactiva esta flag automaticamente com base em registos financeiros. |
| MB-004 | Notas pastorais restritas | O campo de notas pastorais no perfil do membro é visível exclusivamente pelo Pastor e pelo Administrador. A sua edição é possível apenas pelo Pastor. |
| MB-005 | Importação em massa com validação | A importação de membros por ficheiro CSV é validada campo a campo antes de qualquer inserção. Os erros são reportados linha a linha. A inserção definitiva exige confirmação explícita do utilizador após a revisão dos erros. |
| MB-006 | Foto de perfil no Storage | As fotografias de membros são armazenadas no Supabase Storage. O cliente nunca carrega a fotografia directamente — usa o URL público gerado pelo Storage. |

### 3.2 Regras de Visitantes

| ID | Regra de Negócio | Descrição |
|----|------------------|-----------|
| MB-007 | Entidade distinta do membro | Um visitante é uma entidade distinta de um membro com o seu próprio ciclo de vida: Novo → Contactado → A Acompanhar → Em Discipulado → Convertido em Membro. |
| MB-008 | Conversão de visitante em membro | A conversão de visitante em membro é uma operação única e irreversível que transfere os dados do visitante para a tabela de membros e cria automaticamente o registo de recepção. O registo de visitante é mantido como histórico com estado Convertido. |
| MB-009 | Rastreabilidade do acompanhamento | Cada transição de estado de um visitante é registada com data e identificador do responsável pelo acompanhamento. O sistema notifica a secretaria e os departamentos responsáveis a cada transição. |

---

## 4. Cultos, Presenças e Frequência (CP)

| ID | Regra de Negócio | Descrição |
|----|------------------|-----------|
| CP-001 | Pertença ao ciclo mensal | Cada culto pertence a um mês de referência. O mês de referência é determinado pela data do culto e não pode ser alterado após o encerramento do ciclo mensal correspondente. |
| CP-002 | Dados financeiros do culto | O valor da oferta recolhida num culto é registado no formulário de culto e gera automaticamente um lançamento financeiro de entrada na categoria Oferta Geral. O lançamento financeiro correspondente é criado pelo sistema — o Tesoureiro não precisa de o criar manualmente. |
| CP-003 | Registo de presença em massa | O registo de presença de múltiplos membros num culto é processado pela Edge Function process-attendance-bulk. Não são permitidas múltiplas chamadas individuais à base de dados para o mesmo culto. |
| CP-004 | Estados de presença | Cada registo de presença tem um de três estados: Presente, Justificado ou Ausente. O estado padrão para membros não marcados num culto é Ausente — não é registado se a secretaria não processar a lista. |
| CP-005 | Alerta de absentismo | O sistema gera automaticamente um alerta no dashboard quando um membro activo não está registado como presente em três ou mais cultos consecutivos. O alerta é visível pelo Pastor e pela Secretária. |
| CP-006 | Departamento Infantil | As presenças de crianças são registadas num sistema paralelo ao dos membros adultos, com associação obrigatória a um grupo infantil e a um responsável adulto cadastrado. A ausência de responsável válido impede o registo. |

---

## 5. Módulo Financeiro (FN)

O módulo financeiro opera com dois princípios absolutos e inegociáveis: completude de registo e imutabilidade. Qualquer excepção a estes princípios constitui uma violação grave das regras de negócio do sistema.

### 5.1 Regras de Lançamentos

| ID | Regra de Negócio | Descrição |
|----|------------------|-----------|
| FN-001 | Imutabilidade dos registos financeiros | Nenhum registo financeiro é eliminado. A anulação de um lançamento exige motivo obrigatório e gera um registo de auditoria. O lançamento anulado permanece visível com estado Anulado. |
| FN-002 | Categorias de entrada fixas | As entradas são classificadas em quatro categorias fixas: Dízimo, Oferta Geral, Oferta Especial e Doação. Não é possível criar entradas sem categoria. |
| FN-003 | Categorias de saída fixas | As saídas são classificadas em quatro categorias fixas: Despesa Operacional, Despesa de Evento, Salário ou Ajuda de Custo, e Despesa Extraordinária. A Despesa Extraordinária exige campo de justificação preenchido. |
| FN-004 | Associação de dízimo a membro | O Dízimo pode ser associado a um membro identificado. Esta associação gera o historial individual de fidelidade dízimal do membro. A associação é opcional — um dízimo pode ser registado sem membro identificado. |
| FN-005 | Comprovante no Storage | Cada lançamento financeiro pode ter um comprovante anexo (fotografia ou PDF) armazenado no Supabase Storage. O comprovante é associado ao registo pela sua URL e é visualizável directamente na ficha do lançamento. |
| FN-006 | Registo de responsável | Todo o lançamento financeiro regista o identificador do utilizador que o criou. Este campo não é editável após a criação. |
| FN-007 | Saldo calculado | O saldo de caixa é calculado em tempo real como a diferença cumulativa entre todas as entradas e saídas com estado Confirmado. Lançamentos com estado Pendente ou Anulado não contribuem para o saldo. |
| FN-008 | Pertença ao ciclo mensal | Cada lançamento financeiro pertence ao mês determinado pela sua data. O mês de referência não pode ser alterado após o encerramento do ciclo mensal. |

### 5.2 Regras de Controlo e Auditoria Financeira

| ID | Regra de Negócio | Descrição |
|----|------------------|-----------|
| FN-009 | Aprovação de lançamentos | Lançamentos criados com estado Pendente devem ser confirmados pelo Tesoureiro. Um lançamento não confirmado não afecta o saldo de caixa. |
| FN-010 | Rastreabilidade de anulações | A anulação de um lançamento exige: motivo obrigatório (campo de texto livre), identificador do utilizador que anula, e timestamp. Estes dados são preservados na tabela audit_log. |
| FN-011 | Acesso ao histórico financeiro de membro | O historial financeiro de um membro (dízimos e ofertas associados) é visível apenas para utilizadores com papel Tesoureiro ou Pastor, mediante autorização activa na ficha do membro. |

> **PRINCÍPIO ABSOLUTO** — Nenhum centavo entra ou sai da contabilidade do sistema sem um registo correspondente com categoria, data, valor, responsável e estado. A eliminação de registos financeiros é tecnicamente impossível ao nível do RLS.

---

## 6. Departamentos e Estrutura Organizacional (DP)

| ID | Regra de Negócio | Descrição |
|----|------------------|-----------|
| DP-001 | Líder responsável obrigatório | Todo o departamento activo deve ter um líder responsável identificado. Um departamento sem líder gera um alerta no painel de alertas do dashboard. |
| DP-002 | Acesso restrito do líder | O Líder de Departamento acede apenas ao painel do seu departamento. Não tem acesso a dados financeiros globais, a outros departamentos nem à área do pastor. |
| DP-003 | Archivamento de departamentos | Departamentos não são eliminados — são arquivados. O arquivamento regista a data e o utilizador responsável. Os dados históricos de um departamento arquivado são preservados e consultáveis. |
| DP-004 | Membros em múltiplos departamentos | Um membro pode pertencer a múltiplos departamentos simultaneamente. O departamento principal é o identificado na ficha do membro; os restantes são associações secundárias. |
| DP-005 | Registo de actividades | As actividades de cada departamento são registadas com data, descrição e número de participantes. O registo é feito pelo Líder ou pela Secretária. Cada actividade pertence ao mês da sua data. |

---

## 7. Agenda do Pastor e Marcações (AG)

| ID | Regra de Negócio | Descrição |
|----|------------------|-----------|
| AG-001 | Criação exclusiva pela secretaria | Marcações com o pastor são criadas exclusivamente pela Secretária. O Pastor não cria marcações directamente — gere apenas a sua disponibilidade. |
| AG-002 | Verificação de disponibilidade | O sistema verifica automaticamente a disponibilidade do pastor antes de confirmar qualquer marcação, considerando os blocos declarados e as marcações já existentes. Não é possível criar uma marcação num slot bloqueado ou já ocupado. |
| AG-003 | Blocos de agenda pelo pastor | O Pastor pode bloquear dias inteiros ou intervalos de dias inserindo registos na tabela pastor_blocks. Os blocos são imediatamente reflectidos no calendário da secretaria e impedem novas marcações nessas datas. |
| AG-004 | Notificação automática ao membro | Quando uma marcação é confirmada, o sistema envia automaticamente uma notificação ao membro via WhatsApp com os detalhes da marcação (data, hora, duração estimada). |
| AG-005 | Cancelamento com notificação | O cancelamento de uma marcação pelo Pastor exige registo de motivo e dispara automaticamente uma notificação ao membro afectado via WhatsApp. |
| AG-006 | Lembrete automático | O sistema envia automaticamente um lembrete ao membro via WhatsApp vinte e quatro horas antes de cada marcação com estado Confirmada. O lembrete é gerado pela Edge Function send-appointment-reminder executada de hora a hora. |
| AG-007 | Notas do pastor restritas | As notas do pastor sobre uma marcação são visíveis exclusivamente pelo utilizador com papel Pastor. A Secretária pode ver o motivo declarado pelo membro, mas não as notas do pastor. |

---

## 8. Módulo de Comunicação (CM)

A comunicação é um princípio arquitectónico do sistema: toda a mensagem enviada a membros, visitantes ou líderes através do sistema fica registada com data, remetente, canal e estado de entrega.

| ID | Regra de Negócio | Descrição |
|----|------------------|-----------|
| CM-001 | Rastreabilidade total | Não existem mensagens enviadas fora do sistema que não fiquem registadas. Toda a comunicação oficial da igreja passa pelo módulo de comunicação e fica persistida na tabela communications. |
| CM-002 | Chaves de API nunca expostas ao cliente | As chamadas à API do WhatsApp Business e ao serviço de email transaccional são feitas exclusivamente pelas Edge Functions do Supabase. Nenhuma chave de API é exposta ao cliente em nenhuma circunstância. |
| CM-003 | Estado de entrega actualizado por webhook | O estado de entrega de cada mensagem WhatsApp é actualizado automaticamente por webhook quando o WhatsApp reporta entrega, leitura ou falha. O registo na tabela communications é actualizado sem intervenção do utilizador. |
| CM-004 | Templates aprovados para transaccionais | As comunicações automáticas do sistema (confirmação de marcação, lembrete de evento, aniversário) utilizam templates de mensagem aprovados pela API do WhatsApp Business. Não é possível enviar mensagens automáticas com templates não aprovados. |
| CM-005 | Personalização automática | As mensagens em grupo incluem personalização automática do nome do destinatário. O sistema substitui a variável de nome antes do envio — não existe envio de mensagem em grupo sem personalização. |
| CM-006 | Campanhas programadas | As campanhas programadas são criadas com destinatários, mensagem e data/hora de envio definidos no momento da criação. A execução é feita automaticamente pelo cron job do Supabase na data e hora definidas. |
| CM-007 | Aniversários automáticos | O sistema verifica diariamente os aniversários na tabela members e envia a saudação automática de acordo com a preferência de canal do membro. O envio é registado na tabela communications com o template utilizado. |

---

## 9. Escala do Culto (EC)

| ID | Regra de Negócio | Descrição |
|----|------------------|-----------|
| EC-001 | Verificação de conflito | O sistema verifica se um membro já está alocado a outra função no mesmo culto antes de confirmar uma alocação. Em caso de conflito, o sistema alerta e impede a alocação duplicada. |
| EC-002 | Notificação automática na publicação | A publicação da escala dispara automaticamente o envio de uma mensagem WhatsApp a cada membro alocado com a sua função, data e hora. A publicação sem notificação não é permitida. |
| EC-003 | Confirmação pelo membro | Cada membro alocado pode confirmar ou pedir substituição. O estado de confirmação é actualizado em tempo real na tabela service_schedules e visualizável pela Secretária. |
| EC-004 | Filtragem por departamento | A lista de membros disponíveis para cada função é filtrada pelos membros do departamento correspondente. A alocação de um membro fora do departamento da função requer autorização explícita da Secretária. |

---

## 10. Escolas Espirituais (ES)

O sistema integra três escolas formais: Escola de Batismo, Discipulado e Face a Face com Deus. As regras abaixo aplicam-se a todas as escolas, salvo indicação em contrário.

### 10.1 Regras Comuns a Todas as Escolas

| ID | Regra de Negócio | Descrição |
|----|------------------|-----------|
| ES-001 | Notificação de inscrição | A inscrição de um aluno numa escola dispara automaticamente o envio de uma mensagem WhatsApp de confirmação com os detalhes da turma e a data da primeira aula. |
| ES-002 | Registo de presença em massa | O registo de presença em aulas é processado pela Edge Function process-attendance-bulk, tal como o registo de cultos. Não são permitidas chamadas individuais por aluno. |
| ES-003 | Certificado automático | Alunos com estado Concluído recebem automaticamente o certificado de conclusão gerado pela Edge Function generate-school-certificate, armazenado no Supabase Storage e enviado por email. |
| ES-004 | Estados de aluno | Um aluno pode estar em um de quatro estados numa turma: Em Curso, Concluído, Em Recuperação ou Reprovado. O encerramento formal da turma pelo instrutor é obrigatório antes de qualquer certificação. |
| ES-005 | Comentários do instrutor restritos | Os comentários individuais do instrutor sobre cada aluno são visíveis apenas pelo instrutor e pelo Pastor. O aluno não tem acesso aos comentários do seu instrutor. |

### 10.2 Regras Específicas — Face a Face com Deus

| ID | Regra de Negócio | Descrição |
|----|------------------|-----------|
| ES-006 | Auto-relato voluntário e privado | O aluno pode registar no seu perfil as suas percepções e experiências em cada aula. Este campo é voluntário, privado, e o instrutor pode consultá-lo apenas para enriquecer o acompanhamento — não para avaliação. |
| ES-007 | Escala qualitativa de crescimento | O crescimento espiritual de cada aluno é registado numa escala qualitativa de três níveis: Emergindo, Em Crescimento, Estabelecido. Esta escala não é convertida em nota numérica em nenhuma circunstância. |

### 10.3 Regras de Discipulado

| ID | Regra de Negócio | Descrição |
|----|------------------|-----------|
| ES-008 | Trilhas configuradas pelo pastor | As trilhas de discipulado são definidas pelo Pastor ou Administrador nas Definições. O sistema não armazena o conteúdo dos recursos — referencia-os externamente por URL. |
| ES-009 | Actualização do nível de membro | Quando uma trilha de discipulado é concluída, o nível de discipulado no perfil do membro é actualizado automaticamente pelo sistema. |
| ES-010 | Notificação ao mentor | O mentor recebe uma notificação automática via WhatsApp quando um novo aluno lhe é atribuído numa trilha de discipulado. |

---

## 11. Departamento Infantil (DI)

A segurança das crianças é um princípio irrenunciável deste módulo. Nenhuma excepção às regras de segurança abaixo é permitida.

| ID | Regra de Negócio | Descrição |
|----|------------------|-----------|
| DI-001 | Responsável adulto obrigatório | Toda a criança cadastrada no sistema deve ter pelo menos um responsável adulto identificado — membro cadastrado com contacto válido. O registo de uma criança sem responsável válido é impedido pelo sistema. |
| DI-002 | Entrega exclusiva ao responsável registado | Nenhuma criança pode ser entregue a alguém que não esteja registado como responsável no momento da saída. O sistema regista hora de entrada e hora de saída com timestamps para cada criança. |
| DI-003 | Alerta de entrega a terceiro | Qualquer tentativa de registo de saída de uma criança para uma pessoa não registada como responsável gera um alerta imediato no painel da secretaria e um log de segurança na tabela audit_log. |
| DI-004 | Capacidade máxima de sala | O sistema alerta quando o número de crianças registadas numa sala excede a capacidade máxima configurada. O registo acima da capacidade máxima é possível, mas exige confirmação explícita da Secretária. |

---

## 12. Organograma e Liderança (OL)

| ID | Regra de Negócio | Descrição |
|----|------------------|-----------|
| OL-001 | Posições vagas como alerta | Uma posição no organograma pode existir sem membro alocado. Neste caso, aparece como Vaga no diagrama e gera automaticamente um alerta no painel de alertas do dashboard. |
| OL-002 | Historial de mandatos preservado | O historial de mandatos de cada posição é preservado indefinidamente na tabela org_chart_history. Quando um líder é substituído, o mandato anterior é encerrado com data de fim e motivo antes de o novo líder ser alocado. |
| OL-003 | Motivo de encerramento obrigatório | O encerramento de um mandato exige um motivo registado de entre as opções: Conclusão Natural, Pedido de Afastamento, Decisão Pastoral, ou Outro (com campo de texto livre obrigatório). |
| OL-004 | Notificação ao novo líder | Quando um novo líder é alocado a uma posição, o sistema envia automaticamente uma notificação via WhatsApp confirmando a alocação ao cargo. |
| OL-005 | Alerta de presença de líderes | O sistema gera automaticamente um alerta para o Pastor quando um líder activo tem presença abaixo de 50% nos cultos nos últimos noventa dias. |
| OL-006 | Exportação do organograma | O diagrama de organograma é exportável em PDF com o estado actual, gerado pela Edge Function generate-export. A exportação regista a data e o utilizador que solicitou. |

---

## 13. Gestão de Eventos (EV)

| ID | Regra de Negócio | Descrição |
|----|------------------|-----------|
| EV-001 | Aparecimento automático na agenda | Após a criação de um evento, este aparece automaticamente na agenda anual e no bloco de próximos eventos do dashboard. Não é necessária nenhuma acção adicional para o tornar visível. |
| EV-002 | Controlo de capacidade | O sistema controla a capacidade máxima do evento. Quando a capacidade é atingida, o sistema alerta a Secretária. Inscrições acima da capacidade exigem confirmação explícita. |
| EV-003 | Confirmação automática de inscrição | Cada inscrição num evento gera automaticamente uma mensagem WhatsApp de confirmação ao inscrito com os detalhes do evento. |
| EV-004 | Encerramento formal obrigatório | O encerramento de um evento é um passo formal que exige o registo do número efectivo de presentes e a confirmação dos lançamentos financeiros associados. O sistema gera automaticamente o relatório de encerramento. |
| EV-005 | Relatório de encerramento | O relatório de encerramento do evento inclui obrigatoriamente o comparativo entre o orçamento previsto e o realizado. Este campo não pode ser omitido no encerramento. |

---

## 14. Relatórios, Análises e Balanço Mensal (RL)

| ID | Regra de Negócio | Descrição |
|----|------------------|-----------|
| RL-001 | Balanço mensal automático | No último dia de cada mês, o cron job do Supabase executa automaticamente a Edge Function generate-monthly-balance. O balanço mensal não depende de nenhuma acção de utilizador para ser gerado. |
| RL-002 | Dados reais sem excepção | Todos os relatórios são calculados a partir dos dados reais do Supabase. Não existem dados fictícios, estimados ou interpolados em nenhum relatório do sistema. |
| RL-003 | Cache de relatórios | Os relatórios já gerados são armazenados em cache na tabela reports_cache por seis horas. Pedidos dentro da janela de cache utilizam o relatório armazenado. Após seis horas, o relatório é recalculado. |
| RL-004 | Imutabilidade dos balanços fechados | O balanço de um mês encerrado não pode ser alterado. Correcções a dados de um mês fechado são registadas como rectificações no mês corrente com referência ao período corrigido. |
| RL-005 | Acesso por papel | Os relatórios financeiros detalhados são acessíveis apenas pelo Pastor e pelo Tesoureiro. A Secretária acede aos relatórios de frequência e de membros. Os Líderes de Departamento acedem apenas aos relatórios do seu departamento. |
| RL-006 | Exportação rastreada | Toda a exportação de dados (CSV, PDF) é gerada pela Edge Function generate-export e registada com identificador do utilizador, tipo de exportação, e timestamp. Os ficheiros são armazenados no Supabase Storage com URL temporário. |

---

## 15. Sistema de Auditoria e Logs (AU)

| ID | Regra de Negócio | Descrição |
|----|------------------|-----------|
| AU-001 | Geração por trigger PostgreSQL | Todo o registo de auditoria é gerado por triggers ao nível do PostgreSQL. Nenhuma operação sensível pode escapar ao log independentemente do canal de execução (cliente, Edge Function, ou cron job). |
| AU-002 | Imutabilidade dos logs | Os registos de auditoria não são editáveis nem elimináveis por nenhum utilizador do sistema, incluindo o Administrador. |
| AU-003 | Acesso exclusivo do administrador | O painel de logs é acessível exclusivamente pelo Administrador. |
| AU-004 | Três níveis de log | O sistema mantém três níveis de log: Operacional (criações, edições, anulações), Acesso (início e fim de sessão com dispositivo e hora), e Segurança (tentativas de acesso falhadas, alterações de papéis, operações fora do âmbito do papel). |
| AU-005 | Valor anterior e novo | Cada registo de auditoria preserva o valor anterior e o valor novo da entidade afectada em formato JSON. Esta informação é inviolável e permite a reconstrução do estado em qualquer ponto do tempo. |

---

## 16. Princípio do Ciclo Mensal (CM)

O Ciclo Mensal é um princípio arquitectónico transversal que atravessa todos os módulos do sistema. Cada dado pertence a um mês de referência. O encerramento do ciclo mensal é automático e irreversível.

| ID | Regra de Negócio | Descrição |
|----|------------------|-----------|
| CM-001 | Pertença de todos os dados | Cada culto, lançamento financeiro, actividade de departamento, registo de membro e visita pertence ao mês determinado pela sua data. Esta associação não pode ser alterada após o encerramento do ciclo. |
| CM-002 | Encerramento automático | O ciclo mensal é encerrado automaticamente no último dia de cada mês pelo cron job do Supabase. O encerramento consolida os dados, calcula os indicadores e gera o Balanço Mensal. |
| CM-003 | Balanço acessível | O Balanço Mensal gerado é acessível ao Pastor e à Liderança a qualquer momento após o encerramento. Não existe prazo de expiração para consulta de balanços históricos. |
| CM-004 | Nenhum mês sem análise | O sistema garante que nenhum mês passa sem o Balanço Mensal correspondente ser gerado. A ausência de Balanço Mensal para um mês encerrado é tratada como uma falha de sistema a ser resolvida pela equipa técnica. |

---

## 17. Disponibilidade e Progressive Web App (PW)

| ID | Regra de Negócio | Descrição |
|----|------------------|-----------|
| PW-001 | Funcionalidade básica offline | O sistema opera como Progressive Web App com um Service Worker que garante funcionamento básico com conectividade limitada. As operações que requerem acesso ao Supabase são diferidas até a conectividade ser restabelecida. |
| PW-002 | Supabase como única fonte de verdade | Não existe armazenamento local como fonte de verdade em nenhuma fase do sistema. O Supabase é a única fonte de verdade em todos os módulos e em todas as fases. |
| PW-003 | Optimistic UI com reversão garantida | As operações mais frequentes (criação de membros, registo de presenças, marcações) utilizam Optimistic UI: o estado é actualizado imediatamente na interface e confirmado no Supabase em segundo plano. Qualquer falha reverte o estado com notificação não intrusiva. |
| PW-004 | Notificações push | O sistema suporta notificações push via Service Worker mesmo quando o browser não está em primeiro plano. As notificações push são utilizadas para alertas de marcações, escalas e alertas do dashboard. |

---

## 18. Glossário de Termos

| Termo | Definição |
|-------|-----------|
| Ciclo Mensal | Período de um mês calendário que agrupa todos os dados e operações registadas nesse período. O encerramento do ciclo é automático e irreversível. |
| church_id | Identificador único da organização (igreja) a que um registo pertence. Presente em todas as tabelas do sistema. Garante o isolamento total de dados entre organizações. |
| Edge Function | Função de servidor executada na infraestrutura do Supabase, utilizada para lógica que não deve correr no cliente (envio de mensagens, integrações externas, geração de relatórios). |
| Membro | Pessoa formalmente registada como membro da comunidade. Tem perfil completo, historial de presenças, e pode ser associado a departamentos e escalas. |
| Papel (Role) | Conjunto de permissões associado a um utilizador que define o que pode ver, criar, editar e aprovar no sistema. Implementado ao nível do RLS do PostgreSQL. |
| RLS | Row Level Security. Mecanismo nativo do PostgreSQL que restringe o acesso a linhas individuais de uma tabela com base em políticas definidas. É a garantia de segurança fundamental do sistema. |
| Visitante | Pessoa que visitou a comunidade mas que ainda não é membro. Tem ciclo de vida próprio e acompanhamento dedicado. Pode ser convertida em membro por uma operação específica e irreversível. |
| Balanço Mensal | Relatório consolidado gerado automaticamente no final de cada mês com todos os indicadores da vida da igreja naquele período. |
| Optimistic UI | Padrão de interface em que a actualização visual é imediata, sem esperar pela confirmação do servidor. Em caso de falha, o estado é revertido automaticamente. |

---

*Emb.Church Nexus · Regras de Negócio v1.0 · Documento Confidencial*

*Toda a alteração a este documento deve ser versionada, datada e aprovada pela liderança técnica e pastoral.*
