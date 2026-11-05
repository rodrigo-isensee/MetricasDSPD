Agente destino: forge:security-engineer
Pedido: 060-triagem-dependabot
Tipo: codigo
Branch: feature/060-seed-recusa-real   Base: develop   Base-sha: d05bbfccaba07f5a5d4bdf7932b396291c0e7ee9
Etapa: seguranca   Cobre: E2.5

## Objetivo
Parecer de segurança do P1 (banco e configuração) (pedido 060, E2.5, K-195). Worktree `/home/rodrigoisensee/MetricasDSPD-052d`, branch `feature/060-seed-recusa-real`, ponta `63a9d91e8af463757dd373580330f7dc5a7660a8`.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052d diff d05bbfccaba07f5a5d4bdf7932b396291c0e7ee9...63a9d91e8af463757dd373580330f7dc5a7660a8` (o P1 inteiro); `/home/rodrigoisensee/MetricasDSPD-052b/docs/architecture/060-sem-mock.md`, item P1.

## Entregar
- "E2.5 (security-engineer): parecer de segurança do P1 (banco e configuração)." (E2.5)
- (E2.5) Revisão estática: a recusa falha fechada e sem dado de pessoa nem endereço na mensagem; nenhuma escrita antes da checagem; `PG_SEED_URL` sem cair em credencial do migrador; nenhum segredo novo no código, no workflow ou nos exemplos de env; a recusa da coleta sobre esquema com seed. Parecer `docs/security/060-seed-recusa-real.md` com veredito, `commit:` no sha40 da ponta revisada e bloco `## Achados`.
- (E2.5) Commit só do parecer com `Cartão: K-195`, `git add` por caminho; push com `git -C /home/rodrigoisensee/MetricasDSPD-052d push origin HEAD:refs/heads/feature/060-seed-recusa-real`; sem PR.

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
- ADR 0023 (citada no pedido): citada no Histórico pela divergência com o CLAUDE.md sobre a forma de leitura do Acelerato, decisão do dono em aberto; esta revisão não decide nem depende dela
- 2026-11-02 20:02: E2.3 cumprida pelo node-backend: P1 na branch feature/060-seed-recusa-real (63a9d91e8af463757dd373580330f7dc5a7660a8; commits ac333ed, b032aaf, 63a9d91), sem PR. Seed recusa esquema com coleta real (guarda-seed.ts), seed-cli exige PG_SEED_URL, db:seed da raiz e ramo seed do db.sh saíram, coleta e projetor do BusinessMap e do Acelerato recusam esquema com seed-mock; test:pg 33 arquivos 231 testes e pronto rc=0 (fora do sandbox pela trava em /tmp). Tocou .github/workflows/restauracao.yml (gatilho de devops) e banco e configuração (gatilho de segurança). Limites: recusa do Acelerato sem contagem na mensagem; PG_SEED_URL no com-api-mock inócua. DECISÃO TÉCNICA (Jarvis): conferente em modo entrega; depois review (E2.4), segurança (E2.5) e parecer de devops em paralelo; QA (E2.6) depois do review.
- 2026-11-02 20:05: entrega conferida 63a9d91e8af463757dd373580330f7dc5a7660a8
- O agente nunca abre nem lê o `.env`; não roda seed, coleta nem limpeza na base do dono.
- O GitHub precisa de `github.com` em `allowed_domains`; recusa de hook ou do sandbox: pare e relate a mensagem literal. R-VERIFY: nunca `--no-verify` nem `--force`.
- Outros pareceres podem ser gravados em paralelo na mesma branch: antes do commit, `git -C /home/rodrigoisensee/MetricasDSPD-052d pull --ff-only origin feature/060-seed-recusa-real`; se o push for recusado por estar atrás, repita o pull e o push.
- O pre-push e o `forge-check docs` barram frase de regra copiada (cite só o ID) e achado com mais de 300 caracteres.
- NÃO tocar: código, testes, outros pareceres, o `CLAUDE.md`, as outras worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (security-engineer): triagem dos alertas pela API do GitHub (só leitura) e pelo lockfile da develop, com parecer em docs/security/060-triagem-dependabot.md, sem mexer em dependência." · etapa de outra delegação; continua no pedido
- "E1.2 (dono): escolher o que corrigir; a correção vira pedido de implementação próprio." · etapa de outra delegação; continua no pedido
- "E2.1 (software-architect): discovery: onde o painel e a API ainda leem o mock e quais comandos ou rotinas regeram dados fictícios; plano para tirar o mock da leitura e bloquear a regeração." · etapa de outra delegação; continua no pedido
- "E2.2 (dono): confirmar o recibo e validar o plano." · etapa de outra delegação; continua no pedido
- "E2.3 (node-backend): P1 do plano docs/architecture/060-sem-mock.md: o seed recusa esquema com coleta real e exige PG_SEED_URL, o db:seed da raiz sai, a coleta recusa esquema com seed; testes test:pg." · etapa de outra delegação; continua no pedido
- "E2.4 (tech-lead): code review do P1." · etapa de outra delegação; continua no pedido
- "E2.6 (qa-engineer): QA do P1." · etapa de outra delegação; continua no pedido
- "E2.7 (tech-lead): PR do P1 para a develop." · etapa de outra delegação; continua no pedido
- "E2.8 (tech-lead): merge (squash) do PR do P1." · etapa de outra delegação; continua no pedido
- "E2.9 (dono): perguntas Q1 a Q5 do plano, que decidem P2 a P5." · etapa de outra delegação; continua no pedido
- "E2.10 (devops-engineer): parecer de devops do P1 (workflow de restauração, homolog:subir e scripts)." · etapa de outra delegação; continua no pedido
- "E3.1 (ux-designer): desenho da Visão Geral com dado real (o que mostrar, sem misturar BusinessMap e Acelerato num mesmo cálculo), em paralelo à E3.2." · etapa de outra delegação; continua no pedido
- "E3.2 (software-architect): viabilidade e fontes da Visão Geral com dado real." · etapa de outra delegação; continua no pedido
- "E3.3 (dono): validar o desenho." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-052d log --format=%H -1 origin/feature/060-seed-recusa-real -- docs/security/060-seed-recusa-real.md` · espera: linhas=1

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).