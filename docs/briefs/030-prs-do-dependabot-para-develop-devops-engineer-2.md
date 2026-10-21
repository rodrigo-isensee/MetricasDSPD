Agente destino: forge:devops-engineer
Pedido: docs/pedidos/030-prs-do-dependabot-para-develop.md
Branch: feature/030-dependabot-develop   Base: develop   Base-sha: 0cad9f3c66c072bbf9f488c166a8ca796cc4d720

## Objetivo
O `forge-check pr` barra o PR do pedido 030 porque o parecer de devops (`docs/devops/030-dependabot-develop.md`) não tem registro de que o papel devops gravou esta versão (autoria, R-REVIEW). Etapa E2.1b do pedido 030: regravar o parecer com a ferramenta Write, sem mudar o conteúdo. Worktree `/home/rodrigoisensee/MetricasDSPD-030`, branch `feature/030-dependabot-develop` (head 11f71ee4bc94df439806892e6eddfe63cf0b8c78, no remoto; review e QA aprovados).

## Ler
- Na worktree: `docs/devops/030-dependabot-develop.md` (o arquivo inteiro, que é curto).

## Entregar
- (E2) Regravar `docs/devops/030-dependabot-develop.md` com a ferramenta Write, com o mesmo conteúdo (o frontmatter `commit: 9b2ffe998297d06ee8cbfee944fedcd330f494d1` continua sendo o código revisado; o yml não mudou desde então). Se o hook de autoria pedir mudança de conteúdo, mude o mínimo e relate.
- (E2) Commitar (`git add docs/devops/030-dependabot-develop.md`, mensagem `docs(devops): regrava o parecer do Dependabot com autoria (030)`) e enviar a branch (`git push origin feature/030-dependabot-develop`, sem `--force`; as dependências já estão instaladas na worktree; se o pre-push recusar, pare e relate).
- (E2) Rodar `forge-check pr 030-prs-do-dependabot-para-develop --ref feature/030-dependabot-develop --base develop` na worktree e copiar a saída.

## Fora do escopo
- "E2.5 (forge:tech-lead): PR para a develop, mesclado." · etapa de outro papel; vem depois.
- "E2.6 (dono): a mudança só vale para o Dependabot quando chegar à `main` (ele lê a configuração da branch padrão); entra na próxima release homolog → main, que é do dono." · etapa do dono.
- "E1.1 (forge:tech-lead): trocar a base dos PRs #110, #111 e #112 para `develop` (`gh pr edit <n> --base develop`), sem mesclar.", "E3.1 (forge:tech-lead): comentar `@dependabot rebase` nos PRs #110 e #112 e conferir que ficam sem conflito; sem mesclar e sem editar a branch do Dependabot à mão." e "E3.2 (forge:tech-lead): comentar `@dependabot recreate` nos PRs #110 e #112 (decisão do dono, opção A) e conferir que ficam sem conflito, sem mesclar." · etapas de outro papel, já feitas.
- Mudar o `.github/dependabot.yml` ou os pareceres de segurança, review e QA; rodar `pnpm install`; abrir PR; o quadro (`KANBAN.md`), que é do Jarvis.

## Decisões e restrições
- Pedido do usuário (pedido 030, 2026-10-17): "segundo processo voce sempre leva pra develop, depois joga a develop da homolog e depois deixa o pr pronto para mim fazer para main. Corrija tudo".
- DECISÃO DO DONO (pedido 030, 2026-10-17): opção A (`@dependabot recreate` nos #110 e #112; o merge manual das branches é descartado). Já executada; não muda esta etapa.
- DECISÃO DO DONO (pedido 023, 2026-10-17): "A regra do projeto nunca passa sobre a fábrica".
- R-MAIN: nada na `main`. R-VERIFY: sem `--no-verify` nem `--force`. R-CONFORMIDADE: bloqueio não se contorna; vira relato.
- NÃO tocar: o diretório principal e as outras worktrees.

## Pronto quando
- PQ-1 (sha): commit do parecer regravado na `feature/030-dependabot-develop`, com sha completo no relatório.
- PQ-2 (push): `git -C /home/rodrigoisensee/MetricasDSPD-030 ls-remote origin refs/heads/feature/030-dependabot-develop` igual ao head local.
- PQ-3 (cmd): `cd /home/rodrigoisensee/MetricasDSPD-030 && forge-check pr 030-prs-do-dependabot-para-develop --ref feature/030-dependabot-develop --base develop` · espera: rc=0

## Relatório
Até 8 linhas: estado; o que precisa do usuário; suposições (com a base); o que foi feito, com evidência; riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.
