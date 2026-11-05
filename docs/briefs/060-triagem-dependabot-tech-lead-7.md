Agente destino: forge:tech-lead
Pedido: 060-triagem-dependabot
Tipo: codigo
Branch: feature/060-seed-recusa-real   Base: develop   Base-sha: d05bbfccaba07f5a5d4bdf7932b396291c0e7ee9
Etapa: pr   Cobre: E2.7

## Objetivo
Abrir o PR do P1 (o seed nunca grava na base real) para a develop (pedido 060, E2.7, K-195). Worktree `/home/rodrigoisensee/MetricasDSPD-052d`, branch `feature/060-seed-recusa-real`.

## Ler
- `gh pr list --head feature/060-seed-recusa-real`; os pareceres de review, segurança, devops e QA da branch (`docs/reviews`, `docs/security`, `docs/devops` e `docs/qa`, arquivos `060-seed-recusa-real.md`).

## Entregar
- "E2.7 (tech-lead): PR do P1 para a develop." (E2.7)
- (E2.7) `git -C /home/rodrigoisensee/MetricasDSPD-052d pull --ff-only origin feature/060-seed-recusa-real`; `forge-check pr 060-triagem-dependabot --raiz /home/rodrigoisensee/MetricasDSPD-052d --ref HEAD --base origin/develop` limpo (achado: pare e relate).
- (E2.7) `gh pr create --base develop --head feature/060-seed-recusa-real` com título citando o P1 do pedido 060, corpo com o que muda, os quatro pareceres aprovados, os recomendados que ficaram para a E2.12 (A1, A2 e A4 do review e o A1 do QA) e o A3 já decidido na ADR 0026, e a linha `teto: excedido, <n> linhas` com o número recontado de código e teste sem `.md` (condição do review); sem merge, sem `--admin`; relatar número e URL.

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
- ADR 0023 (citada no pedido): citada no pedido; a revisão dela é etapa do pedido 061; este PR não muda a forma de leitura do Acelerato
- ADR 0026 (citada no pedido): ADR do plano sem mock, ainda sem commit (vai com a E2.18); o P1 segue o item P1 dela
- 2026-11-02 20:13: E2.10 cumprida pelo devops-engineer: parecer docs/devops/060-seed-recusa-real.md aprovado sem bloqueante (a4752ff652fa0c83174d9ccf371724d40bf22bce, commit: 63a9d91); recomendado sem ação: PG_SEED_URL inócua no com-api-mock.sh; actionlint fora do PATH.
- 2026-11-02 20:15: E2.4 cumprida pelo tech-lead: review docs/reviews/060-seed-recusa-real.md aprovado em 63a9d91 sem bloqueante (5361c6e34ee6a70054e3dc58af4ccdca1bbfb663, na origin pela ponta f0299b0). Recomendados: A1 travas diferentes entre seed e coleta; A2 guarda do Acelerato fora da trava e sem log; A3 webhook do BusinessMap grava em esquema com seed (decisão do arquiteto); A4 nome da variável cards em seed.ts:240. Condição da E2.7: o corpo do PR traz a linha teto: excedido com as linhas recontadas (350 sem .md). DECISÃO TÉCNICA (Jarvis): o QA (E2.6) começa já; os recomendados A1, A2 e A4 entram numa volta curta do node-backend se o QA ou a segurança devolverem, senão viram cartão; A3 vai ao arquiteto junto com o P2.
- 2026-11-02 20:15: E2.5 cumprida pelo security-engineer: parecer docs/security/060-seed-recusa-real.md aprovado sem bloqueante (f0299b00a29502ae54df9bb396622033c39e00d4, commit: 63a9d91). Recomendado A1: a checagem da coleta não toma a trava dspd:seed (coleta.ts:253), mesmo achado A1 do review. Ferramentas de varredura fora do PATH.
- 2026-11-02 20:30: E2.6 cumprida pelo qa-engineer: QA do P1 aprovado sem bug (95e18de, ponta testada f0299b00a29502ae54df9bb396622033c39e00d4); quatro casos do plano verdes, vermelho antes do verde na base, test:pg 231 testes, pronto rc=0 (fora do sandbox). Recomendado A1: checagem de itens redundante com a de coletas.
- 2026-11-02 20:36: o forge-check pr da branch do P1 acusa: parecer de devops com o campo pedido 060-seed-recusa-real (não reconhecido para o pedido 060-triagem-dependabot); pareceres de QA e de segurança sem registro de autoria da versão atual. DECISÃO TÉCNICA (Jarvis): voltas curtas nas etapas E2.10 (devops corrige o campo pedido), E2.5 e E2.6 (segurança e QA regravam o próprio parecer pela ferramenta Write, sem mudar veredito), em paralelo; depois a E2.7. O recomendado do QA (checagem de itens redundante) entra na E2.12 junto com A1, A2 e A4; o A3 fica na E2.11.
- 2026-11-02 20:52: E2.10 (volta) cumprida pelo devops-engineer: campo pedido do parecer de devops corrigido (55b1e528f801f0fae114bf885a80c48c5214c5b2); forge-check pr da branch do P1 limpo, rc=0. Próximo: E2.7 (PR do P1).
- O GitHub precisa de `github.com` e `api.github.com` em `allowed_domains`; recusa de hook, do sandbox ou do classificador: pare e relate a mensagem literal. R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`.
- A main é do dono; este PR vai só para a develop.
- NÃO tocar: código, testes, pareceres, o `CLAUDE.md`, as outras worktrees e a `main`; sem merge.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (security-engineer): triagem dos alertas pela API do GitHub (só leitura) e pelo lockfile da develop, com parecer em docs/security/060-triagem-dependabot.md, sem mexer em dependência." · etapa de outra delegação; continua no pedido
- "E1.2 (dono): escolher o que corrigir; a correção vira pedido de implementação próprio." · etapa de outra delegação; continua no pedido
- "E2.1 (software-architect): discovery: onde o painel e a API ainda leem o mock e quais comandos ou rotinas regeram dados fictícios; plano para tirar o mock da leitura e bloquear a regeração." · etapa de outra delegação; continua no pedido
- "E2.2 (dono): confirmar o recibo e validar o plano." · etapa de outra delegação; continua no pedido
- "E2.3 (node-backend): P1 do plano docs/architecture/060-sem-mock.md: o seed recusa esquema com coleta real e exige PG_SEED_URL, o db:seed da raiz sai, a coleta recusa esquema com seed; testes test:pg." · etapa de outra delegação; continua no pedido
- "E2.4 (tech-lead): code review do P1." · etapa de outra delegação; continua no pedido
- "E2.5 (security-engineer): parecer de segurança do P1 (banco e configuração)." · etapa de outra delegação; continua no pedido
- "E2.6 (qa-engineer): QA do P1." · etapa de outra delegação; continua no pedido
- "E2.8 (tech-lead): merge (squash) do PR do P1." · etapa de outra delegação; continua no pedido
- "E2.9 (dono): perguntas Q1 a Q5 do plano, que decidem P2 a P5." · etapa de outra delegação; continua no pedido
- "E2.10 (devops-engineer): parecer de devops do P1 (workflow de restauração, homolog:subir e scripts)." · etapa de outra delegação; continua no pedido
- "E2.11 (software-architect): ADR do plano sem mock (P1 a P3, mapa real com PV1 e BLOQUEADOS) e decisão sobre o A3 do review (webhook do BusinessMap em esquema com seed)." · etapa de outra delegação; continua no pedido
- "E2.12 (node-backend): P2 e P3 (API sem modo mock, recusa de DADOS_FONTE e DSPD_SCHEMA_PREFIXO_SEED, métrica fora do mapa real responde sem dado real com motivo, PV1 e BLOQUEADOS no mapa real, VISAO_GERAL responde sem dado real em vez de 503, recomendados A1, A2 e A4 do review do P1)." · etapa de outra delegação; continua no pedido
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
- PQ-1 (pr): `gh pr list --head feature/060-seed-recusa-real --base develop --state open --json number --jq length` · espera: igual '1'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).