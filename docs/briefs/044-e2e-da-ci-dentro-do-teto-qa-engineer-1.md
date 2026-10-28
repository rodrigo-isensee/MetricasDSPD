Agente destino: forge:qa-engineer
Pedido: 044-e2e-da-ci-dentro-do-teto
Tipo: qa
Branch: feature/044-e2e-em-partes   Base: develop   Base-sha: 9cc84d3861b323fb84818a1458dc97cbfd09ae9b
Etapa: qa

## Objetivo
Etapa E1.4 do pedido 044 (cartão K-155): portão de QA (R-QA) da divisão da E2E da CI em 2 partes com o job agregador `e2e` (workflow em b0c0f69, devops-engineer-1). Review aprovado (ef310bf62716e95f161a076c03758c175468496f) e segurança aprovada (3eae989), os dois sem bloqueante. Falta a prova no head final: um run de workflow_dispatch em ef310bf com as 2 partes somando todos os testes da E2E e o `e2e` verde. Com o parecer, o tech-lead abre o PR. Worktree `/home/rodrigoisensee/MetricasDSPD-044`, head ef310bf62716e95f161a076c03758c175468496f, já no origin.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-044 diff 9cc84d3861b323fb84818a1458dc97cbfd09ae9b ef310bf62716e95f161a076c03758c175468496f -- .github/workflows/ci.yml`.
- `/home/rodrigoisensee/MetricasDSPD-044/docs/reviews/044-e2e-em-partes.md` e `/home/rodrigoisensee/MetricasDSPD-044/docs/security/044-e2e-em-partes.md`: frontmatter e `## Achados`.

## Entregar
- (E1, E1.4) Disparar `gh workflow run ci.yml --ref feature/044-e2e-em-partes` com a branch em ef310bf, esperar o run (`gh run watch <id> --exit-status`) e conferir: `e2e-parte (1/2)`, `e2e-parte (2/2)` e `e2e` em success; a soma dos testes das 2 partes (linha `Running N tests` de cada log) igual ao total de `pnpm --filter @metricas-dspd/e2e exec playwright test --list --project=chromium` na worktree (a listagem não roda testes); duração de cada parte.
- (E1, E1.4) Parecer em `docs/qa/044-e2e-em-partes.md` pela ferramenta de escrita (Write): frontmatter com `parecer:` (aprovado ou reprovado) e `commit: ef310bf62716e95f161a076c03758c175468496f`; seção `## Achados` só com linhas de achado, uma por linha, até 300 caracteres cada; o id do run, as contagens e as durações no corpo. Commit com `git add` explícito desse caminho e `Cartão: K-155`; push sem `--force` e sem PR.
- (E2, E3) Nada a entregar aqui: não nesta delegação (artefatos e pareceres de devops e segurança já entregues).

## Fora do escopo
- "E1.1 (forge:devops-engineer): a divisão em 2 partes e o job agregador `e2e` (E1, E2), na branch `feature/044-e2e-em-partes`, com o parecer de devops (E3)." · etapa de outra delegação; já entregue (b0c0f69 e 19549b9)
- "E1.2 (forge:tech-lead): code review." · etapa de outra delegação; já entregue (ef310bf)
- "E1.3 (forge:security-engineer): parecer de segurança do workflow, junto com o code review." · etapa de outra delegação; já entregue (3eae989)
- "E1.5 (forge:tech-lead): PR para a develop e merge; depois, os PRs #151 e #152 recebem a develop." · etapa de outra delegação; continua no pedido (depois deste parecer)
- Mudar o workflow, testes ou outros pareceres (defeito vira achado); rodar a E2E ou outras suítes localmente; abrir PR; re-executar checks dos PRs #151, #152 e #153; ruleset; `homolog` e `main`; o quadro; ler ou editar o `.env`; as worktrees -026, -041b e -upgrade.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-28): "Eu estou indo dormir faça tudo Que não depende de mim".
- Decisão técnica do Jarvis (Histórico do pedido 044, 2026-10-28 07:39): dividir em partes, não subir o teto.
- Decisão técnica do Jarvis (Histórico do pedido 044, 2026-10-28 08:06): o QA prova com um run de workflow_dispatch no head final.
- O check obrigatório do ruleset se chama `e2e`. O ruleset é do dono; não mexer.
- Node: prefixo literal `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin` antes do `pnpm`. R-QA: o parecer é do QA, gravado pela ferramenta de escrita, nunca por Bash, e sem `commit --amend`. R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`. R-CONFORMIDADE: bloqueio vira relato. O hook barra `$`, crase, chaves e `?` no Bash: comandos literais, um por linha.

## Pronto quando
- PQ-1 (run): `gh run list --workflow ci.yml --branch feature/044-e2e-em-partes --event workflow_dispatch --limit 1 --json conclusion,headSha` · espera: conclusion `success` e headSha `ef310bf62716e95f161a076c03758c175468496f`
- PQ-2 (cmd): `grep -c -e '^parecer: ' -e '^commit: ef310bf62716e95f161a076c03758c175468496f' /home/rodrigoisensee/MetricasDSPD-044/docs/qa/044-e2e-em-partes.md` · espera: igual '2'
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-044 diff --name-only ef310bf62716e95f161a076c03758c175468496f HEAD` · espera: igual 'docs/qa/044-e2e-em-partes.md'
- PQ-4 (push): `git -C /home/rodrigoisensee/MetricasDSPD-044 ls-remote origin refs/heads/feature/044-e2e-em-partes` · espera: contém o sha40 de `git -C /home/rodrigoisensee/MetricasDSPD-044 rev-parse HEAD`
- PQ-5 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-044 status --porcelain` · espera: linhas=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Inclui o parecer, o id do run, as contagens por parte e o total listado, as durações e o sha do commit. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
