---
tipo: qa
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: fix/k296-origem-sem-dado
commit: 275b0affa5de02ea1455093445bd3a820ec42762
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-12
---
# QA: K-296, origemDaMetrica 'mock' vira 'sem-dado' (E2.13)

Renomeação sem mudança de comportamento: o tipo `OrigemDaMetrica` passa a `'real' | 'sem-dado'` e `motivoDaOrigemMock` vira `motivoDaOrigemSemDado`. Nada rodou contra base real nem abriu `.env*`; a suíte inteira é do CI (check-run `bateria` do mesmo sha). Rodei só os testes tocados.

## Achados

## Critério → teste → resultado
Obrigação: K-296 (só o nome) e ADR 0030 (nada de 'mock' como origem; tela e exportação intactas).

| Obrigação | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Origem das métricas, motivo e mapa real | `packages/contratos/src/origem.test.ts` (15) | métrica real tem motivo nulo; sem-dado tem o motivo do mapa | 15/15 passam |
| API responde "sem dado real" para origem sem-dado | `server/tests/painel-real-f6.test.ts`, `qa-f6-painel.test.ts` (45 no total) | fora do mapa real não calcula | 45/45 passam |
| Cartão e exportação iguais | `web/src/features/coleta/origem.test.tsx`, `exportar/gerar.test.ts` (26) | `ficticioDaVisaoGeral` e `semDadoReal` seguem iguais | 26/26 passam |
| Nenhum 'mock' de origem sobra | busca por `motivoDaOrigemMock` e por `origemDaMetrica(...) === 'mock'` em packages, server, web e e2e | n/a | zero ocorrências |

## Conferências
- Tela e exportação: o diff só troca o literal comparado (`OrigemDosCartoes.tsx`, `gerar.ts`); o `'mock'` que sobra é o `tipoFonte` da fonte (outro conceito, fora do K-296). `linhas.ts`, `servico.ts` e `CartaoMetrica.tsx` comparam com `'real'` e não mudam. OpenAPI e `docs/api` não citam o valor de origem, então não há contrato externo a mudar.
- Worktree `MetricasDSPD-041`: branch `fix/k296-origem-sem-dado`, HEAD 275b0aff, status vazio antes e depois.

## Mutação
`origemDaMetrica` trocada para devolver `'real'` também fora do mapa (`origem.ts`): `origem.test.ts` cai em 6 testes. Arquivo restaurado por cópia e `git status` vazio. Vermelho antes do verde não se aplica: não há teste novo, só renomeação de asserções.
