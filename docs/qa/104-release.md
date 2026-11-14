---
tipo: qa
contrato: 1
pedido: 104-release-2026-11-14
branch: docs/104-release
commit: d4522fe31012a8522ade2506cf3d431b106f83a7
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-14
---
# QA: release 104 (develop contra main)

Head testado: `origin/develop` = `61286dac966797ba93e6cb8b80a89e81ad3cbeaa` (worktree MetricasDSPD-052d, HEAD destacado; `git rev-parse HEAD origin/develop` iguais). O `Revisar-sha` do brief (71f9ff8e) é a ponta da branch docs/104-release; o código testado é o da develop, que é o que segue para homolog e main. O 412 e o lote K-236/K-243 não entram.

## Achados

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| E1.3 suíte da release na ponta da develop | `pnpm run pronto`, rc=0 | suíte única, todos os pacotes | passou |
| Migração 0037 (`exibir_pa`/`exibir_r`) | leitura do diff e job `banco` do CI da develop no head 61286dac (success) | colunas nulas sem DEFAULT; CHECK de par e de "dia corrido"; `down` reverte | passou |
| Contratos O17 e K-287 (equipe só slug, `setores`, `TIPO_POR_ID`) | `packages/contratos` 220 testes; job `openapi` do CI | slug fora do padrão rejeitado; ids antigos removidos | passou |
| Filtros K-295 | `packages/contratos` e web 1663 testes | lista vazia = Todos; `?responsavel=` devolve 400 | passou |
| Recolher L8a/L8b | web 1663 testes (`recolher.test.tsx` e painel) | resumo neutro, sem nome de projeto | passou |
| Regras invioláveis (sem métrica individual, BM e AC separados, abaixo de 20 não publica) | busca no diff por ranking, responsável e usuarioKey; leitura de `filtros.ts` | sem filtro por pessoa; tipos distintos de fluxo e sustentação | passou |

## Cenários e resultado real
- `pnpm run pronto` na raiz, sob a trava `suite-unica`, rc=0. Blocos: spec-check 14, homolog 78, contratos 220, pesquisa 33, metricas 1321, mock 259, server 2189 (300 skipped, testes que exigem banco: prova no job `banco` do CI), web 1663, docs-contratos 102.
- Banco local não usado (proibido). CI da develop no head testado (run 43587005536, success): build, testes, rapida, filtro, openapi, seguranca, imagem e banco success; e2e, e2e-parte e perf `skipped` nesse run. A prova de e2e vem dos runs dos PRs que entraram, não deste head.
- A primeira execução do pronto foi cortada pelo `timeout 580` que apliquei (erro meu, não da suíte); a segunda, sem timeout, é a que vale.
- `pnpm install --frozen-lockfile` abortou por falta de TTY (node_modules já existia); a suíte rodou com as dependências instaladas.
- Migração 0037 aditiva, sem DEFAULT, linhas antigas ficam nulas (sem inferir unidade), `down` completo.
- Achados novos: nenhum. Mutação não se aplica (o diff não toca `bin/`, `hooks/` nem `.githooks/`).

## Delta (ponta nova da develop)

Head testado: `origin/develop` = `64826e906e23ae10cd034f9b83ce1d5e877aaba9` (worktree MetricasDSPD-052d, HEAD destacado; `git rev-parse HEAD origin/develop` iguais). Entraram depois do parecer anterior (61286dac): PR 411 (`mariadb` 3.5.5, `@tanstack/react-query` 5.107.1) e PR 412 (K-326, só teste do server). O `commit:` do frontmatter passa a ser o `Revisar-sha` d4522fe3 do brief.

| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| E1.3 suíte no head novo | `CI=true pnpm install --frozen-lockfile` e `pnpm run pronto` da raiz, rc=0 | suíte única, todos os pacotes | passou |
| Driver `mariadb` 3.5.5 (coletor do Acelerato) | leitura de `server/src/modulos/acelerato/cliente-mysql.ts`; versão exata em `server/package.json`; CI do PR 411 (`banco`, `testes`, `rapida` success) | só leitura em três camadas (sessão `READ ONLY`, `ROLLBACK`, `multipleStatements:false`, `permitLocalInfile:false`); erro do driver vira código fechado; único arquivo que importa o driver | passou |
| `@tanstack/react-query` 5.107.1 (web) | leitura de `web/src/data/useMetrica.ts` (consulta, `placeholderData: keepPreviousData`, `recarregar`, estado de erro) e web 1663 testes | erro, vazio, recarregar por métrica | passou |
| e2e do PR 411 | `gh pr checks 411`: `e2e-parte (1/2)` e `(2/2)` success; `build`, `openapi`, `seguranca`, `imagem` success | fluxo ponta a ponta | passou |
| CI da develop no head 64826e90 | `gh run list --branch develop`: run 43589920043 (CI), success | head que vai a homolog | passou |

Resultado real do `pnpm run pronto` (rc=0): spec-check 14, homolog 78, contratos 220, pesquisa 33, metricas 1321, mock 259, server 2193 passados (300 skipped, testes que exigem banco: prova no job `banco` do CI), web 1663, docs-contratos 102. O server subiu de 2189 para 2193 testes (K-326, PR 412) e a cobertura do server segue em 100%.

Notas: a primeira tentativa de `pnpm install` falhou por rede e por store somente leitura do sandbox (ambiente, não o código); repetida fora do sandbox, concluiu. Banco local não usado. Achados novos: nenhum; bugs 0. Mutação não se aplica (o diff não toca `bin/`, `hooks/` nem `.githooks/`). Parecer segue `aprovado`.
