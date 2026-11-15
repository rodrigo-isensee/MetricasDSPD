---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-s1-registro-posterior
commit: 085b5f0b75b98bfe248c6422ead173d27b38d6d5
parecer: aprovado
resultado: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-15
---
# QA: texto de registro posterior em linguagem simples (E3.51)

Só texto, sem cálculo, sem UX nova. Obrigações nomeadas (decisões do dono, 15/11): CA-1 "registro posterior" = chamado aberto depois do atendimento; CA-2 o texto diz que o Acelerato não traz essa marca; CA-3 o MTTR do S1 diz "pendente ou em validação" conforme o cálculo; CA-4 nenhum teste ou e2e afirma o termo antigo.

## Achados

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| CA-1 e CA-2 no S1 (nota, rodapé e singular/plural) | web/src/features/sustentacao/ramos.test.tsx (s1-excecoes, "1 chamado registrado depois do atendimento"); sustentacao.test.tsx | singular x plural | passou (CI) |
| CA-1 e CA-2 no S2 e na nota da API | e2e/tests-api/sem-zero-ajuste-069-l9a.spec.ts (Q69A-02, NOTA_S2 igual a origem.ts) | texto do teste = texto do contrato | passou (CI) |
| CA-1 e CA-2 no S12 (cartão e nota fixa) | web/src/features/complementares/leitura-s12.test.ts; ramos.test.tsx (campo sem fonte nunca 0%) | sem fonte x taxa | passou (CI) |
| CA-3 MTTR "pendente ou em validação" | conferido no cálculo: ETAPAS_PAUSA = Pendente e Aguardando validação (packages/metricas/src/acelerato/totalizadores.ts:50) | n/a | conferido |
| CA-4 termo antigo | grep em web/src, e2e, server/tests, packages/contratos | n/a | nenhuma asserção com o termo antigo |

## Conferências
- Diff 157b50e0..f78a493b: 12 arquivos, só texto (strings, testes ajustados, CHANGELOG); nenhuma linha de cálculo.
- Grep do termo antigo ("registro posterior", "exceção de SLA", "com exceção"): sobram só comentários de código e nomes de teste (sustentacao.tsx:318, origem.ts:53, schemas.ts:1238, criterios.ts:173/178, s12.ts, indice.ts), nenhum afirmado em expect. Fora do que o usuário vê, exceto a observação abaixo.
- Observação (não bloqueia): packages/metricas/src/core/criterios.ts:178 é texto de registro de mudança de critério (histórico datado) e mantém "exceção de SLA por registro posterior"; reescrever o histórico seria alterar registro, então fica.
- CI do head de código: run 43755872923, success, sha f78a493b (o 67638c15 só acrescenta o parecer de review). Suíte não rerrodada local.
- Vermelho antes do verde e mutação: não se aplicam (texto, sem regra nova; os testes ajustados falham contra o texto antigo por afirmarem o novo).

## Revalidação (085b5f0b, E3.55)
- Delta f78a493b..085b5f0b: só texto (frase única no S1, S2, S12 e visão; "apuração" virou "cálculo"; "sem dado (hoje essa marca não vem do Acelerato)"; REALIZADO_NO_PRAZO virou "chamados fechados dentro do prazo ÷ chamados fechados"). Nenhuma linha de cálculo.
- Testes ajustados cobrem as frases novas: sustentacao/ramos.test.tsx (/^1 chamado aberto depois do atendimento/), sustentacao.test.tsx (nota e plural), complementares/leitura-s12.test.ts e complementares/ramos.test.tsx ("sem dado (hoje essa marca não vem do Acelerato)"), e2e/tests-api/sem-zero-ajuste-069-l9a.spec.ts (NOTA_S2 igual a origem.ts), e2e/tests/complementares.spec.ts.
- Grep em e2e, web/src e packages/contratos/src por "registrados depois", "registro posterior" e "campo sem fonte" do S12: nenhum teste ou e2e com o texto antigo. Sobra "Campo sem fonte" como estado da reincidência (comuns.tsx, estados.test.tsx), fora desta mudança.
- CI: run 43758213004, success, sha 4e263044 (só pareceres de review e UX sobre 085b5f0b; diff confere: 2 arquivos em docs). Jobs testes, build, openapi, banco, seguranca success; o run do próprio 085b5f0b foi cancelado por push seguinte. Suíte não rerrodada local.
- Vermelho antes do verde e mutação: não se aplicam (texto, sem regra nova). Sem bug novo; parecer mantido: aprovado.
