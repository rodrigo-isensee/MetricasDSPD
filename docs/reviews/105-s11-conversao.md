---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-s11-conversao
commit: 3b9ead5097ab321a2cb566febd0715f3ebe9de2a
parecer: aprovado
revisor: tech-lead
data: 2026-11-16
---

# Code review: S11 conversão pelo campo "Avaliação de Problema" (E7.101, review E7.106)

## O que foi conferido
- Diff `2c56d33b...3b9ead50`: 1 commit, 17 arquivos; 180 linhas de código e teste (`git diff --numstat --no-renames`, fora `.md`, `openapi.json` e fotografia), das quais 102 são teste. Um comportamento só (a conversão do S11). Passa da orientação de 150 (M14): o corpo do PR precisa da linha `teto: excedido, 180 linhas, <motivo>` (o grosso é teste da fronteira de 20 e do fluxo antigo).
- **Regra (decisão do dono de 16/11, linha 345 do pedido e o detalhamento do brief).** `packages/metricas/src/acelerato/s11.ts:53-54,65-69`: numerador = avaliações com `avaliacao_problema === 'Aberto'`; denominador = avaliações registradas só da regra `campo` (fluxos do PROC), então "Não aplicável e com justificativa" entra só no divisor; avaliações da regra `causa-raiz` (fluxos antigo e intermediário) ficam fora e são contadas em `foraDaConversao`; sem fluxo (`regraDe` nulo) fica fora e segue em `semFluxo`. `motivoConversao` passa a `null`. O domínio do campo é a lista fechada de dois valores (`modelo.ts:61`), então a comparação exata com `'Aberto'` está certa.
- **Biblioteca compartilhada.** A taxa sai de `taxa()` de `core/estatistica.ts:55`, que aplica o mínimo de 20 (`insuficiente`, sem `pct`); nenhuma conta própria. Com as 13 avaliações de hoje o cartão sai insuficiente, como o brief espera.
- **Só Acelerato.** `calcular.ts:92` deixa de passar a extensão; o cálculo lê só `ContextoAC`. Nada de BusinessMap.
- **Contrato compatível.** `schemas.ts:1224` acrescenta `foraDaConversao` opcional; `conversao` segue `Taxa | null`, `motivoConversao` segue anulável. `openapi.json`, `docs/contratos/metricas/S11.md` e a fotografia regenerados; o web trata o opcional com `?? 0`.
- **Critério registrado (T2.6).** `105:S11-conversao-avaliacao` em `CRITERIOS_ACELERATO` (`criterios-acelerato.ts:48-53`, `metricas: ['S11']`), com linha em "Mudanças de critério de cálculo" do CHANGELOG; CT-49 atualizado para as sete entradas.
- **Cartão.** `sustentacao.tsx:303-310` mostra a nota "Conversão pela decisão registrada no chamado, não pelo vínculo" quando a conversão existe, mais a contagem de `foraDaConversao`; `notas.ts` atualizado. Texto é da UX revisar.
- **Testes.** `s11-18b.test.ts`: proporção com "Não aplicável" só no divisor, 0 de 20 publica 0%, fronteira 19/20, sem avaliação fora do divisor, fluxo antigo fora e contado com o "Aberto" dele ignorado, sem fluxo fora. `painel-real-f6.test.ts` cobre a rota real (insuficiente com 11 e fronteira 20). Rodado: `vitest run src/acelerato/s11-18b.test.ts` em `packages/metricas`, 13 passaram. Mutantes: (1) tirei o filtro `regraDe === 'campo'` do denominador: 1 teste falhou (morto); (2) troquei `=== 'Aberto'` por `!== null`: 6 falharam (morto). Fonte restaurada, árvore limpa.
- Suíte: não rerrodada; vale o CI do head (runs `43843842467` push e `43844204718` pull_request) e o PQ do autor. Este parecer não afirma CI verde.
- Commit: Conventional Commits em português, escopo e pedido no assunto.

## Achados
- A1 (recomendado) packages/metricas/src/acelerato/extensao.ts:16 · `ExtensaoAC.registroProblema` ficou sem leitor (o S11 era o único); o campo segue montado em `packages/mock/src/complementares.ts:77` e `server/src/modulos/metricas/mapa.ts:226`. Remover em PR próprio, cuidando dos hashes do mock (o sorteio do `bernoulli` consome a semente).
- A2 (recomendado) server/tests/criterios-acelerato.test.ts:10 · o título diz "as sete entradas" mas a lista do parêntese não cita a conversão do S11; acrescentar "e a conversão do S11".

## Riscos e pendências fora do review
- O denominador conta as avaliações de todos os chamados fechados do período com regra `campo`, não só os do escopo P1/P2/contorno; é o comportamento anterior e bate com "avaliações registradas" da decisão. Se o dono quiser só o escopo, é pergunta ao dono, não ajuste no código.
- Com conversão `insuficiente` a célula da tabela mostra "k de n" (ex.: "0 de 13"), como os grupos já fazem; a UX confirma na revisão.
- A data da versão de critério só existe depois que o dono grava pelo `ac:ref-sync`.
