---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-taticas-nulo
commit: f86be94a2b06404248ecdc419e1900988809a5df
parecer: reprovado
revisor: tech-lead
data: 2026-11-16
---

# Code review: T3 e T7 com referência ausente nula, nunca 0 (E7.62, PR 481)

## O que foi conferido
- Diff `ffc59d8a...f86be94a`: 3 commits (`94c3c335` código e testes, `99269275` openapi, `f86be94a` aceite e fotografias), 17 arquivos, 177 adições e 34 remoções, das quais 89 de teste; o código de produção é pequeno e é um comportamento só (referência ausente sai nula).
- **Biblioteca.** `t3.ts:49-50` troca `?? 0` por `?? null` no acordado e `t3.ts:39` só calcula desvio com acordado; sem acordado o `statusMeta` sai `sem-referencia`. `t7.ts:58` devolve `acimaDoLimite: null` sem limite. O 0 cadastrado de propósito segue 0 (`fixtures.cobertura.test.ts`, caso "acordado 0 cadastrado de propósito"); a fronteira de 19/20 itens está coberta com e sem referência.
- **Serviço.** `mapa.ts:119` passa `r.limiteFrentes` sem `?? 0`; `BASE_BM_VAZIA` (`servico.ts:66`) usa `null`. `ConfigBM.limite_frentes` vira `number | null` (`modelo.ts:115`). A leitura da base (`repositorio.ts:154`) já devolvia nulo sem linha; a coluna é `NOT NULL CHECK (limite >= 0)`, então nulo só vem da ausência de linha. Outros consumidores de `acimaDoLimite` no repositório são do O1 (outro contrato, `number`) e não mudam.
- **Contrato e aceite (revisado como revisor, não como autor).** Troca de tipo é incompatível pela tabela do §2 da `docs/contratos/politica-de-mudanca.md`; o PR usou a saída 2 (aceite de uso único) sem `/api/v2`, com a justificativa de que o único consumidor é a web do mesmo PR e da mesma imagem, como no precedente do pedido 075 (lote 9b, já em Mudanças que quebram). Aprovações do §5 citadas no corpo de `f86be94a` (arquiteto no plano L1b/L2a, tech-lead no E7.71), hashes de `resultados/T3` e `resultados/T7` no corpo, `aceitas.json` sem entrada no fim (uso único, removido), fotografias e páginas T3.md e T7.md regeradas, `openapi.json` regenerado. O hash não foi recalculado à mão: o `docs:check` é a ferramenta que o confere, verde no CI.
- **CHANGELOG.** Linha em `### Mudanças que quebram` (`CHANGELOG.md:156`) com os três campos, o 0 de propósito e as dúvidas do dono que ficam abertas.
- **Tela T7.** `CartaoT7.tsx:47-55` e `:72-88`: sem limite, o número grande diz "não definido", o texto completo diz "não definido", sem selo "Acima/Dentro do limite" e o cartão fica `sem-meta`. Correto.
- **Tela T3.** `acordadoTexto` mostra "não definido" no acordado e o gráfico `Barras` já aceita `null` (`Barras.tsx:44`, mostra "—"). Mas o desvio e a leitura ainda tratam o nulo como 0 ou como falta de amostra: ver A1 e A2.
- **Testes rodados.** `vitest run src/businessmap/fixtures.cobertura.test.ts` (packages/metricas): 34 passaram. `vitest run src/features/tatico/tatico.test.tsx -t E7.62` (web): 2 passaram. Mutantes: `t3.ts` `?? null` → `?? 0` mata 2 testes; `t7.ts` `limite === null ? null` → `? false` mata 1 teste; fonte restaurada.
- **Suíte.** CI verde em `f86be94a` (rapida, testes, banco, build, e2e 1/2 e 2/2, seguranca); citado, não rerrodado.
- **Estado do PR.** O PR 481 já estava `MERGED` na `develop` (`2c56d33b`, 2026-11-16T09:31:26Z) quando este review rodou, e a branch remota tinha sido apagada. Os bloqueantes abaixo estão na `develop` e pedem PR de correção próprio.

## Achados
- A1 (bloqueante) web/src/features/tatico/components/CartaoT3.tsx:109 · sem acordado, a linha mostra "desvio 0 p.p." (`desvioPP ?? 0`): nulo vira 0 na tela; omitir o desvio quando nulo e testar a ausência de "desvio 0" (S1).
- A2 (bloqueante) web/src/features/tatico/components/CartaoT3.tsx:48 · T3 ok e acordado nulo: a leitura diz "menos de 20 itens entregues", texto falso; falta ramo próprio para "sem referência", com texto do UX (S2).
- A3 (recomendado) server/tests/metricas.mapa.test.ts:62 · o nome do teste ainda diz "sem linha de limite de frentes = 0", e a asserção agora espera `null`; o nome mente sobre o comportamento.

## Sondas
- S1 · T3 `status: ok`, duas naturezas com `acordadoPct: null`, `desvioPP: null`, `pct` 51 e 49, renderizado em `/tatico` · espera: nenhuma linha com "desvio 0 p.p." · obtido: "Sustentação:realizado 51% · acordado não definido · desvio 0 p.p.Evolução:realizado 49% · acordado não definido · desvio 0 p.p."
- S2 · mesma entrada da S1 · espera: leitura sem "menos de 20 itens" · obtido: o cartão contém "menos de 20 itens" (`true`)

## Riscos e pendências fora do review
- As decisões do dono que vêm depois (T3 só com a divisão realizada e divisão nova; T7 com "limite não definido") devem absorver A1 e A2 se forem implementadas antes; se não, A1 e A2 pedem correção própria antes da promoção a `homolog`.
- T3 e T7 seguem fora do mapa de origem real; em produção a tela mostra o aviso de mock, o que reduz o alcance de A1 e A2 até a ligação real.
