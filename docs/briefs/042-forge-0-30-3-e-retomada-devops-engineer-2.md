Agente destino: forge:devops-engineer
Pedido: docs/pedidos/042-forge-0-30-3-e-retomada.md
Tipo: codigo
Branch: feature/042-protecao-develop   Base: develop   Base-sha: e342a2cd71c46df5acf60b756637ebf5a6c84709

## Objetivo
Etapa E4.1 do pedido 042 (cartão K-148): a develop passa a exigir os checks da CI verdes para aceitar merge, para que um merge com a CI vermelha ou em curso (caso do #133, pedido 036) não entre mais. Crie a worktree `/home/rodrigoisensee/MetricasDSPD-042p` com a branch `feature/042-protecao-develop` a partir de e342a2cd71c46df5acf60b756637ebf5a6c84709 e trabalhe só nela.

## Ler
- `.github/workflows/ci.yml`: nomes dos jobs (rapida, filtro, testes, openapi, imagem, build, e2e, perf, seguranca, banco) e quais são pulados por filtro de caminho.
- `docs/engineering/fluxo-homologacao.md`: a parte da develop e da proteção de branches.
- Proteção atual: `gh api repos/rodrigo-isensee/MetricasDSPD/branches/develop/protection` (sem checks obrigatórios hoje).

## Entregar
- (E4) Na proteção da develop no GitHub, `required_status_checks` com os checks da CI que todo PR para a develop produz (inclusive os que podem sair "skipped" pelo filtro de caminho, que contam como sucesso), sem mudar nenhuma outra regra da proteção (hoje: force push e deleção bloqueados; histórico linear, revisão obrigatória e enforce_admins desligados). Use a API de proteção sem apagar as regras existentes.
- (E4) Se o token não tiver permissão de administrador, não contorne: relate o erro da API e pare; vira ação do dono.
- (E4) `docs/engineering/fluxo-homologacao.md` atualizado com a regra nova (quais checks, por quê, como mudar) e parecer de devops em `docs/devops/042-protecao-develop.md`, commitados na branch com `Cartão: K-148`, `git add` explícito por caminho, conforme a seção de commits do `docs/engineering/praticas.md`; sem push e sem PR.
- (E4.1) A etapa E4.1 do pedido é esta delegação inteira.
- (E1, E2, E3) Forge 0.30.3, ambiente e retomada da fila: não nesta delegação.

## Fora do escopo
- "E1.1 (dono): no terminal, na raiz do projeto: `forge-upgrade` (cria a branch `forge/upgrade-0.30.3` com o commit da versão; nada vai ao GitHub)." · já entregue
- "E1.2 (forge:tech-lead): push da branch, PR para a develop, parecer de review, merge por squash depois do QA, limpeza da branch." · etapa de outro papel
- "E1.3 (forge:qa-engineer): parecer de QA (CI do PR verde e `pnpm run pronto`)." · etapa de outro papel
- "E2.1 (dono): Docker Engine no WSL (sudo; decisão A do 040), `cp .env.example .env`, Node 24 pelo nvm, `sudo` das dependências do Chromium (`pnpm exec playwright install-deps chromium`), `forge doutor` no terminal (proteção do git e branch homolog) e `/sandbox`." · etapa do dono
- "E2.2 (forge:tech-lead): `pnpm install --frozen-lockfile` e `pnpm exec playwright install chromium`." · já entregue
- "E2.3 (forge:devops-engineer): banco (db:up, db:migrate, db:seed) e consulta de prova." · já entregue
- "E3.1 (forge:software-architect): E2.3 do 041 (ADR 0003, regra do F4), sem depender do ambiente." · já entregue
- "E3.2 (forge:qa-engineer, forge:devops-engineer, forge:tech-lead): o resto do 041 na ordem do pedido 041, depois do E2." · etapa de outra delegação
- "E3.3 (forge:tech-lead): PR de docs do Jarvis, PRs do dependabot (#145, #146, #147) e K-125, depois do E2." · etapa de outro papel
- Proteção da `homolog` e da `main`; `ci.yml` e demais workflows (nada muda neles); push; PR; o quadro.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-27): "talvez precise atualizar algo no banco ja quetroquei de maquina" (coberto pelo E2.3: banco recriado do zero, migrações e seed).
- DECISÃO DO DONO (2026-10-27): "pode usar o poder computacional disponivl para paralelizar" (lido como: agentes em paralelo até o teto de R-TETO desta máquina; suítes de teste limitadas pela memória medida, 7 GB visíveis).
- DECISÃO DO DONO (2026-10-27): pedido de origem acima (atualizar para 0.30.3 por branch e PR para a develop; retomar a fila).
- DECISÃO DO DONO (2026-10-27): integrações, opção B ("prefiro deixar para mexer nas integracoes reais quando acabar tudo porque vai consumir poder computacional que eu quero usar para entregar as coisas, temos que fazer as metricas operacionais"): integrações reais só depois de todo o backlog.
- DECISÃO DO DONO (2026-10-27): proteção da develop, opção A ("A"): a develop passa a exigir os checks da CI verdes para aceitar merge; o devops-engineer configura no GitHub e registra no fluxo de homologação.
- ADR 0003, ADR 0014 e ADR 0020 (citadas no pedido): nada nelas muda nesta entrega.
- A mudança é gatilho de segurança (controle de merge, R-SEGURANCA): o parecer de segurança vem depois, na revisão desta branch. R-CONFORMIDADE: bloqueio não se contorna, vira relato; R-MAIN: nada na `main`; R-VERIFY: nunca `--no-verify` nem `--force`; R-CUSTO: nada que custe dinheiro.

## Pronto quando
- PQ-1 (cmd): `gh api repos/rodrigo-isensee/MetricasDSPD/branches/develop/protection --jq '.required_status_checks.contexts | length > 0'` · espera: igual 'true'
- PQ-2 (cmd): `gh api repos/rodrigo-isensee/MetricasDSPD/branches/develop/protection --jq '.allow_force_pushes.enabled'` · espera: igual 'false'
- PQ-3 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-042p log -1 --format=%H -- docs/engineering/fluxo-homologacao.md` · espera: o sha40 do commit desta entrega com `Cartão: K-148`
- PQ-4 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-042p status --porcelain` · espera: linhas=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Inclui a lista dos checks exigidos. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
