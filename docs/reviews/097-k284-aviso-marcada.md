---
tipo: review
contrato: 1
pedido: 097-resumo-filtro-time
branch: fix/k284-aviso-marcada
commit: 34140469ec5b09ad5e65df00e7f498abb390bca3
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-12
---
# Review: aviso "Marcada: X." sai da região viva no clique e no Esc (097, K-284, E3.2)

Diff lido: `origin/develop...34140469` (`bbdf9976..34140469`; 2 arquivos de código e teste, +29 −2: `FiltroMulti.tsx`, `filtros-componentes.test.tsx`). O brief selou `Revisar-sha: b1481e32fc6279c9f416c205d1e9fad5dba37e5a`; a volta 1 (`b1481e32..34140469`) só quebrou a linha do `aoEsc` pelo Prettier, sem mudar lógica, e o head revisado é o `34140469` (o `57185813` acima dele é só o parecer do QA). Referência: N1 de `docs/ux/097-revisao-k278.md` e o A1 de `docs/reviews/097-k278-ux-busca.md`.

## Achados

## Parecer
Aprovado. O diff faz o que o N1 pede, nem mais nem menos.

- **Anúncio único:** continua uma só região `role="status"`; nenhum texto novo nela. O `retorno` é zerado em `alternar` (clique ou Espaço na caixa) e no callback de limpar do Esc, além do `onChange` do campo, que já existia.
- **Ordem do estado:** no Enter, `alternar` zera e o `setRetorno('Marcada|Desmarcada: X.')` vem depois no mesmo handler; o React agrupa as duas chamadas e vale a última, então o Enter mantém o aviso sem anúncio duplo. O `useState` do `retorno` subiu para antes de `alternar`, o que deixa a leitura na ordem de uso. Esc com a busca vazia não zera, mas aí o contêiner fecha e a `Lista` desmonta, o que cobre o "ao fechar" do N1.
- **Testes que provam algo:** os dois testes novos falham sem a correção (o clique deixaria "Marcada: Beta."; o Esc deixaria a região com o aviso sozinho). O do clique afirma também a ausência de "Desmarcada", que é o texto que a ação produziria se o retorno fosse recalculado no clique. O QA registrou as mutações 1 e 2 caindo (`docs/qa/097-k284-aviso-marcada.md`). `VITEST_MAX_WORKERS=2 npx vitest run src/features/filtros/filtros-componentes.test.tsx`: 1 arquivo, 43 testes verdes. `prettier --check` e `eslint` nos dois arquivos tocados: limpos.
- **Commits:** `fix(web)` e `style(web)` com `Cartão: K-284`, mensagens claras; o squash do PR junta os dois.
- Tamanho: 31 linhas de código e teste, um comportamento.
- Pronto: a prova é o CI do head, verde segundo o parecer do QA; cito e não refaço.
