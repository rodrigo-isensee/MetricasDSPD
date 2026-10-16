---
tipo: review
contrato: 1
pedido: 011-front-estrategicas
branch: feature/011-front-estrategicas
commit: 919554b
parecer: reprovado
revisor: tech-lead
data: 2026-10-16
---
# Code review: front do pedido 011, lote 1 (E9, E6, E7 sem R$, E8)

- Cartão K-109, pedido 021 (etapa E1.4). Branch `feature/011-front-estrategicas`, commits `4c5d6f5` e `919554b` sobre a `develop` `1607a5f` (a ponta atual de `origin/develop`, então a integração já está feita).
- Referências: `docs/pedidos/021-front-do-011-por-nivel.md`, `docs/ux/metricas-tambem-disponiveis/02-especificacao.md` (§3, §4, §5 do E6 ao E9, §10), `docs/engineering/praticas.md` (§2 a §5 e §8), contratos `docs/contratos/metricas/E6.md` a `E9.md`.
- Ferramentas: o `praticas.md` não marca nenhuma regra como "decidida por: `<comando>`". Cito a saída do autor sem refazê-la: `pnpm run pronto` com rc=0 no `919554b` (o brief dispensou a execução local, com o teto de 2 agentes). Lint, tipos, cobertura de 100%, `docs:check` e E2E estão no `pronto`.

## Parecer

**Ajustes necessários (reprovado nesta rodada).** São 2 bloqueantes pequenos: uma frase de leitura do E7 que fica falsa num caso comum e a documentação técnica do front que descreve o estado do primeiro commit, não o do segundo. As regras invioláveis, a D2 = A e a R-1 = B estão conformes.

## Bloqueantes

| # | Arquivo:linha | Problema | Sugestão |
|---|---|---|---|
| B-1 | `web/src/features/complementares/estrategicas.tsx:275-276` | `leituraE7` decide pela `participacao` do **primeiro sistema** e então diz "`total` entregas no período: abaixo de 20". Pelo contrato (`packages/metricas/src/businessmap/e7.ts:17-18`), a participação é `null` em **todo sistema com menos de 20 entregas**, e esses sistemas vão para o fim. Se nenhum sistema chega a 20 mas o total chega (por exemplo, 6 sistemas com 10 entregas = 60), a frase fica "60 entregas no período: abaixo de 20", que é falsa. No Estratégico, com 12 semanas e muitos sistemas, esse caso é provável. O teste "com menos de 20 entregas no total" (`estrategicas.test.tsx:150`) só cobre total < 20. | Separar os dois casos: total < 20 mantém a frase atual; total ≥ 20 sem nenhum sistema com 20 diz que nenhum sistema chegou a 20 entregas e por isso só a contagem por sistema é publicada (texto final com o UX). Teste novo com total ≥ 20 e todos os sistemas abaixo de 20. |
| B-2 | `docs/tecnica/arquitetura-front.md:284`, `:290`, `:291` | A §11 descreve o estado do `4c5d6f5`, não o do `919554b`: cita a lista `COMPLEMENTARES_011` "fora de `CATALOGO`" (ela não existe: as quatro entradas foram para `COMPLEMENTARES`); diz que o `CartaoComplementar` cai em `COM_EXTENSAO_MOCK` sem entrada no catálogo (o fallback foi removido); e mantém a "Dependência aberta" do `CATALOGO_CARTOES` sem E6 a E9, que o segundo commit resolveu. Pelo `praticas.md` §8, item 10, documentação desatualizada bloqueia. | Reescrever as três linhas: as entradas estão em `COMPLEMENTARES`; o selo vem só do `CATALOGO_CARTOES` (status `mock` derivado de `COM_EXTENSAO_MOCK` em `contratos`); a seção "Mais métricas" já lista E9, E6, E7 e E8 e o contador vai de "+2" para "+6". |

## Recomendados (não bloqueiam)

| # | Arquivo:linha | Problema | Sugestão |
|---|---|---|---|
| R-1 | `web/src/features/complementares/estrategicas.tsx:37` e `:377`; `CartaoComplementar.tsx` (prop `aplicaveis`) | O front sobrescreve a aplicabilidade do contrato: E9 com `['sistema']` e E8 com `[]`. Está certo quanto ao comportamento real: o E9 usa janela móvel fixa (`e9.ts:30`) e o E8 usa a janela fixa de 12 meses (`e8.ts:17-18`). Mas os contratos gerados dizem "Atuam: sistema, periodo" (E9) e "Atuam: periodo" (E8). Com isso há duas fontes da verdade, e a de `contratos` está errada. | Cartão para o back: corrigir a aplicabilidade do E8 e do E9 em `contratos` (cabe no pedido 024 ou num cartão próprio) e depois remover a prop `aplicaveis`. |
| R-2 | `web/src/features/complementares/estrategicas.tsx:74` | `Math.max(0, FAIXAS_E9.indexOf(...))` põe na coluna 0–30, sem aviso, uma faixa que o contrato venha a mudar. | Derivar a faixa de `idadeDiasUteis` (como faz `formaE9`) ou tipar `faixa` no contrato como a união das quatro. |
| R-3 | `web/src/data/mock/MockFonteMetricas.ts:51` | `COM_TAMBEM` repete à mão o subconjunto E6/E8 de `COM_EXTENSAO_MOCK`. Hoje bate; nos lotes 2 e 3 (O22, O26, T13, T14) as duas listas podem divergir. | Comentar a relação entre as duas listas, ou derivar uma da outra quando o lote 2 entrar. |

## Pontos que o autor deixou

- **(a) `packages/contratos/src/cartoes.ts` e `cartoes.test.ts`:** conforme e dentro da liberação do pedido 021 (só catálogo e testes de contagem). Seções e ordem batem com a §4 e o CA-3 (E9 antes do E4, E6 depois do E5, seção nova `custo-do-parque` com E7 e E8). O status `mock` de E6 e E8 vem de `COM_EXTENSAO_MOCK`, que já existia, e E7 e E9 ficam `disponivel`, como manda a §3, item 2 (o E7 só é mock com custo, e o custo saiu pela D2 = A). O teste de alcance por "leia junto" passou a percorrer a cadeia e continua afirmando todas as 21 complementares. Também afirma a contagem: complementares listadas uma a uma e núcleo com 32.
- **(b) Arquivos fora do brief:** `docs/contratos/metricas/E6` a `E9` e o `README` só mudam entre as marcas `gerado` (nome e cartão); são saída do `docs:gerar` e não editei. Os E2E `complementares.spec.ts` e `lacuna-de-valor.spec.ts` mudam só contagens (49 → 53; Complementar 17 → 21; Estratégico com 6), o conjunto `MOCK` e o "leia junto" esperado, consistentes com o catálogo. `CartaoE2.tsx` ganha o `LeiaJunto` do `e2` → `e7`, coerente com o "Leia junto" do E7 na §5. Os três são consequência direta do catálogo e entram no escopo.
- **(c) Remoção do fallback para `COM_EXTENSAO_MOCK` em `CartaoComplementar.tsx`:** correta. Com os quatro no catálogo, o fallback virou código morto, e o selo volta a ter uma fonte única. Falta só refletir isso no doc (B-2).
- **(d) D2 = A e R-1 = B:** conformes. O E7 não lê `custoRateado`, `custoPorDemanda` nem `custoConfigurado` (nenhuma referência no `estrategicas.tsx`), não tem o aviso de rateio e não tem coluna de custo. O teste com fixture que injeta os campos de custo afirma ausência de "R$", do valor e de "custo" ou "rateio" no cartão. O alvo existe: o valor injetado é o que seria exibido. O E8 mostra só as três contagens, a barra 100% e o selo fixo da §9, sem lista de sistemas (o CA-18 cai pela R-1 = B) e sem nome de pessoa. Com `recortePequeno`, mostra a mensagem fixa do CA-10 e oculta as faixas.

## Checklist (`praticas.md` §8)

| Item | Situação |
|---|---|
| 1. Especificação | Atende à §5 do E6 ao E9, com as decisões D2 = A e R-1 = B. Desvios de forma (rótulo das barras do E7, faixas do E9 como categorias e não como fundo, coluna "Tipo" na tabela do E9) ficam para a revisão de UX (E1.2), que corre em paralelo. Exceção: B-1. |
| 2. Regras invioláveis | Conformes. Tudo é BusinessMap; o E7 avisa que os chamados do Acelerato estão no S12 e não os soma. Cada gráfico tem uma granularidade só (projeto no E6 e no E9; demanda agregada por sistema no E7; sistema no E8). Não há campo, filtro ou visão por pessoa ou time. A ordenação é neutra (por volume, vinda do back). Não há horas apontadas. |
| 3. Cálculo pela `core` e n < 20 | O front não calcula estatística: percentual e percentis chegam como `Estatistica`/taxa do back e são exibidos só com `status: 'ok'`. Abaixo de 20 aparecem `AmostraInsuficiente` (variante `lenta` no E6) e "k de n". As agregações locais (mais antigo, contagem acima de 90, faixa de atraso) são contagens de censo, não estatística. |
| 4. Legibilidade | Boa: funções de leitura separadas e nomes de domínio. `aEntrada` em `catalogo-metricas.ts` reduz a duplicação. |
| 5. Tipos e erros | Tipos do `contratos`, sem `any`. Os estados de erro e de vazio vêm do `CartaoComplementar`. Há um `as never` no teste (fixture parcial), aceitável. |
| 6. Segurança e dados pessoais | Conforme. Rótulos de ponto e tabelas usam código e título de projeto, que não são dado de pessoa. O E8 não recebe nomes do back. Nenhum segredo. |
| 7. Performance | Os cartões são complementares e montam só quando a seção abre. Os gráficos usam `Dispersao` e `Barras` (fila de montagem da §10). A extensão `tambem` do mock é lazy e separada. Não há dependência nova. |
| 8. Testes | 306 linhas novas em `estrategicas.test.tsx`, cobrindo estados ok, insuficiente, vazio, erro e os ramos de leitura. Lacuna: B-1. |
| 9. Acessibilidade | Cada gráfico tem `TabelaDados` (E9, E6, E7) ou `dl` com os números (E8), e `descricao` em todos. O axe AA está nos E2E do `pronto`. |
| 10. Documentação | Os contratos foram regenerados. `arquitetura-front.md` §11 está desatualizada (B-2). |
| 11. Commits | São dois commits coerentes, em Conventional Commits em português, e cada um compila. |

## Para a próxima rodada

Correções de lógica e de texto voltam ao `react-frontend`: B-1 (com teste) e B-2. A revalidação cobre só esses dois pontos e o diff que vier deles. Os recomendados R-1 a R-3 viram cartão ou entram nesta rodada, a critério do autor. O R-1 depende do back.
