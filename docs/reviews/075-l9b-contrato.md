---
tipo: review
contrato: 1
pedido: 075-bloqueios-reais
branch: feature/075-9b
commit: e4eaa56c90f8424d86e7e37151e7ae27745375c2
parecer: aprovado
revisor: tech-lead
data: 2026-11-11
---
# Code review: 075 L9b, contrato sem a nota `bloqueio-sem-dado-real` (K-204)

## Parecer

Aprovado. O lote faz o que a seção "Lote 9b" de `docs/analises/075-plano.md` pede, nem mais nem menos: o id sai de `TEXTO_NOTA_CARTAO` e `NOTA_CARTAO_IDS`; `METRICAS_COM_PARTE_DE_BLOQUEIO`, `MOTIVO_BLOQUEIOS_NAO_COLETADOS` e `MOTIVO_O5_BLOQUEIOS_NAO_COLETADOS` saem de `origem.ts`; os casos do 065 que esperavam a nota saem; o CA-12 passa a valer só pelo interruptor. Como tech-lead, aprovo a mudança incompatível de contrato (TL-A2, §5 da política de mudança) pela saída de aceite por mudança concreta.

## O que foi lido (diff `f4c122f1...e4eaa56c`, 1 commit, 14 arquivos)

- **Classificação de contrato (TL-A2):** valor de enum removido é incompatível (`docs/contratos/politica-de-mudanca.md:23` e a tabela do §2). Saída por aceite em `aceitas.json`, de uso único, e não `/api/v2`: o único consumidor é o `web` do repositório, que não lê o id desde o 9a (`git grep bloqueio-sem-dado-real e4eaa56c -- web/src` vazio), e a API não emite a nota desde o 6b. As três fotografias (`resultados/O1`, `O2`, `O3`), o `openapi.json` (3 enums) e as páginas O1/O2/O3 mudam só na linha do enum e na data de revisão. `aceitas.json` no commit revisado: `{"aceitas": []}`; nenhum commit da branch o toca (ver A1).
- **Interruptor e servidor:** `parte-sem-dado.ts` perde `comNota` e o ramo do O2; com `BLOQUEIOS_COM_DADO_REAL` falso o O1 sai com a parte de bloqueio `null` e sem nota. Em `servico.ts:323` a guarda perde `METRICAS_COM_PARTE_DE_BLOQUEIO.includes(id)`; o filtro por id fica dentro de `semParteDeBloqueio`, que devolve o próprio objeto para O2, O3 e O5 (S9 afirma `toBe` para os três). Comportamento equivalente, sem cálculo novo.
- **`VERSAO_CRITERIO_BLOQUEIO_SEM_DADO_REAL` mantida (T2.6):** segue em `packages/metricas/src/core/criterios.ts:114` e na lista de `:164`; o diff não toca `criterios.ts`. A história da mudança de critério de 2026-11-04 continua marcada.
- **O nulo do O1 continua nulo:** `schemas.ts` não muda o tipo de `bloqueados` (`number | null`); o corte da série antes de 2026-11-01 (6a) não é tocado, e S9b prova `hoje` e série todos `null` com o interruptor desligado. Nada vira 0.
- **Achado 1 da revisão de UX do 9a (`docs/ux/075-revisao-l9a.md`, ramo "sem dado real" do O1):** segue, e com motivo. O ramo de `CartaoO1.tsx:34`, `:37` e `:108` só aparece com `hoje.bloqueados === null`, e o `null` continua no contrato por dois caminhos legítimos: a lacuna da série antes de 2026-11-01 (6a) e a reversão do CA-12 pelo interruptor. Tirar o texto antes de tirar o `null` deixaria um `null` sem leitura na tela. Fica até o `null` sair do contrato, o que não é deste pedido; a decisão de manter é do tech-lead, registrada aqui, e não muda produto.
- **A1 do 9a (mutante M1 do QA, leitura da nota no O2):** fecha pelo tipo, como o review do 9a previu: com o id fora de `NotaCartaoId`, `notas.includes('bloqueio-sem-dado-real')` deixa de compilar no `typecheck` (lido, não sondado: a sonda pediria editar o web, fora deste brief).
- **Regras invioláveis:** sem cálculo, sem mistura de fontes, sem dado de pessoa; só sai um valor de enum que ninguém emite nem lê.
- **Documentação:** `docs/api/metricas.md:429-430` registra o lote; as seções antigas (`:410-414`, 065) ficam como história.

## Execução e ferramentas

- `vitest run src/origem.test.ts --maxWorkers=2` (`packages/contratos`): 17 de 17 passam.
- `vitest run tests/painel-real-f6.test.ts --maxWorkers=2` (`server`): 39 de 39 passam.
- CI do push em `e4eaa56c`: run 43073792546, `completed`/`success` (inclui `docs:check` e `openapi:verificar`). Suíte completa: no CI do PR.
- Teto M14 (`git diff --numstat` código e teste): `origem.ts` 9, `origem.test.ts` 11, `schemas.ts` 4, `parte-sem-dado.ts` 17, `servico.ts` 6, `painel-real-f6.test.ts` 14: 61 linhas, um comportamento. Fotografias, `openapi.json` e `.md` fora.
- Mutação: o QA religou a nota no ramo O1 de `semParteDeBloqueio` e o S9b matou (`docs/qa/075-l9b-contrato.md`); cito, não refaço.

## A1 do QA

Fica recomendado, sem promoção: o título do S9b (`server/tests/painel-real-f6.test.ts:484`) cita "ligado, nenhuma nula no hoje", que o corpo não afirma; o lado ligado está coberto por S6 e S8. É texto, não lacuna de cobertura nem defeito.

## Achados

- A1 (recomendado) docs/contratos/snapshots/aceitas.json:1 · O aceite não ficou no histórico da branch (precedente do 1a). O corpo do PR (E1.9) traz as 3 entradas copiadas do docs:check, a linha do checklist §6 e a conferência de que o web não lê o id (git grep vazio em web/src).
- A2 (recomendado) server/tests/painel-real-f6.test.ts:484 · A1 do QA: o título do S9b promete o caso "ligado" que o corpo não afirma; ajustar o título num lote futuro que toque o arquivo.

## Delta lido

Primeira passada; sem delta anterior.
