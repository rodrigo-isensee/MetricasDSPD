---
tipo: qa
contrato: 1
pedido: 097-resumo-filtro-time
branch: feature/097-l4-tendencia-equipe
commit: 440c863f8f04ca02a353747081d92e0c3f322b78
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-11
---

# QA: L4 do 097, equipe opcional nas duas tendências do Resumo (E3.3, K-273)

Links: pedido `docs/pedidos/097-resumo-filtro-time.md`, plano `docs/analises/097-filtros-plano.md` (linha L4), base develop f4c122f1.

## Veredito
**Aprovado**, com um achado recomendado (A1). Diff `f4c122f1..440c863f` (13 arquivos): contrato (`FiltrosTendencia`), bibliotecas `businessmap/tendencia.ts` e `acelerato/tendencia.ts`, `calcular.ts`, `queryTendenciaSchema`, contratos regenerados e testes. Nenhum bug.

## Execução (R-TETO, no máximo 2 workers; só os testes tocados)
- `packages/metricas`: `tendencia.test.ts` e `filtros.intensivo.test.ts`: 2 arquivos, 54 testes passaram.
- `server`: `tests/metricas.test.ts` e `tests/api.sistemico-intensivo.test.ts`: 2 arquivos, 217 testes passaram.
- `packages/contratos`: 12 arquivos, 219 testes passaram.
- `pnpm run docs:check`: `docs:check: ok (1199 páginas Markdown, 69 métricas, 2 eventos).`
- A suíte inteira roda só no CI do PR (check-run `bateria` do mesmo sha); não foi rodada aqui.

## Critério → teste → resultado
| Obrigação | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Sem `equipe` (e com `equipe` vazia) o resultado é igual ao de antes | `tendencia.test.ts` (fluxo e sustentação: `toEqual` entre sem e `[]`; total 25 e volume 25) | filtro vazio = todas | passou |
| Com `equipe`, soma só a equipe pedida | mesmos testes: 20 / 5 no fluxo; 20 / 5 no volume da sustentação | recorte por equipe | passou |
| Abaixo de 20 itens no recorte não publica estatística | fluxo, `equipe-b` (5 itens): todos `insuficiente` | mínimo de amostra | passou |
| Equipe desconhecida não quebra | fluxo e sustentação: recorte vazio (0) | equipe inexistente | passou |
| Nenhuma saída compara equipes (união, não ranking) | união `equipe-a,equipe-b` igual a todas; a resposta mantém a forma de uma série só | sem comparação entre times | passou |
| BusinessMap e Acelerato não se misturam | cada biblioteca lê só o próprio contexto (`ctx.bm`, `ctx.ac`); `equipe-*` na sustentação e `totvs` no fluxo dão recorte vazio | fonte única | passou (ver A1) |
| Equipe inválida recusada pelo `idSlug` | `metricas.test.ts`: `Fluig X` (fluxo), `a;b` (sustentação) e `tipo=incidente` dão 400; matriz sistêmica: `Equipe%20A`, `..%2F..`, `periodo`, `sistema`, `tipo`, `prioridade` dão 400 | formato do slug; parâmetro estranho | passou |
| Equipe válida aceita nas duas rotas, mesma forma de resposta | `metricas.test.ts`: 200 e schema de resultado válido | contrato de resposta | passou |

## Mutação no código alterado
- Mutante: em `packages/metricas/src/businessmap/tendencia.ts`, `{ ...PADRAO, equipe: [...equipe] }` virou `{ ...PADRAO }` (ignora o filtro de equipe). Resultado: 2 testes falharam (`sem equipe e com equipe vazia dão o mesmo resultado; com equipe só conta a do recorte` e `equipe desconhecida não quebra: recorte vazio`), 36 passaram. Mutante morto. Arquivo restaurado por `git checkout`; `git status` limpo antes do commit.
- Vermelho antes do verde: a mutação equivale a rodar sem a implementação do filtro na biblioteca do fluxo; os testes novos caem. A rota (`queryTendenciaSchema`) antes recusava `equipe` (o caso antigo `equipe=fluig` esperava 400); o teste foi trocado para os casos de slug inválido.

## Achados
- A1 (recomendado) server/src/modulos/metricas/schemas.ts:76 · `TENDENCIA_SUST` aceita qualquer slug de equipe (`equipe=xpto` dá 200 com recorte vazio), enquanto `querySustentacaoSchema` recusa com 400 o que não é totvs, senior ou fluig. Não mistura fontes, mas a fonte não só aceita as suas equipes. Considerar enum por fonte (hoje previsto na L7a).
