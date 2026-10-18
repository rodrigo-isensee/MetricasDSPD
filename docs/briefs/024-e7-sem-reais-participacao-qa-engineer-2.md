Agente destino: forge:qa-engineer
Pedido: docs/pedidos/024-e7-sem-reais-participacao.md
Branch: feature/024-e7-sem-reais   Base: develop   Base-sha: d83024ba35763c0b56bebf8184cdbdf1d8da26e0

## Objetivo
Cobrir com testes as 3 lacunas que você achou no QA do pedido 024 (G1, G2, G3), num commit só de testes, para a rodada 4 do review e depois o seu parecer. Decisão técnica do time (pedido 024, 2026-10-17): opção (a), o próprio QA escreve. Etapa E1.7 do pedido 024, cartão K-114. Worktree `/home/rodrigoisensee/MetricasDSPD-024`, branch `feature/024-e7-sem-reais` (head 928dba1ef8187e0570557c25d44aa7849fca9087, no remoto).

## Ler
- `docs/pedidos/024-e7-sem-reais-participacao.md`, seções "Etapas" e "Decisões técnicas do time" (a última linha).
- `web/src/content/catalogo-metricas.ts` (linha 534), `packages/contratos/src/cartoes.ts` (linha 251), `web/src/features/complementares/estrategicas.test.tsx` (bloco do E7), `packages/metricas/src/core/criterios.ts` (`VERSAO_CRITERIO_E7_SEM_REAIS` e `VERSOES_DA_BIBLIOTECA`), `packages/metricas/src/businessmap/e7.test.ts`, `packages/metricas/src/businessmap/e8.test.ts` e `e9.test.ts` (o teste de período do E9, como modelo).

## Entregar
- (E5) G1: teste que afirma o nome "Entregas por sistema" do E7 no cartão de `packages/contratos` (teste do pacote) e no catálogo e no título do cartão na tela (teste do web); o teste falha se o nome antigo voltar.
- (E1) G2: teste em `packages/metricas` que afirma que `VERSAO_CRITERIO_E7_SEM_REAIS` (data 2026-10-17, afeta o E7) está em `VERSOES_DA_BIBLIOTECA` e aparece nos critérios da série e da janela do E7 calculado com a biblioteca real (não com critérios fictícios).
- (E3) G3: teste de comportamento em `e8.test.ts` que mostra que variar o período não muda o resultado do E8, no mesmo molde do teste do E9.
- (E1, E3, E5) Rodar `pnpm --filter @metricas-dspd/metricas test`, `pnpm --filter @metricas-dspd/contratos test` e `pnpm --filter @metricas-dspd/web test` da raiz da worktree; um commit `test(...)` só com arquivos de teste (`git add` por caminho) e push sem `--force`. Teste que falhar por defeito do código: não corrija; relate como bug, com passos.

## Fora do escopo
- "E1.3 (forge:qa-engineer): QA." · o parecer em `docs/qa/` vem depois da rodada 4 do review, por outro brief.
- "E1.8 (forge:tech-lead): rodada 4 do review, só sobre os testes do E1.7" · etapa de outro papel.
- "E1.2 (forge:tech-lead): review.", "E1.4 (forge:react-frontend): ajustar o teste do front que lê `custoConfigurado` e os testes que citam o título do E7 (E5), depois de trazer a develop com o #108", "E1.6 (forge:node-backend): concluir o merge da develop na branch, resolvendo os 5 conflitos" e "E5.1 (forge:node-backend): nome "Entregas por sistema" no cartão do E7 (`packages/contratos`), contratos e documentação gerada, depois do E1.6." · já feitas.
- "E2.1 (forge:software-architect): plano §2 E7 e ADR.", "E2.2 (forge:ux-designer): CA do E7 na especificação.", "E5.2 (forge:ux-designer): nome novo na especificação do 011 (§5 E7) e na revisão de UX.", "E3.1 (forge:node-backend): contrato do E8 e do E9 alinhado à janela do cálculo." e "E4.1 (forge:node-backend): `concluidoEm` no contrato do E6." · já feitas.
- Mudar código de produção, `docs/`, o parecer de QA; E2E novo; o PR; o quadro (`KANBAN.md`), que é do Jarvis.

## Decisões e restrições
- DECISÃO DO DONO (pedido 021, 2026-10-17): o E7 passa a se chamar "Entregas por sistema" (opção A).
- Decisão do usuário D2 = A (pedido 011): E7 sem R$, participação percentual por entregas, mínimo de 20 entregas por sistema.
- Regras invioláveis do `CLAUDE.md`: mudança de critério registrada com data (T2.6); todo cálculo pela biblioteca compartilhada.
- R-MAIN: nada na `main`. R-VERIFY: sem `--no-verify` nem `--force`; commit enviado não se emenda (corrija com commit novo). R-CONFORMIDADE: bloqueio não se contorna; vira relato.
- NÃO tocar: código de produção, `docs/`, `.github/`, o diretório principal, a worktree `-011-fase2`.
- Teto: 2 agentes de dia, uma tarefa pesada por vez (restrição do usuário de 2026-10-17, pedido 024, "Restrições do usuário"): só os testes de pacote e do web; sem `pronto` nem E2E local.

## Pronto quando
- PQ-1 (sha): commit `test(...)` na branch, só com arquivos de teste (`*.test.ts`, `*.test.tsx`).
- PQ-2 (cmd): `grep -rln 'Entregas por sistema' /home/rodrigoisensee/MetricasDSPD-024/packages/contratos/src /home/rodrigoisensee/MetricasDSPD-024/web/src --include=*.test.ts --include=*.test.tsx` · espera: linhas>=2
- PQ-3 (cmd): `grep -rl 'VERSAO_CRITERIO_E7_SEM_REAIS' /home/rodrigoisensee/MetricasDSPD-024/packages/metricas/src --include=*.test.ts` · espera: linhas>=1
- PQ-4 (push): `git -C /home/rodrigoisensee/MetricasDSPD-024 ls-remote origin refs/heads/feature/024-e7-sem-reais` igual ao head local.

## Relatório
Até 8 linhas: estado; o que precisa do usuário; suposições (com a base); o que foi feito, com evidência (sha, testes por lacuna, resultado das três suítes); riscos e bugs. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.
