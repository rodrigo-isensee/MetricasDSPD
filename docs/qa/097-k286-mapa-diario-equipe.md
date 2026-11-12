---
tipo: qa
contrato: 1
pedido: 097-resumo-filtro-time
branch: feature/k286-mapa-diario-equipe
commit: dfba8a37e6a19ae527b11b81e7468bcb6bd88cad
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-12
---

# QA: K-286, mapa diário do Apontamento recortado pela Equipe (097, E3.3)

Base develop f3dd14c3, head dfba8a37 (bibliotecas 7c5277e2, tela dfba8a37). Diff conferido: `filtros.ts` (`soPessoa` vira `modo: 'recorte' | 'diario'`, equipe aplicada antes do retorno do modo diário), `index.ts` (chamada com `'diario'`), `CartaoDiario.tsx` (`aplicaveis={['equipe']}`), `docs/api/apontamento.md` e os testes. A suíte inteira é do CI do PR (check-run `bateria` do mesmo sha); aqui só os testes tocados, sem banco.

## Critério → teste → resultado

| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Com Equipe marcada, o mapa só traz pessoas da equipe | `apontamento.test.ts` "097 K-286: modo 'diario' recorta pela equipe (e 'sem-time')..."; `apontamento-rota.test.ts` "K-286: o mapa diario e recortado pela equipe" | equipe vazia (sem filtro), `sem-time`, equipe sem linhas (soma 0), conjunto de times, equipe + pessoa | passou |
| Mapa não olha tipo nem projeto | mesmos dois testes (`tipo=999&projeto=999`) | filtro inexistente não zera o mapa | passou |
| O atípico não muda com o filtro (decidido sobre o dia inteiro) | "o atípico do mapa é decidido sobre o dia inteiro, antes do filtro de equipe" (nível `filtrar`/`ehAtipico`) | dia de 12 h repartido em dois times | passou, mas ver A1 |
| Sem comparação entre equipes | `docs/api/apontamento.md` e leitura do diff: vários times valem como conjunto; nenhuma série por equipe | n/a | conferido na leitura |
| Nota diz "Não afetado por: Tipo" | `apontamento.test.tsx` "o mapa diário é recortado pela equipe e o rodapé diz só o que não afeta (Tipo)" | n/a | passou |

## Execução

- `packages/metricas`, `vitest run src/businessmap/apontamento`: 68 passaram.
- `web`, `vitest run src/features/apontamento`: 11 arquivos, 175 passaram.
- `server`, `vitest run tests/apontamento-rota.test.ts`: 83 passaram.
- e2e `tests/apontamento-qa.spec.ts`, `--project=chromium`: 49 passaram (inclui acessibilidade WCAG 2.2 AA em 1280 e 375 px, sem violação crítica ou séria).

## Mutação no modo diário (restaurada em seguida; árvore limpa)

| Mutante | Resultado |
|---|---|
| M1: equipe deixa de ser aplicada no modo diário (retorno antes do filtro) | morreu: falharam o teste da biblioteca e o da rota |
| M2: `calcularApontamento` chama `filtrar` sem `'diario'` | morreu: falharam o teste do bloco da biblioteca e o da rota |
| M3: `calcularDiario` recebe `diasAtipicos(doDiario)` (atípico decidido depois do filtro) em vez do conjunto do dia inteiro | sobreviveu: 68 e 83 testes passaram |

Vermelho antes do verde: os testes novos são de regra; M1 e M2 provam que falham sem a implementação.

## Achados

- A1 (recomendado) packages/metricas/src/businessmap/apontamento/apontamento.test.ts:350 · M3 sobreviveu: o teste do atípico para em `filtrar`+`ehAtipico`; nenhum afirma, via `calcularApontamento`/rota, que o atípico do mapa não muda com a Equipe. Código correto (index.ts:58,72); falta a guarda.
