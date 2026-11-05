Agente destino: forge:software-architect
Pedido: 060-triagem-dependabot
Tipo: codigo
Branch: docs/060-triagem-dependabot   Base: develop   Base-sha: e32ee542d56b4767cebda581dc20f4283e04a56c
Etapa: codigo   Cobre: E3.2

## Objetivo
Avaliar fontes e viabilidade da Visão Geral com dado real para a próxima etapa (pedido 060, E3.2, K-197). A etapa `codigo` do cabeçalho é a do vocabulário do forge-check para entrega sem PR; aqui a entrega é só o documento de avaliação, sem código (modo planejar). Worktree `/home/rodrigoisensee/MetricasDSPD-052b`, branch `docs/060-triagem-dependabot`.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052b/docs/architecture/060-sem-mock.md` (o seu plano anterior), achados sobre VISAO_GERAL.
- No server: `src/modulos/metricas/` (serviço, mapa real `METRICAS_ORIGEM_REAL`) e a biblioteca compartilhada de cálculo.

## Entregar
- "E3.2 (software-architect): viabilidade e fontes da Visão Geral com dado real." (E3.2)
- (E3.2) Para cada indicador que a Visão Geral mostra hoje: fonte real disponível ou o que falta, domínio (BusinessMap ou Acelerato), se o cálculo já existe na biblioteca compartilhada, e o risco de misturar domínios; proposta de contrato da API para a tela; etapas de implementação e riscos.
- (E3.2) Escrever em `/home/rodrigoisensee/MetricasDSPD-052b/docs/architecture/060-visao-geral.md`, com os cabeçalhos de nível 2 exatos `## Indicadores`, `## Contrato`, `## Etapas` e `## Riscos`, cada um uma vez; sem commit (papel sem Bash).

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-02): "isso" (recibo da triagem): o security-engineer tria os 15 alertas do Dependabot só lendo, com parecer e recomendação por alerta; nenhuma dependência é atualizada e nenhum alerta é dispensado nesta etapa; a correção vira pedido próprio depois da escolha do dono.
- DECISÃO DO DONO (2026-11-02): "B para as métricas prontas com dados reais funcionando e que ele não regere com dados fakes": o painel deixa de usar o mock e nada regera dado fictício.
- DECISÃO DO DONO (2026-11-02): "É isso é urgente para não misturar dados reais com falsos" (recibo do E2): o software-architect levanta onde o painel e a API leem o mock e o que regera dado fictício e traz o plano; a base real não é tocada nesta etapa; prioridade urgente.
- DECISÃO DO DONO (2026-11-02): "A" (autorizar o P1 já): o P1 do plano 060-sem-mock (seed nunca grava na base real; coleta recusa esquema com seed) começa agora, num PR próprio para a develop, antes das perguntas Q1 a Q5.
- DECISÃO DO DONO (2026-11-02): "A" na Q1 (cartão sem dado real): o cartão aparece com o estado "Sem dado real" e o motivo, sem número; não some do painel.
- DECISÃO DO DONO (2026-11-02): "A" na Q2 (PV1): a pesquisa de percepção entra no mapa real agora e mostra "sem pesquisa" enquanto não houver carga.
- DECISÃO DO DONO (2026-11-02): "A" na Q3 (homologação): a homologação continua com o mock e o selo global; o mock nunca toca a base real.
- DECISÃO DO DONO (2026-11-02): "A, mas pode planejar o desenho para a próxima etapa" na Q4 (VISAO_GERAL): a Visão Geral fica "Sem dado real" agora; o desenho dela com dado real é planejado para a próxima etapa.
- DECISÃO DO DONO (2026-11-02): "Isso" (recibo do E3): ux-designer e software-architect planejam em paralelo o desenho da Visão Geral com dado real, BusinessMap e Acelerato lado a lado e nunca no mesmo cálculo, para o dono validar; nada é implementado agora.
- ADR 0023 (citada no pedido): citada no Histórico pela divergência com o CLAUDE.md sobre a forma de leitura do Acelerato, que é decisão do dono em aberto; este desenho não decide nem depende dessa forma de leitura
- 2026-11-02 19:51: DECISÃO DO DONO "A" na Q4 (VISAO_GERAL sem dado real agora). ESCOPO+: E3, planejar o desenho da Visão Geral com dado real (ux-designer e software-architect). Recibo do E3 enviado. Falta Q5.
- 2026-11-02 19:52: recibo do E3 confirmado pelo dono: "Isso". DECISÃO TÉCNICA (Jarvis): E3.1 e E3.2 escrevem na worktree 052b, branch docs/060-triagem-dependabot, em docs/ux/060-visao-geral.md e docs/architecture/060-visao-geral.md, sem commit (papéis sem Bash); cartão K-197.
- O agente nunca abre nem lê o `.env`; não roda nada.
- Regras invioláveis do CLAUDE.md: BusinessMap e Acelerato nunca se misturam em cálculo, histograma, percentil ou previsão; abaixo de 20 itens não publicar; sem métrica individual nem comparação entre times; percentis 50/85/95 em 12 semanas.
- Plano do mock em `/home/rodrigoisensee/MetricasDSPD-052b/docs/architecture/060-sem-mock.md`: métrica sem fonte real mostra "Sem dado real" com o motivo (Q1).
- NÃO tocar: código, testes, os documentos do UX, o `CLAUDE.md`, as outras worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (security-engineer): triagem dos alertas pela API do GitHub (só leitura) e pelo lockfile da develop, com parecer em docs/security/060-triagem-dependabot.md, sem mexer em dependência." · etapa de outra delegação; continua no pedido
- "E1.2 (dono): escolher o que corrigir; a correção vira pedido de implementação próprio." · etapa de outra delegação; continua no pedido
- "E2.1 (software-architect): discovery: onde o painel e a API ainda leem o mock e quais comandos ou rotinas regeram dados fictícios; plano para tirar o mock da leitura e bloquear a regeração." · etapa de outra delegação; continua no pedido
- "E2.2 (dono): confirmar o recibo e validar o plano." · etapa de outra delegação; continua no pedido
- "E2.3 (node-backend): P1 do plano docs/architecture/060-sem-mock.md: o seed recusa esquema com coleta real e exige PG_SEED_URL, o db:seed da raiz sai, a coleta recusa esquema com seed; testes test:pg." · etapa de outra delegação; continua no pedido
- "E2.4 (tech-lead): code review do P1." · etapa de outra delegação; continua no pedido
- "E2.5 (security-engineer): parecer de segurança do P1 (banco e configuração)." · etapa de outra delegação; continua no pedido
- "E2.6 (qa-engineer): QA do P1." · etapa de outra delegação; continua no pedido
- "E2.7 (tech-lead): PR do P1 para a develop." · etapa de outra delegação; continua no pedido
- "E2.8 (tech-lead): merge (squash) do PR do P1." · etapa de outra delegação; continua no pedido
- "E2.9 (dono): perguntas Q1 a Q5 do plano, que decidem P2 a P5." · etapa de outra delegação; continua no pedido
- "E3.1 (ux-designer): desenho da Visão Geral com dado real (o que mostrar, sem misturar BusinessMap e Acelerato num mesmo cálculo), em paralelo à E3.2." · etapa de outra delegação; continua no pedido
- "E3.3 (dono): validar o desenho." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (cmd): `grep -cE '^## (Indicadores|Contrato|Etapas|Riscos)' /home/rodrigoisensee/MetricasDSPD-052b/docs/architecture/060-visao-geral.md` · espera: igual '4'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).