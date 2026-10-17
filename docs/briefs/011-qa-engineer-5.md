## Objetivo
QA do lote 3 (operacionais: O22, O26) do back da fase 2 do pedido 011, portão obrigatório antes do PR (R-QA). Review aprovado (rodada 2, sobre d5b02d8) e segurança aprovada (b99ee1f, sobre d5b02d8). Branch `feature/011-fase2-operacionais-v2` (b99ee1f, no origin), refeita sobre a develop 8516ff8 (lotes 1 e 2 já na develop). Worktree `/home/rodrigoisensee/MetricasDSPD-011-fase2`, hoje na `-v2`.

## Ler
- `docs/qa/011-back-plano.md`: os casos do O22 e do O26.
- Na branch do lote: `docs/reviews/011-fase2-operacionais.md` (rodadas 1 e 2) e `docs/security/011-fase2-operacionais.md` (só o veredito e a revalidação).
- `docs/architecture/features/metricas-tambem-disponiveis.md` da develop (`/home/rodrigoisensee/MetricasDSPD/...`): §2 do O22 e do O26.

## Entregar
- (E1, E2) QA do lote 3: `pnpm run pronto` na branch do lote, da raiz da worktree, com `uptime` e `free -m` antes (load abaixo de 4); os casos do plano para o O22 (primeiro toque, por tipo, abaixo de 20 itens sem estatística) e para o O26 (passagens com D-5' = B: só quando alguém sai e outro entra, ou o conjunto é substituído; co-responsável incluído sem saída não conta; Q-a = 1 passagem; Q-b = conta); nada de pessoa na saída (a propriedade P6 alcança o O22 e o O26); se faltar teste para um caso do plano, escreva-o.
- (E1, E2) Parecer em `docs/qa/011-fase2-operacionais.md` (`pedido: 011-fase2-operacionais`), gravado com a ferramenta Write (nunca por script); teste novo, se houver, num commit antes do parecer; `git add` por caminho, e push. Rodar `forge-check pr 011-fase2-operacionais --ref feature/011-fase2-operacionais-v2` e copiar a saída.
- Fora do escopo, outras etapas do pedido 011 (citadas de "### Etapas"; E1.1, E2.1, E3.1, E3.2, E1.2/E2.2 e E1.3/E2.3 já feitas para este lote): "E1.1 (forge:node-backend): implementar E1 na worktree `-011-fase2`, branch `feature/011-fase2-back`."; "E2.1 (forge:node-backend): implementar E2 depois de E3.1."; "E3.1 (forge:software-architect): ADR 0020 e plano."; "E3.2 (forge:ux-designer): CAs na especificação."; "E1.2/E2.2 (forge:tech-lead): code review do back da fase 2 e separação em 3 branches por nível (estratégicas, táticas, operacionais), uma por PR."; "E1.3/E2.3 (forge:security-engineer): review de segurança (gatilho: dados pessoais no O22, O26, E8 e T14)."; "E9.2 (dono): merge na main."
- Fora do escopo: corrigir código (bug volta ao autor); o PR e a promoção para a homolog (pedido 023); o E7 sem R$ (pedido 024).

## Decisões e restrições
- Decisões do usuário (pedido 011) que este lote exercita: D-5' = B; E1 do O26 com Q-a = 1 passagem e Q-b = conta; R-1 = B de 2026-10-16; R-2 = B; R-2' = A e P-1 = A; O19-pct = B; O20-destaque = A; O25(b) = B; D2 = A (pedido 024, não deste lote); métricas por nível em lotes separados, nesta ordem.
- Regras invioláveis do `CLAUDE.md`: abaixo de 20 itens, sem estatística; nada de pessoa na saída; sem comparação entre times; cálculo pela biblioteca (ADR 0011); mudança de critério registrada com data (T2.6). ADR 0020, ADR 0003.
- R-QA: o parecer do QA é gravado pelo QA, com Write.
- NÃO tocar: código de produção, `web/`, `.github/`, a `main`, o diretório principal, as outras branches (inclusive a `feature/011-fase2-operacionais` antiga), e os pareceres de review e de segurança. Sem `--no-verify`.
- Teto: no máximo 3 agentes e uma tarefa pesada por vez (pedido do usuário): `pronto` uma vez.

## Pronto quando
- PQ-1 (push): commit do parecer do QA (e do teste, se houver) em `feature/011-fase2-operacionais-v2` no origin.
- PQ-2 (cmd): `pnpm run pronto` na branch do lote, da raiz da worktree · espera: rc=0
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-011-fase2 status --short -- server packages docs/qa` · espera: linhas=0

## Relatório
Até 8 linhas: estado (aprovado, aprovado com ressalvas ou reprovado); o que precisa do usuário; suposições (com a base); o que foi feito, com evidência (saída do `forge-check pr`); riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.
