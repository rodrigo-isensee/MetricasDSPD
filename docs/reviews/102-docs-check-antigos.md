---
tipo: review
contrato: 1
pedido: 102-forge-0460
branch: fix/docs-check-antigos
commit: d294c5fd112b5565dacc96f27cf9af794cdb135e
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-13
---
# Code review: conserto da forma de 042, 077 e 059 para o forge-check docs (E1.14)

Diff lido: `git diff e5092e05...d294c5fd` (1 commit, 3 arquivos `.md`, +20/-6): `docs/reviews/042-protecao-develop-r1.md`, `docs/reviews/077-l4a-tela-janela-fluxo.md` e `docs/architecture/features/059-dicionario-apontamento.md`. Revisão feita por outra instância do tech-lead (autor: a instância da E1.13). Só documentação fora do controle: o QA fica dispensado (`R-QA`, M13).

## Ferramentas (citadas, não refeitas)
- `forge-check docs` no head d294c5fd: `rc=0`.

## Conferência de que só a forma mudou
- **042:** o frontmatter (`parecer: reprovado`, `data: 2026-10-27`, `commit: 90e8dcc`) ficou como estava. A1, A2 e A4 continuam com a mesma gravidade e a mesma âncora `arquivo:linha`, agora resumidos abaixo do teto de 300 caracteres. O texto integral foi para `## Detalhe dos achados`. Comparei as três linhas removidas com as três linhas do detalhe e o texto é o mesmo, caractere por caractere. A3 não mudou. O veredito continua o mesmo.
- **077:** só a âncora do A3 mudou, de `PR 261, corpo, seção Teto` para `PR#261:1 · corpo do PR 261, seção Teto`. Gravidade, texto e veredito (`aprovado`) continuam os mesmos.
- **059-dicionário:** `tipo` passou de `apoio-plano-tecnico` (que o `forge-check` não conhece) para `plano-tecnico` com `contrato: 1`. `ux`, `adrs` e `agentes` são cópia exata do frontmatter de `059-aba-apontamento.md`. O `estado` longo foi reduzido a `proposta`, um valor que o contrato aceita. A explicação ("aguarda conferência do dono, PE-5, 02/11 12:00") e a origem do anexo passaram para o primeiro parágrafo do corpo, sem perder nada. O conteúdo do dicionário não mudou.

## Avaliação pedida
- **Âncora `PR#261:1`:** aceitável. O achado não tem arquivo do repositório: o alvo é o corpo do PR. A forma `PR#<n>:1` é estável e o texto que vem depois diz onde olhar.
- **Campos copiados no 059-dicionário:** aceitáveis. O `pedido` do anexo (`059-aba-apontamento`) é diferente do `pedido` do plano (`059`), e o anexo não tem `gatilhos_seguranca`. Por isso a função `gatilhos` do `forge-check`, que lê `plano-tecnico` por `pedido`, continua com o mesmo resultado. O pedido 059 já está fechado.

## Achados
- A1 (recomendado) docs/architecture/features/059-dicionario-apontamento.md:2 · o anexo passa a se declarar `plano-tecnico` sem ser o plano; ferramenta que procure "o plano do pedido 059" por tipo pode achar dois. Sugestão: levar ao Forge um tipo de anexo de plano (skill `contribuir-com-o-forge`), não muda este PR.
