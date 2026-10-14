# IF-004 - O6 muda com o filtro de tipo, mas o contrato e a tela dizem "Não afetado por: Tipo de demanda"
- Severidade: média
- Responsável sugerido: node-backend (depois da decisão de regra, ver abaixo)
- Ambiente: main @ 0af552a, biblioteca + mock (Vitest) e `vite preview` (Chromium 1248)

## Passos para reproduzir
1. Abrir `/operacional?cadencia=semanal&tipo=melhoria,divida-tecnica`, abrir "Mais métricas deste painel".
2. O rodapé do O6 (Previsibilidade) diz "Não afetado por: Tipo de demanda".
3. Comparar a base e os valores do O6 com `/operacional?cadencia=semanal` (sem tipo).

## Resultado esperado
Cálculo e rodapé contam a mesma história: ou o O6 ignora o tipo (como declara `APLICABILIDADE_FLUXO.O6 = ['equipe','sistema','periodo']`), ou a tabela passa a incluir o tipo e o rodapé deixa de dizer "Não afetado por".

## Resultado obtido
`calcularO6` usa `selecionar(ctx, f, 'story')` sem `semTipo` (mesma amostra do O3, que é recortado por tipo): a base e as razões P85/P50 mudam com o tipo, enquanto a tela afirma o contrário.

## Pergunta para o usuário (regra de negócio, não decidir por inferência)
O O6 (previsibilidade P85/P50 por classe de serviço) deve respeitar o filtro de tipo de demanda, como o O3 de onde sai a amostra, ou ser sempre calculado sobre todos os tipos? A resposta define qual dos dois lados (cálculo ou tabela de aplicabilidade) muda.

## Evidência
E2E IF-A `/operacional?cadencia=semanal` (`e2e/tests/intensivo-filtros.spec.ts`): `O6 diz "Não afetado por: Tipo de demanda", mas a base muda: "Base: 116 itens concluídos" com o filtro x "Base: 198 itens concluídos" sem` (URL com `equipe=fluig,dados&tipo=melhoria,divida-tecnica&sistema=fluig,data-lake`).
Propriedade INV-F2 (`packages/metricas/src/filtros.intensivo.test.ts`), nas duas bases: `O6 (aplica equipe/sistema/periodo) mudou com {"equipe":[],"tipo":["Melhoria","Dívida técnica"],...}`. Na tela (sonda Playwright): rodapé do O6 com "Filtros aplicados: Equipe Fluig · Equipe Dados" e "Não afetado por: Tipo de demanda" com `tipo=melhoria` ativo.

## Decisão do usuário (2026-10-13)
- IF-004: a O6 **segue o filtro de tipo**, como a O3 de onde deriva; a tela passa a dizer que o filtro se aplica (mínimo de 20 itens continua valendo).

## Correção
- Correção: 079a2b1 (fix(metricas): EI-FL3 sem recorte de equipe e O6 segue o filtro de tipo)
