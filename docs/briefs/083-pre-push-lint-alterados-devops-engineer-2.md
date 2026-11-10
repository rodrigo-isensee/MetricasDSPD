Agente destino: forge:devops-engineer
Pedido: 083-pre-push-lint-alterados
Tipo: codigo
Branch: feature/083-pre-push-lint   Base: develop   Base-sha: 54f02c42b51aba3355e9f0428f058113f916c4c9
Etapa: codigo   Cobre: E1.1

## Objetivo
Volta do pedido 083 (K-249): terminar o que não toca `.githooks/` (que só o dono altera, R-CONFORMIDADE): corrigir o caso de teste que falha em `scripts/lint-alterados.test.sh`, registrar o teste no `package.json`, escrever o parecer de devops com o diff do hook como pendência do dono e fazer o commit local, sem push. Worktree `/home/rodrigoisensee/MetricasDSPD-052e`, branch `feature/083-pre-push-lint` (arquivos novos sem commit: `scripts/lint-alterados.sh` e `scripts/lint-alterados.test.sh`).

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052e/.githooks/pre-push`, o `package.json` da raiz (scripts `lint` e `typecheck`) e o `eslint.config.js`.
- Do pedido 077 (`/home/rodrigoisensee/Metricas/MetricasDSPD/docs/pedidos/077-tendencias-dado-real.md`), só a linha do `## Histórico` do diagnóstico E2.7 (2026-11-08).

## Entregar
- "E1.1 (devops-engineer): implementação em `.githooks/pre-push` (e `package.json`, se precisar de script novo), com teste do hook se o projeto já testa scripts, e parecer de devops em docs/devops/." (E1.1) Nesta delegação, só a parte em `scripts/`, `package.json` e o parecer; a troca em `.githooks/pre-push` é do dono (R-CONFORMIDADE, Histórico).
- (E1) (E1.1) Nesta volta: achar e corrigir a causa do caso "`.ts`/`.tsx` alterados vão ao eslint com cache" (caminho com espaço: no script ou na asserção) e deixar os 6 casos verdes com `bash scripts/lint-alterados.test.sh`; acrescentar o teste ao script `test:trava` do `package.json` (`bash scripts/suite-unica.test.sh && bash scripts/lint-alterados.test.sh`); parecer de devops em `docs/devops/083-pre-push-lint-alterados.md` gravado inteiro pela ferramenta Write, dizendo que a troca em `.githooks/pre-push` (`pnpm run lint` por `bash scripts/lint-alterados.sh`) é do dono e ainda não foi aplicada; commit local de `scripts/lint-alterados.sh`, `scripts/lint-alterados.test.sh`, `package.json` e o parecer, com `Cartão: K-249` (mensagem por `git commit -F` com arquivo gravado por Write em `/tmp/claude-1000/-home-rodrigoisensee-Metricas-MetricasDSPD/73d03d2b-ba9f-4d84-b635-cabe917583a2/scratchpad/msg-dv-083b.txt`, `git add` explícito por caminho). Não editar nada em `.githooks/`. Sem push (sai depois da troca do hook pelo dono).

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- - 2026-11-08 20:01: DECISÃO DO DONO (literal): "A" (aplicar a correção 1 do diagnóstico E2.7 do 077: pre-push com lint só nos .ts/.tsx alterados e cache, pulando push só de docs; a CI segue com eslint inteiro). Pedido aberto (Jarvis). Recibo: vou fazer: o devops-engineer muda o pre-push numa branch, com parecer de devops, review, QA e PR para a develop; não vou: mudar CI, typecheck, ambiente nem o guarda; o merge é do dono. DECISÃO TÉCNICA (Jarvis): branch melhoria/083-pre-push-lint na worktree 052e (livre: a integração foi descartada), a partir da develop 54f02c42; depois do merge, cada branch em curso recebe a develop e passa a usar o hook novo.
- 2026-11-08 20:02: DECISÃO DO DONO (2026-11-08 20:02): recibo confirmado: "A" (a opção A levada ao dono descrevia o que se faz: lint só nos arquivos alterados, com cache, CI com o lint inteiro, mudança numa branch com review e PR, merge do dono).
- 2026-11-08 20:12: DECISÃO TÉCNICA (Jarvis): enquanto o dono não aplica a troca no .githooks/pre-push, o devops-engineer termina o que não toca .githooks/ (devops-engineer-2): corrige o caso de teste com espaço no caminho, registra o teste em package.json (test:trava), escreve o parecer de devops (com o diff do hook como pendência do dono) e faz o commit local, sem push (o push sai depois da troca do hook, já com o hook novo).
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Comandos com mais de 2 minutos em segundo plano.
- NÃO tocar: `.githooks/` (do dono), a CI (`.github/`), o código (`server/`, `web/`, `packages/`), o guarda de lint do dono, outras worktrees, a branch `integracao/2026-11-07` (não apagar), a branch `docs/retros-2026-11-07` (commits locais sem push), a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.2 (tech-lead): review." · etapa de outra delegação; continua no pedido
- "E1.3 (qa-engineer): QA (push com e sem `.ts` alterado; push só de docs; CI ainda com eslint inteiro)." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): PR para a develop, depois do QA; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.5 (agile-coach): retrospectiva curta." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `bash /home/rodrigoisensee/MetricasDSPD-052e/scripts/lint-alterados.test.sh` · espera: rc=0
- PQ-2 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-052e log -1 --format=%H -- scripts/lint-alterados.sh` · espera: linhas=1

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
