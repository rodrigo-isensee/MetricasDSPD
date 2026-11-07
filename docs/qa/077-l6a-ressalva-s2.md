---
tipo: qa
contrato: 1
pedido: 077-tendencias-dado-real
branch: feature/077-l6a-ressalva-s2
commit: a8d3fa67dcb31b36f0e50f72471ca912bba64ac9
parecer: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-07
---
# QA: 077 lote 6a, a tendência de SLA leva a ressalva do S2 (E2.3, K-211)

Código testado: `a8d3fa67` (código e testes em `19cdbde6`, artefatos gerados em `a8d3fa67`). O HEAD `98723188` só soma `docs/reviews/077-l6a-ressalva-s2.md`. Obrigação: `docs/analises/077-desenho.md` (§4 e "Lote 6a") e A7 de `docs/analises/077-desenho-revisao-tech-lead.md`. Sem tela nova: não há E2E nem acessibilidade neste lote (a tela é o 6b).

## Escopo
- Dentro: `notas` opcional em `resultadoTendenciaSust`, o ramo `TENDENCIA_SUST` em `semParteDeAjusteDePrioridade` e a ligação em `servico.ts` (`METRICAS_COM_AJUSTE_DE_PRIORIDADE`).
- Fora: tela da ressalva (6b), `TENDENCIA_SUST` no mapa real e prova de ponta a ponta (Lote 7).
- Diff `852b9406..HEAD` conferido: `web/`, `packages/contratos/src/origem.ts`, `server/migrations` e `docs/contratos/snapshots/aceitas.json` sem diferença (`git diff --stat` vazio nesses caminhos).

## Conferência contra o desenho
| Obrigação | Teste ou leitura | Fronteira protegida | Resultado |
|---|---|---|---|
| Nota `excecao-sla-sem-fonte` em `TENDENCIA_SUST`, `meses` intacto, sem repetir na 2a chamada | `painel-real-f6.test.ts` (bloco L9-a, linhas 468-474) | idempotência; resto do resultado igual | passou |
| Nunca em `TENDENCIA_FLUXO` (nem em outra métrica) | mesmo teste: `TENDENCIA_FLUXO` e `S4` devolvem o mesmo objeto | outra fonte; BusinessMap fora | passou |
| Mesma condição do S2 (`real && !AJUSTE_PRIORIDADE_COM_FONTE`) | leitura do diff: a constante junta o id à condição única de `servico.ts:322` | sem regra nova | passou (por leitura, ver A1) |
| Id fora do enum recusado pelo schema | `tendencia-janela.test.ts` (bloco "notas no resultado...") | id inventado | passou |
| Campo ausente continua válido (aditivo) | mesmo teste: `sust({})` sem `notas` passa | campo opcional ausente | passou |
| Sem `aceitas.json` e `docs:check` verde com a fotografia nova | `pnpm run docs:check`: `ok (1067 páginas Markdown, 69 métricas, 2 eventos)`; `aceitas.json` sem diff | classe aditiva | passou |
| Ligação em `servico.ts` conforme a decisão do review | diff: 3 linhas a mais, 1 a menos; constante no molde de `METRICAS_SEM_AGENTE` | n/a | passou |

## Execução
- `server/tests/painel-real-f6.test.ts` e `packages/contratos/src/tendencia-janela.test.ts`, `--maxWorkers=2`, na worktree: 2 arquivos, 39 passaram, 0 falharam.
- CI do push: `gh run view 42364347274 --repo rodrigo-isensee/MetricasDSPD --json headSha,conclusion` devolve `{"conclusion":"success","headSha":"a8d3fa67dcb31b36f0e50f72471ca912bba64ac9"}`. Vale como prova da suíte; não rodei a suíte completa local.

## Vermelho antes do verde
Cópia em `/tmp/claude-1000/qa-engineer-077-l6a/` (head, com `schemas.ts`, `parte-sem-dado.ts` e `servico.ts` voltados à base `852b9406`; worktree intacta): 2 falham, 37 passam.
- Cai na base: `painel-real-f6.test.ts` "L4: a função pura só troca ajustesManuais..." (`expected undefined to deeply equal [ 'excecao-sla-sem-fonte' ]`).
- Cai na base: `tendencia-janela.test.ts` "ausente e id válido passam; id fora do enum é recusado" (`expected true to be false`: sem o campo, o id inventado passava).

## Mutação à mão (cópia descartável)
Como o vermelho prova só a ausência do código, dois mutantes sobre o código novo:
| Mutante | Resultado |
|---|---|
| M1 ramo da nota passa a valer também para `TENDENCIA_FLUXO` | morto (o teste do mesmo objeto cai; 1 falha) |
| M2 `notas` do schema vira `z.array(z.string())` (sem o enum) | morto (o teste do enum cai; 1 falha) |
| M3 tirar `TENDENCIA_SUST` da constante de `servico.ts` | não rodado: efeito nulo hoje, pois a `TENDENCIA_SUST` fora do mapa real volta `sem-dado-real` antes do cálculo (leitura de `servico.ts`, review e A7); a prova é do Lote 7 |

## Bugs
Nenhum aberto.

## Achados
- A1 (recomendado) server/src/modulos/metricas/servico.ts:44 · a ligação de `TENDENCIA_SUST` na constante não tem teste que a derrube (efeito nulo até o Lote 7); o teste de ponta a ponta com a nota presente e ausente (CA-8) entra no Lote 7.
