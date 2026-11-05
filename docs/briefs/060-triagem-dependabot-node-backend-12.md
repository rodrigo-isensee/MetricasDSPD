Agente destino: forge:node-backend
Pedido: 060-triagem-dependabot
Tipo: codigo
Branch: feature/060-api-so-real   Base: develop   Base-sha: 3c284ff9e5329b1b171ac74cabec70bc9e3fd839
Etapa: codigo   Cobre: E2.12

## Objetivo
Volta 4 da E2.12, brief único com os bloqueantes do review e da segurança: separar as guardas do seed numa branch própria e impedir o modo mock sobre base real (pedido 060, E2.12, K-195). Worktree da API `/home/rodrigoisensee/MetricasDSPD-052f` (branch `feature/060-api-so-real`); worktree da branch nova `/home/rodrigoisensee/MetricasDSPD-052d` (hoje na branch do P1, já mesclada).

## Ler
- `docs/reviews/060-api-so-real.md` (ac077c5, A1) e `docs/security/060-api-so-real.md` (627e55f, A1) na branch da API; `server/src/entradas/api.ts`, `server/src/plataforma/config.ts` e `guarda-seed.ts`.

## Entregar
- Etapa do pedido, já entregue e conferida em 110e467 (esta volta não a refaz; só trata os dois bloqueantes abaixo): "E2.12 (node-backend): P2 e P3 (API sem modo mock, recusa de DADOS_FONTE e DSPD_SCHEMA_PREFIXO_SEED, métrica fora do mapa real responde sem dado real com motivo, PV1 e BLOQUEADOS no mapa real, VISAO_GERAL responde sem dado real em vez de 503, recomendados A1, A2 e A4 do review do P1, e a parte de servidor do P5: mock só por ativação explícita, com DSPD_MODO_MOCK no compose de homologação)." (E2.12)
- (E2.12) A etapa já está entregue em 0ea6246, 45db69a e 110e467; esta volta só trata os dois bloqueantes abaixo.
- (E2.12) (review ac077c5 A1) Na worktree `/home/rodrigoisensee/MetricasDSPD-052d`: `git -C /home/rodrigoisensee/MetricasDSPD-052d fetch origin develop`; `git -C /home/rodrigoisensee/MetricasDSPD-052d switch --no-track -c feature/060-guardas-seed origin/develop`; trazer de `110e4678705dfd44eb72d647c4b2a49d3ebe1981` só os 11 arquivos das guardas do seed listados no parecer de review (`git -C /home/rodrigoisensee/MetricasDSPD-052d checkout 110e4678705dfd44eb72d647c4b2a49d3ebe1981 -- <arquivo>` por arquivo), sem mudar código; commit com `Cartão: K-195`, `git add` por caminho; push com `git -C /home/rodrigoisensee/MetricasDSPD-052d push origin HEAD:refs/heads/feature/060-guardas-seed`; sem PR.
- (E2.12) (revisao-seguranca 627e55f A1) Na branch da API (`/home/rodrigoisensee/MetricasDSPD-052f`, depois de `git -C /home/rodrigoisensee/MetricasDSPD-052f pull --ff-only origin feature/060-api-so-real`): com o modo mock ligado, a API recusa subir se o esquema do BusinessMap ou do Acelerato tiver coleta real (reusar a contagem de coleta real da guarda do seed, sem permissão nova no banco); a mensagem de recusa das variáveis antigas deixa de indicar `DSPD_MODO_MOCK`; teste unitário dos dois casos; `pnpm -C /home/rodrigoisensee/MetricasDSPD-052f run typecheck` e os testes unitários do server dentro do sandbox, se rodarem; commit com `Cartão: K-195`; push com `git -C /home/rodrigoisensee/MetricasDSPD-052f push origin HEAD:refs/heads/feature/060-api-so-real`; sem PR.

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
- DECISÃO DO DONO (2026-11-02): "A, mas quando eu pedir para subir eu quero dados reais para demonstrar" na Q5 (modo demonstração): o modo mock local continua só por escolha explícita, para testes; quando o dono pedir para subir o sistema, ele sobe com dado real.
- DECISÃO DO DONO (2026-11-02): "A" na E1.2 (alertas): corrigir já os 11 recomendados (#12, #14 e #15 do dompurify fecham com a release; #18 a #25 do fast-uri por override de patch); #13, #17 e #26 ficam para depois; #16 com risco aceito e registrado. A correção vira o pedido 062.
- DECISÃO DO DONO (2026-11-02): "A" (E3.3, validar o desenho da Visão Geral): desenho validado como está, dois blocos independentes por fonte, sem total nem alerta único; vira a especificação da próxima etapa.
- DECISÃO DO DONO (2026-11-02): "A" (P1 do UX da Visão Geral): cartões sem fonte real ficam visíveis, cada um com o motivo.
- DECISÃO DO DONO (2026-11-02): "A" (P2 do UX da Visão Geral): blocos lado a lado em tela larga e empilhados em tela estreita.
- DECISÃO DO DONO (2026-11-02): "A" (P3 do UX da Visão Geral): a exportação segue a separação em duas partes, BusinessMap e Acelerato, sem total geral.
- DECISÃO DO DONO (2026-11-02): "A" (QV1, BLOQUEADOS): a métrica de bloqueados entra no mapa real junto com P2 e P3, porque a carga real já lê os bloqueios.
- DECISÃO DO DONO (2026-11-02): "A" (QV2, corte da Visão Geral): cada bloco usa a data de corte da própria coleta, sem corte comum entre BusinessMap e Acelerato.
- DECISÃO DO DONO (2026-11-02): "A" (texto do CLAUDE.md sobre o Acelerato): atualizar o CLAUDE.md para a leitura pelo MySQL da ADR 0023, só leitura, mantendo a allow-list e a proibição de nome, e-mail e texto livre; PR do tech-lead que o dono revisa e mescla.
- DECISÃO DO DONO (2026-11-02): "A" (tocar tudo durante a noite): implementar P2 a P5 do plano 060-sem-mock, a coleta diária do 061 com as revisões das ADRs 0022 e 0023, e a Visão Geral validada depois de P2 e P3; cada parte com review, segurança e QA até a develop; nada na main sem o dono.
- ADR 0023 (citada no pedido): citada no pedido; não muda nesta volta
- ADR 0026 (citada no pedido): decide P1 a P3 e o A3; o modo mock só na homologação e nos testes
- 2026-11-02 22:28: entrega conferida 110e4678705dfd44eb72d647c4b2a49d3ebe1981
- 2026-11-02 22:47: E2.15 cumprida pelo security-engineer: parecer docs/security/060-api-so-real.md REPROVADO em 110e467 (627e55f6f2bd7d05371d625936bf568c38a2a428). A1 bloqueante: DSPD_MODO_MOCK=homologacao liga o mock sobre qualquer base; com o modo mock, a API deve recusar subir se a base tiver coleta real, e a mensagem de recusa deixa de indicar a variável. A2 recomendado: janela entre a guarda curta da coleta e a primeira escrita. DECISÃO TÉCNICA (Jarvis): a volta ao node-backend sai num brief único quando o review (E2.14) terminar.
- 2026-11-02 22:55: E2.14 cumprida pelo tech-lead: review docs/reviews/060-api-so-real.md REPROVADO em 110e467 (ac077c5305c30de2ae2dc71c02bcf7d011e9ecc5). Código correto e testado; A1 bloqueante de forma (M14): a branch leva dois comportamentos, a API só com dado real e o reforço das guardas do seed (128 linhas em 11 arquivos); saída: branch nova a partir da develop só com esses 11 arquivos no estado de 110e467, PR próprio, depois a branch da API traz a develop. Teto da API (520 linhas) aceito com a linha teto no corpo do PR. A2: o dono corrigir o .env.example. DECISÃO TÉCNICA (Jarvis): volta 4 da E2.12 ao node-backend num brief único com o A1 do review (separar as guardas numa branch própria) e o A1 da segurança (com o modo mock, recusar subir se a base tiver coleta real; mensagem sem indicar a variável); etapas novas E2.24 a E2.27 para a branch das guardas; a origem da mistura foi o brief da E2.12, não o autor.
- O agente nunca abre nem lê arquivos `.env*`; não roda seed, coleta nem limpeza na base do dono.
- O GitHub precisa de `github.com` em `allowed_domains`; recusa de hook, do sandbox ou do classificador: pare e relate a mensagem literal. R-VERIFY: nunca `--no-verify` nem `--force`; não rodar comandos fora do sandbox; o que o sandbox impedir (pronto, test:pg) fica para a CI do PR, relatado.
- Recursos (dono, topo do KANBAN.md): no máximo 1 tarefa pesada por vez; vitest com no máximo 4 workers.
- Caminhos literais, um comando por linha (o hook barra variável de shell junto de ação crítica).
- NÃO tocar: o web, os arquivos `.env*`, o `CLAUDE.md`, os pareceres, as outras worktrees e a `main`.

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
- "E2.10 (devops-engineer): parecer de devops do P1 (workflow de restauração, homolog:subir e scripts)." · etapa de outra delegação; continua no pedido
- "E2.11 (software-architect): ADR do plano sem mock (P1 a P3, mapa real com PV1 e BLOQUEADOS) e decisão sobre o A3 do review (webhook do BusinessMap em esquema com seed)." · etapa de outra delegação; continua no pedido
- "E2.13 (react-frontend): P4 e P5 (web pela API por padrão, estado Sem dado real com motivo, mock só por ativação explícita na homologação, nos testes e no E2E, subir o sistema com dado real)." · etapa de outra delegação; continua no pedido
- "E2.14 (tech-lead): review da branch da API (P2, P3 e a parte de servidor do P5)." · etapa de outra delegação; continua no pedido
- "E2.15 (security-engineer): parecer de segurança da branch da API." · etapa de outra delegação; continua no pedido
- "E2.16 (qa-engineer): QA da branch da API." · etapa de outra delegação; continua no pedido
- "E2.17 (tech-lead): PR e merge da branch da API na develop." · etapa de outra delegação; continua no pedido
- "E2.18 (tech-lead): commit e PR só de documentação dos documentos do discovery do 060 (060-sem-mock, visão geral do UX e do arquiteto) para a develop." · etapa de outra delegação; continua no pedido
- "E2.19 (devops-engineer): parecer de devops da branch da API (compose de homologação e scripts)." · etapa de outra delegação; continua no pedido
- "E2.20 (tech-lead): review da branch do web (P4 e a parte de web do P5)." · etapa de outra delegação; continua no pedido
- "E2.21 (qa-engineer): QA da branch do web." · etapa de outra delegação; continua no pedido
- "E2.22 (ux-designer): revisão de interface do estado Sem dado real." · etapa de outra delegação; continua no pedido
- "E2.23 (tech-lead): PR e merge da branch do web na develop." · etapa de outra delegação; continua no pedido
- "E2.24 (tech-lead): review da branch das guardas do seed (separada da API)." · etapa de outra delegação; continua no pedido
- "E2.25 (security-engineer): parecer de segurança da branch das guardas do seed." · etapa de outra delegação; continua no pedido
- "E2.26 (qa-engineer): QA da branch das guardas do seed." · etapa de outra delegação; continua no pedido
- "E2.27 (tech-lead): PR e merge da branch das guardas do seed na develop." · etapa de outra delegação; continua no pedido
- "E3.1 (ux-designer): desenho da Visão Geral com dado real (o que mostrar, sem misturar BusinessMap e Acelerato num mesmo cálculo), em paralelo à E3.2." · etapa de outra delegação; continua no pedido
- "E3.2 (software-architect): viabilidade e fontes da Visão Geral com dado real." · etapa de outra delegação; continua no pedido
- "E3.3 (dono): validar o desenho." · etapa de outra delegação; continua no pedido
- "E3.4 (node-backend): V1 da Visão Geral (contrato em dois blocos, V-1 e V-2), depois de P2 e P3 na develop." · etapa de outra delegação; continua no pedido
- "E3.5 (react-frontend): V2 da Visão Geral pelo desenho validado." · etapa de outra delegação; continua no pedido
- "E3.6 (qa-engineer): V3, QA da Visão Geral com teste de não mistura." · etapa de outra delegação; continua no pedido
- "E4.1 (tech-lead): branch nova, texto novo do CLAUDE.md sobre a leitura do Acelerato pela ADR 0023, commit e push, na worktree 052c." · etapa de outra delegação; continua no pedido
- "E4.2 (tech-lead): review do texto do CLAUDE.md, por outra instância." · etapa de outra delegação; continua no pedido
- "E4.3 (tech-lead): PR do CLAUDE.md para a develop, sem merge." · etapa de outra delegação; continua no pedido
- "E4.4 (dono): revisar e mesclar o PR do CLAUDE.md." · etapa de outra delegação; continua no pedido
- "E4.5 (qa-engineer): QA documental do texto do CLAUDE.md, antes do PR." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (push): `git -C /home/rodrigoisensee/MetricasDSPD-052d ls-remote origin refs/heads/feature/060-guardas-seed` · espera: linhas=1
- PQ-2 (push): `git -C /home/rodrigoisensee/MetricasDSPD-052f ls-remote origin refs/heads/feature/060-api-so-real` · espera: linhas=1

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).