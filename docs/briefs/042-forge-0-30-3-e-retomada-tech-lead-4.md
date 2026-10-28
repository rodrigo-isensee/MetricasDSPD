Agente destino: forge:tech-lead
Pedido: docs/pedidos/042-forge-0-30-3-e-retomada.md
Tipo: codigo
Branch: feature/042-protecao-develop   Base: develop   Base-sha: e342a2cd71c46df5acf60b756637ebf5a6c84709

## Objetivo
Etapa E4.3 do pedido 042 (cartão K-148), segunda parte: enviar a branch, revisar as duas voltas do devops (ea3358139feb4e16dbdf193a99a48bf85492c966, resposta ao seu A1 bloqueante, e 3efb7b43cac8c6787ce5ac7fa1ab1b04043e446b, que troca a proposta de PUT na proteção clássica pela descrição do ruleset 25003880 com 9 checks, decisão B do dono) e abrir o PR para a develop. Worktree `/home/rodrigoisensee/MetricasDSPD-042p`, branch `feature/042-protecao-develop`.


## Ler
- Seu parecer `/home/rodrigoisensee/MetricasDSPD-042p/docs/reviews/042-protecao-develop-r1.md`, bloco `## Achados`.
- `git -C /home/rodrigoisensee/MetricasDSPD-042p diff a9b35204943b6cd50734abb77497cdec7cdc89c7 3efb7b43cac8c6787ce5ac7fa1ab1b04043e446b` (só o delta das voltas).
- Leitura do ruleset, só GET: `gh api repos/rodrigo-isensee/MetricasDSPD/rulesets/25003880`.


## Entregar
- (E4.3) Push da branch `feature/042-protecao-develop` para o origin, primeiro passo, antes do parecer (a conferência de review e de segurança pede a branch no remoto).
- (E4.3) Parecer de review das voltas em `docs/reviews/042-protecao-develop-r2.md`, por delta sobre o r1: A1 resolvido ou não, os recomendados A2 a A4, e se a seção 15 descreve o ruleset real (conferido por GET) com os 9 checks da decisão B; no bloco `## Achados`, cada achado com até 300 caracteres e, se reprovar, ao menos um marcado bloqueante (formato que o `forge-check brief gerar --volta` lê). Commit com `Cartão: K-148`, `git add` explícito por caminho, conforme a seção de commits do `docs/engineering/praticas.md`, e push.
- (E4.3) Se o r2 aprovar: push de novo e PR da branch para a develop, título citando K-148, corpo com o resumo, os pareceres (devops, segurança, review r1 e r2), "QA: isento, diff só de documentação fora do controle (R-QA)" e a nota de que a proteção é aplicada pelo dono nas Settings do ruleset. Sem merge nesta delegação.
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
- "E4.1 (forge:devops-engineer): configurar na develop os checks obrigatórios da CI (gh api), provar pela leitura da proteção e registrar em `docs/engineering/fluxo-homologacao.md` e no parecer de devops." · já entregue (90e8dcc704bc96e4f76e1ccc119e11abcef40d44, ea3358139feb4e16dbdf193a99a48bf85492c966 e 3efb7b43cac8c6787ce5ac7fa1ab1b04043e446b; a aplicação passou ao dono na E4.4)
- "E4.2 (forge:security-engineer): parecer de segurança da proposta de proteção da develop (branch `feature/042-protecao-develop`), na pasta de pareceres de segurança." · já entregue (r1 3f2afd2b638d65ac1bf5715bb2b327559e5f6009 e r2 d2c21ef23b83d551e31f93239535c6bbab479832, aprovados)
- "E4.4 (dono): acrescentar no ruleset 25003880 da develop, pelas Settings do GitHub, os checks `filtro`, `banco`, `openapi`, `imagem` e `seguranca` (decisão B; R-CONFORMIDADE: proteção de branch é do dono)." · etapa do dono
- Merge do PR e limpeza da branch (outra delegação, depois das conferências); alterar a proteção no GitHub; os arquivos do devops e da segurança; workflows; o quadro.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-27): "talvez precise atualizar algo no banco ja quetroquei de maquina" (coberto pelo E2.3: banco recriado do zero, migrações e seed).
- DECISÃO DO DONO (2026-10-27): "pode usar o poder computacional disponivl para paralelizar" (lido como: agentes em paralelo até o teto de R-TETO desta máquina; suítes de teste limitadas pela memória medida, 7 GB visíveis).
- DECISÃO DO DONO (2026-10-27): pedido de origem acima (atualizar para 0.30.3 por branch e PR para a develop; retomar a fila).
- DECISÃO DO DONO (2026-10-27): integrações, opção B ("prefiro deixar para mexer nas integracoes reais quando acabar tudo porque vai consumir poder computacional que eu quero usar para entregar as coisas, temos que fazer as metricas operacionais"): integrações reais só depois de todo o backlog.
- DECISÃO DO DONO (2026-10-27): proteção da develop, opção A ("A"): a develop passa a exigir os checks da CI verdes para aceitar merge; o devops-engineer configura no GitHub e registra no fluxo de homologação.
- DECISÃO DO DONO (2026-10-27): quem aplica a proteção da develop, opção A ("A"): o dono aplica os checks obrigatórios no GitHub (R-CONFORMIDADE); o devops-engineer só registra a regra e o comando no fluxo de homologação; substitui a parte "o devops-engineer configura no GitHub" da decisão anterior.
- DECISÃO DO DONO (2026-10-27): qual proteção da develop vale, opção B ("B"): vale só o ruleset 25003880 "develop: PR, squash, checks", com os 9 checks (`rapida`, `testes`, `build`, `e2e`, `filtro`, `banco`, `openapi`, `imagem`, `seguranca`); o dono acrescenta os 5 que faltam nas Settings do ruleset; o devops-engineer ajusta o documento para descrever esse ruleset; o comando PUT na proteção clássica não se roda.
- DECISÃO DO DONO (2026-10-27): base do delta da branch feature/042-protecao-develop, opção A ("A"): a conferência mede a branch desde o ponto em que saiu da develop, e342a2cd71c46df5acf60b756637ebf5a6c84709.
- ADR 0003, ADR 0014 e ADR 0020 (citadas no pedido): nada nelas muda nesta entrega.
- R-CONFORMIDADE: nenhuma chamada que altere a proteção no GitHub; R-VERIFY: nunca `--no-verify` nem `--force`; R-MAIN: nada na `main`. Diff só de documentação fora do controle: isento de QA (R-QA), review exigido (R-REVIEW).

## Pronto quando
- PQ-1 (push): `git -C /home/rodrigoisensee/MetricasDSPD-042p ls-remote origin refs/heads/feature/042-protecao-develop` igual ao head local · branch no remoto com o commit do r2
- PQ-2 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-042p log -1 --format=%H -- docs/reviews/042-protecao-develop-r2.md` · espera: o sha40 do commit do r2, com `Cartão: K-148`
- PQ-3 (pr): `gh pr list --head feature/042-protecao-develop --base develop --json number --jq 'length'` · espera: igual '1' (só se o r2 aprovar; se reprovar, "não cumprido" com o motivo)
- PQ-4 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-042p status --porcelain` · espera: linhas=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Inclui o veredito do r2 e o número do PR. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
