# Retrospectiva do pedido 036: pendências das métricas estratégicas (2026-10-20)

Fontes: `docs/pedidos/036-estrategicas-pendentes.md`, `docs/kanban/conferencias.md` (linhas do 036) e `docs/kanban/historico.md` (K-091, K-118, K-119 de 20/10). Métricas do processo, não de agentes. Amostra de 3 cartões: valores brutos, sem percentil. Custo (`forge-check transcricao custo`): não medido nesta retrospectiva.

## 1. Dados do fluxo
| Cartão | Item | Entrada | Em andamento | Pronto | Lead time | Cycle time | Observação |
|---|---|---|---|---|---|---|---|
| K-118 | E1, FA-006 | 21:30 | 21:30 | 21:59 | 28 min | 28 min (17 min bloqueado) | Não reproduziu (CLS 0,021 em api); sem código |
| K-091 | E2, IFA-001 | 21:30 | 21:59 (voltou a "Pronto para fazer" às 21:31 por R-WIP) | 23:16 | 1 h 46 min | 1 h 17 min | Passou por review e QA |
| K-119 | E3, texto do E7 | 21:39 | 21:39 | 23:16 | 1 h 37 min | 1 h 37 min | Passou por review, QA e UX |

- Vazão: 3 cartões em Pronto no dia; 2 deles juntos no merge do #133 (568ea48).
- Bloqueio: 1, K-118, 17 min (21:34 a 21:51), "Aguardando o dono": faltava `libnspr4.so` para o Chromium do Playwright (sudo).
- Retrabalho: 0 devoluções (nenhum `Code review -> Em andamento`, nenhum bug). Review aprovado sem bloqueante, QA aprovado com 0 bug, UX aprovada sem achado.
- Idade do WIP: 0 itens abertos ao fim.
- DORA (1 PR): frequência, 1 PR na develop; lead time de mudança, do primeiro commit da branch (21:4x) ao merge 23:03, cerca de 1 h 20 min (aproximado, commit exato não medido); taxa de falha, 0 de 1 (CI da develop verde no 568ea48); tempo de recuperação, sem falha. Velocidade e estabilidade juntas: sem sinal de piora, mas 1 amostra.
- Clareza: 1 pergunta na fila (E7, respondida "A"), 1 `NAO-ENTENDI` (merge do #133 pela conta do dono), itens do pedido: 3 confirmado, 1 suposição, 0 delegado (0%, abaixo do limite de 30%), 0 mudança de escopo, 0 `DEVOLVIDA`.
- Inconsistência de quadro (auditoria): K-118 foi para Pronto às 21:59 sem passar por review, QA e merge do usuário (justificável: nenhum código mudou, mas a política "Pronto só com o merge do usuário" não prevê exceção).

## 2. Rodadas do conferente (linhas do 036 em `conferencias.md`)
17 rodadas de brief em 11 briefs; 6 reprovadas (35%). Entregas: 4 "não cumpriu" nas linhas lidas (ux-1, qa-3, qa-5, tech-lead-3).

| Classe | Rodadas | Detalhe |
|---|---|---|
| Erro do Jarvis (brief ou conferência) | 5 | react-1 r1 (E3.2 do próprio destino citada no Fora do escopo); tech-lead-3 r1 (limpeza marcada em vez da etapa E1.5, R-FLUXO) e r2 (K-118 atribuído ao A1, texto igual desde a r1, "tardio"); entrega ux-1 (brief pedia commit a agente sem Bash); entrega qa-5 (Base-sha fora da branch e intervalo com commits ainda sem conferência) |
| Falha conhecida M16 do conferente (corte lido contra o forge-check, tardio) | 3 puras + 2 parciais | react-1 r2, qa-2 r1, qa-3 r1; parcial em tech-lead-3 r1 e r2 ("M16 na E1.3") |
| Mérito (achado procedente do conferente) | 3 | react-1 r1; tech-lead-3 r1 (parcial) e r2; entrega qa-3 (commit 154f43a sem `Cartão: K-091`, praticas §9; contornado na mensagem do squash) |
| Causa externa | 1 | entrega tech-lead-3: merge pela conta do dono via web, fora do fluxo do agente |

Leitura: a maior parte do custo da conferência foi retrabalho de brief antes de qualquer código (cerca de 6 rodadas extras, minutos cada, mas em série com a delegação). O mérito real foi pequeno (campos de brief e a linha `Cartão:`). As M16 repetidas (3 em 1 pedido) são o mesmo defeito, já conhecido, que a fábrica ainda não corrigiu.

## 3. O caso do merge pela conta do dono antes dos checks
Fatos (do pedido): PR #133 aberto às 23:01 pela conta dos agentes; às 23:03:32 a conta `rodrigo-isensee` fez "Update branch" (c03a960) e às 23:03:41 o squash merge (568ea48), antes de os checks do PR terminarem. O tech-lead só esperava os checks; a tentativa dele às 23:11 recebeu "already merged". O dono disse que acredita não ter sido ele (`NAO-ENTENDI`); a investigação das sessões da conta foi levada ao dono.
Efeitos: (a) merge sem checks do PR concluídos (o CI do push na develop ficou verde, então não houve dano); (b) a linha `Cartão: K-118` não entrou no squash e a mensagem foi a do botão web; (c) conferência de entrega do tech-lead-3 "não cumpriu" por causa externa; (d) o fluxo planejado (checks, mensagem do squash com as linhas de cartão) não pôde ser aplicado.
Causa de processo: a proteção da develop não obriga os checks do PR passarem antes do merge, e a conta com permissão de merge pode ser usada sem aviso. Se a origem foi uma sessão automatizada com a credencial do dono, é um risco de credencial, não de fluxo; fica com o dono investigar.

## 4. Revalidação extra de review e QA depois da revisão de UX
Sequência: review aprovado (fc9ecf2, 22:24) e QA aprovado (97f8545, 22:45) vieram antes da revisão de UX; o UX gravou o parecer sem commit (sem Bash) e o tech-lead o commitou (90d35a6). Esse commit deixou o parecer de QA desatualizado para o `forge-check pr`; o tech-lead revalidou o review por delta (fe6a50a), o QA foi chamado de novo (qa-5, 0e4fbf7) e o PR só abriu às 23:01. Custo: 2 delegações adicionais (tech-lead-2 parou antes do PR; qa-5) e cerca de 15 min entre 22:47 e 23:01, mais 1 conferência com falhas do Jarvis. Causa: a ordem do projeto põe o UX (passo 5) depois do QA (passo 4), e o parecer do UX é um arquivo no diff, que invalida os pareceres anteriores. O conteúdo mudado foi só documentação (parecer e observação), sem risco real; o custo foi de ordem, não de qualidade.

## 5. O que funcionou
- Medir antes de corrigir: o FA-006 não reproduziu em api (0,021 contra 0,1) e a correção (E1.2) foi dispensada, evitando código desnecessário.
- Bloqueio de ambiente (libs do Chromium) registrado e desfeito em 17 min, sem contornar R-CONFORMIDADE.
- Mutação do teste do IF-A (a mutação falha) e review/QA/UX sem bug nem achado bloqueante; `pnpm run pronto` rc=0.
- Melhorias vistas viraram cartão no mesmo dia (K-120, K-121).
- O conferente pegou falha de brief antes da delegação (E3.2 no Fora do escopo, K-118 atribuído ao A1).

## 6. O que atrapalhou
- Brief reprovado por M16 três vezes e por campos do brief cinco vezes: ruído antes da entrega.
- Brief pediu commit a agente sem Bash (ux-designer), deixando parecer sem commit.
- Ordem UX depois do QA gerou revalidação.
- Merge fora do fluxo, sem checks e sem a linha `Cartão:` no squash.
- Quadro: K-118 foi a Pronto sem merge; `forge-check docs` com 10 documentos antigos sem frontmatter esconde achados.

## 7. Ações (no máximo 3)
| # | Ação | Responsável | Como medir |
|---|---|---|---|
| 1 | Ligar a proteção da develop (e da homolog) com os checks do PR obrigatórios antes do merge e restringir quem mescla; o dono investiga a origem do merge das 23:03 | usuário (decisão e configuração no GitHub); tech-lead propõe o texto | Merges em develop com check pendente = 0 nos próximos 5 PRs |
| 2 | Trazer a revisão de UX para antes do QA quando há interface (ou fazer o parecer do UX não invalidar os pareceres de código no `forge-check pr`); brief de agente sem Bash nunca pede commit | agile-coach propõe ao Forge; Jarvis aplica no brief | Revalidações extras de review/QA por causa do commit do UX = 0 nos próximos 3 pedidos com interface |
| 3 | Corrigir M16 do conferente: corte de etapas de outro momento do mesmo papel não reprova (R-BRIEF, o corte sai do forge-check) | agile-coach propõe ao Forge | Reprovações de brief com "M16" = 0 nos próximos 3 pedidos |

Experimento a registrar em `docs/kanban/melhorias.md` quando o Jarvis aprovar (o ID livre fica com ele, pois o arquivo está fora do escopo deste pedido): hipótese, métrica e revisão iguais às da coluna "Como medir" acima, revisão após 3 pedidos.

## 8. Linhas MELHORIA (R-DECISAO, classe "Melhoria vista" quando indicado)
| Linha | Problema | Evidência | Como medir | Classe | Onde |
|---|---|---|---|---|---|
| MELHORIA: M16 do conferente reprova corte por leitura, não pelo `forge-check` | 3 reprovações puras e 2 parciais no 036; cada rodada atrasa a delegação | `conferencias.md` 21:38 (react-1 r2), 21:50 (qa-2 r1), 22:01 (qa-3 r1), 22:57 e 22:59 (tech-lead-3) | Reprovações com M16 por pedido = 0 em 3 pedidos | Melhoria vista, entrada direta se for só instrução do conferente; senão decisão ao usuário | **Fábrica Forge** (conferente) |
| MELHORIA: ordem UX depois do QA invalida pareceres no commit do UX | Commit do parecer do UX deixou o QA desatualizado no `forge-check pr`; 2 delegações extras | Pedido, Andamento 22:50; `conferencias.md` 22:52 e 22:57 | Revalidações pós-UX por pedido = 0 | Decisão ao usuário (muda o fluxo do passo 5 do CLAUDE.md) | **Fábrica Forge** (ordem do fluxo e `forge-check pr`); a exceção local, se houver, vai ao `CLAUDE.md` pelo Jarvis |
| MELHORIA: brief pede commit a agente sem Bash | UX gravou parecer sem commit; entrega "não cumpriu" | `conferencias.md` 22:01 (ux-1) e pedido, linha de 2026-10-20 E3.3 | Entregas "não cumpriu" por falta de ferramenta = 0 | Melhoria vista (instrução do Jarvis/template do brief) | **Fábrica Forge** |
| MELHORIA: merge na develop antes dos checks do PR terminarem, sem a linha `Cartão:` | Merge pela conta do dono às 23:03:41; checks pendentes; K-118 fora do squash | Pedido, Andamento 23:15; `conferencias.md` 23:16 | Merges em develop com check pendente = 0 em 5 PRs | Decisão ao usuário (configuração do GitHub) | **Projeto** (proteção da develop, repositório do MetricasDSPD) |
| MELHORIA: cartão fechado em Pronto sem merge do usuário quando não há código (K-118) | A política do quadro diz "Pronto só com o merge do usuário"; o K-118 foi a Pronto às 21:59 por medição sem mudança | `historico.md` 21:59:27 (K-118 Em andamento -> Pronto) | Cartões em Pronto sem merge por pedido = 0, ou política explícita de "fechado sem entrega" com coluna e motivo | Melhoria vista (política de coluna do `KANBAN.md`; edito só com aprovação do Jarvis) | **Fábrica Forge** (política geral do quadro) |
| MELHORIA: preview órfão na porta 4173 bloqueia `test:perf` (já aberta, K-120) | Reuso de servidor de outra worktree | Pedido, Registro de clareza (E1.1); `KANBAN.md` K-120 | Falsos negativos do `test:perf` por servidor órfão = 0 | Melhoria vista | **Projeto** (`playwright.config.ts`) |
| MELHORIA: `forge-check docs` com 10 documentos sem frontmatter (já aberta, K-121) | Esconde achados novos | Pedido, Registro de clareza (review); `KANBAN.md` K-121 | `forge-check docs` com 0 achados antigos | Melhoria vista | **Projeto** (`docs/qa`, `docs/architecture`) |

## 9. Revisão da retrospectiva anterior
A mais recente na pasta é a de 2026-10-14-002 (incidente de autoria de parecer em worktree). Neste pedido não houve parecer "sem autoria"; o contorno (Write/Edit no diretório principal) valeu, mas sem teste suficiente para concluir: continua em observação.
