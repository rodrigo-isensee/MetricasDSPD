Agente destino: forge:qa-engineer
Pedido: 042-forge-0-30-3-e-retomada
Tipo: qa
Branch: fix/151-develop-verde   Base: develop   Base-sha: 3bf1b5e1abba4d49d696ddaab8f31c3c084f35d5

## Objetivo
Etapa E3.6 do pedido 042 (cartão K-151), volta da conferência de entrega do seu parecer (43e4002a0bfeddcf556583c7b09dba8bccecbe8f): o `forge-check pr` acusa que a versão de `docs/qa/151-develop-verde.md` não tem registro de autoria do papel qa (`.forge/run/autoria.jsonl` só registra o que é gravado pela ferramenta de escrita; o parecer foi gravado por Bash). Sem o registro, o portão de QA (R-QA) não fecha e o PR não abre. Worktree `/home/rodrigoisensee/MetricasDSPD-151`, branch `fix/151-develop-verde`, head 43e4002.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-151/docs/qa/151-develop-verde.md` (o seu parecer, inteiro, para regravá-lo).

## Entregar
- (E3, E3.6) Regravar `docs/qa/151-develop-verde.md` da worktree com a ferramenta de escrita (Write ou Edit, que o hook registra; não por Bash, sed, cat ou python), com o mesmo conteúdo do commit 43e4002, para o hook gravar a autoria desta versão. Sem mudança de texto, sem commit novo, sem push.
- (E3, E3.6) Tempo do `beforeAll` de aquecimento na CI (A1 do review): decisão técnica do Jarvis no Histórico do pedido (2026-10-27 19:35): a medida é o tempo do arquivo `percepcao.test.tsx` na CI (25,7 s contra 40 s), já registrada no parecer; nada a medir de novo.
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
- Mudar o veredito ou os achados; código ou testes; rodar suítes de teste; push; PR; o quadro; ler ou editar o `.env`; as worktrees -026 e -041.

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
- R-QA: o parecer é escrito pelo qa. R-VERIFY: nunca `--no-verify` nem `--force`. Teste: nenhum (a suíte do 026 roda agora na worktree -026).

## Pronto quando
- PQ-1 (cmd): `grep -c 'docs/qa/151-develop-verde.md.*"papel": "qa"' /home/rodrigoisensee/MetricasDSPD/.forge/run/autoria.jsonl` · espera: igual '1'
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-151 status --porcelain` · espera: linhas=0
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-151 rev-parse HEAD` · espera: igual '43e4002a0bfeddcf556583c7b09dba8bccecbe8f'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Diga como o parecer foi gravado na versão anterior (para a retrospectiva). Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
