Agente destino: forge:react-frontend
Pedido: 089-apontamento-qualidade-d2-d3
Tipo: codigo
Branch: feature/089-apontamento-d2-d3-web   Base: develop   Base-sha: 129fc3d5ba918789e17d3dc1b663039795c4a9e6
Etapa: codigo   Cobre: E1.3

## Objetivo
Registro (DECISÃO TÉCNICA do Histórico do pedido, 2026-11-10 22:06): a delegação react-frontend-1 autorizou, na mensagem, ajustar o E2E que usa a fixture; este brief acrescenta `e2e/tests/apontamento-qa.spec.ts` à lista de arquivos, sem trabalho novo, e é o que confere a entrega 7a9b5055. Pedido 089, E1.3: aplicar na tela as decisões D2 (A) e D3 (A) do dono, pelo plano `docs/analises/089-plano-apontamento-d2-d3.md` (seções 4.2 e 6, parte react-frontend), com as recomendações Q1, Q2 e Q3 do plano valendo como suposição até a resposta do dono (Q1: o rótulo do filtro de `sem-vinculo` não muda). Worktree `/home/rodrigoisensee/MetricasDSPD-052f`, branch `feature/089-apontamento-d2-d3-web` (já criada sobre a develop 129fc3d5ba918789e17d3dc1b663039795c4a9e6). O node-backend trabalha em paralelo em outra branch, sem arquivo em comum; o acordo é o rótulo "Sem comentário", o id `nao-classificado` (inalterado) e o prefixo `dicionario-` do id de critério.

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/089-plano-apontamento-d2-d3.md` (inteiro).

## Entregar
- "E1.3 (react-frontend): parte de tela de E1 e E2, pelo plano." (E1.3)
- (E1) (E2) (E1.3) Os itens da lista "react-frontend (E1.3)" da seção 6 do plano: textos do achado e do subgrupo com "Sem comentário"; nota de execução técnica no cartão de Qualidade (contagem e participação em horas lidas de `distribuicao.porSubgrupo`, com atalho de filtro), como sinal para ampliar o dicionário e não como falha de qualidade; fixtures, E2E e o documento de textos de UX. Testes de componente; acessibilidade da nota. Commits pequenos com `Cartão: K-213` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito pelos caminhos); push em primeiro plano, timeout de 600 s, com `git -C /home/rodrigoisensee/MetricasDSPD-052f push origin HEAD:refs/heads/feature/089-apontamento-d2-d3-web` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- arquivos: web/src/features/apontamento/textos.ts, web/src/features/apontamento/fixture.ts, web/src/features/apontamento/components/CartaoDistribuicao.tsx, web/src/features/apontamento/components/CartoesQualidade.tsx, web/src/features/apontamento/filtros.ts, web/src/features/apontamento/barra-e-ramos.test.tsx, web/src/features/apontamento/unidades.test.ts, web/src/features/apontamento/apontamento.test.tsx, e2e/fixtures/apontamento-respostas.json, e2e/tests/apontamento-qa.spec.ts, docs/ux/059-aba-apontamento-textos.md

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 089-apontamento-qualidade-d2-d3 até f41b6b2d55fc20ad4885a765956393cb17dd2f5bbfc4c919a2f78c5b175bf5e6 (1 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/089-apontamento-qualidade-d2-d3.md; valem todas, leia-as nas fontes)
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- O Entregar prevalece sobre linhas genéricas: o parecer é commitado e enviado na própria branch; mutação ou reversão temporária é restaurada antes do commit.
- NÃO tocar: os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): plano curto: onde a flag é calculada e gravada, como a versão de critério entra (ref_versao_criterio, T2.6), o que acontece com os apontamentos já gravados (nunca sobrescrever histórico), o impacto na tela e no achado; sem commit, parecer em docs/analises/." · etapa de outra delegação; continua no pedido
- "E1.2 (node-backend): implementação de E1 e da parte de E2 no servidor e na biblioteca de métricas, pelo plano." · etapa de outra delegação; continua no pedido
- "E1.4 (ux-designer): revisão de interface." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): review;" · etapa de outra delegação; continua no pedido
- "E1.6 (qa-engineer): QA;" · etapa de outra delegação; continua no pedido
- "E1.7 (tech-lead): PR (o merge é do dono)." · etapa de outra delegação; continua no pedido
- "E1.8 (agile-coach): retrospectiva curta." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `pnpm run pronto` (da raiz de `/home/rodrigoisensee/MetricasDSPD-052f`) · espera: rc=0
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052f log --oneline 129fc3d5ba918789e17d3dc1b663039795c4a9e6..origin/feature/089-apontamento-d2-d3-web` · espera: linhas>=1
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
