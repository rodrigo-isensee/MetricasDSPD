---
tipo: review
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: fix/k292-leia-junto-alvo
commit: 0f4eb5208a58fb7f4386bd1b4974d91450a9c977
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-12
---
# Review: K-292, espaço vertical entre os links do leia-junto (E2.12)

## Achados

## Sondas

## Parecer
Aprovado sobre 0f4eb520 (base develop 25e57350). Diff de três pontos: 1 arquivo, +1 -1 (`web/src/features/complementares/LeiaJunto.tsx:42`), um comportamento só, bem abaixo das 150 linhas.

- **Faz o que o cartão pede, nada além:** o `ul` do leia-junto passa de `gap-x-3` para `gap-x-3 gap-y-2`. Texto, `href`, `aria-label`, ordem e marcação dos links não mudam; a classe `.alvo` (`web/src/styles/tokens.css:134`, 24 px de mínimo, 44 px abaixo de 48rem) segue no link.
- **Classe coerente com o resto da web:** `gap-y-*` ao lado de `gap-x-*` em contêiner `flex-wrap` é o padrão já usado (`FaixaOcultas.tsx:13` e `OperacionalPage.tsx:172` com `gap-y-2`; `Legenda.tsx:16`, `Distribuicao.tsx:29` com `gap-y-1`). O 2 (8 px) dá folga entre linhas quebradas de alvos de 24 px, que é o que o axe `target-size` mede; nenhum token novo, nenhum CSS próprio.
- **Correção de um flake não reproduzido:** o bug `docs/qa/bugs/099-e2e-l3-08-target-size.md` registra a hipótese (linha quebrada sem folga vertical) como não provada. A mudança é barata, só aumenta o espaçamento e não relaxa o axe nem marca `skip`, como o próprio bug pede. Se o L3-08 voltar a falhar no CI depois do merge, o próximo passo é o trace do runner (passo 2 do bug), não mais espaçamento.
- **Testes:** rodei o arquivo do componente tocado com `VITEST_MAX_WORKERS=2`: `src/features/complementares/leiajunto.test.tsx` 11 passed. O QA (ed7ea724, aprovado) rodou o L3-08 10 de 10 com `--repeat-each=10 --workers=3 --retries=0` e os specs do leia-junto e do axe, 66 de 66. Sem teste unitário novo: a garantia é o e2e de acessibilidade já existente; uma asserção de nome de classe no Vitest leria o texto da fonte e não provaria o comportamento.
- **Commit:** `fix(web): espaco vertical entre os links do leia-junto (alvo de toque estavel no axe)`, Conventional Commits, um commit coerente.
- Regras invioláveis: nenhuma métrica, cálculo, dado de pessoa ou credencial no diff.
