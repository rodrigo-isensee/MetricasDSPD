Agente destino: forge:qa-engineer
Pedido: 079-trava-suite-tmpdir
Tipo: codigo
Branch: feature/079-trava-suite-tmpdir   Base: develop   Base-sha: 718d46beb4be314dd6d1f1c55454e64e62e4fe7d
Etapa: qa   Cobre: E1.3

## Objetivo
QA da E1.1 do pedido 079 (K-201): a trava de `scripts/suite-unica.sh` sai do `/tmp` fixo para `/tmp/claude-<uid>/metricas-dspd-suite.lock`, código em 61cafba2e287808c570be923193739ba5d3088ad, review aprovado (dcb48efbb4630ff39b80d6a60b75e3feafbea742, entrega conferida). O PR só sai depois do seu parecer. Worktree `/home/rodrigoisensee/MetricasDSPD-052g`, branch `feature/079-trava-suite-tmpdir`.

## Ler
- docs/pedidos/079-trava-suite-tmpdir.md: só `## Escopo`, `## Suposições` e, do `## Histórico`, as linhas da entrega e do review da E1.
- Na worktree: `docs/devops/079-trava-suite-tmpdir.md` e `docs/reviews/079-trava-suite-tmpdir.md` (achados); `scripts/suite-unica.sh` e `scripts/suite-unica.test.sh` pela ferramenta Read.

## Entregar
- "E1.3 (qa-engineer): QA." (E1.3)
- (E1) (E1.3) Conferir a E1 contra o escopo: duas suítes em worktrees diferentes esperam uma pela outra na trava nova (a segunda espera a primeira); `METRICAS_DSPD_SUITE_LOCK` ainda troca o arquivo; link simbólico no arquivo e no diretório é recusado; sem a variável, a trava cai em `/tmp/claude-<uid>`, que o sandbox grava; nada muda fora de `scripts/` e `docs/`. Rodar `bash scripts/suite-unica.test.sh` (sem pipe nem variável; leia o script pela ferramenta Read, porque o hook recusa comandos que citem a palavra da trava) e fazer o vermelho do caso novo contra a base (cópia em `/tmp/claude-1000/qa-engineer-079/`), sem mexer na worktree.
- (E1) (E1.3) Escrever o parecer `docs/qa/079-trava-suite-tmpdir.md` pela ferramenta Write (sem editar depois, nem com sed), com `pedido: 079-trava-suite-tmpdir`, `branch: feature/079-trava-suite-tmpdir`, `commit: 61cafba2e287808c570be923193739ba5d3088ad`, veredito e o bloco `## Achados` só com linhas de achado (achado com até 300 caracteres; regra citada só pelo ID); commit só do parecer com `Cartão: K-201` (mensagem gravada por Write em `/tmp/claude-1000/-home-rodrigoisensee-Metricas-MetricasDSPD/73d03d2b-ba9f-4d84-b635-cabe917583a2/scratchpad/msg-qa-079.txt` e `git commit -F` com esse caminho literal, `git add` explícito pelo caminho); antes do commit, `git -C /home/rodrigoisensee/MetricasDSPD-052g pull --ff-only origin feature/079-trava-suite-tmpdir`; conferir `git -C /home/rodrigoisensee/MetricasDSPD-052g rev-parse --abbrev-ref HEAD` e enviar com `git -C /home/rodrigoisensee/MetricasDSPD-052g push origin HEAD:refs/heads/feature/079-trava-suite-tmpdir`, em primeiro plano, com o comando puro; se o rc não for 0, conferir `git ls-remote` antes de repetir; push ou pre-push com mais de 15 minutos está preso: pare e relate (o Jarvis avisa o dono e refaz; DECISÃO TÉCNICA de 2026-11-07 01:20 do 075); sem PR.

## Decisões e restrições
- O pedido não tem linha `DECISÃO DO DONO`; foi aberto pela autonomia de melhoria técnica do projeto (Histórico, 06:28).
- Recursos: regra da noite do dono (075, 2026-11-07 00:07): até 3 agentes e 1 git push por vez; antes do push, confira com `ps -eo pid,etime,args` se há outro `git push` rodando e, se houver, espere.
- O hook do Forge recusa variáveis de shell (`$X`), crases e `$(...)` em comandos com commit, push ou gh, e comandos que citem `flock` ou `$?`. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. GitHub: `github.com` e `api.github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: o script, o teste, os pareceres de devops e de review, o pedido, `KANBAN.md`, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (devops-engineer): implementação em `scripts/suite-unica.sh` e no teste do script, com parecer de devops em docs/devops/." · etapa de outra delegação; feita
- "E1.2 (tech-lead): review." · etapa de outra delegação; feita
- "E1.4 (tech-lead): PR para a develop, depois do QA." · etapa de outra delegação; continua no pedido
- "E1.5 (agile-coach): retrospectiva do pedido 079." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD-052g/docs/qa/079-trava-suite-tmpdir.md`
- PQ-2 (cmd): `grep -c '^commit: 61cafba2e287808c570be923193739ba5d3088ad' /home/rodrigoisensee/MetricasDSPD-052g/docs/qa/079-trava-suite-tmpdir.md` · espera: igual '1'
- PQ-3 (push): `git ls-remote origin refs/heads/feature/079-trava-suite-tmpdir` igual ao head local (`git -C /home/rodrigoisensee/MetricasDSPD-052g rev-parse HEAD`)

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
