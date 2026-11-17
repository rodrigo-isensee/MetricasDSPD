---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-vazio-espaco-nota
commit: 5bdb0a25769c03837fb88a7ed3ebe8698c426e39
parecer: aprovado
revisor: tech-lead
data: 2026-11-17
---

# Code review: nota do cartão vazio com o mesmo espaço (K-400, E7.468)

Diff lido: `5b2c4292...5bdb0a25`, 4 arquivos, 6+/3- (`CartaoMetrica.tsx`, `sustentacao.tsx`, `CartaoT9.tsx`, fragmento em `changelog.d/`). Dentro do teto M14; classe T.

- **Faz o que o cartão pede.** `CartaoMetrica.tsx:395` envolve `complementoVazio` num `div.mt-2` só quando o valor é verdadeiro; S8 e T9 perdem o `mt-2` próprio. S1 (`notaForaDaMatriz`), O19 (`AvisoInfo`) e S6/S11 (`NotaForaDoFluxo`) não tinham margem própria e passam a ganhar os mesmos 8 px: o espaço fica igual em todos.
- **S8:** o `complementoVazio` devolve `false` quando não há chamado sem resposta; o `&&` não cria o wrapper. Correto.
- **Teste:** só espaçamento, sem teste novo; os `data-testid` (`s8-nota-vazio`, `t9-nota-vazio`) continuam. Aceito para a classe T.
- **Suíte:** sem PR para a branch; vale o PQ do autor (`pnpm run pronto` rc=0). Não afirmo CI verde.

## Achados
- A1 (recomendado) web/src/components/ui/CartaoMetrica.tsx:395 · S6 e S11 passam sempre `<NotaForaDoFluxo>`, verdadeiro mesmo com n = 0 (o componente devolve null): sobra um `div.mt-2` vazio. Sugestão: passar só com n > 0, como S1. Não provado na tela.
