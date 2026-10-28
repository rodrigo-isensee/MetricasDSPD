Agente destino: forge:qa-engineer
Pedido: 042-forge-0-30-3-e-retomada
Tipo: qa
Branch: forge/upgrade-0.30.3   Base: develop   Base-sha: 9cc84d3861b323fb84818a1458dc97cbfd09ae9b
Etapa: qa

## Objetivo
Etapa E1.3 do pedido 042 (cartão K-140): parecer de QA da atualização para o Forge 0.30.3 no head 9a32f8ba70e0a72ff2ab4e93adcefdc33971a78d da `forge/upgrade-0.30.3` (já com a develop 9cc84d3 e o review revalidado), para o tech-lead abrir o PR. Worktree `/home/rodrigoisensee/MetricasDSPD-upgrade`.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-upgrade diff --stat origin/develop...HEAD` (esperado: `.forge/versao` e `docs/reviews/042-forge-0-30-3.md`).
- `/home/rodrigoisensee/MetricasDSPD-upgrade/docs/reviews/042-forge-0-30-3.md`: frontmatter e achados.

## Entregar
- (E1, E1.3) CI do head: `gh run list --branch forge/upgrade-0.30.3 --limit 3` e `gh run view` do run de push de 9a32f8b (40655762748); se ainda em curso, espere terminar (`gh run watch 40655762748 --exit-status`). Registre o resultado de cada job.
- (E1, E1.3) `pnpm run pronto` na raiz da worktree `/home/rodrigoisensee/MetricasDSPD-upgrade`, uma vez, quando nenhuma outra suíte estiver rodando (Decisões); registre rc e o resumo.
- (E1, E1.3) Parecer em `docs/qa/042-forge-0-30-3.md` (frontmatter com `veredito:` e `commit: 9a32f8ba70e0a72ff2ab4e93adcefdc33971a78d`; seção `## Achados`, cada achado com severidade e bloqueante ou não), gravado pela ferramenta de escrita; commit com `git add` explícito desse caminho e `Cartão: K-140`; push sem `--force`, sem PR.
- (E2, E3, E4) Nada a entregar aqui: não nesta delegação (as etapas deles estão no Fora do escopo).

## Fora do escopo
- "E1.1 (dono): no terminal, na raiz do projeto: `forge-upgrade` (cria a branch `forge/upgrade-0.30.3` com o commit da versão; nada vai ao GitHub)." · etapa de outra delegação; continua no pedido
- "E1.2 (forge:tech-lead): push da branch, PR para a develop, parecer de review, merge por squash depois do QA, limpeza da branch." · push e review já entregues (9a32f8b); PR e merge vêm depois deste parecer
- "E2.1 (dono): Docker Engine no WSL (sudo; decisão A do 040), `cp .env.example .env`, Node 24 pelo nvm, `sudo` das dependências do Chromium (`pnpm exec playwright install-deps chromium`), `forge doutor` no terminal (proteção do git e branch homolog) e `/sandbox`." · etapa de outra delegação; continua no pedido
- "E2.2 (forge:tech-lead): `pnpm install --frozen-lockfile` e `pnpm exec playwright install chromium`." · etapa de outra delegação; continua no pedido
- "E2.3 (forge:devops-engineer): banco (db:up, db:migrate, db:seed) e consulta de prova." · etapa de outra delegação; continua no pedido
- "E3.1 (forge:software-architect): E2.3 do 041 (ADR 0003, regra do F4), sem depender do ambiente." · etapa de outra delegação; continua no pedido
- "E3.2 (forge:qa-engineer, forge:devops-engineer, forge:tech-lead): o resto do 041 na ordem do pedido 041, depois do E2." · etapa de outra delegação; continua no pedido
- "E3.3 (forge:tech-lead): PR de docs do Jarvis, PRs do dependabot (#145, #146, #147) e K-125, depois do E2." · etapa de outra delegação; continua no pedido
- "E3.4 (forge:react-frontend): develop verde depois dos PRs do Dependabot mesclados pelo dono (K-151): lint `@typescript-eslint/no-deprecated` em `web/src/test/setup.ts:47-48` e o teste `percepcao.test.tsx` "a seção fica no fim do painel" (PV1 não acha `metrica-PV1`), em `fix/151-develop-verde`." · já entregue (2389e62, PR #149)
- "E3.5 (forge:tech-lead): code review do E3.4, push, PR para a develop e merge por squash depois do QA." · já entregue (PR #149, merge 7b5732d)
- "E3.6 (forge:qa-engineer): parecer de QA do E3.4 (CI do PR verde, `pnpm run pronto` e o fluxo do react-router 8 na E2E do painel afetado)." · já entregue (43e4002, PR #149)
- "E4.1 (forge:devops-engineer): configurar na develop os checks obrigatórios da CI (gh api), provar pela leitura da proteção e registrar em `docs/engineering/fluxo-homologacao.md` e no parecer de devops." · etapa de outra delegação; continua no pedido
- "E4.2 (forge:security-engineer): parecer de segurança da proposta de proteção da develop (branch `feature/042-protecao-develop`), na pasta de pareceres de segurança." · etapa de outra delegação; continua no pedido
- "E4.3 (forge:tech-lead): code review da branch `feature/042-protecao-develop`; push, PR para a develop e merge por squash depois dos pareceres." · etapa de outra delegação; continua no pedido
- "E4.4 (dono): acrescentar no ruleset 25003880 da develop, pelas Settings do GitHub, os checks `filtro`, `banco`, `openapi`, `imagem` e `seguranca` (decisão B; R-CONFORMIDADE: proteção de branch é do dono)." · etapa de outra delegação; continua no pedido
- Mudar código, `.forge/versao` ou o parecer de review; PR e merge; `homolog` e `main`; o quadro; ler ou editar o `.env`; as worktrees -026 e -041b.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-27): "talvez precise atualizar algo no banco ja quetroquei de maquina" (coberto pelo E2.3: banco recriado do zero, migrações e seed).
- DECISÃO DO DONO (2026-10-27): "pode usar o poder computacional disponivl para paralelizar" (lido como: agentes em paralelo até o teto de R-TETO desta máquina; suítes de teste limitadas pela memória medida, 7 GB visíveis).
- DECISÃO DO DONO (2026-10-27): pedido de origem acima (atualizar para 0.30.3 por branch e PR para a develop; retomar a fila).
- DECISÃO DO DONO (2026-10-27): integrações, opção B ("prefiro deixar para mexer nas integracoes reais quando acabar tudo porque vai consumir poder computacional que eu quero usar para entregar as coisas, temos que fazer as metricas operacionais"): integrações reais só depois de todo o backlog.
- DECISÃO DO DONO (2026-10-27): proteção da develop, opção A ("A"): a develop passa a exigir os checks da CI verdes para aceitar merge; o devops-engineer configura no GitHub e registra no fluxo de homologação.
- DECISÃO DO DONO (2026-10-27): quem aplica a proteção da develop, opção A ("A"): o dono aplica os checks obrigatórios no GitHub (R-CONFORMIDADE); o devops-engineer só registra a regra e o comando no fluxo de homologação; substitui a parte "o devops-engineer configura no GitHub" da decisão anterior.
- DECISÃO DO DONO (2026-10-27): qual proteção da develop vale, opção B ("B"): vale só o ruleset 25003880 "develop: PR, squash, checks", com os 9 checks (`rapida`, `testes`, `build`, `e2e`, `filtro`, `banco`, `openapi`, `imagem`, `seguranca`); o dono acrescenta os 5 que faltam nas Settings do ruleset; o devops-engineer ajusta o documento para descrever esse ruleset; o comando PUT na proteção clássica não se roda.
- DECISÃO DO DONO (2026-10-27): base do delta da branch feature/042-protecao-develop, opção A ("A"): a conferência mede a branch desde o ponto em que saiu da develop, e342a2cd71c46df5acf60b756637ebf5a6c84709.
- DECISÃO DO DONO (2026-10-27): nova base do delta da branch feature/042-protecao-develop, opção A ("A"): a conferência mede a branch desde o primeiro commit do devops-engineer nela, 90e8dcc704bc96e4f76e1ccc119e11abcef40d44; substitui a base e342a2c da decisão anterior, que o forge-check recusa por ser o próprio Base-sha.
- DECISÃO DO DONO (2026-10-27): melhorias F21 e F22 do Forge (docs/kanban/prompt-jarvis-forge-2026-10-21.md), opção A ("A"): agora, em paralelo às entregas do projeto, um cartão e um PR por melhoria na develop do Forge, só propor (R-CONTRIB); vira pedido próprio (043).
- ADR 0003 (citada no pedido): orçamento de performance; esta entrega (só `.forge/versao` e o parecer) não muda código; o QA não mexe em limite nem em medição.
- ADR 0014 (citada no pedido): stack técnica do back-end; esta entrega não toca o back-end.
- ADR 0020 (citada no pedido): proteção de pessoa; esta entrega não toca coleta nem dado de pessoa.
- Erro recorrente deste destino (forge-check, 30 dias): escopo em 2 entregas · evita: cada item do Entregar cita a etapa `(E<n>)` do pedido; só corta com a marca de corte (R-BRIEF, R-DECISAO)
- Erro recorrente deste destino (forge-check, 30 dias): decisao em 2 entregas · evita: grave a decisão no pedido antes do brief; o `brief gerar` copia as linhas de decisão do dono (R-BRIEF)
- DECISÃO DO DONO (2026-10-27, pedido 026): push da feature branch antes do parecer do QA, opção A ("A"): o PR para a develop só abre com o parecer do QA; por isso a prova de CI deste parecer é o run do push do head, não o do PR.
- DECISÃO DO DONO (2026-10-23, pedido 041): "Rode no máximo uma suíte de teste por vez e poucos agentes em paralelo." Outra suíte pode estar rodando na worktree -026 ou -041b: antes do `pnpm run pronto`, espere `pgrep -f vitest` e `pgrep -f playwright` voltarem vazios (verifique a cada minuto, sem limite de tentativas).
- R-QA: o parecer é escrito pelo qa, gravado pela ferramenta de escrita (Write ou Edit), para o registro de autoria do papel; nunca por Bash. R-VERIFY: nunca `--no-verify` nem `--force`. R-MAIN: nada na `main`. O hook barra `$`, crase e `?` no Bash: comandos literais.

## Pronto quando
- PQ-1 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD-upgrade/docs/qa/042-forge-0-30-3.md` · espera: rc=0, frontmatter com `veredito:` e `commit: 9a32f8ba70e0a72ff2ab4e93adcefdc33971a78d`
- PQ-2 (run): `gh run view 40655762748 --json conclusion -q .conclusion` · espera: igual 'success'
- PQ-3 (cmd): `pnpm run pronto` na worktree · espera: rc=0
- PQ-4 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-upgrade diff --name-only 9a32f8ba70e0a72ff2ab4e93adcefdc33971a78d HEAD` · espera: igual 'docs/qa/042-forge-0-30-3.md'
- PQ-5 (push): `git -C /home/rodrigoisensee/MetricasDSPD-upgrade ls-remote origin refs/heads/forge/upgrade-0.30.3` · espera: contém o sha40 de `git -C /home/rodrigoisensee/MetricasDSPD-upgrade rev-parse HEAD`
- PQ-6 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-upgrade status --porcelain` · espera: linhas=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Inclui o veredito, os achados bloqueantes, o tempo do `pronto` e o sha do commit do parecer. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
