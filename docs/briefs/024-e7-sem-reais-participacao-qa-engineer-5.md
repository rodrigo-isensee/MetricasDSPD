Agente destino: forge:qa-engineer
Pedido: docs/pedidos/024-e7-sem-reais-participacao.md
Branch: feature/024-e7-sem-reais   Base: develop   Base-sha: d83024ba35763c0b56bebf8184cdbdf1d8da26e0

## Objetivo
Fechar o QA do pedido 024 (R-QA) com o parecer, agora que as lacunas G1 a G3 têm teste (8a4a5a76156c85bbd57dbed9bb1318cde3de453e), a formatação do G3 foi corrigida (b390b0c7d88bc30d4e0749a801710b009fcd48a3, bug 024-001) e a rodada 5 do review aprovou (`docs/reviews/024-e7-sem-reais.md`, `commit: b390b0c`). Etapa E1.3 do pedido 024, cartão K-114. Worktree `/home/rodrigoisensee/MetricasDSPD-024`, branch `feature/024-e7-sem-reais` (desde b390b0c só o parecer de review muda).

## Ler
- O seu relatório anterior, resumido aqui: critérios E1, E3, E4 e E5 cobertos por teste, inclusive G1 a G3; bug 024-001 corrigido; nenhum outro bug.
- `docs/reviews/024-e7-sem-reais.md`, "Rodada 5"; o registro `docs/qa/bugs/024-001-e8-test-fora-do-prettier.md` (a frase "git diff -w vazio" é imprecisa, porque o -w não ignora quebra de linha: registre a correção no parecer, como ressalva baixa, sem novo commit no registro).
- `gh run list --branch feature/024-e7-sem-reais` (a CI do push).

## Entregar
- (E1, E3, E4, E5) Esperar a CI do push no head b390b0c7d88bc30d4e0749a801710b009fcd48a3 ou posterior terminar (rapida, testes, banco, e2e); check vermelho por ruído só se rerroda uma vez; vermelho de verdade vira bug com passos para reproduzir.
- (E1, E3, E4, E5) Parecer em `docs/qa/024-e7-sem-reais.md` (`pedido: 024-e7-sem-reais`, `commit:` no sha curto do head testado pela CI, `parecer:`, a tabela critério × teste, bugs por severidade com o 024-001 corrigido, o link do run da CI como prova da suíte), gravado com a ferramenta Write ou Edit (registro de autoria); commit só do parecer e push sem `--force`; rodar `forge-check pr 024-e7-sem-reais --ref feature/024-e7-sem-reais --base develop` na worktree e copiar a saída.

## Fora do escopo
- "E1.7 (forge:qa-engineer): testes das lacunas G1 a G3 achadas no QA (nome do E7 no catálogo, no cartão e na tela; VERSAO_CRITERIO_E7_SEM_REAIS nos critérios do E7; E8 sem efeito do período), num commit só de testes, antes da rodada 4 do review" · já feita.
- "E1.10 (forge:tech-lead): rodada 5 do review, só sobre a correção de formatação do E1.9" e "E1.2 (forge:tech-lead): review." · já feitas.
- "E2.1 (forge:software-architect): plano §2 E7 e ADR." e "E2.2 (forge:ux-designer): CA do E7 na especificação." · já feitas.
- Escrever teste novo; mudar código; o PR; a promoção para a homolog; o quadro (`KANBAN.md`), que é do Jarvis.

## Decisões e restrições
- DECISÃO DO DONO (pedido 021, 2026-10-17): o E7 passa a se chamar "Entregas por sistema" (opção A).
- Decisão do usuário D2 = A (pedido 011): E7 sem R$, participação percentual por entregas, mínimo de 20 entregas por sistema.
- Regras invioláveis do `CLAUDE.md`: abaixo de 20 itens não se publica estatística; mudança de critério registrada com data (T2.6).
- R-MAIN: nada na `main`. R-VERIFY: sem `--no-verify` nem `--force`; commit enviado não se emenda. R-CONFORMIDADE: bloqueio não se contorna; vira relato.
- NÃO tocar: código, testes, `docs/reviews/`, `docs/ux/`, `.github/`, o diretório principal, a worktree `-011-fase2`.
- Teto: 2 agentes de dia, uma tarefa pesada por vez (restrição do usuário de 2026-10-17, pedido 024, "Restrições do usuário"): sem `pronto` nem E2E local; a CI do push é a prova da suíte.

## Pronto quando
- PQ-1 (run): run da CI do push no head b390b0c7d88bc30d4e0749a801710b009fcd48a3 ou posterior com conclusão `success`.
- PQ-2 (sha): commit `docs(qa)` com só `docs/qa/024-e7-sem-reais.md`.
- PQ-3 (cmd): `grep -c '^parecer: aprovado' /home/rodrigoisensee/MetricasDSPD-024/docs/qa/024-e7-sem-reais.md` · espera: igual '1'
- PQ-4 (push): `git -C /home/rodrigoisensee/MetricasDSPD-024 ls-remote origin refs/heads/feature/024-e7-sem-reais` igual ao head local.

## Relatório
Até 8 linhas: estado; o que precisa do usuário; suposições (com a base); o que foi feito, com evidência (link do run, sha, saída do `forge-check pr`); riscos e bugs. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.
