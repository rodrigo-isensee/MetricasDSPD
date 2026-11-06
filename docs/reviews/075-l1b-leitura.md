---
tipo: review
contrato: 1
pedido: 075-bloqueios-reais
branch: feature/075-l1b-leitura
commit: 0af840f66c10d7136766800eacf025f055c0856f
parecer: aprovado
revisor: tech-lead
data: 2026-11-06
---
# Code review: 075 L1b, leitura publica "não classificado" (K-204)

## Parecer

Aprovado. O lote faz o que a seção "Lote 1b" de `docs/analises/075-plano.md` pede, nem mais nem menos: `bloqueioDe` publica "não classificado" para motivo fora do domínio (P-075-3, defesa de leitura do controle 2) e o O19 lista os 8 motivos publicados, com "não classificado" por último. Sem contrato, sem migração, sem versão de critério T2.6, como o plano diz. Este parecer cobre o O19 deste lote, parte do E4 (P-075-8).

## O que foi lido (diff `da61dbc2...0af840f6`, 2 commits)

- `server/src/modulos/metricas/mapa.ts:62-68`: `motivoPublicado` devolve o valor lido só se ele está em `MOTIVOS_BLOQUEIO` (os 7 do briefing); qualquer outro valor (desconhecido, vazio, nulo) sai `MOTIVO_NAO_CLASSIFICADO`, a constante do contrato. O texto lido nunca sai: o único caminho que devolve `v` é o da igualdade exata com um dos 7. O plano fala em "fora dos 8"; conferir contra os 7 é equivalente, porque um "não classificado" lido também sai "não classificado". O tipo `FatoBloqueio['motivo']` já é `MotivoBloqueioPublicado` desde o 1a, então o cast é seguro.
- `packages/metricas/src/businessmap/o19.ts:26`: troca `MOTIVOS_BLOQUEIO` por `MOTIVOS_BLOQUEIO_PUBLICADOS`, nada mais no cálculo. É o mesmo comportamento que o plano pedia em `server/` (o O19 vive no pacote de métricas, que o servidor chama); soma, contagem, percentual e P50/P85 seguem pela biblioteca, por motivo, com o mínimo de 20.
- `t12.ts`: sem diff (`git diff --quiet` na faixa). Ele compara com um motivo específico e não é afetado pelo oitavo valor. T10 e T12 ficaram fora do pedido (P-075-11, P-075-12).
- Os 4 testes de 7 para 8, sem perda de asserção: `bloqueios.test.ts` (ordem passa a comparar com o enum publicado e ganha `toHaveLength(8)` e "não classificado" no índice 7; base vazia passa de 7 para 8; o alvo do mock ganha o `0` final e mantém os 7 números anteriores), `qa011-fase1.test.ts:352` e `server/tests/metricas.test.ts:201` (só o número). Nenhuma asserção removida.
- Teste novo `server/tests/metricas.mapa.test.ts:51-56`: motivo do domínio passa; `'Fornecedor'`, vazio, nulo e `MARCADOR-PESSOA-075` saem "não classificado". Cobre o "Testes" do plano.
- Regras invioláveis: nada individual, só BusinessMap, nenhum cálculo próprio, nenhum dado de pessoa na saída.

## Ferramentas

- CI do push na ponta `0af840f6`: run 42258362444, `completed`/`success`, `headSha` igual ao revisado.
- Testes dos arquivos tocados (D-5), `--maxWorkers=2`: `packages/metricas` (`bloqueios.test.ts`, `qa011-fase1.test.ts`) 2 arquivos, 63 testes verdes; `server` (`metricas.mapa.test.ts`, `metricas.test.ts`) 2 arquivos, 77 testes verdes.
- Teto M14: 42 linhas de código e teste (`bloqueios.test.ts` 18, `o19.ts` 6, `qa011-fase1.test.ts` 2, `mapa.ts` 8, `metricas.mapa.test.ts` 6, `metricas.test.ts` 2). Abaixo de 150, um comportamento só.
- Segurança (controle 2): parecer próprio do security-engineer na mesma branch; não refeito aqui.

## Achados

- A1 (recomendado) packages/metricas/src/businessmap/o19.ts:12 · O comentário ficou com dois parênteses seguidos ("... por último) (a interface ordena por soma)"); juntar num só numa próxima mexida no arquivo, sem volta.
