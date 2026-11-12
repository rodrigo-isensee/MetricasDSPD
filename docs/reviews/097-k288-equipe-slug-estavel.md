---
tipo: review
contrato: 1
pedido: 097-resumo-filtro-time
branch: fix/k288-equipe-slug-estavel
commit: e9ca7d2747c859f875e9e71c121763c2652936b0
parecer: aprovado
revisor: tech-lead
data: 2026-11-12
---

# Code review: K-288, equipe da Sustentação com slug repetido fica com o primeiro (E4.9, review E3.2)

Volta 1, head e9ca7d27 (anterior 62d00ef3). Diff original lido: `git diff origin/develop...62d00ef3` (base 2c1e1fac; 4 arquivos, +34 -5; código e teste: 39 linhas, dentro do teto). Parecer do QA na mesma branch: `docs/qa/097-k288-equipe-slug-estavel.md` (aprovado na volta 1, commit e9ca7d27, 3e86d087). Fecha o A5 de `docs/reviews/097-l7a-sustentacao-equipe.md` (o `Map` guardava o último nome, e a ordem dependia da collation).

## Revalidação (volta 1)
Delta lido por `forge-check parecer delta docs/reviews/097-k288-equipe-slug-estavel.md` (intervalo 62d00ef3..3e86d087; no domínio: `server/src/modulos/referencia/repositorio.ts`, `server/tests/app.test.ts`, `server/tests/corte-unico.test.ts`; 3 arquivos, +3 -6).
- **Motivo da volta:** o `SELECT DISTINCT equipe ... ORDER BY equipe COLLATE "C"` dava 500 no job banco do PR 352 (no Postgres, com `DISTINCT`, a expressão do `ORDER BY` precisa estar na lista do select). A consulta agora não tem `ORDER BY`; a ordem por bytes fica só no `.sort` com `Buffer.compare`, que já era a garantia da regra.
- **A1 fechado:** um só mecanismo de ordem (o do código, com teste de comportamento em entrada embaralhada); o teste que conferia o texto do SQL saiu junto com a cláusula. O comentário em `repositorio.ts:42` explica por que não há `ORDER BY`.
- **A2 fechado:** o `for` em `app.test.ts:97` está com 4 espaços, alinhado ao corpo do `it`.
- Contrato `{id, nome}`, corte (`WHERE ${CORTE_CHAMADOS}`), schemas e `servico.ts` sem mudança no delta; nenhuma coluna de pessoa; só esquema Acelerato.
- Job `banco` do PR 352 no head e9ca7d27 verde, citado do parecer do QA (run 43164401255), não refeito.

## O que foi conferido (rodada anterior, vale sobre código inalterado)
- **Regra nova:** `equipesPorSlug` (`servico.ts:44`) fica com o primeiro nome de cada slug; `lerEquipesAC` entrega os nomes em ordem de bytes UTF-8 (`Buffer.compare`). O resultado deixa de depender da collation do banco e da ordem em que ele devolve as linhas.
- **Teste antigo que mudou de expectativa** (`app.test.ts:56`): agora fica o primeiro em bytes (`T` 0x54 < `t` 0x74), `Time Novo`; decorre da regra do cartão, não é acomodação. O teste `app.test.ts:96` roda as duas ordens de entrada e exige o mesmo nome.
- **Regras invioláveis:** só o esquema Acelerato; nenhuma coluna de pessoa; histórico intocado; sem cálculo de métrica.
- **Commits:** `fix(referencia): ...` e `fix(servidor): tira o COLLATE "C" do SELECT DISTINCT ...`, Conventional Commits, cada um uma mudança coerente.

## Execução
- `VITEST_MAX_WORKERS=2 npx vitest run tests/app.test.ts tests/corte-unico.test.ts` em `server/` (head 3e86d087 = e9ca7d27 mais o parecer do QA): 2 arquivos, 22 testes passam (sai o teste do texto do SQL).
- `npx eslint` nos 3 arquivos do delta: verde, sem saída.
- Mutações do QA (M1, M2) citadas do parecer dele, não refeitas; M3 deixou de existir com a cláusula.
- Nada contra a base real nem `.env*`; a suíte inteira roda no CI.

## Achados

## Veredito
Aprovado. A1 e A2 fechados; nenhum achado aberto.
