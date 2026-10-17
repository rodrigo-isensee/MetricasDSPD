## Objetivo
Revalidar a segurança do lote 3 (operacionais: O22, O26) do back da fase 2 do pedido 011 sobre a branch refeita: o seu parecer (`011-fase2-operacionais.md`) está sem commit na worktree e foi escrito sobre a branch antiga (`feature/011-fase2-operacionais`, aab7a46, cortada sobre as táticas antigas). O tech-lead refez o lote sobre a develop 8516ff8 (cherry-pick de df0b9ed, 3 conflitos resolvidos a favor da develop) em `feature/011-fase2-operacionais-v2` (3d234aa) e aprovou o review na rodada 2 (d5b02d8). Worktree `/home/rodrigoisensee/MetricasDSPD-011-fase2`, hoje na `-v2`.

## Ler
- O seu parecer sem commit na pasta de pareceres de segurança da worktree: `011-fase2-operacionais.md`.
- `git -C /home/rodrigoisensee/MetricasDSPD-011-fase2 range-diff ace8db8..aab7a46 8516ff8..origin/feature/011-fase2-operacionais-v2` (o que mudou do patch que você revisou para o patch novo).
- A ADR 0020 da develop: `/home/rodrigoisensee/MetricasDSPD/docs/architecture/adr/0020-protecao-de-pessoa-no-coletor.md`.

## Entregar
- (E1, E2) Revisar quanto a dado de pessoa o patch das operacionais sobre a develop: o O22 (`primeiroToque`) e o O26 (`passagens`, `houveTroca`), e os três trechos de conflito (`docs/architecture/regras-metricas.md` e os imports de `packages/mock/src/businessmap/extensaoTambemFase2.ts`); confirmar que nada de pessoa sai da API (`dspd_api` não lê colunas de pessoa) e que o B-1 das táticas (P6 com equipe no filtro, já na develop) não foi afetado.
- (E1, E2) Atualizar o parecer (`commit:` para d5b02d8 ou o commit revisado, branch `-v2`, seção de revalidação), gravado com a ferramenta Write; commit na `feature/011-fase2-operacionais-v2`, `git add` por caminho, e push.
- Fora do escopo, outras etapas do pedido 011 (citadas de "### Etapas"; E1.1, E2.1, E3.1, E3.2 e E1.2/E2.2 já feitas): "E1.1 (forge:node-backend): implementar E1 na worktree `-011-fase2`, branch `feature/011-fase2-back`."; "E2.1 (forge:node-backend): implementar E2 depois de E3.1."; "E3.1 (forge:software-architect): ADR 0020 e plano."; "E3.2 (forge:ux-designer): CAs na especificação."; "E1.2/E2.2 (forge:tech-lead): code review do back da fase 2 e separação em 3 branches por nível (estratégicas, táticas, operacionais), uma por PR."; "E1.4/E2.4 (forge:qa-engineer): QA do back da fase 2." (vem depois desta); "E9.2 (dono): merge na main."
- Fora do escopo: o PR das operacionais e a promoção para a homolog (pedido 023); o E7 sem R$ (pedido 024); a fase 3.

## Decisões e restrições
- Decisões do usuário (pedido 011) que este lote exercita: D-5' = B (O26: passagem só quando alguém sai e outro entra, ou o conjunto é substituído); E1 do O26 com Q-a = 1 passagem e Q-b = conta; R-1 = B de 2026-10-16; R-2 = B; R-2' = A e P-1 = A; O19-pct = B; O20-destaque = A; O25(b) = B; D2 = A (pedido 024, não deste lote); métricas por nível em lotes separados, nesta ordem.
- ADR 0020 vigente para a fase 2. Regras invioláveis do `CLAUDE.md`: nenhuma métrica serve para avaliação individual; nome, e-mail e `usuarioKey` nunca chegam ao staging; a API (`dspd_api`) não lê colunas de pessoa.
- NÃO tocar: código, testes, as outras branches (inclusive a `feature/011-fase2-operacionais` antiga), o parecer de review, a `main` e o diretório principal. Sem `--no-verify` nem `--force`.
- Teto: no máximo 3 agentes e uma tarefa pesada por vez (pedido do usuário): nada pesado nesta etapa.

## Pronto quando
- PQ-1 (push): commit do parecer de segurança revalidado em `feature/011-fase2-operacionais-v2` no origin.
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-011-fase2 show origin/feature/011-fase2-operacionais-v2:docs/security/011-fase2-operacionais.md` · espera: contém 'd5b02d8'
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-011-fase2 status --short -- server packages docs` · espera: linhas=0

## Relatório
Até 8 linhas: estado (veredito); o que precisa do usuário; suposições (com a base); o que foi feito, com evidência; riscos e pré-condições da fase 3. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.
