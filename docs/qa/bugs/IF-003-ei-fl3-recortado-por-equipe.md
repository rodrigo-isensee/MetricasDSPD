# IF-003 - EI-FL3 muda com o filtro de equipe, mas a tela diz "Não afetado por: Equipe"
- Severidade: média
- Responsável sugerido: node-backend (biblioteca `packages/metricas`)
- Ambiente: main @ 0af552a, biblioteca + mock (Vitest) e `vite preview` (Chromium 1248)

## Passos para reproduzir
1. Abrir `/espera-invisivel?equipe=senior&tipo=incidente&sistema=senior`.
2. Ler o rodapé do cartão EI-FL3: "Não afetado por: Equipe, Tipo de demanda". Base: "Amostra insuficiente: 0 de 20".
3. Abrir `/espera-invisivel?sistema=senior` (sem equipe e tipo). Base do EI-FL3: "Amostra insuficiente: 1 de 20".

## Resultado esperado
Tabela 2.2 da spec (`docs/ux/dashboard-metricas/especificacao.md`) e `APLICABILIDADE_FLUXO` (`packages/contratos/src/metricas.ts`): EI-FL3 **não** é recortado por equipe (projetos envolvem várias equipes; o E1 já usa `semEquipe`). O resultado com e sem `equipe` deve ser idêntico.

## Resultado obtido
`calcularEIBM` (`packages/metricas/src/businessmap/ei.ts`) chama `selecionar(ctx, f, g, { semTipo: true })` para os três níveis; no FL3 o filtro de equipe é aplicado. No Estratégico não aparece porque o painel zera a equipe antes de pedir; aparece em `/espera-invisivel`, que oferece o filtro de equipe e mostra o rodapé "Não afetado por: Equipe".

## Evidência
- Propriedade INV-F2 (`packages/metricas/src/filtros.intensivo.test.ts`), nas duas bases: `EI_FL3 (aplica sistema/periodo) mudou com {"equipe":["senior"],...}`.
- E2E IF-A `/espera-invisivel` (`e2e/tests/intensivo-filtros.spec.ts`): `EI-FL3 diz "Não afetado por: Equipe, Tipo de demanda", mas a base muda: "0 de 20" com o filtro x "1 de 20" sem`.

## Correção
- Correção: 079a2b1 (fix(metricas): EI-FL3 sem recorte de equipe e O6 segue o filtro de tipo)
