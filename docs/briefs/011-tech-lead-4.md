## Objetivo
Revalidar o review do lote 2 (táticas: T13, T14) do back da fase 2 do 011 sobre a branch atualizada: a `feature/011-fase2-taticas` (d845d88) agora tem a develop com o lote 1 (#105) e o B11-001 no T10 (pedido 027). O merge foi montado como reconstrução (árvore da develop mais os commits do lote 2), não como merge textual, porque o merge direto deu 32 conflitos com o squash do lote 1. Worktree `/home/rodrigoisensee/MetricasDSPD-011-fase2` (hoje na `feature/011-fase2-back`): troque para a `feature/011-fase2-taticas` e volte no fim.

## Ler
- Na branch: o seu parecer `docs/reviews/011-fase2-taticas.md`.
- `git diff origin/develop origin/feature/011-fase2-taticas` (47 arquivos) e `git log --oneline origin/develop..origin/feature/011-fase2-taticas`.
- `docs/pedidos/027-taticas-develop-e-b11-001.md`.

## Entregar
- (E1, E2; o merge e o B11-001 vieram do pedido 027) Conferir que o diff contra a develop é só o lote 2 (T13, T14), o B11-001 do T10 e o que eles exigem nos arquivos comuns (contratos, catálogo, OpenAPI, fotografias, regras, docs gerados), sem desfazer nada do lote 1; revisar o B11-001 (`t10.ts` e o teste novo) e a saída da Q-T14-10 das pendências; a Q-T14-9 (decidida A pelo usuário) ainda está como pendência em `REGRAS_METRICA.T14`: registre como ajuste para o autor ou aceite, com o motivo.
- (E1, E2) Atualizar o parecer (`commit:` para o HEAD que você revisar e uma seção da revalidação), gravado com a ferramenta Write (nunca por script), commit, `git add` por caminho, e push.
- (E1, E2) A separação em 3 branches por nível já foi entregue (lote 1 mesclado no #105; táticas em d845d88; operacionais em aab7a46): só confirme, com `git ls-remote origin`, que a das operacionais continua em aab7a46, e relate.
- Fora do escopo, outras etapas do pedido 011 (citadas de "### Etapas"; E1.1, E2.1, E3.1 e E3.2 já feitas): "E1.1 (forge:node-backend): implementar E1 na worktree `-011-fase2`, branch `feature/011-fase2-back`."; "E2.1 (forge:node-backend): implementar E2 depois de E3.1."; "E3.1 (forge:software-architect): ADR 0020 e plano."; "E3.2 (forge:ux-designer): CAs na especificação."; "E1.3/E2.3 (forge:security-engineer): review de segurança (gatilho: dados pessoais no O22, O26, E8 e T14)." (revalida depois desta); "E1.4/E2.4 (forge:qa-engineer): QA do back da fase 2." (depois da segurança); "E9.2 (dono): merge na main."
- Fora do escopo: o PR (pedido 022); o lote 3; corrigir código (volta ao autor).

## Decisões e restrições
- Decisões do usuário do pedido 011 que este lote exercita: B11-001 = sim; Q-T14-10 = B; Q-T14-9 = A; Q-T14-1 = B; T14-M1 = B (antes da fase 3); R-1 = B de 2026-10-16 (reidentificação no E8 e na T14; não confundir com a R-1 = A de 2026-10-14, do O24); T14 nova = A; Q-T14-5 = D; Q-T14-6 = A refinada pela R-1 = B; D-14' = A e R-4 (T13); D-10 = A (T10 sem prazo contratado, com P50/P85 e a linha "Prazo contratado não informado"); T10-janela = A; métricas por nível em lotes separados e "4-seguir".
- Valem também as demais decisões do usuário do pedido 011, sem reabrir nenhuma: D-8 = A, D-5' = B, Q-a = 1 passagem, Q-b = conta, D-6' = A, R-1 = A (O24), R-2' = A, R-2 = B, P-1 = A, motivos de descarte = A, O19-pct = B, O20-destaque = A, O25(b) = B, Dados antigos = A, prioridade = A, Q-T14-10 = B; D-1' e Q-E7-1 revistas pela D2 = A (E7 sem R$).
- ADR 0011, ADR 0020, ADR 0003. Regras invioláveis do `CLAUDE.md`.
- NÃO tocar: o código da branch (ajuste volta ao autor), `.github/`, a `main`, o diretório principal, as outras branches e worktrees, e os 2 pareceres de segurança sem commit na worktree. Sem `--no-verify` nem `--force`.
- Teto: no máximo 3 agentes e uma tarefa pesada por vez (pedido do usuário). O QA roda o pronto e os E2E do front em outra worktree: sem `pronto` local; o autor rodou (rc=0).

## Pronto quando
- PQ-1 (push): commit da revalidação do review em `feature/011-fase2-taticas` no origin.
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-011-fase2 status --short -- server packages docs/api docs/contratos docs/reviews` · espera: linhas=0

## Relatório
Até 8 linhas: estado (aprovado, aprovado com ajustes ou reprovado); o que precisa do usuário; suposições (com a base); o que foi feito, com evidência; riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.
