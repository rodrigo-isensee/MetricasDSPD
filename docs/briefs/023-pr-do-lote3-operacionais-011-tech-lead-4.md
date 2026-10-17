Agente destino: forge:tech-lead
Pedido: docs/pedidos/023-pr-do-lote3-operacionais-011.md
Branch: docs/023-pareceres-promocao   Base: develop   Base-sha: ed6ba46f39ed98fa76972c9fffe12c982f223e7f

## Objetivo
Gravar o parecer de review da promoção develop → homolog, que o dono passou a exigir em 2026-10-17 ("A regra do projeto nunca passa sobre a fábrica": vale a tabela de etapas da fábrica, com parecer próprio antes do PR). A promoção leva #102, #103, #105, #107, #108, #109 e #114 (develop ed6ba46f39ed98fa76972c9fffe12c982f223e7f sobre homolog 0eebfe7213d2d5706ea3604a9965f36ebff1ae8d). Etapa E1.3 do pedido 023. Crie a worktree `/home/rodrigoisensee/MetricasDSPD-023` com a branch `docs/023-pareceres-promocao` saída de `origin/develop` (ed6ba46f39ed98fa76972c9fffe12c982f223e7f).

## Ler
- `docs/pedidos/023-pr-do-lote3-operacionais-011.md` (Etapas e Andamento, as linhas de 2026-10-17).
- Na worktree: `git log --oneline origin/homolog..origin/develop` e `git diff --stat origin/homolog origin/develop`.
- Os pareceres de cada PR incluído, na develop: `docs/reviews/` e `docs/qa/` de `011-fase2-estrategicas` (#105), `011-fase2-taticas` (#107), `011-fase2-operacionais` (#109), `k102-perf-semanal` (#103), `011-front-estrategicas` (#108) e `024-e7-sem-reais` (#114); o #102 é só documentação.

## Entregar
- (E1) Review da promoção: cada PR incluído tem parecer de review e de QA aprovado na develop (frontmatter `parecer: aprovado`); o diff agregado homolog..develop não traz nada fora desses 7 PRs; não há conflito com a homolog; as regras invioláveis do `CLAUDE.md` seguem cumpridas no conjunto (nada de avaliação individual; BusinessMap e Acelerato separados; mínimo de 20 itens; critérios com data).
- (E1) Gravar `docs/reviews/023-pr-do-lote3-operacionais-011.md` com a ferramenta Write (registro de autoria), frontmatter `tipo: review`, `pedido: 023-pr-do-lote3-operacionais-011`, `branch: develop`, `commit: ed6ba46`, `parecer:`, `revisor: tech-lead`, `data: 2026-10-17`, e no corpo a tabela PR × parecer de review × parecer de QA; um commit só desse arquivo e push da branch `docs/023-pareceres-promocao` (sem `--force`). Não abra PR.

## Fora do escopo
- "E1.4 (forge:qa-engineer): parecer de QA da promoção em `docs/qa/023-pr-do-lote3-operacionais-011.md`, na mesma branch, com a CI da develop como prova" · etapa de outro papel; vem depois.
- "E1.5 (forge:tech-lead): PR só de documentação dos dois pareceres para a develop (squash), antes do PR de promoção" · vem depois do E1.4, por outro brief.
- "E1.1 (forge:tech-lead): PR do lote 3 (operacionais), mesclado na develop, e promoção para a homolog." · a promoção vem depois do E1.5.
- "E1.2 (dono): merge do release homolog → main." · etapa do dono.
- Mudar código ou os pareceres dos PRs incluídos; o PR #113; o quadro (`KANBAN.md`), que é do Jarvis.

## Decisões e restrições
- DECISÃO DO DONO (pedido 023, 2026-10-17): "A regra do projeto nunca passa sobre a fábrica"; para esta promoção vale a tabela de etapas da fábrica (opção B).
- Decisão do usuário (pedido 023, 2026-10-17, noite): "Vou dormir toque tudo que puder até a homolog".
- R-MAIN: nada na `main`. R-VERIFY: sem `--no-verify` nem `--force`; commit enviado não se emenda. R-CONFORMIDADE: bloqueio não se contorna; vira relato.
- NÃO tocar: `develop`, `homolog` e `main` diretamente; o diretório principal; a worktree `-011-fase2`; `.github/`.
- Teto: 2 agentes de dia, uma tarefa pesada por vez (restrição do usuário de 2026-10-17, pedido 024, "Restrições do usuário"): nada pesado local.

## Pronto quando
- PQ-1 (sha): commit `docs(review)` na branch `docs/023-pareceres-promocao`, com só `docs/reviews/023-pr-do-lote3-operacionais-011.md`.
- PQ-2 (cmd): `grep -c '^parecer: aprovado' /home/rodrigoisensee/MetricasDSPD-023/docs/reviews/023-pr-do-lote3-operacionais-011.md` · espera: igual '1'
- PQ-3 (push): `git -C /home/rodrigoisensee/MetricasDSPD-023 ls-remote origin refs/heads/docs/023-pareceres-promocao` igual ao head local.

## Relatório
Até 8 linhas: estado; o que precisa do usuário; suposições (com a base); o que foi feito, com evidência (sha, tabela PR × pareceres, achados); riscos. Se reprovar, PQ-2 fica "não cumprido" com os achados. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.
