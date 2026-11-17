---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-notas-nao-preenchido
commit: 195952008d1ae404ea27b3749d230706e0bcc845
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-16
---
# QA: 105-notas-nao-preenchido (K-393, E7.413)

Sem especificação de UX nem contrato de API: a obrigação vem do brief e das decisões do dono. Bloqueio sem motivo (nulo, ausente ou vazio) gera `motivo_ausente`; `motivo_codigo_invalido` fica para código fora do catálogo. Campo de lista presente sem seleção (nulo, ausente ou vazio) gera `campo_sem_selecao`; `campo_fora_do_dominio` fica para `desconhecido` ou valor que não é texto. O valor gravado e as métricas não mudam.

## Achados
- A1 (recomendado) server/src/modulos/businessmap/bloqueios.ts:62 · o ramo `trim() === ''` (motivo só com espaços vira `motivo_ausente`) não tem teste: o mutante que tira o `trim()` sobrevive. Nenhum requisito exige; vira cartão, não bloqueia.

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| K-a bloqueio com motivo nulo ou ausente gera `motivo_ausente` | bloqueios.test.ts `CA-075-2` (null, undefined) e `K-393` | nulo e ausente | passou |
| K-b código fora do catálogo gera `motivo_codigo_invalido` | bloqueios.test.ts `K-393` (`texto-livre`) e `CA-075-2` (não numérico, 11 dígitos, 1.5, objeto) | logo fora do padrão `^\d{1,10}$` | passou |
| K-c campo de lista sem seleção (nulo ou vazio) gera `campo_sem_selecao` | normalizador-businessmap.test.ts `K-393` (`''` e `null`, 2 notas); bloqueios.test.ts `CA-075-12` | vazio e nulo | passou |
| K-d `desconhecido` ou não texto gera `campo_fora_do_dominio` | normalizador-businessmap.test.ts (`desconhecido`, não texto, existentes); bloqueios.test.ts `CA-075-12` | valor preenchido fora do domínio | passou |
| K-e valor gravado não muda | os testes acima afirmam `motivoCodigo` e `dim.*` nulos nos dois casos; exploratório abaixo (0 e `'7'` seguem gravando como antes) | n/a | passou |
| K-f métricas não mudam | a nota só entra em `ctl_coleta_contagem` (`projetor.ts:169,240,398`, nome cortado em 40 caracteres: o mais longo, `nota_bloqueio_motivo_codigo_invalido`, tem 36); nenhum painel nem métrica lê nota (grep em `server/src`); projetor-businessmap.test.ts segue verde | nome da contagem | passou |
| K-g docs da conferência | `data-model.md` e `businessmap-causa-raiz-carga.md` citam as duas notas novas; `forge-check docs` sem erro | n/a | passou |

## Cenários e resultado real
- Vermelho antes do verde (projeto, sem `forge-testes`): `git checkout 95fa2879 -- server/src/modulos/businessmap` com os testes do head. 5 falharam de 115 (`CA-075-2` null, `CA-075-2` undefined, `K-393` bloqueio, `CA-075-12`, `K-393` campo); no head nenhum cai. Árvore restaurada ao head.
- Local (head 19595200): `vitest run bloqueios, normalizador-businessmap, projetor-businessmap, allow-list`: 4 arquivos, 173 testes passaram. A suíte inteira fica para o CI do PR; não afirmo CI verde (sem PR ainda).
- Exploratório (script descartável, removido): `blockReasonId` null, undefined, `''` e `'  '` dão `motivo_ausente`, motivo nulo; `0` e `'7'` dão sem nota, motivos `'0'` e `'7'` (igual à base); `'abc'`, 11 dígitos, 1.5 e `{}` dão `motivo_codigo_invalido`, motivo nulo. Campo de lista: null, undefined e `''` dão `campo_sem_selecao`; `desconhecido`, 5 e `{}` dão `campo_fora_do_dominio`; `'ok'` sem nota. O valor gravado é nulo onde era nulo na base.
- Observação fora do diff (herdada, sem mudança): campo de lista só com espaço (`' '`) passa como valor `' '`, sem nota. Não é regressão.
- Mutação no diff (5 mutantes, árvore restaurada ao final):
  - M1 `trim()` removido: sobrevive (A1).
  - M2 sem o teste de nulo e ausente em `bloqueios.ts`: morto (3 falhas).
  - M3 campo vazio fora de `campo_sem_selecao`: morto (2 falhas).
  - M4 `undefined` fora de `campo_sem_selecao`: morto (2 falhas).
  - M5 `motivo_ausente` nunca emitida: morto (3 falhas).
- Testes pg (`projetor-*.pg.test.ts`): não rodados aqui (sem banco na worktree); só a nota `motivo_codigo_invalido` aparece neles e o código dela não mudou.
- Acessibilidade e E2E: n/a, sem interface.
