---
tipo: qa
contrato: 1
pedido: 075-bloqueios-reais
branch: feature/075-l1b-leitura
commit: 0af840f66c10d7136766800eacf025f055c0856f
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-06
---
# QA: lote 1b do pedido 075, leitura "não classificado" (K-204)

Aprovado. O lote não tem critério de aceite de UX próprio (CA-n do pedido tratam de tela e do lote 5); as obrigações vêm da seção "Lote 1b" do plano 075 e do P-075-3 e P-075-8 do dono. Diff `da61dbc2...0af840f6`, 6 arquivos.

## Achados

- A1 (recomendado) packages/metricas/src/businessmap/o19.ts:12 · O comentário tem dois parênteses seguidos; juntar na próxima mexida (o review já registrou). Sem volta.
- A2 (recomendado) packages/metricas/src/businessmap/bloqueios.test.ts:60 · Falta teste do O19 com um bloqueio "não classificado" somando ao total e à linha 8; conferi à mão (A2 abaixo em Ferramentas) e passa. Cobrir junto do lote 5a ou 4b.

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Plano 1b: motivo desconhecido sai "não classificado" (P-075-3) | `server/tests/metricas.mapa.test.ts:51` (`'Fornecedor'`) | texto fora dos 7 | passou |
| Plano 1b: motivo vazio e nulo | `metricas.mapa.test.ts:51` (`''`, `null`) | vazio | passou |
| Plano 1b: texto de pessoa nunca sai (controle 2) | `metricas.mapa.test.ts:51` (`MARCADOR-PESSOA-075`) | marcador de pessoa | passou |
| Motivo do domínio passa intacto | `metricas.mapa.test.ts:51` (`Janela de mudança`) | motivo válido | passou |
| Plano 1b: O19 lista 8 linhas, "não classificado" por último | `bloqueios.test.ts:63-77` (ordem, `toHaveLength(8)`, índice 7) | ordem e tamanho | passou |
| O19 sem dados: 8 motivos zerados | `bloqueios.test.ts:194` | base vazia | passou |
| O19 pela rota: 8 motivos e schema válido | `server/tests/metricas.test.ts:201` | enum de 8 | passou |
| O19 sobre o mock: 8º com 0 e soma de pct até 100% | `bloqueios.test.ts:348`, `qa011-fase1.test.ts:352` | pct somado | passou |
| P-075-8 (E4): "não classificado" soma ao total | ad hoc na cópia, sem teste no lote (A2) | total e linha 8 | passou (ad hoc) |

## Conferência contra o plano
- `bloqueioDe` (`mapa.ts:62-68`): só devolve o valor lido se igual, exato, a um dos 7; o resto sai `MOTIVO_NAO_CLASSIFICADO`. Nunca o texto lido.
- O19 (`o19.ts:26`): itera `MOTIVOS_BLOQUEIO_PUBLICADOS`; `total` e `totalDiasUteis` vêm de todos os encerrados, sem filtro por motivo, então o "não classificado" entra no total (P-075-8).
- `git diff --stat` do intervalo em `t12.ts`, `packages/contratos` e `server/src/modulos/businessmap` (inclui `allow-list.ts` e `coleta.ts`): vazio, sem diferença.

## Ferramentas
- Suíte: CI do push no head do código, `gh run view 42258362444`: `{"conclusion":"success","headSha":"0af840f66c10d7136766800eacf025f055c0856f"}`. Não rodei a suíte inteira (a CI é a prova, por brief).
- Testes dos arquivos tocados, 2 workers, na worktree: `packages/metricas` 2 arquivos, 63 testes verdes; `server` (`metricas.mapa.test.ts`, `metricas.test.ts`) 2 arquivos, 77 testes verdes.
- Vermelho (cópia em `/tmp/claude-1000/qa-engineer-075-l1b/`, código da base `da61dbc2` com os testes do head): `packages/metricas`: 4 falham, 59 passam (`bloqueios.test.ts` 3: ordem do O19, base vazia com 7 em vez de 8, alvo do mock sem o 0 final; `qa011-fase1.test.ts` 1: 7 em vez de 8). `server/tests/metricas.mapa.test.ts`: o teste novo falha com `expected 'Fornecedor' to be 'não classificado'`, 1 falha e 8 passam. O `metricas.test.ts` do servidor precisa de banco e ficou com a CI. No head os mesmos testes passam.
- Ad hoc (A2): na cópia, com o `o19.ts` do head, bloqueio "não classificado" (2 dias) e outro de "Janela de mudança" (3 dias): `base.n` 2, `totalDiasUteis` 5, linha 8 com 1 bloqueio e 2 dias, soma das linhas 5. Passou; o teste ad hoc não entra no lote.
- Mutação: o lote não toca `bin/`, `hooks/` nem controle do Forge; não se aplica. Acessibilidade e E2E: sem tela neste lote.
- Segurança e review: pareceres aprovados na branch (`docs/security/075-l1b-leitura.md`, `docs/reviews/075-l1b-leitura.md`), no mesmo commit de código.

## Cenários e resultado real
Sem bug aberto. Sem teste pulado. Limite: `metricas.test.ts` do servidor, no vermelho, não rodou sem banco.
