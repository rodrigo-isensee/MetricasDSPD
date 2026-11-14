---
tipo: review
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: fix/099-l2a-sem-opcao-simulado
commit: 78e5a2c180c45e37cec36054a815c5b9696879bb
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-11
---
# Review: L2a do pedido 099, sem a opção simulado em useMetrica e nos cartões (E2.7, K-275)

## Achados
- A1 (recomendado) web/src/data/simulado.test.tsx:97 · o nome do teste ainda diz "também volta a Sem dado real", mas agora ele só chama `obterSimulado` do decorador e não passa pelo hook. Sugestão: no L2b, que apaga este arquivo, o assunto some; até lá, nada a fazer.
- A2 (recomendado) web/src/data/useMetrica.ts:1 · a linha `teto:` do commit 78e5a2c1 diz "~423 linhas" fora do formato `teto: excedido, <n> linhas, <motivo>`. Sugestão: no corpo do PR (E2.9), usar `teto: excedido, 423 linhas, troca mecânica em 41 arquivos e remoção dos testes do caminho simulado do hook`.

## Sondas

## Parecer
Aprovado sobre 78e5a2c1 (base develop 27ac9064). Diff: 41 arquivos, só `web/src`, +146 -277 (423 linhas pelo `git diff --numstat --no-renames`), acima da orientação de 150 linhas, com a justificativa no commit (A2 só pede o formato). O risco é baixo: 75 trocas mecânicas iguais e a simplificação de um hook; um comportamento só.

- **Cumpre a ADR 0030 no recorte do L2a (D1):** `useMetrica` perde a opção `simulado`, a segunda consulta (`metrica-simulada`, `skipToken`) e o import de `ehFonteSimuladora` e `filtrosSoPeriodo`. O estado agora sai só da consulta real: `SemDadoRealErro` vira `sem-dado-real`, outro erro vira `erro`. Saem os 75 `{ simulado: true }` (contagem na base: 75; no head, `git grep "simulado: true" -- web/src` só acha `OrigemDosCartoes.tsx:58`, que é o campo do selo, do L2c).
- **Retirada de `origem` sem consumidor quebrado:** `git grep` de `.origem` em `web/src` e `e2e` no head não acha leitor do campo do hook (as ocorrências são de outros tipos: matriz de retornos, T5, preferências, calibração). Os dois falsos de `MetricaQuery` nos testes (espera-invisivel, resumo) perdem o campo; `tsc -b` em `web/` passa sem erro, então nenhum chamador passa `simulado` nem lê `origem`.
- **Testes ainda provam algo:** os testes do hook que só existiam para o caminho simulado saem (é o afrouxamento autorizado pelo dono em Q-099-3 A, ADR 0030 "Afrouxa"). O que fica foi reescrito para afirmar o novo comportamento: "099: simulavel true também fica Sem dado real" (o caso que antes ligava o simulado) e os três painéis de `coleta/simulado.test.tsx` passam a exigir "Sem dado real", sem selo e `criarMock` nunca chamado. O QA registrou a mutação (hook com `simulado = true` volta, 5 testes caem). Os testes do decorador migram do hook para chamadas diretas a `obterSimulado`, mantendo a cobertura de 100% do código que o L2b apaga. Nenhum teste vazio.
- **O que fica para L2b e L2c está isolado:** `FonteComSimulado`, `simulado.ts`, as exportações de `data/index.ts`, `SemDadoRealErro.simulavel`, o selo, `OrigemDosCartoes` e `CartaoMetrica` não mudam neste diff; nenhum caminho de produção chama mais `obterSimulado` pelo hook.
- **Regras invioláveis e segurança:** nenhum número inventado; sem pessoa, credencial, banco nem dependência nova; sem gatilho de `R-SEGURANCA`. Nada rodou contra a base real nem `.env*`.
- **Execução:** `VITEST_MAX_WORKERS=2 TZ=UTC npx vitest run` dos 4 arquivos de teste tocados (`data/simulado`, `coleta/simulado`, `espera-invisivel`, `operacional/resumo/componentes`) em `web/` da worktree, head 78e5a2c1: 4 arquivos, 68 testes, 68 passaram (15,7 s). `npx tsc -b` em `web/`: sem erro. Suíte completa e cobertura citadas do parecer do QA (`docs/qa/099-l2a-sem-opcao-simulado.md`, 1500 testes, 100%); a suíte inteira fica no CI do PR.
- **Commits:** um commit de código, Conventional Commits em português, escopo `web`, `Cartão: K-275`, mensagem clara.
