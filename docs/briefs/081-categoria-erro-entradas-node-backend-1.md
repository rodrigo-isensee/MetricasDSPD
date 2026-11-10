Agente destino: forge:node-backend
Pedido: 081-categoria-erro-entradas
Tipo: codigo
Branch: feature/081-categoria-erro-entradas   Base: develop   Base-sha: 852b9406f019223acd82563cd21fc3a3d42a493a
Etapa: codigo   Cobre: E1.1

## Objetivo
Pedido 081 (K-241): as entradas de comando de referência (`ref:sync-calendario` e as demais em `server/src/entradas/` que hoje imprimem só "configuração ou banco inválidos") passam a dizer a categoria do erro, sem expor valor, URL, senha nem texto do erro do banco. Worktree `/home/rodrigoisensee/MetricasDSPD-052d` (o PR 258 do 073 segue aberto pelo gh; a branch dele fica no remoto, não apague), branch nova `feature/081-categoria-erro-entradas` a partir da develop.

## Ler
- docs/pedidos/081-categoria-erro-entradas.md: só `## Escopo`, `## Fora do escopo` e `## Suposições`.
- Na worktree, depois de preparar: `server/src/entradas/ref-sync-calendario.ts`, as outras entradas que imprimem "configuração ou banco inválidos" (`git grep -n 'configuração ou banco inválidos' -- server/src`) e `server/src/plataforma/config.ts` (como a configuração é validada).

## Entregar
- "E1.1 (node-backend): implementação com testes, numa função única de classificação usada pelas entradas de referência." (E1.1)
- (E1) (E1.1) Preparar a worktree: conferir `git -C /home/rodrigoisensee/MetricasDSPD-052d status --short` vazio, `git -C /home/rodrigoisensee/MetricasDSPD-052d fetch origin develop`, depois `git -C /home/rodrigoisensee/MetricasDSPD-052d switch -c feature/081-categoria-erro-entradas 852b9406f019223acd82563cd21fc3a3d42a493a` e `pnpm install --frozen-lockfile` nela (não apagar a branch antiga).
- (E1) (E1.1) Uma função única em `server/src/plataforma/` que recebe o erro e devolve só a categoria: `configuração` com o nome das variáveis ausentes ou inválidas (só os nomes que a validação reporta, nunca o valor), `autenticação` (código de classe 28 do PostgreSQL), `conexão` (recusa, tempo esgotado, host não encontrado), `outro`; as entradas de referência passam a imprimir `<entrada> falhou: <categoria>[: <nomes>]`; o `ErroCalendario` e as mensagens próprias continuam como estão; código de saída 1 inalterado. Testes de unidade por categoria, incluindo um que prova que valor, URL, senha e texto do erro do banco nunca aparecem na saída.
- (E1) (E1.1) eslint, tsc e os testes dos arquivos tocados com no máximo 2 workers verdes, com a cobertura dos arquivos tocados (a CI exige 100%; todo ramo com teste de dublê, porque a cobertura da CI roda com os `.pg` pulados); teto de 150 linhas de código e teste contado pela saída literal de `git diff --numstat --no-renames 852b9406f019223acd82563cd21fc3a3d42a493a...HEAD`; commits com `Cartão: K-241` (mensagem gravada por Write em `/tmp/claude-1000/-home-rodrigoisensee-Metricas-MetricasDSPD/73d03d2b-ba9f-4d84-b635-cabe917583a2/scratchpad/msg-nb-081.txt` e `git commit -F` com esse caminho literal), `git add` explícito por caminho; conferir `git -C /home/rodrigoisensee/MetricasDSPD-052d rev-parse --abbrev-ref HEAD` = feature/081-categoria-erro-entradas e enviar em primeiro plano com `git -C /home/rodrigoisensee/MetricasDSPD-052d push origin HEAD:refs/heads/feature/081-categoria-erro-entradas`, com o comando puro; se o rc não for 0, conferir `git ls-remote` antes de repetir; push ou pre-push com mais de 15 minutos está preso: pare e relate (o Jarvis avisa o dono e refaz; DECISÃO TÉCNICA de 2026-11-07 01:20 do 075); esperar a CI do push com `gh run watch <id literal> --exit-status` e relatar; sem PR.

## Decisões e restrições
- O pedido não tem linha `DECISÃO DO DONO`; foi aberto pela autonomia de melhoria técnica do projeto (Histórico, 08:04).
- CLAUDE.md: credenciais só em `.env`, nunca no código; a saída nunca leva valor de variável, URL, senha nem texto do erro do banco.
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. O hook do Forge recusa variáveis de shell (`$X`, `$?`), crases e `$(...)` em comandos com commit, push ou gh: use caminhos e ids literais. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. GitHub: `github.com` e `api.github.com` em `allowed_domains`; npm: `registry.npmjs.org`. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: as entradas do coletor e do apontamento, os códigos de saída, `server/migrations`, a web, `packages/`, a CI, o pedido, `KANBAN.md`, outras worktrees, a branch `feature/073-e10-l2-recusa` (não apagar), a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.2 (tech-lead): review." · etapa de outra delegação; continua no pedido
- "E1.3 (security-engineer): parecer de segurança (mensagem de erro e log de entrada que lida com segredo)." · etapa de outra delegação; continua no pedido
- "E1.4 (qa-engineer): QA." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): PR para a develop, depois do QA." · etapa de outra delegação; continua no pedido
- "E1.6 (agile-coach): retrospectiva do pedido 081." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `gh run list --repo rodrigo-isensee/MetricasDSPD --branch feature/081-categoria-erro-entradas --event push --limit 1 --json conclusion` · espera: contém '"success"'
- PQ-2 (push): `git ls-remote origin refs/heads/feature/081-categoria-erro-entradas` igual ao head local (`git -C /home/rodrigoisensee/MetricasDSPD-052d rev-parse HEAD`)
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052d diff --name-only 852b9406f019223acd82563cd21fc3a3d42a493a -- web packages server/migrations .github` · espera: linhas=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
