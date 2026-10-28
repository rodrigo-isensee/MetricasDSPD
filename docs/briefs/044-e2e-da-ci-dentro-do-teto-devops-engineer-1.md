Agente destino: forge:devops-engineer
Pedido: 044-e2e-da-ci-dentro-do-teto
Tipo: codigo
Branch: feature/044-e2e-em-partes   Base: develop   Base-sha: 9cc84d3861b323fb84818a1458dc97cbfd09ae9b
Etapa: codigo

## Objetivo
Etapa E1.1 do pedido 044 (cartão K-155): o job obrigatório `e2e` do `.github/workflows/ci.yml` estoura o teto de 30 minutos (PR #152: run 40669258684, 588 de 726 testes em 28 min com 2 workers; PR #151: run 40664083008, cancelado em 30 min) e trava o merge dos PRs #151 e #152. Dividir a E2E em 2 partes paralelas e manter um job de nome `e2e` que agrega as duas, sem subir teto nem timeout. Crie a worktree `/home/rodrigoisensee/MetricasDSPD-044` com a branch `feature/044-e2e-em-partes` a partir de `origin/develop` (9cc84d3861b323fb84818a1458dc97cbfd09ae9b).

## Ler
- `.github/workflows/ci.yml`: o job `e2e` (linhas 190 a 232) e os jobs que dependem dele (`needs`), se houver.
- `e2e/playwright.config.ts` e o script `test:chromium` de `e2e/package.json`.
- `docs/pedidos/044-e2e-da-ci-dentro-do-teto.md`: `## Escopo`, `## Fora do escopo` e `## Suposições`.

## Entregar
- (E1, E1.1) No `ci.yml`: a E2E em 2 partes paralelas (matriz com `--shard=1/2` e `--shard=2/2` do Playwright, mesmo gatilho e mesmos passos de hoje, `timeout-minutes: 30` em cada parte) e um job de nome `e2e` que depende das 2 partes e só termina em sucesso se as duas passarem (falha, cancelamento ou `skipped` das partes por erro deixa o `e2e` vermelho; com o gatilho do job fora do evento, o `e2e` fica como hoje). O passo dos diagramas Mermaid roda numa parte só.
- (E2) Artefato de falha por parte, com nome distinto (ex.: `e2e-relatorio-1` e `e2e-relatorio-2`).
- (E3) Parecer de devops em `docs/devops/044-e2e-em-partes.md`, com `parecer:`, `commit:` e `## Achados`, e as durações medidas das 2 partes.
- Prova: `gh workflow run ci.yml --ref feature/044-e2e-em-partes` depois do push, e esperar o run terminar (`gh run watch <id> --exit-status`).
- Commits no padrão de commits do `docs/engineering/praticas.md`, com `Cartão: K-155`, `git add` explícito por caminho; push da branch sem `--force` e sem PR.

## Fora do escopo
- "E1.2 (forge:tech-lead): code review." · etapa de outra delegação; continua no pedido
- "E1.3 (forge:security-engineer): parecer de segurança do workflow, junto com o code review." · etapa de outra delegação; continua no pedido
- "E1.4 (forge:qa-engineer): parecer de QA: o run de workflow_dispatch na branch mostra as 2 partes somando os 726 testes e o `e2e` verde." · etapa de outra delegação; continua no pedido
- "E1.5 (forge:tech-lead): PR para a develop e merge; depois, os PRs #151 e #152 recebem a develop." · etapa de outra delegação; continua no pedido
- Aumentar `timeout-minutes` de qualquer job, timeouts de teste ou `retries`; mudar testes, código de produção, `homolog.yml` ou outros jobs; ruleset e proteção de branch; abrir PR; re-executar checks dos PRs #151, #152 e #153; rodar suítes locais; `homolog` e `main`; o quadro; ler ou editar o `.env`; as worktrees -026, -041b e -upgrade.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-28): "Eu estou indo dormir faça tudo Que não depende de mim".
- Decisão técnica do Jarvis (Histórico do pedido 044, 2026-10-28 07:39): dividir em partes, não subir o teto.
- O check obrigatório do ruleset se chama `e2e`: o job agregador mantém exatamente esse `name`. O ruleset é do dono; não mexer.
- Fora do escopo do pedido 041 (E2): "sem aumentar timeout e sem retry como solução".
- Ações de terceiros fixadas por sha, como as de hoje; nada de ação nova sem sha.
- R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`. R-CONFORMIDADE: bloqueio vira relato. O hook barra `$`, crase e `?` no Bash: comandos literais, um por linha.

## Pronto quando
- PQ-1 (run): `gh run list --workflow ci.yml --branch feature/044-e2e-em-partes --event workflow_dispatch --limit 1 --json conclusion,headSha` · espera: conclusion `success` e headSha igual ao head da branch; no run, as 2 partes e o `e2e` em success
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-044 diff origin/develop HEAD -- .github/workflows/ci.yml | grep -c -e '^+.*timeout-minutes: [4-9][0-9]' -e '^+.*retries'` · espera: igual '0'
- PQ-3 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD-044/docs/devops/044-e2e-em-partes.md`
- PQ-4 (push): `git -C /home/rodrigoisensee/MetricasDSPD-044 ls-remote origin refs/heads/feature/044-e2e-em-partes` · espera: contém o sha40 de `git -C /home/rodrigoisensee/MetricasDSPD-044 rev-parse HEAD`
- PQ-5 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-044 status --porcelain` · espera: linhas=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Inclui o id do run, a duração de cada parte e do `e2e`, e o sha do commit. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
