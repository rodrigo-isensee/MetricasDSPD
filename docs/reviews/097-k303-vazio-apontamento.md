---
tipo: review
contrato: 1
pedido: 097-resumo-filtro-time
branch: fix/k303-vazio-apontamento
commit: 2ed9e70169451fddd3f11de63e81145203a890c5
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-13
---
# Review: lote do Apontamento do 097, K-303, K-302 e K-289 (E4.29; revalidação E4.32)

## Revalidação (volta 1, 2ed9e701)
Delta lido: `forge-check parecer delta docs/reviews/097-k303-vazio-apontamento.md` aponta o intervalo `66a11117..2ed9e701` e, no domínio, só `e2e/tests/apontamento-qa.spec.ts` e `web/src/features/apontamento/components/CartoesCapacidade.tsx` (`git diff b19c8322 2ed9e701`: 6 linhas a mais, 5 a menos).
- **A1 resolvido:** o CT-08 borda espera `em: Tipo, Agrupar por.` e afirma `aviso-pessoa-retirada` visível, como pedido. Pela mesma causa, a asserção da nota de Outra área (linha 274) passou ao texto atual de `NOTA_OUTRA_AREA_FORA_CAPACIDADE` (`textos.ts:43`), que o K-289 também mudou: estava quebrada pelo mesmo motivo, e a correção é legítima.
- **A2 resolvido:** `CartoesCapacidade.tsx:116` usa `pessoas.length < capacidade.porPessoa.length`. `PESSOA_OUTRA_AREA` segue em uso no filtro da linha 103, sem import morto.
- **A3:** segue recomendado e vai no corpo do PR (`teto: excedido`).
- **Rodado:** `npx playwright test --project=chromium --workers=1 tests/apontamento-qa.spec.ts -g "CT-08|Outra área"` em 2ed9e701: 5 passando (a S1 agora dá o esperado). Mutante do A2 (`<` por `<=`): falha `revisao-ux.test.tsx` "K-289 A2: sem Outra área, a capacidade não traz a frase de exclusão", ou seja, o mutante morre; arquivo restaurado, 39 de 39 passando.
- **CI:** run 43527382755 (push, head 2ed9e701) `completed:success`; os jobs `e2e` saem `skipped` no push e rodam no PR, onde são check obrigatório.

Diff lido: `git diff e5092e05...66a11117` (base `e5092e05`, develop). O merge `c8a334af` só trouxe a develop, sem conflito.

## Achados
- A1 (bloqueante) e2e/tests/apontamento-qa.spec.ts:193 · CT-08 ainda espera `em: Tipo, pessoa, Agrupar por.`; o K-289 tirou `pessoa` do aviso genérico e o check `e2e` reprova (S1). Esperar `em: Tipo, Agrupar por.` e afirmar `aviso-pessoa-retirada` visível.
- A2 (recomendado) web/src/features/apontamento/components/CartoesCapacidade.tsx:116 · `capacidade.porPessoa.some(...)` repete o filtro de `pessoas`, duas linhas acima; `pessoas.length < capacidade.porPessoa.length` diz a mesma coisa sem repetir a regra. Não bloqueia.
- A3 (recomendado) web/src/features/apontamento/vazio-e-mapa.test.tsx:1 · 445 linhas de código e teste (numstat contra e5092e05), três cartões; o corpo do PR leva `teto: excedido, 445 linhas, três cartões do lote do Apontamento, 235 de teste por CA`.

## Sondas
- S1 · `npx playwright test --project=chromium tests/apontamento-qa.spec.ts -g "CT-08"` em 66a11117 · espera: aviso `em: Tipo, pessoa, Agrupar por.` · obtido: `Valor inválido ignorado em: Tipo, Agrupar por.` (teste falha na linha 192)

## O que foi conferido
- **Especificação (K-303):** `ApontamentoPage.tsx` segue a decisão de UX `docs/ux/097-k303-vazio-e-mapa.md`: o vazio fica sob a seção "Período dos filtros", o "Dia a dia" sai do ramo não vazio e aparece nos dois estados, o índice some no vazio (CA-6) e o anúncio usa a região `status` que já existia (CA-7). Os textos são os da decisão.
- **K-302:** o teste de `packages/metricas` prova que a marca de atípico é a do dia inteiro da pessoa, com as horas da célula recortadas pela Equipe. Os textos do vazio do mapa foram para `DIARIO_VAZIO` em `textos.ts`, sem mudar o texto.
- **K-289:** o aviso `O filtro Pessoa foi retirado; use Equipe.` é o literal da decisão 2a (2026-11-12 14:37, confirmada na 28a) e não repete o valor recebido. A nota de Outra área na capacidade explica que ela fica de fora (A-4). O título "Capacidade mensal (total do recorte)" não fala mais em "equipe", que agora é nome de filtro. `NotaOutraArea` segue em uso em `CartaoMatriz` e `CartoesQualidade`: não ficou código morto.
- **e2e/tests/apontamento-qa.spec.ts:212 (fora do declarado no brief do autor):** a mudança é legítima. O título antigo `Nenhum apontamento encontrado` não pode mais aparecer (CA-12), e a linha passa a esperar o título novo do mesmo vazio. O que falta no mesmo arquivo é o A1.
- **Regras invioláveis:** nenhuma tela nova mostra métrica individual nem ranking por pessoa. O vazio não cita pessoa nem equipe. A capacidade por pessoa continua igual (E2, decisão do dono), só com "Pessoa n" e sem meta nem faixa. O CA-11 tem teste (`vazio-e-mapa.test.tsx`). O piso de 20 apontamentos para a utilização continua igual.
- **Testes rodados (teste novo e mutante, não a suíte):** `TZ=UTC npx vitest run --maxWorkers=2` nos 5 arquivos de teste da web tocados: 125 passando. Teste K-302 em `packages/metricas`: 1 passando. Mutante à mão: com o "Dia a dia" de volta só no ramo não vazio, 8 testes de `vazio-e-mapa.test.tsx` falham (CA-1, 2, 3, 5, 5, 9, 10, 11), ou seja, o mutante morre. O arquivo foi restaurado.
- **Suíte:** não há PR nem CI. Vale a prova do autor (web com 1618 testes e branches em 100%, histórico do pedido 2026-11-13 20:12). Essa prova não roda e2e, e por isso o A1 passou.
- **Commits:** um por cartão (`fix(web)` K-303, `test(apontamento)` K-302, `fix(web)` K-289), em Conventional Commits em português.

## Parecer
Aprovado em 2ed9e701: A1 e A2 resolvidos; o A3 vai no corpo do PR.

Histórico: reprovado em 66a11117 pelo A1: o CT-08 do e2e quebra com o aviso novo da Pessoa, e o `e2e` é check obrigatório do PR. O resto do lote cumpre K-303, K-302 e K-289. Na volta, o review lê só o delta do `apontamento-qa.spec.ts`.
