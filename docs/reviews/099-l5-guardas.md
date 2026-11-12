---
tipo: review
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: test/099-l5-guardas
commit: 061ed3164831be6c1134fe27a03bde9c4b7ad41c
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-12
---
# Review: L5 do pedido 099, guardas G3 e G4 da ADR 0030 (E2.12, K-275)

## Achados
- A1 (recomendado) web/src/app/painel-sem-dado-real.test.tsx:122 · `it.fails` passa com qualquer falha (timeout de `abrirTudo`, erro de render), não só com "fictíci". Sugestão: um `it` que afirma que alguma rota ainda diz "fictíci", invertido no L4.
- A2 (recomendado) web/src/app/painel-sem-dado-real.test.tsx:58 · `abrirTudo` devolve os cartões e grava `textoDaTela` numa variável do módulo declarada depois dela (linha 64). Devolver `{ cartoes, texto }` tira o efeito colateral e a dependência de ordem entre a chamada e a leitura.
- A3 (recomendado) docs/architecture/adr/0030-sem-simulado-na-web.md:81 · a condição do L2d pede a G3 vermelha na `develop`, impossível desde o L1. O software-architect troca por "G3 vermelha por mutação (mock religado no ramo `api`)" e fecha a linha pendente 91.

## Sondas

## Parecer
Aprovado sobre 061ed316 (base develop 96d9b69f). Diff: 5 arquivos, só testes e uma linha de ADR (`git diff --numstat --no-renames`: +250 -126, sendo 117 da remoção do `simulado-070-l3.spec.ts`). Passa da orientação de 150 linhas sem a linha `teto:` no commit; não é trava, o risco é baixo (só teste, nenhum código de produção) e um comportamento só (guardas contra a volta do simulado). O corpo do PR do lote (E2.14) deve trazer `teto: excedido, 376 linhas, guardas G3 e G4 novas e remoção do spec do selo`.

- **Cumpre o D6 da ADR 0030:** a G3 (`e2e/tests-api/sem-dado-real-099.spec.ts`) força `sem-dado-real` em toda `/metricas/:id` (os ids da API são `[A-Za-z0-9_]`, `EI_SUST` incluso), percorre os 5 painéis com "Mais métricas" aberto e exige, por cartão, `data-estado="sem-dado-real"`, "Sem dado real", o motivo, nenhuma leitura, base, tabela, gráfico nem `data-testid*="simulado"`; o Resumo e o download do chunk e do Worker têm teste próprio. A G4 (`web/src/app/painel-sem-dado-real.test.tsx`) faz o mesmo pelo Vitest e confere o `CATALOGO_CARTOES` inteiro de cada painel (nenhum cartão faltando, mínimo de 8), o que a G3 não faz (ela só exige 3 ou mais cartões); juntas cobrem catálogo e navegador.
- **Guardas que provam:** as duas têm guarda contra suíte vazia. O QA mostrou a G3 cair com o mock religado no ramo `api` (7 falham) e a G4 cair com um cartão vindo da fonte real (`docs/qa/099-l5-guardas.md`). Não repeti as mutações.
- **Nenhum teste afrouxado sem motivo:** o `simulado-070-l3.spec.ts` apagado exigia o selo (T-E1, T-E2, T-E5 sem objeto); o T-E3 (Resumo) vive na G3; o afrouxamento é o autorizado pelo dono (Q-099-3 A) e a G3 e a G4 entram no mesmo commit, como a ADR manda. Sobre o T-E6 (axe, A1 do QA): o axe sobre cartões em "Sem dado real" pela API segue em `bloqueio-sem-dado-065.spec.ts` (Q65-07, Semanal com "Mais métricas") e `tatico-011-lote2.spec.ts`; a Sustentação ficou sem axe pela API, que é o recomendado do QA, não repetido aqui. O `perf-api.spec.ts` só troca o seletor do selo pelo do estado e o nome do registro; o limite de 200 ms é o mesmo.
- **Decisão sobre a condição da ADR (dono dos portões):** basta. A G1 vermelha pela leitura do build (`nucleoMock-*.js` e o Worker no `dist` da fonte `api`) prova o que a G1 vai pegar, porque o script `sem-mock.mjs` só nasce no L2d. A G3 não tem como ficar vermelha na `develop` sem mutação: o L1 já tirou o mock do ramo `api`, e o que ela vigia (download e tela) já está certo; a mutação que religa o simulador é o vermelho que interessa, porque é exatamente a volta que a guarda existe para barrar. A ADR precisa de ajuste de texto do software-architect (A3), sem mudar decisão; não bloqueia o L5 nem o L2d, desde que o L2d traga a G1 verde.
- **Regras invioláveis e segurança:** só testes; nenhuma pessoa, credencial, banco nem dependência nova; sem gatilho de `R-SEGURANCA`. Nada rodou contra a base real nem `.env*` (stub `server/tests/pg/api-stub-065.ts`, sem banco).
- **Execução (worktree em ef175ed4 = 061ed316 mais o parecer do QA):** `VITEST_MAX_WORKERS=2 pnpm --filter web exec vitest run src/app/painel-sem-dado-real.test.tsx`: `Tests 5 passed | 1 expected fail (6)`. Com o stub na 3199: `E2E_API_URL=http://127.0.0.1:3199 pnpm exec playwright test --project=chromium-api sem-dado-real-099`: `7 passed (11.8s)`; `--project=perf-api perf-api -g "C6 com cartão sem dado real"`: `2 passed (21.9s)`.
- **CI:** o run 43154920572 do 061ed316 foi cancelado pelo push do parecer do QA; o run 43155577966 (ef175ed4, só `.md` a mais) estava em andamento na hora deste parecer. O PR do lote cita o check verde do mesmo código.
- **Commits:** um commit `test(099): ...`, Conventional Commits em português, corpo com o que muda e `Cartão: K-275`.
