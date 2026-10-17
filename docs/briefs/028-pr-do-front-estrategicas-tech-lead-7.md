Agente destino: forge:tech-lead
Pedido: docs/pedidos/028-pr-do-front-estrategicas.md
Branch: feature/011-front-estrategicas   Base: develop   Base-sha: 5ad02ea4e927c5d6799b5fc7f71e6a37cc39fd92

## Objetivo
Mesclar o PR #108 (front do lote 1 do pedido 011, estratégicas: E9, E6, E7 sem R$, E8) na develop. Pareceres em dia: UX (b13dfe68b696e6622b6d5661ad82e56de2678cd8), volta 8 do review (cb68ace76cfd3b741e94759990c10886455f926c) e revalidação do QA sobre cb68ace76cfd3b741e94759990c10886455f926c (85555200a34ca95b2f2d81a800f5459149786088 e be2a342bb0caf8290298b0b0699e464043980dd5, run 39029217011 `success`). Head atual be2a342bb0caf8290298b0b0699e464043980dd5; o `forge-check pr` sai sem pendência. Retoma a etapa E1.1 do brief 5 depois das etapas E1.3 e E1.4. Pedido 028, cartão K-109. Worktree `/home/rodrigoisensee/MetricasDSPD-011-front-estrategicas`, branch `feature/011-front-estrategicas`.

## Ler
- `docs/pedidos/028-pr-do-front-estrategicas.md`, seções "Etapas" e "Decisões técnicas do time".
- `gh pr view 108 --json mergeStateStatus,mergeable,statusCheckRollup,headRefOid`.

## Entregar
- (E1) Esperar a CI do PR #108 no head be2a342bb0caf8290298b0b0699e464043980dd5 terminar (só docs desde o run 39029217011); check vermelho por ruído só se rerroda uma vez; vermelho de verdade: pare e relate.
- (E1) Rodar `forge-check pr 011-front-estrategicas --ref feature/011-front-estrategicas --base develop` de dentro da worktree; se acusar algo, pare e relate (não regrave pareceres).
- (E1) Com os checks exigidos verdes e o PR fora de `BEHIND`, mesclar por squash, usando o nome da branch no `gh pr merge` (exigência do hook `parecer`). Se a develop tiver avançado e o PR voltar a `BEHIND`, pare e relate, sem trazer a develop.
- (E1) Depois do merge: apagar a branch local e a remota e remover a worktree `-011-front-estrategicas` (R-FLUXO, "Depois do merge").

## Fora do escopo
- O pedido 024 (traz a develop depois deste merge); a promoção para a homolog (pedido 023); o nome do E7 (pendente de confirmação do usuário); o comentário "49 linhas" em `CatalogoPage.tsx` (ressalva baixa); o K-115; os lotes 2 e 3 do front; novos commits na branch; o quadro (`KANBAN.md`), que é do Jarvis.

## Decisões e restrições
- Decisões do usuário: R-1 = B de 2026-10-16 e D2 = A (pedido 011); título da seção = A (pedido 021); renomear o E7 está pendente de confirmação do usuário (pedido 021).
- Decisão técnica do time (pedido 028, 2026-10-17): ordem #109 → atualizar o #108 e revalidar → merge do #108 → pedido 024; não contornar o `forge-check`.
- Squash na `develop` (`CLAUDE.md` do projeto). R-MAIN: nada na `main`. R-VERIFY: sem `--no-verify` nem `--force`; sem `--admin`. R-CONFORMIDADE: bloqueio não se contorna; vira relato.
- NÃO tocar: código e pareceres da branch, `.github/`, o diretório principal, as worktrees `-011-fase2` e `-024`.
- Teto: 2 agentes de dia (restrição do usuário de 2026-10-17, pedido 024, "Restrições do usuário"): sem `pronto` local; o portão é a CI do PR.

## Pronto quando
- PQ-1 (merge): PR #108 mesclado na `develop`.
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD ls-remote --heads origin feature/011-front-estrategicas` · espera: linhas=0
- PQ-3 (cmd): `test -d /home/rodrigoisensee/MetricasDSPD-011-front-estrategicas && echo existe || echo removida` · espera: igual 'removida'

## Relatório
Até 8 linhas: estado; o que precisa do usuário; suposições (com a base); o que foi feito, com evidência (checks, sha do merge); riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.
