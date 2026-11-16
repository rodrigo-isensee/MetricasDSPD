---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-ei-sust
commit: 7614d58aed67c844cc454ccf9a2908f6adf287d9
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-16
---

# QA: EI_SUST com dado real (105, E7.243)

parecer: aprovado, com 2 achados recomendados (A1, A2) que não bloqueiam. A regra entregue confere com as decisões do dono P-EI-1 B e P-EI-2 A e com a suposição P-EI-3; os testes novos ficam vermelhos na base e 5 de 5 mutantes morrem. Limite do parecer: não li a base real do Acelerato (credenciais ficam em `.env`, fora do meu acesso); "dado real" aqui é o caminho de leitura real (mapa de origem, API, pg) com fixture de nomes de etapa do domínio.

## Escopo e diff contra a obrigação
Diff `57989aa0..7614d58a` (26 arquivos): `ei.ts`, `totalizadores.ts` (`classeDaEtapaEI`), `schemas.ts` (campo opcional `composicao`), `origem.ts` (EI_SUST sai do mock), critério `105:EI_SUST`, nota do cartão, contrato, OpenAPI, snapshots e testes. Sem especificação de UX própria: as obrigações são as decisões do dono e o brief.

## Critério, teste e resultado
| Obrigação | Teste | Resultado | Fronteira protegida |
|---|---|---|---|
| P-EI-1 B: cliente = soma de porEtapa sem as finais; time = cliente menos esperas da D5a e fila inicial | `ei-sust.test.ts` "cliente = etapas sem as finais..." (cliente 4, time 2, índice 50) | verde; mutantes M1, M2 mortos | finais fora; fila inicial subtraída |
| P-EI-2 A: Concluído, Encerramento, Causa Raiz, Revisão fora das duas visões, contadas | mesmo teste (`finais`) e `classeDaEtapaEI` | verde | final contado, não zero |
| Etapas não decididas contam como tempo do time, contadas | testes 1 e 4 (`naoDecididas`, ordem estável) | verde; M4 morto | Equipe Interna, Aprovação, Mudança, Data Acordada |
| `composicao` opcional, só somas e contagens | teste 1; schema Zod `.optional()`; `painel-real-f6.test` valida `SCHEMAS_RESULTADO` | verde | ausente nos níveis do BusinessMap (snapshots FL1 a FL3 só ganham o campo opcional) |
| Versão de critério `105:EI_SUST` | `criterios-acelerato.test.ts` (8 entradas, métrica EI_SUST) | verde | idempotência |
| Abaixo de 20 não publica | teste 2 (P2 com 12: `insuficiente`; P3 com 20: `ok`) | verde | 19/20 por prioridade |
| Chamado sem tempo por etapa fora e contado | teste 3 (`semEtapas` 2) | verde; M5 morto | vazio e só-finais |
| Só Acelerato, sem mistura | `fonte: 'Acelerato'`; `origem.test` e `qa-f6-painel.test` | verde | origem real só SUST |
| Mediana pela biblioteca (T2.5) | `estatisticaEspera`/`pontoEspera` de `core/espera` | conferido no código, sem cálculo próprio | n/a |
| Aguardando Validação conta como espera (D5a) | `classeDaEtapaEI` e M3 | verde; M3 morto | caixa "Validação" |

## Vermelho antes do verde (manual: a árvore tinha um arquivo não versionado de outro dono, e `forge-testes --vermelho` exige árvore limpa)
Comando: `git checkout 57989aa0 -- src/acelerato/ei.ts src/acelerato/totalizadores.ts` e `vitest run src/acelerato/ei-sust.test.ts`, depois restaurado ao HEAD.
Saída: `ei-sust.test.ts (5 tests | 5 failed)`; por exemplo `expected 1 to be close to 4`, `expected undefined to be 32`, `expected 22 to be 20`. No HEAD: 29 testes verdes nos três arquivos de `acelerato` (ei-sust, acelerato e o scratch).

## Mutação no diff (à mão, 5 mutantes, cada um restaurado)
| Mutante | Testes que caíram |
|---|---|
| M1 etapas finais entram no cliente (`case 'final'` removido) | 2 |
| M2 fila inicial não subtraída do time | 2 |
| M3 Aguardando Validação fora da espera | 1 |
| M4 não decidida vira espera | 3 |
| M5 `cliente <= 0` para `< 0` | 1 |
Sobreviventes: 0.

## CI do head
Run `43933986407` (push no sha 7614d58a): `imagem`, `filtro`, `seguranca`, `openapi`, `rapida`, `build` e `banco` (pg de `painel-real-f6` e `qa-sust-real`) verdes; `testes`, `e2e` e `perf` ainda em execução quando fechei. Não há PR, então não existe check `bateria`; este parecer não afirma CI verde. O autor não fechou rodada completa do `pronto` depois da última correção: o fechamento depende desse run.

## Achados
- A1 (recomendado) packages/metricas/src/acelerato/ei.ts:53 · `composicao.finais.horasUteis` soma etapa final aberta até hoje (indice.ts:78) e muda com o dia: Concluído sem saída, 2016 h em 30/09 e 3192 h em 09/10. A estatística não muda. Conferir na base real; se sim, contar só chamados.
- A2 (recomendado) packages/metricas/src/acelerato/ei.ts:66 · `naoDecididas` chaveia pelo nome cru: "Aguardando Equipe Interna" e "aguardando equipe interna" saem como duas linhas em `composicao.naoDecididas.etapas`, embora `classeDaEtapaEI` normalize a caixa. Normalizar a chave do mapa (e exibir um nome canônico).

## Fora do que li
Interface (cartão e nota): a revisão de UX é de outra etapa; só conferi o texto de `notas.ts` contra a regra (confere). Acessibilidade sem mudança de componente.
