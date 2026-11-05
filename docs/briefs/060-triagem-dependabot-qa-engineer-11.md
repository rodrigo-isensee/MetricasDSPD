Agente destino: forge:qa-engineer
Pedido: 060-triagem-dependabot
Tipo: codigo
Branch: feature/060-api-so-real   Base: develop   Base-sha: 5ac7ace82332273ca7ca728f6e327876fa9148fa
Etapa: qa   Cobre: E2.32

## Objetivo
Regravar o parecer de QA das guardas do seed na branch da API citando a ponta de código 0183e430d6b3df391a60320abc652022d0f17aab, para o forge-check pr do PR da API sair limpo, como o dono decidiu (pedido 060, E2.32, K-195). Worktree `/home/rodrigoisensee/MetricasDSPD-052f`, branch `feature/060-api-so-real`.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052f/docs/qa/060-guardas-seed.md`; `git -C /home/rodrigoisensee/MetricasDSPD-052f diff b1104f3b9c148aa40bd870a21a49f77a8dd55476 0183e430d6b3df391a60320abc652022d0f17aab --stat -- server/src/modulos/acelerato server/src/modulos/businessmap server/src/plataforma/db server/tests` (para confirmar que o código das guardas não mudou).

## Entregar
- "E2.32 (qa-engineer): na branch feature/060-api-so-real, regravar pela ferramenta Write o parecer docs/qa/060-guardas-seed.md com o `commit:` 0183e43 e uma linha dizendo que o código revisado não mudou." (E2.32)
- (E2.32) `git -C /home/rodrigoisensee/MetricasDSPD-052f pull --ff-only origin feature/060-api-so-real`; confirmar pelo diff do Ler que os 11 arquivos das guardas não mudaram entre b1104f3 e 0183e430d6b3df391a60320abc652022d0f17aab; regravar `docs/qa/060-guardas-seed.md` com `commit:` 0183e430d6b3df391a60320abc652022d0f17aab e, no fim, a linha "Histórico: 2026-11-03, commit atualizado para a ponta da branch da API; o código das guardas revisado em b1104f3 não mudou."; commit só do parecer com `Cartão: K-195`; push com `git -C /home/rodrigoisensee/MetricasDSPD-052f push origin HEAD:refs/heads/feature/060-api-so-real`; sem PR. Se o código das guardas tiver mudado: pare e relate.

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
- DECISÃO DO DONO (2026-11-03): "A" (liberar o PR da API): o security-engineer regrava com Write o parecer de segurança das guardas; os três pareceres das guardas (review, segurança e QA) passam a citar a ponta da branch da API, com uma linha dizendo que o código revisado não mudou; depois o PR da API abre com o forge-check pr limpo, sem contornar a checagem.
- DECISÃO DO DONO (2026-11-02): "A" (tocar tudo durante a noite): implementar P2 a P5 do plano 060-sem-mock, a coleta diária do 061 com as revisões das ADRs 0022 e 0023, e a Visão Geral validada depois de P2 e P3; cada parte com review, segurança e QA até a develop; nada na main sem o dono.
- ADR 0023 (citada no pedido): citada no pedido; não muda nesta etapa
- ADR 0026 (citada no pedido): decide o A3; não muda nesta etapa
- 2026-11-03 04:00: E2.17 parada antes de começar: `forge-check pr 060-triagem-dependabot --ref origin/feature/060-api-so-real --base origin/develop` sai rc=1 só pelos pareceres da branch das guardas (já mesclados na develop pelo PR 205): os três com `commit:` b1104f3 dados como desatualizados porque a branch da API muda docker-compose.homolog.yml, e o de segurança das guardas sem registro de autoria (foi editado por script na volta 1 da E2.25). O comando lê todos os pareceres do pedido e ignora o campo `branch:` de cada um. Nenhum achado sobre os pareceres da API. DECISÃO TÉCNICA (Jarvis): não abrir o PR com o forge-check pr vermelho (R-CONFORMIDADE); o caso vai ao dono com recomendação; melhoria para o Forge: forge-check pr filtrar os pareceres pelo campo branch. A autoria do parecer de segurança das guardas se corrige com o security-engineer regravando-o com Write.
- 2026-11-03 06:36: dono escolheu "A" para liberar o PR da API. DECISÃO TÉCNICA (Jarvis): etapas E2.30 a E2.32 na branch da API, em paralelo, cada uma com commit só do próprio parecer (commit --only); `commit:` 0183e43 (a ponta de código; depois dela só mudam pareceres); depois o PR (E2.17) com brief novo.
- O GitHub precisa de `github.com` em `allowed_domains`; recusa de hook, do sandbox ou do classificador: pare e relate a mensagem literal. R-VERIFY: nunca `--no-verify` nem `--force`.
- O parecer é regravado inteiro pela ferramenta Write (nunca por script ou Bash), mantendo veredito, achados (até 300 caracteres cada, contando o `- `), `pedido:` e `branch:` do parecer original; muda só o `commit:` e entra a linha de histórico.
- Outros dois pareceres das guardas são regravados em paralelo na mesma branch: pull antes do commit, em chamada separada; commit só do próprio parecer com `git -C /home/rodrigoisensee/MetricasDSPD-052f commit --only -m <mensagem> -- <parecer>`; push recusado: conferir com `git -C /home/rodrigoisensee/MetricasDSPD-052f ls-remote origin feature/060-api-so-real` antes de repetir o pull e o push.
- NÃO tocar: código, testes, os pareceres da API, os outros pareceres das guardas, o `CLAUDE.md`, as outras worktrees e a `main`.

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
- "E2.12 (node-backend): P2 e P3 (API sem modo mock, recusa de DADOS_FONTE e DSPD_SCHEMA_PREFIXO_SEED, métrica fora do mapa real responde sem dado real com motivo, PV1 e BLOQUEADOS no mapa real, VISAO_GERAL responde sem dado real em vez de 503, recomendados A1, A2 e A4 do review do P1, e a parte de servidor do P5: mock só por ativação explícita, com DSPD_MODO_MOCK no compose de homologação)." · etapa de outra delegação; continua no pedido
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
- "E2.28 (node-backend): branch feature/060-guardas-seed a partir da develop, com os 11 arquivos das guardas do seed no estado de 110e467, sem mudar código." · etapa de outra delegação; continua no pedido
- "E2.29 (tech-lead): trazer a develop (com as guardas do seed, 5ac7ace) para a branch feature/060-api-so-real por merge commit, sem mudar código além da resolução de conflito, e enviar." · etapa de outra delegação; continua no pedido
- "E2.30 (security-engineer): na branch feature/060-api-so-real, regravar pela ferramenta Write o parecer docs/security/060-guardas-seed.md com o `commit:` 0183e43 e uma linha dizendo que o código revisado não mudou." · etapa de outra delegação; continua no pedido
- "E2.31 (tech-lead): na branch feature/060-api-so-real, regravar pela ferramenta Write o parecer docs/reviews/060-guardas-seed.md com o `commit:` 0183e43 e uma linha dizendo que o código revisado não mudou." · etapa de outra delegação; continua no pedido
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
- PQ-1 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-052f log --format=%H -1 origin/feature/060-api-so-real -- docs/qa/060-guardas-seed.md` · espera: linhas=1
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052f show origin/feature/060-api-so-real:docs/qa/060-guardas-seed.md | grep -c '^commit: 0183e430d6b3df391a60320abc652022d0f17aab'` · espera: igual '1'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).