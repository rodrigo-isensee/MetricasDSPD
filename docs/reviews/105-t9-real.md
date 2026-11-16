---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-t9-real
commit: 9fd6b8c2fc4667afa2e29becb32b9d2df37da69e
parecer: aprovado
revisor: tech-lead
data: 2026-11-16
---

# Code review: T9 avanço real e escopo com dado real (105, E7.90; revalidações E7.126 e E7.152)

Primeira passada: de `ffc59d8a` (Base-sha) até `6b772b00`: `af2c1270` (métrica, contrato, critério e tela), `883747de` (testes de origem e faixa do Tático) e `6b772b00` (nota no singular e no plural). 16 arquivos, +299/-18.

## Revalidação (volta 1, E7.126)
Delta lido com `forge-check parecer delta docs/reviews/105-t9-real.md`: intervalo `6b772b00..f7164507`, no domínio `CHANGELOG.md`, `packages/metricas/src/businessmap/t9.test.ts`, `web/src/components/ui/CartaoMetrica.tsx`, `web/src/features/tatico/components/CartaoT9.tsx` e `web/src/features/tatico/ramos.test.tsx` (código e teste: +126/-9). Fora do domínio: pareceres de QA e UX. Depois de `f7164507` só entrou `e6694be3` (revalidação do QA, só `docs/qa/105-t9-real.md`).

- **A1 resolvido.** `t9.test.ts` ganha o caso "frente criada no mesmo instante do início conta como original". Rodei o mutante `>` para `>=` em `t9.ts:43`: o teste novo falha (1 de 8), o mutante morre. Sem o mutante, 8 de 8 verdes.
- **`CartaoMetrica` (componente compartilhado).** Prop nova `complementoVazio?: ReactNode`, opcional, documentada, renderizada só dentro do bloco `estado === 'vazio'`, logo abaixo do `EstadoVazio`. Os demais cartões não a passam (único uso: `CartaoT9.tsx:45`), então nada muda para eles. Nome e escopo bons; sem ramo novo no componente além da renderização condicional já existente.
- **`CartaoT9`.** `notaSemInicio` calculada uma vez e usada na nota do estado ok e no complemento do vazio (sem duplicar o texto). "Escopo sem frente original (+n frentes)" quando `originais === 0`; como `t9.ts` filtra `totalFrentes > 0`, `originais === 0` implica `adicionadas >= 1`, então não há "(+0 frentes)". Leitura com singular em "frente concluída" e "frente foi adicionada"; nota sem "a base não guarda", com o texto sugerido pela UX (T9-4). Atende T9-1 a T9-4 da UX; T9-5 segue como pergunta ao dono, fora do código.
- **Testes do web.** `ramos.test.tsx` cobre: vazio com 2 projetos fora (plural), vazio sem nota, sem frente original no singular e no plural, ausência de "Escopo cresceu" e a nota nova. Rodei o arquivo filtrado por "T9": 10 de 10 verdes.
- **Regras invioláveis.** Só texto de tela e teste; cálculo intacto, sem pessoa, sem mistura de fontes nem de granularidades.
- **Tamanho (M14).** O corpo do PR 483 traz `teto: excedido, 296 linhas (o excesso é de teste)`: A3 resolvido.

## Revalidação do merge da develop (E7.152)
Delta lido com `forge-check parecer delta docs/reviews/105-t9-real.md`: intervalo `f7164507..9fd6b8c2`, sem o que veio da base. No domínio: `CHANGELOG.md`, `docs/api/openapi.json`, `packages/contratos/src/origem.test.ts`, `packages/contratos/src/origem.ts`, `packages/contratos/src/schemas.ts`, `packages/metricas/src/core/criterios.ts`, `server/tests/painel-real-f6.test.ts`, `server/tests/qa-f6-painel.test.ts` e `web/src/features/coleta/origem.test.tsx`. O que é do T11 (E7.64), do O26 (E7.55) e do T3/T7 nulos (E7.62) chegou da develop com os pareceres deles; aqui conferi só a resolução, pelo `git show --cc 9fd6b8c2` (o que difere dos dois pais).

- **Código de produção do T9 intacto.** `origem.ts` e `criterios.ts`: T9 e T11 lado a lado em `METRICAS_ORIGEM_REAL` e em `VERSOES_DA_BIBLIOTECA`, cada um com o seu comentário e a sua versão de critério (`criterio-2026-11-16-t9-escopo-criado-em` e `criterio-2026-11-16-t11-dado-real`, ids distintos). Nada do `t9.ts`, do `CartaoT9` nem do contrato do T9 mudou.
- **`origem.test.ts`.** A lista esperada das reais tem `T9` e `T11`, cada um com a sua origem no comentário.
- **`server/tests/qa-f6-painel.test.ts`.** Asserção reescrita: a lista das reais traz `T9` e `T11`, e o laço do FL2 exclui as duas (`m !== 'T9' && m !== 'T11'`); as demais T e E seguem `sem-dado`. É a união exata das duas versões; nenhum lado afrouxou.
- **`web/src/features/coleta/origem.test.tsx`.** Tático conta `cartoesDoPainel('tatico').length - 2` e confere `semDadoReal` falso para T9 e para T11; `contarSemDadoReal` segue igual à lista filtrada. União das duas versões, sem perder asserção.
- **CHANGELOG.** As duas entradas do T9 (E7.68 e E7.119) seguem em `### Adicionado`, ao lado das do T11 e do O26; nenhum item perdido. As linhas em branco depois dos títulos de seção vieram da develop.
- **Rodei os três testes reescritos no head `9fd6b8c2`:** `web/src/features/coleta/origem.test.tsx` 18 de 18, `server/tests/qa-f6-painel.test.ts` 6 de 6, `packages/contratos/src/origem.test.ts` 26 de 26, todos verdes. Suíte inteira: CI do head (abaixo).

## CI do head
`9fd6b8c2`: run de push 43852723503 `completed:success` (jobs `filtro`, `rapida`, `seguranca`, `openapi`, `build`, `testes`, `banco` e `imagem` verdes; `perf` e `e2e` pulados pelo filtro). O run do PR 43852730813 saiu `cancelled` pela concorrência: o push de `2d2ef978` (só o parecer do QA, `docs/qa/105-t9-real.md`) o substituiu.

Anterior, `f7164507`: run do PR 43847934403 `completed:success` e run de push 43847926313 `success`. No job `testes` do run do PR, cobertura do web: `Statements 100% (5892/5892)`, `Branches 100% (5734/5734)`, `Functions 100% (2143/2143)`, `Lines 100% (5038/5038)`; 114 arquivos e 1843 testes verdes. `e6694be3` muda só o parecer do QA.

## O que foi conferido na primeira passada
- **Regra do dono (D-T9 "T9 A") em `t9.ts`:** frente adicionada = `criado_em` da frente estritamente depois do `iniciado_em` do projeto; a criada antes conta como original. Derivada na leitura, sem coluna nova nem migração; `adicionado_apos_inicio_pai` deixa de ser lida pelo T9. A limitação (instante do vínculo não guardado) vira nota no cartão, não inferência no código.
- **Projeto sem início:** fica fora da tabela e da conta e soma em `projetosSemInicio` só quando tem frente filha.
- **Avanço:** concluídas ÷ total das frentes filhas; só `frente` nas linhas e só `projeto` como pai. Censo por projeto, sem percentil nem estatística agregada.
- **Histórico, pessoa, BM × Acelerato:** leitura pura, nenhum campo de pessoa, só BusinessMap.
- **Contrato:** `projetosSemInicio` opcional, compatível; OpenAPI, fotografia e `T9.md` regravados; CHANGELOG.
- **Critério (T2.6):** `VERSAO_CRITERIO_T9_ESCOPO_CRIADO_EM` em `VERSOES_DA_BIBLIOTECA`, conferido no teste de servidor.
- **Origem:** T9 em `METRICAS_ORIGEM_REAL`, demais T e E fora.

## Achados
- A1 (recomendado) packages/metricas/src/businessmap/t9.ts:43 · resolvido em `f7164507`: teste da fronteira de igualdade em `t9.test.ts:66`; mutante `>=` morto.
- A2 (recomendado) packages/metricas/src/businessmap/e5.ts:36 · o E5 ainda lê `adicionado_apos_inicio_pai`, que a base real nunca grava. Hoje fora do mapa real; quando entrar, precisa da mesma regra derivada do T9. Cartão no quadro (segue aberto, fora deste PR).
- A3 (recomendado) packages/metricas/src/businessmap/t9.test.ts:1 · resolvido: corpo do PR 483 com a linha `teto: excedido, 296 linhas`.
- A4 (recomendado) packages/metricas/src/businessmap/t9.ts:62 · projeto sem frente original sai com `crescimentoEscopoPct = 0` e vai ao fim da ordem por crescimento, embora seja o de maior mudança de escopo (UX T9-2). A tela já não mostra "0,0%"; a ordem é decisão do arquiteto ou do dono, não do código: cartão ou pergunta, fora deste PR.

## Sem teste
Nada a justificar.
