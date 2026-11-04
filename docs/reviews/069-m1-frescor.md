---
tipo: review
contrato: 1
pedido: 069-lacunas-alta
branch: feature/069-m1-frescor
commit: db7a8e19966d1d46963d81d01fa25465c0f56498
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-04
---
# Review: 069-lacunas-alta, lote M1-a (frescor.ultimaTentativa e aviso de coleta parcial)

Ponta revisada db7a8e1 (bfaf807 server, db7a8e1 tela) contra a develop b86dd9f. Desenho: `docs/analises/069-desenho.md`, seção "Lote M1-a". Cartão K-220.

## Achados

- A1 (recomendado) server/tests/apontamento-rota.test.ts:382 · o teste novo da coleta parcial não chama `await app.close()`, ao contrário dos vizinhos; fechar o app no fim.
- A2 (recomendado) server/tests/apontamento-rota.test.ts:84 · o caso "sucesso depois de parcial" do desenho só sai implícito (fixture padrão com última = ok); um caso explícito com parcial antiga e ok mais nova deixaria a intenção legível.

## Parecer

Aprovado. Faz o que o desenho pede, sem mexer no selo nem no cálculo.

- Contrato: `frescor.ultimaTentativa` opcional e nullable, `resultado` em `ok | parcial | falha`, `fim` como `instante`, objeto `.strict()`; resposta antiga sem o campo continua válida (teste web "campo ausente"). `docs:check` aceitou a mudança como compatível, sem fotografia nova; `openapi.json` regenerado com o campo fora de `required`.
- Serviço: `montarApontamento` preenche a partir de `ultima`, já lida, com o mapa `RESULTADO` existente (`sucesso` vira `ok`); `ultimaColetaOk` e o selo seguem só com sucesso, então `parcialAte` da capacidade não muda. Sem consulta nova, sem pessoa.
- Docs da API: `docs/api/apontamento.md` descreve o campo, diz que parcial não vale como ok e o exemplo traz o campo.
- Tela: `fimParcialRecente` mostra o aviso só com parcial mais nova que a última ok ou sem ok; falha fica com o selo. Ícone com `aria-hidden`, texto visível, token `text-atencao` existente. Texto provisório fica para a revisão de interface (E1.7).
- Testes: server cobre ok, sem coleta (`null`) e parcial sem sucesso anterior (selo `sem-coleta`); web cobre aviso presente (com e sem ok) e ausente (parcial antiga, ok, falha, null, campo ausente). O falso do banco devolve `sucesso` para a consulta filtrada e o status pedido para a última, mesma regra do repositório.
- Rodado aqui: `vitest run tests/apontamento-rota.test.ts` (server) 70 passaram; `vitest run src/features/apontamento/apontamento.test.tsx` (web) 57 passaram, 2 workers.
- Ferramentas: `pnpm run docs:check`: "docs:check: ok (929 páginas Markdown, 69 métricas, 2 eventos)." `prettier --check` nos arquivos do diff: os dois do server acusam estilo, mas já acusavam na develop e o `format:check` do projeto não cobre `server/`; os de `web/` e `packages/` passam.
- Teto M14: 92 linhas de código e teste (`git diff --numstat --no-renames origin/develop...db7a8e1`, sem `.md` e sem o `openapi.json` gerado; 121 com ele), dentro de 150; um comportamento só.
- Segurança: sem gatilho (desenho, tabela de gatilhos: M1-a nenhum); o resultado e o fim da coleta já saem em `/api/v1/fontes`.
- Critério de reversão presente no desenho ("Decisão do desenho: parcial não vale como coleta ok").
- Pendência: suíte completa e E2E de API ficam com o QA desta ponta (E1.5) e o CI do PR.
