# Pedido 051: operacionais-separadas

- **Modo:** implementar
- **Objetivo:** "preciso quevoce separe tudo que tem das operacionais, para fazer.."
- **Clareza:** 7 confirmado, 0 suposição, 2 técnico; recibo aceito
- **Depende de:** nenhum

## Escopo
- E1. K-180, página de contrato da O23 (`docs/contratos/metricas/O23.md`): review aprovado na `feature/048-ajustes-back` (worktree 048c); falta o QA e o PR, sem esperar o K-129 · `confirmado`
- E2. K-093, primeira consulta lenta da sustentação no operacional: a análise concluiu que não precisa de código; fecha com o E1 · `confirmado`
- E3. K-173, teste da O20 que lê o SVG de forma síncrona (`operacionais.test.tsx:177`): correção só de teste, branch própria · `confirmado` · Retira do escopo original: o teste da O20 já foi corrigido no #152 (172d008); o K-173 é a regra de lint com dependência nova, não operacional; volta ao quadro (decisão do dono 2026-10-29, K-173 = A)
- E5. Página de contrato da O23 sem lacunas: as decisões U-11 = A e parado e bloqueado = A viram regra escrita em `docs/contratos/metricas/O23.md`, com os achados recomendados A1 a A3 do review (048-ajustes-back) · `confirmado`
- E4. Levar as operacionais O19 a O26 (PR #152, já na `develop`) até a `main` pela release do pedido 050 · `confirmado`

## Etapas
- E1.1 (qa-engineer): parecer de QA do K-180 e do K-093 na `feature/048-ajustes-back`; dispensado: diff só de documentação, isento de QA pelo `forge-check` (R-QA); o review aprovado (45991e4) vale.
- E1.2 (tech-lead): PR da `feature/048-ajustes-back` para a `develop` (squash) e merge com os checks verdes.
- E5.1 (tech-lead): worktree `/home/rodrigoisensee/MetricasDSPD-051` e branch `docs/051-o23-regras` a partir da `develop` depois do merge do K-180.
- E5.2 (node-backend): atualizar `docs/contratos/metricas/O23.md` (E5), commit e push.
- E5.3 (tech-lead): code review do E5.2, PR para a `develop` e merge (só documentação, isento de QA).
- E3.1 (tech-lead): worktree e branch do K-173 a partir da `develop`. Cancelada: K-173 = A (2026-10-29).
- E3.2 (react-frontend): correção do teste da O20 (K-173). Cancelada: K-173 = A (2026-10-29).
- E3.3 (tech-lead): code review do K-173, PR e merge. Cancelada: K-173 = A (2026-10-29).
- E3.4 (qa-engineer): parecer de QA do K-173. Cancelada: K-173 = A (2026-10-29).

## Fora do escopo
- K-129 (meses de pico da T11): é tática, não operacional; sai da `feature/048-ajustes-back` e vai para uma branch própria no pedido 048 · `confirmado`
- Integração com dados reais do BusinessMap nas operacionais: fica por último (decisão do dono de 2026-10-28, pedido 048) · `confirmado`

## Suposições
- "Separar" = tirar do pedido 048 o que é das operacionais e fazer num pedido e em PRs próprios, antes do resto do 048 · `suposição` · base: leitura da frase do dono

## Critério de pronto
- PQ-1 K-180 e K-093 mesclados na `develop` · prova: merge · `técnico`
- PQ-2 K-173 mesclado na `develop` · prova: merge · `técnico` · Retira do escopo original: cai com o E3 (decisão do dono 2026-10-29, K-173 = A)

## Decisões do usuário (registro literal)
DECISÃO DO DONO (2026-10-29): "preciso quevoce separe tudo que tem das operacionais, para fazer.."
DECISÃO DO DONO (2026-10-29): recibo do 051 aceito ("isso preciso terminar tudo do operacional"): E1 a E4 entram; K-129 e dados reais ficam fora; a mensagem "seria um so de 380" foi retirada pelo dono ("ignore a ultima mensagem").
DECISÃO DO DONO (2026-10-29): K-173, opção A ("A"): o K-173 (lint contra leitura síncrona de DOM, dependência nova) sai do 051 e volta ao quadro; as etapas E3.1 a E3.4 caem.
DECISÃO DO DONO (2026-10-29): U-11 da O23, opção A ("A"): "parado há mais de uma semana" na O23 = mais de 5 dias úteis; o código fica como está e a lacuna sai da página de contrato.
DECISÃO DO DONO (2026-10-29): O23 parado e bloqueado, opção A ("A"): item parado que está bloqueado conta como parado (como o código faz hoje); a regra passa a ser escrita no contrato, e o motivo do bloqueio segue na lista.
DECISÃO DO DONO (2026-10-29): "foquet odo poder computacional em terminar os operacionais": o 051 e a release 050 (que leva as operacionais à main) têm prioridade sobre o resto do 048, que espera.

## Histórico
- 2026-10-29 10:20: recibo aceito pelo dono; K-129 sai da feature/048-ajustes-back (DECISÃO TÉCNICA: entra numa branch própria no 048), e a 048c segue só com K-180 e K-093 para o QA e o PR.
- 2026-10-29 10:21: DECISÃO TÉCNICA do Jarvis: E1.1 dispensado (forge-check: "isento de QA: diff só de .md"); segue o E1.2. Foco do dono registrado: o 051 e o 050 primeiro.
- 2026-10-29 10:24: correção do Jarvis: o teste da O20 já foi corrigido no #152 (172d008, waitFor); o K-173 é a regra de lint contra leitura síncrona de DOM (eslint-plugin-testing-library, dependência nova, MELHORIA 1 da retro do 026), não correção de teste. PERGUNTA ao dono: o K-173 fica no 051 ou volta ao quadro. Brief tech-lead-18 (PR do K-180) no conferente; o E1.0 do 050 sai depois do merge do K-180, para a release levar a O23.
- 2026-10-29 10:26: K-173 = A registrado (sai do 051). Pergunta 2 de 3 ao dono: U-11 da O23.
- 2026-10-29 10:30: U-11 = A registrado. Pergunta 3 de 3 ao dono: item parado e bloqueado na O23.
- 2026-10-29 10:34: parado e bloqueado = A registrado; perguntas da fila zeradas. DECISÃO TÉCNICA do Jarvis: E5 (O23 sem lacunas, com A1 a A3) em branch própria depois do merge do K-180; a release 050 espera o E5 para levar a O23 completa.
- 2026-10-29 11:00: E1.2 entregue: PR #163 mesclado na develop (squash 739bdbf), parecer revalidado em 1110508; merge registrado pela conta do dono às 10:43 antes do comando do tech-lead (mecanismo não confirmado). Brief tech-lead-1 (E5.1) enviado ao conferente.
- 2026-10-29 11:03: E5.1 entregue (worktree MetricasDSPD-051 e branch docs/051-o23-regras em 739bdbf, no origin); conferência: não cumpriu só pelo intervalo vazio da etapa codigo (worktree sem commit, por desenho), PQ cumpridos; DECISÃO TÉCNICA do Jarvis: aceita no mérito. PQ-2 do K-173 marcado como retirado. Brief node-backend-1 (E5.2) no conferente.
- 2026-10-29 11:05: entrega conferida 38bbb9474f43b8cebf1bb770d01d656630937937
- 2026-10-29 11:05: E5.2 (node-backend-1) cumpriu na conferência: O23 sem lacunas, U-11 e parado e bloqueado escritos, A1 a A3 corrigidos. Brief tech-lead-2 (E5.3) no conferente.
- 2026-10-29 11:28: E5.3 entregue: review aprovado (docs/reviews/051-o23-regras.md, 09eefe4), PR #164 mesclado na develop às 11:26 depois dos checks verdes às 11:23 (squash 311691b); entrega no conferente. MELHORIA (Forge): o hook parecer.py recusou gh pr merge por timeout de 3 s e o merge aconteceu mesmo assim (falha aberta); provável causa do merge do #163 antes dos checks.
- 2026-10-29 11:34: entrega conferida 09eefe499c9d14a657a962a3c6fa2c9c14969335
- 2026-10-29 11:34: E5.3 cumpriu na conferência (rodada 2): PR #164 mesclado (311691b), checks verdes antes do merge; E5 concluído; K-180 em Pronto. Resta do 051 só a retrospectiva; a ida à main segue no pedido 050.

## Registro de clareza
PERGUNTA: recibo do 051 enviado ao dono; resposta "isso preciso terminar tudo do operacional"
NAO-ENTENDI: "separe tudo que tem das operacionais": separar em pedido próprio para fazer já (leitura adotada) ou só listar
PERGUNTA: K-173 (lint, dependência nova) fica no 051 ou volta ao quadro; fila depois: U-11 da O23 (5 dias úteis = uma semana) e item parado e bloqueado na O23
