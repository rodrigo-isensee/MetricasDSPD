Agente destino: forge:qa-engineer
Pedido: docs/pedidos/030-prs-do-dependabot-para-develop.md
Branch: feature/030-dependabot-develop   Base: develop   Base-sha: 0cad9f3c66c072bbf9f488c166a8ca796cc4d720

## Objetivo
Portão de QA (R-QA) da mudança do pedido 030: `target-branch: develop` nos dois blocos do `.github/dependabot.yml`, para o Dependabot abrir os PRs na `develop`. Etapa E2.4 do pedido 030. Worktree `/home/rodrigoisensee/MetricasDSPD-030`, branch `feature/030-dependabot-develop` (head fc33b44ed23ae04865edb40818b4a4656d0674e3, no remoto, review aprovado).

## Ler
- `docs/pedidos/030-prs-do-dependabot-para-develop.md` (Escopo e Etapas).
- Na worktree: `git diff 0cad9f3c66c072bbf9f488c166a8ca796cc4d720 fc33b44ed23ae04865edb40818b4a4656d0674e3 -- .github/dependabot.yml` e o parecer de review `docs/reviews/030-prs-do-dependabot-para-develop.md`.

## Entregar
- (E2) Validar o yml: YAML válido (por exemplo `node -e` com o parser já instalado na worktree, ou `python3 -c 'import yaml'` se houver), `version: 2`, dois blocos em `updates` (npm e github-actions), cada um com `target-branch: develop`, e nenhuma outra chave alterada em relação a 0cad9f3.
- (E2) Rodar da raiz da worktree `pnpm run pronto` (dependências já instaladas) e registrar o código de saída.
- (E2) Gravar o parecer de QA em `docs/qa/030-prs-do-dependabot-para-develop.md` com a ferramenta Write (frontmatter no padrão dos pareceres de QA do projeto, `branch: feature/030-dependabot-develop`, `commit: fc33b44`, `parecer:`), commitar (`git add` explícito por caminho, mensagem `docs(qa): parecer do Dependabot na develop (030)`) e enviar a branch (`git push origin feature/030-dependabot-develop`, sem `--force`; se o pre-push recusar, pare e relate).

## Fora do escopo
- "E2.5 (forge:tech-lead): PR para a develop, mesclado." · etapa de outro papel; vem depois do QA.
- "E2.6 (dono): a mudança só vale para o Dependabot quando chegar à `main` (ele lê a configuração da branch padrão); entra na próxima release homolog → main, que é do dono." · etapa do dono. Por isso o efeito real (PRs nascendo na develop) não é testável agora; fica como pendência registrada no parecer.
- "E1.1 (forge:tech-lead): trocar a base dos PRs #110, #111 e #112 para `develop` (`gh pr edit <n> --base develop`), sem mesclar.", "E3.1 (forge:tech-lead): comentar `@dependabot rebase` nos PRs #110 e #112 e conferir que ficam sem conflito; sem mesclar e sem editar a branch do Dependabot à mão." e "E3.2 (forge:tech-lead): comentar `@dependabot recreate` nos PRs #110 e #112 (decisão do dono, opção A) e conferir que ficam sem conflito, sem mesclar." · etapas de outro papel, já feitas.
- Mudar o yml ou os pareceres de devops, segurança e review; os PRs do Dependabot (#112, #120); o quadro (`KANBAN.md`), que é do Jarvis.

## Decisões e restrições
- Pedido do usuário (pedido 030, 2026-10-17): "segundo processo voce sempre leva pra develop, depois joga a develop da homolog e depois deixa o pr pronto para mim fazer para main. Corrija tudo".
- DECISÃO DO DONO (pedido 030, 2026-10-17): opção A (`@dependabot recreate` nos #110 e #112; o merge manual das branches é descartado). Já executada; não muda este QA.
- DECISÃO DO DONO (pedido 023, 2026-10-17): "A regra do projeto nunca passa sobre a fábrica".
- R-MAIN: nada na `main`. R-VERIFY: sem `--no-verify` nem `--force`. R-CONFORMIDADE: bloqueio não se contorna; vira relato.
- Teto: 2 agentes de dia, uma tarefa pesada por vez (restrição do usuário de 2026-10-17, pedido 024): o `pnpm run pronto` é a única tarefa pesada agora.
- NÃO tocar: o diretório principal e as outras worktrees.

## Pronto quando
- PQ-1 (cmd): `grep -c 'target-branch: develop' /home/rodrigoisensee/MetricasDSPD-030/.github/dependabot.yml` · espera: igual '2'
- PQ-2 (cmd): `cd /home/rodrigoisensee/MetricasDSPD-030 && pnpm run pronto` · espera: rc=0
- PQ-3 (sha): commit do parecer de QA na `feature/030-dependabot-develop`, com sha completo no relatório.
- PQ-4 (cmd): `grep -c '^parecer: ' /home/rodrigoisensee/MetricasDSPD-030/docs/qa/030-prs-do-dependabot-para-develop.md` · espera: igual '1'
- PQ-5 (push): `git -C /home/rodrigoisensee/MetricasDSPD-030 ls-remote origin refs/heads/feature/030-dependabot-develop` igual ao head local.

## Relatório
Até 8 linhas: estado; o que precisa do usuário; suposições (com a base); o veredito e os achados, com evidência; riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.
