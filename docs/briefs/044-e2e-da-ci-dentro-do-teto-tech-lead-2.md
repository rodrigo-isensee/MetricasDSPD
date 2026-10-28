Agente destino: forge:tech-lead
Pedido: 044-e2e-da-ci-dentro-do-teto
Tipo: merge
Branch: feature/044-e2e-em-partes   Base: develop   Base-sha: 9cc84d3861b323fb84818a1458dc97cbfd09ae9b
Etapa: merge-integracao

## Objetivo
Etapa E1.5 do pedido 044 (cartão K-155), primeira parte: PR da `feature/044-e2e-em-partes` para a develop e merge por squash depois dos checks verdes, com a limpeza da branch e da worktree. Com o `e2e` em 2 partes na develop, os PRs #151 e #152 podem receber a develop (outra delegação). Pareceres aprovados: devops (d26b903, regravado no head final), review (ef310bf), segurança (3eae989) e QA (62a505b, run 40677944455 verde). Worktree `/home/rodrigoisensee/MetricasDSPD-044`, head d26b903eed6c64ab2582bda6c26caa12aca8cd1d, já no origin.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-044/docs/qa/044-e2e-em-partes.md`: frontmatter, `## Achados` e o corpo com o run, as contagens e as durações.
- `/home/rodrigoisensee/MetricasDSPD-044/docs/devops/044-e2e-em-partes.md`, `docs/reviews/044-e2e-em-partes.md` e `docs/security/044-e2e-em-partes.md` da worktree: só o frontmatter e `## Achados`.

## Entregar
- (E1, E1.5) `forge-check pr` da worktree limpo antes de abrir o PR, com `--base origin/develop` e sem base (o hook usa a forma sem base).
- (E1, E1.5) PR para a `develop` com `gh pr create --base develop --head feature/044-e2e-em-partes --body-file <arquivo>`: título em português no padrão de commits do `docs/engineering/praticas.md`; corpo com o resumo (E2E da CI em 2 partes por shard do Playwright, job agregador `e2e` com o mesmo nome do check obrigatório, Mermaid numa parte só, artefato de falha por parte, teto de 30 min por parte sem aumento de timeout nem retry), o run 40677944455 com as durações e a contagem 358 + 358 = 716, os quatro pareceres citados por caminho, a recomendação A2 do review para o dono (não pôr os checks `e2e-parte` no ruleset) e a linha `Cartão: K-155`.
- (E1, E1.5) Esperar os checks obrigatórios do ruleset (`gh pr checks feature/044-e2e-em-partes --watch --required`); com todos em pass (ou skipped pelo filtro de caminhos no run de pull_request, com pass no de push do mesmo head), merge com `gh pr merge feature/044-e2e-em-partes --squash` (sem `--admin`). Check vermelho, conflito, branch desatualizada exigida pela proteção ou recusa de hook: sem merge, relate a mensagem inteira (R-CONFORMIDADE). Comandos por nome de branch, sem variáveis de shell.
- (E1, E1.5) Depois do merge: `rm -rf /home/rodrigoisensee/MetricasDSPD-044/node_modules` se existir, remover a worktree `/home/rodrigoisensee/MetricasDSPD-044` (sem `--force`) e apagar a branch remota e a local (R-FLUXO, "Depois do merge"); só se os heads remoto e local forem o `headRefOid` do PR.
- (E2, E3) Nada a entregar aqui: não nesta delegação (artefatos e pareceres já entregues).

## Fora do escopo
- "E1.1 (forge:devops-engineer): a divisão em 2 partes e o job agregador `e2e` (E1, E2), na branch `feature/044-e2e-em-partes`, com o parecer de devops (E3)." · etapa de outra delegação; já entregue (b0c0f69, parecer regravado em d26b903)
- "E1.2 (forge:tech-lead): code review." · etapa de outra delegação; já entregue (ef310bf)
- "E1.3 (forge:security-engineer): parecer de segurança do workflow, junto com o code review." · etapa de outra delegação; já entregue (3eae989)
- "E1.4 (forge:qa-engineer): parecer de QA: o run de workflow_dispatch na branch mostra as 2 partes somando os 726 testes e o `e2e` verde." · etapa de outra delegação; já entregue (62a505b)
- E1.5, segunda parte: os PRs #151 e #152 recebem a develop · etapa de outra delegação; continua no pedido (depois deste merge)
- Mudar workflows, documentação, testes ou qualquer parecer (achado vira relato, não correção); criar outro PR além deste; mexer nos PRs #151, #152 e #153; re-executar checks; rodar suítes de teste locais; ruleset e proteção de branch; `homolog` e `main`; o quadro; ler ou editar o `.env`; as worktrees -026, -041b e -upgrade.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-28): "Eu estou indo dormir faça tudo Que não depende de mim".
- Decisão técnica do Jarvis (Histórico do pedido 044, 2026-10-28 07:39): dividir em partes, não subir o teto.
- O check obrigatório do ruleset se chama `e2e`. O ruleset é do dono; não mexer.
- Teste local: nenhum (o diff é workflow e documentação; os checks do PR são a prova). R-MAIN: nada na `main`. R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`. R-CONFORMIDADE: bloqueio vira relato. O hook barra `$`, crase, chaves e `?` no Bash: comandos literais, um por linha.

## Pronto quando
- PQ-1 (cmd): na raiz de `/home/rodrigoisensee/MetricasDSPD-044`, `/home/rodrigoisensee/.claude/plugins/cache/forge/forge/0.30.3/bin/forge-check --raiz-pedidos /home/rodrigoisensee/MetricasDSPD pr 044-e2e-da-ci-dentro-do-teto --ref feature/044-e2e-em-partes --base origin/develop` · espera: rc=0 (antes de abrir o PR)
- PQ-2 (cmd): na raiz de `/home/rodrigoisensee/MetricasDSPD-044`, `/home/rodrigoisensee/.claude/plugins/cache/forge/forge/0.30.3/bin/forge-check --raiz-pedidos /home/rodrigoisensee/MetricasDSPD pr 044-e2e-da-ci-dentro-do-teto` · espera: rc=0 (antes de abrir o PR)
- PQ-3 (pr): `gh pr view feature/044-e2e-em-partes --json number,baseRefName,body` · espera: base `develop`, corpo com 'Cartão: K-155'
- PQ-4 (run): `gh pr checks feature/044-e2e-em-partes --required` · espera: todos os obrigatórios em pass (ou skipped por filtro no run de pull_request com pass no de push do mesmo head)
- PQ-5 (merge): `gh pr view feature/044-e2e-em-partes --json state,mergeCommit` · espera: state `MERGED` e o sha40 do commit do merge
- PQ-6 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD ls-remote origin refs/heads/feature/044-e2e-em-partes` · espera: linhas=0
- PQ-7 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD worktree list --porcelain | grep -c 'MetricasDSPD-044'` · espera: igual '0'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Inclui o número do PR, o sha do merge e o tempo de espera dos checks (com a duração das 2 partes do `e2e` no PR). Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
