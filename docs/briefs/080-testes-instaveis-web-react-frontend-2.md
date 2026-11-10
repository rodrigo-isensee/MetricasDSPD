Agente destino: forge:react-frontend
Pedido: 080-testes-instaveis-web
Tipo: volta
Branch: feature/080-testes-instaveis-web   Base: develop   Base-sha: 852b9406f019223acd82563cd21fc3a3d42a493a
Etapa: codigo   Cobre: E1.1
Volta-de: docs/briefs/080-testes-instaveis-web-react-frontend-1.md sha256 bb33ea6d8f69e640a5548c6374a96de4dc60a4293286f6c75bc42981e400ef25

## Objetivo
Pedido 080 (K-173 e K-192): tirar a instabilidade de dois testes da web que já derrubaram checks sem mudança de código, sem afrouxar regra, timeout ou retry. Worktree `/home/rodrigoisensee/MetricasDSPD-056d` (HEAD destacado e limpa), branch nova `feature/080-testes-instaveis-web` a partir da develop.

## Ler
- docs/pedidos/080-testes-instaveis-web.md: só `## Escopo`, `## Fora do escopo` e `## Suposições`.
- Na worktree, depois de preparar: o teste do O20 que lê o SVG (procurar onde ele está hoje: `operacionais.test.tsx:177` era o local no 026) e `e2e/tests/operacional-lote3.spec.ts` (L3-01) com o componente do `leia-junto-o15`.
- docs/qa/080-testes-instaveis-web.md (parecer, lido de 3c3a7af)

## Entregar (volta 1)
- Escopo da entrega original, já conferido e inalterado; esta volta só corrige os achados abaixo (E1, E1.1, E2).
- (qa 3c3a7af A1) E2 não cumprida: o L3-01 a 1280 px falhou com target-size em `leia-junto-o15 li:nth-child(3) a` em 2 de 9 rodadas locais no head; o gap-y-1 não eliminou a instabilidade. [web/src/features/complementares/LeiaJunto.tsx:38]
Recomendados (cada um entra no Entregar acima ou vira corte com a marca "Retira do escopo original" em Fora do escopo):
- (qa 3c3a7af A2) L3-01 a 375 px estourou 30000 ms na rodada 1 do segundo lote (a mesma que falhou o axe a 1280 px), com o servidor frio; reportar à parte, sem causa provada. [e2e/tests/operacional-lote3.spec.ts:22] · entra nesta volta como investigação: registrar a causa se o trace mostrar; sem mudar timeout.
- (E2) (E1.1) Achar a causa antes de mudar CSS de novo: rodar o L3-01 a 1280 px localmente até falhar (Chromium, workers=1), abrir o trace da falha em `e2e/test-results` e registrar no relatório qual alvo o axe mede, com que tamanho e por quê (por exemplo, link quebrado em duas linhas, fonte carregando depois, hover ou foco); corrigir a causa na tela (`LeiaJunto.tsx` ou o estilo do link), sem mexer em regra do axe, timeout ou retry, e provar com pelo menos 20 rodadas seguidas a 1280 e a 375 sem falha; se não achar causa, pare e relate (o Jarvis decide).
- (E2) (E1.1) eslint, `tsc -b` e os testes dos arquivos tocados com no máximo 2 workers verdes; teto de 150 linhas pela saída literal de `git diff --numstat --no-renames 852b9406f019223acd82563cd21fc3a3d42a493a...HEAD`; commits com `Cartão: K-192` (mensagem gravada por Write em `/tmp/claude-1000/-home-rodrigoisensee-Metricas-MetricasDSPD/73d03d2b-ba9f-4d84-b635-cabe917583a2/scratchpad/msg-rf-080-v1.txt` e `git commit -F` com esse caminho literal), `git add` explícito por caminho, sem incluir nem apagar `docs/ux/080-revisao-leia-junto.md`; antes do commit, `git -C /home/rodrigoisensee/MetricasDSPD-056d pull --ff-only origin feature/080-testes-instaveis-web`; conferir `git -C /home/rodrigoisensee/MetricasDSPD-056d rev-parse --abbrev-ref HEAD` e enviar com `git -C /home/rodrigoisensee/MetricasDSPD-056d push origin HEAD:refs/heads/feature/080-testes-instaveis-web`, em primeiro plano, com o comando puro; se o rc não for 0, conferir `git ls-remote` antes de repetir; push ou pre-push com mais de 15 minutos está preso: pare e relate (o Jarvis avisa o dono e refaz; DECISÃO TÉCNICA de 2026-11-07 08:26 deste pedido); esperar a CI do push com `gh run watch <id literal> --exit-status`; sem PR.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.2 (tech-lead): review." · etapa de outra delegação; continua no pedido
- "E1.3 (qa-engineer): QA." · etapa de outra delegação; continua no pedido
- "E1.4 (ux-designer): revisão de interface, só se o alvo de toque mudar a tela." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): PR para a develop, depois do QA." · etapa de outra delegação; continua no pedido
- "E1.6 (agile-coach): retrospectiva do pedido 080." · etapa de outra delegação; continua no pedido
- K-174 e K-120 (`## Fora do escopo` do pedido).

## Decisões e restrições
- O pedido não tem linha `DECISÃO DO DONO`; foi aberto pela autonomia de melhoria técnica do projeto (Histórico, 07:38).
- O hook do Forge recusa variáveis de shell (`$X`, `$?`, `${...}`), crases e `$(...)` em comandos com commit, push ou gh: use caminhos e ids literais. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. GitHub: `github.com` e `api.github.com` em `allowed_domains`; npm: `registry.npmjs.org`. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: regras do axe, timeouts e retries de teste, `server/`, `packages/`, a CI, o pedido, `KANBAN.md`, outras worktrees, a `develop`, a `homolog` e a `main`.
- Erro recorrente deste destino (forge-check, 30 dias): escopo em 6 entregas · evita: cada item do Entregar cita a etapa `(E<n>)` do pedido; só corta com a marca de corte (R-BRIEF, R-DECISAO)
- Erro recorrente deste destino (forge-check, 30 dias): base em 3 entregas · evita: gere o brief de novo com `--branch`, para o Base-sha real (BRIEF-BASE-ATUAL)

## Pronto quando
- PQ-1 (cmd): `gh run list --repo rodrigo-isensee/MetricasDSPD --branch feature/080-testes-instaveis-web --event push --limit 1 --json conclusion` · espera: contém '"success"'
- PQ-2 (push): `git ls-remote origin refs/heads/feature/080-testes-instaveis-web` igual ao head local (`git -C /home/rodrigoisensee/MetricasDSPD-056d rev-parse HEAD`)
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-056d diff --name-only 852b9406f019223acd82563cd21fc3a3d42a493a -- server packages .github` · espera: linhas=0
- PQ-4 (cmd, do autor): `forge-check entrega 080-testes-instaveis-web --branch feature/080-testes-instaveis-web --base develop --base-sha 852b9406f019223acd82563cd21fc3a3d42a493a --etapa codigo --desde 58b866d728b4e73815b29531156602d0998f3f3c` · espera: rc=0
- PQ-5 (cmd, do autor): `bin/forge-mutante --cobertura --base 852b9406f019223acd82563cd21fc3a3d42a493a` · espera: rc=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
