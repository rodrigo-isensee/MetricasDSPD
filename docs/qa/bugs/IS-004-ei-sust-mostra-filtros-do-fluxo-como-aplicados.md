# IS-004 - EI-SUST (Acelerato) mostra os filtros do fluxo (BusinessMap) como "aplicados" e sugere removê-los
- Severidade: média (informação errada sobre o recorte de uma métrica e mistura visual das duas fontes; o número em si não muda)
- Responsável sugerido: react-frontend (`web/src/features/espera-invisivel/EsperaInvisivelPage.tsx`, `CartaoEISust` dentro do contexto de painel do fluxo)
- Ambiente: main 0af552a, build de produção (`vite preview`), Chromium do Playwright 1.64, 1280x800
- Regra afetada: "BusinessMap e Acelerato nunca se misturam" (CLAUDE.md) e EI-05 do plano B3 (o bloco da Sustentação não herda filtro de fluxo)

## Passos para reproduzir
1. Abrir `/espera-invisivel?periodo=4s&tipo=divida-tecnica&sistema=protheus` (filtros do fluxo).
2. Rolar até o bloco "Sustentação (Acelerato)", cartão EI-SUST, aba P1 (amostra insuficiente).

## Resultado esperado
O EI-SUST usa só os filtros da Sustentação (`sust_*`, período padrão 6 meses): o rodapé mostra apenas esses filtros, e as sugestões "Para chegar a 20, tente" citam só filtros que afetam o cartão.

## Resultado obtido
- Os números do EI-SUST não mudam (correto: o cálculo não herda o filtro do fluxo; verificado no mesmo teste).
- Mas o rodapé do cartão diz `Filtros aplicados: Tipo de demanda Dívida técnica · Sistema Protheus · Período Últimas 4 semanas`, filtros do BusinessMap que não se aplicam ao Acelerato, e um período que não é o do cartão (o EI-SUST está em 6 meses).
- O aviso de amostra insuficiente da P1 sugere `Remover filtro Tipo de demanda`, `Remover filtro Sistema` e `Remover filtro Período`: botões que mexem nos filtros do fluxo e não ajudam a P1 a chegar a 20.

Causa provável: `CartaoEISust` é renderizado dentro do `PainelFluxo` e o rodapé (`ChipFiltros`) e o `AmostraInsuficiente` leem `useContextoPainel()` do painel do fluxo, não o contexto dos filtros `sust_`.

## Evidência
Teste `SIS-INV-03` em `e2e/tests/intensivo-sistemico.spec.ts`; `error-context.md` da execução (trecho):
```
- generic: "Fonte: Acelerato"
- generic: "Granularidade: chamado"
- generic: "Filtros aplicados: Tipo de demanda Dívida técnica · Sistema Protheus · Período Últimas 4 semanas"
...
- generic: "Para chegar a 20, tente:"
- button "Remover filtro Tipo de demanda"
- button "Remover filtro Sistema"
- button "Remover filtro Período"
```
