---
tipo: review
contrato: 1
pedido: 077-tendencias-dado-real
branch: feature/077-l3b-historico-acelerato
commit: 7a107979f5abfee8941208b15079c78fbbc079c9
parecer: reprovado
revisor: tech-lead
data: 2026-11-08
---

# Code review: 077, lote 3b (Acelerato sem `historicoDesde`)

**Escopo:** 1 commit (`7a107979`) sobre `54f02c42`: um arquivo novo, `server/tests/metricas.historico-ac.test.ts`, 40 linhas. Nenhum diff fora do teste. Teto M14: 40 de 150, dentro.
**Veredito:** reprovado por um achado. O código já cumpre a opção (a), mas metade do segundo teste não reprova o que o nome promete.

## Ferramentas (citadas)
- CI do push no head `7a107979`: `gh run list`, run 42455378416, `completed success`. Não há PR aberto (esperado).
- `vitest run tests/metricas.historico-ac.test.ts` na worktree: 2 passaram.

## O código já cumpre a opção (a)?
Sim, pelo código lido. `carregarAC` (`servico.ts:168-177`) devolve `{ versao, base, finalizadoEm, inicio, cal }`, sem `historicoDesde`; só `carregarBM` o põe (`servico.ts:164`). No contexto, só `ctx.bm` recebe `bm?.historicoDesde` (`servico.ts:309`); `ctx.ac` não. A tendência do Acelerato lê `ctx.historicoDesde` (`acelerato/tendencia.ts:29`), então sem o campo nenhum ponto sai incompleto. `TENDENCIA_SUST` sem dado real cai no portão `semDadoReal` (`servico.ts:268`), regra já existente.

## Sondas
- S1 · `servico.ts` com `historicoDesde: "2099-01-01"` na `Carga` do `carregarAC` · espera: teste 1 falha · obtido: falhou (teste 1 pega a mutação).
- S2 · `servico.ts` com `ac: { ...criarContextoAC(...), historicoDesde: bm?.historicoDesde }` · espera: teste 2 falha · obtido: 2 passaram (mutante sobrevive).

Árvore restaurada com `git checkout` depois de cada sonda.

## Achados
- A1 (bloqueante) server/tests/metricas.historico-ac.test.ts:35 · `calcular('TENDENCIA_SUST')` só carrega o Acelerato (`bm` nulo), então o início do BusinessMap nunca chega ao contexto; a metade SUST do teste 2 não reprova vazamento (S2). Carregue os dois domínios na chamada ou teste pelo `ctx`.
- A2 (recomendado) server/tests/metricas.historico-ac.test.ts:11 · `incompletos` devolve false com `meses` vazio; afirme `meses.length > 0` antes, senão o teste passa sem série.
- A3 (recomendado) server/tests/metricas.historico-ac.test.ts:36 · o nome diz "com o Acelerato carregado", mas o cálculo da `TENDENCIA_FLUXO` só lê o BusinessMap; ajuste o nome ou carregue o AC antes.

## Revisão por regra
Regras "leitura" que alcançam o diff: teste de comportamento sem ler a fonte (cumpre), sem `.env` nem base real (cumpre), sem guarda nova em código (não há linha de guarda; mutante declarado dispensado). Regra de ferramenta sem comando configurado: nenhuma pendente além da CI citada.
