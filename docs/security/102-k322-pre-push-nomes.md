---
tipo: revisao-seguranca
contrato: 1
pedido: 102-forge-0460
branch: fix/k322-pre-push-nomes
commit: 95a65933fbee98afd00fba20b797934f01bb61bd
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-14
---
# Review de segurança: K-322, scripts do pre-push com nomes de arquivo especiais (E1.26)

## Parecer
Aprovado, sem achado. Li o diff `7cb86b26...95a65933`, que toca 4 arquivos: `scripts/lint-alterados.sh`, `scripts/typecheck-alterados.sh` e os testes deles. O head `59265fb7` só acrescenta `docs/devops/102-forge-0460-k322.md`, então o código é o mesmo do `95a65933`. Os três recomendados do parecer do K-319 (`docs/security/102-k319-lint-nao-ascii.md`, A1 a A3) estão fechados. Refiz as sondas S1 a S4 e S6 daquele parecer contra o código novo. Um nome começando por traço chega ao eslint como caminho, nos dois eslint. Nome com quebra de linha, `"` ou `\` chega inteiro e não pula mais o typecheck. Os testes não escapam para um repositório externo quando GIT_DIR, GIT_INDEX_FILE e GIT_WORK_TREE vêm exportados.

## Gatilhos
Controle de qualidade do envio (pre-push), classe C. São scripts de shell que recebem nomes de arquivo do git e os repassam ao eslint e ao pnpm. Não há dado pessoal, credencial nem rede.

## Achados

## Sondas
- S1 · pnpm falso; `--ignore-pattern=*.ts.ts` na raiz e `server/--config=x.ts` commitados; `bash scripts/lint-alterados.sh` · espera: os dois nomes depois do `--` · obtido: `ARG[--]` e então o nome, no eslint da raiz e no do server
- S2 · `server/src/a<LF>b.ts` commitado; `bash scripts/typecheck-alterados.sh` · espera: typecheck do server · obtido: `pnpm --filter @metricas-dspd/server run typecheck`, 1 chamada (antes, "typecheck pulado" com rc=0)
- S3 · `server/src/a"b.ts` e `server/src/c\d.ts`, um por branch; `bash scripts/typecheck-alterados.sh` · espera: typecheck do server · obtido: `pnpm --filter @metricas-dspd/server run typecheck` nos dois casos
- S4 · externo com 1 commit; GIT_DIR (e, no typecheck, GIT_INDEX_FILE e GIT_WORK_TREE) apontando para ele; os dois testes · espera: externo intacto · obtido: rc=0 nos dois e o externo segue com 1 commit e 1 ref (antes: 11 commits)
- S6 · nome `web/src/$(touch PWNED);` seguido de crase `touch PWNED2` crase, `|"q".ts`, não rastreado; os dois scripts · espera: nenhuma execução · obtido: nenhum PWNED nem PWNED2 criado, e o nome chega como um único argumento
- S7 · eslint 9.39.5 real: `pnpm exec eslint --no-warn-ignored -- --ignore-pattern=x.ts` e `pnpm --filter @metricas-dspd/server exec eslint -- --config=x.ts` · espera: nome como caminho · obtido: `No files matching the pattern "--..."`, rc=2 na raiz e rc=1 via pnpm no server

## Detalhe dos achados
**A1 do K-319, fechado.** `scripts/lint-alterados.sh:43` e `:47` agora põem `--` antes de `"${raiz[@]}"` e de `"${servidor[@]}"`. No server, o nome sai sem o prefixo (`${f#server/}`) e pode começar por traço; ele também fica depois do `--` (S1). Com o eslint real, `--` encerra as opções nos dois caminhos, inclusive através do `pnpm --filter ... exec` (S7). Sem o `--`, o mesmo `--config=...` seria lido como opção. O tsc nunca recebe nome de arquivo: `scripts/typecheck-alterados.sh` usa o nome só no `case` (`:31-41`) e chama o pnpm com filtros fixos (`--filter @metricas-dspd/<pacote>`). Não existe caminho de opção ali.

**A2 do K-319, fechado.** As duas listagens passam a usar `git diff -z` e `git ls-files -z`, `sort -zu` e `while IFS= read -r -d '' f` (`scripts/lint-alterados.sh:24-33` e `scripts/typecheck-alterados.sh:30-45`). Com `-z`, o git não cita nenhum nome, então o `core.quotePath=false` ficou redundante e saiu. O `printf '\0'` que eu sugeri entre as duas saídas não é necessário: com `-z`, cada registro do git já termina em NUL, e a concatenação continua bem delimitada. Os testes 3e e 3f (arquivo rastreado mais não rastreado) provam isso. Nome com quebra de linha, aspas ou barra invertida chega inteiro e casa com `server/*` e `web/*` (S2, S3, testes 8e e 8f). No lint, um erro plantado nesses nomes reprova (testes 3h). O nome continua indo para arrays expandidos entre aspas, sem `eval` nem `sh -c`, e o S6 confirma que não há injeção.

**A3 do K-319, fechado.** `scripts/lint-alterados.test.sh:6` e `scripts/typecheck-alterados.test.sh:5` fazem `unset GIT_DIR GIT_INDEX_FILE GIT_WORK_TREE` antes de qualquer comando git, igual a `scripts/pre-push.test.sh` (S4).

**Sem regressão de falso verde.** O fallback sem merge-base (`exec pnpm run lint|typecheck`) não mudou. Uma falha do `git diff` dentro da substituição de processo continua sem propagar o rc, mas isso já era assim, e o `mb` foi validado antes. Não entra como achado: o efeito é só local e a CI roda o lint e o typecheck inteiros.

## Riscos aceitos e ferramentas
Riscos aceitos: nenhum.

Suíte: a suíte inteira fica com o CI. Nos check-runs do head `59265fb7`, cujo código é o mesmo do `95a65933`, estavam verdes `build`, `openapi`, `seguranca`, `imagem`, `filtro`, `rapida` e `banco`. `e2e`, `e2e-parte` e `perf` foram pulados pelo filtro. `testes` ainda estava em andamento na hora da leitura, e o merge depende dele verde (`R-REVIEW`). Localmente rodei os testes da entrega, `bash scripts/lint-alterados.test.sh` (24 ok) e `bash scripts/typecheck-alterados.test.sh` (19 ok), ambos com rc=0. Rodei também as sondas, num repositório descartável dentro de `node_modules/.cache` que já removi. Nota de ambiente: sem `node` no PATH, o caso 6 do teste do typecheck (package.json da raiz) falha, porque `sem_scripts` chama o node. Com o node no PATH, como no pre-push e na CI, passa. Não é um defeito da entrega.

Ferramentas: o `shellcheck` rodou nos 4 arquivos e só repetiu os SC2319 do parecer anterior, em linhas fora deste diff (`scripts/lint-alterados.test.sh:57`, `:89` e `:96`, e `scripts/typecheck-alterados.test.sh:52`). São de estilo e ficam com o tech-lead. `gitleaks`, `semgrep` e `osv-scanner` não estão no PATH, o que fica registrado como lacuna. O diff não traz dependência nova. Nenhuma ferramenta foi instalada.
