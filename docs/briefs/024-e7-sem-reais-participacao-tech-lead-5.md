Agente destino: forge:tech-lead
Pedido: docs/pedidos/024-e7-sem-reais-participacao.md
Branch: feature/024-e7-sem-reais   Base: develop   Base-sha: d83024ba35763c0b56bebf8184cdbdf1d8da26e0

## Objetivo
Rodada 4 do code review do pedido 024, só sobre o commit de testes 8a4a5a76156c85bbd57dbed9bb1318cde3de453e, com que o QA cobriu as lacunas G1 (nome "Entregas por sistema" no cartão, no catálogo e na tela), G2 (`VERSAO_CRITERIO_E7_SEM_REAIS` nos critérios do E7, regra T2.6) e G3 (o período não muda o E8). Etapa E1.8 do pedido 024, cartão K-114. Worktree `/home/rodrigoisensee/MetricasDSPD-024`, branch `feature/024-e7-sem-reais` (head 8a4a5a76156c85bbd57dbed9bb1318cde3de453e, no remoto).

## Ler
- `docs/pedidos/024-e7-sem-reais-participacao.md`, seção "Decisões técnicas do time" (a linha das lacunas G1 a G3).
- `docs/reviews/024-e7-sem-reais.md`, frontmatter e "Rodada 3".
- Na worktree: `git show 8a4a5a76156c85bbd57dbed9bb1318cde3de453e`.

## Entregar
- (E1, E3, E5) Conferir que os testes cobrem G1, G2 e G3 de fato (falham se a regra quebrar; G2 usa a biblioteca real, não critérios fictícios), sem mudar código de produção, e que o `hoje` fixo do teste do G2 não esconde caso de borda.
- (E1, E3, E5) Acrescentar a "Rodada 4 (2026-10-17)" ao parecer `docs/reviews/024-e7-sem-reais.md`, gravado com a ferramenta Edit ou Write (registro de autoria), com o frontmatter `commit:` no sha curto de 8a4a5a76156c85bbd57dbed9bb1318cde3de453e e `parecer:` final; commit só do parecer e push sem `--force`. Ajuste volta ao QA; não corrija você.
- (E1, E3, E5) Rodar `forge-check pr 024-e7-sem-reais --ref feature/024-e7-sem-reais --base develop` na worktree e copiar a saída.

## Fora do escopo
- "E1.3 (forge:qa-engineer): QA." · o parecer de QA vem depois desta rodada.
- "E1.7 (forge:qa-engineer): testes das lacunas G1 a G3 achadas no QA (nome do E7 no catálogo, no cartão e na tela; VERSAO_CRITERIO_E7_SEM_REAIS nos critérios do E7; E8 sem efeito do período), num commit só de testes, antes da rodada 4 do review" · já feita (8a4a5a76156c85bbd57dbed9bb1318cde3de453e).
- "E2.1 (forge:software-architect): plano §2 E7 e ADR." e "E4.1 (forge:node-backend): `concluidoEm` no contrato do E6." · já feitas e revisadas.
- Reabrir o que as rodadas 2 e 3 aprovaram; o PR; o quadro (`KANBAN.md`), que é do Jarvis.

## Decisões e restrições
- DECISÃO DO DONO (pedido 021, 2026-10-17): o E7 passa a se chamar "Entregas por sistema" (opção A).
- Decisão do usuário D2 = A (pedido 011): E7 sem R$, participação percentual por entregas.
- Decisão técnica do time (pedido 024, 2026-10-17): lacunas cobertas por testes escritos pelo QA, review só desses testes, depois o parecer do QA.
- Regra inviolável do `CLAUDE.md`: mudança de critério registrada com data (T2.6).
- R-MAIN: nada na `main`. R-VERIFY: sem `--no-verify` nem `--force`; commit enviado não se emenda. R-CONFORMIDADE: bloqueio não se contorna; vira relato.
- NÃO tocar: código, testes, `.github/`, o diretório principal, a worktree `-011-fase2`.
- Teto: 2 agentes de dia, uma tarefa pesada por vez (restrição do usuário de 2026-10-17, pedido 024, "Restrições do usuário"): sem `pronto` nem E2E local.

## Pronto quando
- PQ-1 (sha): commit `docs(review)` da rodada 4, com só `docs/reviews/024-e7-sem-reais.md`.
- PQ-2 (cmd): `grep -c '^parecer: aprovado' /home/rodrigoisensee/MetricasDSPD-024/docs/reviews/024-e7-sem-reais.md` · espera: igual '1'
- PQ-3 (cmd): `grep -c '^commit: 8a4a5a7' /home/rodrigoisensee/MetricasDSPD-024/docs/reviews/024-e7-sem-reais.md` · espera: igual '1'
- PQ-4 (push): `git -C /home/rodrigoisensee/MetricasDSPD-024 ls-remote origin refs/heads/feature/024-e7-sem-reais` igual ao head local.

## Relatório
Até 8 linhas: estado; o que precisa do usuário; suposições (com a base); o que foi feito, com evidência (sha, achados, saída do `forge-check pr`); riscos. Se reprovar, PQ-2 fica "não cumprido" com os ajustes. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.
