# Problemas do Forge vividos no MetricasDSPD, para o Jarvis do Forge

Data: 2026-10-28 · Pedido 046 (K-171) · Autor: agile-coach · Forge em uso: 0.28.0 a 0.30.3

## Contexto para o Jarvis do Forge

Este resumo reúne os problemas de processo e de ferramenta da fábrica que o projeto MetricasDSPD viveu entre 2026-10-20 e 2026-10-28, lidos das linhas `MELHORIA:` das retrospectivas (025, 036, 037, 040, 041, 042, 044) e dos pedidos, dos cartões `[forge]` do quadro, de `docs/kanban/conferencias.md` e de `docs/kanban/escapes.md`. Problema do produto (métricas, regras de negócio) ficou fora. Cada item traz evidência, custo e proposta. Regra de leitura: `medido` = número lido de arquivo ou de comando nesta data; `estimado` = conta feita por mim a partir de duração conhecida. Nada afrouxa controle sem decisão do dono: onde a proposta mexe em como um portão confere, está marcada "vai ao dono (R-CONFORMIDADE)". Estado de cada item: `K-nnn` = cartão no quadro (só propor ao Forge), `F21/F22` = já levado ao Forge (arquivo `docs/kanban/prompt-jarvis-forge-2026-10-21.md`), "sem cartão" = ainda não tem. A lista F1 a F20 foi levada em 2026-10-23, mas o texto dela não está neste repositório; não consegui marcar item a item e só citei o vínculo onde o pedido o registra (a família K-147 aparece nos pedidos 025 como F17/F19). Convém cruzar com a sua lista antes de abrir cartões.

Totais medidos em `conferencias.md` (452 linhas): 318 conferências de brief com 110 reprovadas (24 sem mérito, 17 com mérito parcial); 134 conferências de entrega com 82 "não cumpriu"; 19 notas `tardio`. `forge-check esperas`: 1849,3 min de espera do dono em 13 esperas e 555,3 min em 5 esperas "outra".

## Os 5 problemas de maior custo

1. P-B4 · Conferência de entrega sem marca de corte (`Desde`/faixa): 82 de 134 entregas "não cumpriu", muitas só pela faixa (medido; a fração só pela faixa não foi contada).
2. P-C2 · Hook `parecer` e `forge-check pr` com bases diferentes e parecer de branch mesclada: 5 revalidações na 041 e 17 min, 2 reprovações e 3 "não cumpriu" na 042 (medido).
3. P-A3 · Ambiente novo: 89 de 96 min de lead à espera do dono (medido, K-141); mais 68,5 min do K-148 (medido).
4. P-E1 · Merge em lote de PRs com check vermelho: develop vermelha por 2 h 33 min 05 s (medido).
5. P-E2 · Fila de merge e classificador: 3 PRs `BEHIND` com ~19 min de `e2e` cada, ~57 min (estimado) e merge parado 48 min pelo classificador (medido).

## Tema 1. Hooks e conferência de comando

### P-A1 · O hook R-CONFORMIDADE barra comando de leitura inofensivo
- Evidência: pedido 039 (laço `for b in ...; git cherry`); pedido 045 (`flock` e `command -v flock`; PATH do agente sem `pnpm`/`node`); pedido 026 de 2026-10-28 13:57 (`$?` barrado até em leitura); pedido 043 de 21:37 e 21:59 (`2>&1` lido como refspec, `{}` de `find`, nome de teste do Forge em `grep`); K-147 ("hook barra caminho em texto de Bash").
- Custo: ~1 comando por branch no 039; reescritas de brief e de comando em 4 pedidos (estimado, sem rodada contada).
- Melhoria: o hook analisa só o comando real (não texto de argumento, `grep`, redirecionamento nem `$?`), e a mensagem de bloqueio diz o comando seguro equivalente. Estado: K-147 cobre "caminho em texto"; o resto sem cartão.

### P-A2 · Vigia marca "contorno" em GET de leitura depois de um bloqueio
- Evidência: K-147 (nota de 2026-10-27 14:40 a 14:42, conferente e devops-engineer).
- Custo: alarme possivelmente falso, 2 registros (medido).
- Melhoria: o vigia ignora leitura (GET, `git log`, `gh ... view`) ao classificar contorno. Estado: K-147.

### P-A3 · Brief de ambiente novo manda a um papel o que o hook proíbe
- Evidência: pedido 040 (Andamento 15:25; `conferencias.md` 15:17), retro 040 itens A a C; retro 042 (MELHORIA de `forge doutor`); K-141 e K-140.
- Custo: 1 delegação perdida e 9 min no 040 (medido); no 042, 89 de 96 min de lead à espera do dono, 58 min só pelo grupo `docker` que não vale sem reiniciar a sessão, mais o `pnpm` ausente (medido); mesma lib `libnspr4` travou os pedidos 036 e 025 (K-118, K-110).
- Melhoria: um roteiro de "computador novo" no Forge (dono: sudo, Docker, grupo antes de abrir a sessão ou `setfacl` temporário, `.env`; tech-lead: `pnpm install`; devops-engineer: banco; `playwright install-deps`) e `forge doutor` que checa grupo `docker`, `pnpm` e libs do Chromium antes da primeira delegação. Estado: sem cartão de fábrica (K-142 e K-143 são do projeto).

### P-A4 · Hook barra o conferente em `git worktree` e `--raiz`
- Evidência: pedido 043 de 2026-10-27 21:34 (entrega "não verificável por ambiente").
- Custo: 1 entrega aceita sem verificação independente (medido).
- Melhoria: liberar leitura de worktree para o conferente ou documentar o caminho de conferência em clone de contribuição. Sem cartão.

## Tema 2. Brief e conferente

### P-B1 · Conferente relata achado na 2ª ou 3ª rodada que já via na 1ª ("tardio")
- Evidência: 19 notas `tardio` em `conferencias.md` (medido), entre elas 2026-10-20 20:53 e 20:55 (035), 2026-10-28 05:44, 05:47, 11:08 (042); retro 037 (12 de 34 reprovações sem mérito, 3 tardias; M16 reprova corte por leitura, não pelo `forge-check`: 3 puras e 2 parciais no 036); brief do QA do E1.3 com 4 rodadas em 9 min.
- Custo: 24 reprovações de brief sem mérito no total (medido); 4 rodadas em 9 min no pior caso (medido).
- Melhoria: o conferente lista todos os achados de escopo, forma e citação na 1ª rodada e só reprova de novo por achado novo; o corte vem do `forge-check`, nunca de leitura. Estado: K-168 (tardio); M16 sem cartão.

### P-B2 · Decisão do dono, nova ou que revê outra, não chega ao brief seguinte
- Evidência: retro 025 (8 de 15 reprovações de brief por `decisao`, 2 improcedentes, 2026-10-22 04:13 e 04:31).
- Custo: 8 rodadas (medido).
- Melhoria: bloco de decisões em cópia literal, mais nova primeiro, com `revê:`; o conferente lê nessa ordem. Estado: sem cartão (MELHORIA da retro 025 sem cartão `[forge]` correspondente).

### P-B3 · Pedido com várias delegações ao mesmo papel gera reprovação por `escopo` ou `etapa`
- Evidência: retro 041 (14 de 73 rodadas, 19%; brief do merge do #153 com 4 rodadas); retro 044 (2 reprovações por texto do pedido, sem a retro em `## Etapas`); retro 040 (renumeração E1.2 para E4.1 à mão); retro 037 (promoção com lista digitada que omitiu 035, 036, 038, 039: 7 de 34 reprovações por `escopo`); retro 025 (etapa do mesmo papel em outro momento sem marca, dois conferentes com vereditos opostos).
- Custo: 14 + 2 + 7 reprovações (medido); renumeração à mão (1 vez).
- Melhoria: gabarito do pedido já traz a etapa da retrospectiva e uma etapa por delegação; `brief gerar` monta Entregar e Fora do escopo a partir do pedido, não digitados; R-BRIEF escreve a exceção por papel ou momento. Estado: K-166 e K-159; promoção e R-BRIEF sem cartão.

### P-B4 · Conferência de entrega sem `Desde`/faixa mede commits de outros papéis (família K-147)
- Evidência: K-147, K-158; retro 044 (08:10); pedido 025 (15:40, faixa b6c7673..8a97686; 22/10 22:05; 23/10 06:26); 041 de 2026-10-27 14:01 e 19:16 e 28/10 11:12; 042 de 11:17 (branch compartilhada do Jarvis, 154 arquivos de outros papéis); entrega "não cumpriu" por `Desde` ausente que diverge do Base-sha.
- Custo: 82 "não cumpriu" em 134 entregas (medido); a parte só por faixa não foi contada; cada uma exigiu decisão técnica do Jarvis e nota no Histórico (estimado 3 a 5 min cada).
- Melhoria: `Desde:` obrigatório no brief de entrega; `--desde` por branch quando o pedido tem duas; o `--desde` não cai na base inteira com merge da develop; regra de fechar faixa de várias entregas após pausa ou troca de computador (R-PROVA). Estado: K-147 e K-158; regra da faixa sem cartão.

### P-B5 · `brief gerar` propõe PQ `cmd` para papel sem Bash
- Evidência: K-147; pedido 041 linha 97; retro 036 (brief pede commit a ux-designer, que não tem Bash: entrega "não cumpriu", 2026-10-20 22:01).
- Custo: 1 entrega "não cumpriu" (medido) mais 1 verificação manual pelo Jarvis em cada caso.
- Melhoria: PQ de `grep`/arquivo para esses papéis, ou marca "verificador: jarvis". Estado: K-147.

### P-B6 · Volta (`--anterior`) exige "Fora do escopo" idêntico mesmo com etapa nova
- Evidência: pedido 026 de 2026-10-28 11:54 (o corte exige citar o E1.9, que entrou depois do ux-3); K-147 (ESCOPO+).
- Custo: 1 brief novo sem `Volta-de` (medido).
- Melhoria: aceitar acréscimo de etapa nova marcado `ESCOPO+`. Estado: K-147.

### P-B7 · Opção de decisão sobre ato reservado ao dono põe o devops como quem aplica
- Evidência: retro 042 (proteção da develop; o Jarvis leu só a proteção clássica, sem o ruleset).
- Custo: 5 perguntas ao dono para 1 cartão e 4 reprovações de brief e entrega por `decisao` ou `base` (medido).
- Melhoria: o gabarito de opção marca o dono como quem aplica; a leitura da proteção inclui o ruleset. Estado: K-167.

### P-B8 · Pedido de contribuição ao Forge: Base-sha do clone x do projeto
- Evidência: pedido 043 de 2026-10-27 20:46 e 20:50 (o `forge-check brief` só aceita Base-sha na develop do repositório do pedido).
- Custo: 1 reprovação e 1 entrega "não cumpriu" por escopo (medido).
- Melhoria: o cabeçalho aceita a base do repositório de contribuição, ou o pedido de melhoria da fábrica tem modelo próprio. Sem cartão.

### P-B9 · Brief e PQ citam número de run anterior ou checagem que dá falso positivo
- Evidência: retro 044 (726 no pedido, 716 medido; run 40677944455); pedido 026 de 12:37 (`pgrep -af` casa com o próprio shell).
- Custo: 1 divergência de número (medido); 2 esperas de 10 min à toa (medido).
- Melhoria: número em PQ só por comando (`--list`), com data e commit; checagem de suíte rodando por `fuser`/trava, não por `pgrep -af`. Estado: K-157; `pgrep` coberto pelo pedido 045.

### P-B10 · `forge-check brief` não avisa que review e segurança exigem a branch no remoto
- Evidência: K-147 (nota 042, 14:36); pedido 043 20:50 (push antes do review).
- Custo: 1 reprovação (medido).
- Melhoria: aviso quando o brief proíbe push e a etapa é review ou segurança; o conferente não lê "não nesta delegação" como pendente. Estado: K-147.

## Tema 3. Autoria e validade de parecer

### P-C1 · Autoria do parecer só é cobrada depois do QA
- Evidência: retro 044 (08:10 e 08:33); pedido 045 de 13:36 (ajuste de parecer por script não registra autoria).
- Custo: 1 brief, 1 entrega e 1 conferência, 6 min no caminho crítico (medido).
- Melhoria: `forge-check pr` rc=0 entra como PQ de toda entrega que grava parecer; ajuste de parecer só por Edit. Estado: K-156.

### P-C2 · Hook `parecer` e `forge-check pr` leem a base de modo diferente; pareceres de branch já mesclada barram o PR
- Evidência: retro 041 (hook estrito sem base barra o merge quando a develop andou; `forge-check pr` aceita o merge puro da base); retro 042 (pareceres do 151 cobrados porque `.forge/versao` mudou, 06:07 a 06:24); pedido 041 de 2026-10-28 05:58 (gramática do achado recusa `arquivo:linha-linha`), 06:21 e 06:27 (`.gitignore` mudou depois do parecer).
- Custo: 5 revalidações sem mudança de conteúdo (041); 2 reprovações de brief, 2 revalidações em série e 3 "não cumpriu" por `Desde` em 17 min (042) (medido).
- Melhoria: os dois usam a mesma base; arquivo que não é do pedido (`.forge/versao`, `.gitignore`) não invalida parecer de outro pedido; achado aceita intervalo. Vai ao dono (muda como o portão confere, R-CONFORMIDADE). Estado: K-164 (opção B do dono: só a parte que não afrouxa).

### P-C3 · Documentação de UX ou ordem do UX depois do QA invalida review e QA
- Evidência: pedido 025 (22/10); retro 036 (ordem UX depois do QA, 22:52 e 22:57); R-QA isenta diff só de documentação.
- Custo: 2 delegações extras no 036 (medido); pareceres invalidados no 025 (contagem não registrada).
- Melhoria: `docs/ux/` fora do cálculo de "desatualizado", ou a ordem do fluxo comita a UX antes dos pareceres. Vai ao dono (muda o fluxo). Sem cartão.

### P-C4 · Parecer de segurança não acompanha correção posterior no mesmo gatilho
- Evidência: retro 025 (E1.4b, parecer em 32a509f e correção 5108fcd; conferência de 23/10 06:26).
- Custo: parecer achado desatualizado depois do merge (1 caso, medido).
- Melhoria: a regra de "desatualizado" olha só os arquivos do gatilho (R-SEGURANCA). Sem cartão.

### P-C5 · `forge-check pr` não lê o clone de contribuição do Forge
- Evidência: pedido 043 de 2026-10-27 22:10 (`commit:` dos pareceres só existe no clone); K-153.
- Custo: PR do F22 parado em "Aguardando o dono" por mais de 12 h (medido, `forge-check esperas`: K-153 aberta desde 22:03).
- Melhoria: `forge-check pr --repo` ou leitura do clone nos pedidos de melhoria da fábrica. Vai ao dono. Sem cartão.

## Tema 4. Suíte e teto de recursos

### P-D1 · "Uma suíte por vez" depende de checagem humana entre agentes
- Evidência: retro 041 (violação em 2026-10-27 19:14, K-150); pedido 045 (hook barra `flock`).
- Custo: 1 rodada do `pronto` perdida (medido); fixado por script e trava no projeto (pedido 045).
- Melhoria: a trava de suíte única entra no stack do Forge (R-TETO), com `flock` liberado ao hook para essa finalidade. Estado: pedido 045 (projeto); Forge sem cartão.

### P-D2 · Rodada longa perde o JSON do relatório quando o WSL cai
- Evidência: retro 041 (seção 8 do QA, linha de K-132 e "Pendências da E1.1").
- Custo: diagnóstico de 20 testes sem confronto com a lista do K-132 (medido).
- Melhoria: rodada com mais de 10 min grava o JSON de forma incremental fora de `/tmp`. Estado: K-165.

### P-D3 · Pre-push falha em worktree nova sem dependências
- Evidência: F21 (promoção 2026-10-23, worktree `-promo`); K-152.
- Custo: 1 push barrado por worktree nova (medido).
- Melhoria: roteiro de worktree inclui `pnpm install --frozen-lockfile`, ou o pre-push avisa. Estado: F21 enviado; K-152 aguarda o dono aplicar o patch do pre-push.

### P-D4 · Testes do próprio Forge recusam rodar dentro do Claude; Neutralidade varre `__pycache__`
- Evidência: pedido 043 de 20:43, 20:51, 21:32, 21:59 (unittest 2130 testes, 59 falhas iguais na base e na branch; Neutralidade lendo `__pycache__` com `PYTHONDONTWRITEBYTECODE`).
- Custo: PQ de rc=0 nunca provável localmente, só na CI (medido: 59 falhas em 4 rodadas).
- Melhoria: testes que dependem de ambiente fora do Claude são marcados e pulados com aviso; Neutralidade ignora `__pycache__` não versionado. Sem cartão.

### P-D5 · Servidor de outra worktree é reaproveitado e gera medição falsa
- Evidência: retro 037 (`reuseExistingServer`, K-131: 10-21 16:14 a 10-22 15:02); retro 036 (K-120, porta 4173).
- Custo: um "D1" falso de QA e ~23 h de cartão aberto (medido, historico).
- Melhoria: o modelo de QA do Forge exige porta livre ou falha se a porta responde. Item do projeto (`playwright.config.ts`, K-120); registro de fábrica sem cartão.

## Tema 5. Fluxo de merge, PR e quadro

### P-E1 · Merge de lote de PRs com check vermelho
- Evidência: retro 042 (PRs #145 a #147 do Dependabot mesclados com `filtro` vermelho, 3 dias depois de abertos); K-151, K-145, K-146.
- Custo: develop vermelha por 2 h 33 min 05 s (medido).
- Melhoria: política de merge de dependência no Forge (checks verdes e pelo menos um humano ou time aplica); a decisão de bypass é do dono. Estado: K-169 (projeto, aguarda o dono).

### P-E2 · Checks estritos, fila de merge e classificador de permissões
- Evidência: retro 044 (ruleset 25003880, `strict_required_status_checks_policy: true`, #151 a #153 `BEHIND`, ~19 min de `e2e` cada); retro 041 (merge com limpeza de branch e worktree negado inteiro como "Git Destructive", #153 parado 48 min; no #150 só a exclusão da branch remota); retro 044 (branch remota segue no origin).
- Custo: ~57 min de reexecução (estimado); 48 min de parada (medido).
- Melhoria: brief de merge leva só o merge e a limpeza vai em delegação própria (prática do Jarvis aplicada no 045); modelo de repositório do Forge liga "apagar branch depois do merge"; fila de merge ou atualização automática da branch. Vai ao dono (ruleset e acesso). Sem cartão de fábrica.

### P-E3 · PR de release criado vazio por automação e corrida do `homolog-aprovada`
- Evidência: F22, PR #144, 2026-10-23 16:35:58Z; retro 037 (corrida voltou no #144, E2.9); K-153.
- Custo: 1 check vermelho por corrida e 1 `gh pr create` duplicado por release (medido).
- Melhoria: criar o PR de release só depois do portão verde, ou o check espera o portão. Estado: F22 enviado; K-153 aguarda o dono.

### P-E4 · Histórico aceita movimento inconsistente e "Pronto" sem merge
- Evidência: retro 025 (K-110, 22/10 04:13:13, 04:23:07, 15:01:03, 15:04:01, 15:32:29; "Pronto" em 23/10 11:13:18, release só às 14:28:07); retro 036 (K-118 em "Pronto" às 21:59:27 sem merge); K-170 (`--de Bloqueado` sem linha de entrada, historico 2026-10-28T09:12:05); retro 037 (K-108 parado 6 dias sem linha).
- Custo: retrabalho do histórico diferente do real (não contado); 9 cartões do 041 abertos com PR mesclado (medido, retro 041).
- Melhoria: `forge-check movimento` recusa `--de` diferente do último `Para`, exige a volta de devolução e recusa "Pronto" sem merge (ou com a política "pronto: não reproduz" já no quadro). Estado: K-170 (Bloqueado); o resto sem cartão.

### P-E5 · Esperas de pessoa dentro de "Em andamento" ficam fora do histórico
- Evidência: retro 040 (cerca de 19 min no K-136, só 15:01 a 15:16 registrados); `forge-check esperas`: 1849,3 min do dono em 13 esperas (medido).
- Custo: tempo bloqueado subestimado em até 19 min por pedido (medido, 040).
- Melhoria: política do Jarvis grava "Aguardando o dono" a cada espera, com `forge-check movimento`. Sem cartão.

### P-E6 · Não há fluxo de upgrade que deixe o agente gravar `.forge/versao` com autorização do dono
- Evidência: pedido 038 (MELHORIA do tech-lead); pedido 042 (upgrade 0.30.3).
- Custo: 1 etapa dependente do dono por upgrade (medido, 038 e 042).
- Melhoria: skill de upgrade com a autorização do dono como entrada explícita. Sem cartão.

### P-E7 · Registro de clareza e quadro defasados em relação ao Histórico
- Evidência: retro 041 (4 perguntas, 1 NAO-ENTENDI e 1 ESCOPO+ só no Histórico, com "PERGUNTA: nenhuma" desde a abertura).
- Custo: medição de clareza exige ler o Histórico inteiro (medido).
- Melhoria: o gabarito do pedido faz o Jarvis acrescentar a tag no mesmo ato do registro. Item de processo do Jarvis; sem cartão `[forge]`.

## Itens de fábrica por estado

- Já levados ao Forge: F21 (P-D3) e F22 (P-E3).
- Com cartão `[forge]` (só propor): K-147 (P-A1, A2, B4, B5, B6, B10), K-156 (P-C1), K-157 (P-B9), K-158 (P-B4), K-159 e K-166 (P-B3), K-164 (P-C2), K-165 (P-D2), K-167 (P-B7), K-168 (P-B1), K-170 (P-E4).
- Sem cartão: P-A3, A4, B2, B8, C3, C4, C5, D4, D5, E2, E4 (restante), E5, E6, E7. Sugestão: o Jarvis do Forge abre um cartão por tema, na ordem dos 5 de maior custo.

## Adendo 2026-10-29 · Pedido 050 (release v0.2.0) · Autor: Jarvis

Itens novos vividos no 050, ainda sem cartão; a retrospectiva do 050 (agile-coach) mede os custos.

- P-N1 · `Desde` sem saída em branch nova depois de squash. A branch nova sai da `develop`, e nenhum sha do Histórico é ancestral dela sem ser também ancestral da base. O conferente exige o `Desde` e o `forge-check` o recusa (`desde_valido`). Saída hoje: decisão do dono (LACUNA R-PROVA) a cada etapa. Melhoria: aceitar `Desde` ausente quando a branch nasce do `Base-sha` gravado no brief, ou o `forge-check` aceitar o `Base-sha` como `Desde`.
- P-N2 · Review próprio exigido para correção de uma linha. O hook `parecer.py` barrou o PR de uma branch que só mudava o `commit:` do frontmatter de um parecer, e foi preciso uma etapa a mais (E1.10). Melhoria: o `forge-check brief` avisa, ao planejar o PR de uma branch nova, que ela precisa de parecer de review próprio; ou o hook dispensa review em diff só de frontmatter de parecer (vai ao dono, R-CONFORMIDADE).
- P-N3 · `forge-check pr` contra a `main` só roda no fim. O parecer de devops desatualizado só apareceu depois da promoção para a `homolog`, e a correção custou a volta inteira (develop → homolog de novo). Melhoria: rodar `forge-check pr --ref <candidata> --base origin/main` antes do PR de promoção para a `homolog`.
- P-N4 · Brief antigo reprovado por decisão nova. Um brief já aprovado, relido depois de uma decisão nova do dono, passa a aparecer como reprovado. Melhoria: o conferente compara o brief com as decisões vigentes na hora da aprovação (o hash trava o texto).
- P-N5 · Agente preso esperando checks de PR já mesclado. O tech-lead ficou ~15 min (estimado) num laço sobre os checks de um PR já mesclado, porque um run antigo da branch seguia "em andamento". Melhoria: os agentes esperam pelo estado do PR (`state`) e saem do laço quando ele está MERGED; padrão de espera único numa skill.
- P-N6 · Pergunta desnecessária ao dono. O Jarvis pediu ao dono para fixar o `Base-sha` como base do delta, mas a ferramenta não aceita esse sha como `Desde`. Melhoria: `forge-check brief gerar` recusa na hora o sha que o `desde_valido` não aceitaria, antes de virar pergunta.
- P-N7 · O hook barra comando legítimo: `$?`, crase, chaves, aspas e heredoc com texto que cita PR ou merge (até um append de documentação foi lido como PR). A saída é gravar um script com Write. Melhoria: junta-se ao P-A1 (o hook analisa só o comando real).
- P-N8 · Parecer reescrito por Bash, ou levado por squash, perde o registro de autoria. A versão do parecer de devops da E1.8 não entrou em `.forge/run/autoria.jsonl`, e o `forge-check pr` contra a `main` só acusou isso no PR de release. Foi preciso uma etapa a mais (E1.11), em que o devops regravou o mesmo texto com Write. Melhoria: o `forge-check pr` contra a `develop` também confere a autoria, e o hook registra a autoria no commit do parecer, não só na escrita.
- P-N9 · Entrega de tag não tem diff próprio. A conferência da E2.1 trouxe a release inteira como escopo fora do intervalo, e isso virou pergunta ao dono (decisão "A", LACUNA R-PROVA na tag). Melhoria: o `forge-check entrega` reconhece a etapa de tag e confere só o objeto da tag, o sha que ela aponta e o portão verde.
