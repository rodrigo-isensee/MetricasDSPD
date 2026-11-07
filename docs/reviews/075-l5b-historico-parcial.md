---
tipo: review
contrato: 1
pedido: 075-bloqueios-reais
branch: feature/075-l5b-historico-parcial
commit: caee6f68686c5cf719583f4080670edaee4a4b5c
parecer: aprovado
revisor: tech-lead
data: 2026-11-07
---
# Code review: 075 L5b, histórico parcial no O5 e na série do O1, precisão do início (K-204)

## Parecer

Aprovado em `caee6f68`. O lote faz o que o lote 5b do plano pede, só consome o contrato e os testes provam CA-6 a CA-9 e CA-11 pelo comportamento da tela. Nenhum achado bloqueante; dois recomendados que não devolvem.

## De onde vem a faixa do O5 (CA-6, CA-8)

- `fluxo.tsx` não está no diff e não precisa estar: `CartaoO5` (fluxo.tsx:16) entrega o resultado a `CartaoComplementar`, que repassa `criterios: d.criterios` (CartaoComplementar.tsx:77) a `CartaoMetrica`.
- `CartaoMetrica` renderiza `AvisoCriterio` com `criterios.serie` e, com `tipo="janela"`, com `criterios.janela` menos as marcações já da série (CartaoMetrica.tsx:349-357), dentro do ramo de estado `ok`, que é o estado do cartão também quando o corpo mostra amostra insuficiente.
- `AvisoCriterio` devolve `null` com a lista vazia (AvisoCriterio.tsx:20): é o que faz a faixa sumir no CA-8.
- O teste prova de fato: o CA-6 renderiza o `CartaoO5` real com a fonte ajustada (`criterios.janela` com a fixture), espera `data-estado="ok"`, acha `aviso-criterio` com "inclui dados anteriores" e a data, e no mesmo cartão o `amostra-insuficiente-O5` com "12 de 20". Se `CartaoComplementar` deixasse de repassar `criterios`, ou se a faixa ficasse fora do estado de amostra insuficiente, o `getByTestId` falharia. O CA-8 é a contraprova com `janela: []`.
- Confere com a revisão de interface (`docs/ux/075-revisao-l5b.md`, CA-6 e CA-8 atendidos pela mesma rota).

## O que foi lido (diff `c66b5d21...caee6f68`, 2 arquivos)

- `web/src/features/operacional/components/CartaoO1.tsx` (+17 -2): a série `bloqueados` entra no `SerieLinhas` com o valor do contrato, sem conversão (o nulo antes do dado real vira lacuna, nunca zero: `SerieLinhas` não interpola nulos e a tabela mostra o traço); a série só aparece quando `semBloqueio` é falso, preservando o "Sem dado real" do pedido 065; a descrição acessível acompanha. Faixa `serie` e linha vertical já vinham de `marcacoes={d.criterios.serie}` e `CartaoMetrica`: reaproveita `AvisoCriterio`, sem componente novo.
- `web/src/features/operacional/historico-parcial.test.tsx` (novo, 99 linhas): fixture `MarcacaoCriterio` da versão de critério do 6a; CA-6, CA-8 e CA-9 no `CartaoO5`; CA-7 no `CartaoO1` (faixa, marcador com 01/10/2026, linhas anteriores com "— amostra insuficiente" na tabela, nunca 0); CA-11 no `CartaoBloqueados` (`aria-describedby` ligando a tabela ao texto de precisão, que já vinha do 5a).
- Nenhuma conta na tela (T2.5): o cartão só mapeia campos do contrato. `server/` e `packages/`: sem diff. Regras invioláveis: sem visão individual, sem mistura de fontes, mínimo de 20 respeitado pelo `AmostraInsuficiente` e pela `ListaInsuficientes` existentes.
- CA-9 com nenhum tipo em 20 (medidor N/20): divergência decidida pela revisão de interface, fora deste review.

## Ferramentas

- CI do push no head `caee6f68` (run 42338750371, workflow CI): `completed`, `success`.
- Testes dos arquivos tocados (`npx vitest run --maxWorkers=2 src/features/operacional/historico-parcial.test.tsx`): 1 arquivo, 5 testes, 5 passaram.
- `docs/engineering/praticas.md` não marca as regras com "decidida por": apliquei o checklist da skill às regras de leitura; lint e tipos valem pela CI verde.
- Guardas novas de código de produção: nenhuma (só ternário de exibição já coberto pelo teste do 065 e pelo CA-7).
- Teto M14: 118 linhas (17+2 de código, 99 de teste), dentro de 150; um comportamento.

## Achados

- A1 (recomendado) web/src/features/operacional/historico-parcial.test.tsx:87 · `toBeGreaterThan(0)` aceita uma linha só; afirmar as três linhas anteriores (01/09 a 03/09) com `toHaveLength(3)` e uma linha posterior sem o traço deixaria o CA-7 provado ponta a ponta.
- A2 (recomendado) web/src/components/charts/SerieLinhas.tsx:118 · Na tabela, o trecho anterior ao dado real da linha Bloqueados lê "— amostra insuficiente", mas o motivo é ausência de dado real; texto próprio para esse nulo fica para a UX decidir, fora deste lote.
