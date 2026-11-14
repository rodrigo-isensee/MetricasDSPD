---
tipo: review
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: fix/k296-origem-sem-dado
commit: 275b0affa5de02ea1455093445bd3a820ec42762
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-12
---
# Review: K-296, origemDaMetrica 'mock' vira 'sem-dado' (E2.12, K-275)

Diff lido: `git diff origin/develop...275b0aff` (9 arquivos, 41 adições e 41 remoções, um commit). Renomeação sem mudança de comportamento: `OrigemDaMetrica` passa a `'real' | 'sem-dado'` e `motivoDaOrigemMock` vira `motivoDaOrigemSemDado`, com os chamadores em contratos, testes do servidor e web.

## Achados
- A1 (recomendado) packages/contratos/src/origem.test.ts:38 · os títulos dos `it` nas linhas 38, 65, 72 e 137 ainda dizem "seguem mock", "é mock" e "motivo de mock"; as asserções já esperam 'sem-dado'. Trocar o texto para "sem dado" no próximo toque do arquivo.
- A2 (recomendado) packages/contratos/src/origem.ts:67 · a constante `MOTIVO_ORIGEM_MOCK` mantém o nome antigo (citada também em docs/api/metricas.md:52 e :419). Fora do recorte do K-296 (só o estado e a função); vale um cartão para renomear junto com a doc.

## Sondas

## Conferências
- Contrato e checklist: faz o que o K-296 pede, nem mais nem menos. Nenhuma comparação `origemDaMetrica(...) === 'mock'` nem `motivoDaOrigemMock` sobra fora de `.md` (busca no commit 275b0aff). `servico.ts:256`, `CartaoMetrica.tsx:120` e `catalogo/linhas.ts:44` comparam com `'real'` e não mudam. O `'mock'` que fica em `OrigemDosCartoes.tsx` e `gerar.ts` é o `tipoFonte` da fonte, outro conceito.
- OpenAPI: o valor de `OrigemDaMetrica` não é serializado em resposta (o servidor só o usa como portão); o `origem` do `docs/api/openapi.json` é outro enum (`inicio-coleta`, `criterio`). Sem contrato externo a mudar.
- Tipagem: o tipo união fecha a troca; uma comparação esquecida com `'mock'` falharia no `tsc` do CI.
- ADR 0030 e regras invioláveis: nada muda em cálculo, domínio ou publicação; a mudança tira o último "mock" do estado de origem.
- Testes tocados, rodados em 275b0aff (worktree MetricasDSPD-041): `packages/contratos/src/origem.test.ts` 15/15; `server/tests/painel-real-f6.test.ts` e `qa-f6-painel.test.ts` 45/45; `web/src/features/coleta/origem.test.tsx` e `exportar/gerar.test.ts` 26/26. Suíte completa e `tsc`: CI do PR.
- Commit: Conventional Commits em português, mensagem clara, um só comportamento. Parecer do QA aprovado em 04f327cd (`docs/qa/099-k296-origem-sem-dado.md`).
