---
tipo: review
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: test/099-l5-guardas
commit: 3319eb26c704b5781fa01a2eebda4b161222f8dd
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-12
---
# Review: L5 do pedido 099, guardas G3 e G4 da ADR 0030 (E2.12, K-275)

## Achados
- A3 (recomendado) docs/architecture/adr/0030-sem-simulado-na-web.md:81 · a condição do L2d pede a G3 vermelha na `develop`, impossível desde o L1. O software-architect troca por "G3 vermelha por mutação (mock religado no ramo `api`)" e fecha a linha pendente 91.

## Sondas

## Revalidação (volta 1)
Delta lido: `git diff 061ed316 3319eb26 -- web/ e2e/` (28 arquivos; 27 vêm da `develop` pelo merge e6b1c213, só `web/src/app/painel-sem-dado-real.test.tsx` é do L5).
- **A1 fechado:** o `it.fails` virou `it('nenhuma tela diz "fictíci" ...')` sobre as 4 rotas (Operacional semanal e sustentação, Tático, Estratégico). Com o L4 na `develop` (287ff9b4) o teste roda e passa de verdade; uma falha qualquer (timeout, render) agora reprova em vez de passar.
- **A2 fechado:** `abrirTudo` devolve `{ cartoes, texto }` lido antes do `unmount`; a variável de módulo `textoDaTela` saiu e os dois testes usam o retorno.
- **Merge sem conflito no que é do L5:** `git diff --stat 061ed316 e6b1c213` nos arquivos do L5 (`perf-api.spec.ts`, `tests-api/`, `painel-sem-dado-real.test.tsx`, ADR 0030) é vazio; o merge só trouxe a `develop`. `git diff --stat 287ff9b4 3319eb26` mostra os mesmos 7 arquivos do L5 da volta 0.
- **Execução:** `VITEST_MAX_WORKERS=2 pnpm --filter web exec vitest run src/app/painel-sem-dado-real.test.tsx` em 3319eb26 (worktree em fdd00f09, que só soma o parecer do QA): `Tests 6 passed (6)`, sem `expected fail`. A G3 e o `perf-api` não mudaram no delta; vale a execução da volta 0 (`7 passed`, `2 passed`).
- A3 segue recomendado, de texto da ADR, com o software-architect; não bloqueia.

## Parecer
Aprovado sobre 3319eb26 (base develop 287ff9b4). O que vale da volta 0 (061ed316): cumpre o D6 da ADR 0030 com a G3 (`e2e/tests-api/sem-dado-real-099.spec.ts`) e a G4 (`web/src/app/painel-sem-dado-real.test.tsx`), ambas com guarda contra suíte vazia e vermelho provado pelo QA por mutação (`docs/qa/099-l5-guardas.md`); o `simulado-070-l3.spec.ts` apagado é o afrouxamento autorizado pelo dono (Q-099-3 A); só testes, sem gatilho de `R-SEGURANCA`, sem `.env*` nem base real. Passa da orientação de 150 linhas (+250 -126 na volta 0, só teste); o corpo do PR do lote (E2.14) traz `teto: excedido, <n> linhas, guardas G3 e G4 novas e remoção do spec do selo`. Commits: `test(099): ...` e o merge da `develop`, com `Cartão: K-275`.
