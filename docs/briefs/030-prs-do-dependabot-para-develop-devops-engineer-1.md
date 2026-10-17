Agente destino: forge:devops-engineer
Pedido: docs/pedidos/030-prs-do-dependabot-para-develop.md
Branch: feature/030-dependabot-develop   Base: develop   Base-sha: 0cad9f3c66c072bbf9f488c166a8ca796cc4d720

## Objetivo
Fazer o Dependabot abrir os PRs na `develop`, e não na `main`: hoje o `.github/dependabot.yml` não tem `target-branch` e usa a branch padrão (`main`), o que gerou os PRs #110, #111 e #112 contra a `main` (pedido do usuário de 2026-10-17: nenhum PR de trabalho vai direto para a `main`). Etapa E2.1 do pedido 030. Crie a worktree `/home/rodrigoisensee/MetricasDSPD-030` com a branch `feature/030-dependabot-develop` saída de `origin/develop` (0cad9f3c66c072bbf9f488c166a8ca796cc4d720) e rode `pnpm install --frozen-lockfile` nela (o pre-push precisa das dependências).

## Ler
- `docs/pedidos/030-prs-do-dependabot-para-develop.md` (Escopo e Etapas).
- `.github/dependabot.yml` (inteiro, 20 linhas).
- `docs/engineering/fluxo-homologacao.md`, só a parte de branches (§1).

## Entregar
- (E2) Acrescentar `target-branch: develop` nos dois blocos de `updates` (npm e github-actions) do `.github/dependabot.yml`, sem mudar agendas, grupos nem limites.
- (E2) Parecer de devops em `docs/devops/030-dependabot-develop.md` (frontmatter no padrão dos pareceres de `docs/devops/` do projeto, `pedido: 030-prs-do-dependabot-para-develop`, `branch: feature/030-dependabot-develop`), gravado com a ferramenta Write: a mudança, o efeito (passa a valer quando a configuração chegar à `main`, que é a branch padrão lida pelo Dependabot) e o risco.
- (E2) Dois commits (`ci(dependabot): ...` com o yml; `docs(devops): ...` com o parecer), `git add` por caminho, push da branch sem `--force`. Não abra PR.

## Fora do escopo
- "E1.1 (forge:tech-lead): trocar a base dos PRs #110, #111 e #112 para `develop` (`gh pr edit <n> --base develop`), sem mesclar." · etapa de outro papel.
- "E2.2 (forge:security-engineer): parecer de segurança da mudança em `docs/security/`.", "E2.3 (forge:tech-lead): review." e "E2.4 (forge:qa-engineer): QA." · etapas de outro papel; vêm depois.
- "E2.5 (forge:tech-lead): PR para a develop, mesclado." · etapa de outro papel.
- "E2.6 (dono): a mudança só vale para o Dependabot quando chegar à `main` (ele lê a configuração da branch padrão); entra na próxima release homolog → main, que é do dono." · etapa do dono.
- Outros workflows de `.github/`; mesclar ou avaliar as atualizações de dependência; o quadro (`KANBAN.md`), que é do Jarvis.

## Decisões e restrições
- Pedido do usuário (pedido 030, 2026-10-17): "segundo processo voce sempre leva pra develop, depois joga a develop da homolog e depois deixa o pr pronto para mim fazer para main. Corrija tudo".
- DECISÃO DO DONO (pedido 023, 2026-10-17): "A regra do projeto nunca passa sobre a fábrica".
- R-MAIN: nada na `main`. R-FLUXO: `feature/*` → `develop` → `homolog` → `main`. R-SEGURANCA: mudança em `.github/` é gatilho; o parecer de segurança é outra etapa. R-VERIFY: sem `--no-verify` nem `--force`. R-CONFORMIDADE: bloqueio não se contorna; vira relato.
- NÃO tocar: o diretório principal, as worktrees `-011-fase2` e `-023`, outros arquivos de `.github/`.
- Teto: 2 agentes de dia, uma tarefa pesada por vez (restrição do usuário de 2026-10-17, pedido 024, "Restrições do usuário"): o `pnpm install` é a única tarefa pesada; sem `pronto` nem E2E local.

## Pronto quando
- PQ-1 (sha): commit `ci(dependabot)` na branch, com só `.github/dependabot.yml`.
- PQ-2 (cmd): `grep -c 'target-branch: develop' /home/rodrigoisensee/MetricasDSPD-030/.github/dependabot.yml` · espera: igual '2'
- PQ-3 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD-030/docs/devops/030-dependabot-develop.md`
- PQ-4 (push): `git -C /home/rodrigoisensee/MetricasDSPD-030 ls-remote origin refs/heads/feature/030-dependabot-develop` igual ao head local.

## Relatório
Até 8 linhas: estado; o que precisa do usuário; suposições (com a base); o que foi feito, com evidência (shas, diff do yml); riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.
