---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: feat/105-t3-habilitador
commit: 15ae9f406d1ca5941272bd6b8807b9af0f919cb1
parecer: aprovado
resultado: aprovado; A1 e A2 seguem só recomendados
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-17
---
# QA: Habilitador em todo o painel e T3 real (pedido 105, E7.516 e E7.524)

Diff conferido contra `6fb535ed` (84 arquivos): tipo Habilitador (`comum.ts`, filtros, origem), T3 com quatro fatias (`t3.ts`, `CartaoT3.tsx`, schema), versão de critério T2.6 (`criterios.ts`), migração 0041 e `deploy/sql`, contratos e snapshots. Decisão do dono: T3 = A (fatia pelo tipo do card, sem acordado, desvio nem selo; fatia com menos de 20 mostra só a contagem).

## Critério → teste → resultado

| Obrigação | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Quatro fatias pelo tipo, Bug interno fora, Dívida técnica + Melhoria juntas, sem olhar projeto | `fixtures.cobertura.test.ts` "T3: quatro fatias pelo tipo…" | Bug interno (30 itens) fora do total 88 | passa; cai na base |
| Contrato sem acordado, desvio nem statusMeta | "T3: o contrato não traz acordado…" | chaves exatas | passa; cai na base |
| Percentual só a partir de 20 itens (total) | "T3: fronteira de 19 e 20 itens…" | 19 × 20 | passa; cai na base |
| Fatia < 20 mostra a contagem, sem pct de itens nem de tempo, sem juntar | "T3: fatia com menos de 20 entregas…" | 19 na fatia, 0 na fatia vazia | passa; cai na base |
| Tela: quatro fatias, sem acordado/desvio; lista só com contagem; leitura avisa soma abaixo de 100% | `tatico.test.tsx` e `ramos.test.tsx` (T3) | fatia abaixo de 20; status insuficiente | passa |
| Total >= 20 com todas as fatias abaixo de 20: frase no lugar do gráfico vazio | `tatico.test.tsx` "total >= 20 com todas as fatias abaixo de 20" | nenhuma fatia publicada | passa (revalidação) |
| Habilitador no filtro Tipo e no mapa tipo ↔ categoria | `tipo-card.test.ts`, `origem.test.ts`, `contratos.test.ts` | categoria nova | passa |
| Habilitador com marca (cor e padrão) própria, sem repetir (WCAG 1.4.1) | `graficos.test.tsx` "nenhum tipo repete a marca…" | 9 tipos, 9 marcas | passa (revalidação) |
| T2.6: versão de critério `criterio-2026-11-17-habilitador-t3` lista toda métrica com filtro Tipo mais as segmentadas; O13, O18, O27 fora | `criterios.habilitador.test.ts` (3) | só-bug fora da lista | passa (revalidação) |
| Migração 0041 (CHECK com sete valores, checksum, down) | `server/tests/migracoes.ts` no test:pg | CHECK aceita `habilitador` | passa (351 testes) |
| Tipo Iniciativa → fatia Produto | nenhum | n/a | sem prova (A1) |

## Vermelho antes do verde
`t3.ts` de `6fb535ed` posto sobre o head, `vitest run src/businessmap/fixtures.cobertura.test.ts` (metricas): 4 falham, 32 passam (os quatro T3 acima). Árvore restaurada (`git checkout`, status limpo).

## Mutação no diff (à mão, arquivo restaurado a cada um)
- M1 `Habilitador: 'Produto'`: morreu (2 falhas).
- M2 `fatiaOk = ok` (sem o mínimo de 20 por fatia): morreu (1 falha).
- M3 `Melhoria: 'Produto'`: morreu (2 falhas).
- M4 `Iniciativa: 'Habilitador'`: sobreviveu (36 de 36).
- M5 (revalidação) tirar `'O6'` de `VERSAO_CRITERIO_HABILITADOR_T3.afeta`: morreu (1 falha em `criterios.habilitador.test.ts`).
- M6 (revalidação) tirar 'Trabalho de produto' de `ORDEM_TIPOS`: morreu (1 falha em `graficos.test.tsx`).

## Execução
Primeira rodada (head dbf457a1; Postgres descartável, fila de suíte, fora do sandbox):
- `pnpm run test:pg`: 52 arquivos, 351 testes passam (rc 0).
- contratos 240, metricas 1486, mock 263 e web 1909 testes passam pela fila (`scripts/suite-unica.sh`, rc 0).

Revalidação (head 15ae9f40, delta de dbf457a1 por `forge-check parecer delta`: lista de métricas da versão de critério, marca única por tipo, frase de nenhuma fatia publicada, changelog, `setup.ts` com timeout 15000 para 5000):
- `criterios.habilitador.test.ts`: 3 passam. `graficos.test.tsx` e `tatico.test.tsx`: 36 passam, já com o timeout de 5000 ms.
- E2E (`TAT-05`) não rodei: fica para o CI. Suíte inteira do PR no CI, sem PR ainda: não afirmo CI verde.

## Achados
- A1 (recomendado) packages/metricas/src/businessmap/t3.ts:19 · o mapeamento `Iniciativa: 'Produto'` não tem teste: o mutante `Iniciativa: 'Habilitador'` sobrevive. Afirmar uma entrega Iniciativa na fatia Produto. Não entrou na volta; segue só recomendado.
- A2 (recomendado) changelog.d/feat-105-t3-habilitador.md:4 · texto diz "Débito técnico + Melhoria"; o tipo se chama "Dívida técnica". Corrigir a palavra no fragmento. Não entrou na volta; segue só recomendado.
