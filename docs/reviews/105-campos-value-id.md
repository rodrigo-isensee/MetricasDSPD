---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-campos-value-id
commit: ad04bc375ee5eedc505281b82b44c8d73badd514
parecer: reprovado
revisor: tech-lead
data: 2026-11-16
---

# Code review: campos 48 e 49 do BusinessMap casados pelo value_id, E7.203 (review E7.207)

Branch `feature/105-campos-value-id` contra `develop` (base `2a4dc3b9`), head `ad04bc37`. 9 arquivos; código e teste: 113 linhas (fora o JSON de domínio, `.md` e CHANGELOG), abaixo do teto de 150; um comportamento: o casamento das listas 48 e 49 pelo `value_id`.

## Parecer
**Reprovado** no head `ad04bc37` por A1: o job `banco` do CI desse head falha (run 43874353570), porque o teste pg do arquivo real ainda espera só o campo 48. A lógica está correta e confere com o catálogo do spike; depois de corrigir o A1, a revalidação é só ler o delta e conferir o CI.

## Achados
- A1 (bloqueante) server/tests/dominio-businessmap.pg.test.ts:58 · Teste pg do arquivo real ainda espera só o campo 48; job `banco` do run 43874353570 falha ("length of 1 but got 2"). Atualize para os campos 48 e 49 e as listas `valor_id_<coluna>` (detalhe abaixo).
- A2 (recomendado) docs/architecture/fontes/businessmap-causa-raiz-carga.md:11 · O passo 3 diz "13 linhas" do campo 48; agora são 38 (2 + 12 + 12 + 6 + 6), com o 49. Atualize o número e cite o 49.

## Detalhe dos achados
- A1: o teste afirma 1 campo (linha 58), 13 linhas do campo (63), `campos: 1` e 370 inseridas (65-66) e `campo_customizado` só com `48` (67); no CI, 1 falhou e 328 passaram. Atualize para 2 campos, as linhas de `origem_demanda`, `valor_id_causa_raiz` e `valor_id_origem_demanda`, o total de inseridas e `afeta` `['O14','O17']`, e afirme que `dominiosDaColeta` devolve os `value_id` 114 a 125 e 126 a 131 ligados aos códigos. Mesma classe do A5 de `docs/reviews/105-causa-raiz-bm.md`: o `pnpm run pronto` não roda o `test:pg`; rode `pnpm --filter @metricas-dspd/server test:pg` antes do push.

## O que conferi
- Catálogo (`/home/rodrigoisensee/pedidos-assistente/catalogo-48-49.md`) contra `docs/architecture/fontes/businessmap-dominio.json`: os 12 `value_id` do 48 (114 a 125) e os 6 do 49 (126 a 131) ligam à opção certa; rótulos do 48 iguais aos do BusinessMap ("Requisitos mal definidos", "Layout / Interface"); os códigos do 49 de 126 a 130 são iguais a `ORIGENS_DEMANDA` (packages/contratos/src/comum.ts:114) e o 131 é "Demanda nova".
- Arquivo: `value_id` só dígitos (`ID_CAMPO`, 1 a 10) e opcional; repetido no mesmo campo é recusado, com normalização (`String(Number(...))`, `0114` = `114`). Teste novo cobre repetido e não numérico.
- `listasDoArquivo`: uma lista `valor_id_<coluna>` por campo, mesmo vazia, então opção que sair do arquivo fecha a vigência. `ref_dominio.campo` comporta o prefixo (`valor_id_origem_demanda`, 23 caracteres). Sem migração nem GRANT novo.
- `dominiosDeLinhas` (o coletor desconfia do banco, A4 do modelo de ameaças): `value_id` não numérico, código inseguro ou reservado, `value_id` ligado a dois códigos, código fora da lista da coluna e chave que colide com rótulo são ignorados. O mapa é por campo, então `value_id` de outro campo vira `desconhecido` (teste do 49 com o 114).
- Fronteira (`reduzirCamposCustomizados`): sem mudança; já lia `values[].value_id`. Fora do catálogo vira `desconhecido`, contado como `campo_fora_do_dominio`. Nenhum texto livre ou dado de pessoa entra.
- O14 (`server/src/modulos/metricas/mapa.ts:23`): só as 5 origens de falha do contrato passam; "Demanda nova", `desconhecido` e qualquer outro valor viram `null`, e o T5 (`packages/metricas/src/businessmap/t5.ts:16`) conta falha só com origem não nula. Bate com a decisão do brief ("Demanda nova" vira nulo, não é falha).
- Versão de critério nova com `afeta` `['O14','O17']` (arquivo novo, novo hash, append-only). BusinessMap e Acelerato não se misturam: nada do diff lê `dspd_ac`.
- Mutantes que rodei no `dominio-businessmap.ts`: tirar `codigos.has(codigo)` (linha 289) derruba 1 teste ("valor_id_<coluna> liga value_id ao código"); trocar a guarda de `value_id` repetido (linha 139) por `false` derruba 1 teste ("value_id repetido ou não numérico"). Sem mutante: `tests/allow-list.test.ts`, `tests/dominio-businessmap.test.ts` e `tests/metricas.mapa.test.ts`, 129 passaram.
- CI do head `ad04bc37`, run 43874353570 (push): `failure`, só no job `banco` (A1); `testes`, `build`, `seguranca`, `openapi`, `rapida` e `imagem` verdes; e2e e perf pulados pelo filtro. Suíte não rerrodada; PQ do autor: pronto verde (histórico do pedido, 2026-11-16 10:18), que não cobre o `test:pg`.
