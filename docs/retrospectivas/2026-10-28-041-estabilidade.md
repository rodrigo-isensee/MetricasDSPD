# Retrospectiva do pedido 041: estabilizar os testes (2026-10-28)

Fontes: `docs/pedidos/041-estabilizar-os-testes.md` (Histórico), `docs/kanban/historico.md`, `docs/kanban/conferencias.md` (linhas do 041), `docs/qa/041-estabilidade.md` (seções 8 a 10, lido na `origin/develop`, d55db80), `KANBAN.md`, `gh pr list` e `gh pr view` (consulta de 2026-10-28; o `gh` devolve UTC, convertido para -03:00). Métricas do processo, nunca de pessoa ou de agente. Poucos itens (2 PRs e 1 cartão com histórico completo): valores brutos, sem percentil.

Correção de data: o brief desta retrospectiva cita o #150 às 08:06; é UTC. A hora local do merge é 05:06:35 de 2026-10-28; o #153 foi mesclado às 10:07:23 (13:07:23 UTC).

## 1. Dados do fluxo
| Marco | Hora (-03:00) | Intervalo |
|---|---|---|
| Pedido aberto; recibo aceito | 2026-10-22 22:15 | |
| K-138 (diagnóstico) em "Pronto para fazer" / "Em andamento" | 22:24:07 / 2026-10-23 06:24:44 | 8 h 00 min de espera |
| 1ª queda do WSL por memória (E2E, 8 workers) | 2026-10-23 11:40 | 5 h 16 min depois do início do diagnóstico |
| 2ª queda do WSL por memória (E2E, 2 workers) | 15:00 | 3 h 20 min |
| Sessão no `jarvis.slice` (7 GB alto, 9 GB máximo) | 16:10 | |
| 3ª queda (memória virtual do Windows; pagefile corrigido) | 20:00 | |
| E1.1 entregue e conferida (K-138); E2.2 e E3.1 em seguida | 20:29 a 20:45 | 14 h 21 min do início do diagnóstico |
| Pausa pedida pelo dono; retomada na máquina nova (042) | 20:56 de 23/10; 12:27 de 27/10 | 3 d 15 h 31 min sem agente trabalhando |
| E2.1 delegada / entregue (K-092, K-115, K-135, F4) | 2026-10-27 14:07 / 15:20 | 1 h 13 min |
| E4.1 entregue, parecer reprovado (3 falhas, vira E6) | 17:20 | |
| E6 (K-149): delegado / E6.1 / E6.3 entregues | 17:31 / 17:51 / 19:14 | 1 h 43 min da delegação ao reteste |
| Develop verde de novo (K-151, PR #149) | 20:19 | espera por 1 h 05 min depois do E6.3 |
| PR #150 aberto / mesclado | 20:48:41 / 2026-10-28 05:06:35 | 8 h 18 min aberto |
| PR #153 aberto; develop anda (#154 às 09:01:07); merge recusado | 06:38:34; 09:01; 09:02 | |
| Delegação do merge do #153 negada pelo classificador; K-108 "Bloqueado" | 09:19:14 | |
| Dono traz a develop para a branch / mescla o #153 | 09:44 / 10:07:23 | 48 min depois da negação |
| K-108 em "Pronto" (quadro) | 11:01:18 | 54 min depois do merge |

- K-108 (único cartão do pedido com fechamento no histórico): Em andamento em 2026-10-23 20:47:12 (volta em 10-27 13:54:31) até "Pronto" em 2026-10-28 11:01:18: cycle time de calendário 4 d 14 h 14 min 06 s, dos quais 3 d 15 h 31 min são a pausa. Bloqueado 1 h 42 min 04 s (09:19:14 a 11:01:18, medido pelo quadro; 48 min até o merge do dono).
- Lead time do pedido (recibo aceito até o merge do #153): 5 d 11 h 52 min de calendário; 4 d 8 h 21 min sem a pausa.
- Vazão: 2 PRs do pedido na develop (#150 com E1 a E6, #153 com o `homolog-aprovada`) e 1 cartão fechado no histórico. Os outros 9 cartões do pedido seguem abertos no quadro (seção 4, H).
- Retrabalho no `historico.md`: 0 linhas `Code review -> Em andamento` nos cartões do pedido. Retrabalho real lido no Histórico do pedido: E3.2 voltou por custo de runner (R-CUSTO, 2026-10-23 20:51), parecer de segurança voltou 2 vezes (15:31 e 15:36) e o de review 1 (A3), E4.1 reprovado pelo QA e com seções do diagnóstico apagadas (17:23), e 5 revalidações de pareceres por merge da base (seção 4, C).
- DORA (2 PRs, valores brutos): frequência 2 PRs em 2 dias úteis de merge (#150 e #153; #154 do 044 e #151 do Forge entraram no meio e não são do pedido). Lead time de mudança do primeiro commit ao merge: #150 4 d 8 h 39 min (2026-10-23 20:27:32 a 2026-10-28 05:06:35); #153 4 d 13 h 18 min (2026-10-23 20:48:30 a 10:07:23); os dois incluem a pausa de 3 d 15 h 31 min. Taxa de falha: 0 revert e 0 hotfix nos registros consultados (`historico.md`, `escapes.md`); o único escape registrado em `docs/kanban/escapes.md` é do 026, não do 041. Tempo de recuperação: não se aplica. Velocidade e estabilidade juntas: lead time alto por pausa e fila, sem sinal de queda de estabilidade.
- Efeito medido nos testes: F4 0/20 (n = 20, p95 de 41,9 a 47,9 ms contra 100 ms), IF-U-operacional 0/180, CA-19 0/160, montecarlo 0/20, mock 0/20; E2E completa com 2 workers de 708 verdes e 1 falha (r2 do diagnóstico, 1 worker) para 736 verdes e 0 falhas (E6.3). Os 20 timeouts de 30 s com 8 workers não foram repetidos por decisão do dono.
- Custo (`forge-check transcricao custo`), esperas (`forge-check esperas`), escape resumido e afrouxamentos (M14b): não rodados nesta delegação; "não medido". Esta retrospectiva não afrouxa controle nenhum (o ADR 0003 e o limite de 100 ms ficam como estão), então a linha de base não é pré-condição.
- Clareza (tags do pedido, que tem a seção "Registro de clareza"): PERGUNTA 4 (F4, workers, custo, medição a frio; respostas A, A, B, A), NAO-ENTENDI 1 (resposta "N" do dono, 2026-10-23, resolvida no mesmo dia), ESCOPO+ 1 (E6, 2026-10-27 17:21), ESCOPO- 0, DEVOLVIDA 0. Itens por marca (escopo, fora do escopo, suposições e critério de pronto, contados por mim): 4 confirmado, 6 técnico, 3 suposição, 0 delegado (0%, limite de 30%), 0 no-protótipo. Fato: o "Registro de clareza" do pedido ficou em "PERGUNTA: nenhuma" desde a abertura; as 4 perguntas estão no Histórico, não nele.

## 2. Rodadas do conferente (linhas do 041 em `conferencias.md`)
Contagem literal das linhas do pedido (73 de brief, 28 de entrega), sem as rodadas desta retrospectiva. Por classe de causa, do processo e não de papel.

Briefs: 73 rodadas sobre 53 briefs; 25 reprovações (34% das rodadas), 48 aprovações. 

| Classe de causa (brief reprovado) | Rodadas | Detalhe |
|---|---|---|
| `escopo` | 8 | "não nesta delegação" de etapas do mesmo papel sem marca (2026-10-23 11:24 e 17:56, 2026-10-27 14:02 e 14:04, 2026-10-28 06:08, 09:13); Fora do escopo dizendo "documentação" (05:36); limpeza depois do merge sem base no pedido (2026-10-27 22:05) |
| `etapa` | 6 | etapa de outro papel citada, ou etapa que o brief usava e o pedido não listava (2026-10-27 15:13, 15:25, 20:28; 2026-10-28 05:21, 06:23, 09:15) |
| `citacao` | 4 | linha ou custo citado que não existe no pedido (2026-10-27 17:58; 2026-10-28 05:41, 06:31, 09:07) |
| `decisao` | 3 | decisão ou motivo ainda não gravado no Histórico do pedido (2026-10-27 21:55; 2026-10-28 05:22, 05:44) |
| `forma` | 2 | prazo de entrega fora da linha de corte (2026-10-27 15:39; 2026-10-28 06:20) |
| `base`, `implementacao` | 1 + 1 | base do brief (2026-10-27 12:30); N = 10 contra as 20 repetições do critério (2026-10-27 15:50) |

Entregas: 28 conferências; 2 cumpriu (7%); 26 não cumpriu. A maior parte não tem defeito de autor: o Histórico do pedido registra "sem retrabalho" na grande maioria.

| Classe de causa (entrega não cumpriu) | Rodadas | Detalhe |
|---|---|---|
| `escopo` | 9 | `--desde` do `forge-check` cai na base inteira quando há merge da develop na branch, ou o pedido tem duas branches e o único `conferida` é de outra (K-147): 2026-10-27 15:26, 20:46, 20:47 (3 delas); 2026-10-28 06:08 (2), 06:17 |
| `base` | 5 | mesma família (2026-10-27 14:01, 14:11, 14:13; 2026-10-28 05:27, 05:31) |
| `ambiente` | 4 | merge da develop na branch (2026-10-27 15:44, 15:48) e permissão negada para apagar branch (2026-10-28 05:19, 05:20) |
| `decisao`, `implementacao`, `prova` | 2 + 2 + 2 | R-CUSTO do `homolog-aprovada` (2026-10-23 20:51); QA com a 1ª rodada do `pronto` junto de outras suítes (2026-10-27 19:16); QA com seções apagadas do diagnóstico (17:23); critério literal inatingível do E6.1 (17:54) |
| `forma`, `outra` | 1 + 1 | assunto de commit fora do imperativo (2026-10-23 20:45); `--desde` com merge da develop (2026-10-27 18:08) |

Leitura (classificação minha, pelo texto das linhas): das 51 rodadas "não deu de primeira" (25 de brief e 26 de entrega), 14 de brief vêm do desenho do pedido com várias etapas para o mesmo papel (`escopo` e `etapa`; E5.1 foi delegada 7 vezes ao tech-lead, E2.1 e E4.1 ao QA); cerca de 17 de entrega vêm do intervalo da conferência (K-147: `escopo`, `base`, `outra` e 2 de merge da develop) e 2 de permissão; as 18 restantes (11 de brief por citação, decisão, forma, base e implementação; 7 de entrega por decisão, implementação, prova e forma) tocam o texto do brief ou o conteúdo da entrega.

## 3. O que foi bem
- O diagnóstico medido (E1) trocou a hipótese "o Playwright é instável" por 5 causas com taxa: F4 6/10 (p95 de 3 a 11 amostras vira o máximo), K-107 (a propriedade era falsa por deslocamento de sequência do PRNG, e não só estatística), K-123 (relógio absoluto com 7x de folga em repouso), IF-U e CA-19 a 21 a 26 s e 13 a 20 s de 30 s, e `pnpm test` disparando o E2E. As correções saíram dessa lista: 0 retry novo e 0 timeout aumentado (PQ-3 do pedido), prova de 20 repetições por teste e E2E completa 736/0 com 2 workers.
- Depois da regra de uma suíte por vez e do `jarvis.slice` (2026-10-23 16:10), não houve nova queda por memória. A 3ª queda (20:00) veio de memória virtual do Windows, resolvida com o pagefile, e não da suíte. Pico do slice nas rodadas medidas: 2,8 a 6,3 GiB, abaixo do teto alto de 7 GB, 0 processo morto (`docs/qa/041-estabilidade.md`, seção 9). A única rodada que violou a regra (2026-10-27 19:14, o `pronto` junto de duas outras suítes) quebrou só o `plataforma2.test.ts` por timeout (K-150), sem queda do WSL.
- Decisões do dono viraram escolha A/B, cada uma com custo e efeito: F4 = A, workers = A, `homolog-aprovada` = B, 3 falhas = A, medição a frio = A. As 4 perguntas foram respondidas no mesmo dia em que saíram; o NAO-ENTENDI ("N") foi resolvido sem disparar nada.
- O dono não precisou escolher entre afrouxar e corrigir: o limite de 100 ms do F4 e a cobertura ficaram intactos; o que mudou foi a regra de medição, com data, motivo e decisão no ADR 0003.
- As 3 falhas determinísticas do E4.1 (COMP-01 a 1280 px, CLS 0,115 a 375 px em /operacional e no Resumo) foram para o E6, corrigidas em 1 h 43 min da delegação ao reteste (0 em 50 execuções) e não aceitas como dívida.
- A permissão negada não foi contornada: a exclusão da branch remota e o merge do #153 viraram ação do dono (R-CONFORMIDADE).

## 4. O que custou tempo (fatos, não pessoas)
**A. Duas quedas do WSL por memória em 3 h 20 min e um diagnóstico a refazer 6 vezes.** O diagnóstico (K-138) começou às 06:24 com 8 workers, caiu às 11:40 e às 15:00 (2 workers); a regra de teto veio em etapas (14 GB no WSL, "uma suíte por vez", `systemd-run` que escapava do `jarvis.slice`, depois o slice). Foram 6 delegações ao QA para 1 cartão, de 06:24 às 20:45 (14 h 21 min), e o relatório parcial das quedas não avançou entre 11:40 e 20:00. O JSON da E2E de 8 workers (os 20 testes que falharam) se perdeu e não pôde ser confrontado com a lista do K-132 (`docs/qa/041-estabilidade.md`, seção 8). O preço da regra: a E2E completa com 1 worker levou 63,8 min (r2); com 2 workers não há duração gravada ("não medido").

**B. Pedido com muitas delegações para o mesmo papel.** A etapa E5.1 do tech-lead foi delegada 7 vezes (PR, voltas de A3, 041b, merge, revalidação), a E2.1 e a E4.1 do QA mais de 3 vezes cada. Cada brief precisa listar todas as outras como "etapa de outra delegação; já entregue", e a lista cresce a cada rodada: 8 reprovações por `escopo` e 6 por `etapa` (2026-10-23 11:24 e 17:56; 2026-10-28 06:23, 09:07, 09:13, 09:15). O brief do merge do #153 levou 4 rodadas (09:07 a 09:15, 8 a 12 min no relógio) por esse motivo.

**C. Merge da develop invalida pareceres e o hook não usa a mesma base do `forge-check`.** No #150 (2026-10-27 21:52) o hook `parecer` barrou o `gh pr merge` no modo estrito (sem `--base`), porque a develop andou depois do `commit:` dos pareceres; foram 3 revalidações (review, QA, segurança) mais a volta de autoria do QA (21:55 a 22:12), e o merge só saiu às 05:06 do dia seguinte (a janela entre 22:12 e 05:06 não tem linha medida). No #153 (2026-10-28) o mesmo motivo gerou a revalidação do parecer do devops (06:27 a 06:35) e a do QA, mais a gramática do achado que não aceita intervalo de linhas (05:58 a 06:05) e o `forge-check pr` cobrando o parecer de uma branch já mesclada (06:21). Total: 5 revalidações sem mudança de mérito, 4 delas por merge da base. As horas de várias linhas do Histórico de 28/10 foram anotadas por estimativa (o pedido registra a correção em 05:36 e 06:21; o merge do #150 saiu às 05:06 e o Histórico diz 05:16 e 05:20): os intervalos dessa janela são aproximados.

**D. Conferência de entrega sem `Desde` por branch (K-147, K-158).** Cerca de 17 das 26 conferências "não cumpriu" (seção 2) vêm de intervalo errado (união de briefs, `--desde` na base inteira, outra branch). Cada uma exigiu uma decisão técnica do Jarvis ("sem retrabalho") e, em 4, uma linha nova no pedido. Sem retrabalho de autor medido, mas o "não cumpriu" perdeu valor de sinal: 2 de 28 deram "cumpriu".

**E. Ruleset estrito e PRs em fila (K-161).** O #153 estava pronto às 06:38 e o `e2e` verde; às 09:01 o #154 do 044 entrou na develop e deixou o #153 `BEHIND`, com o merge recusado às 09:02. Do recusado ao merge: 1 h 05 min (brief de 4 rodadas, negação, dono traz a develop às 09:44, checks do head novo, merge às 10:07). O #151 foi mesclado às 10:56 e o #152 continua aberto (`UNSTABLE`). Na ordem real, #150 (05:06), #154 (09:01), #153 (10:07) e #151 (10:56): 49 a 66 min entre merges em série. O desenho estrito é proteção; não se propõe afrouxar.

**F. Delegação do merge negada pelo classificador (2026-10-28 09:19).** O classificador de permissões negou a delegação de "merge do PR #153 e limpeza de branch e worktree" ("Git Destructive") e nada foi executado; o #153 ficou 48 min parado até o dono agir (K-108 "Bloqueado" no quadro por 1 h 42 min). No #150, com o mesmo conteúdo, só a exclusão da branch remota foi negada e o merge saiu. O motivo da diferença não está registrado. A exclusão da branch já tem K-160.

**G. Medição a frio do F4 e perguntas ao dono.** A 1ª condição do critério de reversão do ADR 0003 se cumpriu em 9 de 10 repetições (acima de 100 ms), e a pergunta ao dono ("percebe demora?") esperou 2026-10-27 15:20 até 18:03. Custo: 1 movimento errado do Jarvis no quadro (K-149 para "Aguardando o dono" às 18:00:35, desfeito em 5 s) e a espera de uma decisão que não bloqueava o K-149. O dono respondeu A (nada muda).

**H. Cartões do pedido abertos depois de mesclados.** `KANBAN.md` ainda mostra abertos K-092, K-107, K-115, K-123, K-132, K-134, K-135, K-138 e K-149 (linhas 34, 36, 38, 68, 71, 76, 77, 89, 90), todos do 041, sem movimento para "Pronto" no `historico.md`; só o K-108 fechou (2026-10-28 11:01:18). Sem fechamento, lead time, cycle time e vazão do pedido não saem dos dados do quadro. A mesma falha apareceu na retrospectiva do 025 (ação 2) e do 044 (K-155 em "Pronto" no merge da develop, sem a nota "Na develop").

## 5. Ações (no máximo 3)
| # | Ação | Responsável | Como medir |
|---|---|---|---|
| 1 | Fechar no quadro os 9 cartões do 041 hoje, com `forge-check movimento`, citando o PR (#150 para K-092, K-107, K-115, K-123, K-132, K-134, K-135, K-138 e K-149) depois de conferir cada um contra o diff do PR; passar a lançar o movimento no mesmo turno do merge | Jarvis | Cartões de pedido entregue ainda abertos = 0 no próximo pedido; lead time e cycle time calculáveis |
| 2 | Pedido com várias delegações ao mesmo papel numera uma etapa por delegação (E5.1a, E5.1b ...) e o brief gerado traz as outras como "etapa de outra delegação; já entregue" (K-147 já cobre o resto da família) | Jarvis (gabarito do pedido); Forge | Reprovações de brief por `escopo` ou `etapa` abaixo de 5% das rodadas nos próximos 3 pedidos (hoje 14 de 73, 19%) |
| 3 | Trava de suíte única na máquina: um arquivo de trava (`flock`) no script do `pronto` e da E2E; quem não pega a trava espera, em vez de checar `pgrep` | tech-lead (script do projeto); Forge se virar regra | Execuções da suíte com outra suíte rodando = 0 e `plataforma2.test.ts` sem timeout nas próximas 20 rodadas |

## 6. Linhas MELHORIA (R-DECISAO)
Já têm cartão e não ganham linha nova: `--desde` por branch e `--desde` com merge da develop (K-147 e K-158); `Desde:` obrigatório no brief de entrega (K-158); fila de merge e merges em série com ordem registrada (K-161); exclusão da branch remota (K-160); gabarito do pedido sem etapa de retrospectiva (K-159); `forge-check pr` rc=0 como PQ (K-156); número de testes em PQ por comando (K-157); `timeout` do `plataforma2.test.ts` sob carga (K-150); E2E completa no portão e noturna da homolog (K-144).

MELHORIA: 2026-10-28 · Projeto (Jarvis, quadro) · classe Melhoria vista, sem custo e sem afrouxar controle · nove cartões do 041 seguem abertos no quadro com o PR mesclado, e não há linha de "Pronto" no histórico. Evidência: `KANBAN.md` linhas 34, 36, 38, 68, 71, 76, 77, 89 e 90; `docs/kanban/historico.md` (último movimento de cada um: 2026-10-23 a 2026-10-27); PR #150 mesclado em 2026-10-28 05:06:35. Medir: cartões de pedido entregue ainda abertos = 0. Proposta: ação 1 da seção 5.

MELHORIA: 2026-10-28 · Forge (hook `parecer` e `forge-check pr`, R-PROVA) · classe Melhoria vista, mas muda como o hook confere, então vai ao dono como decisão (R-CONFORMIDADE) · o hook `parecer` barra o merge no modo estrito (sem base) quando a develop andou depois do `commit:` dos pareceres, enquanto o `forge-check pr --base origin/develop` aceita o merge puro da base; o `forge-check pr` também cobra parecer de branch já mesclada do mesmo pedido, e a gramática do achado não aceita intervalo de linhas. Custou 5 revalidações sem mérito em 2 PRs. Evidência: pedido 041, Histórico de 2026-10-27 21:52 e 2026-10-28 05:58, 06:21 e 06:27; `conferencias.md` de 2026-10-28 06:08 a 06:37. Medir: revalidações de parecer por merge da base = 0 por PR. Proposta: o hook usa a mesma base do `forge-check pr`, o `forge-check pr` ignora parecer de branch mesclada e o formato do achado aceita `arquivo:linha-linha`; ou a regra do fluxo "trazer a develop antes do review final" quando houver PR aberto em paralelo.

MELHORIA: 2026-10-28 · Projeto (tech-lead, brief de merge) com decisão do dono sobre a permissão · classe Melhoria vista, exceto a permissão do classificador (dono) · a delegação de merge junto com limpeza de branch e worktree foi negada inteira ("Git Destructive") e parou o #153 por 48 min; no #150, com o mesmo conteúdo, só a exclusão da branch remota foi negada. Evidência: pedido 041, Histórico de 2026-10-28 09:19 e 05:16; `conferencias.md` de 2026-10-28 05:19. Medir: merges que o classificador bloqueia por inteiro = 0. Proposta: brief de merge só com o merge (squash) e os checks; a limpeza vai em brief próprio ou fica para o K-160 (apagar a branch depois do merge no repositório), de modo que uma negação não pare o merge.

MELHORIA: 2026-10-28 · Forge (skill `qa-testing`) com ajuste no brief do QA · classe Melhoria vista, sem custo · o JSON da E2E de 8 workers (os 20 testes que falharam) se perdeu nas quedas e o diagnóstico ficou sem confrontar a lista do K-132. Evidência: `docs/qa/041-estabilidade.md` seção 8 (linha de K-132) e "Pendências da E1.1" (seção 10). Medir: rodada longa de suíte sem JSON gravado em arquivo = 0 nos próximos 3 pedidos. Proposta: rodada longa (mais de 10 min) grava o relatório JSON de forma incremental em arquivo fora de `/tmp` e fora de `docs/qa/evidencias`, antes de rodar a próxima.

MELHORIA: 2026-10-28 · Projeto (processo da suíte única, ação 3) · classe Melhoria vista, sem custo e sem afrouxar controle · a regra "uma suíte por vez" depende de checagem por `pgrep` entre agentes, com corrida; uma violação (2026-10-27 19:14) custou 1 rodada do `pronto` (K-150, `plataforma2.test.ts` com timeout de 30 s). Evidência: `conferencias.md` de 2026-10-27 19:16; pedido 041, Histórico de 2026-10-23 15:00, 16:10 e 2026-10-27 19:14. Medir: execuções com outra suíte rodando junto = 0 e `plataforma2.test.ts` sem timeout nas próximas 20 rodadas. Proposta: `flock` no script do `pronto` e da E2E (projeto); se funcionar, vira proposta ao Forge.

MELHORIA: 2026-10-28 · Forge (gabarito do pedido e `brief gerar`) · classe Melhoria vista, sem custo · pedido com várias delegações para o mesmo papel gera briefs cuja lista de "etapa de outra delegação; já entregue" cresce a cada rodada; 14 de 73 rodadas de brief foram reprovadas por `escopo` ou `etapa` (19%). Evidência: `conferencias.md` do 041 (2026-10-23 11:24, 17:56; 2026-10-27 14:02, 14:04, 15:13, 15:25, 20:28; 2026-10-28 05:21, 05:36, 06:08, 06:23, 09:13, 09:15 e 2026-10-27 22:05); o brief do merge do #153 levou 4 rodadas. Medir: reprovações de brief por `escopo` ou `etapa` abaixo de 5% das rodadas em 3 pedidos. Proposta: uma etapa numerada por delegação (ação 2 da seção 5).

MELHORIA: 2026-10-28 · Projeto (pedido, Registro de clareza) · classe Melhoria vista, sem custo · o "Registro de clareza" do pedido ficou em "PERGUNTA: nenhuma" desde a abertura, com 4 perguntas, 1 NAO-ENTENDI e 1 ESCOPO+ gravados só no Histórico; as medições de clareza dependem da leitura do Histórico inteiro. Evidência: `docs/pedidos/041-estabilizar-os-testes.md` seção "Registro de clareza" e Histórico de 2026-10-23, 2026-10-27 17:21. Medir: pedidos com tag de clareza só no Histórico = 0. Proposta: o Jarvis acrescenta cada PERGUNTA, NAO-ENTENDI, ESCOPO+/- e DEVOLVIDA também na seção "Registro de clareza" no mesmo turno em que grava no Histórico.

## 7. Revisão da retrospectiva anterior (044)
- Ação 1 (`forge-check pr` rc=0 e número de testes por comando, K-156 e K-157): sem efeito para medir; os cartões estão abertos (Forge). Neste pedido a autoria de parecer foi cobrada pelo hook e pelo `forge-check pr` 5 vezes (seção 4, C): em observação, e a medição só vale depois da mudança no Forge.
- Ação 2 (merges em série, K-161): funcionou em parte. Os merges do pedido saíram em série (#150, #154, #153, #151) com 49 a 66 min de distância; a ordem não ficou registrada no pedido antes do #153 e foi o dono quem mesclou dois (#153 e #151). Não funcionou ainda sem o registro da fila no pedido.
- Ação 3 (`Desde:` no brief de entrega, K-158): não funcionou. Este pedido teve cerca de 17 conferências "não cumpriu" pela família do K-147 (seção 4, D); a ação é de fábrica e ainda não foi aplicada.
- Da retrospectiva do 044 (E): o problema do ruleset estrito repetiu no #153 e custou 1 h 05 min; K-161 segue aberto.
