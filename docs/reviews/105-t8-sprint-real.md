---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: feat/105-t8-sprint-real
commit: 453348a218247c5f9ca0e451a99cc210366c3db5
parecer: reprovado
revisor: tech-lead
data: 2026-11-17
---

# Code review: T8 com dado real (E7.499 e E7.514, review E7.527)

## Escopo lido
`git diff 808a163c...453348a2` (Base-sha da develop): 2 commits (`3cd6fc83` feat, `453348a2` renumeração 0041 → 0042), 43 arquivos, 1127 linhas somadas (adições mais remoções, `.md` incluído). Li a biblioteca (`t8.ts`, `extensao.ts`, `criterios.ts`), o coletor (`normalizador.ts`, `projetor.ts`), a migração 0042 e o `deploy/sql`, os GRANTs (`grants.ts`, `9000_grants.sql`), a leitura da API (`repositorio.ts`, `mapa.ts`, `servico.ts`), o contrato (`schemas.ts`, `origem.ts`, `cartoes.ts`) e o cartão (`previsao.tsx`, `notas.ts`).

Conferido e correto:
- **Regra do dono (D-T8 = A):** janela = `first_start_time` a `first_end_time` do card tipo 12 com `eh_item = false`; sem as duas datas, janela invertida ou mais de 30 dias úteis fica fora; 30 dias úteis exatos entra (teste com a Sexta-feira Santa). Não planejado = filho criado depois do dia de início (o mesmo dia é planejado), com `ligado_em` preferido quando existir. Mínimo de 20 sprints só com dado real; abaixo dele `sprints` vai vazia e o agregado `insuficiente` com `n` em sprints. Só BusinessMap (`ac: EXTENSAO_AC_VAZIA`).
- **Biblioteca (T2.5) e T2.6:** o cálculo fica todo em `calcularT8`; `VERSAO_CRITERIO_T8_DADO_REAL` datada; T8 entrou em `METRICAS_CALENDARIO` do BusinessMap.
- **Modelagem:** `dim_sprint` é projeção refeita por card como a `dim_card` (descartada ou excluída fica marcada, não sai); `fato_sprint_filho` append-only com gatilhos de UPDATE, DELETE e TRUNCATE, idempotente por `UNIQUE (sprint_id, filho_id)` com `ON CONFLICT DO NOTHING`; índices em `filho_id` e `coleta_id`, e o `UNIQUE` cobre o `sprint_id` do JOIN da leitura. Só ids, instantes e um booleano; o nome exibido é `Sprint <id>`, o título nunca é lido. `down` presente.
- **GRANT:** coletor SELECT/INSERT/UPDATE/DELETE em `dim_sprint` e SELECT/INSERT em `fato_sprint_filho`; `dspd_api` só SELECT nas duas. Fronteira e GRANT ficam com o parecer do `security-engineer`; a 0042 no `deploy/sql` e o caminho da VM, com o do `devops-engineer`.
- **M1 do parecer de UX** (barras e tabela abaixo de 20): não acontece; com dado real e menos de 20 sprints a biblioteca devolve `sprints: []` (`t8.ts`, `publicadas`), e o teste "abaixo de 20 sprints no recorte não publica estatística" trava isso.

## Desvio de escopo (fotografia de contrato, e2e, deploy/sql, checksums, mock)
**Aceitável.** Todos são consequência mecânica do comportamento pedido, sem regra nova: a fotografia `docs/contratos/snapshots/resultados/T8.json` acompanha os dois campos opcionais do contrato; o `e2e/tests/complementares.spec.ts` tira o T8 do conjunto com selo "Dados fictícios" porque ele saiu do mock (`origem.ts`); `deploy/sql/0042_bm_sprint.sql`, `consolidado.sql` e `9000_grants.sql` são gerados por `pnpm run db:sql` a partir da migração; `checksums.json` é obrigatório para a migração nova; o mock só estreita o tipo (`inicio`/`fim` agora anuláveis). O pedido deveria tê-los declarado no E7.499; é falha de declaração, não de entrega.

## Ferramentas, suíte e mutante
- Sem PR para a branch: a suíte inteira fica para o CI do PR; não afirmo CI verde neste head. PQ do autor: `pronto rc=0` em `3cd6fc83` (Histórico do pedido, 12:52); a renumeração `453348a2` não traz pronto novo.
- `server/tests/migracoes.estatico.test.ts` (numeração sequencial) falha até a 0041 do T3 entrar na develop: esperado, não é defeito do T8. Ordem de merge: T3 antes do T8.
- Rodei os testes novos: `packages/metricas/src/businessmap/t8.test.ts` 9 passam; `server/tests/normalizador-businessmap.test.ts` e `painel-real-f6.test.ts` 152 passam. O `projetor-sprint.pg.test.ts` fica com o QA (test:pg descartável).
- Mutante: teto `length > 30` trocado por `>= 30` em `t8.ts:54`: 1 teste falha (S34, 30 dias úteis exatos). Morto.
- O `docs/engineering/praticas.md` não traz regra "decidida por" que alcance estes arquivos.
- Tamanho (M14): 1127 linhas, acima da orientação de 150. Não há PR agora; quando houver, o corpo leva `teto: excedido, <n> linhas, <motivo>` (coletor, migração, biblioteca e cartão de um comportamento só).

## Detalhe do A1
`t8.ts:68` chama `janelaValida` (que incrementa `acimaDoTeto`) e só depois testa a sobreposição com o período. Com as 793 sprints da análise, o cartão de 12 semanas mostraria centenas de sprints fora da conta ao lado de poucas no recorte. A sprint acima do teto tem as duas datas: aplique o recorte (sobreposição da janela com o período) antes de contá-la. Para `semDatas` não há janela para recortar; a sprint com só o primeiro início (em andamento) poderia ser recortada por ele, mas isso é regra de negócio: não decida no código, leve ao dono pelo Jarvis e mantenha o comportamento atual até a resposta.

## Sondas
- S1 · `calcularT8` real, período `12s`, uma sprint de 02/03 a 14/04/2026 (31 dias úteis) com filho · espera: `acimaDoTeto: 0` · obtido: `acimaDoTeto: 1`, `sprintsNoRecorte: 0`

## Achados
- A1 (bloqueante) packages/metricas/src/businessmap/t8.ts:57 · "acima do teto" é contado antes do recorte pelo período: a nota soma sprints de todo o histórico e `sprintsNoRecorte` só as do período (S1). Recorte antes de contar e trave com teste em `12s`.
- A2 (recomendado) web/src/features/complementares/previsao.tsx:149 · `nSprints < 20` repete o mínimo à mão; use `MINIMO_AMOSTRA` de `@metricas-dspd/contratos`, como o `AmostraInsuficiente`.
- A3 (recomendado) web/src/features/complementares/previsao.tsx:183 · a legenda ainda diz "abaixo de 20 itens só k de n", regra do dado fictício; com dado real a conta é de sprints (mesmo ponto do B1 da UX).
- A4 (recomendado) server/tests/migracoes.estatico.test.ts:48 · o comentário da contagem diz "0041 (105, E7.499)"; depois da renumeração é a 0042.
