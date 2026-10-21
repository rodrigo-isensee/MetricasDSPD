Agente destino: forge:tech-lead
Pedido: docs/pedidos/030-prs-do-dependabot-para-develop.md
Branch: feature/030-dependabot-develop   Base: develop   Base-sha: 0cad9f3c66c072bbf9f488c166a8ca796cc4d720

## Objetivo
Code review da mudança do pedido 030 (`target-branch: develop` no `.github/dependabot.yml`, para o Dependabot abrir os PRs na `develop`), antes do QA (R-REVIEW). Etapa E2.3 do pedido 030. Worktree `/home/rodrigoisensee/MetricasDSPD-030`, branch `feature/030-dependabot-develop` (head 523372c3777ac254aae7d1b4e13e1dc36c068585, no remoto).

## Ler
- `docs/pedidos/030-prs-do-dependabot-para-develop.md` (Escopo, Etapas e as linhas de Andamento sobre E2.1 e E2.2).
- Na worktree: `git diff 0cad9f3c66c072bbf9f488c166a8ca796cc4d720 523372c3777ac254aae7d1b4e13e1dc36c068585`, o parecer de devops `docs/devops/030-dependabot-develop.md` e o de segurança `docs/security/030-dependabot-develop.md` (este sem commit, gravado pelo security-engineer, que não tem Bash).

## Entregar
- (E2) Commitar o parecer de segurança já gravado: `git add docs/security/030-dependabot-develop.md` e commit `docs(security): parecer do Dependabot na develop (030)`, sem alterar o conteúdo.
- (E2) Revisar o yml (sintaxe do Dependabot v2, os dois blocos npm e github-actions com `target-branch: develop`, nada mais mudado) e gravar o parecer de review em `docs/reviews/030-prs-do-dependabot-para-develop.md` com a ferramenta Write (frontmatter no padrão dos pareceres do projeto, `branch: feature/030-dependabot-develop`, `commit:` o head revisado, `parecer:`), e commitá-lo (`git add` explícito por caminho).
- (E2) Rodar da raiz da worktree `pnpm run pronto` (as dependências já estão instaladas na worktree -030) e enviar a branch (`git push origin feature/030-dependabot-develop`, sem `--force`; se o pre-push recusar, pare e relate).

## Fora do escopo
- "E2.4 (forge:qa-engineer): QA." · etapa de outro papel; vem depois.
- "E2.5 (forge:tech-lead): PR para a develop, mesclado." · etapa de outro momento; depois do QA.
- "E2.6 (dono): a mudança só vale para o Dependabot quando chegar à `main` (ele lê a configuração da branch padrão); entra na próxima release homolog → main, que é do dono." · etapa do dono.
- "E3.2 (forge:tech-lead): comentar `@dependabot recreate` nos PRs #110 e #112 (decisão do dono, opção A) e conferir que ficam sem conflito, sem mesclar." e "E3.1 (forge:tech-lead): comentar `@dependabot rebase` nos PRs #110 e #112 e conferir que ficam sem conflito; sem mesclar e sem editar a branch do Dependabot à mão." · etapas de outro momento, já feitas.
- "E1.1 (forge:tech-lead): trocar a base dos PRs #110, #111 e #112 para `develop` (`gh pr edit <n> --base develop`), sem mesclar." · etapa de outro momento, já feita.
- Abrir PR; mexer nos PRs do Dependabot (#112, #120) ou na base deles (pendência do dono); o quadro (`KANBAN.md`), que é do Jarvis.

## Decisões e restrições
- Pedido do usuário (pedido 030, 2026-10-17): "segundo processo voce sempre leva pra develop, depois joga a develop da homolog e depois deixa o pr pronto para mim fazer para main. Corrija tudo".
- DECISÃO DO DONO (pedido 030, 2026-10-17): opção A (`@dependabot recreate` nos #110 e #112; o merge manual das branches é descartado). Já executada (E3.2); não muda este review.
- DECISÃO DO DONO (pedido 023, 2026-10-17): "A regra do projeto nunca passa sobre a fábrica".
- R-MAIN: nada na `main`. R-VERIFY: sem `--no-verify` nem `--force`. R-CONFORMIDADE: bloqueio não se contorna; vira relato.
- Teto: 2 agentes de dia, uma tarefa pesada por vez (restrição do usuário de 2026-10-17, pedido 024): o `pnpm run pronto` é a única tarefa pesada agora.
- NÃO tocar: o diretório principal e as outras worktrees.

## Pronto quando
- PQ-1 (sha): commit do parecer de segurança e commit do parecer de review na `feature/030-dependabot-develop`, com sha completo no relatório.
- PQ-2 (cmd): `grep -c '^parecer: ' /home/rodrigoisensee/MetricasDSPD-030/docs/reviews/030-prs-do-dependabot-para-develop.md` · espera: igual '1'
- PQ-3 (cmd): `cd /home/rodrigoisensee/MetricasDSPD-030 && pnpm run pronto` · espera: rc=0
- PQ-4 (push): `git -C /home/rodrigoisensee/MetricasDSPD-030 ls-remote origin refs/heads/feature/030-dependabot-develop` igual ao head local.

## Relatório
Até 8 linhas: estado; o que precisa do usuário; suposições (com a base); o veredito e os achados do review, com evidência; riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.
