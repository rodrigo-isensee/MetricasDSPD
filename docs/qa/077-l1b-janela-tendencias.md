---
tipo: qa
contrato: 1
pedido: 077-tendencias-dado-real
branch: feature/077-l1b-janela-tendencias
commit: d5f6981e4aee058f839820d587c7e95409069437
parecer: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-07
---
# QA: 077 lote 1b, as tendências aplicam a janela incompleta (E2.3, K-211)

Código testado: `d5f6981e`. O HEAD `73bbff16` só soma `docs/reviews/077-l1b-janela-tendencias.md`. Obrigação: `docs/analises/077-desenho.md` (§3 regra da janela, "Lote 1b") e `docs/ux/077-tendencias.md` (CA-1, CA-3, CA-4). Este lote não toca servidor, tela nem contrato.

## Escopo
- Dentro: `historicoDesde?` em `ContextoBM` e `ContextoAC`; as duas `tendencia.ts` chamam `janelaIncompleta` com a janela que já calculam.
- Fora: leitura do `historicoDesde` na carga (Lote 3a), tela (4a, 4b), E2E e acessibilidade (sem mudança de tela).
- Escopo conferido contra o diff `e89ae3f3..d5f6981e`: 4 arquivos de código e `tendencia.test.ts`; `packages/contratos`, `server/`, `web/` e `aceitas.json` sem diferença; sem migração nem mudança de schema.

## Critério → teste → resultado
| Obrigação | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| CA-1 fluxo: 30 itens, janela incompleta, sem estatística, com a data, schema válido, nunca zero | `tendencia.test.ts` "fluxo: 30 itens e janela incompleta..." | mês marcado com 30 itens (acima do mínimo) | passou |
| CA-1 sustentação: idem (volume 30 preservado) | "sustentação: 30 chamados e janela incompleta..." | mês marcado com contagem | passou |
| CA-4 fluxo e sustentação: 14 itens, só a marca, lista vazia | os dois casos "14 ... só trazem a janela incompleta" | abaixo de 20 com janela incompleta | passou |
| CA-3 fluxo e sustentação: janela completa com 19 segue `insuficiente` n=19, sem marca | os dois casos "janela completa com 19" | 19, logo abaixo do limite | passou |
| Sem `historicoDesde` = resultado de hoje | os dois casos "sem historicoDesde o resultado é o de hoje" | campo ausente | passou |
| Cada ponto = `calcularO3` sem `historicoDesde` | propriedade existente, `tendencia.test.ts:305` | campo ausente | passou |
| Contagens do mês iguais com e sem `historicoDesde`, mês a mês (A2 do review) | verificação minha em cópia descartável (abaixo); o teste do lote compara por relação com setembro | n = 0, 14, 19, 30; data antiga e futura | passou |
| BusinessMap e Acelerato nunca misturados | leitura do diff: o campo vive em cada contexto e só a tendência da própria fonte o lê | n/a | passou |

## Execução
- `packages/metricas/src/tendencia.test.ts`, `--maxWorkers=2`: 31 passaram, 0 falharam.
- Suíte completa: CI do push no head do código, run 42335758291, `headSha` `d5f6981e4aee058f839820d587c7e95409069437`, `conclusion` `success` (`gh run view`). Não rodei a suíte inteira local.

## Vermelho antes do verde
Cópia em `/tmp/claude-1000/qa-engineer-077-l1b/w` (código do head, os quatro arquivos de código voltados à base `e89ae3f3`, testes do head; worktree intacta). Resultado: 4 falham, 27 passam.
- Falham: fluxo CA-1, fluxo CA-4, sustentação CA-1, sustentação CA-4.
- Passam na base e no head, como guarda de regressão: CA-3 e "sem historicoDesde = de hoje" nas duas fontes (a base já se comportava assim; prova que o lote não mudou o caminho antigo).

## Mutação à mão (cópia descartável, cada mutante contra os 31 testes)
| Mutante | Mortos por |
|---|---|
| M1 fluxo: marca sem esvaziar `p85PorTipo` | fluxo CA-1 e CA-4 |
| M2 fluxo: `incompleta` verdadeira sempre que há `historicoDesde` | fluxo CA-1 e CA-3 |
| M3 sustentação: marca sem esvaziar `prioridades` | sustentação CA-1 e CA-4 |
| M4 sustentação: `incompleta` verdadeira sempre que há `historicoDesde` | sustentação CA-1 e CA-3 |
Nenhum sobrevivente.

## Verificação da A2 do review (cópia descartável, não vai ao repositório)
Teste extra na cópia: para n em 0, 14, 19 e 30, `concluidos` (fluxo) e `volume` (sustentação) mês a mês, e `janelaPercentis`, iguais com e sem `historicoDesde 2026-06-10`; `historicoDesde 2000-01-01` não marca nenhum mês; `2099-01-01` marca todos, todos sem estatística. 33 passaram (31 do lote mais 2 meus).

## Bugs
Nenhum aberto.

## Achados
- A1 (recomendado) packages/metricas/src/tendencia.test.ts:386 · a igualdade das contagens por mês com e sem `historicoDesde` não está afirmada direto no teste do lote (só por relação com setembro); provei em cópia, vale levar ao teste.
