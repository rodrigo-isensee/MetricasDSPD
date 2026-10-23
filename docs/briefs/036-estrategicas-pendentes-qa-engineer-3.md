Agente destino: forge:qa-engineer
Pedido: docs/pedidos/036-estrategicas-pendentes.md
Branch: feature/036-estrategicas-pendentes   Base: develop   Base-sha: 12018deb8e35a7b473d6e8c1b7a693795a80c1ac

## Objetivo
Fechar a parte /estrategico do bug IFA-001 (cartão K-091, etapa E2.1 do pedido 036): hoje o teste IF-A de /estrategico passa sem verificar nenhum cartão "Não afetado por", então uma regressão nesse aviso passaria despercebida. Worktree `/home/rodrigoisensee/MetricasDSPD-030`, branch `feature/036-estrategicas-pendentes` (head f3a2995, com o catálogo do E7 e o reteste do FA-006).

## Ler
- `docs/qa/bugs/IFA-001-nao-afetado-sem-verificacao-em-operacional-e-estrategico.md` (inteiro).
- `e2e/tests/intensivo-filtros.spec.ts`, bloco IF-A (linhas 384 a 432: `ROTAS_APLIC` e o laço de testes).

## Entregar
- (E2) No IF-A, escolher para `/estrategico` filtros que façam ao menos um cartão estratégico exibir "Não afetado por" (decisão técnica do time, anotada no Obs. do K-091: "o time escolhe filtros que exibam 'Não afetado por'") e afirmar um mínimo de cartões verificados para essa rota (ex.: `expect(verificados.length).toBeGreaterThan(0)` só nas rotas marcadas como esperadas), de modo que uma lista vazia falhe em vez de passar. Provar que o teste pega a regressão: a mutação do bug (`outro?.base !== c.base` → `===`) passa a falhar em /estrategico (rodar uma vez, relatar, desfazer).
- (E2) Rodar `pnpm exec playwright test tests/intensivo-filtros.spec.ts -g "IF-A"` no `e2e/` (uma suíte pesada por vez, R-TETO; sem `flock`, que o hook recusa; antes, `pgrep -fa 'playwright|vitest'` vazio) com todas as rotas do IF-A verdes; acrescentar ao arquivo do bug uma seção `## Correção 2026-10-20 (/estrategico)` com os filtros escolhidos, a contagem de verificados e o resultado da mutação.
- (E2) Um commit com `git add` explícito dos dois arquivos (`e2e/tests/intensivo-filtros.spec.ts` e o arquivo do bug), mensagem conforme a seção de commits do `docs/engineering/praticas.md`; push da branch.

## Fora do escopo
- IF-A em /operacional sem cadência (a outra metade do IFA-001): fica para as operacionais (Fora do escopo do pedido 036).
- "E1.4 (forge:qa-engineer): QA e parecer." · etapa do mesmo papel em outro momento, depois do review.
- "E1.1 (forge:qa-engineer): medição do FA-006 (3 execuções, mock e api), na branch do pedido." · etapa do mesmo papel, já cumprida (f3a2995).
- "E1.2 (forge:react-frontend): correção do FA-006, só se a medição confirmar o estouro." · etapa de outro papel; não se aplica (FA-006 não reproduz).
- "E1.3 (forge:tech-lead): code review." e "E1.5 (forge:tech-lead): PR para a develop e merge." · etapas de outro papel.
- "E3.1 (dono): decidir o texto do E7 no catálogo (feito: opção A)." · etapa do dono, cumprida.
- "E3.2 (forge:react-frontend): trocar o texto no catálogo e o teste que o cita." e "E3.3 (forge:ux-designer): trocar o texto na especificação." · etapas de outro papel.
- Código de `web/` ou `server/`; o quadro (`KANBAN.md`); PR.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-20): ordem das pendências: "veja se tem algo das metricas estrategicas pendentes se tem comece por ele, senao va para taticas e por ultimo operacional. Depois de tudo isso faremos as integracoes oficiais funcionar."
- DECISÃO DO DONO (2026-10-20): recibo do pedido 036 aceito ("sim").
- DECISÃO DO DONO (2026-10-20): E7 no catálogo, opção A ("A"): a pergunta passa a ser "Qual a participação de cada sistema nas nossas entregas?" (catálogo `web/src/content/catalogo-metricas.ts` e especificação `docs/ux/metricas-tambem-disponiveis/02-especificacao.md` §E7).
- ADR 0003 (citada no pedido): não se aplica a este teste funcional.
- Se nenhum filtro fizer um cartão estratégico exibir "Não afetado por", não invente regra: relate e pare (dúvida de regra de negócio vira pergunta ao dono, CLAUDE.md).
- Pode haver commit do forge:ux-designer na mesma branch (especificação em `docs/ux/`): não toque nele; se aparecer `index.lock`, espere e tente de novo.
- R-MAIN: nada na `main`. R-VERIFY: nunca `--no-verify` nem `--force`.

## Pronto quando
- PQ-1 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-030 log -1 --format=%h -- e2e/tests/intensivo-filtros.spec.ts` · espera: o hash do commit do teste.
- PQ-2 (push): `git ls-remote origin refs/heads/feature/036-estrategicas-pendentes` igual ao head local.
- PQ-3 (cmd): `grep -c '^## Correção 2026-10-20 (/estrategico)' /home/rodrigoisensee/MetricasDSPD-030/docs/qa/bugs/IFA-001-nao-afetado-sem-verificacao-em-operacional-e-estrategico.md` · espera: igual '1'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
