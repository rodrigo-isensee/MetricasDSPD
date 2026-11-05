Agente destino: forge:node-backend
Pedido: 060-triagem-dependabot
Tipo: codigo
Branch: feature/060-api-so-real   Base: develop   Base-sha: d05bbfccaba07f5a5d4bdf7932b396291c0e7ee9
Etapa: codigo   Cobre: E2.12

## Objetivo
Volta 2 da E2.12: trazer a develop, que já tem o P1 mesclado, para a branch da API, para o diff contra a develop mostrar só a E2.12 (pedido 060, E2.12, K-195). Worktree `/home/rodrigoisensee/MetricasDSPD-052f`, branch `feature/060-api-so-real` (ponta 45db69a24c10c5cc77cd58dc460d258d10294fbd).

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052f log --oneline origin/develop -3`; o P1 entrou na develop por squash em 3c284ff9e5329b1b171ac74cabec70bc9e3fd839.

## Entregar
- "E2.12 (node-backend): P2 e P3 (API sem modo mock, recusa de DADOS_FONTE e DSPD_SCHEMA_PREFIXO_SEED, métrica fora do mapa real responde sem dado real com motivo, PV1 e BLOQUEADOS no mapa real, VISAO_GERAL responde sem dado real em vez de 503, recomendados A1, A2 e A4 do review do P1, e a parte de servidor do P5: mock só por ativação explícita, com DSPD_MODO_MOCK no compose de homologação)." (E2.12)
- (E2.12) A etapa já está entregue em 0ea6246 e 45db69a (P2, P3, a parte de servidor do P5 no compose de homologação, A1, A2, A4 e a guarda do webhook); esta volta não refaz nada disso.
- (E2.12) `git -C /home/rodrigoisensee/MetricasDSPD-052f fetch origin develop`; `git -C /home/rodrigoisensee/MetricasDSPD-052f merge origin/develop` (sem rebase e sem force), resolvendo conflito, se houver, pela versão já mesclada do P1 na develop; depois `git -C /home/rodrigoisensee/MetricasDSPD-052f diff --stat origin/develop...HEAD` mostra só arquivos da E2.12.
- (E2.12) `pnpm run pronto` verde e `test:pg` verde, exceto `apontamento-rota.pg` quando a falha for só a autenticação do papel `dspd_api_apontamento` (relatar a mensagem literal); push com `git -C /home/rodrigoisensee/MetricasDSPD-052f push origin HEAD:refs/heads/feature/060-api-so-real`; sem PR.

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
- ADR 0023 (citada no pedido): citada no pedido; a revisão dela é etapa do pedido 061; esta entrega não muda a forma de leitura do Acelerato
- ADR 0026 (citada no pedido): decide P1 a P3 e o A3; esta volta só integra a develop
- 2026-11-02 20:23: DECISÃO DO DONO  "A": tocar tudo durante a noite. Etapas E2.11 a E2.18, E3.4 a E3.6 e E4 abertas. DECISÃO TÉCNICA (Jarvis): primeira leva em paralelo: E2.11 (arquiteto), E2.18 e E4.1 (tech-lead), E2.12 (node-backend, worktree 052f) e a revisão das ADRs do 061 (segunda instância do arquiteto); E2.13 depois do contrato de P3.
- 2026-11-02 21:32: E2.8 cumprida pelo tech-lead: PR 202 do P1 mesclado (squash) na develop em 3c284ff9e5329b1b171ac74cabec70bc9e3fd839, checks verdes, forge-check pr limpo. O seed já não grava na base real na develop. Pendente: limpeza da branch e da worktree 052d (R-FLUXO); a branch da E2.12 nasceu do P1 e vai trazer a develop antes do PR. MELHORIA: o hook parecer aceita gh pr merge só pelo nome da branch; os briefs passam a usar essa forma.
- 2026-11-02 21:46: conferência de entrega da volta 1 da E2.12: não cumpriu (o Desde do pedido passou a ser a conferida de outra branch, dc3f3f6, que não é ancestral desta; e o compose de homologação, parte de servidor do P5, não estava no texto da etapa). DECISÃO TÉCNICA (Jarvis): o texto da E2.12 passa a nomear a parte de servidor do P5 (já decidida às 20:29); volta 2 da E2.12 ao node-backend: trazer a develop (com o P1 mesclado em 3c284ff) para a branch por merge, sem force, para o diff contra a develop mostrar só a E2.12; brief novo com Base-sha na develop atual. MELHORIA (Forge): o Desde da conferência é por pedido e não por branch; com duas branches no mesmo pedido, a conferida de uma quebra a conferência da outra.
- 2026-11-02 21:51: DECISÃO TÉCNICA (Jarvis), corrige a de 21:46: o brief da volta 2 da E2.12 fica com Base-sha d05bbfccaba07f5a5d4bdf7932b396291c0e7ee9, o ponto comum atual da branch com a develop, porque o forge-check exige base contida na branch (BRIEF-BASE-ATUAL); o merge da develop (3c284ff9e5329b1b171ac74cabec70bc9e3fd839) entra pela própria volta, e o diff contra a develop depois do merge mostra só a E2.12.
- O agente nunca abre nem lê o `.env`; não roda seed, coleta nem limpeza na base do dono.
- O GitHub precisa de `github.com` em `allowed_domains`; recusa de hook ou do sandbox: pare e relate a mensagem literal. R-VERIFY: nunca `--no-verify` nem `--force`.
- O `.git/config.lock` do repositório principal está parado: branch nova com `--no-track`, push sem `-u` (`git push origin HEAD:refs/heads/<branch>`).
- Regras invioláveis do CLAUDE.md: BusinessMap e Acelerato nunca se misturam; abaixo de 20 itens não publicar; nenhuma métrica pode servir para avaliação individual; nenhuma métrica com cálculo próprio fora da biblioteca.
- Recursos (dono): no máximo 1 tarefa pesada por vez na máquina, vitest com no máximo 4 workers, antes da suíte MemAvailable acima de 3000 MB e load abaixo de 7; a trava da suíte única fica em `/tmp`; se o sandbox barrar, relate.
- NÃO tocar: o web, os arquivos `.env*`, o `CLAUDE.md`, as outras worktrees e a `main`.

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
- "E2.14 (tech-lead): review de P2 a P5." · etapa de outra delegação; continua no pedido
- "E2.15 (security-engineer): parecer de segurança de P2 a P5." · etapa de outra delegação; continua no pedido
- "E2.16 (qa-engineer): QA de P2 a P5." · etapa de outra delegação; continua no pedido
- "E2.17 (tech-lead): PR e merge de P2 a P5 na develop." · etapa de outra delegação; continua no pedido
- "E2.18 (tech-lead): commit e PR só de documentação dos documentos do discovery do 060 (060-sem-mock, visão geral do UX e do arquiteto) para a develop." · etapa de outra delegação; continua no pedido
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
- PQ-1 (push): `git -C /home/rodrigoisensee/MetricasDSPD-052f ls-remote origin refs/heads/feature/060-api-so-real` · espera: linhas=1
- PQ-2 (cmd): `pnpm -C /home/rodrigoisensee/MetricasDSPD-052f run pronto` · espera: rc=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).