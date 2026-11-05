---
tipo: qa
contrato: 1
pedido: 069-lacunas-alta
branch: feature/069-l2-campos
commit: 1f62f203e7a0ced3947ec2b9c70eab644b98bc20
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-04
---
# QA: 069 L2-a, mapa de campos do BusinessMap por arquivo versionado (E1.5, K-220)

Código testado: `1f62f20` (diff contra `origin/develop`, base `69e72a7`). Obrigação: `docs/analises/069-desenho.md` (Lote L2-a) e `docs/security/069-modelo-ameacas.md`, casos de abuso CA-069-1 a CA-069-4. Não há especificação de UX com `CA-n` de produto; o lote não muda tela.

## Escopo
- Dentro: `bm:ref-sync` (entrada), `dominio-businessmap.ts` (esquema fechado, lista positiva de tipos, enum de colunas, recusa de 36 e 42 no arquivo e na leitura do banco), `dominiosDaColeta` lendo `ref_dominio`, arquivo `businessmap-dominio.json` com `campos` vazio.
- Desvios aceitos pelo Jarvis, avaliados aqui: `textoSeguro` exportado e `planejarDominio` com tipo mais largo (comportamento igual, mesma expressão regular); `CAMPOS_CUSTOMIZADOS_FORA` em `allow-list.ts`, reexportada por `coleta.ts` com o mesmo nome e valor (`['36', '42']`, conferido por teste). Nenhum dos dois muda comportamento.
- Fora: testes `*.pg.test.ts` (`dominio-businessmap.pg.test.ts`). Não rodam sem PostgreSQL local; ficam para a CI do PR. Sem resultado deles, não declaro o caminho real do banco (INSERT e UPDATE em `ref_dominio`, GRANT efetivo) como provado; o dublê de pg cobre as consultas e valores.

## Critério → teste → resultado
| Caso de abuso | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| CA-069-1: field 36 e 42 no arquivo | `dominio-businessmap.test.ts`, `it.each(PROIBIDOS)` (lista escrita no teste, não importada) e zeros à esquerda (`036`, `0042`) | field proibido, normalização numérica, mensagem sem valor | passou |
| CA-069-2: type de usuário, texto, desconhecido, vazio, ausente, nulo, lista | `it.each` de type e teste de type ausente | lista positiva (vazia no código: toda carga com campo recusada) | passou |
| CA-069-2: rótulo e código com `@`, U+200B, U+202E, U+2028, controle | `it.each` de caracteres, nos dois lados | texto seguro | passou |
| CA-069-2: coluna `owner_user_id`, `causa_raiz`, `__proto__`; field_id inválido; chave extra | `it.each` de coluna e de field_id; teste de chave extra | enum fechado, `strict`, tamanho do id | passou |
| CA-069-3: INSERT direto de 42 e 36 no `ref_dominio` | `it.each(PROIBIDOS)` de `dominiosDeLinhas` e teste de `dominiosDaColeta` em `coleta-businessmap.test.ts` | leitura desconfiada do banco, zeros à esquerda, field em duas colunas | passou |
| CA-069-4: cards com 36 e 42 e marcador; campo mapeado com texto fora do domínio | `coleta-businessmap.test.ts` (069 CA-069-3 e CA-069-4): staging só `a1` ou `desconhecido`; marcadores ausentes de logs, estado do banco (inclui falhas) e resultado | valor fora do domínio nunca gravado | passou |
| Arquivo nasce vazio e mapa vazio não grava campo | testes "nasce vazio" e "sem linha vigente" | regressão ao comportamento anterior | passou |
| Entrada: argumento a mais, data inválida, URL com senha marcador, sem apikey, GRANT inalterado | `ref-sync-businessmap-entrada.test.ts` | caminho constante, mensagem fixa | passou |

## Execução (2 workers, MemAvailable 12 GB, load 1,7)
- `git pull --ff-only origin feature/069-l2-campos`: Already up to date, HEAD `1f62f20`.
- server, `vitest run --coverage --maxWorkers=2`: `Test Files 82 passed | 34 skipped (116)`, `Tests 1677 passed | 238 skipped (1915)` (skipped = `.pg.test.ts`); cobertura 100% nos quatro eixos (4898/4898, 3288/3288, 1100/1100, 3877/3877).
- packages/metricas com cobertura: `43 files, 1262 passed`; 100% nos quatro eixos.
- packages/contratos: `204 passed`; packages/mock: `258 passed`.
- tools/docs-contratos: `14 files, 102 passed`.
- `pnpm exec prettier --check web packages tools`: All matched files use Prettier code style.
- `pnpm run docs:check`: `ok (937 páginas Markdown, 69 métricas, 2 eventos)`.

## Não feito
- Testes pg: sem PostgreSQL local; rodam na CI do PR.
- Vermelho antes do verde por execução e mutação: não rodados (a worktree não se toca e o lote não declara mutantes). Por leitura, os testes de CA-069-1 a 4 dependem das guardas `CAMPOS_CUSTOMIZADOS_FORA`, da lista positiva e do enum; remover qualquer uma deixa um caso sem recusa.
- E2E e acessibilidade: o lote não muda tela nem contrato HTTP.

## Achados
- A1 (recomendado) server/tests/dominio-businessmap.pg.test.ts:1 · testes pg não executados neste ambiente; conferir o verde na CI do PR antes do merge.
