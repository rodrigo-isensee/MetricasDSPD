Agente destino: forge:tech-lead
Pedido: docs/pedidos/024-e7-sem-reais-participacao.md
Branch: feature/024-e7-sem-reais   Base: develop   Base-sha: d83024ba35763c0b56bebf8184cdbdf1d8da26e0

## Objetivo
Rodada 2 do code review do pedido 024 (E7 sem R$, E8/E9 com a janela do cálculo, `concluidoEm` no E6, e o nome novo do E7, "Entregas por sistema"), antes do QA (R-REVIEW). A rodada 1 (parecer em `docs/reviews/024-e7-sem-reais.md`, `commit: 2de5d80`) reprovou só documentação. Sem gatilho de segurança (sem dado de pessoa, autenticação, segredo nem banco). Etapa E1.2 do pedido 024, cartão K-114. Worktree `/home/rodrigoisensee/MetricasDSPD-024`, branch `feature/024-e7-sem-reais` (head 97ddd0b6651aad0d7bedf51fff5171ad64443655, no remoto).

## Ler
- `docs/pedidos/024-e7-sem-reais-participacao.md` (Escopo, Etapas e Decisões técnicas do time).
- `docs/reviews/024-e7-sem-reais.md` (os achados A-1 a A-6 da rodada 1).
- Na worktree: `git diff 2de5d80838da8284db9f8ec91c00a5bf3f2bbd7e 97ddd0b6651aad0d7bedf51fff5171ad64443655 -- . ':!docs/qa' ':!docs/reviews'` sem o que veio da develop (`git show --cc d4c0821a5c28023a62dc12c3817b450b0fc87ac1` para a resolução própria do merge); `git status` e `git diff -- docs/ux` (documentos da UX, sem commit).

## Entregar
- (E5) Antes do review: commitar os documentos da UX do E5.2 num commit próprio (`docs(ux): ...`, `git add` só dos caminhos de `docs/ux/` alterados), depois de `pnpm run docs:check`, e push; assim o commit de docs entra antes do parecer e não o invalida.
- (E1, E2, E3, E4, E5) Review do que mudou desde a rodada 1: 8913d54030f526bf569a8c3decb9fb6bb9f33681 (A-1 a A-4 e A-6), df75e29d2b6d3ebe8920fb5fbb175c60a5a7ce52 (A-5), a resolução dos 5 conflitos do merge d4c0821a5c28023a62dc12c3817b450b0fc87ac1 (regra do 024 mantida e o que o #108 e o #109 trouxeram preservado), de018c635661c484599b3e0e7cc5b19603fec2df (nome no back e na doc gerada, sem mexer no histórico de `criterios.ts`), 97ddd0b6651aad0d7bedf51fff5171ad64443655 (teste do front sem `custoConfigurado` e nome no catálogo) e o commit da UX. Confira também que o nome antigo não sobrou fora de registros históricos (`docs/qa/`, `docs/reviews/`, `criterios.ts`).
- (E1, E2, E3, E4, E5) Acrescentar a "Rodada 2 (2026-10-17)" ao parecer `docs/reviews/024-e7-sem-reais.md`, gravado com a ferramenta Edit ou Write (registro de autoria), com o frontmatter `commit:` no commit revisado e `parecer:` final; commit só do parecer e push sem `--force`. Ajuste pedido volta ao autor (node-backend, react-frontend ou UX); não corrija você.

## Fora do escopo
- "E1.3 (forge:qa-engineer): QA." · etapa de outro papel; vem depois deste review.
- "E1.4 (forge:react-frontend): ajustar o teste do front que lê `custoConfigurado` e os testes que citam o título do E7 (E5), depois de trazer a develop com o #108" · já feita (97ddd0b6651aad0d7bedf51fff5171ad64443655).
- "E5.1 (forge:node-backend): nome "Entregas por sistema" no cartão do E7 (`packages/contratos`), contratos e documentação gerada, depois do E1.6." e "E1.6 (forge:node-backend): concluir o merge da develop na branch, resolvendo os 5 conflitos" · já feitas.
- "E5.2 (forge:ux-designer): nome novo na especificação do 011 (§5 E7) e na revisão de UX." · feita pela UX, sem commit; aqui só o commit.
- "E2.1 (forge:software-architect): plano §2 E7 e ADR.", "E2.2 (forge:ux-designer): CA do E7 na especificação.", "E3.1 (forge:node-backend): contrato do E8 e do E9 alinhado à janela do cálculo." e "E4.1 (forge:node-backend): `concluidoEm` no contrato do E6." · já feitas.
- O PR (depois do QA); a promoção para a homolog (pedido 023); o quadro (`KANBAN.md`), que é do Jarvis.

## Decisões e restrições
- DECISÃO DO DONO (pedido 021, 2026-10-17): o E7 passa a se chamar "Entregas por sistema" (opção A).
- Decisão do usuário D2 = A (pedido 011): E7 sem R$, participação percentual por entregas, mínimo de 20 entregas por sistema; regra 7.1 do briefing (horas apontadas não entram).
- Decisões técnicas do time (pedido 024, 2026-10-17): documentos de quem não tem Bash são commitados pelo tech-lead; o node-backend resolveu o merge (E1.6).
- Regras invioláveis do `CLAUDE.md`: todo cálculo pela biblioteca compartilhada; mudança de critério registrada com data (T2.6); BusinessMap e Acelerato nunca se misturam.
- R-MAIN: nada na `main`. R-VERIFY: sem `--no-verify` nem `--force`. R-CONFORMIDADE: bloqueio não se contorna; vira relato.
- NÃO tocar: código (ajustes voltam ao autor), `.github/`, o diretório principal, a worktree `-011-fase2`.
- Teto: 2 agentes de dia, uma tarefa pesada por vez (restrição do usuário de 2026-10-17, pedido 024, "Restrições do usuário"): rode só `docs:check` e, se quiser, os testes de pacote; sem `pronto` nem E2E local (o QA e a CI fazem a suíte).

## Pronto quando
- PQ-1 (sha): commit `docs(ux)` com só caminhos de `docs/ux/`, antes do commit do parecer.
- PQ-2 (sha): commit `docs(review)` da rodada 2, com só `docs/reviews/024-e7-sem-reais.md`.
- PQ-3 (cmd): `grep -c '^parecer: aprovado' /home/rodrigoisensee/MetricasDSPD-024/docs/reviews/024-e7-sem-reais.md` · espera: igual '1'
- PQ-4 (push): `git -C /home/rodrigoisensee/MetricasDSPD-024 ls-remote origin refs/heads/feature/024-e7-sem-reais` igual ao head local.
- PQ-5 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-024 status --porcelain` · espera: linhas=0

## Relatório
Até 8 linhas: estado; o que precisa do usuário; suposições (com a base); o que foi feito, com evidência (shas, achados com severidade, saída do `forge-check pr 024-e7-sem-reais --ref feature/024-e7-sem-reais --base develop`); riscos. Se o parecer for reprovado, PQ-3 fica "não cumprido" com a lista de ajustes por autor. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.
