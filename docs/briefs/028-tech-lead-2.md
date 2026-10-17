## Objetivo
Levar à develop o front do lote 1, hoje no PR #106 (front do lote 1 do pedido 011, estratégicas: E9, E6, E7 sem R$, E8). A primeira tentativa parou no check `e2e` (SIS-CONS-01); depois disso vieram a correção da contagem (59dfb37), o orçamento de tempo do IF-I01 (357936b), o review volta 6 (79c3df5) e o QA fechado (4f9f229, 011F-002 fechado, `bugs_baixos: 0`); `forge-check pr 011-front-estrategicas --ref origin/feature/011-front-estrategicas` sem apontamentos e o check `e2e` da CI verde em 79c3df5. A develop avançou para 8516ff8 (#107, táticas) e o #106 está `BEHIND`, mas `MERGEABLE`; os checks do head 4f9f229 ainda rodavam na conferência. Pedido 028. Worktree `/home/rodrigoisensee/MetricasDSPD-011-front-estrategicas`, branch `feature/011-front-estrategicas` (4f9f229).

## Ler
- `docs/pedidos/028-pr-do-front-estrategicas.md`.
- `gh pr view 106 --json mergeStateStatus,mergeable,statusCheckRollup`.

## Entregar
- (E1) Rodar `forge-check pr 011-front-estrategicas --ref feature/011-front-estrategicas` de dentro da worktree; se acusar algo, pare e relate.
- (E1) O #106 foi aberto às 02:16Z, antes dos pareceres finais (review volta 6 e QA de 4f9f229), e por isso está fora de ordem (o mesmo caso do #104, refeito como #105): fechar o #106 com um comentário que aponte o motivo e o PR novo, e abrir um PR novo da mesma branch para a `develop`, com o corpo do #106 atualizado (correção do SIS-CONS-01 e do IF-I01, K-115 fora do PR) e os links dos 3 pareceres.
- (E1) Esperar os checks exigidos do PR novo no head 4f9f229 e mesclar por squash. Se a proteção da develop exigir a branch atualizada (BEHIND bloqueia o merge), pare e relate, sem trazer a develop (o merge invalidaria os pareceres e pede nova rodada de review e QA).
- (E1) Depois do merge: apagar a branch local e a remota e remover a worktree `-011-front-estrategicas` (R-FLUXO, "Depois do merge").
- Fora do escopo: a promoção para a homolog (pedido 023); o nome do E7 (pendente de confirmação do usuário); o comentário "49 linhas" em `CatalogoPage.tsx` (ressalva baixa); o K-115; os lotes 2 e 3 do front (pedidos 025 e 026).

## Decisões e restrições
- Decisões do usuário: R-1 = B de 2026-10-16 e D2 = A (pedido 011); título da seção = A (pedido 021); renomear o E7 está pendente de confirmação do usuário (pedido 021).
- Decisões técnicas do time (pedido 021, 2026-10-18): 011F-002 pela saída (a); instabilidade sob carga local no K-115, fora deste PR; a prova da suíte completa é o check `e2e` da CI do PR #106.
- Squash na `develop` (`CLAUDE.md` do projeto). R-MAIN: nada na `main`. R-VERIFY: sem `--no-verify` nem `--force`. R-CONFORMIDADE: bloqueio não se contorna; vira relato. Check vermelho por ruído só se rerroda uma vez. O hook `parecer` exige o nome da branch no `gh pr merge`, não o número.
- NÃO tocar: o código e os pareceres da branch, `.github/`, o diretório principal, a worktree `-011-fase2` e as branches do back.
- Teto: no máximo 3 agentes e uma tarefa pesada por vez (pedido do usuário): sem `pronto` local; o portão é a CI do PR.

## Pronto quando
- PQ-1 (pr): PR novo de `feature/011-front-estrategicas` para a `develop` aberto, e o #106 fechado.
- PQ-2 (merge): PR novo mesclado na `develop`.
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD ls-remote --heads origin feature/011-front-estrategicas` · espera: linhas=0
- PQ-4 (cmd): `test -d /home/rodrigoisensee/MetricasDSPD-011-front-estrategicas && echo existe || echo removida` · espera: igual 'removida'

## Relatório
Até 8 linhas: estado; o que precisa do usuário; suposições (com a base); o que foi feito, com evidência (checks, sha do merge); riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.
