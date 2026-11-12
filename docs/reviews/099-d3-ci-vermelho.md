---
tipo: review
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: fix/099-d3-ci-vermelho
commit: 332f134a8b77d5c15932a5dd5b605b3b1cf9cf53
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-12
---
# Code review: correção da develop vermelha pelo D3 (E2.12)

Diff lido: `git diff origin/develop...b4c40051` (`d9f32012..b4c40051`, 1 commit de código; `c68a3955` é só o parecer do QA, `docs/qa/099-d3-ci-vermelho.md`, aprovado). 11 arquivos fora o parecer do QA.

## Ferramentas (citadas, não refeitas)
- Testes dos arquivos tocados: `packages/mock` `vitest run` de `coletas`, `complementares`, `extensaoTambem`, `mock`, `pesquisa` e `tambem`: 6 arquivos, 54 testes, passaram. `packages/metricas` `vitest run src/acelerato/acelerato.test.ts`: 17 testes, passaram.
- `prettier --check` nos 10 arquivos de código e evidência tocados: "All matched files use Prettier code style!".
- Suíte inteira e e2e: no CI do PR.

## Conferência
- **Só hashes, nota e formatação, sem lógica nova:** confirmado com `git diff -w`. `modelo.ts` (`ALVOS_PADRAO`), `s1.ts` e `acelerato.test.ts` mudam só a quebra de linha do prettier; mesmos campos, mesmos valores, mesma chamada. Nos 6 testes do mock só trocam os hashes esperados (`68a67741`→`de6a8953`, `824092e4`→`345c5682`, `0113e077`→`20541e9d`, `39b4b005`→`34151797`), dois títulos de `it` que citam os hashes e um comentário que aponta a nota. Nenhuma guarda (`if`, `throw`, `return` de erro) mudada; nada a declarar em mutante.
- **O motivo explica a mudança:** `packages/mock/src/acelerato/gerador.ts:239` monta `config: { alvos: ALVOS_PADRAO.map((a) => ({ ...a })) }`; o D3 deu a `AlvoPrioridade` os campos `unidade_primeiro_atendimento` e `unidade_restauracao`, então a config do mock ganha os dois campos e o hash do Acelerato e o da base mudam. O BusinessMap fica igual (`hashBusinessMap` `4540bc56` intacto na evidência), e `cards`/`chamados` não mudam (5792 e 6062). Coerente com o que a nota diz.
- **Consistência dos hashes:** os mesmos valores novos aparecem em todos os testes e na evidência; nenhum hash velho sobrou nos arquivos tocados.
- **Regras invioláveis:** nada de pessoa, nada mistura BusinessMap e Acelerato, nenhum cálculo novo.
- **Tamanho (M14):** 106 linhas de código e teste (formatação e hashes), dentro do teto.

## Revalidação por delta (E3.37, testes de cobertura)
Delta lido: `forge-check parecer delta docs/reviews/099-d3-ci-vermelho.md`, intervalo `b4c40051..332f134a`, no domínio só `server/tests/alvos-acelerato-sincronizar.test.ts` (novo, 95 linhas) e `server/tests/metricas.mapa.test.ts` (+7). Nenhum arquivo de `src/` mudou; sem limiar baixado nem arquivo excluído da cobertura.
- **Testes dos arquivos tocados:** `vitest run tests/alvos-acelerato-sincronizar.test.ts tests/metricas.mapa.test.ts` em `server/`: 2 arquivos, 17 testes, passaram. A cobertura de 100% é decidida pelo check `testes` do PR 364, não refeita aqui.
- **Comportamento, não só linha:** os casos afirmam o resultado (`inseridos`, `fechados`, `versaoRegistrada`), a ordem `BEGIN`…`COMMIT`/`ROLLBACK`, os parâmetros gravados (`['P1', '2031-01-10', 0.25, 'corrido', 4, 'corrido']`, o `UPDATE` só de `P3`), a idempotência sem escrita e as recusas com a mensagem. Em `mapa`, unidade fora de `corrido`/`util` em cada um dos dois campos dá erro, nunca padrão. Sondas manuais em `src/` (revertidas): `hoje <= ultima` trocado por `<` morre; `if (existe.rows[0] === undefined)` trocado por `if (true)` morre; ignorar o `vigente_ate` sobrevive (S1, A2).
- **O duble de pg não esconde regra:** ele só devolve linhas por trecho do SQL e registra texto e parâmetros; toda regra (`planejarAlvos`, a data máxima por prioridade em `lerEstado`, a versão por hash, a transação de `emTransacao`) roda no código real. O que o duble não prova (predicados SQL, `CHECK`, tipos do Postgres) segue com `alvos-acelerato.pg.test.ts`, no portão da `homolog`.

## Sondas
- S1 · `server/src/modulos/referencia/alvos-acelerato.ts:120` com `const fim = l.vigente_de;` · espera: um teste falha · obtido: `Tests 7 passed (7)`

## Achados
- A1 (recomendado) docs/qa/evidencias/hash-base-fase-a.nota.md:16 · A tabela da regravação traz só a escala 1; os hashes da escala 0,2 (`824092e4`→`345c5682`, Acelerato `39b4b005`→`34151797`) mudaram nos testes e ficam registrados só em título e comentário. Uma linha na tabela fecha a rastreabilidade.
- A2 (recomendado) server/tests/alvos-acelerato-sincronizar.test.ts:73 · A linha aberta em 2031-03-01 já dá a data máxima; o ramo do vigente_ate não é provado (S1 sobrevive). Caso: só a vigência fechada 2030-01-01..2031-03-01, data 2031-02-01 recusada.
