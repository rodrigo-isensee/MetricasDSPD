---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-s11-conversao
commit: 6a9e092addd84ab40d3b77d659b16a050c39b666
parecer: aprovado
revisor: tech-lead
data: 2026-11-16
---

# Code review: S11 conversão pelo campo "Avaliação de Problema" (E7.101, review E7.106; revalidação E7.139)

## O que foi conferido
- Diff `2c56d33b...3b9ead50`: 1 commit, 17 arquivos; 180 linhas de código e teste (`git diff --numstat --no-renames`, fora `.md`, `openapi.json` e fotografia), das quais 102 são teste. Um comportamento só (a conversão do S11). Passa da orientação de 150 (M14): o corpo do PR precisa da linha `teto: excedido, <n> linhas, <motivo>` (o grosso é teste da fronteira de 20 e do fluxo antigo; com a volta 1 o número cresce, recontar no head).
- **Regra (decisão do dono de 16/11, linha 345 do pedido e o detalhamento do brief).** `packages/metricas/src/acelerato/s11.ts:53-54,65-69`: numerador = avaliações com `avaliacao_problema === 'Aberto'`; denominador = avaliações registradas só da regra `campo` (fluxos do PROC), então "Não aplicável e com justificativa" entra só no divisor; avaliações da regra `causa-raiz` (fluxos antigo e intermediário) ficam fora e são contadas em `foraDaConversao`; sem fluxo (`regraDe` nulo) fica fora e segue em `semFluxo`. `motivoConversao` passa a `null`. O domínio do campo é a lista fechada de dois valores (`modelo.ts:61`), então a comparação exata com `'Aberto'` está certa.
- **Biblioteca compartilhada.** A taxa sai de `taxa()` de `core/estatistica.ts:55`, que aplica o mínimo de 20 (`insuficiente`, sem `pct`); nenhuma conta própria. Com as 13 avaliações de hoje o cartão sai insuficiente, como o brief espera.
- **Só Acelerato.** `calcular.ts:92` deixa de passar a extensão; o cálculo lê só `ContextoAC`. Nada de BusinessMap.
- **Contrato compatível.** `schemas.ts:1224` acrescenta `foraDaConversao` opcional; `conversao` segue `Taxa | null`, `motivoConversao` segue anulável. `openapi.json`, `docs/contratos/metricas/S11.md` e a fotografia regenerados; o web trata o opcional com `?? 0`.
- **Critério registrado (T2.6).** `105:S11-conversao-avaliacao` em `CRITERIOS_ACELERATO` (`criterios-acelerato.ts:48-53`, `metricas: ['S11']`), com linha em "Mudanças de critério de cálculo" do CHANGELOG; CT-49 atualizado para as sete entradas.
- **Cartão.** `sustentacao.tsx:303-310` mostra a nota "Conversão pela decisão registrada no chamado, não pelo vínculo" quando a conversão existe, mais a contagem de `foraDaConversao`; `notas.ts` atualizado. Texto é da UX revisar.
- **Testes.** `s11-18b.test.ts`: proporção com "Não aplicável" só no divisor, 0 de 20 publica 0%, fronteira 19/20, sem avaliação fora do divisor, fluxo antigo fora e contado com o "Aberto" dele ignorado, sem fluxo fora. `painel-real-f6.test.ts` cobre a rota real (insuficiente com 11 e fronteira 20). Rodado: `vitest run src/acelerato/s11-18b.test.ts` em `packages/metricas`, 13 passaram. Mutantes: (1) tirei o filtro `regraDe === 'campo'` do denominador: 1 teste falhou (morto); (2) troquei `=== 'Aberto'` por `!== null`: 6 falharam (morto). Fonte restaurada, árvore limpa.
- Suíte: não rerrodada. CI do head `3b9ead50`, run `43843842467` (push): job `testes` vermelho em `pnpm run cobertura`, "web cobertura: ERROR: Coverage for branches (99.94%) does not meet global threshold (100%)"; os demais jobs verdes. Ver A1.
- Commit: Conventional Commits em português, escopo e pedido no assunto.

## Revalidação da volta 1 (E7.139, head 6a9e092a)
- Delta lido: `forge-check parecer delta docs/reviews/105-s11-conversao.md`, intervalo `3b9ead50..6a9e092a`, 7 arquivos no domínio: `CHANGELOG.md`, `server/tests/criterios-acelerato.test.ts`, `web/src/components/ui/NotaMetodologica.tsx`, `web/src/components/ui/recolhidos.test.tsx`, `web/src/features/complementares/estados.test.tsx`, `web/src/features/complementares/notas.ts`, `web/src/features/complementares/sustentacao.tsx`. Nada no cálculo, no contrato nem no servidor além do título do CT-49.
- **A1 resolvido.** CI do head `6a9e092a`, run `43850739845` (push): `completed success`, com `pnpm run cobertura` no job `testes`. Suíte não rerrodada. A conversão saiu da tabela para o bloco `s11-conversao` (`sustentacao.tsx:300-318`); os testes novos de `estados.test.tsx:218-268` cobrem ok com base, insuficiente com 13 e com 1, `foraDaConversao` 0 e ausente sem frase, 1 no singular e 3 no plural. O `?? 0` ficou um só (`sustentacao.tsx:281`), coberto pelo caso ausente. Rodados: `estados.test.tsx`, `componentes.test.tsx` e `recolhidos.test.tsx`, 244 passaram. Mutante: `fora > 0` trocado por `fora >= 0` derruba 2 testes (morto); fonte restaurada.
- **A3 resolvido.** O título do CT-49 cita a conversão do S11 (`criterios-acelerato.test.ts:10`).
- **A2** segue recomendado, fora deste PR.
- **Componente compartilhado.** `BlocoNota` (`NotaMetodologica.tsx:73-77`) quebra cada seção em `<p>` na linha em branco. Hoje só `notas.ts:180` (S11) tem linha em branco; seção sem ela sai num `<p>` só, como antes, e seção vazia segue um `<p>` vazio. O `recolhidos.test.tsx` trocou o `as unknown as` de forma errada (`titulo`/`texto`) pela forma real da nota: melhora, e era o que quebraria com o `split` sobre `undefined`. Mutante: trocar o separador por um que nunca aparece (`'@@nada@@'`) deixa a suíte do web inteira verde (114 arquivos, 1840 testes): a quebra de parágrafo não tem teste. Ver A4.
- Texto da tela: o bloco insuficiente segue a nota da UX (`docs/ux/105-revisao-s11-conversao.md:52`); a frase de fora da conversão tem singular, plural e razão. Ver A5.

## Achados
- A1 (bloqueante) web/src/features/complementares/sustentacao.tsx:303 · resolvido em 6a9e092a (CI verde, run 43850739845). Era: CI do head vermelho: ramos do web 99,94% contra 100% (run 43843842467); os ramos novos do cartão S11 (linhas 303-307) não têm teste no web. Ver "Correção do A1".
- A2 (recomendado) packages/metricas/src/acelerato/extensao.ts:16 · `ExtensaoAC.registroProblema` ficou sem leitor (o S11 era o único); o campo segue montado em `packages/mock/src/complementares.ts:77` e `server/src/modulos/metricas/mapa.ts:226`. Remover em PR próprio, cuidando dos hashes do mock (o sorteio do `bernoulli` consome a semente).
- A3 (recomendado) server/tests/criterios-acelerato.test.ts:10 · resolvido em 6a9e092a. Era: o título diz "as sete entradas" mas a lista do parêntese não cita a conversão do S11; acrescentar "e a conversão do S11".
- A4 (recomendado) web/src/components/ui/NotaMetodologica.tsx:73 · a quebra em parágrafos do componente compartilhado não tem teste (o mutante do separador sobrevive à suíte do web) e usa `key={par}`, que repete chave se duas partes forem iguais; um teste em `componentes.test.tsx` com nota de dois parágrafos afirmando dois `<p>`, e chave pelo índice.
- A5 (recomendado) web/src/features/complementares/sustentacao.tsx:313 · com 1 avaliação a frase sai "há 1 avaliação registradas" (concordância), e `estados.test.tsx` afirma o erro; flexionar "registrada(s)" junto de `textoAvaliacoes` e ajustar o teste; o texto é da UX confirmar.

## Correção do A1
Nenhum teste em `web/src` cita `foraDaConversao` nem a nota "pelo vínculo". Os ramos sem teste: `r.conversao !== null`, `foraDaConversao > 0` e os dois `?? 0`. O teste do cartão S11 afirma a nota com a conversão publicada, a frase de `foraDaConversao` com valor maior que 0 e a ausência dela com 0 e sem o campo (resultado antigo). Se um `?? 0` ficar inalcançável, simplifique o código em vez de cobrir.

## Riscos e pendências fora do review
- A nota da UX pede a nota do critério "sempre" (`docs/ux/105-revisao-s11-conversao.md:53`); no insuficiente o cartão mostra só a nota de insuficiência. Cabe à UX dizer se basta.
- O denominador conta as avaliações de todos os chamados fechados do período com regra `campo`, não só os do escopo P1/P2/contorno; é o comportamento anterior e bate com "avaliações registradas" da decisão. Se o dono quiser só o escopo, é pergunta ao dono, não ajuste no código.
- Com conversão `insuficiente` a célula da tabela mostrava "k de n"; na volta 1 a conversão saiu da tabela e o insuficiente mostra "Amostra insuficiente (N avaliações)".
- A data da versão de critério só existe depois que o dono grava pelo `ac:ref-sync`.
