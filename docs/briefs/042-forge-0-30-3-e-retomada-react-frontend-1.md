Agente destino: forge:react-frontend
Pedido: 042-forge-0-30-3-e-retomada
Tipo: codigo
Branch: fix/151-develop-verde   Base: develop   Base-sha: 3bf1b5e1abba4d49d696ddaab8f31c3c084f35d5

## Objetivo
Etapa E3.4 do pedido 042 (cartão K-151): deixar a develop verde de novo. O dono mesclou os PRs do Dependabot #145 (typescript-eslint 8.72), #146 (react-query) e #147 (react-router 7 → 8) e a CI da develop em 3bf1b5e falhou (run 40580307663). Enquanto ela estiver vermelha, o ruleset barra todo PR para a develop. Crie a worktree `/home/rodrigoisensee/MetricasDSPD-151` com a branch `fix/151-develop-verde` a partir de `origin/develop` (3bf1b5e1abba4d49d696ddaab8f31c3c084f35d5) e instale as dependências nela (`pnpm install --frozen-lockfile`).

## Ler
- `gh run view 40580307663 --log-failed` (jobs `rapida` e `testes`), só as linhas de erro.
- `web/src/test/setup.ts`, linhas 35 a 60.
- `web/src/features/percepcao/percepcao.test.tsx`, o teste "painel Sustentação com a PV1 > a seção fica no fim do painel, depois de S1 e S2 e de "Mais métricas"" e o que ele monta.

## Entregar
- (E3, E3.4) Correção do lint `@typescript-eslint/no-deprecated` em `web/src/test/setup.ts:47-48` (`addListener` e `removeListener` do `MediaQueryList`), regra nova do typescript-eslint 8.72: troque pelo par `addEventListener`/`removeEventListener` no mock, mantendo o comportamento, sem desligar a regra nem pôr comentário de exceção.
- (E3, E3.4) Correção do teste `percepcao.test.tsx` que falhou na CI (`metrica-PV1` não encontrado). Primeiro meça a causa: rode o arquivo isolado na develop, 5 vezes; diga se a falha é determinística (por exemplo, mudança de comportamento do react-router 8 no roteamento ou no carregamento da página) ou de tempo (o teste levou 5,2 s na CI). Corrija a causa no código ou na espera do teste, sem aumentar timeout e sem `retry`; se a causa for o react-router 8 mudar algo que o usuário vê, relate e pare naquele ponto.
- (E3, E3.4) Na mesma entrega, confira se outro uso de API marcada como deprecated pelo react-router 8 ou pelo typescript-eslint 8.72 aparece no `pnpm run lint` e no typecheck; corrija só o que o `pnpm run pronto` acusa.
- (E3, E3.4) Durante o desenvolvimento, só o lint, o typecheck e os testes do `web`; `pnpm run pronto` completo uma vez, antes do commit final. Commits com `Cartão: K-151`, `git add` explícito por caminho, conforme a seção de commits do `docs/engineering/praticas.md`. Sem push (o envio é do tech-lead).
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
- "E3.5 (forge:tech-lead): code review do E3.4, push, PR para a develop e merge por squash depois do QA." · etapa de outra delegação; continua no pedido
- "E3.6 (forge:qa-engineer): parecer de QA do E3.4 (CI do PR verde, `pnpm run pronto` e o fluxo do react-router 8 na E2E do painel afetado)." · etapa de outra delegação; continua no pedido
- "E4.1 (forge:devops-engineer): configurar na develop os checks obrigatórios da CI (gh api), provar pela leitura da proteção e registrar em `docs/engineering/fluxo-homologacao.md` e no parecer de devops." · etapa de outra delegação; continua no pedido
- "E4.2 (forge:security-engineer): parecer de segurança da proposta de proteção da develop (branch `feature/042-protecao-develop`), na pasta de pareceres de segurança." · etapa de outra delegação; continua no pedido
- "E4.3 (forge:tech-lead): code review da branch `feature/042-protecao-develop`; push, PR para a develop e merge por squash depois dos pareceres." · etapa de outra delegação; continua no pedido
- "E4.4 (dono): acrescentar no ruleset 25003880 da develop, pelas Settings do GitHub, os checks `filtro`, `banco`, `openapi`, `imagem` e `seguranca` (decisão B; R-CONFORMIDADE: proteção de branch é do dono)." · etapa de outra delegação; continua no pedido
- O check `filtro` dos PRs do Dependabot (falha de `git fetch` do paths-filter): só relate se o vir no seu PR; o workflow é do devops. A E2E (é do QA); desfazer as atualizações do Dependabot; integrações reais; push; PR; o quadro; ler ou editar o `.env`; as worktrees -026 e -041.

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
- DECISÃO DO DONO (2026-10-27): token dos agentes, revisão da opção A ("neste momento paraacelerar mantenha o token da minha conta mesmo pode usar"): por ora o gh dos agentes segue com o token da conta do dono; a troca para token fine-grained fica adiada (sem cartão em andamento). O uso de --admin e de bypass do ruleset pelos agentes continua proibido (R-VERIFY, R-CONFORMIDADE).
- DECISÃO DO DONO (2026-10-23, pedido 041): "Rode no máximo uma suíte de teste por vez e poucos agentes em paralelo."
- ADR 0003 (citada no pedido): orçamento de performance; esta correção não mexe em limite nem em medição.
- ADR 0014 (citada no pedido): fonte das integrações; não se aplica a esta entrega (nada de integração).
- ADR 0020 (citada no pedido): decisão da R-1; não se aplica a esta entrega (só lint e teste do `web`).
- Regras invioláveis do `CLAUDE.md`: nenhuma métrica para avaliação individual; abaixo de 20 itens, não publicar estatística. R-MAIN: nada na `main`. R-VERIFY: nunca `--no-verify` nem `--force`. R-CONFORMIDADE: bloqueio vira relato.
- Antes de rodar qualquer teste, `pgrep -fa 'playwright|vitest|vite'`; com outra suíte em curso (o 026 roda testes na worktree -026), espere ela acabar. Node 24 pelo nvm (`. ~/.nvm/nvm.sh`); o hook barra `$`, crase e `?` no Bash: use o PATH `/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin` como prefixo literal.

## Pronto quando
- PQ-1 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-151 log -1 --format=%H` · espera: o sha40 do último commit desta entrega
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-151 log -1 --format=%B` · espera: contém 'Cartão: K-151'
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-151 status --porcelain` · espera: linhas=0
- PQ-4 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-151 diff 3bf1b5e1abba4d49d696ddaab8f31c3c084f35d5 --name-only -- e2e server packages eslint.config.js` · espera: linhas=0
- PQ-5 (cmd): `cd /home/rodrigoisensee/MetricasDSPD-151 && pnpm run pronto` · espera: rc=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Inclui a causa medida da falha do `percepcao.test.tsx` (5 rodadas). Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
