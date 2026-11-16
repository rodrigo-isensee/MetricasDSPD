---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-t9-real
commit: 6b772b00710434dea455a6675af68b3c9262a121
parecer: reprovado
resultado: reprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-16
---
# QA: T9 avanço real e escopo com dado real (E7.68, PR 483)

Sem especificação de UX nova. Os critérios vêm da decisão do dono (D-T9 "A") e do brief; `CA-n` abaixo são as obrigações nomeadas.

## Achados
- A1 (bloqueante) packages/metricas/src/businessmap/t9.test.ts:41 · mutante sobrevivente: trocar `criado_em > inicioProjeto` por `>=` (t9.ts:43) passa os 7 testes. Falta o teste da fronteira: frente criada no mesmo instante do início do projeto conta como original.
- A2 (recomendado) packages/metricas/src/businessmap/e5.ts:36 · o E5 ainda lê `adicionado_apos_inicio_pai`, coluna que o T9 deixou de usar e que a própria suíte trata como nunca gravada (false). T9 e E5 podem dizer "frentes adicionadas" com números diferentes. Fora do escopo do PR; vira cartão.

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| CA-1 adicionada = frente criada depois do início do projeto; criada antes conta como original | t9.test.ts "frente criada antes do início..." | antes x depois do início; fronteira de igualdade NÃO coberta (A1) | parcial |
| CA-2 não lê `adicionado_apos_inicio_pai` | t9.test.ts "não lê adicionado_apos_inicio_pai" | coluna false não zera | passou |
| CA-3 projeto sem início fora da tabela e contado (`projetosSemInicio`); sem frente não conta | t9.test.ts "projeto sem início..." | início nulo; projeto vazio | passou |
| CA-4 avanço pelas frentes filhas, sem story | t9.test.ts "o avanço sai pelas frentes filhas..." | story filha ignorada | passou |
| CA-5 censo por projeto, sem estatística agregada, igual com 19 e 20 projetos | t9.test.ts it.each [19, 20] | 19/20 | passou |
| CA-6 versão de critério afeta o T9, com data | t9.test.ts "a versão de critério..." | n/a | passou |
| CA-7 T9 em `METRICAS_ORIGEM_REAL` e na tela de origem | origem.test.ts (contratos), web origem.test.tsx, qa-f6-painel, painel-real-f6 | métrica mock x real | passou |
| CA-8 nota do cartão (singular e plural de projetos sem início) | web ramos.test.tsx | 1 x 2+ projetos | passou |
| CA-9 contrato (openapi, snapshot, T9.md) acompanha `projetosSemInicio` | contratos/snapshot, openapi check do CI | campo opcional | passou (CI) |

## Cenários e resultado real
- Suíte inteira: CI do mesmo sha 6b772b00, run 43840512709 (push), conclusão success (jobs seguranca, build, imagem, openapi, filtro, rapida, testes, e2e, perf). O run do PR (43840521762) ainda estava em andamento quando fechei; não o uso.
- Local, meus cenários: `packages/metricas` t9.test.ts 7 de 7; web `ramos.test.tsx` e `origem.test.tsx` 36 de 36; server `painel-real-f6` e `qa-f6-painel` 55 de 55.
- E2E que mostra o T9 (chromium, local): `b12-fluxo.spec.ts` TAT-10 (T9: k de n frentes, escopo cresceu, ordenado) passou; `intensivo-sistemico.spec.ts` SIS-CONS-04 (Visão geral x cartão do T9) passou.
- Acessibilidade: a mudança de interface é um parágrafo de texto (`t9-nota-escopo`); sem controle novo, sem teclado novo. Sem verificação automática própria além do e2e do painel.

### Vermelho antes do verde
`forge-testes --vermelho ffc59d8a` saiu sem veredito útil (rc 0 impresso por pipe, mas a saída diz `nenhum teste prova a mudança`: "o mapa não sabe (packages/contratos/src/origem.test.ts sem mapa); suíte completa", `módulos=` vazio, `contagem: nenhum teste`). Não conta como vermelho. Fallback manual, na minha worktree: `t9.ts` trazido para a base ffc59d8a com os testes do head mantidos: `Failed Tests 5` em t9.test.ts (entre eles "frente criada antes do início conta como original..." com `expected ... to match object { totalFrentes: 4, originais: 2, ...}`, "não lê adicionado_apos_inicio_pai" e "projeto sem início fica fora da tabela"). Restaurado, árvore limpa.

### Mutação no diff (um por vez, restaurado a cada rodada)
| Mutante | Resultado |
|---|---|
| M1 `criado_em >= inicioProjeto` (frente no mesmo instante vira adicionada) | SOBREVIVE: 7 de 7 passam (A1) |
| M1b `criado_em < inicioProjeto` (regra invertida) | morto: 2 falhas (it.each 19 e 20) |
| M2 projeto sem início contado mesmo sem frente | morto: 1 falha |
| M2b projeto sem início entra na tabela (filtro `>= 0`) | morto: 1 falha |
| M3 volta a ler `adicionado_apos_inicio_pai` | morto: 4 falhas |
| M4 avanço lendo story em vez de frente | morto: 6 falhas |
| M5 projeto sem início tratado como com início | morto: 1 falha |

Observação: M1b morre só nos testes de fronteira 19 e 20 (o teste principal e o de "criado antes" não pegam a inversão sozinhos em todos os casos); a lacuna de igualdade é a mesma classe de A1.

## Parecer
Reprovado por A1 (mutante sobrevivente, bloqueante). Correção: um teste em `t9.test.ts` com frente `criado` igual ao `iniciado` do projeto, esperando `originais: 1, adicionadas: 0` (a regra escrita é "depois", estrito). Aceite do restante: sem outro bloqueio; reteste com `forge-check parecer delta docs/qa/105-t9-real.md`.
