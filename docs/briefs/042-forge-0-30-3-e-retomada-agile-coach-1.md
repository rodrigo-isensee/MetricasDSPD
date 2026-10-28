Agente destino: forge:agile-coach
Pedido: 042-forge-0-30-3-e-retomada
Tipo: codigo
Branch: docs/jarvis-2026-10-23   Base: develop   Base-sha: ae009a75d4383c3d6c9a8ba4851f9b5b2ba5dbb8
Etapa: codigo

## Objetivo
Retrospectiva do pedido 042 (Forge 0.30.3 no projeto e retomada na máquina nova), etapa E5.1. O pedido foi aberto em 2026-10-27. Teve o ambiente da máquina nova, a proteção da develop pelo ruleset 25003880 com 9 checks, a develop vermelha depois dos PRs do Dependabot (K-151, PR #149), o PR #151 cancelado no teto de 30 min da E2E, o merge recusado por branch desatualizada e a série de merges parada no PR #153 do pedido 041 (delegação negada pelo classificador) até o dono assumir os merges; o #151 entrou na develop às 10:56 de 2026-10-28 (d55db80). O time precisa saber o que custou tempo e o que vira melhoria. Repositório principal `/home/rodrigoisensee/MetricasDSPD`, branch `docs/jarvis-2026-10-23` (do Jarvis); não troque de branch. Outros agentes podem commitar nesta branch ao mesmo tempo: se o `git commit` acusar `index.lock`, espere alguns segundos e tente de novo.

## Ler
- `docs/pedidos/042-forge-0-30-3-e-retomada.md` inteiro.
- `docs/kanban/historico.md`, linhas dos cartões citados no pedido.
- `docs/kanban/conferencias.md`, linhas do 042.
- `docs/retrospectivas/2026-10-28-044-e2e-em-partes.md`, só como modelo de forma e para não repetir as MELHORIAs que já viraram cartão (K-156 a K-161).

## Entregar
- (E5.1) Retrospectiva em `docs/retrospectivas/2026-10-28-042-forge-0-30-3.md`, gravada só com Write ou Edit: o que foi bem, o que custou tempo (com a hora de cada evento tirada do Histórico do pedido e do historico.md), rodadas e reprovações agregadas por classe de causa, e linhas `MELHORIA:` (uma por linha, com problema, evidência por data e arquivo, medida do efeito e se vale para o Forge ou só para o projeto). Avalie pelo menos: o tempo do ambiente da máquina nova (Docker, `.env`, Node, Chromium), o que o README não dizia sobre o Chromium (K-142) e o primeiro db:migrate que falha pelo healthcheck do postgres (K-143); a proteção da develop e as decisões do dono sobre quem aplica (R-CONFORMIDADE); a develop vermelha depois dos PRs do Dependabot; o PR #151 cancelado no teto de 30 min e o merge recusado por branch desatualizada; a conferência sem `Desde` medindo commits de outros papéis (K-147); a série de merges que só andou com o dono. Melhoria que já tem cartão aberto entra citando o cartão, sem linha `MELHORIA:` nova.
- (E5.1) Um commit só da retrospectiva, `git add` explícito por caminho, no padrão de commits do `docs/engineering/praticas.md`, com a linha `Cartão: K-140`; sem push.
- (E1, E2, E3, E4) Nada a entregar aqui: não nesta delegação (artefatos e pareceres já entregues e mesclados na develop).

## Fora do escopo
- "E1.1 (dono): no terminal, na raiz do projeto: `forge-upgrade` (cria a branch `forge/upgrade-0.30.3` com o commit da versão; nada vai ao GitHub)." · etapa de outra delegação; já entregue
- "E1.2 (forge:tech-lead): push da branch, PR para a develop, parecer de review, merge por squash depois do QA, limpeza da branch." · etapa de outra delegação; já entregue
- "E1.3 (forge:qa-engineer): parecer de QA (CI do PR verde e `pnpm run pronto`)." · etapa de outra delegação; já entregue
- "E2.1 (dono): Docker Engine no WSL (sudo; decisão A do 040), `cp .env.example .env`, Node 24 pelo nvm, `sudo` das dependências do Chromium (`pnpm exec playwright install-deps chromium`), `forge doutor` no terminal (proteção do git e branch homolog) e `/sandbox`." · etapa de outra delegação; já entregue
- "E2.2 (forge:tech-lead): `pnpm install --frozen-lockfile` e `pnpm exec playwright install chromium`." · etapa de outra delegação; já entregue
- "E2.3 (forge:devops-engineer): banco (db:up, db:migrate, db:seed) e consulta de prova." · etapa de outra delegação; já entregue
- "E3.1 (forge:software-architect): E2.3 do 041 (ADR 0003, regra do F4), sem depender do ambiente." · etapa de outra delegação; já entregue
- "E3.2 (forge:qa-engineer, forge:devops-engineer, forge:tech-lead): o resto do 041 na ordem do pedido 041, depois do E2." · etapa de outra delegação; já entregue
- "E3.3 (forge:tech-lead): PR de docs do Jarvis, PRs do dependabot (#145, #146, #147) e K-125, depois do E2." · etapa de outra delegação; já entregue
- "E3.4 (forge:react-frontend): develop verde depois dos PRs do Dependabot mesclados pelo dono (K-151): lint `@typescript-eslint/no-deprecated` em `web/src/test/setup.ts:47-48` e o teste `percepcao.test.tsx` "a seção fica no fim do painel" (PV1 não acha `metrica-PV1`), em `fix/151-develop-verde`." · etapa de outra delegação; já entregue
- "E3.5 (forge:tech-lead): code review do E3.4, push, PR para a develop e merge por squash depois do QA." · etapa de outra delegação; já entregue
- "E3.6 (forge:qa-engineer): parecer de QA do E3.4 (CI do PR verde, `pnpm run pronto` e o fluxo do react-router 8 na E2E do painel afetado)." · etapa de outra delegação; já entregue
- "E4.1 (forge:devops-engineer): configurar na develop os checks obrigatórios da CI (gh api), provar pela leitura da proteção e registrar em `docs/engineering/fluxo-homologacao.md` e no parecer de devops." · etapa de outra delegação; já entregue
- "E4.2 (forge:security-engineer): parecer de segurança da proposta de proteção da develop (branch `feature/042-protecao-develop`), na pasta de pareceres de segurança." · etapa de outra delegação; já entregue
- "E4.3 (forge:tech-lead): code review da branch `feature/042-protecao-develop`; push, PR para a develop e merge por squash depois dos pareceres." · etapa de outra delegação; já entregue
- "E4.4 (dono): acrescentar no ruleset 25003880 da develop, pelas Settings do GitHub, os checks `filtro`, `banco`, `openapi`, `imagem` e `seguranca` (decisão B; R-CONFORMIDADE: proteção de branch é do dono)." · etapa de outra delegação; já entregue
- Implementar qualquer melhoria (vira cartão ou PR depois, pelo Jarvis); o quadro (`KANBAN.md` e `historico.md`); o arquivo do pedido; os outros pedidos; push; ler ou editar o `.env`.

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
- DECISÃO DO DONO (2026-10-28): "Eu estou fora o dia todo então faça tudo que precisar".
- ADR 0003, ADR 0014 e ADR 0020 (citadas no pedido): orçamento de performance, stack do back-end e proteção de pessoa no coletor. Nada a decidir nesta retrospectiva; não proponha mudar nenhuma delas.
- Erro recorrente deste destino (forge-check, 30 dias): escopo em 3 entregas · evita: cada item do Entregar cita a etapa `(E<n>)` do pedido; só corta com a marca de corte (R-BRIEF, R-DECISAO)
- Erro recorrente deste destino (forge-check, 30 dias): decisao em 3 entregas · evita: grave a decisão no pedido antes do brief; o `brief gerar` copia as linhas de decisão do dono (R-BRIEF)
- Erro recorrente deste destino (forge-check, 30 dias): implementacao em 2 entregas · evita: rode a suíte inteira e cada prova antes do relatório (R-PROVA)
- Métricas de processo, nunca de pessoa ou de agente individual (regra inviolável do projeto, CLAUDE.md): nenhuma instância de agente (papel seguido de número, como tech-lead-2) no texto.
- R-VERIFY: nunca `--no-verify` nem `--force`. O hook barra `$`, crase, chaves e `?` no Bash: comandos literais, um por linha.

## Pronto quando
- PQ-1 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD/docs/retrospectivas/2026-10-28-042-forge-0-30-3.md`
- PQ-2 (cmd): `grep -c '^MELHORIA:' /home/rodrigoisensee/MetricasDSPD/docs/retrospectivas/2026-10-28-042-forge-0-30-3.md` · espera: rc=0
- PQ-3 (sha): `git -C /home/rodrigoisensee/MetricasDSPD log -1 --format=%H -- docs/retrospectivas/2026-10-28-042-forge-0-30-3.md` · espera: o sha40 do commit da retrospectiva
- PQ-4 (cmd): `grep -cE '(tech-lead|qa-engineer|react-frontend|node-backend|ux-designer|security-engineer|devops-engineer|agile-coach|software-architect)-[0-9]' /home/rodrigoisensee/MetricasDSPD/docs/retrospectivas/2026-10-28-042-forge-0-30-3.md` · espera: igual '0'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Inclui as linhas `MELHORIA:` copiadas. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
