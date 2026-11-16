---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-s11-conversao
commit: 3b9ead50
parecer: reprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 1
bugs_baixos: 0
data: 2026-11-16
---
# QA: S11 conversão pela Avaliação de Problema (E7.107, sobre E7.101)

Obrigações nomeadas (decisão do dono de 16/11): CA-1 "Aberto" = Registro de Problema aberto; conversão = Aberto ÷ avaliações registradas; CA-2 "Não aplicável" só no denominador; CA-3 só fluxos do PROC, fluxo antigo e sem fluxo fora e contados em `foraDaConversao` (opcional); CA-4 abaixo de 20 = insuficiente, nunca 0; CA-5 nota no cartão "conversão pela decisão registrada no chamado, não pelo vínculo"; CA-6 versão de critério `105:S11-conversao-avaliacao`; CA-7 só Acelerato.

## Achados
- A1 (bloqueante) web/src/features/complementares/sustentacao.tsx:303 · nota nova do cartão (CA-5) sem teste web: cobertura de ramos 99.94% (5717/5720), job testes do CI falha; bug 105-002. Cobrir o CartaoS11 com foraDaConversao 0 e maior que 0.

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| CA-1, CA-2 | packages/metricas/src/acelerato/s11-18b.test.ts ("Aberto sobre as avaliações; Não aplicável só no denominador"; "só Não aplicável: 0 de 20") | 0 de 20 é 0%, não insuficiente | passou; vermelho na base; M1 morto |
| CA-3 | s11-18b.test.ts (fluxo antigo fora e contado; sem fluxo fora, segue em semFluxo; sem avaliação fora do denominador); server/tests/painel-real-f6.test.ts (D6a, base real: foraDaConversao 3) | fluxo antigo; fluxo nulo | passou; vermelho na base; M2 morto |
| CA-4 | s11-18b.test.ts (19 insuficiente sem pct, 20 publica); painel-real-f6.test.ts E7.101 (fronteira 19/20 pela API, valida no schema) | 19 e 20 | passou; M3 e M4 mortos |
| CA-5 | nenhum teste web (busca por "decisão registrada" e "foraDaConversao" fora do código: vazia) | n/a | **sem teste; falha o portão de cobertura (A1)** |
| CA-6 | server/tests/criterios-acelerato.test.ts (sete entradas, S11 na sétima) | ordem e métrica afetada | conferido no diff; o CI só falhou na cobertura web |
| CA-7 | calcularS11 deixa de receber a extensão (calcular.ts); nenhuma leitura de BusinessMap no diff | n/a | conferido no diff |

## Cenários e resultado real
- Diff 2c56d33b...3b9ead50: 17 arquivos; confere com o escopo (biblioteca, contrato, critério, tela, nota, docs). Nada de BusinessMap; `foraDaConversao` opcional, compatível. Dado real de hoje (13 avaliações, todas Não aplicável): sai `insuficiente`, coerente com a decisão.
- Local: s11-18b.test.ts + complementares.test.ts: 38 passaram.
- Vermelho antes do verde (à mão; forge-testes não rodado, a worktree tem arquivo solto de outro PR): `s11.ts` da base sobre o teste novo: `Failed Tests 6` (por exemplo "expected null to match object { status: 'ok', k: 5, n: 20, pct: 25 }").
- Mutação no diff (4 do brief, cópia restaurada, árvore limpa depois): M1 Não aplicável no numerador: 6 falharam; M2 fluxo antigo entrando: 1 falhou; M3 publicar com 19 (`n < 19` em `taxa`): 2 falharam; M4 conversão 0 em vez de insuficiente: 1 falhou. Nenhum sobrevivente.
- CI do head 3b9ead50, run 43843842467 (push): testes **falhou** (`pnpm run cobertura`, web: "Coverage for branches (99.94%) does not meet global threshold (100%)"); seguranca, build, imagem, openapi, filtro, rapida e banco em success; perf, e2e-parte e e2e pulados por consequência. Não afirmo e2e nem a suíte verde. O run do PR (43844204718) estava em fila na leitura e não é citado como verde.
- Acessibilidade: sem controle novo, só texto; axe roda no e2e do próximo sha.
- Bug aberto: docs/qa/bugs/105-002-nota-da-conversao-do-s11-sem-teste-derruba-cobertura.md (média, react-frontend).
- Revalidação: ler `forge-check parecer delta docs/qa/105-s11-conversao.md`; basta o teste web da nota (com e sem `foraDaConversao`) e o job testes verde no novo sha.
