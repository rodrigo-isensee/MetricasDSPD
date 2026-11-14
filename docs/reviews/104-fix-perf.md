---
tipo: review
contrato: 1
pedido: 104-release-2026-11-14
branch: fix/104-perf-tipo
commit: d3f60517eadc5c8d5ae1113e9b554c8eef2e5e4b
parecer: aprovado
revisor: tech-lead
data: 2026-11-14
---

# Code review: correção do perf da release 104 (fix/104-perf-tipo)

Escopo: `git diff 76f5ca25..d3f60517`, 1 commit, 1 arquivo (`e2e/perf/perf.spec.ts`, +1 −1). Etapa E1.11 do pedido `104-release-2026-11-14`. O portão da homolog (PR 414) falhou no caso F3/F4/F5 porque a troca de filtro clicava a opção "Incidente", que o K-295 (#402, ADR 0024) tirou das opções de tipo do fluxo.

## Conferências

- **Só as alternativas mudaram:** `e2e/perf/perf.spec.ts:109` passa de `['Incidente', 'Melhoria']` para `['Melhoria', 'Bug interno']`. Orçamento (`ORCAMENTO.F3_inpMs`, `F4_respostaVisualMs`, `F5_painelMs`), número de medições (`N_F4`), teto de tentativas (`MAX_TENTATIVAS_F4`) e método (rodízio de duas opções, primeira medição a frio fora do p95, troca sem resposta visual não conta, ADR 0003 "Medição do F4") ficam como estavam: o diff não toca nenhuma dessas linhas.
- **Os dois tipos existem no filtro do fluxo:** mock em `web/src/data/mock/nucleoMock.ts:227` (`TIPOS_FILTRO` sem "Incidente", logo com "Melhoria" e "Bug interno"); API em `server/src/modulos/referencia/servico.ts:28` (mesma lista, filtrada pelos tipos presentes na base). O gerador do mock produz cards dos dois tipos (`packages/mock/src/businessmap/gerador.ts:111` e `:531`). O projeto `perf` do portão roda contra o mock (`e2e/playwright.config.ts:44`, `VITE_FONTE=mock`).
- **Nenhum outro spec do portão ou da rodada noturna clica "Incidente" no filtro de tipo:** o portão (`homolog.yml`) e o noturno (`ci.yml`, cron) rodam `test:chromium` (projetos `chromium` e `chromium-semente-alt`), `test:perf` (projeto `perf`) e `lighthouse`. Cliques no filtro de tipo (`botao('tipo')` seguido de checkbox) fora do perf só em `e2e/tests-api/api.spec.ts:70` e `:171`, ambos com "Melhoria" e fora do portão (projeto `chromium-api`). Os demais usos de "incidente" são parâmetro de URL (`tipo=incidente`, que o filtro descarta ou que é da sustentação, onde Incidente segue) ou a aba do O2 em `e2e/tests/b12-fluxo.spec.ts:61` (aba da tabela, não o filtro de tipo).
- **Regras invioláveis:** só teste; nada de cálculo, fonte ou pessoa. BusinessMap e Acelerato seguem separados (o filtro alterado é o do fluxo).
- **Medição:** não rerrodei o perf (brief); cito o autor: F4 p95 59,3 ms, n=20, abaixo do orçamento de 100 ms.
- **CI:** não há PR desta branch (`gh pr list --head fix/104-perf-tipo --state all` vazio). O push em d3f60517 disparou o CI, run 43595194241, em andamento na hora do parecer: `openapi`, `imagem`, `rapida`, `filtro`, `seguranca`, `build` e `banco` com sucesso, `testes` em andamento, `perf` e `e2e` pulados (só rodam em PR, conforme `praticas.md`, seção CI). O caso corrigido só é exercido pelo portão da homolog (ou por um PR para a `main`); a prova da correção na CI é o próximo portão.
- **Commit:** `test(e2e): ...` em português, Conventional Commits, mensagem diz o porquê (K-295).
- **Tamanho:** 2 linhas alteradas, dentro da orientação M14.

## Achados

- A1 (recomendado) e2e/perf/perf.spec.ts:109 · os rótulos estão escritos à mão; tirar as duas alternativas de `TIPOS_FILTRO` sem "Incidente" (a mesma regra do mock) faria a próxima mudança de opções quebrar no typecheck ou seguir sozinha, em vez de só no portão da homolog. Fica para cartão próprio, não segura a release.
