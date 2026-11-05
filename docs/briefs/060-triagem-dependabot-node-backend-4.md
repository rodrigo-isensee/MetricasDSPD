Agente destino: forge:node-backend
Pedido: 060-triagem-dependabot
Tipo: codigo
Branch: feature/060-api-so-real   Base: develop   Base-sha: d05bbfccaba07f5a5d4bdf7932b396291c0e7ee9
Etapa: codigo   Cobre: E2.12

## Objetivo
P2 e P3 do plano sem mock: a API só com dado real (pedido 060, E2.12, K-195). Worktree `/home/rodrigoisensee/MetricasDSPD-052f`, branch nova `feature/060-api-so-real` a partir da `feature/060-seed-recusa-real` (o P1, ainda sem PR).

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052b/docs/architecture/060-sem-mock.md`, seções Mapa e Plano, itens P2 e P3, achados A12 e A13; `/home/rodrigoisensee/MetricasDSPD-052d/docs/reviews/060-seed-recusa-real.md` (A1, A2, A4) e `docs/security/060-seed-recusa-real.md` (A1) na branch do P1.

## Entregar
- "E2.12 (node-backend): P2 e P3 (API sem modo mock, recusa de DADOS_FONTE e DSPD_SCHEMA_PREFIXO_SEED, métrica fora do mapa real responde sem dado real com motivo, PV1 e BLOQUEADOS no mapa real, VISAO_GERAL responde sem dado real em vez de 503, recomendados A1, A2 e A4 do review do P1)." (E2.12)
- (E2.12) `git -C /home/rodrigoisensee/MetricasDSPD-052f fetch origin feature/060-seed-recusa-real`; `git -C /home/rodrigoisensee/MetricasDSPD-052f switch --no-track -c feature/060-api-so-real origin/feature/060-seed-recusa-real`.
- (E2.12) P2, com a parte de servidor do P5: o padrão da API é só dado real; o modo mock só sobe por ativação explícita no ambiente de homologação e nos testes e E2E (Q3 e Q5), com selo global, e a API recusa subir com `DADOS_FONTE` ou `DSPD_SCHEMA_PREFIXO_SEED` fora desses ambientes; as extensões e a PV1 fictícias saem da partida padrão; os arquivos de mock do server ficam só para a homologação e os testes.
- (E2.12) P3: métrica fora de `METRICAS_ORIGEM_REAL` responde o estado sem dado real com o motivo, sem número (contrato e schema atualizados); PV1 e BLOQUEADOS entram no mapa real; teste que exige motivo para toda métrica fora do mapa.
- (E2.12) VISAO_GERAL responde o estado sem dado real com motivo (Q4), sem o 503 que hoje vem de estar em `METRICAS_COM_ALVOS`.
- (E2.12) Recomendados do P1: a guarda da coleta toma a trava `dspd:seed` (A1); a guarda do Acelerato dentro da trava e com log (A2); nome da variável de contagem em `seed.ts:240` (A4).
- (E2.12) Testes unitários e `test:pg`; `pnpm run pronto` verde; contrato da API atualizado em `docs/api`; commits com `Cartão: K-195`, `git add` por caminho; push com `git -C /home/rodrigoisensee/MetricasDSPD-052f push origin HEAD:refs/heads/feature/060-api-so-real`; sem PR.

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
- 2026-11-02 19:45: DECISÃO DO DONO "A" na Q1 (cartão sem dado real): estado "Sem dado real" com o motivo, sem número. Faltam Q2 a Q5.
- 2026-11-02 19:47: DECISÃO DO DONO "A" na Q2 (PV1 no mapa real agora). O dono acrescentou: "logo devo publicar o sistema daí preciso entender como programar essa coleta diariamente"; vira o pedido 061 (recibo pendente). Faltam Q3 a Q5.
- 2026-11-02 20:03: E3.2 cumprida pelo software-architect: docs/architecture/060-visao-geral.md (worktree 052b, sem commit). Com dado real: 4 de 11 indicadores, 4 de 12 alertas, 1 de 4 linhas de Espera; o resto "sem dado real" com motivo. Bloqueios V-1 (VISAO_GERAL em METRICAS_COM_ALVOS dá 503 na base real) e V-2 (presume limite de WIP do O1). Recomenda contrato C: rota única com dois blocos de domínio independentes, nenhum agregado entre eles. Etapas V0 (ADR) a V3 (QA), dependem de P2 e P3. PERGUNTAS ao dono, para depois do desenho do UX: QV1 (BLOQUEADOS no mapa real) e QV2 (corte por domínio ou comum).
- 2026-11-02 20:03: E3.1 cumprida pelo ux-designer: docs/ux/060-visao-geral.md (worktree 052b, sem commit). Dois blocos independentes, A (BusinessMap) e B (Acelerato), sem total nem alerta único; cartão "Sem dado real" com motivo; estados por bloco; 16 critérios de aceite. Recomenda blocos lado a lado. PERGUNTAS ao dono (E3.3), depois das da coleta: validar o desenho, P1 a P3 do UX (cartões sem fonte visíveis ou recolhidos, disposição, exportação) e QV1, QV2 do arquiteto.
- 2026-11-02 20:15: E2.4 cumprida pelo tech-lead: review docs/reviews/060-seed-recusa-real.md aprovado em 63a9d91 sem bloqueante (5361c6e34ee6a70054e3dc58af4ccdca1bbfb663, na origin pela ponta f0299b0). Recomendados: A1 travas diferentes entre seed e coleta; A2 guarda do Acelerato fora da trava e sem log; A3 webhook do BusinessMap grava em esquema com seed (decisão do arquiteto); A4 nome da variável cards em seed.ts:240. Condição da E2.7: o corpo do PR traz a linha teto: excedido com as linhas recontadas (350 sem .md). DECISÃO TÉCNICA (Jarvis): o QA (E2.6) começa já; os recomendados A1, A2 e A4 entram numa volta curta do node-backend se o QA ou a segurança devolverem, senão viram cartão; A3 vai ao arquiteto junto com o P2.
- 2026-11-02 20:15: E2.5 cumprida pelo security-engineer: parecer docs/security/060-seed-recusa-real.md aprovado sem bloqueante (f0299b00a29502ae54df9bb396622033c39e00d4, commit: 63a9d91). Recomendado A1: a checagem da coleta não toma a trava dspd:seed (coleta.ts:253), mesmo achado A1 do review. Ferramentas de varredura fora do PATH.
- 2026-11-02 20:17: DECISÃO DO DONO "A" na E3.3: desenho da Visão Geral validado. Faltam P1 a P3 do UX, QV1, QV2 e o texto do CLAUDE.md sobre o Acelerato.
- 2026-11-02 20:18: DECISÃO DO DONO "A" no P1 do UX (cartões sem fonte visíveis). Faltam P2, P3, QV1, QV2 e o texto do CLAUDE.md.
- 2026-11-02 20:18: DECISÃO DO DONO "A" no P2 do UX (lado a lado, empilha em tela estreita). Faltam P3, QV1, QV2 e o texto do CLAUDE.md.
- 2026-11-02 20:19: DECISÃO DO DONO "A" no P3 do UX (exportação em duas partes). Faltam QV1, QV2 e o texto do CLAUDE.md.
- 2026-11-02 20:19: DECISÃO DO DONO "A" na QV1 (BLOQUEADOS no mapa real com P2 e P3). Faltam QV2 e o texto do CLAUDE.md.
- 2026-11-02 20:23: DECISÃO DO DONO  "A": tocar tudo durante a noite. Etapas E2.11 a E2.18, E3.4 a E3.6 e E4 abertas. DECISÃO TÉCNICA (Jarvis): primeira leva em paralelo: E2.11 (arquiteto), E2.18 e E4.1 (tech-lead), E2.12 (node-backend, worktree 052f) e a revisão das ADRs do 061 (segunda instância do arquiteto); E2.13 depois do contrato de P3.
- 2026-11-02 20:29: DECISÃO TÉCNICA (Jarvis): os recomendados A1, A2 e A4 do review do P1 entram na E2.12, que já mexe nas guardas da coleta (substitui a leitura de volta curta de 20:13); a E2.12 também leva a parte de servidor do P5 (mock só por ativação explícita na homologação e nos testes), para cumprir a Q3 junto com o P2.
- 2026-11-02 20:34: DECISÃO TÉCNICA (Jarvis): E2.13 e E2.12 ajustadas pela conferência (mock explícito também na homologação, pela Q3; VISAO_GERAL sem dado real em vez de 503, pela Q4). Recursos novos do dono no topo do KANBAN.md (1 tarefa pesada por vez, 4 workers).
- O agente nunca abre nem lê o `.env`; não roda seed, coleta nem limpeza na base do dono.
- O GitHub precisa de `github.com` em `allowed_domains`; recusa de hook ou do sandbox: pare e relate a mensagem literal. R-VERIFY: nunca `--no-verify` nem `--force`.
- O `.git/config.lock` do repositório principal está parado: branch nova com `--no-track`, push sem `-u` (`git push origin HEAD:refs/heads/<branch>`).
- Regras invioláveis do CLAUDE.md: BusinessMap e Acelerato nunca se misturam; abaixo de 20 itens não publicar; nenhuma métrica pode servir para avaliação individual; nenhuma métrica com cálculo próprio fora da biblioteca.
- Recursos (dono): no máximo 1 tarefa pesada por vez na máquina, vitest com no máximo 4 workers, antes da suíte MemAvailable acima de 3000 MB e load abaixo de 7; a trava da suíte única fica em `/tmp`; se o sandbox barrar, relate.
- NÃO tocar: o web (P4 é do react-frontend), o `.env`, o `CLAUDE.md`, as outras worktrees e a `main`.

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
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (push): `git -C /home/rodrigoisensee/MetricasDSPD-052f ls-remote origin refs/heads/feature/060-api-so-real` · espera: linhas=1
- PQ-2 (cmd): `pnpm -C /home/rodrigoisensee/MetricasDSPD-052f run pronto` · espera: rc=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).