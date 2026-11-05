# 073 E5.1: o format:check da raiz e o server/

Análise só de leitura (tech-lead, 2026-11-05). Base: `origin/develop` em `8a789d43`; prettier rodado só com `--check`, numa cópia destacada (worktree 056d), nada escrito.

## 1. A exclusão do server/ foi de propósito?

Não há evidência de decisão. O que o histórico mostra é omissão:

- `dbbcfb47` (K-016, monorepo, quando o `format:check` nasceu) listou `web packages eslint.config.js tsconfig.base.json package.json`. O `server/` ainda não existia no monorepo.
- `6f1ca0f4` (10/10, "inclui o server nos workspaces e no pronto da raiz") adicionou o server ao `typecheck`, aos workspaces e ao `eslint.config.js`, mas deixou `format` e `format:check` como estavam. É o único ponto em que a inclusão era natural.
- `tools` entrou depois nas duas linhas; `server` e `e2e` ficaram fora.
- Nenhuma ADR (0001, 0002, 0013, 0014, 0015) nem `docs/engineering/praticas.md` diz que o server fica fora do Prettier. A ADR 0001 e o `praticas.md:39` listam "Prettier [CI]" como regra do projeto inteiro, sem escopo por pasta.
- Não existe `server/.prettierrc` nem script de formatação em `server/package.json`; vale o `.prettierrc` da raiz (`semi: false`, `singleQuote`, `trailingComma: all`, `printWidth: 100`). O `.prettierignore` só tem `dist`, `dist-alt`, `coverage`, `node_modules`, `pnpm-lock.yaml`.
- O CI (`ci.yml:35`, `homolog.yml:76`) e o `pronto:interno` chamam `format:check`, então o server passa sem nenhuma checagem de estilo.

Conclusão: a prática diz Prettier para tudo e o script não cobre o server. É lacuna, não decisão.

## 2. O que o `pnpm exec prettier --check server` acusa hoje

Rodado em `/home/rodrigoisensee/MetricasDSPD-056d` com `git switch --detach origin/develop` (HEAD `8a789d43`, árvore limpa):

- `[warn] Code style issues found in 309 files.` Código de saída 1.
- O server tem 312 arquivos que o Prettier reconhece (ts, js, json, md, yml, sql). Só 3 estão conformes. 306 dos 309 são `.ts`, mais `vitest.config.ts`, 2 `.json` (`tsconfig.json` entre eles) e 1 `.js`.
- Distribuição: `src/modulos` 76, `src/plataforma` 33, `src/entradas` 20, `tests/pg` 7, o resto em `tests/` e na raiz do pacote.
- A causa dominante é de estilo de base, não de detalhe: o server foi escrito com ponto e vírgula e importações em linha única, enquanto o `.prettierrc` manda `semi: false` e `printWidth: 100`. Exemplo em `server/src/app.ts`: `import fastifySwagger from '@fastify/swagger';` vira sem `;`, e a lista de importações longa é quebrada em várias linhas. Ou seja, quase todo arquivo muda.
- Para comparação, `e2e` também fica fora do `format:check`: 46 arquivos acusados no mesmo teste. Fica registrado como lacuna irmã, sem ação aqui.

## 3. Custo de cobrir

- Reformatar o server inteiro toca cerca de 309 arquivos, quase todos linha a linha (`;`, quebras). Isso é um commit mecânico grande, no padrão do `dbbcfb47` ("commit mecânico único, sem mudança de lógica").
- Conflito: qualquer branch com mudança no server (hoje há trabalho de 069, 073 e outros em andamento) conflita em massa com o commit de formatação. O custo cai se o commit entrar com a fila de integração vazia ou se as demais branches fizerem rebase logo depois.
- `git blame` passa a apontar o commit de formatação; mitiga-se com `.git-blame-ignore-revs` (hoje não existe no repositório).
- Teto M14 (150 linhas): o commit estoura largamente. Precisa da exceção `teto: excedido, <n> linhas, formatação mecânica`; o texto da exceção cabe porque não mexe em `hooks/` nem em caminho protegido.
- Verificação de que não houve mudança de comportamento: `typecheck` + `lint` + testes do server (inclui `test:pg`) verdes antes e depois, e `prettier --check` de ponta a ponta verde. Prettier não troca semântica, mas o risco real é de template strings e comentários de linha em volta de `// eslint-disable`; o lint pega.
- Efeito colateral no `pronto`: depois de incluir `server` no `format:check`, todo PR do server passa a falhar por estilo se o autor não formatar; o `format` (script de escrita) deve ganhar o mesmo escopo no mesmo PR, para o autor ter o comando de correção.

## 4. Recomendação

Opção (a), em duas etapas e dois PRs, cada um com um comportamento:

1. PR 1 (só formatação): `prettier --write server` num commit sem outra mudança, com `teto: excedido, <n> linhas, formatação mecânica` no corpo, mais um `.git-blame-ignore-revs` com o SHA do commit (o SHA só existe depois do commit; o arquivo entra num commit seguinte do mesmo PR, ou no PR 2). Prova: `pnpm run pronto` verde e `prettier --check server` verde, sem diferença de testes.
2. PR 2 (guarda): incluir `server` em `format` e `format:check` na raiz (uma linha em cada), para o CI passar a barrar. Só depois do PR 1 mesclado, senão o PR 2 nasce vermelho.

Momento: com a fila da `develop` vazia ou logo depois de mesclar o lote em andamento (069, 073), e avisando os autores de branches abertas do server para fazerem merge da `develop` na hora do merge, conforme a `R-FLUXO`.

Por que não (b) manter fora: o `praticas.md:39` já declara Prettier no CI como regra geral, o server é a maior parte do código do repositório e hoje o estilo dele depende só de disciplina individual (o review do L9-c já viu o Prettier acusar). Manter fora exigiria decisão explícita e registro, e não há motivo técnico a registrar.

Outra opção (c), cobrir só arquivos tocados (`--changed`/lint-staged): não resolve a divergência de estilo, mistura estilo com lógica no diff de cada PR e piora o review. Descartada.

Pendência fora do E5: `e2e` (46 arquivos) segue sem checagem; o mesmo raciocínio vale e pode entrar no mesmo PR 2 se o Jarvis quiser, mas é outro volume de formatação (PR 1b).

## Critério de reversão

Se o commit de formatação quebrar teste ou lint do server, reverte-se o commit único (`git revert`) e o PR 2 não é aberto. Se o PR 2 gerar falso positivo recorrente em arquivos gerados (por exemplo, saídas de `kysely-codegen` ou `openapi`), a correção é listá-los no `.prettierignore`, não tirar o server do `format:check`.
