Agente destino: forge:tech-lead
Pedido: docs/pedidos/029-pr-do-024.md
Branch: feature/024-e7-sem-reais   Base: develop   Base-sha: d83024ba35763c0b56bebf8184cdbdf1d8da26e0

## Objetivo
Abrir e mesclar na develop (squash) o PR do pedido 024: E7 sem R$ com participação por entregas, E8 e E9 com a janela do cálculo, `concluidoEm` no E6 e o nome "Entregas por sistema". Pareceres: review aprovado (rodada 5, `commit: b390b0c`), QA aprovado (`docs/qa/024-e7-sem-reais.md`, `commit: 781e171`, run 39039285614; ressalva baixa R-1 aceita pelo dono em 2026-10-17, pedido 024; o E2E só roda no PR) e UX aprovada fora da branch (`docs/ux/revisao-024-e7-nome.md`, no diretório principal, pela decisão técnica do pedido 029). Etapa E2.1 do pedido 029, cartão K-114. Worktree `/home/rodrigoisensee/MetricasDSPD-024`, branch `feature/024-e7-sem-reais`.

## Ler
- `docs/pedidos/029-pr-do-024.md` (Escopo, Etapas e Decisões técnicas do time).
- `docs/pedidos/024-e7-sem-reais-participacao.md`, seção "Escopo" (E1 a E5), para o corpo do PR.
- Na worktree, os frontmatters de `docs/reviews/024-e7-sem-reais.md` e `docs/qa/024-e7-sem-reais.md`.

## Entregar
- (E2) Rodar `forge-check pr 024-e7-sem-reais --ref feature/024-e7-sem-reais --base develop` na worktree; se acusar algo, pare e relate (não regrave pareceres).
- (E2) Abrir o PR `feature/024-e7-sem-reais` → `develop` com o corpo: o que muda (E1 a E5 do pedido 024), os pareceres (review, QA, UX) com os caminhos, o run da CI do QA e a mudança de critério do E7 com data (T2.6). Terminar o corpo com as linhas de atribuição da sessão.
- (E2) Esperar os checks exigidos ficarem verdes no head do PR; vermelho por ruído só se rerroda uma vez; vermelho de verdade: pare e relate. Com o PR fora de `BEHIND`, mesclar por squash usando o nome da branch no `gh pr merge` (exigência do hook `parecer`). Se a develop tiver avançado e o PR estiver `BEHIND`, pare e relate, sem trazer a develop.
- (E2) Depois do merge: apagar a branch local e a remota e remover a worktree `-024` (R-FLUXO, "Depois do merge").

## Fora do escopo
- "E1.1 (forge:ux-designer): revisão de UX do delta de `web/src` do 024 (d83024b..8a4a5a7, 2 arquivos), parecer em `docs/ux/revisao-024-e7-nome.md` no diretório principal (branch de docs do Jarvis)." · etapa de outro papel, já feita.
- A promoção develop → homolog (pedido 023); mexer em código, testes ou pareceres; a pergunta do E7 no catálogo (fica para o dono); o quadro (`KANBAN.md`), que é do Jarvis.

## Decisões e restrições
- DECISÃO DO DONO (pedido 021, 2026-10-17): o E7 passa a se chamar "Entregas por sistema" (opção A).
- Decisão do usuário D2 = A (pedido 011): E7 sem R$, participação percentual por entregas.
- DECISÃO DO DONO (pedido 024, 2026-10-17): aceita a ressalva baixa R-1 do QA como está (opção A).
- Decisão técnica do time (pedido 029, 2026-10-17): a revisão de UX do 024 fica no diretório principal, fora da branch do 024.
- Squash na `develop` (`CLAUDE.md` do projeto). R-MAIN: nada na `main`. R-VERIFY: sem `--no-verify` nem `--force`; sem `--admin`. R-CONFORMIDADE: bloqueio não se contorna; vira relato.
- NÃO tocar: código e pareceres da branch, `.github/`, o diretório principal, a worktree `-011-fase2`.
- Teto: 2 agentes de dia, uma tarefa pesada por vez (restrição do usuário de 2026-10-17, pedido 024, "Restrições do usuário"): sem `pronto` local; o portão é a CI do PR.

## Pronto quando
- PQ-1 (pr): PR `feature/024-e7-sem-reais` → `develop` aberto.
- PQ-2 (merge): PR mesclado na `develop` por squash.
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD ls-remote --heads origin feature/024-e7-sem-reais` · espera: linhas=0
- PQ-4 (cmd): `test -d /home/rodrigoisensee/MetricasDSPD-024 && echo existe || echo removida` · espera: igual 'removida'

## Relatório
Até 8 linhas: estado; o que precisa do usuário; suposições (com a base); o que foi feito, com evidência (número do PR, checks, sha do merge); riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.
