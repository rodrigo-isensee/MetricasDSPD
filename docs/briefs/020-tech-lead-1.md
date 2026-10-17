## Objetivo
PR do lote 1 (estratégicas: E6, E7 com R$, E8) do back da fase 2 do pedido 011 para a develop, o primeiro dos 3 PRs por nível que o usuário pediu. Review (3aeaa3d), segurança e QA (36f8c6b, regravado) aprovados. Pedido 020. Worktree `/home/rodrigoisensee/MetricasDSPD-011-fase2`, branch `feature/011-fase2-estrategicas`.

## Ler
- `docs/pedidos/020-prs-do-back-fase2-011.md`.
- Na branch do lote: `docs/reviews/011-fase2-estrategicas.md` e `docs/qa/011-fase2-estrategicas.md`, só o frontmatter e o veredito.
- Na worktree (sem commit, na `feature/011-fase2-back`): `docs/security/011-fase2-estrategicas.md`.

## Entregar
- (E1) Commitar na branch do lote o parecer de segurança `docs/security/011-fase2-estrategicas.md` (do security-engineer, sem commit), `git add` por caminho. Os pareceres de segurança das táticas e das operacionais ficam na worktree para os PRs seguintes.
- (E1) Trazer a `develop` atual (48b909a) para a branch (R-FLUXO). Se o merge mudar código do escopo ou o `forge-check pr 011-fase2-estrategicas` acusar parecer desatualizado, pare e relate antes de abrir o PR.
- (E1) Push, PR para a `develop` (squash) com o resumo e os links dos 3 pareceres; mesclar com os checks exigidos verdes; apagar a branch local e a remota do lote.
- Fora do escopo: os PRs das táticas e das operacionais, que saem só depois deste (e o das táticas depois do B11-001); a promoção para a homolog, depois do terceiro; corrigir código (volta ao autor).

## Decisões e restrições
- Decisão do usuário (pedido 011, 2026-10-17): métricas por nível em lotes separados, estratégicas → táticas → operacionais; o PR de cada lote só depois do anterior mesclado.
- Squash na `develop` (`CLAUDE.md` do projeto). R-MAIN: nada na `main`. R-VERIFY: sem `--no-verify` nem `--force`. R-CONFORMIDADE: bloqueio não se contorna; vira relato. Check vermelho por ruído só se rerroda uma vez.
- NÃO tocar: código das branches, `.github/`, o diretório principal, as branches `feature/011-fase2-taticas`, `feature/011-fase2-operacionais` e `feature/011-fase2-back`.
- Teto reduzido a 2 agentes a pedido do usuário (2026-10-17): sem `pronto` local, que já rodou no QA; o portão é a CI do PR.

## Pronto quando
- PQ-1 (sha): commit do parecer de segurança em `feature/011-fase2-estrategicas`.
- PQ-2 (pr): PR de `feature/011-fase2-estrategicas` para a `develop` aberto.
- PQ-3 (merge): PR mesclado na `develop`.
- PQ-4 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD ls-remote origin refs/heads/feature/011-fase2-estrategicas` · espera: linhas=0

## Relatório
Até 8 linhas: estado; o que precisa do usuário; suposições (com a base); o que foi feito, com evidência (número do PR, checks, sha do merge); riscos (inclui o efeito do merge na branch das táticas, que sai desta). Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.
