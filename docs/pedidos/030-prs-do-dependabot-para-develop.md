# Pedido 030 — PRs do Dependabot vão para a develop, não para a main

- **Data:** 2026-10-17
- **Origem:** usuário: "voce tem varios prs abertos direto para main, segundo processo voce sempre leva pra develop, depois joga a develop da homolog e depois deixa o pr pronto para mim fazer para main. Corrija tudo".
- **Modo:** implementar.
- **Clareza:** alta. Os PRs abertos contra a `main` são os #110, #111 e #112, todos do Dependabot; a causa é o `.github/dependabot.yml` sem `target-branch`, que usa a branch padrão (`main`).

## Escopo
- E1. Os três PRs abertos do Dependabot (#110, #111, #112) passam a ter base `develop`, sem mesclar nada agora. · `confirmado`
- E3. Resolver o conflito dos PRs #110 e #112 com a develop (pedido do usuário: "estou com duas branchs com conflito resolva"), pedindo ao Dependabot que refaça a branch sobre a develop, sem mesclar. · `confirmado`
- E2. O `.github/dependabot.yml` ganha `target-branch: develop` nos dois ecossistemas (npm e github-actions), pelo fluxo normal (`feature/*` → `develop` → `homolog` → `main`), com parecer de devops e de segurança (gatilho de CI/CD, R-SEGURANCA), review e QA. · `confirmado`

## Etapas
- E1.1 (forge:tech-lead): trocar a base dos PRs #110, #111 e #112 para `develop` (`gh pr edit <n> --base develop`), sem mesclar.
- E3.1 (forge:tech-lead): comentar `@dependabot rebase` nos PRs #110 e #112 e conferir que ficam sem conflito; sem mesclar e sem editar a branch do Dependabot à mão.
- E3.2 (forge:tech-lead): comentar `@dependabot recreate` nos PRs #110 e #112 (decisão do dono, opção A) e conferir que ficam sem conflito, sem mesclar.
- E2.1 (forge:devops-engineer): `target-branch: develop` no `.github/dependabot.yml`, numa branch `feature/030-dependabot-develop`, com parecer em `docs/devops/`.
- E2.1b (forge:devops-engineer): regravar o parecer de devops com a ferramenta Write (registro de autoria do papel), sem mudar o conteúdo, commitar e enviar, antes do E2.5.
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
- ESCOPO+: 2026-10-17 — Usuário: "estou com duas branchs com conflito resolva". São os PRs do Dependabot #110 e #112 (CONFLICTING com a develop desde a troca de base). Entra como E3: o próprio Dependabot refaz a branch (`@dependabot rebase`); nada é mesclado.
- 2026-10-17 — E3.1: o tech-lead comentou `@dependabot rebase` nos #110 e #112; o Dependabot recusou nos dois ("has been edited by someone other than Dependabot"): as branches têm um merge da develop feito pelo dono às 18:23Z e 18:24Z (32e277ce7 e 17a0c18c8), com uma develop antiga, e continuam CONFLICTING com a develop atual (93b2ab1). Nada foi editado.
- PERGUNTA: 2026-10-17 — Como destravar o conflito dos #110 e #112: A `@dependabot recreate` (o Dependabot refaz cada branch do zero sobre a develop e descarta o merge manual); B o tech-lead faz merge da develop atual nas branches e resolve o conflito à mão (a branch fica fora do controle do Dependabot); C fechar os dois PRs e esperar o Dependabot abrir de novo. Recomendação: A.
- 2026-10-17 — Conferência da entrega do E3.1: "não cumpriu" (PQ-1 e PQ-2 CONFLICTING), igual ao bloco Provas do tech-lead; comentários postados, nada mesclado, nenhum commit do agente nas branches. Não é retrabalho do autor: o destravamento espera a decisão do dono (PERGUNTA acima).
- 2026-10-17 — DECISÃO DO DONO: opção A (`@dependabot recreate` nos #110 e #112; o merge manual das branches é descartado). Nova etapa E3.2 (forge:tech-lead): comentar `@dependabot recreate` nos dois PRs e conferir que ficam sem conflito, sem mesclar.
- 2026-10-17 — E3.2: `@dependabot recreate` postado nos #110 e #112. O #112 foi recriado (head 4c0a773), sem conflito, mas com base `main` (o Dependabot lê a configuração da main, ainda sem `target-branch`). O #110 foi fechado pelo Dependabot ("updatable in another way") e substituído pelo #120, também com base `main`. A troca de base para `develop` foi negada ao agente pela classificação de permissões da sessão; ele parou sem contornar (R-CONFORMIDADE). Ação pendente do dono: trocar a base dos #112 e #120 para `develop` no GitHub (ou autorizar o agente). Nada mesclado.
- 2026-10-17 — Conferência da entrega do E3.2: "não cumpriu" (PQ-1: #110 fechado pelo Dependabot e substituído pelo #120; PQ-2 cumprido, #112 MERGEABLE com base main), igual ao bloco Provas do tech-lead; só os dois comentários, nada mesclado, nenhum commit do agente. Decisão técnica do Jarvis: entrega aceita (o #110 deixou de existir por ato do Dependabot, não do autor). Pendente do dono: base dos #112 e #120 para develop.
- 2026-10-17 — E2.2: parecer de segurança aprovado (`docs/security/030-dependabot-develop.md` na worktree -030, sem commit; o tech-lead commita no review). Observações sem bloqueio: O-1 correção de vulnerabilidade espera a próxima release (release sob demanda para severidade alta, decisão do dono); O-2 confirmar se os PRs de security updates seguem o `target-branch` depois que a mudança chegar à main.
- 2026-10-17 — E2.3: review aprovado (fc33b44, parecer de segurança 7d04ce9), branch enviada; em conferência.
- 2026-10-17 — Usuário: "ainda tenho dois conflitos". Os #112 e #120 (base `main`, sem edição humana) ficaram CONFLICTING depois que o dono mesclou o #119 (homolog → main, 19:15Z); o dono também mesclou o #117 (develop → homolog) e o #118 (quadro, develop). Caminho: o dono troca a base dos dois para `develop` (negada ao agente) e o tech-lead comenta `@dependabot rebase`, que agora funciona porque as branches não têm edição humana.
- 2026-10-17 — Conferência da entrega do E2.3: cumpriu (PQ-1, PQ-2 e PQ-4; PQ-3 do autor). Achado de forma sem efeito: `revisor: forge:tech-lead` no frontmatter, onde os pareceres anteriores usam `tech-lead`.
- 2026-10-17 — E2.4: QA aprovado, 0 bugs (`pnpm run pronto` rc=0; parecer 11f71ee, enviado); em conferência.
- 2026-10-17 — Conferência da entrega do E2.4: PQ-1, PQ-3, PQ-4 e PQ-5 cumpridos (PQ-2 do autor); "não cumpriu" só por `escopo: fora` medido de Base-sha (os pareceres de devops e segurança vieram do E2.1 e do E2.2, não do QA; o diff do QA, fc33b44..HEAD, só tem o parecer de QA). Decisão técnica do Jarvis: entrega aceita (mesmo falso positivo já mandado à fábrica). Achado real: o `forge-check pr` barra a etapa `pr` porque o parecer de devops não tem registro de autoria do papel devops. Nova etapa E2.1b (forge:devops-engineer): regravar o parecer de devops com a ferramenta Write, sem mudar o conteúdo, commitar e enviar, antes do E2.5.
- 2026-10-17 — E2.1b: o devops regravou o parecer com Write; conteúdo idêntico, sem commit novo; `forge-check pr 030-prs-do-dependabot-para-develop --ref feature/030-dependabot-develop --base develop` agora sai com rc=0 (a autoria fica registrada fora do git). Decisão técnica do Jarvis: aceito sem commit vazio (o PQ-1 pedia commit, mas o objetivo, destravar o forge-check pr, foi cumprido); sem commit nem ato no GitHub, não há conferência de entrega.
- 2026-10-17 — Usuário: "pare os desenvolvimentos ate amanha. Quero subir uma nova versao do forge mais rapida". O E2.5 (PR para a develop, já em andamento) termina; nada novo é delegado.
- 2026-10-17 — E2.5 parado: PR #121 aberto (base develop, quatro pareceres citados), mas BEHIND. A branch remota foi atualizada por fora (8d7dae9, "Merge branch 'develop' into feature/030-dependabot-develop") e a develop avançou para aef6595; o push do tech-lead foi rejeitado e a sincronização local (reset/merge da remota) foi negada ao agente pela classificação de permissões. Fica para amanhã, pela pausa pedida pelo dono; a worktree -030 tem um merge local não enviado, descartável.
