Agente destino: forge:node-backend
Pedido: 060-triagem-dependabot
Tipo: codigo
Branch: feature/060-seed-recusa-real   Base: develop   Base-sha: d05bbfccaba07f5a5d4bdf7932b396291c0e7ee9
Etapa: codigo   Cobre: E2.3

## Objetivo
Implementar o P1 do plano: o seed nunca grava na base real e a coleta nunca roda sobre seed, para não misturar dado real com fictício (pedido 060, E2.3, K-195, urgente). Worktree `/home/rodrigoisensee/MetricasDSPD-052d`, branch nova `feature/060-seed-recusa-real`.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052b/docs/architecture/060-sem-mock.md`, seções Mapa (portas G1 a G6) e Plano, item P1.
- `server/src/plataforma/db/seed.ts`, `seed-cli.ts`, `limpar-seed.ts`, `scripts/db.sh`, `package.json` da raiz, e os pontos de entrada da coleta e do projetor do BusinessMap e do Acelerato.

## Entregar
- "E2.3 (node-backend): P1 do plano docs/architecture/060-sem-mock.md: o seed recusa esquema com coleta real e exige PG_SEED_URL, o db:seed da raiz sai, a coleta recusa esquema com seed; testes test:pg." (E2.3)
- (E2.3) `git -C /home/rodrigoisensee/MetricasDSPD-052d fetch origin develop`; `git -C /home/rodrigoisensee/MetricasDSPD-052d switch --no-track -c feature/060-seed-recusa-real origin/develop`.
- (E2.3) `semear()` recusa, antes de escrever e dentro da trava `dspd:seed`, esquema com `ctl_coleta` de coletor que não seja `seed-mock` ou com `dim_card`/`dim_chamado` de coleta real; falha fechada com mensagem só de tabela e contagem.
- (E2.3) `seed-cli` exige `PG_SEED_URL` e não cai mais em `PG_MIGRADOR_URL`; `homolog:subir`, a restauração da CI e o `com-api-mock` passam a defini-la; o script `db:seed` da raiz e o ramo `seed` do `scripts/db.sh` saem; a documentação que manda regerar o mock (`docs/architecture/server.md`, passo 4) é atualizada.
- (E2.3) A coleta e o projetor do BusinessMap e do Acelerato recusam esquema com coleta `seed-mock`.
- (E2.3) Testes `test:pg`: seed recusado com coleta real; aceito em esquema vazio; sem `PG_SEED_URL` falha na partida; coleta recusada com seed. `pnpm run pronto` verde na raiz da worktree.
- (E2.3) Commits pela seção de commits do `docs/engineering/praticas.md` com `Cartão: K-195`, `git add` por caminho; push com `git -C /home/rodrigoisensee/MetricasDSPD-052d push origin HEAD:refs/heads/feature/060-seed-recusa-real`; sem PR.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-02): "isso" (recibo da triagem): o security-engineer tria os 15 alertas do Dependabot só lendo, com parecer e recomendação por alerta; nenhuma dependência é atualizada e nenhum alerta é dispensado nesta etapa; a correção vira pedido próprio depois da escolha do dono.
- DECISÃO DO DONO (2026-11-02): "B para as métricas prontas com dados reais funcionando e que ele não regere com dados fakes": o painel deixa de usar o mock e nada regera dado fictício.
- DECISÃO DO DONO (2026-11-02): "É isso é urgente para não misturar dados reais com falsos" (recibo do E2): o software-architect levanta onde o painel e a API leem o mock e o que regera dado fictício e traz o plano; a base real não é tocada nesta etapa; prioridade urgente.
- DECISÃO DO DONO (2026-11-02): "A" (autorizar o P1 já): o P1 do plano 060-sem-mock (seed nunca grava na base real; coleta recusa esquema com seed) começa agora, num PR próprio para a develop, antes das perguntas Q1 a Q5.
- ADR 0023 (citada no pedido): coleta do Acelerato; a recusa de esquema com seed vale também para essa coleta, sem mudar a forma de leitura
- 2026-11-02 19:29: recibo do E2 confirmado pelo dono: "É isso é urgente para não misturar dados reais com falsos". Cartão K-195, urgente. DECISÃO TÉCNICA (Jarvis): o discovery do E2.1 escreve o plano em docs/architecture/060-sem-mock.md na worktree 052b, branch docs/060-triagem-dependabot (mesmo pedido, sem arquivo em comum com o parecer da triagem); o commit fica para o tech-lead depois da validação do dono.
- 2026-11-02 19:43: DECISÃO DO DONO "A": autorizar o P1 já, antes de Q1 a Q5. DECISÃO TÉCNICA (Jarvis): P1 na worktree 052d (branch mesclada feature/059-coleta-worklog, limpa), branch nova feature/060-seed-recusa-real a partir da develop d05bbfccaba07f5a5d4bdf7932b396291c0e7ee9, criada com --no-track e enviada sem -u, porque o .git/config.lock parado desde 04:20 impede gravar o config.
- O agente nunca abre nem lê o `.env`; não roda seed, coleta nem limpeza na base do dono; só `test:pg` no banco de teste.
- O `.git/config.lock` do repositório principal está parado: crie a branch com `--no-track` e envie sem `-u`; recusa de hook ou do sandbox: pare e relate a mensagem literal.
- R-VERIFY: nunca `--no-verify` nem `--force`.
- Uma suíte de teste por vez na máquina (teto de recursos).
- NÃO tocar: o `.env`, os arquivos de mock da web, o modo mock da API (P2), o `CLAUDE.md`, as outras worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (security-engineer): triagem dos alertas pela API do GitHub (só leitura) e pelo lockfile da develop, com parecer em docs/security/060-triagem-dependabot.md, sem mexer em dependência." · etapa de outra delegação; continua no pedido
- "E1.2 (dono): escolher o que corrigir; a correção vira pedido de implementação próprio." · etapa de outra delegação; continua no pedido
- "E2.1 (software-architect): discovery: onde o painel e a API ainda leem o mock e quais comandos ou rotinas regeram dados fictícios; plano para tirar o mock da leitura e bloquear a regeração." · etapa de outra delegação; continua no pedido
- "E2.2 (dono): confirmar o recibo e validar o plano." · etapa de outra delegação; continua no pedido
- "E2.4 (tech-lead): code review do P1." · etapa de outra delegação; continua no pedido
- "E2.5 (security-engineer): parecer de segurança do P1 (banco e configuração)." · etapa de outra delegação; continua no pedido
- "E2.6 (qa-engineer): QA do P1." · etapa de outra delegação; continua no pedido
- "E2.7 (tech-lead): PR do P1 para a develop." · etapa de outra delegação; continua no pedido
- "E2.8 (tech-lead): merge (squash) do PR do P1." · etapa de outra delegação; continua no pedido
- "E2.9 (dono): perguntas Q1 a Q5 do plano, que decidem P2 a P5." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (push): `git -C /home/rodrigoisensee/MetricasDSPD-052d ls-remote origin refs/heads/feature/060-seed-recusa-real` · espera: linhas=1
- PQ-2 (cmd): `pnpm -C /home/rodrigoisensee/MetricasDSPD-052d run pronto` · espera: rc=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).