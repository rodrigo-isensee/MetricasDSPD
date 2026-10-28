Agente destino: forge:tech-lead
Pedido: docs/pedidos/042-forge-0-30-3-e-retomada.md
Tipo: codigo
Branch: feature/042-protecao-develop   Base: develop   Base-sha: e342a2cd71c46df5acf60b756637ebf5a6c84709

## Objetivo
Etapa E4.3 do pedido 042 (cartão K-148), parte final: mesclar por squash o PR #148 (proteção da develop pelo ruleset 25003880) na develop quando a CI dele estiver verde, e limpar a branch. Review r1 e r2, segurança r1 e r2 e as entregas do devops estão conferidos (`entrega conferida 6365a1651ce969d7bbe632b38a770b5e5a4ceebf` no Histórico do pedido); QA isento (diff só de documentação fora do controle, R-QA). Worktree `/home/rodrigoisensee/MetricasDSPD-042p`, branch `feature/042-protecao-develop`.

## Ler
- `gh pr view 148 --json state,headRefOid,mergeable,statusCheckRollup` e `gh pr checks 148`.

## Entregar
- (E4.3) Esperar a CI do PR #148 terminar (`gh pr checks 148 --watch`); com todos os checks verdes ou skipped, e o head ainda em 6365a1651ce969d7bbe632b38a770b5e5a4ceebf, merge por squash na develop (`gh pr merge 148 --squash`, sem `--admin`). Check vermelho: não mescle e relate o motivo.
- (E4.3) Depois do merge: apagar a branch remota e a local e remover a worktree `/home/rodrigoisensee/MetricasDSPD-042p` (R-FLUXO, "Depois do merge").
- (E1, E2, E3, E4) Forge 0.30.3, ambiente, retomada da fila e aplicação da proteção: não nesta delegação.

## Fora do escopo
- "E1.1 (dono): no terminal, na raiz do projeto: `forge-upgrade` (cria a branch `forge/upgrade-0.30.3` com o commit da versão; nada vai ao GitHub)." · já entregue
- "E1.2 (forge:tech-lead): push da branch, PR para a develop, parecer de review, merge por squash depois do QA, limpeza da branch." · etapa de outra delegação
- "E1.3 (forge:qa-engineer): parecer de QA (CI do PR verde e `pnpm run pronto`)." · etapa de outro papel
- "E2.1 (dono): Docker Engine no WSL (sudo; decisão A do 040), `cp .env.example .env`, Node 24 pelo nvm, `sudo` das dependências do Chromium (`pnpm exec playwright install-deps chromium`), `forge doutor` no terminal (proteção do git e branch homolog) e `/sandbox`." · etapa do dono
- "E2.2 (forge:tech-lead): `pnpm install --frozen-lockfile` e `pnpm exec playwright install chromium`." · já entregue
- "E2.3 (forge:devops-engineer): banco (db:up, db:migrate, db:seed) e consulta de prova." · já entregue
- "E3.1 (forge:software-architect): E2.3 do 041 (ADR 0003, regra do F4), sem depender do ambiente." · já entregue
- "E3.2 (forge:qa-engineer, forge:devops-engineer, forge:tech-lead): o resto do 041 na ordem do pedido 041, depois do E2." · etapa de outra delegação
- "E3.3 (forge:tech-lead): PR de docs do Jarvis, PRs do dependabot (#145, #146, #147) e K-125, depois do E2." · etapa de outra delegação
- "E4.1 (forge:devops-engineer): configurar na develop os checks obrigatórios da CI (gh api), provar pela leitura da proteção e registrar em `docs/engineering/fluxo-homologacao.md` e no parecer de devops." · já entregue
- "E4.2 (forge:security-engineer): parecer de segurança da proposta de proteção da develop (branch `feature/042-protecao-develop`), na pasta de pareceres de segurança." · já entregue
- "E4.4 (dono): acrescentar no ruleset 25003880 da develop, pelas Settings do GitHub, os checks `filtro`, `banco`, `openapi`, `imagem` e `seguranca` (decisão B; R-CONFORMIDADE: proteção de branch é do dono)." · etapa do dono
- Alterar a proteção ou o ruleset no GitHub; qualquer arquivo da branch; homolog e main; o quadro.

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
- ADR 0003, ADR 0014 e ADR 0020 (citadas no pedido): nada nelas muda nesta entrega.
- R-CONFORMIDADE: nenhuma chamada que altere a proteção no GitHub e nunca `--admin` no merge (não passar por cima do ruleset); R-VERIFY: nunca `--no-verify` nem `--force`; R-MAIN: nada na `main`.

## Pronto quando
- PQ-1 (merge): `gh pr view 148 --json state --jq .state` · espera: igual 'MERGED'
- PQ-2 (cmd): `git ls-remote origin refs/heads/feature/042-protecao-develop` · espera: linhas=0
- PQ-3 (cmd): `git worktree list --porcelain | grep -c MetricasDSPD-042p` · espera: igual '0'
- PQ-4 (cmd): `git branch --list feature/042-protecao-develop` · espera: linhas=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Inclui o sha do squash na develop. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
