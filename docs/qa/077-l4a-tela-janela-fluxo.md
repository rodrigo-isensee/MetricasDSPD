---
tipo: qa
contrato: 1
pedido: 077-tendencias-dado-real
branch: feature/077-l4a-tela-janela-fluxo
commit: 06c8dd90261efde8e5270f646805fe909a628c5d
parecer: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-07
---
# QA: 077 Lote 4a (tela da janela incompleta no fluxo, K-211, E2.3), volta 2

Sobre o commit `06c8dd90` (correção do E2E do CA-27). Review da volta 2 aprovado em `737d632f`. Especificação: `docs/ux/077-tendencias.md` (CA-1 a CA-7, CA-14, seção 6); desenho: seção "Lote 4a" de `docs/analises/077-desenho.md`. O parecer anterior (`68d5e1ee`, aprovado) cobriu o lote inteiro; esta volta é incremental e o conteúdo de teste do lote segue valendo, sem nova mutação.

## Achados
- A1 (recomendado) web/src/features/operacional/resumo/SerieMensal.tsx:97 · o vazio de janela não cita a data de início do histórico (A-4 da interface); avaliar no Lote 4b, junto do `vazioJanela` próprio da sustentação (A2 do review).
- A2 (recomendado) web/src/features/operacional/resumo/modelo.ts:308 · a frase da SLA na sustentação perde o ponto final com o texto do ponto de SLA (A1 do review); alinhar no Lote 4b, onde o caso aparece.
- A3 (recomendado) e2e/tests/sustentacao-no-operacional.spec.ts:425 · o escape do E2E pendente se evita com uma regra: parecer de QA de lote que mexe em texto de tela só sai com o e2e do PR no head concluído, ou registra o texto buscado em `e2e/` por grep.

## Conferência da correção
- Delta `06c8dd90`: 1 arquivo, 1 linha (`e2e/tests/sustentacao-no-operacional.spec.ts:425`), só a expectativa de texto: de "poucos itens (n=14)" para "Poucos itens (n=14). Estatística não publicada.", a frase do CA-3 que a tela mostra (CA-3 do parecer anterior: `modelo.test.ts` e `resumo.test.tsx`, mesma frase).
- `grep -rniE "poucos itens \(n=" e2e`: uma ocorrência, a nova (linha 425); nenhum texto antigo em `e2e/`.
- `git diff --stat 5503c792f83fd29172b3730b045e7dec05d037e2 HEAD -- web server packages docs/contratos`: saída vazia (sem diff).

## Critério → teste → resultado (volta 2)
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| CA-3 (frase "Poucos itens (n=N). Estatística não publicada.") na tela real | e2e `sustentacao-no-operacional.spec.ts` CA-27 (mês de jun/2026 com n=14, marcador vazado, tabela de 7 linhas) | n=14, abaixo de 20 | passou |
| CA-1 a CA-7 e CA-14 do lote | testes de web do parecer anterior, sem mudança de código desde `68d5e1ee` | ver parecer anterior | passou (CI no head) |

## Execução
- Local, Chromium, `--workers=1`, `--reporter=line`, carga de 1 minuto 1,26 antes de rodar: `npx playwright test tests/sustentacao-no-operacional.spec.ts --project=chromium --workers=1` resultou em `40 passed (2.2m)`, incluindo o CA-27 e os CA-19 (axe) da visão.
- CI do PR 261 no head: `gh run view 42373794626 --json headSha,conclusion` resultou em `{"conclusion":"success","headSha":"06c8dd90261efde8e5270f646805fe909a628c5d"}`.
- Vermelho antes do verde: a falha do CA-27 com a expectativa antiga já foi observada na CI (run 42370410024, e2e-parte 2/2, também na repetição); o verde é o `40 passed` acima. Sem código de produção novo, a mutação do parecer anterior segue valendo.

## Escape
O parecer anterior (`68d5e1ee`) foi aprovado com o e2e do PR pendente; a falha do CA-27 já estava na CI do PR em `f14a5829` (registro do Jarvis em `docs/kanban/escapes.md`, 09:29). Causa: o QA rodou só os testes de `web/` e a CI do push, não o E2E que toca o texto trocado. Como evitar (A3): quando o lote muda texto de tela, procurar o texto antigo em `e2e/` por grep e esperar o e2e do PR no head antes de aprovar.

## Observações
- Bugs abertos: nenhum; `docs/qa/bugs/` sem entrada nova.
- Não coberto aqui: leitor de tela real.
