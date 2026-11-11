Agente destino: forge:node-backend
Pedido: 089-apontamento-qualidade-d2-d3
Tipo: codigo
Branch: feature/089-apontamento-d2-d3   Base: develop   Base-sha: 129fc3d5ba918789e17d3dc1b663039795c4a9e6
Etapa: codigo   Cobre: E1.2

## Objetivo
Registro (DECISÃO TÉCNICA do Histórico do pedido, 2026-11-10 22:15): este brief é o node-backend-1 com dois arquivos a mais na lista (`server/src/modulos/referencia/index.ts`, `server/tests/criterios-apontamento.test.ts`), sem trabalho novo, e é o que confere a entrega 2ea9c636. Pedido 089, E1.2: aplicar no servidor e na biblioteca de métricas as decisões D2 (A) e D3 (A) do dono, pelo plano `docs/analises/089-plano-apontamento-d2-d3.md` (seções 3, 5 e 6, parte node-backend), com as recomendações Q1, Q2 e Q3 do plano valendo como suposição até a resposta do dono. Worktree `/home/rodrigoisensee/MetricasDSPD-052h`, branch `feature/089-apontamento-d2-d3` (já criada sobre a develop 129fc3d5ba918789e17d3dc1b663039795c4a9e6). O react-frontend trabalha em paralelo em outra branch, sem arquivo em comum.

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/089-plano-apontamento-d2-d3.md` (inteiro).

## Entregar
- "E1.2 (node-backend): implementação de E1 e da parte de E2 no servidor e na biblioteca de métricas, pelo plano." (E1.2)
- (E1) (E2) (E1.2) Os itens da lista "node-backend (E1.2)" da seção 6 do plano, inclusive as correções A (id do critério com prefixo de família) e B (filtro de vigência em `lerRotulosSubgrupo`) da seção 5: `sem-vinculo` só para `nao-classificado`; nova versão de critério registrada (T2.6) com a data da primeira varredura completa (Q3) e nunca UPDATE em massa no dado já gravado; rótulo "Sem comentário" no dicionário versionado e na documentação de arquitetura. Sem mudança de contrato nem migração. Testes do plano, com vermelho antes do verde no teste da regra. Commits pequenos com `Cartão: K-213` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito pelos caminhos); push em primeiro plano, timeout de 600 s, com `git -C /home/rodrigoisensee/MetricasDSPD-052h push origin HEAD:refs/heads/feature/089-apontamento-d2-d3` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR. Dúvida de regra de negócio que o plano não resolva: pare e relate (não decida por inferência).
- arquivos: packages/metricas/src/coletor/classificarApontamento.ts, packages/metricas/src/coletor/classificarApontamento.test.ts, packages/metricas/src/businessmap/apontamento/achados.ts, packages/metricas/src/businessmap/apontamento/apontamento.test.ts, server/src/modulos/apontamento/servico.ts, server/src/modulos/apontamento/repositorio.ts, server/src/modulos/businessmap/apontamento/registro.ts, server/src/modulos/referencia/criterios-apontamento.ts, server/src/entradas/criterios-apontamento.ts, docs/architecture/fontes/apontamento-dicionario.json, docs/architecture/features/059-dicionario-apontamento.md, docs/architecture/features/059-aba-apontamento.md, docs/api/apontamento.md, server/tests/apontamento-classificador.test.ts, server/tests/apontamento-dicionario.test.ts, server/tests/apontamento-dicionario.pg.test.ts, server/tests/apontamento-rota.test.ts, server/tests/apontamento-rota.pg.test.ts, server/tests/apontamento-montagem.test.ts, server/src/modulos/referencia/index.ts, server/tests/criterios-apontamento.test.ts

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 089-apontamento-qualidade-d2-d3 até f41b6b2d55fc20ad4885a765956393cb17dd2f5bbfc4c919a2f78c5b175bf5e6 (1 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/089-apontamento-qualidade-d2-d3.md; valem todas, leia-as nas fontes)
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- O Entregar prevalece sobre linhas genéricas: o parecer é commitado e enviado na própria branch; mutação ou reversão temporária é restaurada antes do commit.
- NÃO tocar: os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): plano curto: onde a flag é calculada e gravada, como a versão de critério entra (ref_versao_criterio, T2.6), o que acontece com os apontamentos já gravados (nunca sobrescrever histórico), o impacto na tela e no achado; sem commit, parecer em docs/analises/." · etapa de outra delegação; continua no pedido
- "E1.3 (react-frontend): parte de tela de E1 e E2, pelo plano." · etapa de outra delegação; continua no pedido
- "E1.4 (ux-designer): revisão de interface." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): review;" · etapa de outra delegação; continua no pedido
- "E1.6 (qa-engineer): QA;" · etapa de outra delegação; continua no pedido
- "E1.7 (tech-lead): PR (o merge é do dono)." · etapa de outra delegação; continua no pedido
- "E1.8 (agile-coach): retrospectiva curta." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `pnpm run pronto` (da raiz de `/home/rodrigoisensee/MetricasDSPD-052h`) · espera: rc=0
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052h log --oneline 129fc3d5ba918789e17d3dc1b663039795c4a9e6..origin/feature/089-apontamento-d2-d3` · espera: linhas>=1
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
