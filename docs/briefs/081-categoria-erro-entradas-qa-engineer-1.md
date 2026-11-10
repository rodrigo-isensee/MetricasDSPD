Agente destino: forge:qa-engineer
Pedido: 081-categoria-erro-entradas
Tipo: codigo
Branch: feature/081-categoria-erro-entradas   Base: develop   Base-sha: 852b9406f019223acd82563cd21fc3a3d42a493a
Etapa: qa   Cobre: E1.4

## Objetivo
QA da E1.1 do pedido 081 (K-241), código em 1f8a19c608f8e363eafd1f629eb50ec5efb2a3af: `categoriaDoErro` e as entradas `ref:sync-calendario`, `ac:ref-sync` e `bm:ref-sync` imprimindo a categoria do erro; segurança (dbdbb4170264ae3c16e23d31f17253b75d18751a) e review (5f906a661e60b145e4aebb755dc4d05e7e658863) aprovados. O PR só sai depois do seu parecer. Worktree `/home/rodrigoisensee/MetricasDSPD-052d`, branch `feature/081-categoria-erro-entradas`.

## Ler
- docs/pedidos/081-categoria-erro-entradas.md: só `## Escopo`, `## Fora do escopo` e, do `## Histórico`, as linhas da entrega, da segurança e do review.
- Na worktree: `docs/security/081-categoria-erro-entradas.md` e `docs/reviews/081-categoria-erro-entradas.md` (achados).

## Entregar
- "E1.4 (qa-engineer): QA." (E1.4)
- (E1) (E1.4) Conferir contra o escopo: cada categoria (configuração com os nomes das variáveis, autenticação, conexão, outro) sai no formato `<entrada> falhou: <categoria>[: <nomes>]` nas três entradas; nenhum valor de variável, URL, senha, host, papel nem texto do erro do banco aparece; `ErroCalendario` e `ErroDominio` mantêm a mensagem própria; código de saída 1 na falha e 2 no uso errado; `web/`, `packages/`, `server/migrations` e `.github` sem diferença contra a base. Rodar, com no máximo 2 workers, `server/tests/categoria-erro.test.ts`, `server/tests/ref-sync-calendario-entrada.test.ts` e `server/tests/ref-sync-businessmap-entrada.test.ts` (os testes de entrada abrem subprocesso; se o sandbox barrar o tsx em `/tmp`, use a CI do push, `gh run view 42367687534 --repo rodrigo-isensee/MetricasDSPD --json headSha,conclusion`); fazer o vermelho dos testes novos contra a base (cópia em `/tmp/claude-1000/qa-engineer-081/`), sem mexer na worktree; mutação à mão se o vermelho só provar a ausência do código.
- (E1) (E1.4) Escrever o parecer `docs/qa/081-categoria-erro-entradas.md` pela ferramenta Write (sem editar depois, nem com sed), com `pedido: 081-categoria-erro-entradas`, `branch: feature/081-categoria-erro-entradas`, `commit: 1f8a19c608f8e363eafd1f629eb50ec5efb2a3af`, veredito e o bloco `## Achados` só com linhas de achado (achado com até 300 caracteres; regra citada só pelo ID); commit só do parecer com `Cartão: K-241` (mensagem gravada por Write em `/tmp/claude-1000/-home-rodrigoisensee-Metricas-MetricasDSPD/73d03d2b-ba9f-4d84-b635-cabe917583a2/scratchpad/msg-qa-081.txt` e `git commit -F` com esse caminho literal, `git add` explícito pelo caminho); antes do commit, `git -C /home/rodrigoisensee/MetricasDSPD-052d pull --ff-only origin feature/081-categoria-erro-entradas`; conferir `git -C /home/rodrigoisensee/MetricasDSPD-052d rev-parse --abbrev-ref HEAD` e enviar com `git -C /home/rodrigoisensee/MetricasDSPD-052d push origin HEAD:refs/heads/feature/081-categoria-erro-entradas`, em primeiro plano, com o comando puro; se o rc não for 0, conferir `git ls-remote` antes de repetir; push ou pre-push com mais de 15 minutos está preso: pare e relate (o Jarvis avisa o dono e refaz; DECISÃO TÉCNICA de 2026-11-07 08:05 deste pedido); sem PR.

## Decisões e restrições
- O pedido não tem linha `DECISÃO DO DONO`; foi aberto pela autonomia de melhoria técnica do projeto (Histórico, 08:04).
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. O hook do Forge recusa variáveis de shell (`$X`, `$?`), crases e `$(...)` em comandos com commit, push ou gh: use caminhos e ids literais. GitHub: `github.com` e `api.github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: código, testes, os pareceres de segurança e de review, o pedido, `KANBAN.md`, outras worktrees, a branch `feature/073-e10-l2-recusa`, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (node-backend): implementação com testes, numa função única de classificação usada pelas entradas de referência." · etapa de outra delegação; feita
- "E1.2 (tech-lead): review." · etapa de outra delegação; feita
- "E1.3 (security-engineer): parecer de segurança (mensagem de erro e log de entrada que lida com segredo)." · etapa de outra delegação; feita
- "E1.5 (tech-lead): PR para a develop, depois do QA." · etapa de outra delegação; continua no pedido
- "E1.6 (agile-coach): retrospectiva do pedido 081." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD-052d/docs/qa/081-categoria-erro-entradas.md`
- PQ-2 (cmd): `grep -c '^commit: 1f8a19c608f8e363eafd1f629eb50ec5efb2a3af' /home/rodrigoisensee/MetricasDSPD-052d/docs/qa/081-categoria-erro-entradas.md` · espera: igual '1'
- PQ-3 (push): `git ls-remote origin refs/heads/feature/081-categoria-erro-entradas` igual ao head local (`git -C /home/rodrigoisensee/MetricasDSPD-052d rev-parse HEAD`)

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
