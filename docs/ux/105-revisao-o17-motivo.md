# Revisão UX: motivo da causa raiz do O17 (pedido 105, E7.151)

parecer: aprovado com ressalvas de texto (nenhuma crítica, nenhuma alta)
commit: e046134d

Base: decisão do dono de 16/11 (K-372, "Deixa como texto"), ADR 0020. Tudo é `lido` (código e grep); nada `medido`. A suíte inteira fica para o CI do PR; não afirmo CI verde nem citei PQ do autor rodado por mim.

## O texto novo
`packages/contratos/src/origem.ts:82-83`: "A causa raiz do incidente é registrada em texto livre no Acelerato e por isso não é contada."

- Diz o que aconteceu e por quê; voz ativa, PT-BR, sem culpar ninguém, sem a promessa "aguardando" (correto: a decisão é definitiva). Aprovado.
- Renderização (`web/src/components/ui/EstadoSemDadoReal.tsx:18`): "Motivo: " + texto. Os outros motivos são frase minúscula sem ponto (`MOTIVO_AGUARDANDO_CAMPO`, O12). Este começa em maiúscula e termina em ponto. Médio/baixo, consistência: aceitável porque é frase completa, mas diverge do molde. Decisão do autor: manter e registrar a diferença no comentário, ou virar "a causa raiz do incidente é registrada em texto livre no Acelerato e por isso não é contada" sem ponto.
- Baixo, status: o componente mostra o rótulo "Sem dado real", que sugere dado que virá. Com a decisão definitiva, vale avaliar um rótulo como "Não contada" para esta parte. É decisão de produto; não bloqueia.

## O que ainda fala em "Registro de Problemas" e precisa mudar
Código do web (visível ao usuário):
1. `web/src/features/complementares/notas.ts:109` (`comoSeCalcula` do O17): "A causa raiz fica sem dado real até o Registro de Problemas ter vínculo ao incidente..." Mudar para: "Contagem de incidentes encerrados por sistema (dado real do Acelerato). A causa raiz não é contada: no Acelerato ela é registrada em texto livre. Sem mínimo de amostra: é contagem." Alto: contradiz o motivo exibido no mesmo cartão (promete dado futuro).
2. `notas.ts:113` (`cuidados`): "A causa raiz ainda não tem dado real: depende do Registro de Problemas..." Mudar para: "A causa raiz não é contada, porque é texto livre no Acelerato. Por sistema, nunca por pessoa." Alto, mesma razão.
3. `web/src/features/complementares/sustentacao.tsx:71` (`Leia` só quando `porCausa !== null`, caminho de mock/extensão): "A causa raiz vem do Registro de Problemas; a lista de causas é uma proposta do time." Hoje inalcançável com dado real; mudar para texto neutro (ex.: "A lista de causas é uma proposta do time.") ou remover o ramo junto com `porCausa`. Baixo.
4. `web/src/features/complementares/ramos.test.tsx:411` e `:445` e `e2e/tests-api/o17-sistema-qa.spec.ts:75` asseguram a frase do item 3; acompanham a mudança dele.

Documentação e comentários:
5. `docs/contratos/metricas/O17.md:163`: exemplo de `motivoCausaRaiz` com o texto antigo ("aguardando o Registro de Problemas..."). Médio (contrato desatualizado).
6. `docs/api/metricas.md:100`, `docs/architecture/features/metricas-complementares.md:130`: linhas longas com o mesmo assunto; conferir e alinhar.
7. `packages/contratos/src/schemas.ts:1043` (comentário "até o Registro de Problemas ter vínculo"), `packages/metricas/src/core/regras.ts:515` (comentário) e `packages/metricas/src/core/criterios.ts:160` (texto do critério "segue sem dado real até o Registro de Problemas"). O de `criterios.ts` é registro histórico de mudança de critério (T2.6): não reescrever o passado; se a mudança de texto/semântica do cartão contar como mudança de critério, acrescentar nova entrada datada.
8. Docs de UX/QA históricos (`docs/ux/099-revisao-o17-sistema.md`, `docs/qa/099-o17-sistema.md`, `docs/ux/099-o12-textos.md:18`, `docs/analises/099-proc-sla-incidentes.md`): registro datado, não editar; no máximo uma nota de "superado pelo pedido 105".
9. `CHANGELOG.md:92`: entrada antiga, histórica; a de `:10` já está correta.

## Não encontrado
Nenhuma especificação `docs/ux/105-*` do O17 além deste parecer; nada a corrigir ali.

Melhoria vista: nenhuma
