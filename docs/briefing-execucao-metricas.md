Briefing de execução — Sistema de métricas (BusinessMap e Acelerato)
Briefing de execução · repasse para agentes · versão 1
# Sistema de métricas: contexto, especificação e tarefas
Documento autocontido. Reúne todo o contexto necessário, as regras de cálculo, o catálogo completo de métricas e a lista de tarefas com critério de pronto, para que a implementação possa ser executada sem acesso à discussão que originou a proposta.
DomíniosFluxo de projeto (BusinessMap) e sustentação (Acelerato)
Métricas especificadas44 + 1 transversal
Frentes6 · tarefas 32
Pré-requisito críticoConfiguração antes de coleta
- Como usar
- Contexto
- Estrutura
- Fontes de dados
- Regras de cálculo
- Frentes e tarefas
- Catálogo de métricas
- Restrições
- Entregáveis
## 00Como usar este documento
Este briefing é a fonte da verdade para a implementação. Quem executar deve ler as seções 1 a 4 antes de iniciar qualquer tarefa, porque elas contêm decisões já tomadas que não devem ser reabertas durante a execução.
- Ordem obrigatória.Configuração (WS1 e WS4) precede coleta (WS2 e WS5), que precede painel (WS3). Construir painel sobre dado não calibrado gera indicador que será descartado.
- Cada tarefa tem critério de pronto.Não considerar concluída sem atendê-lo integralmente. Quando o critério citar um número mínimo de registros ou dias, ele é condição, não sugestão.
- Dúvida de regra de negócio não se resolve por inferência.As seções 4 e 7 contêm as regras invioláveis; o que não estiver lá e for ambíguo deve ser devolvido como pergunta, não decidido no código.
- Dados de exemplo neste documento são ilustrativos.Nenhum número citado como exemplo deve ser usado como baseline, meta ou valor esperado.
Restrição que não se negocia:nenhuma métrica deste conjunto pode ser usada, exposta ou modelada para avaliação de desempenho individual. A seção 7 detalha. Implementações que facilitem esse uso — ranking individual como visão principal, metas por pessoa, comparação entre times — devem ser recusadas e sinalizadas.
## 01Contexto
Departamento de Desenvolvimento de Sistemas e Plataformas Digitais, responsável por ERP e sistemas corporativos (Protheus/TOTVS, Fluig, Senior), sistemas de marketing, vendas e operações, ciência de dados e plataforma 5G. A operação se divide em dois domínios com ferramentas, populações e relógios distintos.
| Domínio | Ferramenta | Unidade | Natureza
| Fluxo de projeto | BusinessMap (Kanban) | Card: projeto, frente, story | Trabalho planejado, com hierarquia e sprints
| Sustentação | Acelerato (ITSM) | Chamado: incidente e requisição | Atendimento reativo, com prioridade e SLA contratado
Os dois domínios não se misturam em nenhum cálculo.Nenhum histograma, percentil, média ou previsão pode combinar cards do BusinessMap com chamados do Acelerato. São populações diferentes e o número resultante não descreveria nenhuma das duas.
### Modelo conceitual: três níveis de voo
As métricas são organizadas em três altitudes, no modelo Flight Levels, com a sustentação como fluxo paralelo. Cada nível corresponde a um quadro real e a uma granularidade real de card.
| Nível | Quadro | Card | Decide | Cadência
| FL3 · Estratégico | Gerente | Projeto | Portfólio, objetivos, resultado | Mensal e trimestral
| FL2 · Tático | Coordenadores | Feature ou pacote, em sprints | Coordenação, compromissos, dependências | Quinzenal e mensal
| FL1 · Operacional | Times | User story, tarefa, demanda | Fluxo diário do trabalho | Diária e semanal
| Sustentação | Acelerato | Chamado | Atendimento e restauração de serviço | Semanal e mensal
### Origem dos projetos
Um projeto nasce no processo de TAP (Termo de Abertura de Projeto), onde as áreas registram as informações. O TAP vai a uma comissão. Aprovado na comissão, é criado o card de projeto no quadro do gerente— e é esse o marco de entrada do relógio estratégico. O tempo do processo de TAP anterior à aprovação está fora do escopo desta implementação.
## 02Estrutura de quadros e hierarquia de cards
# hierarquia no BusinessMapProjeto quadro do gerente aprovado na comissão └─ Feature | Pacote quadros dos coordenadores organizados em sprints └─ User story | Tarefa quadros dos times # feature e pacote ocupam o MESMO nível — para medição contam igual # sustentação e demanda não planejada convivem nos quadros dos times, sem pai
- O vínculo pai/filho é o que viabiliza toda a consolidação.Card filho sem pai é invisível no nível acima e representa capacidade consumida que não aparece em lugar nenhum. Tratar vínculo faltante como defeito de dado, não como higiene opcional.
- Exceção legítima ao vínculo:tipos de sustentação e demanda não planejada, que não pertencem a projeto. Precisam ser identificáveis por tipo de card para que o consumo fora de projeto seja mensurável.
- Se um pacote agrupar features em algum quadro, isso cria um quarto nível. Nesse caso é preciso escolher qual dos dois é a unidade de avanço do projeto, sob pena de contagem dupla. Devolver como pergunta se a situação for encontrada.
- Granularidade esperada:projeto em meses, feature ou pacote em uma a duas sprints, user story em poucos dias. Cada granularidade tem distribuição própria e nunca entra no mesmo histograma das outras.
- Definição de frente concluída:todas as stories filhas entregues e a capacidade disponível para uso — não "desenvolvimento terminado".
- Avanço de projeto nunca é declarado manualmente, sempre calculado por frentes filhas concluídas sobre o total.
## 03Fontes de dados
### 3.1 BusinessMap
API REST v2 no subdomínio da organização, autenticação por apikey em header. A especificação OpenAPI completa está disponível no próprio subdomínio e deve ser consultada antes de escrever o coletor— os nomes exatos de recursos e campos variam por versão e não devem ser assumidos a partir deste documento.
| Recurso | Uso
| /api/v2/cards | Cards com filtros por quadro, tipo e período; base da dim_card
| /cards/{id}/revisions | Histórico de alterações; base da fato_transicao
| /cards/{id}/children · /childGraph | Vínculos pai/filho entre projeto, frente e story
| /customFields | Definição e valores dos campos customizados
| /boards/{id}/columns | Estrutura do workflow, para classificar fila × execução
| comentários · tempo apontado · bloqueios | Primeiro toque, estoque parado, fato_bloqueio
| Business Rules → webhook | Evento de mudança de coluna em tempo real, em paralelo à coleta por API
Card arquivado ou excluído sai das consultas padrão.Se a base analítica guardar apenas o estado atual, perdem-se as demandas canceladas, que são uma das medidas de desperdício mais reveladoras. A carga precisa ser incremental e nunca sobrescrever histórico.
### 3.2 Acelerato
Base MySQL acelerato_dev_corporativo, leitura direta. População do painel atual, que deve ser mantida como recorte padrão:
# população DSPD-SSSCorganizacao = 'DSPD Sustentação' tipo = 'DSPD - SSSC' equipes IN ('SSSC TOTVS', 'SSSC SENIOR', 'SSSC FLUIG') excluido = false # fechados (apuração de SLA)status = 'Concluído' AND data_finalizado IS NOT NULL status_sla_r = 'REALIZADO_NO_PRAZO' → dentrostatus_sla_r = 'REALIZADO_APOS_VENCIMENTO' → fora # abertosdata_finalizado IS NULL → somente leitura # decomposição de tempo por etapaVIEW_ESTATISTICAS_ETAPAS_2 → apenas chamados fechados
A view de etapas classifica o tempo em cinco totalizadores: sem atendimento, em atendimento, espera combinada (data acordada), espera do solicitante e espera de outros times. Requisição e incidente usam conjuntos de etapas diferentes por baixo — e a fila antiga tem nomes próprios — mas cada etapa é mapeada ao totalizador equivalente antes da soma. Esse mapeamento precisa ser preservado e revisado quando as novas etapas entrarem.
### 3.3 Estado atual da sustentação
Existe um painel em operação (DSPD-SSSC) com quatro abas: SLA e performance, Abertos, Reincidência e Aging. Ele cobre aderência ao SLA, fotografia dos abertos, reincidência e decomposição do tempo. As métricas S1 a S12 deste briefing são novas e dependem da parametrização descrita em 3.4; não existem na base hoje.
Limitações conhecidas do painel atual, a preservar na documentação de qualquer indicador derivado:a reincidência está subestimada porque o campo de recorrência é pouco preenchido e, ausente, conta como não reincidente; o aging considera apenas chamados fechados, o que torna a média conservadora; a projeção de SLA do mês é simulação, não previsão.
### 3.4 Parametrização do Acelerato — dependência bloqueante
Existe uma solicitação de mudança que traduz o PROC 30.000.010 em etapas, transições, campos e gatilhos. Dez das doze métricas de sustentação dependem dela estar em produção.
#### Etapas (11)
| Etapa | Responsável | SLA | Origem no PROC
| Novo | N1 | corre | 1 — Identificar e registrar
| Em triagem | N1 | corre | 2 e 3 — Categorizar e priorizar
| Em diagnóstico | N1 | corre | 7 — Diagnóstico inicial
| Em atendimento N1 | N1 | corre | 8 — Resolução ou contorno
| Aguardando atribuição | Fila | corre | 9 e exceção 4.1.2
| Em atendimento N2 | N2 | corre | 10 — Atuação técnica
| Em atendimento N3 | N3 / Especializado | corre | 10 e papel do N3
| Pendente | Responsável pelo chamado | pausa | Exceções 4.1.1 e 4.1.3
| Aguardando validação | Solicitante | pausa | 12 — Validar restabelecimento
| Encerrado | Responsável pelo chamado | parado | 15 — Encerrar incidente
| Arquivar | — | parado | —
Transição mais fácil de esquecer e mais crítica para as métricas: Aguardando validação → Em diagnóstico. Sem ela, o atendente abre chamado novo quando o solicitante informa que não resolveu, e a taxa de reabertura fica artificialmente baixa — o indicador melhora exatamente quando a qualidade piora. Validar explicitamente antes de apurar S8.
Regra correlata: escalação não reinicia SLA.O prazo é do chamado, não do nível. Nenhum gatilho de mudança de etapa pode tocar no relógio.
#### Campos personalizados (9)
| Campo | Tipo | Domínio | Obrigatório em
| Impacto | Lista | Alto · Médio · Baixo | Em triagem
| Urgência | Lista | Alta · Média · Baixa | Em triagem
| Prioridade ajustada manualmente | Sim/Não + texto | Justificativa obrigatória quando Sim | Reclassificação
| Motivo da escalação | Lista | Sem conhecimento técnico no N1 · Sem solução ou contorno conhecido · Risco de estouro de SLA · Múltiplos sistemas ou dependências · Necessidade de atuação especializada | Saída de Em diagnóstico
| Motivo de pendência | Lista | Aguardando fornecedor · Aguardando solicitante · Aguardando área vinculada · Aguardando janela de mudança | Entrada em Pendente
| Previsão de retorno | Data | — | Entrada em Pendente
| Motivo de encerramento | Lista | Resolução definitiva · Contorno aplicado · Reclassificado, não é incidente · Encerrado sem retorno · Duplicado | Encerramento
| Avaliação de Problema | Lista + texto | Aberto · Não aplicável, com justificativa | Encerramento
| Exceção de SLA por registro posterior | Sim/Não | — | Registro
| Incidente crítico coordenado | Sim/Não | Automático em P1, editável para P2 | —
#### Matriz de prioridade (Impacto × Urgência)
Urgência Alta Média Baixa Impacto Alto P1 P2 P3 Impacto Médio P2 P3 P4 Impacto Baixo P3 P4 P5 # prazos por prioridade — primeiro atendimento / restauraçãoP1 15 min / 4 h P4 4 h úteis / 5 dias úteis P2 30 min / 8 h úteis P5 1 dia útil / 10 dias úteis P3 2 h úteis / 2 dias úteis
#### O que não é nativo na ferramenta
Gatilhos do Acelerato leem apenas caixa de entrada, categoria, organização e etapa — não leem campo personalizado nem prioridade. Ações de workflow são as únicas que enxergam tempo decorrido. Fica para automação externa: cálculo da matriz de prioridade, marcação de crítico coordenado em P1, aceite em 15 minutos após escalação, vencimento da previsão de retorno e cadência de comunicação por prioridade.
## 04Regras de cálculo invioláveis
Decisões já tomadas. Alterar qualquer uma delas invalida a série histórica e exige registro da data da mudança no painel.
### 4.1 Marcos temporais do fluxo de projeto
| Marco | Evento | Alimenta
| entrada | Criação do card, no momento em que o pedido chega — não quando o trabalho começa | Lead time do cliente, backlog aging, entrada × saída
| compromisso | Entrada na coluna de priorizado/comprometido | Lead time da equipe
| inicio | Primeira entrada em coluna de execução | Cycle time, tamanho, aging WIP
| entrega | Disponível em produção para o usuário | Todas as métricas de tempo e vazão
| aceite | Confirmação do solicitante | Medido à parte — não entra no lead time do cliente
### 4.2 Convenções de cálculo
# tempounidade horas/dias ÚTEIS, calendário de expediente exceção explícita apenas para classes em regime de plantão # distribuiçõesjanela móvel de 12 semanas mínimo 20 itens concluídos na classe — abaixo disso NÃO publicar estatística percentis 50/85/95 — média nunca sozinha segmentação sempre por tipo de demanda e por granularidade # contagemunidade demanda entregável ao solicitante subtarefa NÃO conta como item na vazão reaberto reabre o original, tempo volta a contar + card de defeito vinculado para contagem de qualidade descartado sai do cálculo de tempo de ciclo entra na taxa de descarte com o tempo já consumido teste/rascunho quadro separado, fora de qualquer cálculo # bugjanela de atribuição bug vinculado até 30 dias após a entrega conta para o mês daquela entrega; depois disso entra como defeito em produção do mês corrente # colunasfila nome inicia por "Aguardando" ou "Pronto para" execução nome da atividade bloqueio marcado no card, NÃO move o card de coluna fila conta dentro do limite de WIP
### 4.3 Taxonomia de tipos de card
| Tipo | Definição | Natureza
| Incidente | Indisponibilidade ou erro em produção afetando a operação agora | Sustentação
| Requisição | Pedido padronizado e previsível: acesso, cadastro, relatório, parametrização simples | Sustentação
| Melhoria | Mudança em sistema existente que agrega capacidade nova | Evolução
| Iniciativa | Conjunto de entregas com objetivo e resultado declarados | Evolução
| Bug interno | Erro encontrado antes de chegar ao usuário: desenvolvimento, revisão, teste ou homologação | Qualidade — sem meta de volume
| Defeito em produção | Erro em algo já entregue, encontrado pelo usuário ou pela operação | Qualidade
| Dívida técnica | Trabalho sem valor visível ao usuário que reduz risco, custo ou esforço futuro | Evolução
Regra de desempate: um card tem um tipo só, e na dúvida vale o motivo pelo qual o trabalho existe, não a atividade executada.
### 4.4 Campos customizados exigidos no BusinessMap
| Campo | Formato | Preenchido em | Habilita
| area_solicitante | Lista fechada | Abertura | O14, T3, qualidade da entrada
| sistema_afetado | Lista fechada | Abertura | Custo por sistema, concentração
| origem_demanda | Lista fechada | Triagem | T5 demanda de falha
| fornecedor | Lista fechada | Ao bloquear | SLA real de terceiros
| data_acordada | Data | No compromisso | O12 acordos × vencidos
| responsabilidade_atraso | Interno / Solicitante / Terceiro | No vencimento, nunca depois | O12
| tamanho_declarado | P / M / G | Refinamento | O8, política de quebra
| objetivo_estrategico | Lista fechada | Aprovação da iniciativa | E2
| fase_deteccao | Lista fechada | Abertura do bug | O15 contenção e escape
| severidade | Crítica/Alta/Média/Baixa | Abertura do bug | O16
| causa_raiz | Lista fechada | Fechamento do bug | O17
| origem_bug | Vínculo com story ou frente | Abertura do bug | O17, O18 densidade
Domínios fechados
- Motivos de bloqueio:Aguardando fornecedor · Aguardando validação do negócio · Aguardando ambiente ou infraestrutura · Dependência de outra demanda · Falta de informação no chamado · Janela de mudança · Aguardando licença ou contrato
- Fase de detecção do bug:Desenvolvimento · Revisão de código · Teste interno · Homologação do negócio · Produção
- Causa raiz do bug:Requisito ausente ou ambíguo · Regra de negócio não mapeada · Erro de implementação · Regressão · Integração com terceiro · Ambiente e massa de teste · Configuração e parametrização
- Origem da demanda (demanda de falha):erro em entrega anterior · configuração incorreta · falta de treinamento do usuário · informação não repassada · processo manual que deveria estar automatizado
Princípio de design dos campos:nenhum campo obrigatório sem métrica que dependa dele. Campo que ninguém lê é atrito na abertura e acaba preenchido com qualquer coisa — pior do que não existir.
### 4.5 Modelo de dados analítico
# três tabelas sustentam todas as métricas do BusinessMapdim_card 1 linha por card card_id · tipo · classe_servico · sistema · area_solicitante · fornecedor objetivo_estrategico · card_pai · criado_em · comprometido_em · iniciado_em concluido_em · arquivado_em · motivo_descarte · responsaveis · tamanho_declarado fato_transicao 1 linha por movimentação card_id · coluna_origem · coluna_destino · tipo_coluna(fila|execucao) usuario · timestamp · direcao(avanco|retorno) fato_bloqueio 1 linha por bloqueio card_id · motivo · coluna_em_que_bloqueou · fornecedor inicio · fim · duracao_horas_uteis
## 05Frentes de trabalho e tarefas
Seis frentes, 32 tarefas. Cada tarefa traz objetivo, passos, critério de pronto e dependências. As dependências usam os identificadores das próprias tarefas.
### WS1 · Configuração do BusinessMap
Precede tudo. Sem isso, qualquer coleta produz indicador que será descartado na primeira revisão.
#### T1.1Classificar e renomear colunas em fila e execução
ObjetivoTornar possível medir espera separadamente de trabalho efetivo, em todos os quadros. Passos
- Inventariar todas as colunas de todos os quadros (gerente, coordenadores, times).
- Classificar cada coluna como fila ou execução.
- Renomear as de fila para começarem com "Aguardando" ou "Pronto para".
- Garantir que nenhuma coluna de fila esteja fora do limite de WIP.
Pronto quando100% das colunas classificadas, mapa de equivalência entre quadros documentado e nenhuma coluna de fila fora do limite. Depende de—
#### T1.2Padronizar tipos de card entre quadros
ObjetivoGarantir que o mesmo tipo signifique a mesma coisa em todos os quadros, viabilizando consolidação. Passos
- Aplicar a taxonomia da seção 4.3 em todos os quadros.
- Mapear os tipos existentes para os novos e migrar o histórico quando possível.
- Registrar os casos em que a migração não é possível, para exclusão das séries anteriores.
Pronto quandoTodos os quadros usam a mesma lista de tipos e existe tabela de-para do histórico. Depende de—
#### T1.3Criar campos customizados e domínios fechados
ObjetivoHabilitar as métricas que dependem de dimensão, não apenas de tempo. Passos
- Criar os 12 campos da seção 4.4 com os formatos e domínios especificados.
- Configurar obrigatoriedade na etapa indicada, não na criação do card.
- Criar as quatro listas fechadas de domínio.
Pronto quandoCampos criados, domínios populados e obrigatoriedade testada em um card de cada tipo. Depende deT1.2
#### T1.4Definir e aplicar limites de WIP
ObjetivoTornar o limite visível e mensurável por coluna e por fluxo. Passos
- Acordar limite por coluna e por fluxo com cada equipe.
- Configurar no editor de workflow e verificar a sinalização de estouro.
- Incluir limite de frentes simultâneas por equipe e por projeto nos quadros dos coordenadores.
- Incluir limite de bugs abertos por equipe.
Pronto quandoLimites configurados em todos os quadros e data de revisão trimestral agendada. Depende deT1.1
#### T1.5Corrigir o marco de entrada da demanda
ObjetivoFazer o card nascer na chegada do pedido, não no início do trabalho. Passos
- Mapear por onde as demandas chegam hoje em cada equipe.
- Ajustar o ponto de criação do card e orientar quem recebe.
- Criar coluna de entrada/backlog onde não existir.
Pronto quandoEm amostra de 20 cards recentes, a data de criação corresponde à chegada do pedido e não ao início da execução. Depende deT1.1
Sem esta tarefa não existem as métricas O9 (três relógios), O10 (backlog aging), T1 (lead time ponta a ponta) e o indicador transversal de espera invisível. É a tarefa de maior alcance da WS1.
#### T1.6Auditar e corrigir vínculos pai/filho
ObjetivoEliminar capacidade invisível no nível de portfólio. Passos
- Gerar relatório de cards filhos sem pai, por quadro, excluindo tipos de sustentação.
- Corrigir os vínculos faltantes com os coordenadores.
- Instituir a lista de exceções com revisão semanal.
Pronto quandoRelatório de órfãos gerado, vínculos corrigidos e rotina de revisão semanal ativa. Depende deT1.2
#### T1.7Marcar escopo adicionado após o início
ObjetivoTornar o crescimento de escopo mensurável em vez de percebido. Passos
- Definir a marcação de frentes criadas após o início da execução do projeto pai.
- Aplicar retroativamente onde a data de criação permitir inferir.
Pronto quandoMétrica T9 pode distinguir escopo original de escopo adicionado em todos os projetos ativos. Depende deT1.6
### WS2 · Extração e base analítica
Coletor, modelo de dados e biblioteca de cálculo. O que o módulo de Analytics não entrega sai daqui.
#### T2.1Levantar a especificação da API e mapear campos
ObjetivoEvitar coletor escrito sobre nomes de campo presumidos. Passos
- Obter a especificação OpenAPI do subdomínio.
- Mapear cada campo do modelo da seção 4.5 ao campo correspondente na API.
- Registrar os campos que não existem e precisam vir de revisions ou de webhook.
Pronto quandoTabela de-para completa publicada, com lacunas identificadas. Depende deT1.3
#### T2.2Implementar coleta incremental agendada
ObjetivoGuardar os eventos fora do BusinessMap, de forma incremental e não destrutiva. Passos
- Coletor diário de cards, revisões, vínculos, campos customizados e bloqueios.
- Carga incremental com chave natural; nunca sobrescrever histórico.
- Preservar cards arquivados e excluídos.
- Log de execução com contagem de registros e falhas.
Pronto quandoSete execuções consecutivas sem falha, com reconciliação de contagem contra a ferramenta e cards arquivados presentes na base. Depende deT2.1
#### T2.3Capturar transições por webhook
ObjetivoRegistrar mudanças de coluna no instante em que ocorrem, sem depender de varredura. Passos
- Criar Business Rule de mudança de coluna chamando serviço web.
- Receber, normalizar e gravar o evento em fato_transicao.
- Rodar em paralelo à coleta por API e reconciliar divergências.
Pronto quandoDivergência entre webhook e API abaixo de 1% em uma semana de operação paralela. Depende deT2.2
#### T2.4Construir a base analítica
ObjetivoMaterializar dim_card, fato_transicao e fato_bloqueio conforme a seção 4.5. Passos
- Criar as três tabelas com os campos especificados.
- Derivar os marcos temporais da seção 4.1 a partir das transições.
- Classificar cada transição em avanço ou retorno e cada coluna em fila ou execução.
Pronto quandoPara 20 cards sorteados, os quatro marcos derivados conferem com a inspeção manual do histórico. Depende deT2.2 · T1.1
#### T2.5Biblioteca de cálculo compartilhada
ObjetivoGarantir que todas as métricas usem a mesma definição de tempo e de percentil. Passos
- Função de horas úteis com calendário de expediente e feriados.
- Função de percentil com janela móvel de 12 semanas e mínimo de 20 itens.
- Simulação de Monte Carlo parametrizável por filtro de classe, sistema e período.
- Teste unitário para cada função, com casos de borda documentados.
Pronto quandoTestes passando e nenhuma métrica implementada com cálculo próprio de tempo ou percentil. Depende deT2.4
#### T2.6Controle de versão de critérios
ObjetivoImpedir que mudança silenciosa de definição apareça como melhoria de indicador. Passos
- Registrar data e descrição de cada mudança de critério de cálculo.
- Exibir a marcação no painel e alertar quando a comparação atravessar a data.
Pronto quandoQualquer gráfico que cruze uma data de mudança exibe a marcação automaticamente. Depende deT2.5
### WS3 · Painéis do fluxo de projeto
Um painel por nível de voo, mais o indicador transversal. Especificação das métricas na seção 6.
#### T3.1Painel operacional (FL1)
ObjetivoEntregar as 18 métricas O1 a O18 em visão de equipe, para uso diário e semanal. Passos
- Implementar o núcleo primeiro: O1, O2, O3, O4, O7, O9, O10, O12, O15, O18.
- Filtros por equipe, tipo de demanda, sistema e período.
- Visões default por cadência: diária (O2, bloqueios, O1) e semanal (O3, O4, O6).
Pronto quandoNúcleo disponível, cada métrica reconciliada contra o Analytics nativo onde houver equivalente, divergências explicadas por escrito. Depende deT2.5
#### T3.2Painel tático (FL2)
ObjetivoEntregar T1 a T9, incluindo fluxo de frentes e avanço real de projeto. Passos
- Implementar o núcleo: T1, T2, T3, T4, T5, T7, T9.
- Consolidar por projeto a partir dos vínculos pai/filho.
- Incluir o Monte Carlo segmentado (T6) usando a função da T2.5.
Pronto quandoAvanço de projeto calculado exclusivamente por frentes filhas concluídas, com crescimento de escopo ao lado. Depende deT3.1 · T1.6 · T1.7
#### T3.3Painel estratégico (FL3)
ObjetivoEntregar E1 a E5 em visão de portfólio, para revisão mensal e trimestral. Passos
- Implementar E1, E2, E3 como núcleo.
- E5 reutilizando a simulação, agora sobre vazão de frentes.
- Ficha de resultado esperado por iniciativa, preenchida antes do início (E3).
Pronto quandoTodo projeto ativo tem objetivo estratégico associado ou está explicitamente classificado como manutenção ou obrigação legal. Depende deT3.2
#### T3.4Indicador transversal de espera invisível
ObjetivoExpor, em cada nível, a fração do tempo do cliente que não estava sob gestão da equipe. Passos
- Calcular (visao_cliente - visao_time) / visao_clientesobre as medianas, por nível.
- Apresentar as duas visões sempre lado a lado, nunca isoladas.
Pronto quandoIndicador disponível nos quatro níveis e nenhuma visão publicada isoladamente. Depende deT3.1 · T1.5
### WS4 · Parametrização do Acelerato
Dependência externa. Acompanhamento e validação, não implementação de métrica.
#### T4.1Acompanhar a entrada em produção das etapas e campos
ObjetivoGarantir que a solicitação de mudança seja implementada como especificada. Passos
- Conferir as 11 etapas, o comportamento de SLA de cada uma e as transições permitidas.
- Conferir os 9 campos com formatos, domínios e obrigatoriedade.
- Replicar a configuração de workflow para cada equipe com fluxo distinto.
Pronto quandoChamado de teste percorre todos os caminhos previstos, incluindo pendência, escalação e validação. Depende de—
#### T4.2Validar a transição de retomada
ObjetivoImpedir que a taxa de reabertura seja medida artificialmente baixa. Passos
- Verificar que Aguardando validação → Em diagnósticoestá liberada.
- Testar o caminho completo: restauração, validação negada, retomada.
- Orientar os atendentes a não abrir chamado novo nesse cenário.
Pronto quandoTransição liberada, testada e orientação comunicada às equipes. Depende deT4.1
#### T4.3Implementar as automações externas
ObjetivoCobrir o que os gatilhos nativos não alcançam. Passos
- Cálculo da matriz Impacto × Urgência, com reclassificação manual prevalecendo sobre o cálculo.
- Marcação de crítico coordenado em P1.
- Alerta de aceite não realizado em 15 minutos após escalação.
- Alerta de vencimento da previsão de retorno.
- Cadência de comunicação por prioridade.
Pronto quandoCada automação testada e com registro no chamado, sem tocar no relógio de SLA. Depende deT4.1
#### T4.4Revisar o mapeamento de etapas da view de aging
ObjetivoManter a decomposição em cinco totalizadores válida após a mudança de etapas. Passos
- Mapear cada etapa nova ao totalizador equivalente.
- Verificar continuidade da série histórica e registrar a data da mudança.
Pronto quandoTotalizadores somam o tempo de vida completo e a quebra de série está documentada. Depende deT4.1
### WS5 · Painéis de sustentação
Doze métricas sobre a base do Acelerato. Dez delas só existem após a WS4.
#### T5.1Camada de consultas base
ObjetivoPadronizar o recorte da população e evitar divergência entre indicadores. Passos
- Views com o recorte DSPD-SSSC da seção 3.2.
- Segregar sempre os casos de exceção de SLA por registro posterior.
- Expor os filtros compartilhados: equipe, agente, período.
Pronto quandoContagem de fechados e de abertos reconcilia com o painel atual dentro de 1%. Depende de—
#### T5.2Métricas de tempo e aderência (S1, S2, S9, S10)
ObjetivoMTTA, MTTR, aderência por prioridade, tempo em pendência e fila de atribuição. Passos
- Apurar por prioridade, nunca agregado.
- Separar o prazo de primeiro atendimento do de restauração.
- Documentar no painel que o valor é tempo útil com pendências descontadas do relógio de resolução.
Pronto quandoIndicadores disponíveis por prioridade, com exceções segregadas e nota metodológica visível. Depende deT5.1 · T4.1
#### T5.3Métricas de carga (S3, S4, S12)
ObjetivoVolume por prioridade, resolução por nível e volume por sistema. Passos
- S3 em volume absoluto e em proporção, por mês.
- S4 a partir da etapa de atendimento, que é a fonte da verdade do nível — não da atribuição de time.
- S12 com destaque dos recorrentes.
Pronto quandoSoma das faixas de prioridade confere com o total de chamados do período. Depende deT5.1 · T4.1
#### T5.4Métricas de qualidade (S5, S6, S7, S8, S11)
ObjetivoMotivos de escalação e encerramento, reclassificação, reabertura e avaliação de Problema. Passos
- Distribuições sobre os domínios fechados dos campos.
- S7 separando reclassificação de prioridade de reclassificação de tipo.
- S11 com aderência e taxa de conversão em Registro de Problema.
Pronto quandoMétricas disponíveis e taxa de reabertura validada contra a transição de retomada (T4.2). Depende deT5.1 · T4.2
#### T5.5Rotina de agrupamento das justificativas de reclassificação
ObjetivoChegar a um domínio fechado de motivos de reclassificação a partir do texto livre. Passos
- Extrair trimestralmente as justificativas do campo livre.
- Agrupar manualmente na primeira rodada e identificar padrões recorrentes.
- Propor lista fechada quando os agrupamentos estabilizarem.
Pronto quandoPrimeira rodada de agrupamento concluída e proposta de domínio apresentada. Depende deT5.4
### WS6 · Governança
Métrica sem reunião correspondente não gera decisão e não sobrevive ao segundo mês.
#### T6.1Instituir os rituais e suas pautas
ObjetivoAmarrar cada métrica a uma reunião com dono e pergunta fixa de abertura. Passos
- Daily de fluxo (15 min): O2, bloqueios, O1 — "qual item mais velho não andou desde ontem?"
- Revisão de fluxo semanal (30 min): O3, O4, O5, O6 e, mensalmente, O7 — "o que mudou na nossa distribuição de tempo?"
- Reunião de serviço quinzenal (45 min): T1, T2, T5 — "estamos cumprindo o que publicamos?"
- Reposição e priorização quinzenal: T3, T4 — "o que entra, e o que sai da fila para isso caber?"
- Revisão de portfólio mensal: E1, E4 — "estamos terminando ou só começando?"
- Revisão estratégica trimestral: E2, E3 — "o que entregamos mudou algum número do negócio?"
Pronto quandoRituais agendados com participantes definidos e responsável por levar o dado. Depende deT3.1
#### T6.2Calcular e publicar os SLE
ObjetivoSubstituir negociação de prazo item a item por compromisso por classe de serviço. Passos
- Aguardar 60 dias de dados limpos após a WS1.
- Calcular o percentil 85 por classe, com mínimo de 20 itens.
- Publicar às áreas junto com o lead time ponta a ponta e a relação demanda × capacidade.
Pronto quandoSLE publicado por classe, com a base amostral declarada ao lado de cada número. Depende deT3.1 · 60 dias após T1.5
#### T6.3Comunicar o limite de uso das métricas
ObjetivoGarantir registro honesto, condição sem a qual todo o resto perde sentido. Passos
- Comunicar às equipes, antes da publicação do primeiro painel, que nenhuma métrica será usada em avaliação individual.
- Explicitar, no caso dos bugs, que o que se cobra é a taxa de escape e não o volume de bugs internos.
Pronto quandoComunicação feita e registrada antes de qualquer painel ir ao ar. Depende de—
#### T6.4Rotinas de higiene recorrentes
ObjetivoImpedir degradação silenciosa da qualidade do dado. Passos
- Revisão mensal do backlog: item acima de 180 dias recebe decisão de manter ou encerrar, com motivo.
- Revisão semanal da lista de cards filhos sem pai.
- Revisão trimestral das listas fechadas: motivo frequente em "outros" vira categoria; categoria sem uso há dois trimestres sai.
- Revisão trimestral dos limites de WIP.
Pronto quandoRotinas agendadas com responsável nomeado. Depende deT1.6
## 06Catálogo de métricas
Especificação de cada métrica: cálculo resumido, origem do dado e meta. Métricas marcadas com •compõem o núcleo de adoção imediata; as demais ficam catalogadas e são implementadas sob demanda.
### FL1 · Operacional — 18 métricas
| ID | Métrica | Cálculo | Exige | Meta
| O1 • | WIP e aderência ao limite | Itens em execução por coluna e no fluxo, contra o limite acordado; bloqueados contam como WIP | T1.1, T1.4 | Dentro do limite em 90% dos dias
| O2 • | Idade do trabalho em progresso | Dias desde o início, por card aberto, posicionado na etapa e comparado aos percentis históricos | T2.4 | Nenhum item acima do P95 sem plano
| O3 • | Tempo de ciclo e SLE | Distribuição início→entrega por percentis 50/85/95, segmentada por tipo | T2.5 | Reduzir o P85 em 20% no semestre
| O4 • | Vazão | Itens concluídos por semana; acompanhar faixa, não só média | T2.4 | Reduzir a amplitude da variação
| O5 | Eficiência de fluxo | Tempo em execução ÷ tempo de ciclo total, descontando fila e bloqueio | T1.1 | +10 pontos em dois trimestres
| O6 | Índice de previsibilidade | P85 ÷ P50do lead time, por classe, janela de 12 semanas | T2.5 | Abaixo de 2,5
| O7 • | Entrada × saída por tipo | Cards criados e concluídos por mês, empilhados por tipo; saldo mensal e acumulado | T1.2, T1.5 | Saída ≥ entrada por tipo no trimestre
| O8 | Tamanho das demandas | Mediana, média e % acima do P85 do tempo em execução; comparar com tamanho declarado | T1.3 | Reduzir a cauda acima do P85
| O9 • | Três relógios | Lead time do cliente (entrada→entrega), da equipe (compromisso→entrega) e cycle time (início→entrega) | T1.5 | Reduzir a distância entre cliente e cycle
| O10 • | Envelhecimento do backlog | Idade dos itens não iniciados, por faixa e por tipo; visões de equipe e de cliente | T1.5 | Nenhum item >180d sem decisão
| O11 | Composição do backlog | Itens em definição × prontos para execução, por mês e por tipo | T1.1 | Backlog pronto em poucas semanas de vazão
| O12 • | Acordos × vencidos | Compromissos com data acordada, vencidos e % — separado por responsabilidade do atraso | T1.3 | Zero vencidos por causa interna
| O13 | Vazão de defeitos | Volume mensal de defeitos, absoluto e como % da vazão total | T1.2 | Reduzir defeitos em produção
| O14 | Origem da demanda | Ranking de áreas, clientes ou sistemas por volume, decomposto por tipo | T1.3 | Revisar os 3 maiores geradores de correção
| O15 • | Contenção de bugs | Distribuição por fase de detecção; taxa de contenção (antes da homologação) e taxa de escape (produção) | T1.3 | Elevar contenção, reduzir escape
| O16 | Estoque e idade de bugs | Entrada × correção, abertos por severidade, idade dos mais antigos, densidade por entrega | T1.3, T1.4 | Estoque estável ou decrescente
| O17 | Causa raiz e concentração | Distribuição por causa raiz e por módulo ou sistema de origem | T1.3 | 3 maiores causas com ação trimestral
| O18 • | Vazão com e sem bug | Cards entregues sem nenhum bug vinculado × com ao menos um; densidade geral e entre os afetados | T1.3 | Elevar a taxa de entrega limpa
### FL2 · Tático — 9 métricas
| ID | Métrica | Cálculo | Exige | Meta
| T1 • | Lead time ponta a ponta | Entrada→entrega, decomposto em fila, espera, execução e homologação | T1.5 | Publicar por classe e reduzir a fila
| T2 • | Aderência ao SLE | % entregue dentro do SLE publicado, com a etapa em que o tempo foi perdido | T6.2 | 85% por classe
| T3 • | Alocação por classe | Distribuição da capacidade entre sustentação, evolução, projetos e dívida técnica; acordado × realizado | T1.2 | Desvio máximo de 10 pontos
| T4 • | Demanda × capacidade | Chegada × vazão; semanas_para_zerar = backlog ÷ (vazao - chegada)por classe | T1.5 | Razão entre 0,9 e 1,0
| T5 • | Demanda de falha | % da demanda originada por falha anterior, por sistema e por área | T1.3 | −15% ao semestre nos 2 piores
| T6 | Previsão probabilística | Monte Carlo sobre vazão histórica filtrável; devolver P50, P85 e P95 | T2.5 | Compromisso externo sempre no P85
| T7 • | Fluxo de frentes | WIP, tempo de ciclo e envelhecimento de features e pacotes; frentes simultâneas por projeto | T1.6 | Limite explícito de frentes
| T8 | Sprint | % do comprometido entregue, carry-over e entrada não planejada | T1.2 | Reduzir a entrada não planejada
| T9 • | Avanço real e escopo | Frentes concluídas ÷ total, calculado pelos filhos; e frentes adicionadas após o início | T1.6, T1.7 | Avanço sempre calculado, nunca declarado
### FL3 · Estratégico — 5 métricas
| ID | Métrica | Cálculo | Exige | Meta
| E1 • | Lead time de projetos | Aprovação na comissão→entrega, decomposto entre antes e depois do início | T1.6 | −25% da mediana ao ano
| E2 • | Capacidade por objetivo | % da capacidade entregue por objetivo estratégico, com faixa de obrigação legal e de fora de objetivo | T1.3 | ≥60% da evolução vinculada
| E3 • | Entrega × resultado | Ganho medido ÷ ganho previsto por iniciativa, declarado antes do início | Ficha de resultado | 100% com resultado declarado
| E4 | Iniciadas × concluídas | Projetos iniciados e concluídos por trimestre, acumulado em aberto; e proporção manter × evoluir | T1.6 | Concluir mais que iniciar em 2 trimestres
| E5 | Previsão de término | Monte Carlo sobre vazão de frentes; apresentar sempre ao lado do crescimento de escopo | T2.5, T1.7 | Data comunicada no P85
### Transversal
| ID | Métrica | Cálculo | Exige | Meta
| EI • | Espera invisível | (visao_cliente − visao_time) ÷ visao_clientesobre medianas, calculado nos quatro níveis | T1.5 | Reduzir; acima de 50% a discussão é de fila
### Sustentação · Acelerato — 12 métricas
| ID | Métrica | Cálculo | Exige | Meta
| S1 • | MTTA e MTTR por prioridade | Abertura→primeiro atendimento e abertura→restauração validada, contra o alvo da matriz; exceções segregadas | T4.1 | Matriz de prioridade vigente
| S2 • | Aderência ao SLA por prioridade | % dentro do prazo, separando primeiro atendimento de restauração, por faixa P1–P5 | T4.1 | Acima de 90%
| S3 • | Volume mensal por prioridade | Contagem por faixa, em absoluto e em proporção; cruzar com S7 | T4.1 | Proporção de P1/P2 estável
| S4 • | Resolução por nível | Volume resolvido em N1, N2, N3 e fornecedor; tempo médio em cada etapa | T4.1 | Sem meta isolada
| S5 • | Motivos da escalação | Distribuição sobre os 5 valores do domínio fechado | T4.1 | Reduzir escalação por falta de conhecimento
| S6 • | Motivos de encerramento | Distribuição sobre os 5 valores, com destaque para a taxa de contorno | T4.1 | Acompanhamento contínuo
| S7 • | Reclassificação | Ajustes manuais de prioridade e encerramentos como "não é incidente", medidos separadamente | T4.1 | Sempre justificada; reduzir a de tipo
| S8 | Taxa de reabertura | % de incidentes reabertos por reincidência do mesmo sintoma em curto intervalo | T4.2 | Inferior a 5%
| S9 | Tempo em pendência | Tempo pausado por motivo e cumprimento da previsão de retorno | T4.1 | Previsão cumprida
| S10 | Fila de atribuição | Distribuição do tempo entre escalação e aceite, contra o limite de 15 minutos | T4.1 | Aceite em 15 min
| S11 | Avaliação de Problema | % de P1, P2 e encerrados por contorno com avaliação registrada; e taxa de conversão em Registro de Problema | T4.1 | 100% de avaliação registrada
| S12 | Volume por sistema | Distribuição por categoria ou sistema, com recorrentes destacados; e % com registro posterior | T4.1 | Tendência de redução do registro posterior
Lacuna conhecida:a sustentação não tem métrica de valor ou de percepção. A pesquisa trimestral de fit for purposecom os gestores das áreas atendidas é a candidata natural a preencher esse espaço e não está especificada neste briefing.
## 07Restrições e armadilhas
### 7.1 Métricas proibidas
Não implementar, não expor e não derivar. Se alguma dessas aparecer como requisito durante a execução, recusar e sinalizar.
- Produtividade individual(cards por pessoa) como visão principal ou como meta.
- Velocidade em pontos como meta.Pontos são inflacionáveis; a meta é atingida inflacionando a estimativa.
- Comparação entre times.Contextos e granularidades diferentes tornam a comparação sem significado.
- Percentual de conclusão de tarefa.Item 90% pronto entrega zero valor.
- Média de tempo de ciclo isolada, sem percentis ao lado.
- Horas apontadascomo proxy de esforço entregue.
### 7.2 Metas que não devem ser criadas
| Não criar meta de | Porque | Medir no lugar
| Volume de bugs internos | Cobrado o volume, a equipe para de registrar; o indicador melhora e a qualidade piora | Taxa de escape (O15)
| Taxa de resolução no N1 | Induz a segurar chamado que deveria escalar; o custo reaparece no MTTR | S4 lido ao lado de S1 e S8
| Aderência de sprint em 100% | Atingida comprometendo menos, não entregando mais | Entrada não planejada (T8)
| Tamanho médio isolado | Melhora fatiando cards artificialmente | O8 ao lado de O4 e O3
### 7.3 Armadilhas de implementação
- Coluna de espera fora do limite de WIP.O indicador melhora e a entrega piora. Toda fila conta como WIP.
- Motivo em campo de texto livre.Inviabiliza agrupamento. Domínio fechado sempre, com revisão trimestral.
- Classificação retroativa de responsabilidade.O campo de responsabilidade do atraso é preenchido no vencimento, não depois — classificado depois, vira narrativa.
- Percentil sobre amostra pequena.Abaixo de 20 itens o número existe mas não se publica.
- Mistura de granularidades.Story, frente e projeto nunca no mesmo histograma.
- Histórico descartado.Card arquivado nunca é excluído da base analítica.
- Faixas largas de histograma.Para classes rápidas, faixas de 0–10 dias agrupam quase tudo numa barra e a distribuição desaparece.
- Janela de atribuição de bug ausente.Sem o corte de 30 dias, nenhum mês fecha e a série muda sozinha toda semana.
### 7.4 Período de calibração
Os primeiros 30 a 60 dias de dados após as mudanças de configuração servem para calibrar, não para cobrar. Percentis calculados sobre histórico inconsistente produzem compromissos que não se sustentam, e o primeiro SLE publicado sobre base suja compromete a credibilidade de todo o conjunto.
## 08Entregáveis esperados
| Entregável | Frente | Formato
| Inventário de colunas classificadas e mapa de equivalência entre quadros | WS1 | Planilha ou documento
| Tabela de-para dos tipos de card, com histórico migrado | WS1 | Planilha + execução na ferramenta
| Campos e domínios configurados | WS1 | Configuração na ferramenta + print de evidência
| Relatório de cards filhos sem pai | WS1 | Consulta recorrente
| Tabela de-para API ↔ modelo de dados | WS2 | Documento técnico
| Coletor agendado com log de execução | WS2 | Código versionado
| Base analítica com as três tabelas | WS2 | Esquema + carga histórica
| Biblioteca de cálculo com testes | WS2 | Código versionado
| Painéis FL1, FL2 e FL3 | WS3 | Painel com filtros e visões por cadência
| Nota de reconciliação contra o Analytics nativo | WS3 | Documento curto por métrica divergente
| Evidência de teste da parametrização do Acelerato | WS4 | Roteiro de teste executado
| Automações externas implementadas | WS4 | Código ou fluxo versionado
| Camada de consultas e painel de sustentação | WS5 | Views SQL + painel
| Proposta de domínio fechado de motivos de reclassificação | WS5 | Documento curto
| Calendário de rituais com donos | WS6 | Agenda + pauta padrão
| SLE publicado por classe de serviço | WS6 | Comunicado às áreas
| Comunicado do limite de uso das métricas | WS6 | Comunicado às equipes
### Sequência recomendada
Semanas 1–2 WS1 completa · T4.1 iniciada · T6.3 Semanas 3–8 WS2 (T2.1 a T2.5) · calibração, sem publicar indicador T3.1 em construção com o núcleo operacional Semanas 9–12 T6.2 (SLE) · T3.1 publicado · T6.1 rituais iniciados WS4 concluída · WS5 iniciada Mês 4 em diante WS3 completa (T3.2, T3.3, T3.4) · WS5 concluída T6.4 rotinas de higiene em operação
### Antes de concluir qualquer frente
- Nenhuma métrica publicada com base amostral abaixo do mínimo, sem a base declarada ao lado.
- Nenhuma visão individual como tela principal de qualquer painel.
- Toda divergência contra a ferramenta de origem explicada por escrito, não ajustada no cálculo.
- Toda decisão de regra de negócio tomada durante a execução registrada e devolvida para validação.
Briefing de execução derivado da proposta de métricas ágeis do departamento. Os valores numéricos citados como exemplo são ilustrativos e não servem de baseline. Qualquer alteração às regras da seção 4 exige registro de data e invalida a comparação histórica que atravesse essa data.
Fontes de referência: PROC 30.000.010 Gestão de Incidentes de Sistemas · anexo de parametrização do Acelerato · painel DSPD-SSSC em operação · documentação da API e do módulo de Analytics do BusinessMap.