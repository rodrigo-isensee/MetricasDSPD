## Objetivo
Regravar com a ferramenta Write o parecer de review do lote 1 que você revalidou em 82660ae: a edição foi feita por script python, e o `forge-check pr 011-fase2-estrategicas` acusa "autoria: sem registro de que o papel `tech-lead` gravou esta versão" (R-REVIEW). O brief anterior pedia Write. O conteúdo não muda. Worktree `/home/rodrigoisensee/MetricasDSPD-011-estrategicas`, branch `feature/011-fase2-estrategicas`, HEAD 82660ae.

## Ler
- Na branch: `docs/reviews/011-fase2-estrategicas.md`.

## Entregar
- (E1, E2) Ler o parecer e regravá-lo com a ferramenta Write, com o mesmo conteúdo; commit, `git add` por caminho, e push; rodar `forge-check pr 011-fase2-estrategicas --ref feature/011-fase2-estrategicas --base origin/develop` de dentro da worktree e copiar a saída (o aviso do QA pode continuar; o do review tem de sumir).
- (E1, E2) A separação em 3 branches e os reviews dos lotes 2 e 3 já foram entregues (ace8db8 e aab7a46): só confirme, com `git ls-remote origin`, que as duas branches continuam nesses commits, e relate.
- Fora do escopo, outras etapas do pedido 011 (citadas de "### Etapas"; E1.1, E2.1, E3.1 e E1.3/E2.3 já feitas): "E1.1 (forge:node-backend): implementar E1 na worktree `-011-fase2`, branch `feature/011-fase2-back`."; "E2.1 (forge:node-backend): implementar E2 depois de E3.1."; "E3.1 (forge:software-architect): ADR 0020 e plano."; "E1.3/E2.3 (forge:security-engineer): review de segurança (gatilho: dados pessoais no O22, O26, E8 e T14)."; "E1.4/E2.4 (forge:qa-engineer): QA do back da fase 2." (a revalidação do QA vem depois desta, na mesma worktree); "E3.2 (forge:ux-designer): CAs na especificação."; "E9.2 (dono): merge na main."
- Fora do escopo: o merge do PR #104 (pedido 020); o front (pedido 021).

## Decisões e restrições
- Decisões do usuário do pedido 011: métricas por nível em lotes separados; "4-seguir".
- R-REVIEW: o parecer de review é gravado pelo tech-lead, com Write (nunca por script, `sed`, `cp` ou `python`).
- NÃO tocar: código, testes, `.github/`, o diretório principal, as outras branches e worktrees. Sem `--no-verify` nem `--force`.

## Pronto quando
- PQ-1 (push): commit da regravação em `feature/011-fase2-estrategicas` no origin.
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-011-estrategicas status --short` · espera: linhas=0

## Relatório
Até 8 linhas: estado; o que precisa do usuário; suposições (com a base); o que foi feito, com evidência (saída do `forge-check pr`); riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.
