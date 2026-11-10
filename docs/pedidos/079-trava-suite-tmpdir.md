# Pedido 079: trava da suíte única fora do /tmp fixo (K-201)

- **Modo:** implementar
- **Objetivo:** o `pnpm run pronto` e o `pnpm test` rodam no sandbox dos agentes: `scripts/suite-unica.sh` deixa de exigir `/tmp/metricas-dspd-suite.lock` fixo, sem perder a exclusão de uma suíte por vez entre as worktrees
- **Clareza:** 0 confirmado; 2 técnico; 1 suposição; 0 perguntas
- **Depende de:** —

## Escopo
- E1. K-201: a trava de `scripts/suite-unica.sh` usa um caminho que o sandbox dos agentes grava (ex.: `$TMPDIR`), mantendo uma trava única para todas as worktrees da estação, com o teste do script (`scripts/suite-unica.test.sh`) cobrindo o caminho novo · `técnico`

## Etapas
- E1.1 (devops-engineer): implementação em `scripts/suite-unica.sh` e no teste do script, com parecer de devops em docs/devops/.
- E1.2 (tech-lead): review.
- E1.3 (qa-engineer): QA.
- E1.4 (tech-lead): PR para a develop, depois do QA.
- E1.5 (agile-coach): retrospectiva do pedido 079.

## Fora do escopo
- K-175 (endurecer a trava: retorno do flock, fd herdado, espera sem teto) · `técnico`
- Mudar a CI ou o pre-push · `técnico`

## Suposições
- O sandbox dos agentes grava em `$TMPDIR` (/tmp/claude-1000 nesta estação) e todos os agentes e o dono veem o mesmo caminho quando a variável aponta para lá; o devops-engineer confirma antes de escolher. Base: a nota do sandbox desta sessão e o K-201. Muda com: um caminho que só um agente vê (a trava deixa de excluir entre worktrees). Custo de reverter: baixo (uma linha do script).

## Perguntas na fila

## Histórico
- 2026-11-07 06:28: pedido aberto (Jarvis) pela autonomia de melhoria técnica do projeto (cartão K-201, MELHORIA vista na E1.6 do 063, prioridade "bloqueia o pronto de todos os agentes"): não muda produto, não afrouxa portão, não custa dinheiro; sem recibo ao dono, aviso no resumo da manhã. Discovery técnico curto dentro da E1.1 (o devops-engineer escolhe o caminho e registra o motivo no parecer). Sem gatilho de segurança (script local de teste; não toca CI, segredo nem dado). Lote: cabe sozinho (nenhum outro item em `scripts/`).
- 2026-11-07 06:31: Brief devops-engineer-1 aprovado e delegado (052g).
- 2026-11-07 06:34: E1.1 entregue pelo devops-engineer: feature/079-trava-suite-tmpdir em d3832481f3c2fcf90bb8a4c3de78924fa72a94b6 (script em 61cafba2, parecer docs/devops/079-trava-suite-tmpdir.md aprovado); trava em /tmp/claude-<uid>/metricas-dspd-suite.lock (caminho fixo por usuário, não TMPDIR, para o dono no terminal e os agentes dividirem a trava); METRICAS_DSPD_SUITE_LOCK e a recusa de link mantidos (agora também no diretório); suite-unica.test.sh com o caso novo, rc 0. Suposição confirmada só nesta sessão (TMPDIR=/tmp/claude-1000).
- 2026-11-07 06:37: Conferência da E1.1: cumpriu.
- 2026-11-07 06:37: entrega conferida d3832481f3c2fcf90bb8a4c3de78924fa72a94b6
- 2026-11-07 06:38: Brief tech-lead-1 (review) aprovado; sai quando o tech-lead terminar os reviews do 077 (WIP 1 por agente).
- 2026-11-07 06:41: Review da E1.2 delegado ao tech-lead (brief tech-lead-1 aprovado).
- 2026-11-07 06:44: Review da E1.2 (tech-lead-1): aprovado, parecer em dcb48efb (commit: 61cafba2), enviado; A1 dono do diretório /tmp/claude-<uid> não conferido, A2 teste usa a trava real, A3 SC2174 sem anotação (recomendados).
- 2026-11-07 06:47: Conferência do review: cumpriu.
- 2026-11-07 06:47: entrega conferida dcb48efbb4630ff39b80d6a60b75e3feafbea742
- 2026-11-07 06:53: Brief qa-engineer-1 (QA) aprovado e delegado.
- 2026-11-07 06:56: QA da E1.3: aprovado, parecer em e63dcc6d76e7519210cf3aeec0601d261d6f210d (commit: 61cafba2), enviado; teste do script rc 0, vermelho na base (rc 2); A1 teste de link simbólico no caminho padrão e A2 TMPDIR provado só nesta sessão (recomendados).
- 2026-11-07 07:09: Conferência do QA: cumpriu; forge-check pr aprovado no head e63dcc6d.
- 2026-11-07 07:09: entrega conferida e63dcc6d76e7519210cf3aeec0601d261d6f210d
- 2026-11-07 07:11: Brief tech-lead-2 (PR) aprovado; sai em série depois dos PRs do 077 3a e do 075 4a.
- 2026-11-07 08:23: PR do 079 delegado ao tech-lead (brief tech-lead-2): abre e para se BEHIND (a develop andou para bc78a3b8).
- 2026-11-07 08:38: PR 263 aberto pelo tech-lead (tech-lead-2) no head e63dcc6d, forge-check pr aprovado, checks verdes salvo e2e-parte 2/2 em andamento; BEHIND da develop bc78a3b8, parado antes do merge. AÇÃO DO DONO: update-branch do PR 263.
- 2026-11-07 09:40: DECISÃO DO DONO (pelo assistente do app, literal): "FEITO o update-branch dos PRs 258, 263 e 264 [...] Quando cada um ficar CLEAN e verde, siga com o gh pr merge --squash --match-head-commit com o sha NOVO de cada PR (o head mudou). Sempre que um PR ficar BEHIND de novo, avise aqui que eu faco o update-branch". Heads novos: 258 871d2a04112064e9709252478477e222ed69e649, 263 9401dc71408adaac936fedaf6ba3fc3ac2e8d455, 264 26bd59671def6831a30d077c88bfdaaf7d3df8da (checks rodando). DECISÃO TÉCNICA (Jarvis): merges em série, um por vez; cada merge deixa os outros BEHIND e o Jarvis avisa o dono; ordem 258, 264, 263.
- 2026-11-07 11:43: PR 263 ficou BEHIND de novo depois do merge do 264 (head 873dc755); AÇÃO DO DONO: update-branch do PR 263; depois o tech-lead mescla.
- 2026-11-07 12:00: PR 263 mesclado na develop pelo dono às 11:59 (squash b2105e54). Próximo: retrospectiva do 079.
- 2026-11-07 12:07: Brief agile-coach-1 (retrospectiva, E1.5) aprovado e delegado (052e, docs/retros-2026-11-07).
- 2026-11-07 12:08: Retrospectiva (agile-coach-1): commitada em docs/retros-2026-11-07 (052e), 344d2b895b839d95c5fba29958bc7b25de98189c, sem push; 2 linhas MELHORIA (1 projeto, 1 Forge); BEHIND repete a do 081.
