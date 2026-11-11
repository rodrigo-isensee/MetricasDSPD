---
tipo: qa
contrato: 1
pedido: 075-bloqueios-reais
branch: feature/075-l6b-publicacao-real
commit: bd76128a9fde6822f9e126ceaf4c24462fc7b865
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-11
---
# QA: 075-bloqueios-reais, lote 6b (publicação real de BLOQUEADOS, O1, O2, O5 e O19, K-204)

Contrato: plano `docs/analises/075-plano.md` (Lote 6b) e o achado A2 do parecer do 6a. Diff `129fc3d5..bd76128a`: 15 arquivos, 318 inserções e 158 remoções. Os commits depois de `bd76128a` só trazem pareceres de outros papéis; este parecer não criou nem mudou teste. A suíte inteira e o E2E de API (`e2e/tests-api/bloqueio-sem-dado-065.spec.ts`, mudado no diff) não rodaram aqui: vão ao CI do PR (check-run `bateria` do mesmo sha e run do PR em rascunho, TL-A6).

## Achados
Nenhum.

## Execução (2 workers, `TZ=UTC`)
- `server/tests/painel-real-f6.test.ts`, `corte-serie-o1-075.test.ts`, `qa-f6-painel.test.ts`: 3 arquivos, 48 testes, todos passam.
- `packages/contratos/src/origem.test.ts`: 17 testes, passam.
- Web (`coleta/origem.test.tsx`, `coleta/simulado.test.tsx`, `operacional/bloqueio-sem-dado.test.tsx`): 3 arquivos, 36 testes, passam (o caminho do terceiro está em `web/src/features/operacional/`, não em `painel/`).

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| CA-075-11 (nenhuma chave de pessoa) | `painel-real-f6` S6 (BLOQUEADOS, O1, O2, O5, O19, todas as chaves em qualquer profundidade) | campos de pessoa | passa |
| O5 abaixo de 20 sem percentil | S4 (menos de 20 itens por tipo; contrato O5 valida) | mínimo de 20 | passa |
| O19 abaixo de 20 sem percentil e sem percentual; 8 motivos, "não classificado" por último | S5 (contrato O19 valida) | mínimo de 20, 8º motivo | passa |
| Marca da versão de critério no O1 e no O5 (A2 do 6a) | `corte-serie-o1-075` (O1 e O5, data 2026-11-01 dentro do período; período anterior sem marca) e S10 (O1, O2, O5, O19, BLOQUEADOS; O3 sem marca) | data dentro e fora do período | passa |
| O1 real ligado (A1 do 6a) | S2 e S2b (série null antes de 2026-11-01, número a partir dela; sem a nota) | data de corte | passa |
| T10 e T12 fora com `fato_bloqueio` real | S7 e `origem.test.ts` (fora de `METRICAS_ORIGEM_REAL`, motivo genérico) | mapa de origem | passa |
| Nota `bloqueio-sem-dado-real` não emitida; reversão pelo interruptor | S9 e S9b | interruptor | passa |
| Mock explícito inalterado | S8 | modo mock | passa |

## Mutação (restaurada; `git status` limpo no código depois)
- M1, `BLOQUEIOS_COM_DADO_REAL = true` para `false` em `packages/contratos/src/origem.ts`: 5 testes caem (S2, S2b, S3, S9 e o caso de O1 por limite da coluna de `painel-real-f6`). Pega.
- M2, `DATA_BLOQUEIO_COM_DADO_REAL` de `'2026-11-01'` para `'2099-12-31'` em `packages/metricas/src/core/criterios.ts`: 3 testes caem (caso de `corte-serie-o1-075`, S2b, S10). Pega.

## Conferência
- Fora do diff, como pedido: `EXPAND_COLETA`, `stg_bloqueio`, migração; T10, T12 e `MOTIVO_ORIGEM_MOCK` deles não mudam (`origem.ts` só remove BLOQUEADOS e O5 do motivo mock).
- `servico.ts` só muda comentário (o ramo de `semParteDeBloqueio` segue atrás do interruptor; `comCorteDaSerieO1` segue chamado). Data real vem de uma constante só.
- Pendência fora do escopo do QA: a data 2026-11-01 e a prova do dono (`fato_bloqueio` > 0) vêm do Histórico do pedido; não conferi a base (proibido).
