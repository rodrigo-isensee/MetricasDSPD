Agente destino: forge:devops-engineer
Pedido: 044-e2e-da-ci-dentro-do-teto
Tipo: codigo
Branch: feature/044-e2e-em-partes   Base: develop   Base-sha: 9cc84d3861b323fb84818a1458dc97cbfd09ae9b
Etapa: codigo

## Objetivo
Parte final da etapa E1.1 do pedido 044 (cartão K-155): o `forge-check pr` cobra a autoria do parecer de devops (não há registro de que o papel devops gravou a versão atual de `docs/devops/044-e2e-em-partes.md`). Regravar o parecer pela ferramenta de escrita, revalidado no head final, para o PR do 044 poder abrir. Worktree `/home/rodrigoisensee/MetricasDSPD-044`, head 62a505bef43a6120e4befdfac4714bbdbda78f40 (parecer de QA aprovado), já no origin.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-044/docs/devops/044-e2e-em-partes.md` inteiro.
- `/home/rodrigoisensee/MetricasDSPD-044/docs/qa/044-e2e-em-partes.md`: frontmatter e o corpo com o run 40677944455.

## Entregar
- (E3, E1.1) Regravar `docs/devops/044-e2e-em-partes.md` pela ferramenta de escrita (Write), com o mesmo veredito, `commit: 62a505bef43a6120e4befdfac4714bbdbda78f40` no frontmatter e uma linha no corpo com a revalidação: run 40677944455 de workflow_dispatch em ef310bf verde, partes em 12 min 31 s e 16 min 25 s. Mantenha a seção `## Achados` só com linhas de achado. Commit com `git add` explícito desse caminho, no padrão de commits do `docs/engineering/praticas.md`, com `Cartão: K-155`; push sem `--force` e sem PR.
- (E1, E2) Nada a entregar aqui: não nesta delegação (workflow e artefatos já entregues em b0c0f69).

## Fora do escopo
- "E1.2 (forge:tech-lead): code review." · etapa de outra delegação; já entregue (ef310bf)
- "E1.3 (forge:security-engineer): parecer de segurança do workflow, junto com o code review." · etapa de outra delegação; já entregue (3eae989)
- "E1.4 (forge:qa-engineer): parecer de QA: o run de workflow_dispatch na branch mostra as 2 partes somando os 726 testes e o `e2e` verde." · etapa de outra delegação; já entregue (62a505b)
- "E1.5 (forge:tech-lead): PR para a develop e merge; depois, os PRs #151 e #152 recebem a develop." · etapa de outra delegação; continua no pedido (depois deste parecer)
- Mudar o workflow, os testes ou outros pareceres; disparar novos runs; abrir PR; re-executar checks dos PRs #151, #152 e #153; ruleset; `homolog` e `main`; o quadro; ler ou editar o `.env`; as worktrees -026, -041b e -upgrade.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-28): "Eu estou indo dormir faça tudo Que não depende de mim".
- Decisão técnica do Jarvis (Histórico do pedido 044, 2026-10-28 08:10): o devops-engineer regrava o parecer pela ferramenta de escrita depois do QA, na mesma branch.
- O parecer é gravado pela ferramenta de escrita (Write), nunca por Bash, e sem `commit --amend`. R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`. R-CONFORMIDADE: bloqueio vira relato. O hook barra `$`, crase, chaves e `?` no Bash: comandos literais, um por linha.

## Pronto quando
- PQ-1 (cmd): `grep -c -e '^parecer: ' -e '^commit: 62a505bef43a6120e4befdfac4714bbdbda78f40' /home/rodrigoisensee/MetricasDSPD-044/docs/devops/044-e2e-em-partes.md` · espera: igual '2'
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-044 diff --name-only 62a505bef43a6120e4befdfac4714bbdbda78f40 HEAD` · espera: igual 'docs/devops/044-e2e-em-partes.md'
- PQ-3 (cmd): na raiz de `/home/rodrigoisensee/MetricasDSPD-044`, `/home/rodrigoisensee/.claude/plugins/cache/forge/forge/0.30.3/bin/forge-check --raiz-pedidos /home/rodrigoisensee/MetricasDSPD pr 044-e2e-da-ci-dentro-do-teto --base origin/develop` · espera: rc=0
- PQ-4 (push): `git -C /home/rodrigoisensee/MetricasDSPD-044 ls-remote origin refs/heads/feature/044-e2e-em-partes` · espera: contém o sha40 de `git -C /home/rodrigoisensee/MetricasDSPD-044 rev-parse HEAD`
- PQ-5 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-044 status --porcelain` · espera: linhas=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Inclui o veredito e o sha do commit. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
