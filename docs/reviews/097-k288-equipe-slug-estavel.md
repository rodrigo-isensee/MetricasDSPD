---
tipo: review
contrato: 1
pedido: 097-resumo-filtro-time
branch: fix/k288-equipe-slug-estavel
commit: 62d00ef3bddf211bcc1a189e203187f0b5eaa650
parecer: aprovado
revisor: tech-lead
data: 2026-11-12
---

# Code review: K-288, equipe da Sustentação com slug repetido fica com o primeiro (E4.9, review E3.2)

Diff lido: `git diff origin/develop...62d00ef3` (base 2c1e1fac; 4 arquivos, +34 -5; código e teste: 39 linhas, dentro do teto). Parecer do QA na mesma branch: `docs/qa/097-k288-equipe-slug-estavel.md` (aprovado, 600cedb7). Fecha o A5 de `docs/reviews/097-l7a-sustentacao-equipe.md` (o `Map` guardava o último nome, e a ordem dependia da collation).

## O que foi conferido
- **Regra nova:** `equipesPorSlug` (`servico.ts:44`) fica com o primeiro nome de cada slug; `lerEquipesAC` entrega os nomes em ordem de bytes UTF-8 (`Buffer.compare`), que é a mesma ordem de `COLLATE "C"` num banco UTF-8. O resultado deixa de depender da collation do banco e da ordem em que ele devolve as linhas. Contrato `{id, nome}`, corte (`WHERE ${CORTE_CHAMADOS}`) e schemas não mudam.
- **Ordem por bytes no banco e no código:** a ordenação no código basta para a correção; o `COLLATE "C"` no SQL passa a ser redundante (A1). É inofensivo (lista de poucas equipes, sem índice que dependa da collation) e não bloqueia.
- **Teste antigo que mudou de expectativa** (`app.test.ts:56`): o responder (`app.test.ts:17`) devolve `Time Novo` e `time-novo`; antes o `Map` ficava com o último (`time-novo`), agora fica com o primeiro em bytes (`T` 0x54 < `t` 0x74), `Time Novo`. A mudança decorre da regra do cartão, não é acomodação. O teste novo (`app.test.ts:96`) roda as duas ordens de entrada e exige o mesmo nome; o de `corte-unico.test.ts` prova a ordem de bytes com entrada embaralhada.
- **Regras invioláveis:** só o esquema Acelerato; nenhuma coluna de pessoa; histórico intocado; sem cálculo de métrica.
- **Commit:** `fix(referencia): ...` em Conventional Commits, corpo diz o defeito (último nome, collation) e a correção, com `Cartão: K-288`. Um commit, uma mudança coerente.

## Execução
- `VITEST_MAX_WORKERS=2 npx vitest run tests/app.test.ts tests/corte-unico.test.ts` em `server/` (head 600cedb7 = 62d00ef3 mais o parecer do QA): 2 arquivos, 23 testes passam.
- `npx eslint` nos 4 arquivos do diff: sem saída, verde.
- Mutações do QA (M1 a M3) citadas do parecer dele, não refeitas.
- Nada contra a base real nem `.env*`; a suíte inteira e o .pg rodam no CI.

## Achados
- A1 (recomendado) server/src/modulos/referencia/repositorio.ts:41 · `ORDER BY equipe COLLATE "C"` e o `.sort` por bytes fazem a mesma coisa; o sort no código já garante a regra. Manter só um (o sort, que tem teste de comportamento) e tirar o teste que confere o texto do SQL.
- A2 (recomendado) server/tests/app.test.ts:97 · o `for` está com 2 espaços de recuo dentro do `it` (o corpo dele, com 6); ajuste de formatação.

## Veredito
Aprovado. Dois achados recomendados, nenhum bloqueante.
