## Objetivo
PR do lote 2 (táticas: T13, T14 e o B11-001 do T10) do back da fase 2 do pedido 011 para a develop. Review aprovado (rodada 5, 98e139a, sobre 0d9f296), segurança aprovada (967cb2c, sobre 6eda1cc) e QA aprovado (0d9f296, pronto rc=0); `forge-check pr 011-fase2-taticas --ref feature/011-fase2-taticas` sem apontamentos. Pedido 022, cartão K-103. Worktree `/home/rodrigoisensee/MetricasDSPD-011-fase2` (hoje na `feature/011-fase2-back`, com um parecer das operacionais sem commit que não é seu), branch `feature/011-fase2-taticas` (98e139a).

## Ler
- `docs/pedidos/022-pr-do-lote2-taticas-011.md`.
- Na branch do lote: os pareceres `docs/reviews/011-fase2-taticas.md`, `docs/security/011-fase2-taticas.md` e `docs/qa/011-fase2-taticas.md`, só o frontmatter e o veredito.

## Entregar
- (E1) Rodar `forge-check pr 011-fase2-taticas --ref feature/011-fase2-taticas` de dentro da worktree; se acusar algo, pare e relate.
- (E1) A branch contém a develop 1607a5f; se a develop tiver avançado (o PR #106 do front pode ser mesclado antes) e o PR acusar conflito, pare e relate em vez de trazer a develop (o merge invalidaria os pareceres).
- (E1) PR para a `develop` (squash), em rascunho primeiro se o hook pedir, com o resumo (T13 por granularidade, T14 só "meu time: k de n" e "outros times" somado e oculto abaixo de 2 pessoas, B11-001 com a versão de critério de 2026-10-17), o resultado do QA e os links dos 3 pareceres; mesclar com os checks exigidos verdes (check vermelho por ruído só se rerroda uma vez; vermelho determinístico: pare e relate, sem mesclar); apagar a branch local e a remota (R-FLUXO, "Depois do merge"), devolvendo a worktree à `feature/011-fase2-back`. A worktree `-011-fase2` não é removida: o lote 3 ainda vive nela.
- Fora do escopo: o lote 3 (operacionais) e a promoção para a homolog (pedido 023); o E7 sem R$ (pedido 024); o front dos lotes.

## Decisões e restrições
- Decisões do usuário (pedido 011): R-1 = B de 2026-10-16; T14 nova = A; Q-T14-10 = B (cadastro de membros por time só na fase 3); T14-M1 = B; D-14' = A e R-4 (T13); D-10 = A e T10-janela = A (T10); B11-001 = sim; métricas por nível em lotes separados.
- Squash na `develop` (`CLAUDE.md` do projeto). R-MAIN: nada na `main`. R-VERIFY: sem `--no-verify` nem `--force`. R-CONFORMIDADE: bloqueio não se contorna; vira relato.
- NÃO tocar: o código e os pareceres da branch, `.github/`, o diretório principal, a worktree `-011-front-estrategicas`, a branch `feature/011-fase2-operacionais` e o parecer das operacionais sem commit na worktree.
- Teto: no máximo 3 agentes e uma tarefa pesada por vez (pedido do usuário): sem `pronto` local; o portão é a CI do PR.

## Pronto quando
- PQ-1 (pr): PR de `feature/011-fase2-taticas` para a `develop` aberto.
- PQ-2 (merge): PR mesclado na `develop`.
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-011-fase2 ls-remote --heads origin feature/011-fase2-taticas` · espera: linhas=0

## Relatório
Até 8 linhas: estado; o que precisa do usuário; suposições (com a base); o que foi feito, com evidência (número do PR, checks, sha do merge); riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.
