# Pedido 030 — PRs do Dependabot vão para a develop, não para a main

- **Data:** 2026-10-17
- **Origem:** usuário: "voce tem varios prs abertos direto para main, segundo processo voce sempre leva pra develop, depois joga a develop da homolog e depois deixa o pr pronto para mim fazer para main. Corrija tudo".
- **Modo:** implementar.
- **Clareza:** alta. Os PRs abertos contra a `main` são os #110, #111 e #112, todos do Dependabot; a causa é o `.github/dependabot.yml` sem `target-branch`, que usa a branch padrão (`main`).

## Escopo
- E1. Os três PRs abertos do Dependabot (#110, #111, #112) passam a ter base `develop`, sem mesclar nada agora. · `confirmado`
- E2. O `.github/dependabot.yml` ganha `target-branch: develop` nos dois ecossistemas (npm e github-actions), pelo fluxo normal (`feature/*` → `develop` → `homolog` → `main`), com parecer de devops e de segurança (gatilho de CI/CD, R-SEGURANCA), review e QA. · `confirmado`

## Etapas
- E1.1 (forge:tech-lead): trocar a base dos PRs #110, #111 e #112 para `develop` (`gh pr edit <n> --base develop`), sem mesclar.
- E2.1 (forge:devops-engineer): `target-branch: develop` no `.github/dependabot.yml`, numa branch `feature/030-dependabot-develop`, com parecer em `docs/devops/`.
- E2.2 (forge:security-engineer): parecer de segurança da mudança em `docs/security/`.
- E2.3 (forge:tech-lead): review.
- E2.4 (forge:qa-engineer): QA.
- E2.5 (forge:tech-lead): PR para a develop, mesclado.
- E2.6 (dono): a mudança só vale para o Dependabot quando chegar à `main` (ele lê a configuração da branch padrão); entra na próxima release homolog → main, que é do dono.

## Fora do escopo
- Mesclar ou avaliar o conteúdo das atualizações de dependência (o #112 sobe o react-router de 7 para 8, versão maior; vira cartão próprio).
- Mexer na `main` (R-MAIN).

## Andamento
- 2026-10-17 — Recibo ao usuário: vou fazer: trocar a base dos 3 PRs do Dependabot para a develop e configurar o Dependabot para abrir os próximos na develop; não vou fazer: mesclar as atualizações agora.
- 2026-10-17 — E1.1: base dos #110, #111 e #112 trocada para develop, com comentário em cada um. O `gh pr edit` falhou no cliente (token sem `read:org`) e o tech-lead usou `gh api -X PATCH .../pulls/<n> -f base=develop`; o GitHub aceitou. Decisão técnica do Jarvis: aceito (o brief mandava parar se o GitHub recusasse, e ele não recusou; o efeito é o mesmo do `gh pr edit`). Registrado o desvio.
- 2026-10-17 — Conferência da entrega do E1.1: PQ-1 e PQ-2 cumpridos, os três PRs abertos com base develop, sem merge, com o comentário. Veredito "não cumpriu" só por forma da entrada (Base igual à Branch num ato só no GitHub, sem branch de trabalho). Decisão técnica do Jarvis: entrega aceita; a regra de Base ≠ Branch não tem caso para ato sem branch (vai para melhorias).
- 2026-10-17 — E2.1: dois commits locais na feature/030-dependabot-develop (9b2ffe9 yml, mais o parecer de devops); o push foi barrado pelo pre-push por falta de dependências, e o hook de conformidade não deixa o devops rodar `pnpm install` (papel de dev, QA e tech-lead). Erro do brief do Jarvis. Decisão técnica: uma instância do tech-lead instala as dependências na worktree -030 e envia.
- 2026-10-17 — Entrega do E2.1 (devops e push) conferida: cumpriu (os dois briefs).
