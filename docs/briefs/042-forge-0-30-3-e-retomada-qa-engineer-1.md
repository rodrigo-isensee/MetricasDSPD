Agente destino: forge:qa-engineer
Pedido: 042-forge-0-30-3-e-retomada
Tipo: qa
Branch: fix/151-develop-verde   Base: develop   Base-sha: 3bf1b5e1abba4d49d696ddaab8f31c3c084f35d5

## Objetivo
Etapa E3.6 do pedido 042 (cartão K-151): portão de QA (R-QA) do E3.4 (2389e621f92e55e22446cb3f9242c48c10ebef38, lint do mock de `matchMedia` e teste da PV1), aprovado no code review E3.5 (b6d8a9d586453cc4ec3a4ba496287afa2646bae6, já no remoto). Com o parecer aprovado, o tech-lead abre o PR que devolve o verde à develop. Worktree `/home/rodrigoisensee/MetricasDSPD-151`, branch `fix/151-develop-verde`, head b6d8a9d.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-151/docs/reviews/151-develop-verde.md`: veredito e achado A1 (tempo do aquecimento na CI).
- `git -C /home/rodrigoisensee/MetricasDSPD-151 diff 3bf1b5e1abba4d49d696ddaab8f31c3c084f35d5 2389e621f92e55e22446cb3f9242c48c10ebef38` (2 arquivos).
- `docs/pedidos/042-forge-0-30-3-e-retomada.md`, linha do `## Histórico` de 17:52 (falha da CI, run 40580307663).

## Entregar
- (E3, E3.6) CI do push da branch (run 40592056755, `gh run view 40592056755`; espere terminar): resultado por job (`rapida`, `testes`, `build`, `e2e` e os demais) e, do job `testes`, o tempo do arquivo `percepcao.test.tsx` e do `beforeAll` de aquecimento (A1 do review), comparados com os 40 s do run 40580307663.
- (E3, E3.6) Local, uma suíte por vez: `pnpm run pronto` completo uma vez; depois as E2E do painel afetado pelo react-router 8, `--retries=0`, 1 worker: `e2e/tests/sustentacao-no-operacional.spec.ts` e `e2e/tests/sustentacao-no-operacional-qa.spec.ts` (o caminho `/sustentacao` → `/operacional`), com a contagem de passaram e falharam e o comando exato.
- (E3, E3.6) Parecer em `docs/qa/151-develop-verde.md`, com frontmatter `commit: b6d8a9d586453cc4ec3a4ba496287afa2646bae6` e `parecer:` (aprovado ou reprovado), as seções dos dois itens acima e o bloco `## Achados` (até 300 caracteres cada, bloqueantes marcados; falha vira achado com passos para reproduzir). Commit só do parecer, com `Cartão: K-151`, `git add` explícito por caminho, conforme a seção de commits do `docs/engineering/praticas.md`. Sem push (o envio é do tech-lead).
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
- "E3.5 (forge:tech-lead): code review do E3.4, push, PR para a develop e merge por squash depois do QA." · review e push já entregues (b6d8a9d); o PR e o merge vêm depois desta
- "E4.1 (forge:devops-engineer): configurar na develop os checks obrigatórios da CI (gh api), provar pela leitura da proteção e registrar em `docs/engineering/fluxo-homologacao.md` e no parecer de devops." · etapa de outra delegação; continua no pedido
- "E4.2 (forge:security-engineer): parecer de segurança da proposta de proteção da develop (branch `feature/042-protecao-develop`), na pasta de pareceres de segurança." · etapa de outra delegação; continua no pedido
- "E4.3 (forge:tech-lead): code review da branch `feature/042-protecao-develop`; push, PR para a develop e merge por squash depois dos pareceres." · etapa de outra delegação; continua no pedido
- "E4.4 (dono): acrescentar no ruleset 25003880 da develop, pelas Settings do GitHub, os checks `filtro`, `banco`, `openapi`, `imagem` e `seguranca` (decisão B; R-CONFORMIDADE: proteção de branch é do dono)." · etapa de outra delegação; continua no pedido
- Corrigir código ou testes (defeito vira achado); E2E completa; aumentar timeout ou ligar retry; push; PR; o quadro; ler ou editar o `.env`; as worktrees -026 e -041.

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
- DECISÃO DO DONO (2026-10-23, pedido 041): "Rode no máximo uma suíte de teste por vez e poucos agentes em paralelo."
- ADR 0003 (citada no pedido): orçamento de performance; o QA mede contra ele, sem mexer em limite nem em medição.
- ADR 0014 (citada no pedido): stack técnica do back-end; esta entrega não toca o back-end.
- ADR 0020 (citada no pedido): proteção de pessoa; esta entrega não toca coleta nem dado de pessoa.
- Uma suíte por vez: o QA do 041 roda E2E na worktree -041 e o 026 roda `pnpm run pronto` na -026. Antes de cada rodada (pronto, E2E), `pgrep -fa 'playwright|vitest|vite'`; com outra suíte em curso, espere ela acabar. Nunca dois Playwright ao mesmo tempo. Pré-condições: banco local saudável; Chromium do Playwright instalado. O hook barra `$`, crase e `?` no Bash: use o PATH `/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin` como prefixo literal.
- R-QA: portão obrigatório. R-MAIN: nada na `main`. R-VERIFY: nunca `--no-verify` nem `--force`. R-CONFORMIDADE: bloqueio vira relato.

## Pronto quando
- PQ-1 (cmd): `grep -c '^parecer: aprovado' /home/rodrigoisensee/MetricasDSPD-151/docs/qa/151-develop-verde.md` · espera: igual '1'
- PQ-2 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-151 log -1 --format=%H -- docs/qa/151-develop-verde.md` · espera: o sha40 do commit do parecer
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-151 log -1 --format=%B -- docs/qa/151-develop-verde.md` · espera: contém 'Cartão: K-151'
- PQ-4 (run): `gh run view 40592056755 --json conclusion --jq .conclusion` · espera: igual 'success'
- PQ-5 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-151 diff b6d8a9d586453cc4ec3a4ba496287afa2646bae6 --name-only` · espera: igual 'docs/qa/151-develop-verde.md'
- PQ-6 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-151 status --porcelain` · espera: linhas=0
- PQ-7 (cmd): `cd /home/rodrigoisensee/MetricasDSPD-151 && pnpm run pronto` · espera: rc=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Inclui o resultado por job da CI, o tempo do aquecimento na CI e a contagem das E2E. Se o parecer reprovar, PQ-1 fica "não cumprido" com o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
