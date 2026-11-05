Agente destino: forge:software-architect
Pedido: 060-triagem-dependabot
Tipo: codigo
Branch: docs/060-triagem-dependabot   Base: develop   Base-sha: e32ee542d56b4767cebda581dc20f4283e04a56c
Etapa: codigo   Cobre: E2.1

## Objetivo
Levantar onde as métricas ainda leem dado fictício (mock) e o que regera fictício, e propor o plano para o painel usar só dado real (pedido 060, E2.1, K-195, urgente). Worktree `/home/rodrigoisensee/MetricasDSPD-052b`, branch `docs/060-triagem-dependabot`.

## Ler
- No server: `src/plataforma/config.ts`, `src/app.ts`, `src/plataforma/db/seed.ts`, `seed-cli.ts`, `pesquisa-mock.ts`, `extensoes-mock.ts`, `limpar-seed.ts`, `src/modulos/metricas/fonte-pesquisa.ts`, os scripts do `package.json`.
- No web: `src/data/index.ts`, `src/data/mock/MockFonteMetricas.ts` e quem os importa.

## Entregar
- "E2.1 (software-architect): discovery: onde o painel e a API ainda leem o mock e quais comandos ou rotinas regeram dados fictícios; plano para tirar o mock da leitura e bloquear a regeração." (E2.1)
- (E2.1) Mapa: cada ponto em que o painel, a API ou um comando lê ou grava dado fictício, com arquivo e linha, e em qual condição (variável de ambiente, modo de desenvolvimento, falta de dado real).
- (E2.1) Plano em etapas pequenas para: o painel e a API lerem só dado real em todas as métricas (operacionais, Acelerato, apontamento); nenhum comando ou rotina regerar fictício na base real; o que acontece com o mock nos testes e no E2E; o que o painel mostra quando falta dado (sem número inventado). Riscos e o que muda para o dono.
- (E2.1) Escrever em `/home/rodrigoisensee/MetricasDSPD-052b/docs/architecture/060-sem-mock.md`; sem commit (papel sem Bash).

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-02): "isso" (recibo da triagem): o security-engineer tria os 15 alertas do Dependabot só lendo, com parecer e recomendação por alerta; nenhuma dependência é atualizada e nenhum alerta é dispensado nesta etapa; a correção vira pedido próprio depois da escolha do dono.
- DECISÃO DO DONO (2026-11-02): "B para as métricas prontas com dados reais funcionando e que ele não regere com dados fakes": o painel deixa de usar o mock e nada regera dado fictício.
- DECISÃO DO DONO (2026-11-02): "É isso é urgente para não misturar dados reais com falsos" (recibo do E2): o software-architect levanta onde o painel e a API leem o mock e o que regera dado fictício e traz o plano; a base real não é tocada nesta etapa; prioridade urgente.
- 2026-11-02 19:22: DEVOLVIDA: o dono respondeu ao NAO-ENTENDI com a leitura (b): "B para as métricas prontas com dados reais funcionando e que ele não regere com dados fakes". ESCOPO+: E2 passa de comando de mock a tirar o mock das métricas e bloquear a regeração de fictícios. Recibo do E2 enviado.
- 2026-11-02 19:29: recibo do E2 confirmado pelo dono: "É isso é urgente para não misturar dados reais com falsos". Cartão K-195, urgente. DECISÃO TÉCNICA (Jarvis): o discovery do E2.1 escreve o plano em docs/architecture/060-sem-mock.md na worktree 052b, branch docs/060-triagem-dependabot (mesmo pedido, sem arquivo em comum com o parecer da triagem); o commit fica para o tech-lead depois da validação do dono.
- O agente nunca abre nem lê o `.env`; não roda nada na base.
- Regras invioláveis do CLAUDE.md: abaixo de 20 itens não publicar; BusinessMap e Acelerato nunca se misturam; sem métrica individual (salvo a exceção Apontamento aprovada no pedido 059).
- NÃO tocar: código, testes, o parecer da triagem, o `CLAUDE.md`, as outras worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (security-engineer): triagem dos alertas pela API do GitHub (só leitura) e pelo lockfile da develop, com parecer em docs/security/060-triagem-dependabot.md, sem mexer em dependência." · etapa de outra delegação; continua no pedido
- "E1.2 (dono): escolher o que corrigir; a correção vira pedido de implementação próprio." · etapa de outra delegação; continua no pedido
- "E2.2 (dono): confirmar o recibo e validar o plano." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (arquivo): `/home/rodrigoisensee/MetricasDSPD-052b/docs/architecture/060-sem-mock.md` existe com as seções Mapa, Plano e Riscos

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).