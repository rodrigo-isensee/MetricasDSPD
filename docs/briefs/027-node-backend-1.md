## Objetivo
Preparar o lote 2 do back da fase 2 do 011 (táticas: T13, T14) para o PR: trazer a develop, que recebeu o lote 1 por squash (#105, 1607a5f), e aplicar a decisão B11-001 do usuário no T10. Pedido 027. Worktree `/home/rodrigoisensee/MetricasDSPD-011-fase2` (hoje na `feature/011-fase2-back`): troque para a `feature/011-fase2-taticas` (ace8db8, no origin).

## Ler
- `docs/pedidos/027-taticas-develop-e-b11-001.md`.
- Na branch: `docs/reviews/011-fase2-taticas.md` (riscos e o R2: `REGRAS_METRICA.T14` ainda lista a Q-T14-10 como pendente).
- `docs/architecture/features/metricas-tambem-disponiveis.md` da develop: §2 do T10.

## Entregar
- (E1) Merge da `origin/develop` na `feature/011-fase2-taticas`. Nos conflitos dos arquivos comuns (`METRICA_IDS`, `APLICABILIDADE_FLUXO`, `REGRAS_METRICA`, OpenAPI, contratos gerados, fotografias), fique com o lote 1 já na develop e acrescente só o que é do lote 2; regenere o que for gerado (`docs:gerar`, OpenAPI, fotografias) em vez de editar à mão.
- (E2) B11-001: o T10 agrupa o fornecedor pelo nome normalizado (sem diferença de maiúsculas, minúsculas e espaços nas pontas e repetidos), com teste; a exibição usa a grafia mais frequente do grupo.
- (E1) O R2 do review das táticas: `REGRAS_METRICA.T14` deixa de listar a Q-T14-10 como pendente (decidida pelo usuário = B, cadastro de membros por time, na fase 3).
- (E1, E2) `pnpm run pronto` verde, commits por assunto, `git add` por caminho, push. Volte a worktree para `feature/011-fase2-back` no fim.
- Fora do escopo: a revalidação do review, da segurança e o QA do lote 2 (depois desta entrega); o PR (pedido 022); o lote 3; o E7 sem R$ (pedido 024).

## Decisões e restrições
- Decisões do usuário (pedido 011): B11-001 = sim; Q-T14-10 = B; T14-M1 = B (vale antes da fase 3, não muda o mock agora); R-1 = B; T14 nova = A; Q-T14-5 = D; Q-T14-6 = A refinada pela R-1 = B; Q-T14-9 = A; D-14' = A e R-4 (T13); T10-janela = A; métricas por nível em lotes separados.
- ADR 0011 (biblioteca única), ADR 0020, ADR 0003. Regras invioláveis do `CLAUDE.md`. Dúvida de regra de negócio vira pergunta, sem decidir no código.
- NÃO tocar: `web/`, `.github/`, migrações, a `main`, o diretório principal, as branches `feature/011-fase2-operacionais` e `feature/011-fase2-back` (só para voltar a worktree a ela) e os 2 pareceres de segurança sem commit em `docs/security/` da worktree. Sem `--no-verify` nem `--force`.
- Teto: no máximo 3 agentes e uma tarefa pesada por vez (pedido do usuário). O `pronto` uma vez, com `uptime` e `free -m` antes e load abaixo de 4; se outra tarefa pesada estiver rodando (o front na worktree `-011-front-estrategicas`), espere.

## Pronto quando
- PQ-1 (push): `feature/011-fase2-taticas` no origin com o merge da develop e o B11-001.
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD merge-base --is-ancestor 1607a5f origin/feature/011-fase2-taticas && echo contem` · espera: igual 'contem'
- PQ-3 (cmd): `pnpm run pronto` na `feature/011-fase2-taticas`, da raiz da worktree · espera: rc=0
- PQ-4 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-011-fase2 status --short -- server packages docs/api docs/contratos` · espera: linhas=0

## Relatório
Até 8 linhas: estado; o que precisa do usuário; suposições (com a base); o que foi feito, com evidência (conflitos e como foram resolvidos); riscos; mudanças de contrato. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.
