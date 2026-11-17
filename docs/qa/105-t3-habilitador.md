---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: feat/105-t3-habilitador
commit: dbf457a1bb79ff1d76b9f090def832c067fa8cd9
parecer: aprovado
resultado: aprovado; 1 achado recomendado (A1, Iniciativa sem teste) e 1 baixo (A2, texto)
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-17
---
# QA: Habilitador em todo o painel e T3 real (pedido 105, E7.516)

Diff conferido contra `6fb535ed` (84 arquivos): tipo Habilitador (`comum.ts`, filtros, origem), T3 com quatro fatias (`t3.ts`, `CartaoT3.tsx`, schema), versão de critério T2.6 (`criterios.ts`), migração 0041 e `deploy/sql`, contratos e snapshots. Decisão do dono: T3 = A (fatia pelo tipo do card, sem acordado, desvio nem selo; fatia com menos de 20 mostra só a contagem).

## Critério → teste → resultado

| Obrigação | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Quatro fatias pelo tipo, Bug interno fora, Dívida técnica + Melhoria juntas, sem olhar projeto | `fixtures.cobertura.test.ts` "T3: quatro fatias pelo tipo…" | Bug interno (30 itens) fora do total 88 | passa; cai na base |
| Contrato sem acordado, desvio nem statusMeta | "T3: o contrato não traz acordado…" | chaves exatas | passa; cai na base |
| Percentual só a partir de 20 itens (total) | "T3: fronteira de 19 e 20 itens…" | 19 × 20 | passa; cai na base |
| Fatia < 20 mostra a contagem, sem pct de itens nem de tempo, sem juntar | "T3: fatia com menos de 20 entregas…" | 19 na fatia, 0 na fatia vazia | passa; cai na base |
| Tela: quatro fatias, sem acordado/desvio; lista só com contagem; leitura avisa soma abaixo de 100% | `tatico.test.tsx` e `ramos.test.tsx` (T3) | fatia abaixo de 20; status insuficiente | passa |
| Habilitador no filtro Tipo e no mapa tipo ↔ categoria | `tipo-card.test.ts`, `origem.test.ts`, `contratos.test.ts` | categoria nova | passa |
| T2.6: versão de critério `criterio-2026-11-17-habilitador-t3` | suíte de critérios/conferência (metricas, server) | data e métricas afetadas | passa |
| Migração 0041 (CHECK com sete valores, checksum, down) | `server/tests/migracoes.ts` no test:pg | CHECK aceita `habilitador` | passa (351 testes) |
| Tipo Iniciativa → fatia Produto | nenhum | n/a | sem prova (A1) |

## Vermelho antes do verde
`t3.ts` de `6fb535ed` posto sobre o head, `vitest run src/businessmap/fixtures.cobertura.test.ts` (metricas): 4 falham, 32 passam (os quatro T3 acima). Árvore restaurada (`git checkout`, status limpo).

## Mutação no diff (à mão, arquivo restaurado a cada um)
- M1 `Habilitador: 'Produto'`: morreu (2 falhas).
- M2 `fatiaOk = ok` (sem o mínimo de 20 por fatia): morreu (1 falha).
- M3 `Melhoria: 'Produto'`: morreu (2 falhas).
- M4 `Iniciativa: 'Habilitador'`: sobreviveu (36 de 36).

## Execução (Postgres descartável, fila de suíte; fora do sandbox porque a worktree não é gravável nele)
- `pnpm run test:pg`: 52 arquivos, 351 testes passam (rc 0). Sobe o próprio Postgres; não usa a base local.
- contratos 240, metricas 1486, mock 263 e web 1909 testes passam, todos pela fila (`scripts/suite-unica.sh`, rc 0); nenhum teste estourou por carga.
- E2E (`TAT-05`) não rodei: fica para o CI. Suíte inteira do PR no CI, sem PR ainda: não afirmo CI verde.

## Achados
- A1 (recomendado) packages/metricas/src/businessmap/t3.ts:19 · o mapeamento `Iniciativa: 'Produto'` não tem teste: o mutante `Iniciativa: 'Habilitador'` sobrevive. Afirmar uma entrega Iniciativa na fatia Produto.
- A2 (recomendado) changelog.d/feat-105-t3-habilitador.md:4 · texto diz "Débito técnico + Melhoria"; o tipo se chama "Dívida técnica". Corrigir a palavra no fragmento.
