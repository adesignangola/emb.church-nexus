# Emb.Church Nexus — Sistema Integrado de Gestão de Igreja
**Versão do Documento: 1.0 — Arquitectura e Especificação Completa**

---

## 1. VISÃO GERAL DO PRODUTO

O Emb.Church Nexus é um sistema de gestão integrada de igrejas, concebido para eliminar a fragmentação operacional que caracteriza a maioria das comunidades religiosas: dados espalhados por cadernos, folhas de cálculo desconexas, comunicação por mensagens informais sem registo, e decisões tomadas sem base factual. O sistema não é um conjunto de ferramentas avulsas — é uma plataforma unificada onde cada módulo alimenta os outros, onde cada dado registado contribui para o quadro completo da vida da igreja, e onde a liderança tem, pela primeira vez, visibilidade real e actualizada sobre tudo o que acontece na comunidade, nos departamentos, nas finanças e na vida espiritual dos membros.

O manifesto central do Emb.Church Nexus assenta em quatro compromissos fundamentais. O primeiro é a recolha de dados com intenção: cada formulário, cada registo, cada entrada financeira é desenhado para capturar informação útil com o mínimo de esforço e o máximo de precisão. O segundo é a comunicação com rastreabilidade: toda a mensagem enviada a membros, a visitantes ou a líderes de departamentos passa pelo sistema e fica registada com data, remetente e estado de entrega. O terceiro é a decisão informada: o dashboard e os relatórios transformam dados dispersos em padrões visíveis que permitem ao pastor e à liderança saber exactamente onde a igreja está, como cresceu, onde tem lacunas e para onde se move. O quarto é o balanço periódico: no final de cada mês, o sistema entrega automaticamente um relatório consolidado de tudo o que aconteceu — finanças, crescimento, frequência, eventos e actividade espiritual — para que nenhum mês passe sem análise e nenhuma decisão seja tomada no escuro.

A experiência visual do sistema é sóbria, institucional e confiável. O azul escuro estrutura os elementos de navegação e hierarquia. O dourado marca a identidade, os destaques e as acções principais. O branco domina os espaços de trabalho e os formulários. A tipografia é clara, legível e sem ornamentação desnecessária. Não existe decoração sem função e não existe informação sem contexto. A interface é concebida primariamente para desktop — onde secretárias e administradores passam a maior parte do seu tempo operacional — com responsividade completa para dispositivos móveis, reconhecendo que pastores e líderes de departamentos consultam e actualizam o sistema em movimento.

O Emb.Church Nexus é construído com Supabase como plataforma de backend completa desde o primeiro dia, fornecendo autenticação, base de dados PostgreSQL com Row Level Security, Edge Functions, armazenamento de ficheiros e sincronização em tempo real via Realtime. A camada de comunicação integra a API do WhatsApp Business e um serviço de email transaccional para envio programático de mensagens. O frontend é construído com React 19, TypeScript e Vite, com Tailwind CSS para estilo, Radix UI para acessibilidade e Zustand para gestão de estado. Não existe armazenamento local como fonte de verdade — o Supabase é a única fonte de verdade do sistema, em todas as fases, em todos os módulos.

---

## 2. ARQUITECTURA BASE E CONCEITOS TRANSVERSAIS

O sistema organiza-se em torno de uma igreja autenticada com um perfil institucional configurado no momento do primeiro acesso através de um processo de configuração inicial obrigatório. Todos os dados — membros, finanças, cultos, departamentos, eventos, comunicações — pertencem a essa entidade, estão persistidos no Supabase com isolamento total por identificador de igreja, e são acessíveis apenas pelos utilizadores com sessão activa e com o papel adequado dentro dessa organização.

O conceito de Papel de Utilizador é transversal a todo o sistema. Um papel define o que cada utilizador pode ver, criar, editar e aprovar dentro da plataforma. O sistema define seis papéis base: Administrador do Sistema, com acesso irrestrito a todos os módulos e definições; Pastor, com acesso à sua área dedicada, aos relatórios completos, às finanças e às comunicações; Secretária, com acesso operacional à gestão de membros, agenda, escalas, registos de culto e marcações; Tesoureiro, com acesso exclusivo à gestão financeira, lançamentos, relatórios financeiros e comprovantes; Líder de Departamento, com acesso restrito ao seu departamento, aos seus membros e às suas actividades; e Membro, com acesso à sua ficha pessoal, à agenda pública e aos módulos espirituais a que estiver inscrito. Os papéis são configuráveis pelo Administrador e implementados ao nível do Row Level Security do Supabase, não ao nível do cliente.

O conceito de Ciclo Mensal é um princípio arquitectónico que atravessa todos os módulos. O sistema pensa em termos de meses: cada culto pertence a um mês, cada registo financeiro pertence a um mês, cada actividade de departamento pertence a um mês. No final de cada mês, o sistema fecha o ciclo automaticamente, consolida os dados, calcula os indicadores e gera o Balanço Mensal — um documento estruturado que resume o estado da igreja naquele período e é acessível ao pastor e à liderança a qualquer momento.

O conceito de Visitante é tratado como uma entidade distinta da entidade Membro. Um visitante tem o seu próprio registo, o seu próprio estado de acompanhamento, e um ciclo de vida definido: visitou, foi contactado, voltou a visitar, iniciou discipulado, tornou-se membro. O sistema acompanha este percurso e notifica a secretaria e os departamentos responsáveis a cada transição, garantindo que nenhum visitante é perdido por falta de seguimento.

A Responsabilidade é um princípio arquitectónico do sistema. Toda a acção de um utilizador é registada no Supabase com data, hora, identificador do utilizador e estado anterior. Registos financeiros não são eliminados — são anulados com registo de motivo. Membros não são apagados — são arquivados com data e razão. O Row Level Security garante que cada utilizador acede exclusivamente aos dados para os quais tem autorização, sem excepção, independentemente de qualquer lógica no cliente.

---

## 3. ARQUITECTURA TÉCNICA — SUPABASE, STACK E INTEGRAÇÕES

O sistema assenta em três pilares tecnológicos principais: o Supabase como plataforma de backend completa, a API do WhatsApp Business como motor de comunicação por mensagem, e um serviço de email transaccional para comunicações formais e notificações.

O Supabase fornece cinco camadas de infraestrutura. A primeira é a autenticação, gerida pelo Supabase Auth com suporte a email e senha, convites por link, e sessões persistentes com refresh automático de token JWT. A segunda é a base de dados PostgreSQL com Row Level Security activo em todas as tabelas, garantindo isolamento total de dados por organização e por papel de utilizador. A terceira é o Realtime, utilizado para sincronização instantânea de notificações, actualizações de agenda e alterações de estado entre múltiplos dispositivos e utilizadores da mesma organização. A quarta são as Edge Functions, utilizadas para lógica de servidor que não deve correr no cliente — envio de mensagens, geração de relatórios, integrações externas e cálculos financeiros complexos. A quinta é o Storage, utilizado para armazenar fotos de perfil de membros, documentos de eventos, comprovantes financeiros e conteúdos multimédia dos módulos espirituais.

A integração com o WhatsApp Business é feita através da API oficial do Meta, consumida exclusivamente pelas Edge Functions do Supabase. O sistema utiliza templates de mensagem aprovados para comunicações transaccionais — confirmação de marcação com o pastor, lembrete de evento, aniversário de membro, aviso de dízimo — e mensagens livres para comunicações personalizadas iniciadas pela secretaria ou pelo pastor. O histórico de todas as mensagens enviadas é persistido na tabela communications do Supabase, com estado de entrega actualizado por webhook.

O serviço de email transaccional — Resend ou equivalente — é consumido pelas mesmas Edge Functions e utilizado para comunicações mais formais: relatórios periódicos, convites de acesso ao sistema, boletins mensais e exportações de dados. Cada email enviado é registado na mesma tabela communications com o canal identificado.

O frontend é construído com React 19, TypeScript e Vite. O styling utiliza Tailwind CSS com a paleta institucional definida pelo produto. Os componentes base utilizam Radix UI para garantir acessibilidade sem impor estilos. A comunicação com o Supabase é feita através do cliente oficial supabase-js, com subscrições Realtime para notificações e actualizações em tempo real. O estado global da aplicação é gerido com Zustand, com stores que consomem directamente o Supabase como fonte de verdade. O sistema de gráficos do dashboard utiliza Recharts, com visualizações personalizadas para os dados financeiros, de frequência e de crescimento da comunidade.

O sistema implementa Optimistic UI para as operações mais frequentes da secretaria: criação de membros, registo de presenças e marcações de agenda. O estado Zustand é actualizado imediatamente na interface, a operação é confirmada no Supabase em segundo plano, e qualquer falha reverte o estado com uma notificação não intrusiva. Esta abordagem elimina a latência percebida sem comprometer a integridade dos dados.

O sistema é implementado como Progressive Web App, com um Service Worker que garante funcionamento básico com conectividade limitada e permite notificações push mesmo quando o browser não está em primeiro plano.

---

## 4. ESQUEMA DE BASE DE DADOS — SUPABASE

Todas as tabelas têm Row Level Security activo. A política base em todas as tabelas é: o utilizador autenticado só pode ler, criar, editar e eliminar registos onde o campo church_id corresponde ao identificador da sua organização e onde o seu papel lhe confere permissão para a operação em causa.

A tabela **churches** armazena o perfil institucional de cada organização: identificador, nome da igreja, denominação, morada, país, logótipo armazenado no Supabase Storage, NIF ou equivalente, contactos, tema do ano activo, e timestamps de criação e actualização.

A tabela **users** armazena os utilizadores com acesso ao sistema: identificador (referência à tabela auth.users do Supabase), identificador da igreja, nome completo, email, papel, foto de perfil, estado activo ou inactivo, e timestamps. Um utilizador pertence sempre a uma única igreja.

A tabela **members** armazena o cadastro completo de cada membro: identificador, identificador da igreja, nome completo, data de nascimento, género, estado civil, fotografia, contacto telefónico, email, morada, data de batismo, data de recepção como membro, estado do membro (activo, inactivo, transferido, falecido), identificador do departamento principal, identificador do grupo de célula se aplicável, nível de discipulado actual, flag de dizimista, notas pastorais de acesso restrito, e timestamps.

A tabela **visitors** armazena os registos de visitantes: identificador, identificador da igreja, nome, contacto, data da primeira visita, número de visitas, estado de acompanhamento (novo, contactado, a acompanhar, em discipulado, convertido em membro), identificador do responsável pelo acompanhamento, e notas.

A tabela **worship_services** armazena o registo de cada culto ou reunião: identificador, identificador da igreja, data, tipo de culto, pregador, tema, texto bíblico base, número de presentes membros, número de presentes visitantes, número de decisões, número de reconsagrações, oferta recolhida, notas gerais, e timestamps.

A tabela **attendance** armazena os registos de presença por culto: identificador do culto, identificador do membro ou visitante, tipo de presença (presente, justificado, ausente), e data do registo.

A tabela **financials** armazena cada transacção financeira: identificador, identificador da igreja, data, tipo (entrada ou saída), categoria, valor, moeda, referência do culto ou evento se aplicável, identificador do membro se aplicável, método de pagamento, descrição, comprovante armazenado no Supabase Storage, estado (pendente, confirmado, anulado), registado por qual utilizador, e timestamps.

A tabela **departments** armazena os departamentos da igreja: identificador, identificador da igreja, nome, descrição, identificador do líder responsável, estado activo, e timestamps.

A tabela **department_members** armazena a relação entre membros e departamentos: identificador do departamento, identificador do membro, papel dentro do departamento, data de entrada, e estado.

A tabela **department_activities** armazena as actividades registadas por cada departamento: identificador, identificador do departamento, título, data, descrição, número de participantes, observações, e timestamps.

A tabela **kids_groups** armazena os grupos e salas do departamento infantil: identificador, identificador da igreja, nome do grupo, faixa etária mínima e máxima, identificador do professor responsável, identificador da sala atribuída, capacidade máxima, estado activo, e timestamps.

A tabela **kids_attendance** armazena a presença das crianças por culto ou actividade: identificador do culto ou evento, identificador da criança ou membro, identificador do responsável, estado de presença, hora de entrada, hora de saída, e timestamps.

A tabela **org_chart** armazena cada posição do organograma: identificador, identificador da igreja, título do cargo, descrição do cargo, nível hierárquico, identificador da posição pai para construir a árvore, identificador do membro actualmente alocado, data de início do mandato, e timestamps.

A tabela **org_chart_history** armazena o historial de mandatos de cada posição: identificador da posição, identificador do membro, data de início, data de fim, motivo de encerramento, e timestamps.

A tabela **pastor_appointments** armazena as marcações de consulta ou reunião com o pastor: identificador, identificador da igreja, identificador do membro ou visitante, data e hora, duração estimada, motivo declarado, estado (pendente, confirmada, cancelada, concluída), notas do pastor de acesso restrito, registada por qual utilizador da secretaria, e timestamps.

A tabela **pastor_blocks** armazena os períodos em que o pastor bloqueou a agenda: identificador, identificador da igreja, data ou intervalo de datas, motivo opcional, e timestamp de criação.

A tabela **pastor_notes** armazena os sermões, anotações e esboços do pastor: identificador, identificador do pastor, título, tipo (sermão, esboço, anotação livre), conteúdo em formato de texto rico, data, tags, e timestamps.

A tabela **annual_agenda** armazena os eventos e marcos do calendário anual da igreja: identificador, identificador da igreja, ano, título do evento, data de início, data de fim, descrição, tipo, responsável, estado, e timestamps.

A tabela **themes** armazena os temas anuais e mensais: identificador, identificador da igreja, tipo (anual ou mensal), ano, mês se aplicável, título do tema, versículo base, descrição expandida, e timestamps.

A tabela **service_schedules** armazena as escalas de culto: identificador, identificador da igreja, data do culto, função, identificador do membro alocado, estado da confirmação, e timestamps.

A tabela **events** armazena os eventos organizados pela igreja: identificador, identificador da igreja, título, descrição, data de início, data de fim, local, capacidade, tipo de evento, estado, responsável, configuração financeira em formato JSON, e timestamps.

A tabela **event_participants** armazena as inscrições em eventos: identificador do evento, identificador do membro ou visitante, data de inscrição, estado de presença, e notas.

A tabela **school_classes** armazena as turmas das três escolas — Batismo, Discipulado e Face a Face com Deus: identificador, identificador da igreja, tipo de escola, nome da turma, identificador do instrutor, data de início, data de conclusão prevista, local ou modalidade, conteúdo programático em formato JSON, estado, e timestamps.

A tabela **school_subjects** armazena as matérias configuradas para cada escola: identificador, identificador da igreja, tipo de escola, título, descrição, número de aulas previstas, duração por aula, material de apoio referenciado por URL, ordem de apresentação, e timestamps.

A tabela **school_students** armazena a inscrição de cada aluno em cada turma: identificador da turma, identificador do membro ou visitante, data de inscrição, progresso por matéria em formato JSON, estado (em curso, concluído, em recuperação, reprovado), data de conclusão, notas do instrutor de acesso restrito, auto-relato do aluno de acesso privado, e timestamps.

A tabela **school_lessons** armazena cada aula realizada: identificador da turma, identificador da matéria, data, duração efectiva, conteúdo abordado, observações gerais do instrutor, e timestamps.

A tabela **school_attendance** armazena a presença por aula: identificador da aula, identificador do aluno, estado de presença, e timestamp.

A tabela **discipleship_tracks** armazena as trilhas de discipulado disponíveis: identificador, identificador da igreja, nome, nível, módulos em formato JSON, recursos associados por módulo em formato JSON, e timestamps.

A tabela **discipleship_progress** armazena o progresso de cada membro nas trilhas: identificador da trilha, identificador do membro, identificador do mentor, data de início, módulo actual, progresso percentual, notas do mentor, e timestamps.

A tabela **communications** armazena o histórico de todas as comunicações enviadas: identificador, identificador da igreja, canal, remetente, destinatários em formato JSON, assunto se email, conteúdo, template utilizado se aplicável, estado de envio, estado de entrega por destinatário em formato JSON, data de envio, e timestamps.

A tabela **notifications** armazena o histórico de notificações internas do sistema: identificador, identificador do utilizador destinatário, tipo, título, mensagem, prioridade, estado de leitura, URL de acção, e timestamp de criação.

A tabela **audit_log** armazena o registo de auditoria de todas as operações sensíveis: identificador da entidade afectada, tabela afectada, tipo de operação, valor anterior em formato JSON, valor novo em formato JSON, identificador do utilizador que executou a operação, e timestamp.

---

## 5. EDGE FUNCTIONS — SUPABASE

As Edge Functions são o intermediário obrigatório entre o frontend e todos os serviços externos. Nenhuma chave de API de serviço externo é exposta ao cliente em nenhuma circunstância.

A função **send-whatsapp** recebe o destinatário, o template ou mensagem livre, e os parâmetros de personalização, chama a API do WhatsApp Business, regista o envio e o estado de entrega na tabela communications, e devolve a confirmação ao cliente. Um webhook separado actualiza o estado de entrega quando o WhatsApp reporta leitura ou falha.

A função **send-email** recebe os destinatários, o assunto, o conteúdo HTML e os attachments opcionais, chama o serviço de email transaccional, regista o envio na tabela communications, e devolve a confirmação.

A função **generate-monthly-balance** é chamada automaticamente no último dia de cada mês por um cron job do Supabase. Recolhe todos os dados do mês — cultos realizados, presenças, decisões, movimentos financeiros, actividades de departamentos, eventos, novos membros, visitantes acompanhados — calcula os indicadores comparativos em relação ao mês anterior, e persiste o balanço na tabela reports_cache.

A função **generate-service-report** recebe os dados de um culto registado e devolve um sumário estruturado com os indicadores do culto e uma comparação com a média dos últimos três cultos do mesmo tipo.

A função **calculate-financial-summary** recebe um intervalo de datas e um contexto e devolve os totais por categoria, o comparativo com o período anterior, e a distribuição percentual por tipo de entrada e saída.

A função **send-birthday-greetings** é chamada diariamente por um cron job do Supabase, verifica os aniversários do dia na tabela members, e chama a função send-whatsapp ou send-email conforme a preferência configurada.

A função **send-appointment-reminder** é chamada de hora a hora por um cron job do Supabase, verifica as marcações nas próximas vinte e quatro horas com estado confirmada, e envia um lembrete ao membro via WhatsApp.

A função **process-attendance-bulk** recebe uma lista de identificadores de membros e o identificador do culto ou aula, e insere em massa os registos de presença, optimizando o processo de registo da secretaria e dos instrutores.

A função **generate-school-certificate** recebe o identificador do aluno e da turma, gera o certificado de conclusão em PDF com o nome do aluno, o nome da escola, a data de conclusão e a assinatura do pastor, armazena-o no Supabase Storage, e envia-o ao aluno por email.

A função **generate-export** recebe o tipo de exportação solicitado e o intervalo de datas, gera o ficheiro CSV ou PDF correspondente incluindo o diagrama de organograma se solicitado, e devolve o URL temporário do ficheiro armazenado no Supabase Storage.

---

## 6. MÓDULO DE AUTENTICAÇÃO E CONTROLO DE ACESSO

A autenticação é gerida integralmente pelo Supabase Auth. O sistema não tem registo público — os utilizadores são criados pelo Administrador ou convidados por link seguro gerado pelo sistema. O acesso é sempre associado a uma organização específica: não existe utilizador sem igreja.

O Administrador da organização é o único papel que pode criar, editar e desactivar utilizadores no sistema. Quando o Administrador cria um novo utilizador, define o nome, o email e o papel, e o sistema envia um convite por email com um link de activação gerado pelo Supabase Auth. O utilizador clica no link, define a sua senha, e a partir desse momento tem acesso ao sistema com as permissões correspondentes ao seu papel.

A store de autenticação em Zustand subscreve ao evento onAuthStateChange do Supabase para reagir a qualquer alteração de sessão em tempo real. Quando o utilizador acede ao sistema após autenticação, a store carrega o seu perfil completo, o seu papel, e a configuração da organização a que pertence. Se a sessão expirar, o utilizador é redirecionado para o ecrã de entrada sem perda de dados não guardados.

O ecrã de entrada é o único ecrã público do sistema. Apresenta o campo de email, o campo de senha, e o link de recuperação de acesso. Não existe registo por iniciativa própria, não existe autenticação social, e não existe acesso de demonstração sem credenciais válidas.

---

## 7. MÓDULO DE DASHBOARD

O dashboard é o ecrã central do sistema para a liderança. O seu propósito é responder numa única página às perguntas que definem o estado da igreja: como está o crescimento, como estão as finanças, como está a frequência, o que está a acontecer nos próximos dias. O dashboard não é decorativo — cada elemento representa um dado real consultado directamente do Supabase no momento do acesso.

O dashboard é composto por oito blocos funcionais. O primeiro é o cabeçalho institucional, que exibe o nome da igreja, o tema do mês activo consultado da tabela themes, e a data actual. O segundo é o painel de indicadores principais — quatro cartões com os valores do mês corrente e a variação percentual em relação ao mês anterior: total de membros activos, média de frequência nos cultos do mês, total de entradas financeiras do mês, e número de visitantes do mês. O terceiro é o gráfico de crescimento de membros, uma linha temporal dos últimos doze meses. O quarto é o gráfico de frequência, que cruza o número de presentes por culto nos últimos oito cultos com a média histórica. O quinto é o gráfico financeiro do mês, um gráfico de barras agrupadas que mostra entradas e saídas por categoria. O sexto é o painel de próximos eventos, que lista os três eventos mais próximos. O sétimo é o painel de actividade recente, com as últimas cinco operações registadas no sistema. O oitavo é o painel de alertas, que agrega notificações de atenção geradas pelo sistema: membros sem presença há mais de três cultos, marcações com o pastor não confirmadas, metas financeiras em risco, posições de liderança vagas no organograma, e eventos sem responsável definido.

O dashboard é diferente conforme o papel do utilizador autenticado. O pastor vê todos os oito blocos com profundidade máxima. A secretaria vê os indicadores principais, os próximos eventos e o painel de alertas operacionais, sem os blocos financeiros detalhados a menos que o seu papel tenha autorização específica. O líder de departamento vê apenas os dados relativos ao seu departamento, sem dados financeiros globais da igreja.

---

## 8. MÓDULO DE GESTÃO DE MEMBROS

Os membros são o activo mais importante da gestão de uma igreja e o módulo de membros é o mais transversal de todo o sistema. Cada membro cadastrado alimenta as presenças, os registos financeiros de dízimos, as escalas de culto, os departamentos, e os módulos espirituais. A qualidade do cadastro de membros define a qualidade de toda a análise que o sistema produz.

O formulário de criação de membro é extenso mas organizado em cinco separadores: Dados Pessoais, que recolhe nome completo, data de nascimento, género, estado civil, fotografia e documentação; Contactos, que recolhe telefone principal, email, morada e preferência de comunicação; Dados Eclesiais, que recolhe data de batismo, data de recepção como membro, denominação de origem se aplicável, nível de discipulado actual e flag de dizimista; Departamentos e Grupos, que permite associar o membro a um ou mais departamentos e a um grupo de célula; e Notas Pastorais, que é um campo de texto livre visível apenas pelo pastor e pelo administrador.

A ficha de membro é o ecrã central do módulo. Para além dos dados do formulário de criação, a ficha apresenta quatro separadores de actividade: Historial de Presenças, com a listagem dos últimos cultos e o estado de presença em cada um; Historial Financeiro, com os registos de dízimos e ofertas associados ao membro, visível apenas para papéis autorizados; Actividade Espiritual, com o progresso nas trilhas de discipulado, a participação nas escolas e o estado no módulo Face a Face com Deus; e Historial de Comunicações, com todas as mensagens enviadas ao membro pelo sistema.

O sistema suporta importação em massa de membros a partir de ficheiro CSV, para facilitar a migração de dados de sistemas legados. A importação é validada campo a campo, os erros são reportados linha a linha, e a confirmação é pedida antes de qualquer inserção definitiva na base de dados.

A gestão de visitantes está integrada no mesmo módulo com um separador dedicado. Cada visitante tem uma ficha simplificada com o seu estado de acompanhamento e o histórico de contactos. A secretaria pode converter um visitante em membro com um único clique, que transfere os dados para a tabela members e cria automaticamente o registo de recepção.

---

## 9. MÓDULO DE RELATÓRIO DE CULTO

O registo do culto é um dos processos mais recorrentes da secretaria e o módulo é desenhado para ser rápido e completo. Cada culto registado alimenta o dashboard, os relatórios mensais, os gráficos de frequência e os registos financeiros associados ao culto.

O formulário de registo de culto está organizado em três blocos. O primeiro bloco captura os dados gerais do culto: data, tipo, pregador seleccionado da lista de membros ou inserido manualmente, tema ou título da mensagem, e texto bíblico base. O segundo bloco captura os dados de frequência: número total de presentes discriminado entre membros, visitantes e crianças, número de primeiros visitantes, número de decisões de aceitar Cristo e número de reconsagrações. O terceiro bloco captura os dados financeiros do culto: valor da oferta recolhida discriminado por tipo e método de recolha.

O registo de presença individual por membro é feito num modal separado acessível a partir do registo do culto. A secretaria vê a lista completa de membros activos com checkboxes de presença e pesquisa por nome. O registo de presença em massa é processado pela Edge Function process-attendance-bulk para evitar múltiplas chamadas individuais à base de dados.

---

## 10. MÓDULO FINANCEIRO

O módulo financeiro é desenhado com dois princípios absolutos: completude de registo e imutabilidade. Cada centavo que entra e sai da igreja deve ter um registo, uma categoria, uma data e um responsável pelo lançamento. Nenhum registo é eliminado — é anulado com motivo registado e rastro de auditoria preservado.

O sistema distingue quatro categorias de entrada: Dízimo, Oferta Geral, Oferta Especial e Doação. O Dízimo pode ser associado a um membro identificado, gerando um historial individual de fidelidade dízimal. A Oferta Geral é recolhida por culto e registada globalmente. A Oferta Especial é associada a uma campanha ou causa específica criada previamente, e o sistema acompanha o progresso em relação à meta declarada. A Doação é um valor avulso de origem interna ou externa, com campo de identificação do doador e propósito.

As saídas são registadas por categoria: Despesa Operacional para os custos fixos da igreja, Despesa de Evento para os custos associados a um evento específico, Salário ou Ajuda de Custo para os pagamentos regulares a colaboradores e ao pastor, e Despesa Extraordinária para saídas não recorrentes com campo de justificação obrigatório.

Cada registo financeiro pode ter um comprovante anexo — fotografia ou PDF — armazenado no Supabase Storage e associado ao registo na tabela financials. O comprovante é visualizável directamente na ficha do lançamento sem necessidade de download.

O módulo apresenta três vistas: a Vista de Lançamentos, uma tabela paginada com todos os movimentos filtráveis por data, categoria, tipo e culto ou evento associado; a Vista de Resumo Mensal, que agrega os totais por categoria com gráficos comparativos em relação ao mês anterior; e a Vista de Caixa, que mostra o saldo actual calculado como a diferença cumulativa entre todas as entradas e saídas confirmadas.

---

## 11. MÓDULO DE GESTÃO DE DEPARTAMENTOS

Os departamentos são as unidades organizacionais da igreja. Cada departamento tem um líder responsável, uma lista de membros, e um espaço próprio para registar as suas actividades e comunicar com a secretaria e o pastor.

A ficha de departamento apresenta quatro separadores: Membros, que lista todos os membros associados com a possibilidade de adicionar ou remover; Actividades, que lista todas as actividades registadas com data, descrição e número de participantes; Comunicações, que mostra as mensagens enviadas pelo sistema ao departamento; e Indicadores, que apresenta a evolução do número de membros, a frequência média nas actividades e o número de actividades realizadas por mês.

O líder de departamento acede ao sistema com o seu papel específico e vê apenas o painel do seu departamento. Pode registar actividades, visualizar a lista de membros e contactá-los através do módulo de comunicação. Não tem acesso a dados financeiros globais, a outros departamentos nem à área do pastor.

---

## 12. MÓDULO DE DEPARTAMENTO INFANTIL

O Departamento Infantil é o módulo dedicado à gestão segura e organizada das crianças da igreja. O módulo garante que cada criança esteja sempre associada a um responsável adulto, que as salas e os professores estejam devidamente configurados, e que o controlo de presença seja feito de forma simples e rastreável.

O módulo organiza-se em três estruturas. A primeira são os Grupos Infantis, que permitem dividir as crianças por faixas etárias ou turmas, cada uma com o seu nome, faixa etária, sala atribuída e professor responsável. A segunda são as Salas, configuradas nas Definições com capacidade máxima e equipamento disponível. A terceira são os Registros de Presença, que permitem à secretaria registar quais as crianças presentes em cada culto ou actividade infantil, processados em massa pela Edge Function process-attendance-bulk.

A associação de uma criança ao sistema exige obrigatoriamente a indicação de um ou dois responsáveis — membros adultos cadastrados — com os seus contactos directos. O sistema alerta a secretaria se uma criança for registada sem responsável válido e impede o registo incompleto.

A segurança é um princípio irrenunciável do módulo. Nenhuma criança pode ser entregue a alguém que não esteja registado como responsável no momento da saída. O sistema inclui um registo de entradas e saídas com timestamps, e qualquer tentativa de entrega a terceiro não autorizado gera um alerta no painel da secretaria e um log de segurança na tabela audit_log.

---

## 13. MÓDULO DE ANIVERSARIANTES

O módulo de Aniversariantes centraliza a celebração da vida da comunidade, garantindo que nenhum membro passa o seu dia sem ser lembrado pela igreja. O módulo apresenta a lista de aniversariantes do mês com navegação por mês, destacando os aniversários da semana corrente.

A vista principal apresenta os aniversariantes organizados por dia, com nome do membro, idade que completa, contacto e botão de envio de saudação rápida via WhatsApp. O sistema deteta automaticamente os aniversários do dia através da tabela members e disponibiliza a acção de envio imediato de mensagem personalizada.

O módulo integra-se com a Edge Function send-birthday-greetings, que é executada diariamente pelo cron job do Supabase. A função verifica os aniversários do dia, consulta a preferência de canal do membro — WhatsApp ou email — e envia a saudação automática com o nome do membro e a mensagem configurada no módulo de Definições. O envio fica registado na tabela communications com o template utilizado.

---

## 14. MÓDULO DE ORGANOGRAMA E LIDERANÇA

O organograma da igreja é a representação visual e operacional da estrutura de governo e serviço da comunidade. O módulo não é apenas um diagrama estático — é uma estrutura viva ligada aos dados reais do sistema: cada posição no organograma aponta para um membro cadastrado, cada departamento no organograma é o mesmo departamento do módulo de gestão, e qualquer alteração de liderança feita neste módulo reflecte-se automaticamente nas permissões e nos painéis correspondentes.

A estrutura do organograma é definida pelo Administrador nas Definições e organiza-se em níveis hierárquicos configuráveis. O nível superior é reservado ao Pastor Principal e ao Co-Pastor se existir. O segundo nível agrupa os líderes de ministério. O terceiro nível apresenta os responsáveis por funções de apoio e administração. Os níveis subsequentes são configurados livremente pela organização de acordo com a sua realidade de governo. Cada nível é arrastável e reordenável, e a hierarquia é persistida na tabela org_chart no Supabase.

A visualização do organograma é renderizada como um diagrama de árvore interactivo. O utilizador pode expandir e colapsar ramos, pesquisar por nome ou cargo, e clicar em qualquer posição para abrir o painel de detalhes. O diagrama é exportável em PDF para uso em impressão ou apresentações institucionais, gerado pela Edge Function generate-export com o estado actual do organograma.

Uma posição pode existir sem membro alocado — aparece no organograma como vaga, sinalizando a lacuna de liderança ao pastor e ao administrador, e gerando automaticamente um alerta no painel de alertas do dashboard.

### Separador de Liderança

O separador de Liderança é uma vista dedicada dentro do módulo de organograma que apresenta todas as posições de liderança da igreja de forma operacional — não como diagrama, mas como painel de gestão. É o lugar onde o pastor e o administrador gerem quem lidera o quê, acompanham o estado de cada líder, e têm uma visão consolidada da saúde da estrutura de governo da comunidade.

O painel de liderança apresenta a lista completa de todas as posições de liderança com o membro alocado, a data de início do mandato, e três indicadores calculados em tempo real: o nível de presença do líder nos cultos nos últimos noventa dias, o número de actividades registadas no seu departamento no mês corrente, e o estado da sua trilha de discipulado activa. Estes três indicadores são apresentados de forma visual e não intrusiva — não como notas ou avaliações, mas como dados factuais que ajudam o pastor a perceber se um líder está activo, presente e a crescer espiritualmente.

A ficha de cada líder dentro do separador de Liderança agrega informação que noutros módulos está dispersa: os dados do membro consultados da tabela members, o cargo e o nível hierárquico consultados da tabela org_chart, o departamento que lidera com os últimos indicadores de actividade, o historial de mandatos anteriores se o membro já exerceu outros cargos, e um campo de notas pastorais sobre a liderança visível apenas pelo pastor.

A gestão de mandatos é feita directamente no separador de Liderança. Quando um líder é substituído, o administrador encerra o mandato com data de fim e motivo — conclusão natural, pedido de afastamento, decisão pastoral, ou outro — e aloca o novo líder à posição. O historial de mandatos é preservado na tabela org_chart_history e consultável na ficha de cada posição, garantindo que a memória institucional da liderança nunca se perde. O sistema notifica automaticamente o novo líder via WhatsApp com a confirmação da sua alocação ao cargo.

O painel de liderança inclui dois alertas automáticos visíveis apenas para o pastor e o administrador. O primeiro alerta identifica posições de liderança vagas. O segundo alerta identifica líderes com presença abaixo de cinquenta por cento nos últimos noventa dias, que é um sinal operacionalmente relevante para o pastor avaliar o estado de comprometimento e disponibilidade de cada responsável.

---

## 15. MÓDULO DO PASTOR

A área do pastor é o espaço mais privado do sistema. O acesso é exclusivo ao utilizador com papel Pastor. Nenhum outro papel — incluindo o Administrador — tem acesso ao conteúdo das notas pastorais, dos sermões e das anotações pessoais.

A área do pastor é organizada em quatro zonas. A primeira zona é a Agenda, que apresenta o calendário mensal com todas as marcações confirmadas pela secretaria, os dias bloqueados pelo próprio pastor, e os eventos da agenda anual da igreja. A segunda zona é a de Sermões e Anotações, um editor de texto rico onde o pastor redige, organiza e arquiva os seus sermões, esboços e notas de estudo. Cada documento tem título, data, tags, e o texto bíblico base. O arquivo é pesquisável por qualquer campo. A terceira zona é o Bloco de Anotações Pessoal, um espaço livre e não estruturado para pensamentos, ideias e registos que não pertencem ao arquivo formal de sermões. A quarta zona é o Painel de Membros Sinalizados, onde o pastor vê os membros com pedidos de oração activos, os que estão em acompanhamento pastoral declarado, e os que o sistema sinalizou como ausentes por mais de um mês.

A gestão da agenda do pastor é assimétrica por design: a secretaria cria as marcações, mas o pastor gere a sua disponibilidade. O pastor pode bloquear dias inteiros ou intervalos de dias inserindo um registo na tabela pastor_blocks, e esses blocos são imediatamente reflectidos no calendário da secretaria, impedindo novas marcações nessas datas. O pastor pode cancelar marcações existentes com um registo de motivo, e o sistema envia automaticamente uma notificação ao membro afectado via WhatsApp. O pastor não cria marcações directamente — este fluxo passa sempre pela secretaria.

---

## 16. MÓDULO DA SECRETARIA

A secretaria é o papel operacional central do sistema. A área da secretaria é o hub de onde partem as marcações com o pastor, o registo de cultos, o cadastro de membros, a gestão de escalas e a comunicação com a congregação.

O painel da secretaria apresenta cinco acções rápidas no topo: Registar Culto, Nova Marcação com o Pastor, Adicionar Membro, Enviar Comunicação, e Registar Visitante. Cada acção abre o modal correspondente sem navegar para fora do painel, optimizando o fluxo de trabalho durante e após os cultos.

O calendário de marcações com o pastor é o elemento central do painel da secretaria. A secretaria visualiza todos os slots disponíveis do pastor — calculados a partir dos seus horários configurados menos os blocos declarados — e pode criar novas marcações seleccionando o slot e associando-o a um membro ou visitante. O sistema verifica automaticamente a disponibilidade antes de confirmar a marcação, bloqueia o slot, e envia imediatamente uma notificação ao membro com os detalhes da marcação via WhatsApp.

---

## 17. MÓDULO DE COMUNICAÇÃO

O módulo de comunicação é o canal oficial de toda a comunicação saída do sistema para membros, visitantes e líderes. Não existem mensagens enviadas fora do sistema que não fiquem registadas — este é um princípio arquitectónico inegociável do módulo.

O módulo suporta três tipos de comunicação. A mensagem individual permite ao utilizador autorizado seleccionar um destinatário, escolher o canal preferido, escrever a mensagem e enviar. A mensagem em grupo permite seleccionar múltiplos destinatários por filtro — todos os membros activos, membros de um departamento específico, participantes de um evento, alunos de uma turma — e enviar a mesma mensagem a todos com personalização automática do nome do destinatário. A campanha programada permite criar uma mensagem, definir os destinatários e agendar o envio para uma data e hora futuras.

O sistema inclui um conjunto de comunicações automáticas configuráveis nas Definições: saudação de aniversário, lembrete de marcação com o pastor, confirmação de inscrição em evento, notificação de nova escala de culto, e aviso de reunião de departamento. Cada comunicação automática pode ser activada ou desactivada individualmente e tem o seu template personalizável.

---

## 18. MÓDULO DE AGENDA E CALENDÁRIO ANUAL

A agenda anual é a planta do ano da igreja. É o lugar onde estão registados os cultos especiais, as conferências, os retiros, os programas de evangelismo, as datas comemorativas e os marcos institucionais que estruturam o calendário da comunidade.

O tema do ano é definido pelo pastor nas Definições com um título, um versículo base e uma descrição. A partir dessa definição, cada mês pode ter o seu sub-tema associado, também com versículo e descrição. O tema do ano e o tema do mês são exibidos no dashboard, no cabeçalho dos relatórios e nos templates de comunicação.

A vista de calendário apresenta o ano em doze blocos mensais com os eventos posicionados nas suas datas. O utilizador pode alternar entre a vista anual — panorâmica, ideal para planeamento — a vista mensal — detalhada, com todos os cultos e eventos do mês — e a vista de lista — cronológica, ideal para preparar o boletim ou as comunicações.

---

## 19. MÓDULO DE ESCALA DO CULTO

A escala do culto é o instrumento de organização do ministério em cada serviço religioso. O módulo permite à secretaria ou ao líder responsável definir quem está alocado a cada função em cada culto, notificar os alocados automaticamente, e acompanhar as confirmações.

A criação de uma escala parte do registo do próximo culto. Para cada função configurada nas Definições, a secretaria selecciona o membro alocado a partir de uma lista filtrada pelos membros do departamento correspondente. O sistema verifica se o membro seleccionado não está já alocado a outra função no mesmo culto e alerta em caso de conflito.

Após a escala estar completa, a secretaria publica-a com um clique. A publicação dispara automaticamente o envio de uma mensagem via WhatsApp a cada membro alocado com a sua função, a data e a hora. Cada membro pode confirmar ou pedir substituição, e o estado de confirmação é actualizado na tabela service_schedules. A secretaria visualiza em tempo real quais as funções confirmadas e quais ainda aguardam resposta.

---

## 20. MÓDULO DE ESCOLA DE BATISMO

A Escola de Batismo é o percurso formal de preparação para o batismo nas águas. O módulo cobre o ciclo completo de cada turma: criação, inscrição de alunos, registo de aulas, acompanhamento individual de progresso, e certificação final.

A criação de uma turma recolhe o nome da turma, o instrutor responsável, a data de início, a data de conclusão prevista, o local das aulas, e o conteúdo programático. O conteúdo programático é definido como uma lista de matérias — cada matéria tem título, descrição, número de aulas previstas e material de apoio opcional. As matérias são configuradas pelo Administrador nas Definições e reutilizadas em cada turma, podendo ser ajustadas turma a turma.

A inscrição de alunos é feita pela secretaria ou pelo instrutor. No momento da inscrição, o sistema cria o registo individual do aluno na turma com estado em curso, progresso inicial a zero, e o histórico de presença vazio. O sistema envia automaticamente uma mensagem via WhatsApp ao aluno com a confirmação de inscrição, os detalhes da turma e a data da primeira aula.

O registo de aulas é feito matéria a matéria. Para cada aula realizada, o instrutor regista a data, a duração efectiva, o conteúdo abordado, e a lista de presença dos alunos processada em massa pela Edge Function process-attendance-bulk. O instrutor pode adicionar um comentário geral sobre a aula — observações sobre o conteúdo, dinâmica do grupo, pontos a retomar.

O acompanhamento individual de cada aluno é feito no separador do aluno dentro da turma. O instrutor visualiza o historial de presenças aula a aula, regista o crescimento do aluno por matéria numa escala configurável — iniciante, em desenvolvimento, consolidado — e adiciona comentários individuais privados, visíveis apenas pelo instrutor e pelo pastor.

O encerramento da turma é um passo formal. O instrutor marca cada aluno como concluído, em recuperação ou reprovado. Os alunos concluídos recebem o certificado gerado automaticamente pela Edge Function generate-school-certificate, armazenado no Supabase Storage e enviado por email. O campo de data de batismo efectivo é preenchido posteriormente quando o batismo se realiza, actualizando a ficha do membro.

---

## 21. MÓDULO DE DISCIPULADO

O módulo de Discipulado é o sistema de formação espiritual progressiva dos membros da igreja. Onde a Escola de Batismo tem início e fim definidos, o Discipulado é um percurso contínuo organizado em trilhas de crescimento que acompanham o membro ao longo da sua vida na comunidade.

As trilhas de discipulado são definidas pelo pastor ou administrador nas Definições. Cada trilha tem um nome, uma descrição, um nível — fundamentos, crescimento, liderança, maturidade — uma sequência de módulos, e os recursos associados a cada módulo referenciados por título e URL. O sistema não armazena o conteúdo dos recursos — referencia-os externamente — mas regista qual o recurso associado a cada módulo para orientação do mentor e do aluno.

A inscrição de um membro numa trilha é feita pelo mentor responsável ou pela secretaria. Cada inscrição cria um registo de progresso individual com o módulo inicial, o mentor associado, e a data de início. O mentor recebe uma notificação automática quando um novo aluno lhe é atribuído.

O acompanhamento do progresso é feito módulo a módulo pelo mentor. Para cada módulo, o mentor regista a data de conclusão, uma avaliação qualitativa do desempenho do aluno, e um comentário livre de observação. O sistema calcula o progresso acumulado na trilha e actualiza o nível de discipulado no perfil do membro quando uma trilha é concluída.

O pastor tem acesso ao painel global de discipulado que mostra a distribuição dos membros por trilha e por nível, os alunos sem trilha activa, e o número de conclusões no período.

---

## 22. MÓDULO FACE A FACE COM DEUS

O Face a Face com Deus é uma escola formal da igreja e um dos módulos centrais da plataforma. Não é um diário devocional livre — é um programa estruturado de encontro pessoal com Deus, com matérias definidas, calendário de aulas, dias e duração de cada sessão, registo de crescimento individual por matéria, e acompanhamento pelo instrutor. A diferença em relação aos outros módulos de formação é que o Face a Face com Deus trabalha a dimensão mais íntima do crescimento espiritual — a vida de oração, a sensibilidade ao Espírito, o jejum, a meditação e a palavra — e por isso exige um nível adicional de cuidado no tratamento dos dados individuais de cada aluno.

A criação de uma turma recolhe o nome da turma, o instrutor responsável, a data de início, a data de conclusão prevista, o local ou modalidade das aulas, e o conteúdo programático. As matérias da escola são definidas pelo pastor nas Definições e podem incluir, a título de exemplo: Fundamentos da Oração, O Silêncio Diante de Deus, Jejum com Propósito, Meditação na Palavra, Ouvir a Voz de Deus, Adoração Pessoal, e Intercesão. Cada matéria tem título, descrição, número de aulas previstas, duração por aula em minutos, e material de apoio opcional.

A inscrição de alunos segue a mesma lógica das outras escolas — feita pela secretaria ou pelo instrutor, com confirmação automática por WhatsApp. O sistema regista o aluno na turma, cria o seu perfil de progresso individual, e atribui-lhe o instrutor responsável.

O registo de aulas é feito pelo instrutor após cada sessão. Para cada aula, regista a data, o dia da semana, a duração efectiva em minutos, a matéria trabalhada, o texto ou princípio central abordado, e a lista de presença. O instrutor pode adicionar uma observação geral sobre a dinâmica da sessão — o que foi mais impactante, o que precisa de mais aprofundamento, o que deve ser retomado na próxima aula.

O acompanhamento individual é o coração do módulo. Para cada aluno, o instrutor tem acesso ao separador de crescimento, onde regista o desenvolvimento espiritual observado matéria a matéria numa escala qualitativa — emergindo, em crescimento, estabelecido — e adiciona comentários individuais privados, visíveis apenas pelo instrutor e pelo pastor. O aluno pode registar no seu próprio perfil as suas percepções e experiências em cada aula — um campo de auto-relato voluntário e privado — que o instrutor pode consultar para enriquecer o acompanhamento.

O registo de crescimento acumulado é apresentado num gráfico por aluno que mostra a evolução matéria a matéria ao longo do tempo. O instrutor vê o gráfico de todos os alunos da turma numa vista comparativa, permitindo identificar quem está a progredir bem e quem precisa de atenção adicional. O pastor tem acesso ao painel global da escola com a distribuição dos alunos por nível de crescimento, a taxa de presença média por turma, e os comentários dos instrutores agregados por turma.

O encerramento da turma segue a mesma lógica das outras escolas: o instrutor marca o estado final de cada aluno, os concluídos recebem o certificado gerado automaticamente, e a participação concluída no Face a Face com Deus é registada como um marco no perfil espiritual do membro, visível na sua ficha e considerado nos relatórios de formação espiritual da igreja.

---

## 23. MÓDULO DE GESTÃO DE EVENTOS

Os eventos são momentos extraordinários na vida da igreja que requerem planeamento, comunicação e registo próprios. O módulo de eventos cobre o ciclo completo: criação, divulgação, inscrições, execução e encerramento com relatório.

O formulário de criação de evento recolhe o título, a descrição, as datas de início e fim, o local, a capacidade máxima, o tipo de evento, o responsável e o orçamento previsto. Após a criação, o evento aparece automaticamente na agenda anual e no dashboard.

A gestão de inscrições permite à secretaria inscrever membros e visitantes manualmente. O sistema controla a capacidade máxima e alerta quando o evento está quase cheio. Cada inscrição gera uma confirmação automática por WhatsApp ao inscrito com os detalhes do evento.

O encerramento do evento é um passo formal. A secretaria ou o responsável regista o número efectivo de presentes, as observações gerais, e confirma os lançamentos financeiros associados. O sistema gera automaticamente o relatório do evento com os dados registados e o comparativo orçamento versus realizado.

---

## 24. MÓDULO DE RELATÓRIOS, ANÁLISES E BALANÇO MENSAL

Os relatórios são o instrumento de prestação de contas da liderança. O sistema gera relatórios em quatro períodos: por culto individual, mensal, trimestral e anual. Todos os relatórios são calculados a partir dos dados reais do Supabase, com cache de seis horas para relatórios já gerados na tabela reports_cache.

O Balanço Mensal é o relatório mais importante do sistema e o único gerado automaticamente sem pedido explícito. No último dia de cada mês, o cron job do Supabase chama a Edge Function generate-monthly-balance, que consolida todos os dados do mês — cultos, presenças, decisões, finanças, novos membros, visitantes, actividades de departamentos, eventos realizados, conclusões nas escolas — calcula os indicadores e compara com o mês anterior, e gera o documento estruturado disponível para o pastor e a liderança.

O relatório financeiro apresenta o total de entradas e saídas por categoria, o saldo do período, a lista dos maiores lançamentos, e os registos pendentes de confirmação. O relatório de crescimento apresenta o total de membros activos, os novos membros do período, as transferências e desligamentos, e a taxa de conversão de visitantes em membros. O relatório de frequência apresenta a média de presentes por tipo de culto, a taxa de absentismo, e os membros ausentes por mais de um mês. O relatório de departamentos agrega as actividades realizadas por departamento e os indicadores de crescimento. O relatório de formação espiritual consolida os dados das três escolas — Batismo, Discipulado e Face a Face com Deus — com alunos inscritos, em curso e concluídos por turma.

---

## 25. MÓDULO DE LOGS E AUDITORIA

O sistema de logs é transparente, exaustivo e inviolável. Todo o registo de auditoria é gerado por triggers ao nível do PostgreSQL, o que significa que nenhuma operação sensível pode escapar ao log independentemente de como foi executada.

O painel de logs é acessível apenas ao Administrador e apresenta uma tabela paginada e filtrável de todas as operações registadas: data e hora, utilizador que executou a operação, módulo, tipo de operação, entidade afectada e resumo da alteração. Os logs não são editáveis nem elimináveis por nenhum utilizador do sistema.

O sistema distingue três níveis de log. O nível Operacional regista todas as criações, edições e anulações em todas as tabelas principais. O nível de Acesso regista cada início e fim de sessão, incluindo o dispositivo e a hora. O nível de Segurança regista tentativas de acesso falhadas, alterações de papéis de utilizadores, e tentativas de operações fora do âmbito do papel do utilizador autenticado.

---

## 26. MÓDULO DE DEFINIÇÕES

O módulo de Definições é o painel de controlo da organização dentro do sistema. É acessível apenas ao Administrador e ao Pastor com permissão específica.

As definições organizam-se em seis áreas. A área de Perfil da Igreja permite actualizar os dados institucionais, o logótipo, os contactos e as preferências regionais. A área de Utilizadores permite criar, editar, desactivar e convidar utilizadores com os seus papéis. A área de Departamentos permite criar, editar e arquivar departamentos. A área de Temas permite definir e editar o tema do ano e os temas mensais. A área de Comunicações permite configurar os templates das comunicações automáticas e activar ou desactivar cada tipo. A área de Módulos Espirituais permite criar os planos de leitura bíblica, definir as trilhas de discipulado, configurar as matérias das três escolas, e gerir os recursos digitais associados.

---

## 27. MÓDULO DE SEGURANÇA E ROW LEVEL SECURITY

O Row Level Security está activo em todas as tabelas do Supabase desde o primeiro dia. A política base universal é: um utilizador autenticado só pode executar operações sobre registos onde o campo church_id corresponde ao identificador da sua organização e onde o seu papel lhe confere permissão para aquela operação específica. Esta política é uma garantia ao nível da base de dados e não depende de nenhuma validação no cliente ou nas Edge Functions.

As Edge Functions validam o token JWT do utilizador antes de processar qualquer pedido, rejeitando pedidos não autenticados com código 401 e pedidos de utilizadores sem papel adequado com código 403. As chaves de API do WhatsApp Business, do serviço de email e quaisquer outras credenciais externas existem apenas como variáveis de ambiente das Edge Functions, nunca expostas ao cliente.

---

## 28. MAPA DE MÓDULOS — VISÃO CONSOLIDADA

O sistema é composto pelos seguintes módulos definitivos, em ordem de dependência:

1 — Autenticação e Controlo de Acesso (Supabase Auth + RLS)
2 — Dashboard (Supabase Realtime + Recharts)
3 — Gestão de Membros e Visitantes (Supabase)
4 — Relatório de Culto e Registo de Presenças (Supabase)
5 — Módulo Financeiro com lançamentos, comprovantes e resumos (Supabase Storage)
6 — Gestão de Departamentos (Supabase)
7 — Departamento Infantil — grupos, salas, segurança e responsáveis (Supabase)
8 — Aniversariantes — lista mensal, saudações automáticas e WhatsApp (Edge Functions + WhatsApp Business API)
9 — Organograma e Liderança com historial de mandatos (Supabase)
10 — Área do Pastor — agenda, sermões, bloco de notas, painel de membros (Supabase)
11 — Área da Secretaria — marcações, escalas, painel operacional (Supabase Realtime)
12 — Módulo de Comunicação — WhatsApp e email, automáticos e manuais (Edge Functions + WhatsApp Business API)
13 — Agenda e Calendário Anual com temas do ano e do mês (Supabase)
14 — Escala do Culto com publicação e confirmações (Supabase Realtime)
15 — Escola de Batismo com turmas, matérias e certificação (Supabase Storage)
16 — Discipulado com trilhas e acompanhamento por mentor (Supabase)
17 — Face a Face com Deus — escola espiritual completa (Supabase)
18 — Gestão de Eventos com inscrições e relatório de encerramento (Supabase)
19 — Relatórios, Análises e Balanço Mensal automático (Edge Functions + Supabase)
20 — Logs e Auditoria (PostgreSQL triggers)
21 — Definições — perfil, utilizadores, departamentos, temas, comunicações, módulos espirituais (Supabase)
22 — Row Level Security e Isolamento de Dados (PostgreSQL nativo)

---

## 29. FASES DE IMPLEMENTAÇÃO SUGERIDAS

A primeira fase cobre a configuração completa do Supabase — projecto, tabelas, políticas RLS, Edge Functions base — e os módulos de autenticação, dashboard, gestão de membros e visitantes, registo de culto, módulo financeiro e departamento infantil. Com estes módulos activos e integrados, a secretaria já tem um sistema funcional para o trabalho diário real: cadastra membros, regista cultos, lança movimentos financeiros, gere as crianças com segurança, e o pastor vê o dashboard com os dados actualizados.

A segunda fase adiciona os módulos de departamentos, organograma e liderança, módulo de aniversariantes, área do pastor com agenda e notas, área da secretaria com marcações sincronizadas, escala do culto, e módulo de comunicação com WhatsApp e email. Com esta fase concluída, a operação completa da secretaria está coberta, a estrutura de governo da igreja está mapeada, as saudações de aniversário são automáticas, e a comunicação oficial da igreja passa integralmente pelo sistema.

A terceira fase adiciona os módulos de agenda anual, escola de batismo, discipulado, gestão de eventos, e os relatórios periódicos com balanço mensal automático. O sistema passa a cobrir o planeamento de longo prazo e a formação espiritual estruturada.

A quarta fase adiciona o módulo Face a Face com Deus na sua versão completa — turmas, matérias, registo de aulas, crescimento individual e painel espiritual do pastor — e o módulo de logs e auditoria com o painel de administração. Com esta fase concluída, o sistema está completo, pronto para uso em contexto real, e cobre integralmente o manifesto do produto: garantir e facilitar a recolha de dados, a comunicação, o controlo da liderança, e o balanço mensal de tudo o que acontece na vida da igreja.