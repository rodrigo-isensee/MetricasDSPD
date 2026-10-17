Agente destino: forge:qa-engineer
Pedido: docs/pedidos/024-e7-sem-reais-participacao.md
Branch: feature/024-e7-sem-reais   Base: develop   Base-sha: d83024ba35763c0b56bebf8184cdbdf1d8da26e0

## Objetivo
QA do pedido 024 (R-QA), depois da rodada 3 do review aprovada (`docs/reviews/024-e7-sem-reais.md`, `commit: d0fcb7b`): E7 sem R$ com participação percentual por entregas, E8 e E9 com a janela do cálculo, `concluidoEm` no E6 e o nome "Entregas por sistema". Etapa E1.3 do pedido 024, cartão K-114. Worktree `/home/rodrigoisensee/MetricasDSPD-024`, branch `feature/024-e7-sem-reais` (head 928dba1ef8187e0570557c25d44aa7849fca9087, no remoto; desde d0fcb7bd88a6bf773d49ccb451294872fa2486e7 só o parecer de review mudou).

## Ler
- `docs/pedidos/024-e7-sem-reais-participacao.md` (Escopo E1 a E5 e Decisões).
- `docs/reviews/024-e7-sem-reais.md` (rodadas 2 e 3).
- Os testes que cobrem o pedido: `packages/metricas/src/businessmap/e7.test.ts`, `packages/metricas/src/fase2.regras.test.ts`, `packages/contratos` (testes do E6, E7, E8, E9), `web/src/features/complementares/estrategicas.test.tsx` e os E2E do Estratégico em `e2e/`.
- `gh run list --branch feature/024-e7-sem-reais` (a CI do push).

## Entregar
- (E1, E3, E4, E5) Conferir, critério por critério, que há teste para: nenhum valor em R$ nem campo de custo no E7 (saída da API e tela); participação só com 20 ou mais entregas por sistema, "k de n" abaixo; registro da mudança de critério com data (T2.6); E8 e E9 sem o período como filtro que atua; `concluidoEm` em cada projeto do E6; o nome "Entregas por sistema" na tela e no catálogo. Lacuna de teste: liste e pare antes do parecer (não escreva teste novo nesta etapa; o Jarvis decide o caminho, para não invalidar o review).
- (E1, E3, E4, E5) Esperar a CI do push no head d0fcb7bd88a6bf773d49ccb451294872fa2486e7 ou posterior terminar (testes, rapida, banco, e2e); check vermelho por ruído só se rerroda uma vez; vermelho de verdade vira bug com passos para reproduzir.
- (E1, E3, E4, E5) Parecer em `docs/qa/024-e7-sem-reais.md` (`pedido: 024-e7-sem-reais`, `commit:` no sha curto do head testado, `parecer:`, bugs por severidade, o link do run da CI como prova da suíte), gravado com a ferramenta Write ou Edit (registro de autoria); commit só do parecer e push sem `--force`; rodar `forge-check pr 024-e7-sem-reais --ref feature/024-e7-sem-reais --base develop` na worktree e copiar a saída.

## Fora do escopo
- "E1.2 (forge:tech-lead): review." · já feita (rodada 3 aprovada).
- "E1.4 (forge:react-frontend): ajustar o teste do front que lê `custoConfigurado` e os testes que citam o título do E7 (E5), depois de trazer a develop com o #108", "E1.6 (forge:node-backend): concluir o merge da develop na branch, resolvendo os 5 conflitos" e "E5.1 (forge:node-backend): nome "Entregas por sistema" no cartão do E7 (`packages/contratos`), contratos e documentação gerada, depois do E1.6." · já feitas.
- "E2.1 (forge:software-architect): plano §2 E7 e ADR.", "E2.2 (forge:ux-designer): CA do E7 na especificação.", "E5.2 (forge:ux-designer): nome novo na especificação do 011 (§5 E7) e na revisão de UX.", "E3.1 (forge:node-backend): contrato do E8 e do E9 alinhado à janela do cálculo." e "E4.1 (forge:node-backend): `concluidoEm` no contrato do E6." · já feitas.
- Corrigir código ou testes; o PR; a promoção para a homolog; o quadro (`KANBAN.md`), que é do Jarvis.

## Decisões e restrições
- DECISÃO DO DONO (pedido 021, 2026-10-17): o E7 passa a se chamar "Entregas por sistema" (opção A).
- Decisão do usuário D2 = A (pedido 011): E7 sem R$, participação percentual por entregas, mínimo de 20 entregas por sistema; regra 7.1 do briefing (horas apontadas não entram).
- Regras invioláveis do `CLAUDE.md`: abaixo de 20 itens não se publica estatística; todo cálculo pela biblioteca compartilhada; mudança de critério registrada com data (T2.6).
- R-MAIN: nada na `main`. R-VERIFY: sem `--no-verify` nem `--force`. R-CONFORMIDADE: bloqueio não se contorna; vira relato.
- NÃO tocar: código, testes, `docs/reviews/`, `docs/ux/`, `.github/`, o diretório principal, a worktree `-011-fase2`.
- Teto: 2 agentes de dia, uma tarefa pesada por vez (restrição do usuário de 2026-10-17, pedido 024, "Restrições do usuário"): sem `pronto` nem E2E local; a CI do push é a prova da suíte.

## Pronto quando
- PQ-1 (run): run da CI do push no head d0fcb7bd88a6bf773d49ccb451294872fa2486e7 ou posterior com conclusão `success`.
- PQ-2 (sha): commit `docs(qa)` com só `docs/qa/024-e7-sem-reais.md`.
- PQ-3 (cmd): `grep -c '^parecer: aprovado' /home/rodrigoisensee/MetricasDSPD-024/docs/qa/024-e7-sem-reais.md` · espera: igual '1'
- PQ-4 (push): `git -C /home/rodrigoisensee/MetricasDSPD-024 ls-remote origin refs/heads/feature/024-e7-sem-reais` igual ao head local.

## Relatório
Até 8 linhas: estado; o que precisa do usuário; suposições (com a base); o que foi feito, com evidência (critério × teste, link do run, sha, saída do `forge-check pr`); riscos e bugs. Lacuna de teste ou bug: PQ-3 fica "não cumprido" com a lista. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.
