Agente destino: forge:devops-engineer
Pedido: docs/pedidos/037-pr-131-release-com-falhas.md
Branch: homolog   Base: main   Base-sha: 9180c7e098bff8a2eb7c62b35f2210387735d2c3

## Objetivo
Rodar de novo, na CI, os jobs que falharam no portão de homologação do PR #131 (homolog → main, head a92807b00e45c51f0121c838c5ddc5a20cca7020) e depois o `homolog-aprovada`, para separar instabilidade de regressão (etapa E1.4 do pedido 037). Decisão do dono: opção A.

## Ler
- `docs/pedidos/037-pr-131-release-com-falhas.md`, seções Diagnóstico e Decisões.
- `gh pr checks 131`.

## Entregar
- (E1) Esperar o run 39521744106 (workflow "Homologação") terminar (`gh run watch 39521744106 --exit-status` ou consultas espaçadas) e rodar de novo só os jobs que falharam: `gh run rerun 39521744106 --failed`. Esperar terminar.
- (E1) Depois, rodar de novo o run 39521767390 ("Homologação aprovada"): `gh run rerun 39521767390`. Esperar terminar.
- (E1) Relatar o resultado de cada job que falhou antes (`qualidade`, `perf-homolog`, `e2e-homolog` se falhar, `homolog-aprovada`) e, se algum falhar de novo, o trecho do log com o teste e o valor (ex.: C6 em ms, nome do teste do vitest).

## Fora do escopo
- "E1.2 (forge:qa-engineer): reproduzir localmente o T5 e o C6 no head da homolog." · etapa de outro papel.
- "E1.3 (forge:dono): mesclar o #131 na main quando o portão ficar verde." · etapa do dono.
- "E1.1 (dono): autorizar ou não rodar de novo os jobs que falharam (custo de minutos do Actions). Feito: opção A." · etapa do dono, cumprida.
- Commit, push, mudar workflow, mexer no #131, mesclar qualquer PR; rodar de novo mais de uma vez cada run (custo); mudar o limite da ADR 0003 ou desligar check.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-20): rodar de novo os jobs que falharam no #131, opção A ("A"), com o custo de minutos do Actions.
- ADR 0003 (citada no pedido): limite C6 de 200 ms e F2 de CLS < 0,1; não muda, só se mede contra ele.
- R-MAIN: nada na `main`. R-CUSTO: só a rodada autorizada (uma por run). R-CONFORMIDADE: bloqueio não se contorna; vira relato.

## Pronto quando
- PQ-1 (run): `gh run view 39521744106 --json conclusion -q .conclusion` · espera: a conclusão da nova tentativa (success ou failure), copiada.
- PQ-2 (run): `gh run view 39521767390 --json conclusion -q .conclusion` · espera: a conclusão da nova tentativa, copiada.
- PQ-3 (cmd): `gh run view 39521744106 --json attempt -q .attempt` · espera: igual '2'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
