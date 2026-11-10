Agente destino: forge:devops-engineer
Pedido: 083-pre-push-lint-alterados
Tipo: codigo
Branch: feature/083-pre-push-lint   Base: develop   Base-sha: 54f02c42b51aba3355e9f0428f058113f916c4c9
Etapa: codigo   Cobre: E1.1

## Objetivo
Pedido 083 (K-249): o `.githooks/pre-push` passa a rodar o eslint só nos `.ts`/`.tsx` alterados contra a base, com cache, e pula o lint em push sem esses arquivos; a CI segue com `eslint .` inteiro. O diagnóstico (pedido 077, E2.7) mostrou que o `eslint .` inteiro passa de 20 minutos com a máquina sob pressão de memória, e isso trava todos os pushes do time. Worktree `/home/rodrigoisensee/MetricasDSPD-052e` (na branch `integracao/2026-11-07`, descartada; status vazio), branch nova `feature/083-pre-push-lint` a partir da develop 54f02c42b51aba3355e9f0428f058113f916c4c9.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052e/.githooks/pre-push`, o `package.json` da raiz (scripts `lint` e `typecheck`) e o `eslint.config.js`.
- Do pedido 077 (`/home/rodrigoisensee/Metricas/MetricasDSPD/docs/pedidos/077-tendencias-dado-real.md`), só a linha do `## Histórico` do diagnóstico E2.7 (2026-11-08).

## Entregar
- "E1.1 (devops-engineer): implementação em `.githooks/pre-push` (e `package.json`, se precisar de script novo), com teste do hook se o projeto já testa scripts, e parecer de devops em docs/devops/." (E1.1)
- (E1) (E1.1) Preparar: `git -C /home/rodrigoisensee/MetricasDSPD-052e switch --no-track -c feature/083-pre-push-lint 54f02c42b51aba3355e9f0428f058113f916c4c9` (sem apagar a branch de integração). Implementar no `.githooks/pre-push`: listar os `.ts`/`.tsx` alterados contra `origin/develop` (`git diff --name-only --diff-filter=d origin/develop...HEAD`, com fallback documentado se `origin/develop` não existir); sem nenhum, pular o lint com uma linha dizendo isso; com algum, rodar `eslint --cache --cache-location node_modules/.cache/eslint` só neles, respeitando o `ignores` do `eslint.config.js` (passar `--no-warn-ignored` se for preciso); manter o typecheck como está; não mexer na CI. Se o projeto já tem teste de scripts em `scripts/` ou `.githooks/`, acrescentar caso para push com e sem `.ts` alterado. Parecer de devops em `docs/devops/083-pre-push-lint-alterados.md` gravado inteiro pela ferramenta Write.
- (E1) (E1.1) Commits com `Cartão: K-249`, `git add` explícito por caminho, mensagem por `git commit -F` com arquivo gravado por Write em `/tmp/claude-1000/-home-rodrigoisensee-Metricas-MetricasDSPD/73d03d2b-ba9f-4d84-b635-cabe917583a2/scratchpad/msg-dv-083.txt`. Push com `git -C /home/rodrigoisensee/MetricasDSPD-052e push origin HEAD:refs/heads/feature/083-pre-push-lint` na ferramenta Bash com `run_in_background: true` (o hook usado é o da própria branch, já com a mudança), conferindo `git ls-remote` e `date +%H:%M` por chamadas curtas; passou de 15 minutos, encerre a tarefa de fundo, deixe o commit local e relate o sha; esperar a CI do push por chamadas curtas e relatar; sem PR.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- - 2026-11-08 20:01: DECISÃO DO DONO (literal): "A" (aplicar a correção 1 do diagnóstico E2.7 do 077: pre-push com lint só nos .ts/.tsx alterados e cache, pulando push só de docs; a CI segue com eslint inteiro). Pedido aberto (Jarvis). Recibo: vou fazer: o devops-engineer muda o pre-push numa branch, com parecer de devops, review, QA e PR para a develop; não vou: mudar CI, typecheck, ambiente nem o guarda; o merge é do dono. DECISÃO TÉCNICA (Jarvis): branch melhoria/083-pre-push-lint na worktree 052e (livre: a integração foi descartada), a partir da develop 54f02c42; depois do merge, cada branch em curso recebe a develop e passa a usar o hook novo.
- 2026-11-08 20:02: DECISÃO DO DONO (2026-11-08 20:02): recibo confirmado: "A" (a opção A levada ao dono descrevia o que se faz: lint só nos arquivos alterados, com cache, CI com o lint inteiro, mudança numa branch com review e PR, merge do dono).
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Comandos com mais de 2 minutos em segundo plano.
- NÃO tocar: a CI (`.github/`), o código (`server/`, `web/`, `packages/`), o guarda de lint do dono, outras worktrees, a branch `integracao/2026-11-07` (não apagar), a branch `docs/retros-2026-11-07` (commits locais sem push), a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.2 (tech-lead): review." · etapa de outra delegação; continua no pedido
- "E1.3 (qa-engineer): QA (push com e sem `.ts` alterado; push só de docs; CI ainda com eslint inteiro)." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): PR para a develop, depois do QA; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.5 (agile-coach): retrospectiva curta." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `gh run list --repo rodrigo-isensee/MetricasDSPD --branch feature/083-pre-push-lint --event push --limit 1 --json conclusion` · espera: contém '"success"'
- PQ-2 (push): `git ls-remote origin refs/heads/feature/083-pre-push-lint` igual ao head local (`git -C /home/rodrigoisensee/MetricasDSPD-052e rev-parse HEAD`)
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052e diff --name-only 54f02c42b51aba3355e9f0428f058113f916c4c9 -- .github server web packages` · espera: linhas=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
