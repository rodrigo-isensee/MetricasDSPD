Agente destino: forge:qa-engineer
Pedido: docs/pedidos/023-pr-do-lote3-operacionais-011.md
Branch: docs/023-pareceres-promocao   Base: develop   Base-sha: ed6ba46f39ed98fa76972c9fffe12c982f223e7f

## Objetivo
Gravar o parecer de QA da promoção develop → homolog, que o dono passou a exigir em 2026-10-17 ("A regra do projeto nunca passa sobre a fábrica"). A promoção leva #102, #103, #105, #107, #108, #109 e #114 (develop ed6ba46f39ed98fa76972c9fffe12c982f223e7f sobre homolog 0eebfe7213d2d5706ea3604a9965f36ebff1ae8d). Etapa E1.4 do pedido 023. Worktree `/home/rodrigoisensee/MetricasDSPD-023`, branch `docs/023-pareceres-promocao` (o parecer de review da promoção já está nela).

## Ler
- `docs/pedidos/023-pr-do-lote3-operacionais-011.md` (Etapas e Andamento, as linhas de 2026-10-17).
- Na worktree: `docs/reviews/023-pr-do-lote3-operacionais-011.md` e os pareceres de QA de cada PR incluído em `docs/qa/` (`011-fase2-estrategicas`, `011-fase2-taticas`, `011-fase2-operacionais`, `k102-perf-semanal`, `011-front-estrategicas`, `024-e7-sem-reais`).
- `gh run list --branch develop --limit 3` (a CI do push na develop).

## Entregar
- (E1) QA da promoção: cada PR incluído tem parecer de QA aprovado, sem bug crítico, alto ou médio aberto, e as ressalvas baixas abertas listadas (com o aceite do dono quando houver); a CI do push na develop no head ed6ba46f39ed98fa76972c9fffe12c982f223e7f está `success` (run e link); o E2E do conjunto rodou no PR #114 (run 39040656592) e rodará de novo no PR de promoção e no portão da homolog.
- (E1) Gravar `docs/qa/023-pr-do-lote3-operacionais-011.md` com a ferramenta Write (registro de autoria), frontmatter `tipo: qa`, `pedido: 023-pr-do-lote3-operacionais-011`, `branch: develop`, `commit: ed6ba46`, `parecer:`, `escopo: completo`, contagem de bugs por severidade e `aceite_usuario:` (só `sim` se houver ressalva com aceite registrado pelo dono; senão `nao`), com a tabela PR × parecer de QA × ressalvas; um commit só desse arquivo e push da branch (sem `--force`). Não abra PR.

## Fora do escopo
- "E1.3 (forge:tech-lead): parecer de review da promoção develop → homolog em `docs/reviews/023-pr-do-lote3-operacionais-011.md`, numa branch `docs/023-pareceres-promocao` saída da develop" · etapa de outro papel, já feita.
- "E1.5 (forge:tech-lead): PR só de documentação dos dois pareceres para a develop (squash), antes do PR de promoção" e "E1.1 (forge:tech-lead): PR do lote 3 (operacionais), mesclado na develop, e promoção para a homolog." · etapas de outro papel; vêm depois.
- "E1.2 (dono): merge do release homolog → main." · etapa do dono.
- Rodar E2E ou `pronto` local; mudar código, testes ou outros pareceres; o quadro (`KANBAN.md`), que é do Jarvis.

## Decisões e restrições
- DECISÃO DO DONO (pedido 023, 2026-10-17): "A regra do projeto nunca passa sobre a fábrica"; para esta promoção vale a tabela de etapas da fábrica (opção B).
- DECISÃO DO DONO (pedido 024, 2026-10-17): aceita a ressalva baixa R-1 do QA do 024 como está (opção A).
- DECISÃO DO DONO (pedido 021, citada no 024, 2026-10-17): o E7 passa a se chamar "Entregas por sistema" (opção A); já está no #114.
- R-MAIN: nada na `main`. R-VERIFY: sem `--no-verify` nem `--force`; commit enviado não se emenda. R-CONFORMIDADE: bloqueio não se contorna; vira relato.
- NÃO tocar: `develop`, `homolog` e `main` diretamente; o diretório principal; a worktree `-011-fase2`; `.github/`.
- Teto: 2 agentes de dia, uma tarefa pesada por vez (restrição do usuário de 2026-10-17, pedido 024, "Restrições do usuário"): nada pesado local; a CI é a prova.

## Pronto quando
- PQ-1 (run): run da CI do push na develop no head ed6ba46f39ed98fa76972c9fffe12c982f223e7f com conclusão `success`.
- PQ-2 (sha): commit `docs(qa)` na branch `docs/023-pareceres-promocao`, com só `docs/qa/023-pr-do-lote3-operacionais-011.md`.
- PQ-3 (cmd): `grep -c '^parecer: aprovado' /home/rodrigoisensee/MetricasDSPD-023/docs/qa/023-pr-do-lote3-operacionais-011.md` · espera: igual '1'
- PQ-4 (push): `git -C /home/rodrigoisensee/MetricasDSPD-023 ls-remote origin refs/heads/docs/023-pareceres-promocao` igual ao head local.

## Relatório
Até 8 linhas: estado; o que precisa do usuário; suposições (com a base); o que foi feito, com evidência (link do run, tabela PR × QA, ressalvas abertas); riscos e bugs. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.
