Agente destino: forge:security-engineer
Pedido: 081-categoria-erro-entradas
Tipo: codigo
Branch: feature/081-categoria-erro-entradas   Base: develop   Base-sha: 852b9406f019223acd82563cd21fc3a3d42a493a
Etapa: seguranca   Cobre: E1.3

## Objetivo
Parecer de segurança da E1.1 do pedido 081 (K-241): as entradas de referência (`ref:sync-calendario`, `ac:ref-sync`, `bm:ref-sync`) passam a imprimir a categoria do erro (configuração com o nome das variáveis, autenticação, conexão, outro) por `categoriaDoErro` em `server/src/plataforma/categoria-erro.ts`, na ponta 1f8a19c608f8e363eafd1f629eb50ec5efb2a3af, com a CI do push verde e a entrega conferida. Worktree `/home/rodrigoisensee/MetricasDSPD-052d`, branch `feature/081-categoria-erro-entradas`; o review do tech-lead vem depois, na mesma worktree: faça o pull --ff-only antes do commit.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052d diff 852b9406f019223acd82563cd21fc3a3d42a493a...1f8a19c608f8e363eafd1f629eb50ec5efb2a3af`.
- docs/pedidos/081-categoria-erro-entradas.md: só `## Escopo`, `## Suposições` e, do `## Histórico`, as linhas da entrega e da conferência da E1.1.

## Entregar
- "E1.3 (security-engineer): parecer de segurança (mensagem de erro e log de entrada que lida com segredo)." (E1.3)
- (E1) (E1.3) Foco: a saída nunca leva valor de variável, URL, senha, host, papel nem texto do erro do banco (o teste novo prova isso; confira os caminhos que o teste não cobre, como `AggregateError` e erros sem `code`); o nome da variável na saída não é segredo; `ErroConfiguracao` carrega só nomes; `config.ts` não passou a expor valor em nenhum caminho; o código de saída segue 1; a entrada do apontamento ficou fora (exclusão do pedido). Parecer em `docs/security/081-categoria-erro-entradas.md` gravado inteiro pela ferramenta Write (sem editar depois), com `pedido: 081-categoria-erro-entradas`, `branch: feature/081-categoria-erro-entradas`, `commit: 1f8a19c608f8e363eafd1f629eb50ec5efb2a3af`, veredito e bloco `## Achados` só com linhas de achado (cite regra só pelo ID; achado com até 300 caracteres, contando o prefixo); commit só do parecer com `Cartão: K-241` (mensagem gravada por Write em `/tmp/claude-1000/-home-rodrigoisensee-Metricas-MetricasDSPD/73d03d2b-ba9f-4d84-b635-cabe917583a2/scratchpad/msg-sec-081.txt` e `git commit -F` com esse caminho literal, `git add` explícito pelo caminho); antes do commit, `git -C /home/rodrigoisensee/MetricasDSPD-052d pull --ff-only origin feature/081-categoria-erro-entradas`; conferir `git -C /home/rodrigoisensee/MetricasDSPD-052d rev-parse --abbrev-ref HEAD` e enviar com `git -C /home/rodrigoisensee/MetricasDSPD-052d push origin HEAD:refs/heads/feature/081-categoria-erro-entradas`, em primeiro plano, com o comando puro; se o rc não for 0, conferir `git ls-remote` antes de repetir; push ou pre-push com mais de 15 minutos está preso: pare e relate (o Jarvis avisa o dono e refaz; DECISÃO TÉCNICA de 2026-11-07 08:05 deste pedido); sem PR.

## Decisões e restrições
- O pedido não tem linha `DECISÃO DO DONO`; foi aberto pela autonomia de melhoria técnica do projeto (Histórico, 08:04).
- CLAUDE.md: credenciais só em `.env`, nunca no código; o agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real.
- O hook do Forge recusa variáveis de shell (`$X`, `$?`), crases e `$(...)` em comandos com commit, push ou gh: use caminhos literais. GitHub: `github.com` e `api.github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: código, testes, o pedido, `KANBAN.md`, outras worktrees, a branch `feature/073-e10-l2-recusa`, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (node-backend): implementação com testes, numa função única de classificação usada pelas entradas de referência." · etapa de outra delegação; feita
- "E1.2 (tech-lead): review." · etapa de outra delegação; continua no pedido
- "E1.4 (qa-engineer): QA." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): PR para a develop, depois do QA." · etapa de outra delegação; continua no pedido
- "E1.6 (agile-coach): retrospectiva do pedido 081." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052d show origin/feature/081-categoria-erro-entradas:docs/security/081-categoria-erro-entradas.md` · espera: contém 'commit: 1f8a19c608f8e363eafd1f629eb50ec5efb2a3af'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
