---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-gerador-sql-seguro
commit: 54a2c06eebe21fd7e1812f70d3c5e8154cf1796e
parecer: aprovado
revisor: tech-lead
data: 2026-11-16
---

# Code review: gerador do SQL do DBA só pelo wrapper; avisos A5 e A6 (K-394, E7.378 e E7.386)

## Escopo lido
`git diff ab12a37f...d1917f11` (Base-sha da develop): um commit, três arquivos. `scripts/gerar-sql-migracoes.mjs` (+7 −1), `scripts/gerar-sql-migracoes.sh` (+1 −1) e `docs/devops/105-implantacao-vm.md` (+2 −2). Código e teste: 10 linhas, dentro do teto M14, um comportamento só.

## Revalidação (E7.386, head 54a2c06e)
Delta lido: `forge-check parecer delta docs/reviews/105-gerador-sql-seguro.md`, intervalo `d1917f11..54a2c06e`. No domínio do parecer (código e testes) entrou só `server/tests/gerador-sql-recusa.test.ts` (+48). Fora do domínio, o commit `54a2c06e` muda uma linha de `docs/devops/105-implantacao-vm.md` (passo 1 do DBA), que é o alvo do meu A2 e por isso também li. O resto do intervalo são merges e os pareceres do QA e da segurança.

- **A1 resolvido.** O teste novo copia o `.mjs` para um diretório temporário (a raiz do script vira o temporário, então o `deploy/sql` do repositório nunca é tocado), tira a variável do ambiente herdado e roda o gerador com o `node` do processo. Cobre as fases `arquivos`, `grants` e vazia sem a variável e os valores `0`, `true` e vazio; confere rc=3, a mensagem (`recusado`, `pnpm run db:sql`) e o `deploy/sql` igual antes e depois, inclusive o arquivo que não é `.sql`. O teste novo passa (6 de 6) e mata o mutante da guarda (S4).
- **A2 resolvido.** O aviso agora põe o desligamento na mesma conexão do `psql -f`: `PGOPTIONS='-c pg_stat_statements.track=none'`, ou `-c "SET ..."` antes do `-f` (no psql 15 ou mais novo os `-c` e `-f` correm em ordem na mesma sessão). Explica por que o `SET` numa sessão à parte não protege, cita o privilégio (superusuário ou `GRANT SET ON PARAMETER pg_stat_statements.track`, PostgreSQL 15 ou mais novo), o que acontece sem ele (conexão recusada, nada criado) e mantém o `pg_stat_statements_reset()` como saída de reserva. A prova do autor no PostgreSQL 17 (5 ocorrências da senha sem o ajuste, 0 com ele) está registrada no roteiro; não a refiz.
- **Ferramentas e CI:** sem PR para a branch, a suíte inteira fica para o CI do PR; não afirmo CI verde neste head. Rodei só o teste novo e o mutante.

## O que foi conferido (rodada anterior, head d1917f11)
- **Trava do `.mjs`** (linha 32): recusa com código 3 quando `DSPD_GERADOR_VIA_WRAPPER` não é exatamente `'1'`, antes do `import` dinâmico de `esquemas.ts` e antes de qualquer `mkdirSync`/`rmSync`/`writeFileSync`. Só os `import` estáticos de `node:` rodam antes, e eles não tocam o disco. Comparação estrita: `0` e vazio também recusam (S2, S3). A mensagem diz o que usar (`pnpm run db:sql`) e que nada mudou.
- **Wrapper** (`gerar()` no `.sh`): define a variável só na chamada do `pnpm ... exec tsx`, sem `export`. As duas fases (`arquivos` e `grants`) passam pelo `gerar()`, então o `pnpm run db:sql` segue igual. Conferi que a variável chega ao processo filho pelo `pnpm --filter @metricas-dspd/server exec` (saída `env=1`). Nenhum outro chamador do `.mjs` em `.github/`, `scripts/`, `server/tests/` ou `e2e/`.
- **Roteiro da VM:** o passo 1 do DBA descreve o que o `00_papeis_e_banco.sql` versionado faz de verdade (`\set ON_ERROR_STOP on` e os três `SET`, linhas 10 a 13 do arquivo, iguais ao gerador nas linhas 59 a 62). O aviso sobre `pg_stat_statements` está certo nos fatos: `track_utility` vem `on` por padrão e o `SET` de log não cobre as estatísticas.
- **Regras invioláveis:** nada de cálculo, de dado pessoal nem de credencial no diff; o gerador continua sem segredo.
- O `docs/engineering/praticas.md` não traz regra "decidida por" que alcance estes arquivos; li as seções 2, 4 e 8.
- **Segurança e pipeline:** o `security-engineer` dá o parecer em paralelo; não o refaço.

## Sondas
- S1 · `env -u DSPD_GERADOR_VIA_WRAPPER node scripts/gerar-sql-migracoes.mjs arquivos` · espera: rc=3, `deploy/sql` intacto · obtido: rc=3, `recusado: ... Nada foi alterado.`; `deploy/sql` (43 arquivos) igual antes e depois
- S2 · `DSPD_GERADOR_VIA_WRAPPER=0 ... arquivos` · espera: rc=3 · obtido: rc=3
- S3 · `DSPD_GERADOR_VIA_WRAPPER= ... grants` · espera: rc=3 · obtido: rc=3
- S4 · mutante na linha 32 do `.mjs` (`!== '1'` trocado por `=== '__nunca__'`) e `npx vitest run tests/gerador-sql-recusa.test.ts` · espera: o teste cai · obtido: `Tests 6 failed (6)`; sem o mutante, `Tests 6 passed (6)`; árvore restaurada, `git status` limpo

## Achados
- A1 (recomendado) scripts/gerar-sql-migracoes.mjs:32 · bug corrigido sem teste do ramo de falha (`praticas.md`, seção 4). Resolvido em `54a2c06e` por `server/tests/gerador-sql-recusa.test.ts` (S4).
- A2 (recomendado) docs/devops/105-implantacao-vm.md:191 · o aviso não dizia como pôr o `SET pg_stat_statements.track` na sessão do `psql -f`. Resolvido em `54a2c06e` com `PGOPTIONS` ou `-c` antes do `-f`, e o privilégio citado.

## Parecer
Aprovado no head `54a2c06eebe21fd7e1812f70d3c5e8154cf1796e`. A1 e A2 foram resolvidos; o teste novo prova a recusa e mata o mutante da guarda, e o aviso ao DBA agora protege de fato a conexão que cria os papéis. Nenhum achado em aberto.
