# Retrospectiva do pedido 070: dado simulado por cartão com selo "Simulado" (2026-11-05)

Fontes: `docs/pedidos/070-simulado-por-cartao.md` (Histórico inteiro), `docs/kanban/conferencias.md` (40 conferências de brief e 10 de entrega do 070), `docs/kanban/historico.md` (K-221, linhas 751 a 755). Horas no relógio local (-03:00), as do Histórico do pedido; o merge do PR 237 (release 071) foi às 16:09 local. Processo, nunca pessoa ou agente; nomes de brief aparecem só como referência de linha.

## 1. Dados do fluxo
| Marco | Hora | Intervalo |
|---|---|---|
| Pedido aberto (E1.1 e E1.2 em paralelo) | 11-04 21:38 | |
| Desenho (E1.1) e especificação do selo (E1.2) entregues | 21:50 e 21:54 | 12 a 16 min |
| Protótipo validado pelo dono ("A", ponto de compromisso) | 21:53 | 15 min |
| L1 (node-backend) entregue | 22:20 | 27 min |
| Review L1, QA L1 | 22:33, 22:53 | |
| L2 (react-frontend) entregue | 23:38 | 45 min |
| WSL travou; QA sem parecer gravado | 23:58 | |
| Volta 1 entregue; develop em conflito | 11-05 00:40 | |
| Develop trazida à branch (E1.9) | 00:54 | 14 min |
| Volta 2 entregue; review, QA e UX v2 aprovados | 01:27 / 01:40 / 01:51 | |
| PR 230 preparado | 02:58 | |
| Gate de fronteiras reprova o PR 230 (build) | 04:00 | |
| Sessão reiniciada; dois envios travados 4 h no pre-push | 08:34 | **4h34** sem andamento |
| PR 230 mesclado pelo dono com 2 checks em falha | 08:38 | |
| Volta 3 por branch nova (E1.10) | 08:57 | |
| PR 231 mesclado, develop volta ao verde | 09:34 | 56 min vermelha |
| L3 começa (E2E, perf, 44 px e 320 px) | 12:06 | 2h32 sem trabalho do 070 |
| L3 entregue, com o bug 070-001 | 12:31 | 25 min |
| Correção do 070-001 entregue (3c552b0) | 12:51 | 20 min |
| Review, UX e QA v4 aprovados | 13:01 / 12:56 / 13:13 | |
| PR 233 (L3) mesclado | 13:34 | 1h03 do bug ao merge |
| PR 234 (ADR 0028 vigente) mesclado | 13:57 | |
| Release 071: PR 237 mesclado pelo dono na main | 16:09 | 2h12 depois do PR 234 |

- **Pedido aberto até a develop completa (PR 234): 16h19** (21:38 a 13:57). Até a main: **18h31** (21:38 a 16:09). **Validação do protótipo até a main: 18h16** (21:53 a 16:09), das quais cerca de 11 h são noite sem trabalho humano e 4h34 de envios travados. Conteúdo funcional na develop (PR 230): 11h00 depois da abertura.
- Dois relógios (D-4): K-221 foi de "Discovery" direto para "Em andamento" (21:57), sem passar por "Pronto para fazer"; o relógio "pronto para fazer até develop" é **não medido**; `forge-check voltas` não imprime `relogios:` para o 070. "Pedido aberto até develop (PR 230, 08:38)" = 11h00; meta de 30 min não aplicável sem o ponto de partida.
- Cycle time e lead time de K-221: **não medidos** (4 linhas no histórico, nenhuma de Code review, QA nem Pronto; o cartão não tem movimento depois das 21:57; é a quinta retrospectiva seguida com o quadro incompleto: 065, 067, 068, 071, 070). Vazão: 0 cartões em Pronto no histórico do 070.
- Retrabalho (voltas de código): 4 devoluções à mesma frente de tela (volta 1: 7 achados de review, QA e UX; volta 2: A-9 a A-11 e A1 e A2; volta 3: gate de fronteiras; correção do 070-001), mais 1 retrabalho de brief (L3 sem a fixture, 12:37). Sem `Code review -> Em andamento` no histórico do cartão (não medido).
- Pareceres do pedido: review 7 (070-l1, l2, v1, v2, v3, v4, w1), QA 6 (l1, l2, v1, v2, v3, v4), interface 5 (revisao, v1 a v4). **18 pareceres** para 4 PRs (230, 231, 233, 234), contra 3 pareceres no 071.
- Estabilidade (DORA): PRs do pedido 4 (230, 231, 233, 234) em 13h; **1 de 4 exigiu correção** (PR 230, corrigido pelo PR 231: `forge-check corrigidos` marca #231 corrige #230 por arquivo em comum, indício, não prova); **tempo de recuperação** da detecção (04:00) ao PR 231 mesclado (09:34): 5h34; develop vermelha de fato 56 min (08:38 a 09:34) porque o dono mesclou o PR 230 com o build falhando. Reversão: nenhuma; hotfix: nenhum. Lead time de mudança por PR: **não medido** (sem hora do primeiro commit). Velocidade e estabilidade juntas: a velocidade foi alta (3 PRs de código em 5h), a estabilidade teve um furo de controle (gate só rodou na CI, e o merge com build vermelho).
- Escape: 2 registrados pelo pedido: gate de fronteiras (04:00) e 070-001 (12:31, alta; docs/qa/bugs/070-001-marca-dagua-simulado-contraste-axe.md); **ambos achados por controle depois de pareceres de review e QA aprovados** (review 070-v3 e QA 070-v3 aprovaram o delta sem rodar axe nem o gate completo em cada volta). `forge-check escape resumo` no repositório: escapes=8, pedidos_prontos=71, taxa=0.11 (30 dias), sem filtro por pedido; não confirmo quantos são do 070 (**não medido**). `forge-check afrouxamentos`: não rodado, sem o JSON do `gh pr list`; **não medido**.
- Esperas (`forge-check esperas`): K-221 dono = 7,2 min (3,7 + 3,5, às 21:50 e 21:54). A espera real do dono pelas suposições S1 a S3 (pergunta 12:28, resposta 13:06) = 38 min e a noite de 11-04 não têm linha de espera no histórico: **medida incompleta**. Credencial: 0. Custo em tokens: **não medido** (sem `custo do trecho` no K-221).

### Briefs e conferências
40 briefs conferidos: 36 aprovados, **4 reprovados** (10%; 071: 47%; 068: 15%). 10 entregas conferidas: **0 `cumpriu`, 10 `não cumpriu`**, das quais 9 com o mérito conferido como cumprido (a exceção é a 21:58, ambiente) e caídas só por base, escopo ou ferramenta.

| Classe de causa | Briefs reprovados | Entregas não cumpridas | Casos |
|---|---|---|---|
| etapa | 2 | 0 | 11-05 00:42 tech-lead-3 (preparo do merge citado como E1.8); 12:09 react-frontend-5 (L3 citado como E1.4, é E1.6) |
| decisao | 1 | 0 | 12:12 qa-engineer-6 (troca de agente sem linha de decisão no Histórico) |
| citacao | 1 | 0 | 03:03 tech-lead-8 (linha do teto diferente da exigida no review 070-v2) |
| base (intervalo sem conferida anterior) | 0 | 4 | 22:24 node-backend-2 (develop andou por ff); 00:26 qa-engineer-2; 00:42 react-frontend-2; 12:56 react-frontend-6 |
| escopo | 0 | 3 | 23:43 react-frontend-1 (arquivos do L1 sem conferida); 12:33 e 12:37 qa-engineer-7 (L3: fixture fora do Entregar; F6 e F9 só no relatório; QA antes do review) |
| ambiente | 0 | 3 | 21:58 node-backend-1 (worktree nova sem pasta pai gravável); 13:38 tech-lead-14 (PR 233, forge-check entrega x pr); 14:01 tech-lead-16 (PR 234, mesma divergência) |

As 4 reprovações de brief foram baratas (3 a 6 min por par com hora: 12:09 a 12:15) e nenhuma delegação errada foi executada. O número de reprovações caiu porque o brief do 070 depende de decisões do dono já fixas; as reprovações do 071 por classe decisao não se repetiram aqui.

## 2. O que funcionou
- **Decisão do dono capturada cedo e sem retrabalho de discovery.** Protótipo validado 15 min depois da abertura (21:53) e a P2 do resumo 1 min depois (21:54); a fila de perguntas ficou vazia em 16 min e o desenho (E1.1) já saiu incorporando as duas decisões. Nenhum lote refeito por mudança de escopo.
- **Contrato primeiro: a API nunca devolve número simulado.** O L1 (27 min) e o L2 (45 min) saíram com cobertura 100% e o QA do L1 provou que a API não devolve simulado; a falha do selo fecha em "Sem dado real".
- **Revisão de interface fora da branch (decisão das 00:13)** evitou invalidar review e QA: os pareceres de UX foram gravados no clone principal, e os pareceres de review e QA ficaram válidos de v1 a v4. Compare com o 069 L9-a, onde o parecer de UX na branch invalidou review e QA duas vezes.
- **Review, QA e revisão de interface em paralelo na mesma ponta** (00:54, 01:27, 12:51): de 4 a 13 min até o último parecer; nenhum agente esperou outro.
- **Retrabalho agrupado em brief único** (00:25, 01:12): sete e cinco achados corrigidos de uma vez, sem rodadas parciais.
- **Bug achado por teste, não por usuário.** O T-E6 (axe) achou o 070-001 no mesmo lote em que foi escrito; correção em 20 min, os 5 E2E do L3 passaram, `color-contrast` mantida ativa (a regra não foi afrouxada).
- **Nenhum bypass:** PR 231, 233 e 234 sem `--admin`, 234 com `--match-head-commit`; main só pelo dono (PR 237).
- **Divergência registrada, não escondida:** a decisão de 13:38 mantém o mérito e anota a ferramenta, em vez de contornar o portão.

## 3. O que atrapalhou (fatos)
- **Voltas do L3 (brief do QA sem previsão do suporte e da prova).** A entrega 3af044c (12:31) caiu em 12:33 e 12:37 por três razões: (1) `e2e/fixtures/referencia-completa.ts` fora do Entregar (o stub 065 devolve `/referencia` sem `ultimaColeta` e `versaoCriterio`, e o E2E precisou de uma fixture que o brief não previu); (2) F6 e F9 sem prova no `perf-api.spec.ts` (o brief pedia o resultado no relatório; o gate de fronteiras é outro comando); (3) QA antes do review (o L3 é código de teste, e a ordem review, QA ficou invertida depois da decisão de 12:12). A decisão de 12:37 conta como retrabalho de brief, sem nova volta ao autor, e o review 070-v4 (13:01) e o QA 070-v4 (13:13) fecharam. Custo: 4 min de conferência (12:33 a 12:37) e a leitura da fixture no review, mais a decisão de 12:33 que aceitou a fixture a posteriori; o controle de escopo foi substituído por decisão do Jarvis nas duas pontas.
- **O brief do L3 passou por 3 rodadas e uma troca de agente antes de existir (12:06 a 12:15).** 12:09 reprovado (etapa), 12:12 reprovado (troca para o QA sem linha de decisão), 12:15 aprovado. A etapa de E2E e perf estava dividida entre E1.4 (implementação nos cartões) e E1.6 (QA) no pedido; o desenho dizia "L3 com o QA" e o brief nasceu com o dono errado.
- **Bug 070-001 (contraste da marca d'água) achado depois do review e do QA.** A marca era texto na tela medido pelo axe; review 070-l2, v1, v2 e v3 e QA l2, v1, v2 e v3 aprovaram sem axe porque o plano do desenho só pôs o axe (T-E6) no L3, depois do PR 230. O defeito existia desde o L2 (23:38 de 11-04) e foi achado 12h53 depois, por um teste que foi escrito só no último lote. O escape foi registrado no pedido (12:31). A medida de contraste do UX tinha sido "8:1 estimado, não medido" (21:50) e nunca virou teste antes do L3.
- **Gate de fronteiras só no build da CI (escape do 04:00).** A volta 2 (A1 do review v1: hora de corte vinda do mock por import dinâmico) violou "painel calcula" e estourou o chunk do mock (123,3 KB contra 120 KB); nem o review v2 nem o QA v2 rodaram o gate; o dono mesclou o PR 230 às 08:38 com 2 checks em falha; develop vermelha 56 min.
- **Quatro horas e meia de nada por envio travado.** 04:00 a 08:34: dois envios presos no `pre-push` (lint) durante 4 h; o dono perdeu a sessão remota e o assistente do app reenviou. Não houve alerta nem tempo limite no pre-push.
- **PR 233: divergência `forge-check entrega` x `forge-check pr` no mesmo head 00bf58c.** Depois do `update-branch`, o `entrega` disse "review falta no head" e o `pr` aprovou o mesmo head (13:38). Repetiu-se no PR 234 (14:01) e já era a mesma de 14:01 do 071. Custo: 2 entregas `não cumpriu` de mérito cumprido; a conferência passou a depender de leitura à mão. **Ressalva importante (ver abaixo):** o Jarvis confirmou em 2026-11-05 (69, 16:28 e 16:35; 71, 16:28 a 16:35; o brief diz 16:30) que o "laço do Desde" vinha de linha "entrega conferida" fora do formato `- <data hora>: entrega conferida <sha40>`, erro de formato do Jarvis; o 070 nunca recebeu essa correção e nenhuma linha no formato certo foi gravada no pedido 070. A divergência `entrega` x `pr` sobre o review no head **não é a do Desde**: não foi reexaminada depois da correção de formato e continua sem causa confirmada.
- **Erro de formato da linha "entrega conferida" no 070.** 4 das 10 entregas caíram por "intervalo sem conferida anterior" (22:24, 00:26, 00:42, 12:56), 1 por arquivos do L1 sem conferida (23:43) e 13:38/14:01 citam a ferramenta; o pedido registra as conferências em prosa ("Entrega do L1 conferida como não cumprida...") e nenhuma delas no formato que o `forge-check entrega --desde` lê. Pelo mesmo mecanismo do 069 e do 071, parte do "defeito da ferramenta" atribuído ao Forge nas decisões de 00:26, 00:42, 12:56 e 14:01 é provavelmente o formato do Jarvis. As decisões do 070 registraram duas vezes "MELHORIA do Forge: falta de Desde por entrega dentro do pedido" (12:56 e herdada do 068), e a retrospectiva do 071 levava essa melhoria como ação 1; ela foi **retirada** em 16:35. Custo no 070: 5 a 6 entregas com "não cumpriu" só pelo intervalo, e a decisão repetida "sem nova volta; mérito cumprido".
- **Quadro incompleto, pela quinta vez.** K-221 sem Code review, QA, UX nem Pronto: 4 linhas de histórico para 4 PRs e 18 pareceres.
- **Conferências sem registro da espera do dono.** A pergunta das 12:28 e a noite de 11-04 (21:39: "vou dormir toque tudo") não têm linha "Aguardando o dono" no `historico.md`; a espera medida (7,2 min) é uma fração do tempo real.
- **Disparo de etapa na mesma worktree antes do relatório da anterior (13:12).** O software-architect (E1.12) editou a ADR 0028 enquanto o tech-lead (E1.11) ainda criava a branch na worktree 052d; sem dano, mas dependeu de decisão do Jarvis.
- **Falhas de ambiente do início.** 21:58 worktree nova sem pasta pai gravável; 22:20 store do pnpm somente leitura (`--store-dir` na scratchpad): duas melhorias registradas e ainda sem texto em instrução de delegação.
- **Retrabalho de achados de interface em 4 voltas.** A-1 (alto), A-9 (médio) e A-10, A-11 (baixos) vieram em rodadas separadas da UX (00:16, 01:00, 12:56); cada volta leu o diff anterior de novo.

## 4. Ações (até 3) e linhas `MELHORIA:`
1. **Provar o que o review e o QA aprovam por comando, na ponta do delta, desde a primeira volta.** Responsável: tech-lead (PQ dos briefs de QA e review) e Jarvis (nos briefs). Mudança exata: todo brief de QA e de review de lote de tela inclui, como PQ de comando, `pnpm --filter @metricas-dspd/e2e run gate` (fronteiras, F6, F8, F9) e, quando o pedido tem E2E com axe, `pnpm --filter @metricas-dspd/e2e exec playwright test --grep axe`; o parecer lista o resultado e a ponta. Medida: escapes de gate e de axe depois de parecer aprovado no próximo pedido de tela = 0 (agora 2).
2. **O brief de lote de teste de QA lista a fixture, a prova por comando e a ordem review, QA.** Responsável: Jarvis. Mudança exata: o Entregar de lote de E2E nomeia arquivos de suporte (`e2e/fixtures/*`), diz o comando que prova F6, F9 e C6 e cita a etapa E1.6 (QA) com o review do código de teste depois; um lote de E2E sem fixture prevista sai com o PQ "o stub devolve o corpo completo do contrato". Medida: entregas de lote de teste `não cumpriu` por escopo ou etapa = 0 (agora 3 no L3).
3. **Corrigir o formato antes de culpar a ferramenta, e fechar a conferência do 070 no formato certo.** Responsável: Jarvis. Mudança exata: gravar no pedido 070 as linhas `- <data hora>: entrega conferida <sha40>` das entregas que cumpriram o mérito (L1 cb1a80d, L2 9605ead, volta 1 518ae82, volta 2 e8c148b, volta 3 bf3d116, L3 3af044c e 3c552b0, PR 233, PR 234) e reexecutar `forge-check entrega --desde` no PR 233 e no PR 234; se a divergência com `forge-check pr` persistir, aí vale o PR ao Forge. Medida: entregas `não cumpriu` por "intervalo sem conferida anterior" no próximo pedido = 0 (agora 5 a 6 no 070).

MELHORIA: o gate de fronteiras e o axe só rodam na CI ou no último lote, e review e QA aprovaram o delta da volta 2 sem rodá-los; escapes: gate às 04:00 (PR 230 mesclado com build vermelho às 08:38, docs/pedidos/070-simulado-por-cartao.md 04:00 e 08:38) e 070-001 às 12:31 (docs/qa/bugs/070-001-marca-dagua-simulado-contraste-axe.md); medida: escapes de controle depois de parecer aprovado = 0 no próximo pedido de tela; projeto (`pnpm run pronto` pode rodar o gate), com a instrução de PQ no brief como fábrica.
MELHORIA: o brief do L3 saiu sem a fixture do stub, sem o comando de prova de F6 e F9 e com a etapa trocada, e a entrega fechou `não cumpriu` em 12:33 e 12:37 (docs/kanban/conferencias.md, 2026-11-05 12:09 a 12:37; docs/pedidos/070-simulado-por-cartao.md 12:12 a 12:37); medida: `não cumpriu` por escopo ou etapa em lotes de teste = 0 no próximo pedido; fábrica (instrução de delegação ao conferente e ao Jarvis).
MELHORIA: o 070 nunca ganhou linha `entrega conferida <sha40>`, e 4 de 10 entregas caíram por "intervalo sem conferida anterior" (docs/kanban/conferencias.md, 2026-11-05 00:26, 00:42, 12:56; docs/pedidos/069-lacunas-alta.md 16:28 e 16:35, docs/pedidos/071-release-069-070.md 16:28 e 16:35); medida: entregas `não cumpriu` por intervalo no próximo pedido = 0; projeto (Jarvis grava a linha na hora da conferência).
MELHORIA: a mensagem do `forge-check entrega` diz "sem conferência anterior" quando a linha existe fora do formato; no 070 o texto levou a cinco decisões "limitação do Forge" (docs/pedidos/070-simulado-por-cartao.md, 00:26, 00:42, 12:56, 13:38, 14:01); medida: a mensagem passa a dizer "linha conferida fora do formato" e o número de decisões atribuídas à ferramenta sem reprodução = 0; Forge (já anotada como melhoria de fábrica possível em 071, 2026-11-05 16:35).
MELHORIA: o `forge-check entrega` não vê o review no head depois do `update-branch` e o `forge-check pr` aprova o mesmo head (PR 233 em 13:38 e PR 234 em 14:01, docs/pedidos/070-simulado-por-cartao.md 13:38; docs/kanban/conferencias.md 13:38 e 14:01); medida: reproduzir depois de corrigir o formato; se persistir, os dois comandos acham o parecer do mesmo jeito (0 divergências por PR com update-branch); Forge, só depois da reprodução (não levar antes).
MELHORIA: dois envios ficaram 4 h travados no `pre-push` (lint) sem alerta (docs/pedidos/070-simulado-por-cartao.md, 2026-11-05 08:34, 04:00 a 08:34); medida: tempo máximo do `pre-push` com aviso em 10 min e envios travados > 30 min = 0; projeto (hook `.githooks/pre-push`) e Forge (tempo limite do hook).
MELHORIA: K-221 tem 4 linhas de histórico para 4 PRs, 18 pareceres e 2 escapes, e a espera do dono real não está nas esperas (docs/kanban/historico.md, linhas 751 a 755; `forge-check esperas`: 7,2 min); medida: cartões do pedido com >= 6 linhas (Em andamento, Code review, QA, Aguardando sua validação, Pronto) e esperas do dono por pergunta com linha de histórico; projeto (Jarvis).

Classe de `R-DECISAO` ("Melhoria vista"): as ações 1 e 3 e as linhas 1, 3, 6 e 7 são ajuste de processo local ou instrução de delegação: **entrada direta** (instrução de brief e uso do histórico), com PR ao usuário quando a mudança for de fábrica (linha 2); as linhas 4 e 5 mudam código do `forge-check`: **ao dono por PR no Forge**, e a 5 só depois de reproduzida com o formato certo; a 6 mexe em hook (`.githooks/pre-push`), **ao dono**; nenhuma toca o `CLAUDE.md`.

## 5. Clareza do pedido (tags)
- `PERGUNTA:` **3 linhas** (21:50 P1 a P4 numa só; 21:53 P2; 12:28 confirmação das suposições); as quatro perguntas P1 a P4 mais a de 12:28 foram respondidas pelo dono em 1 a 38 min.
- `NAO-ENTENDI:`, `ESCOPO+:`/`ESCOPO-:` e `DEVOLVIDA:`: **não medidos** (o pedido não tem a seção "Registro de clareza"); as etapas E1.9 a E1.13 entraram depois do início por necessidade técnica, sem tag de escopo.
- Marcas: 4 `confirmado`, 1 `técnico`, 0 `suposição` ao fim (S1 a S3 confirmadas em 13:06), 0 `delegado` (0%, abaixo de 30%).

## 6. Revisão das ações da retrospectiva anterior (071)
- Ação sobre o Desde por pedido (MELHORIA 1 do 071): **abandonar**: era erro de formato do Jarvis; confirmado em 2026-11-05 16:35 (069 e 071); o 070 ainda carrega a mesma atribuição em 5 decisões e é coberto pela ação 3 acima.
- Ação sobre o bloco "Depende de" com as decisões copiadas (MELHORIA 2 do 071): **funcionou no 070**: nenhum brief reprovado por classe decisao além do 12:12 (troca de agente), e as DECISÃO DO DONO estão copiadas ao pé dos briefs do próprio 070.
- PQ de estado de PR de release (MELHORIA 3 do 071): sem caso novo no 070; **manter aberta**.
- Cartões da release com >= 4 linhas (MELHORIA 4 do 071): **não funcionou**: K-221 tem 4 linhas e nenhuma depois de Em andamento; **manter aberta**.
- Congelar a develop na release (068/071): **praticada no 070** (promoção à homolog 15:43 e PR 237 16:09 sem novo merge na develop); medida de 1h de congelamento: não medida no 070.
