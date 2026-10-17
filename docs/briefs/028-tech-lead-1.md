## Objetivo
PR do front do lote 1 do pedido 011 (estratégicas: E9, E6, E7 sem R$, E8) para a develop. Review aprovado (volta 4, ca061a4, sobre d542aa9), UX aprovada com ressalvas baixas (reconferência, dc2c9c0) e QA aprovado (89b755c, sobre d542aa9, `aceite_usuario: nao`); `forge-check pr 011-front-estrategicas --ref feature/011-front-estrategicas` sem apontamentos. Pedido 028. Worktree `/home/rodrigoisensee/MetricasDSPD-011-front-estrategicas`, branch `feature/011-front-estrategicas` (89b755c).

## Ler
- `docs/pedidos/028-pr-do-front-estrategicas.md`.
- Na worktree: os pareceres `docs/reviews/011-front-estrategicas.md`, `docs/qa/011-front-estrategicas.md` e `docs/ux/revisao-011-front-estrategicas.md`, só o frontmatter e o veredito.

## Entregar
- (E1) Rodar `forge-check pr 011-front-estrategicas --ref feature/011-front-estrategicas` de dentro da worktree; se acusar algo, pare e relate.
- (E1) A branch já contém a develop 1607a5f; se a develop tiver avançado e o PR acusar conflito, pare e relate em vez de trazer a develop (o merge invalidaria os pareceres).
- (E1) PR para a `develop` (squash), em rascunho primeiro se o hook pedir, com o resumo (E9, E6, E7 por participação percentual sem R$, E8 só com contagem; seção "Onde o parque se concentra, e qual o risco de continuidade?"), os números do QA (C6 do `/estrategico` 136 ms, Lighthouse 0,99, acessibilidade 1,00) e os links dos 3 pareceres; mesclar com os checks exigidos verdes; apagar a branch local e a remota e remover a worktree `-011-front-estrategicas` (R-FLUXO, "Depois do merge").
- Fora do escopo: a promoção para a homolog (pedido 023, depois dos 3 lotes do back); o nome do E7 (pendente de confirmação do usuário); os lotes 2 e 3 do front (pedidos 025 e 026).

## Decisões e restrições
- Decisões do usuário: R-1 = B de 2026-10-16 e D2 = A (pedido 011); título da seção = A (pedido 021); renomear o E7 está pendente de confirmação do usuário (pedido 021).
- Squash na `develop` (`CLAUDE.md` do projeto). R-MAIN: nada na `main`. R-VERIFY: sem `--no-verify` nem `--force`. R-CONFORMIDADE: bloqueio não se contorna; vira relato. Check vermelho por ruído só se rerroda uma vez.
- NÃO tocar: o código da branch, `.github/`, o diretório principal, a worktree `-011-fase2` e as branches do back.
- Teto: no máximo 3 agentes e uma tarefa pesada por vez (pedido do usuário): sem `pronto` local; o portão é a CI do PR.

## Pronto quando
- PQ-1 (pr): PR de `feature/011-front-estrategicas` para a `develop` aberto.
- PQ-2 (merge): PR mesclado na `develop`.
- PQ-3 (cmd): `test -d /home/rodrigoisensee/MetricasDSPD-011-front-estrategicas && echo existe || echo removida` · espera: igual 'removida'

## Relatório
Até 8 linhas: estado; o que precisa do usuário; suposições (com a base); o que foi feito, com evidência (número do PR, checks, sha do merge); riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.
