---
tipo: review
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: feature/099-c2a-o12-projecao
commit: 34ba37fc11f26e3d04fab964faf7c089b6f3abb8
parecer: reprovado
revisor: forge:tech-lead
data: 2026-11-12
---
# Review: C2a do O12, o deadline nativo do card em data_acordada (E3.29)

Diff lido: `git diff origin/develop...34ba37fc` (base d9f32012), 4 arquivos, +75 -3: `normalizador.ts`, `projetor.ts`, `normalizador-businessmap.test.ts`, `projetor-businessmap.pg.test.ts`. Desenho: `docs/analises/099-o12-deadline.md` §1, §2, §5, linha C2a do §8 e riscos C6 e C7 do §9.

## Achados
- A1 (bloqueante) docs/architecture/data-model.md:116 · diz que `data_acordada` fica nula no dado real até a WS1; o lote passa a preenchê-la pelo `deadline`, e a linha C2a do §8 põe o data-model neste lote. Detalhe em "Notas dos achados".
- A2 (recomendado) server/src/modulos/businessmap/normalizador.ts:147 · `0000-01-01` passa no regex e no `Date` do JS, mas o PostgreSQL não tem ano zero: abortaria o INSERT do lote. Recusar ano 0000 e pôr o caso em `ruins`.

## Notas dos achados
- A1: tirar `data_acordada` da lista da linha 116 e dizer (na linha 106 ou numa nota curta) que a coluna vem do `deadline` nativo (decisão B da Q-099-10), com parse estrito e nota `deadline_fora_da_forma`. O trecho "O12 segue do mock" sai no C3, com o O12 em `METRICAS_ORIGEM_REAL`. Runbook: nenhum cita a coluna (`grep -rln 'data_acordada\|deadline' docs/runbooks docs/engineering README.md server/README*` sem resultado), então não há nada a mudar, nem agora nem no C3.
- A2: `node -e` devolve `0000-01-01T00:00:00.000Z`. Não há gatilho conhecido (o seletor do BusinessMap não produz ano zero), por isso não bloqueia.

## Sondas

## Conferência do pedido do brief
- **Parse estrito, sem fuso:** o regex `^\d{4}-\d{2}-\d{2}$` e a volta por `T00:00:00Z` só confirmam o calendário. O valor gravado é o texto de entrada, sem conversão. Data e hora, texto, `30/10/2026`, `2026-02-30`, `2026-13-01`, número, booleano e vazio viram `null` com uma nota (teste do normalizador). O C6 está coberto.
- **Valor fora da forma nunca em log nem em tabela:** a função empilha só o código `deadline_fora_da_forma`, que o projetor conta em `ctl_coleta_contagem` (`projetor.ts:211`, `:311`), e o teste afirma que as notas não trazem o valor. A função não tem `console` nem log.
- **Formato do pool (C7):** `pool.ts:19-24` devolve `date` como `'AAAA-MM-DD'`. O normalizador emite o mesmo texto, e `IGUAIS` (`projetor.ts:113`) compara iguais. O `.pg` usa `criarPool` (os mesmos `tipos`) e afirma `r.versoes === 0` na segunda projeção.
- **Teste `.pg` contra o §8:** cobre `dim_card` e `dim_card_versao` preenchidos, segunda projeção sem versão, prazo mudado com versão nova, prazo removido de volta a nulo sem apagar a versão anterior (`['2026-10-30', '2026-11-15', null]`) e a forma ruim com nota. Pela regra de recursos, ele roda só no CI do PR: eu não o executei.
- **Sem gatilho de `R-SEGURANCA`:** não há migração, GRANT nem mudança na allow-list. A coluna já existe (`0005`, `0006`). A confirmação do §5 é do security-engineer (E3.31).

## Ferramentas (citadas, não refeitas)
- `scripts/lint-alterados.sh`: eslint em 4 arquivos contra `origin/develop`, sem erro.
- `scripts/typecheck-alterados.sh`: `tsc --noEmit` em `server`, sem erro.
- `vitest run tests/normalizador-businessmap.test.ts`: `Tests 27 passed (27)`.

## Parecer
Reprovado sobre 34ba37fc só pelo A1, que é de documentação. O código está correto, simples e no tamanho do lote: são 75 linhas, abaixo da orientação de 150. O commit `feat(businessmap): ...` está limpo. Na volta basta o A1; o A2 fica a critério do autor. Para o corpo do PR (E3.25/node-backend): a primeira projeção depois do lote cria uma versão em `dim_card_versao` por card com prazo, conforme o §1 do desenho. O PR registra essa contagem quando o dono rodar a projeção.
