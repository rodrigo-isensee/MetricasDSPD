## Objetivo
Volta 5 do review do lote 2 (táticas: T13, T14, mais o B11-001 no T10) do back da fase 2 do pedido 011: depois da sua rodada 4 (6eda1cc), o QA acrescentou o teste da P6 com equipe no filtro (B-1 da segurança) no commit a1c0ee0, e o `forge-check pr 011-fase2-taticas` acusa o review como desatualizado. Worktree `/home/rodrigoisensee/MetricasDSPD-011-fase2` (hoje na `feature/011-fase2-back`, com um parecer das operacionais sem commit que não é seu): troque para a `feature/011-fase2-taticas` (0d9f296) e volte no fim.

## Ler
- Na branch do lote: o seu parecer `docs/reviews/011-fase2-taticas.md` (rodada 4).
- `git -C /home/rodrigoisensee/MetricasDSPD-011-fase2 diff 6eda1cc..origin/feature/011-fase2-taticas -- packages server web e2e`.

## Entregar
- (E1, E2) Revisar o diff de teste do QA (só `packages/metricas/src/regras.property.test.ts`; nenhum código de produção); registrar a rodada 5 no parecer (`commit:` para 0d9f296), gravado com a ferramenta Write do começo ao fim (nunca `sed` nem script), commit só do parecer, `git add` por caminho, e push; rodar `forge-check pr 011-fase2-taticas --ref feature/011-fase2-taticas` e copiar a saída.
- Fora do escopo, outras etapas do pedido 011 (citadas de "### Etapas"; E1.1, E2.1, E3.1, E3.2, E1.3/E2.3 e E1.4/E2.4 já feitas para este lote): "E1.1 (forge:node-backend): implementar E1 na worktree `-011-fase2`, branch `feature/011-fase2-back`."; "E2.1 (forge:node-backend): implementar E2 depois de E3.1."; "E3.1 (forge:software-architect): ADR 0020 e plano."; "E3.2 (forge:ux-designer): CAs na especificação."; "E1.3/E2.3 (forge:security-engineer): review de segurança (gatilho: dados pessoais no O22, O26, E8 e T14)."; "E1.4/E2.4 (forge:qa-engineer): QA do back da fase 2."; "E9.2 (dono): merge na main."
- Fora do escopo, Retira do escopo original desta entrega (não do pedido): trecho do pedido 011, E1.2/E2.2 "code review do back da fase 2 e separação em 3 branches por nível (estratégicas, táticas, operacionais), uma por PR"; motivo: a decisão do usuário de 2026-10-17 "Ordem por nível, em lotes separados" (pedido 011) manda revisar o lote 3 (operacionais) só depois do lote 2; consequência: o review do lote 3 é revalidado numa delegação seguinte, antes do PR das operacionais (pedido 023).
- Fora do escopo: o PR do lote 2 (pedido 022); a fase 3.

## Decisões e restrições
- Decisões do usuário (pedido 011): R-1 = B de 2026-10-16; R-2 = B; T14 nova = A; Q-T14-1 = B; Q-T14-5 = D; Q-T14-6 = A refinada pela R-1 = B; Q-T14-9 = A; Q-T14-10 = B (cadastro de membros por time só na fase 3); T14-M1 = B; D2 = A (E7 sem R$, aplicada no pedido 024); D-14' = A e R-4 (T13); D-10 = A e T10-janela = A (T10); B11-001 = sim; métricas por nível em lotes separados.
- R-REVIEW: o parecer de review é do tech-lead, com Write. ADR 0020, ADR 0011, ADR 0003.
- NÃO tocar: código e testes da branch, `.github/`, a `main`, o diretório principal, as outras branches, os pareceres de QA e de segurança, e o parecer das operacionais sem commit na worktree. Sem `--no-verify` nem `--force`.
- Teto: no máximo 3 agentes e uma tarefa pesada por vez (pedido do usuário): sem `pronto` local (o QA já rodou, rc=0, em 0d9f296).

## Pronto quando
- PQ-1 (push): commit da rodada 5 do review em `feature/011-fase2-taticas` no origin.
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-011-fase2 show origin/feature/011-fase2-taticas:docs/reviews/011-fase2-taticas.md` · espera: contém 'commit: 0d9f296'
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-011-fase2 status --short -- server packages docs/reviews docs/qa` · espera: linhas=0

## Relatório
Até 8 linhas: estado (veredito); o que precisa do usuário; suposições (com a base); o que foi feito, com evidência (saída do `forge-check pr`); riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.
