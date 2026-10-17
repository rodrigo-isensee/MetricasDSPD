Agente destino: forge:security-engineer
Pedido: docs/pedidos/030-prs-do-dependabot-para-develop.md
Branch: feature/030-dependabot-develop   Base: develop   Base-sha: 0cad9f3c66c072bbf9f488c166a8ca796cc4d720

## Objetivo
Dar o parecer de segurança (R-SEGURANCA: mudança em `.github/` é gatilho de CI/CD) sobre a mudança do pedido 030: `target-branch: develop` nos dois blocos do `.github/dependabot.yml`, para o Dependabot abrir os PRs na `develop` e não na `main`. Etapa E2.2 do pedido 030. Worktree `/home/rodrigoisensee/MetricasDSPD-030`, branch `feature/030-dependabot-develop` (head 523372c3777ac254aae7d1b4e13e1dc36c068585, no remoto).

## Ler
- `docs/pedidos/030-prs-do-dependabot-para-develop.md` (Escopo).
- Na worktree: `git diff 0cad9f3c66c072bbf9f488c166a8ca796cc4d720 523372c3777ac254aae7d1b4e13e1dc36c068585` (o yml e o parecer de devops `docs/devops/030-dependabot-develop.md`).
- Um parecer de segurança anterior do projeto como modelo de frontmatter: `docs/security/k085-grants-por-coluna.md` (só o cabeçalho).

## Entregar
- (E2) Avaliar o efeito de segurança: PRs de atualização (inclusive os alertas de segurança do Dependabot) passam a mirar a `develop` e só chegam à `main` pelo fluxo develop → homolog → main; risco de atraso de correção de vulnerabilidade e se isso pede ressalva; nenhuma permissão, segredo ou workflow mudou.
- (E2) Gravar `docs/security/030-dependabot-develop.md` com a ferramenta Write (frontmatter no padrão do projeto, `pedido: 030-prs-do-dependabot-para-develop`, `branch: feature/030-dependabot-develop`, `commit: 523372c`, `parecer:`), sem commit: o tech-lead commita no review (o security-engineer não tem Bash).

## Fora do escopo
- "E2.3 (forge:tech-lead): review.", "E2.4 (forge:qa-engineer): QA." e "E2.5 (forge:tech-lead): PR para a develop, mesclado." · etapas de outro papel; vêm depois.
- "E1.1 (forge:tech-lead): trocar a base dos PRs #110, #111 e #112 para `develop` (`gh pr edit <n> --base develop`), sem mesclar." · etapa de outro papel, já feita.
- "E2.6 (dono): a mudança só vale para o Dependabot quando chegar à `main` (ele lê a configuração da branch padrão); entra na próxima release homolog → main, que é do dono." · etapa do dono.
- Mudar o yml ou o parecer de devops; avaliar o conteúdo das atualizações de dependência; o quadro (`KANBAN.md`), que é do Jarvis.

## Decisões e restrições
- Pedido do usuário (pedido 030, 2026-10-17): "segundo processo voce sempre leva pra develop, depois joga a develop da homolog e depois deixa o pr pronto para mim fazer para main. Corrija tudo".
- DECISÃO DO DONO (pedido 023, 2026-10-17): "A regra do projeto nunca passa sobre a fábrica".
- R-MAIN: nada na `main`. R-CONFORMIDADE: bloqueio não se contorna; vira relato.
- NÃO tocar: código, `.github/`, o diretório principal, as outras worktrees.

## Pronto quando
- PQ-1 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD-030/docs/security/030-dependabot-develop.md`, com o veredito no frontmatter.
- PQ-2 (cmd): `grep -c '^parecer: ' /home/rodrigoisensee/MetricasDSPD-030/docs/security/030-dependabot-develop.md` · espera: igual '1'

## Relatório
Até 8 linhas: estado; o que precisa do usuário; suposições (com a base); o veredito e os achados; riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.
