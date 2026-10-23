# Retrospectiva do pedido 037: C6 de /operacional, Web Worker e release #144 (2026-10-23)

Fontes: `docs/pedidos/037-pr-131-release-com-falhas.md`, `docs/kanban/historico.md` (K-113, K-131, K-108), `docs/kanban/conferencias.md` (65 linhas do 037, sem as 2 do brief desta retrospectiva), `docs/qa/037-c6-operacional.md`, `docs/reviews/037-c6-operacional.md`, `docs/kanban/prompt-jarvis-forge-2026-10-21.md` (F21 e F22) e `docs/retrospectivas/2026-10-22-040-banco-local.md` (revisão da seção 7). Métricas do processo, nunca de pessoa ou de agente. Amostra de 1 cartão de entrega (K-113) e 65 rodadas de conferência: valores brutos, sem percentil de fluxo.

## 1. Dados do fluxo
Cartão K-113, do `historico.md` (horas reais, -03:00):

| Trecho | De | Até | Duração |
|---|---|---|---|
| Em andamento até Code review (E1.5, S0, Worker E2.2) | 10-20 22:33:09 | 10-21 13:39:53 | 15 h 06 min 44 s |
| Code review, QA, W037-001, PR #137 fechado e #139 mesclado (registrado como "Em andamento"/Code review) | 10-21 13:39:53 | 10-22 15:02:48 | 25 h 22 min 55 s |
| "Pronto para fazer": 037 na develop, esperando a promoção com o 025 | 10-22 15:02:48 | 10-23 11:37:45 | 20 h 34 min 57 s |
| Promoção, PR dos pareceres, release #144 até o merge do dono | 10-23 11:37:45 | 10-23 14:40:17 | 3 h 02 min 32 s |
| **Lead time = cycle time** (a entrada foi direto para "Em andamento") | 10-20 22:33:09 | 10-23 14:40:17 | **64 h 07 min 08 s** (2 d 16 h) |

- Só 3 h 02 min (4,7%) do lead time foram de trabalho da promoção; 20 h 35 min (32%) foram espera na coluna "Pronto para fazer" por uma decisão de juntar o 037 e o 025 na mesma promoção, e 25 h 23 min (40%) em review, QA e correção.
- Espera sem movimento no histórico: o limite de uso interrompeu o E2.2 em 10-20 23:35:35 e a retomada só veio em 10-21 10:03:25 (10 h 27 min 50 s), registrada como "Em andamento para Em andamento". O cartão nunca foi a "Aguardando o dono" nem a "Bloqueado", embora o pedido tenha esperado o dono (recibos e decisões de 10-20, 10-21 e 10-23). O tempo bloqueado real é maior que o do quadro.
- Cartões do mesmo pedido: K-131 (D1) `Entrada` para `Pronto` em 22 h 47 min 51 s (10-21 16:14:57 a 10-22 15:02:48), fechado porque a condição do dono foi cumprida (W037-001 corrigido, `e2e` do #139 verde). Abertos: K-132 (D2), K-123, K-126, K-127, K-135. D2 segue pendência do dono (K-132).
- Vazão: 1 cartão de entrega em Pronto (K-113) e 1 de defeito (K-131). A mesma release #144 levou o 025 (K-110, Pronto em 10-23 11:13:18).
- DORA (amostra pequena, só leitura): entregas na `main`, 1 release (#144, mesclada pelo dono em 10-23 17:28Z, com 037, 025, Forge 0.28.0 e documentação). Estabilidade: o W037-001 (101 E2E vermelhos) foi pego no check `e2e` do #137 antes do merge, então escape do defeito do Worker para a develop ou a main = 0; as falhas que chegaram à release foram de portão, não de código (`homolog-aprovada` do #144 vermelho por corrida em 16:35:58Z, verde ao rodar de novo, E2.9, ~7 s de Actions). Lead time de mudança e tempo de recuperação: não medidos aqui (sem hora de primeiro commit por PR e sem hora do segundo check no histórico).
- Quadro: o histórico de K-113 tem "Em andamento para Code review" às 13:39:53 e depois só "Em andamento para Em andamento" (04:18:09 de 10-22). A volta `Code review para Em andamento` (W037-001, retrabalho real) e as passagens por QA e "Aguardando sua validação" não foram registradas, e o "Pronto" saiu de "Em andamento". O retrabalho medido pelo histórico dá 0 voltas; o real é de pelo menos 2 (seção 3). Mesma lacuna do K-110 no 025 (`forge-check movimento`, linha MELHORIA do 025).
- Custo (`forge-check transcricao custo`, sessão local inteira, não separável por pedido): total 183.222.604 tokens, 158.228.337 na sessão principal; conferente (haiku) 216 mensagens e 8.769.076 tokens, qa-engineer (sonnet) 236 mensagens e 9.453.665, tech-lead (sonnet) 102 e 2.749.868; 1 compactação (760.408 tokens antes) e 1 relançamento do mesmo prompt (tech-lead, 2 lançamentos). Não dá para atribuir ao 037; o dado vale como linha de base da sessão.
- Clareza (tags do pedido; o pedido tem a linha "Clareza", mas não a seção "Registro de clareza", então tag ausente é "não medido"): 1 `PERGUNTA:` (rodar de novo os jobs, respondida "A"); 1 `ESCOPO+:` (E2, o Worker entrou depois da proposta do arquiteto, por decisão do dono); `NAO-ENTENDI:` e `DEVOLVIDA:` não medidos. Itens por marca no Escopo: 1 `confirmado` (E2), 1 `suposição` (E1), 0 `delegado` (0%, abaixo do limite de 30%); as decisões `técnico` do Jarvis estão no Andamento (3 registros de 10-21, 2 de 10-22 e 1 de 10-23).

## 2. Conferências do 037 (`conferencias.md`)
65 rodadas: 44 de brief (26 briefs) e 21 de entrega (17 briefs com entrega). Mérito = a reprovação procede (s), procede em parte (parcial) ou é falsa (n).

| | Rodadas | Aprovadas / cumpriu | Reprovadas / não cumpriu | Mérito s / parcial / n |
|---|---|---|---|---|
| Brief | 44 | 25 | 19 (43%) | 9 / 5 / 5 |
| Entrega | 21 | 6 (29%) | 15 | 2 / 6 / 7 |

- Briefs aprovados de primeira: 13 de 26 (50%); 13 reprovados na rodada 1. Briefs com 3 ou mais rodadas: tech-lead-2 (4), tech-lead-10 (3), qa-engineer-7 (3), qa-engineer-10 (3).
- Das 34 reprovações, 12 (35%) foram falsas (n: 5 de brief e 7 de entrega) e 11 foram parciais; só 11 (32%) procederam por inteiro. O conferente custa rodadas mesmo quando erra (8,77 M tokens na sessão, seção 1).
- Entregas "não cumpriu" com mérito integral (s) foram 2 (escopo de config do Worker na `react-frontend-1` e 2 commits em vez de 1 do parecer na `tech-lead-1`), e as duas nasceram de lacuna do brief. As demais vieram de erro do brief do Jarvis (n), ambiente ou falso positivo do conferente. Nenhuma entrega foi devolvida por defeito de código do autor na conferência; o defeito de código (W037-001) veio do QA (seção 3).

Por classe de causa (a coluna `classe` só existe a partir de 10-22 04:06; as anteriores foram classificadas pela nota da linha):

| Classe | Briefs reprovados | Entregas não cumpriu | Total |
|---|---|---|---|
| `decisao` (decisão do dono nova ou revista não chegou ao brief, ou lida fora de ordem; D1, D2, #136, L2T-003) | 7 | 2 | 9 |
| `escopo` (Entregar/Fora sem lista, PR sem etapa, lista de promoção incompleta) | 2 | 5 | 7 |
| `etapa` (etapa do mesmo papel em outro momento, PR aberto antes do parecer, etapa errada na mensagem) | 5 | 2 | 7 |
| `forma` (Objetivo copiado, mensagem abreviada, Entregar sem separar o feito, PQ com campo inexistente, 2 commits) | 5 | 3 | 8 |
| `ambiente` (`--desde` de commit squashado inexistente no clone) | 0 | 2 | 2 |
| `implementacao` (linha 57 do review contradiz o E2.3c) | 0 | 1 | 1 |
| Total | 19 | 15 | 34 |

Leitura: `decisao`, `forma` e `escopo` somam 24 de 34 (71%) e são lacunas de montagem do brief, não de execução. `decisao` repete o padrão do 025 (8 de 15 reprovações de brief); a melhoria correspondente já está na retrospectiva do 025 (linha MELHORIA de 2026-10-23, decisão nova que não chega ao brief seguinte) e não é repetida aqui. A classe `etapa` repete a do 025 (R-BRIEF, etapa do mesmo papel) e do 036 (M16).

## 3. Retrabalho (voltas)
- Review: 1 parecer inicial aprovado na `0bde5eb` (51ba511 e d549417, 4 recomendados A1 a A4, que viraram K-126 e K-127), 1 reaprovação depois da correção do W037-001 (7700366, head 35bfd72), 1 correção do parecer na linha 57 (que dizia que o D1 "já existia na develop") em PR de documentação (ae009a7, E2.5b), com a correção adiada duas vezes (E2.7 em 10-22 15:02, depois E2.5b em 10-23). Voltas do review: 2 (reaprovação e linha 57).
- QA: parecer em `9ee640f`, reprovado na E2.3c com 101 falhas E2E contra 3 na develop (W037-001, alta, bloqueante), reaprovado em `35bfd72` (219 de 220 verdes, resíduo D2); ajustes de texto do D1 (qa-5, qa-7); QA da promoção aprovado na `f50c99c`. Voltas do QA: 1 de reprovação mais 2 ajustes de documento.
- Premissa falsa do D1: o QA mediu "falha igual na develop" com o `vite preview` da worktree -037 na porta 4173 e o `reuseExistingServer` serviu o build do Worker; o K-131 abriu em 10-21 16:14:57 e a premissa só caiu em 19:30 (3 h 15 min). A decisão do dono de 10-21 ("já existentes na develop") foi tomada sobre essa premissa e teve de ser reaberta e reescrita (pedido, decisão "A se d1 foi feito"). Brief com o D1 foi reprovado 3 vezes por isso (`conferencias.md`, tech-lead-4 r1, qa-engineer-7 r1 e r2, qa-engineer-10).
- Processo: o PR #137 foi aberto em 10-21 20:45Z antes dos pareceres aprovados, fechado sem merge e recriado como #139 (squash 2bb9f68, `e2e` verde); fato irreversível, tratado como decisão técnica do Jarvis (pedido, 10-22) e como reprovação `etapa` procedente (tech-lead-6 r2). Custo: um PR, uma rodada de CI e 3 rodadas de brief.
- Portão: `perf-homolog` falhou duas vezes antes do trabalho (C6 de /operacional 227 ms e 200 ms, depois 225 ms e 208 ms; limite 200 ms, ADR 0003); a medição do QA (E1.2) mostrou que o `@playwright/test` 1.64.1 não explicava e que o C6 de /operacional vive no limite (K-113); o T5 do `leiajunto` foi instabilidade (passou na nova rodada). No fim, `homolog-aprovada` do #144 falhou por corrida e passou ao rodar de novo (K-108, F22).
- Decisão do #136 (esperar o 037): superada pelo ato do dono, que mesclou o #136 em 10-21 13:10 (17fee18) antes do 037; a correção do C6 foi entregue na release #144 (E2.8). A decisão não gerou retrabalho de código, mas manteve o K-113 em espera de 22 h até a promoção.

## 4. O que funcionou
- A medição antes de mexer (E1.2 e a sonda S0, eeb59fa): confirmou que o `@playwright/test` 1.64.1 não era a causa, apontou a geração do mock na thread principal e evitou o render fatiado. A decisão do dono de seguir o Worker da ADR 0021 veio com dado, sem afrouxar o limite da ADR 0003.
- O check `e2e` do PR e a medição com porta e build próprios (E2.3c) pegaram a regressão do Worker (W037-001) antes de qualquer merge: 0 escape de código à develop e à main. Sem merge com check vermelho.
- O dono reclassificou o D1 depois do E2.3c e o time reescreveu pareceres e briefs sem esconder a premissa falsa (R-CONFORMIDADE).
- A atribuição do atraso em "Pronto para fazer" a uma decisão explícita de juntar 037 e 025 numa promoção só (uma promoção, um portão) em vez de duas.
- A reexecução do `homolog-aprovada` (E2.9) custou ~7 s de Actions e o dono mesclou o #144 em 10-23 17:28Z, sem hotfix.

## 5. O que não funcionou (fatos, não pessoas)
**A. O D1 nasceu de medição com servidor de outra worktree.** `reuseExistingServer` ainda é `!CI` em `e2e/playwright.config.ts` (linhas 41 e 52); o comentário na linha 4 já reconhece o risco e a variável `E2E_PORTA` o contorna só quando alguém a define. Custo: 3 h 15 min de premissa falsa, uma decisão do dono sobre a premissa errada e 7 reprovações de brief por `decisao` ligadas ao D1 e à sua reversão. (Linha MELHORIA 1.)

**B. A lista do Entregar e do Fora de uma promoção é montada à mão e erra.** O brief tech-lead-9 omitiu os pedidos 035, 036, 038, 039 e a retro do 036 (`conferencias.md`, 10-23 11:13, "erro do Jarvis na lista"); o PR dos pareceres da promoção não tinha etapa no pedido (tech-lead-10 r2, criada a E2.6b); L2T-003 e a decisão do #136 faltaram no brief do qa-engineer-10 (rodadas 1 e 2, a segunda falsa). `escopo` e `decisao` somam 9 reprovações de brief no pedido e 7 de entrega. A lista de uma promoção é fatiável por `git log base..head` e por `docs/pedidos/` e não precisa de memória do Jarvis. (Linha MELHORIA 2.)

**C. A corrida do `homolog-aprovada` (K-108) voltou no #144 e o cartão segue parado.** O K-108 está no `KANBAN.md` desde 2026-10-17 (pedido 016; "corrida vista no #90 e no #96"), sem nenhuma linha no `historico.md`, e a corrida apareceu de novo no #144 (16:35:58Z); são 3 ocorrências em 6 dias. A causa e a sugestão de fábrica já estão no F22 do `prompt-jarvis-forge-2026-10-21.md`; falta o cartão do projeto andar. (Linha MELHORIA 3.)

**D. Rodadas de brief tardias do conferente.** 4 briefs precisaram de 3 ou mais rodadas; 3 reprovações de brief estão marcadas "tardio" na nota (tech-lead-2 r1 e r3 e tech-lead-6 r1): o conferente achou na rodada seguinte um achado que já valia na primeira, com o texto igual ao de brief aprovado. Mais 5 reprovações de brief e 7 de entrega foram falsas. Isso soma 12 de 34 reprovações sem mérito. (Linha MELHORIA 4.)

**E. Esperas fora do histórico.** 10 h 28 min de interrupção por limite de uso e 22 h de espera por promoção ficaram como "Em andamento" e "Pronto para fazer". O cartão nunca passou por "Aguardando o dono", e a volta `Code review para Em andamento` do W037-001 não foi lançada. Já registrado nas retrospectivas do 040 (esperas de pessoa) e do 025 (`forge-check movimento`); aqui só entra como evidência nova, sem outra linha.

**F. F21 e F22 do prompt de melhorias de 2026-10-21, vistos neste pedido.** O push barrado por falta de `node_modules` em worktree nova (F21) apareceu no QA da promoção; o PR de release criado vazio e a corrida do `homolog-aprovada` (F22) apareceram no #144. Os dois estão registrados e não são repetidos.

## 6. Ações (no máximo 3)
| # | Ação | Responsável | Como medir |
|---|---|---|---|
| 1 | O QA e o tech-lead medem E2E sempre com `E2E_PORTA` própria, e o `playwright.config.ts` passa a falhar (ou a usar porta livre) quando a 4173 já responde, em vez de `reuseExistingServer` local | qa-engineer propõe; tech-lead implementa (projeto, PR para a develop) | Medições de QA feitas contra servidor de outra worktree = 0 nos próximos 3 pedidos com E2E; premissas de defeito reabertas por artefato de porta = 0 |
| 2 | O brief de promoção e de release passa a ter o Entregar e o Fora gerados por `git log base..head` e pela lista de `docs/pedidos/` da branch, não digitados | Jarvis (instrução, Forge pelo `contribuir-com-o-forge`) | Entregas de promoção "não cumpriu" por `escopo` = 0 nas 3 próximas promoções |
| 3 | O K-108 ganha responsável com data, ligado ao F22 (PR de release só depois do portão verde, ou `homolog-aprovada` que espera o portão), e entra no `historico.md` | Jarvis abre o PR no Forge; devops-engineer implementa no projeto | Checks `homolog-aprovada` vermelhos por corrida = 0 nas próximas 3 releases |

Experimento a registrar em `docs/kanban/melhorias.md` quando o Jarvis aprovar (o arquivo está fora do escopo desta etapa), hipótese, métrica e revisão iguais à coluna "Como medir"; revisão após 3 pedidos com E2E. A linha 4 (conferente) fica na fila: a retrospectiva do 025 já pediu mudança no conferente, e uma segunda mudança no mesmo ponto antes de medir a primeira mistura os efeitos.

## 7. Linhas MELHORIA (R-DECISAO, classe "Melhoria vista")
MELHORIA: 2026-10-23 · Projeto (MetricasDSPD, `e2e/playwright.config.ts`) · classe Melhoria vista (ajuste de teste, sem mudar regra nem limite) · o `reuseExistingServer` local serve o build de outra worktree e fez o QA medir um "D1" falso. Evidência: pedido, Andamento 10-21 18:45 e 19:30; `historico.md` K-131 (10-21 16:14:57 a 10-22 15:02:48); `playwright.config.ts` linhas 4, 41 e 52. Medir: medições de QA contra servidor de outra worktree = 0 em 3 pedidos. Proposta: falhar, ou usar porta livre, se a porta padrão já responde; relacionada ao K-135 (helper único de "painel pronto"), que trata a outra metade do W037-001.

MELHORIA: 2026-10-23 · Fábrica (Forge), instrução do Jarvis para brief de promoção e de release · classe Melhoria vista · a lista Entregar e Fora do brief de uma promoção é digitada e omite pedidos que estavam na branch. Evidência: `conferencias.md`, tech-lead-9 entrega 10-23 11:13 (omitiu 035, 036, 038, 039 e a retro do 036), tech-lead-10 r2 (PR dos pareceres sem etapa), qa-engineer-10 r1 (L2T-003 sem decisão); classe `escopo` = 7 de 34 reprovações do pedido. Medir: promoções com entrega "não cumpriu" por `escopo` = 0 em 3 promoções. Instrução: gerar a lista por `git log base..head` e `docs/pedidos/` da branch antes do brief.

MELHORIA: 2026-10-23 · Projeto (MetricasDSPD, quadro) com vínculo ao F22 (Forge, já registrado, citado e não repetido) · classe Melhoria vista · o cartão K-108 está parado há 6 dias, sem linha no `historico.md`, e a corrida do `homolog-aprovada` voltou no #144. Evidência: `KANBAN.md` linha do K-108 (corrida no #90 e no #96, pedido 016); `historico.md` sem nenhum movimento do K-108; pedido, Histórico 10-23 15:00 (corrida confirmada no #144, E2.9); F22. Medir: checks `homolog-aprovada` vermelhos por corrida = 0 em 3 releases. Proposta: dar ao K-108 responsável e data, ligá-lo ao F22 e registrar o movimento pelo `forge-check movimento`.

MELHORIA: 2026-10-23 · Fábrica (Forge), conferente (R-BRIEF e R-PROVA) · classe Melhoria vista (instrução do conferente, na fila até medir a mudança do 025) · 12 de 34 reprovações do 037 sem mérito e 3 reprovações "tardias" (achado que valia na primeira rodada). Evidência: `conferencias.md` (mérito n em 12 linhas do 037, entre elas qa-engineer-2 r1 e react-frontend-5 r1, falsas pelo `forge-check`, e qa-engineer-10 r2, falsa por `grep`; "tardio" em tech-lead-2 r1 e r3 e tech-lead-6 r1); retrospectiva do 025 (linha MELHORIA de `decisao`, citada). Medir: reprovações de brief e de entrega sem mérito por pedido <= 10% e briefs com 3 ou mais rodadas = 0 em 3 pedidos. Instrução: o conferente lista todos os achados já na primeira rodada e confere o corte e o PQ contra o `forge-check` antes de reprovar.

## 8. Revisão das retrospectivas anteriores (040 e 025)
- Ação 3 do 040 (toda espera de pessoa vira movimento "Aguardando o dono"): não adotada neste pedido; o K-113 teve 10 h 28 min de interrupção e esperas do dono sem movimento (seção 1). Sem melhoria visível; vale a mesma observação do 040.
- Linha do 025 sobre `forge-check movimento` (volta de devolução e "Pronto" antes do merge): o K-113 repete o caso (retrabalho real sem volta no histórico). Sem repetir a linha.
- Linha do 025 sobre `decisao` no brief: o 037 repete (9 de 34 reprovações). A hipótese do 025 segue sem medida de efeito; observar na próxima promoção.
- Padrão do 036 (M16, corte lido contra o texto e não contra o `forge-check`): ainda presente (qa-engineer-2 r1 e react-frontend-5 r1 foram falsos pelo `forge-check`); sem ação nova.
