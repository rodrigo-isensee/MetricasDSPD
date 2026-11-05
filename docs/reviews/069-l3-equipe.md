---
tipo: review
contrato: 1
pedido: 069-lacunas-alta
branch: feature/069-l3-equipe
commit: 4f52c57ad6b2a75d7b0e79232589ca05b1f3db31
parecer: aprovado
revisor: tech-lead
data: 2026-11-04
---
# Code review: 069 L3-a, filtro de equipe do O2 pela regra do O1 (K-220)

## Parecer

Aprovado. O lote faz o que o desenho pede e nada além: o helper `colunasDaEquipe` (`packages/metricas/src/businessmap/comum.ts`) carrega o predicado do O1 sem alteração (coluna com `equipe` compara a equipe; sem `equipe`, `quadro-<slug>`; só `trabalho` e `homologacao`; ordem `[ordem, coluna]` por `ordenarNeutro`). O O1 e o O2 passam a usá-lo.

## O que foi lido

- Helper: predicado idêntico ao removido do O1; o O2 só ganha o ramo de equipe da coluna (o defeito: `quadro_id` numérico na base real deixava `etapas` vazio). A busca da equipe pelo slug no O2 continua como antes.
- O1: refatoração sem mudança de comportamento; imports limpos (`ordenarNeutro` saiu do O1, `slug` ainda é usado na linha 20; `ordenarNeutro` e `slug` seguem usados no O2).
- Biblioteca compartilhada: o lote não toca cálculo de tempo, percentil nem Monte Carlo; só o agrupamento por coluna. Sem versão de critério (T2.6), como o desenho decide.
- Testes (`o2.equipe.test.ts`): base real, base semeada, coluna de outro time no mesmo quadro e sem filtro; a ordem e o parado na coluna certa são afirmados. Os testes do O1 existentes cobrem a refatoração.
- Regras invioláveis: nada individual, nenhuma mistura de fontes, sem dado de pessoa.
- Teto M14: 17+0, 2+11, 2+8 de código e 69 de teste, total 109 linhas (git diff --numstat) dentro de 150; um comportamento só.
- Ferramentas: o autor relata metricas 1262 com cobertura 100%, server 1625, prettier e docs:check verdes; não refeitos aqui. O `git pull --ff-only` falhou por rede (403 do proxy); o HEAD local já é 4f52c57, o commit revisado.
- Segurança: sem gatilho (desenho); nenhum cartão para o security-engineer.

## Achados

- A1 (recomendado) packages/metricas/src/businessmap/o20.ts:64 · O20 repete o padrão `quadro-<slug>` (SDR, fora do lote); segue como dívida e o helper o resolve quando o plano dele entrar. Não devolve.
