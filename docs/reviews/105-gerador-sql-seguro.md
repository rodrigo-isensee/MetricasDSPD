---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-gerador-sql-seguro
commit: d1917f11fae09baefe4e83297d390e46e4ce5d70
parecer: aprovado
revisor: tech-lead
data: 2026-11-16
---

# Code review: gerador do SQL do DBA só pelo wrapper; avisos A5 e A6 (K-394, E7.378)

## Escopo lido
`git diff ab12a37f...d1917f11` (Base-sha da develop): um commit, três arquivos. `scripts/gerar-sql-migracoes.mjs` (+7 −1), `scripts/gerar-sql-migracoes.sh` (+1 −1) e `docs/devops/105-implantacao-vm.md` (+2 −2). Código e teste: 10 linhas, dentro do teto M14, um comportamento só.

## O que foi conferido
- **Trava do `.mjs`** (linha 32): recusa com código 3 quando `DSPD_GERADOR_VIA_WRAPPER` não é exatamente `'1'`, antes do `import` dinâmico de `esquemas.ts` e antes de qualquer `mkdirSync`/`rmSync`/`writeFileSync`. Só os `import` estáticos de `node:` rodam antes, e eles não tocam o disco. Comparação estrita: `0` e vazio também recusam (S2, S3). A mensagem diz o que usar (`pnpm run db:sql`) e que nada mudou.
- **Wrapper** (`gerar()` no `.sh`): define a variável só na chamada do `pnpm ... exec tsx`, sem `export`. As duas fases (`arquivos` e `grants`) passam pelo `gerar()`, então o `pnpm run db:sql` segue igual. Conferi que a variável chega ao processo filho pelo `pnpm --filter @metricas-dspd/server exec` (saída `env=1`). Nenhum outro chamador do `.mjs` em `.github/`, `scripts/`, `server/tests/` ou `e2e/`.
- **Roteiro da VM:** o passo 1 do DBA agora descreve o que o `00_papeis_e_banco.sql` versionado faz de verdade (`\set ON_ERROR_STOP on` e os três `SET`, linhas 10 a 13 do arquivo, iguais ao gerador nas linhas 59 a 62). O aviso sobre `pg_stat_statements` está certo nos fatos: `track_utility` vem `on` por padrão, `pg_stat_statements.track` só muda com superusuário e o `SET` de log não cobre as estatísticas. O parágrafo do comando que gera diz que o `.mjs` sozinho recusa com código 3.
- **Regras invioláveis:** nada de cálculo, de dado pessoal nem de credencial no diff; o gerador continua sem segredo.
- **Ferramentas e CI:** sem PR para a branch, a suíte inteira fica para o CI do PR; não afirmo CI verde neste head. O brief não traz PQ do autor para citar. O `docs/engineering/praticas.md` não traz regra "decidida por" que alcance estes arquivos; li as seções 2, 4 e 8.
- **Segurança e pipeline:** o `security-engineer` dá o parecer em paralelo; não o refaço.

## Sondas
- S1 · `env -u DSPD_GERADOR_VIA_WRAPPER node scripts/gerar-sql-migracoes.mjs arquivos` · espera: rc=3, `deploy/sql` intacto · obtido: rc=3, `recusado: ... Nada foi alterado.`; `deploy/sql` (43 arquivos) igual antes e depois
- S2 · `DSPD_GERADOR_VIA_WRAPPER=0 ... arquivos` · espera: rc=3 · obtido: rc=3
- S3 · `DSPD_GERADOR_VIA_WRAPPER= ... grants` · espera: rc=3 · obtido: rc=3

## Achados
- A1 (recomendado) scripts/gerar-sql-migracoes.mjs:32 · bug corrigido sem teste do ramo de falha (`praticas.md`, seção 4); S1 a S3 provam. Sugestão: teste em `server/tests/` que rode o `.mjs` sem a variável e confira rc=3 e `deploy/sql` intacto.
- A2 (recomendado) docs/devops/105-implantacao-vm.md:191 · o aviso não diz como pôr o `SET pg_stat_statements.track` na sessão do `psql -f`; num `psql` à parte não protege. Sugestão: `PGOPTIONS='-c pg_stat_statements.track=none' psql ... -f`.
## Parecer
Aprovado no head `d1917f11fae09baefe4e83297d390e46e4ce5d70`. A trava faz o que o K-394 pede, o `pnpm run db:sql` segue igual e o roteiro ficou fiel ao SQL gerado. A1 e A2 são recomendados; A1 não bloqueia porque o comportamento está provado (S1 a S3), mesmo critério do A2 de `docs/reviews/105-vm-recomendados.md`.
