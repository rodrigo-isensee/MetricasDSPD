## Objetivo
PR do lote 3 (operacionais: O22, O26) do back da fase 2 do pedido 011 para a develop. Review aprovado (rodada 2, sobre d5b02d8), segurança aprovada (parecer no commit b99ee1f, sobre d5b02d8) e QA aprovado (parecer no commit 999eecc, sobre b99ee1f; pronto rc=0, 0 bugs); `forge-check pr 011-fase2-operacionais --ref feature/011-fase2-operacionais-v2` sem apontamentos. Pedido 023, cartão K-103. Worktree `/home/rodrigoisensee/MetricasDSPD-011-fase2`, branch `feature/011-fase2-operacionais-v2` (999eecc), refeita sobre a develop 8516ff8.

## Ler
- `docs/pedidos/023-pr-do-lote3-operacionais-011.md`.
- Na branch do lote: os pareceres `docs/reviews/011-fase2-operacionais.md`, `docs/security/011-fase2-operacionais.md` e `docs/qa/011-fase2-operacionais.md`, só o frontmatter e o veredito.

## Entregar
- (E1) Rodar `forge-check pr 011-fase2-operacionais --ref feature/011-fase2-operacionais-v2` de dentro da worktree; se acusar algo, pare e relate.
- (E1) A branch contém a develop 8516ff8; se a develop tiver avançado (o PR do front do lote 1, pedido 028, pode ser mesclado antes) e o PR acusar conflito ou a proteção exigir a branch atualizada, pare e relate em vez de trazer a develop (o merge invalidaria os pareceres).
- (E1) PR para a `develop` (squash), aberto só agora (depois dos 3 pareceres), em rascunho primeiro se o hook pedir, com o resumo (O22 primeiro toque por tipo; O26 passagens com D-5' = B; lote refeito sobre a develop por cherry-pick) e os links dos 3 pareceres; mesclar com os checks exigidos verdes (vermelho por ruído só se rerroda uma vez; vermelho determinístico: pare e relate); no `gh pr merge`, use o nome da branch, não o número (exigência do hook `parecer`).
- (E1) Depois do merge: apagar a branch `-v2` local e remota e também a antiga `feature/011-fase2-operacionais` (local e remota), sem `--force` (`git push origin --delete`); a worktree `-011-fase2` volta à `feature/011-fase2-back` e não é removida nesta etapa.
- Fora do escopo, Retira do escopo original desta entrega (não do pedido): trecho do pedido 023, E1.1 "e promoção para a homolog"; motivo: a promoção precisa do pedido 024 (E7 sem R$, em implementação) e do front do lote 1 (pedido 028) na develop, para a homolog não receber o E7 em R$ com o front já sem R$; consequência: a promoção develop → homolog sai numa delegação seguinte do mesmo pedido, depois desses merges; decisão do usuário: "Vou dormir toque tudo que puder até a homolog" (2026-10-17, registrada no pedido 023, "Decisões do usuário") e D2 = A (pedido 011).
- Fora do escopo, outra etapa do pedido 023 (citada de "## Etapas"): "E1.2 (dono): merge do release homolog → main."
- Fora do escopo: o E7 sem R$ (pedido 024); o front dos lotes.

## Decisões e restrições
- Decisões do usuário (pedido 011) que este lote exercita: D-5' = B; E1 do O26 com Q-a = 1 passagem e Q-b = conta; R-1 = B de 2026-10-16; R-2 = B; R-2' = A e P-1 = A; O19-pct = B; O20-destaque = A; O25(b) = B; D2 = A (pedido 024); métricas por nível em lotes separados, nesta ordem.
- Squash na `develop` (`CLAUDE.md` do projeto). R-MAIN: nada na `main`. R-VERIFY: sem `--no-verify` nem `--force`. R-CONFORMIDADE: bloqueio não se contorna; vira relato. R-FLUXO, "Depois do merge".
- NÃO tocar: o código e os pareceres da branch, `.github/`, o diretório principal, as worktrees `-011-front-estrategicas` e `-024`, a `homolog` e a `main`.
- Teto: no máximo 3 agentes e uma tarefa pesada por vez (pedido do usuário): sem `pronto` local; o portão é a CI do PR.

## Pronto quando
- PQ-1 (pr): PR de `feature/011-fase2-operacionais-v2` para a `develop` aberto.
- PQ-2 (merge): PR mesclado na `develop`.
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-011-fase2 ls-remote --heads origin feature/011-fase2-operacionais-v2 feature/011-fase2-operacionais` · espera: linhas=0

## Relatório
Até 8 linhas: estado; o que precisa do usuário; suposições (com a base); o que foi feito, com evidência (número do PR, checks, sha do merge); riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.
