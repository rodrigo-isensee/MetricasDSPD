## Objetivo
Regravar o seu parecer do lote 1 com a ferramenta Write, para o `forge-check pr 011-fase2-estrategicas` registrar a autoria do papel `qa` (hoje acusa "autoria: sem registro de que o papel `qa` gravou esta versão", R-QA). É o mesmo problema de autoria já visto no K-077. O conteúdo do parecer não muda. Branch `feature/011-fase2-estrategicas`, commit c656654, worktree `/home/rodrigoisensee/MetricasDSPD-011-fase2`.

## Ler
- Na branch do lote: `docs/qa/011-fase2-estrategicas.md` (o seu parecer, aprovado).

## Entregar
- (E1, E2) Trocar a worktree para `feature/011-fase2-estrategicas`; ler o parecer e regravá-lo com a ferramenta Write, com o mesmo conteúdo (só o `data:` ou uma nota de regravação podem mudar); commit, `git add` por caminho, sem push; rodar `forge-check pr 011-fase2-estrategicas --ref feature/011-fase2-estrategicas --base develop` e copiar a saída; voltar a worktree para `feature/011-fase2-back`.
- Fora do escopo, outras etapas do pedido 011 (citadas de "### Etapas"; E1.1, E2.1, E3.1, E1.2/E2.2 e E1.3/E2.3 já feitas): "E1.1 (forge:node-backend): implementar E1 na worktree `-011-fase2`, branch `feature/011-fase2-back`."; "E2.1 (forge:node-backend): implementar E2 depois de E3.1."; "E3.1 (forge:software-architect): ADR 0020 e plano."; "E1.2/E2.2 (forge:tech-lead): code review do back da fase 2 e separação em 3 branches por nível (estratégicas, táticas, operacionais), uma por PR."; "E1.3/E2.3 (forge:security-engineer): review de segurança (gatilho: dados pessoais no O22, O26, E8 e T14)."; "E3.2 (forge:ux-designer): CAs na especificação."; "E9.2 (dono): merge na main."
- Fora do escopo: o front (pedido 021); o PR (pedido 020).

## Decisões e restrições
- R-QA: o parecer do QA é gravado pelo QA, com Write.
- NÃO tocar: código, testes, `.github/`, a `main`, o diretório principal e as outras branches; os 3 arquivos sem commit em `docs/security/` da worktree (são do security-engineer). Sem `--no-verify`.

## Pronto quando
- PQ-1 (sha): commit da regravação em `feature/011-fase2-estrategicas`.
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-011-fase2 status --short -- docs/qa` · espera: linhas=0

## Relatório
Até 8 linhas: estado; o que precisa do usuário; suposições (com a base); o que foi feito, com evidência (saída do `forge-check pr`); riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.
