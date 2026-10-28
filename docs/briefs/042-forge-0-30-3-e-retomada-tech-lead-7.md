Agente destino: forge:tech-lead
Pedido: 042-forge-0-30-3-e-retomada
Tipo: merge
Branch: fix/151-develop-verde   Base: develop   Base-sha: 3bf1b5e1abba4d49d696ddaab8f31c3c084f35d5
Etapa: merge-integracao

## Objetivo
Etapa E3.5 do pedido 042 (cartão K-151), parte final: PR da branch `fix/151-develop-verde` para a develop e merge por squash depois dos checks verdes, para devolver o verde à develop (a develop vermelha barra todo PR pelo ruleset). Review (b6d8a9d) e QA (43e4002, conferido) já aprovados. Worktree `/home/rodrigoisensee/MetricasDSPD-151` (já existe), head 43e4002a0bfeddcf556583c7b09dba8bccecbe8f.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-151/docs/reviews/151-develop-verde.md` e `/home/rodrigoisensee/MetricasDSPD-151/docs/qa/151-develop-verde.md`: só o frontmatter (vereditos) e `## Achados`.

## Entregar
- (E3, E3.5) Push da branch (sem `--force`), se o remoto ainda não estiver em 43e4002; `forge-check pr` da worktree limpo antes de abrir o PR.
- (E3, E3.5) PR para a `develop` com `gh pr create --base develop --head fix/151-develop-verde --body-file <arquivo>`: título em português no padrão de commits do `docs/engineering/praticas.md`; corpo com o resumo, os pareceres de review e de QA citados por caminho e a linha `Cartão: K-151`.
- (E3, E3.5) Esperar os checks obrigatórios do ruleset (`gh pr checks <n> --watch --required`); verdes, merge com `gh pr merge <n> --squash` (sem `--admin`). Check vermelho: sem merge, relate o check e o motivo (R-CONFORMIDADE).
- (E3, E3.5) Depois do merge: apagar a branch remota e a local e remover a worktree `/home/rodrigoisensee/MetricasDSPD-151` (R-FLUXO, "Depois do merge").
- (E1, E2, E4) Nada a entregar aqui: não nesta delegação (as etapas deles estão no Fora do escopo).

## Fora do escopo
- "E1.1 (dono): no terminal, na raiz do projeto: `forge-upgrade` (cria a branch `forge/upgrade-0.30.3` com o commit da versão; nada vai ao GitHub)." · etapa de outra delegação; continua no pedido
- "E1.2 (forge:tech-lead): push da branch, PR para a develop, parecer de review, merge por squash depois do QA, limpeza da branch." · etapa de outra delegação; continua no pedido
- "E1.3 (forge:qa-engineer): parecer de QA (CI do PR verde e `pnpm run pronto`)." · etapa de outra delegação; continua no pedido
- "E2.1 (dono): Docker Engine no WSL (sudo; decisão A do 040), `cp .env.example .env`, Node 24 pelo nvm, `sudo` das dependências do Chromium (`pnpm exec playwright install-deps chromium`), `forge doutor` no terminal (proteção do git e branch homolog) e `/sandbox`." · etapa de outra delegação; continua no pedido
- "E2.2 (forge:tech-lead): `pnpm install --frozen-lockfile` e `pnpm exec playwright install chromium`." · etapa de outra delegação; continua no pedido
- "E2.3 (forge:devops-engineer): banco (db:up, db:migrate, db:seed) e consulta de prova." · etapa de outra delegação; continua no pedido
- "E3.1 (forge:software-architect): E2.3 do 041 (ADR 0003, regra do F4), sem depender do ambiente." · etapa de outra delegação; continua no pedido
- "E3.2 (forge:qa-engineer, forge:devops-engineer, forge:tech-lead): o resto do 041 na ordem do pedido 041, depois do E2." · etapa de outra delegação; continua no pedido
- "E3.3 (forge:tech-lead): PR de docs do Jarvis, PRs do dependabot (#145, #146, #147) e K-125, depois do E2." · etapa de outra delegação; continua no pedido
- "E3.4 (forge:react-frontend): develop verde depois dos PRs do Dependabot mesclados pelo dono (K-151): lint `@typescript-eslint/no-deprecated` em `web/src/test/setup.ts:47-48` e o teste `percepcao.test.tsx` "a seção fica no fim do painel" (PV1 não acha `metrica-PV1`), em `fix/151-develop-verde`." · já entregue (2389e62)
- "E3.6 (forge:qa-engineer): parecer de QA do E3.4 (CI do PR verde, `pnpm run pronto` e o fluxo do react-router 8 na E2E do painel afetado)." · já entregue (43e4002)
- "E4.1 (forge:devops-engineer): configurar na develop os checks obrigatórios da CI (gh api), provar pela leitura da proteção e registrar em `docs/engineering/fluxo-homologacao.md` e no parecer de devops." · etapa de outra delegação; continua no pedido
- "E4.2 (forge:security-engineer): parecer de segurança da proposta de proteção da develop (branch `feature/042-protecao-develop`), na pasta de pareceres de segurança." · etapa de outra delegação; continua no pedido
- "E4.3 (forge:tech-lead): code review da branch `feature/042-protecao-develop`; push, PR para a develop e merge por squash depois dos pareceres." · etapa de outra delegação; continua no pedido
- "E4.4 (dono): acrescentar no ruleset 25003880 da develop, pelas Settings do GitHub, os checks `filtro`, `banco`, `openapi`, `imagem` e `seguranca` (decisão B; R-CONFORMIDADE: proteção de branch é do dono)." · etapa de outra delegação; continua no pedido
- Mudar código, testes ou pareceres; rodar suítes de teste locais (o QA do 026 ocupa a máquina); `homolog` e `main`; o quadro; ler ou editar o `.env`; as worktrees -026 e -041 e as branches delas.

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
- DECISÃO DO DONO (2026-10-27, pedido 026): push da feature branch antes do parecer do QA, opção A ("A"): o push é liberado; "enviada" no CLAUDE.md quer dizer o PR para a develop, que só abre com o parecer do QA; o tech-lead registra essa leitura no CLAUDE.md por PR. Vale para todas as branches do projeto.
- DECISÃO DO DONO (2026-10-27): token dos agentes, revisão da opção A ("neste momento paraacelerar mantenha o token da minha conta mesmo pode usar"): por ora o gh dos agentes segue com o token da conta do dono; a troca para token fine-grained fica adiada (sem cartão em andamento). O uso de --admin e de bypass do ruleset pelos agentes continua proibido (R-VERIFY, R-CONFORMIDADE).
- DECISÃO DO DONO (2026-10-23, pedido 041): "Rode no máximo uma suíte de teste por vez e poucos agentes em paralelo."
- ADR 0003 (citada no pedido): orçamento de performance; esta entrega não mexe em limite nem em medição.
- ADR 0014 (citada no pedido): stack técnica do back-end; esta entrega não toca o back-end.
- ADR 0020 (citada no pedido): proteção de pessoa; esta entrega não toca coleta nem dado de pessoa.
- Regras invioláveis do `CLAUDE.md`: nenhuma métrica para avaliação individual; dúvida de regra de negócio vira pergunta, não inferência.
- Teste local: nenhum (os checks da CI no PR são a prova). R-MAIN: nada na `main`. R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`. R-CONFORMIDADE: bloqueio vira relato. O hook barra `$`, crase e `?` no Bash: comandos literais.

## Pronto quando
- PQ-1 (pr): `gh pr view fix/151-develop-verde --json number,baseRefName,state,body` · espera: base `develop`, corpo com 'Cartão: K-151'
- PQ-2 (run): `gh pr checks <n> --required` · espera: todos os checks obrigatórios com `pass`
- PQ-3 (merge): `gh pr view <n> --json state,mergeCommit` · espera: state `MERGED` e o sha40 do commit do merge
- PQ-4 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD fetch origin develop && git -C /home/rodrigoisensee/MetricasDSPD merge-base --is-ancestor <mergeCommit> origin/develop` · espera: rc=0 (troque <mergeCommit> pelo sha do PQ-3)
- PQ-5 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD ls-remote origin refs/heads/fix/151-develop-verde` · espera: linhas=0
- PQ-6 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD worktree list --porcelain | grep -c MetricasDSPD-151` · espera: igual '0'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Inclui o número do PR, o sha do merge e o tempo de espera dos checks. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
