---
tipo: review
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: fix/099-d3-ci-vermelho
commit: b4c40051ad21f0b62fd2e38ce1f4def9c8fc6432
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

## Achados
- A1 (recomendado) docs/qa/evidencias/hash-base-fase-a.nota.md:16 · A tabela da regravação traz só a escala 1; os hashes da escala 0,2 (`824092e4`→`345c5682`, Acelerato `39b4b005`→`34151797`) mudaram nos testes e ficam registrados só em título e comentário. Uma linha na tabela fecha a rastreabilidade.
