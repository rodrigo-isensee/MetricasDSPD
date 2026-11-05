---
tipo: qa
contrato: 1
pedido: 069-lacunas-alta
branch: feature/069-l9-etapa
commit: fb8ea39e27f54e3e7023e86a5bdcae494143ae32
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-04
---
# QA: 069 L9-b, campos de etapa do Acelerato até o staging (E1.5, K-220)

Código testado: `fb8ea39` (os commits seguintes só somam pareceres de review e de segurança). Obrigação: desenho `docs/analises/069-desenho.md` (Lote L9-b) e modelo de ameaças `docs/security/069-modelo-ameacas.md` (CA-069-6 a 12). Sem especificação de UX: lote sem tela.

## Escopo
- Dentro: consultas Q6 (campos de etapa `lista`) e Q7 (`preenchido`, só booleano), constante `CAMPOS_ETAPA_F3`, `camposEtapa`, `carregarDominiosEtapa`, hash de campos, versão de critério `069:L9-b-campos-etapa`.
- Fora: os `.pg.test.ts` (232 testes pulados, sem Postgres no ar) e a execução da Q6/Q7 num MySQL real (o duplo de teste não interpreta SQL); `grants.ts` sem diff, confirmado.

## Critério → teste → resultado
Todos em `server/tests/acelerato-campos-etapa.test.ts`, salvo indicação.

| Obrigação | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| CA-069-6 nomes proibidos e desconhecido não saem | `A1: fixture com nomes proibidos e marcadores` | nome fora da constante; marcador no staging, log e controle | passou |
| CA-069-7 justificativa só booleano | `A2 (CA-069-7)` e estrutura da Q7 (projeção exata, sem `tipo`) | texto livre não sai do SELECT | passou |
| CA-069-8 tipo texto anula valor | `A2 (CA-069-8)` | `tipo` só recusa, valor no domínio ainda nulo | passou |
| CA-069-9 zod strict | `zod strict`, 8 casos (chave extra, nome fora, 81 caracteres, booleano em lista, `valor` na Q7, texto no booleano, nomes trocados) | limite 80 e 81; erro sem o valor | passou |
| CA-069-10 domínio | `CA-069-10`; `vazio e fora do mapa de domínios` | domínio vazio e fora do domínio | passou |
| CA-069-11 `ref_dominio` não alarga o `IN` | `A1: linha a mais em ref_dominio` | parâmetros iguais à constante | passou |
| CA-069-12 SQL e versão | `acelerato-estatico.test.ts` (hash do SQL versionado, 7 consultas), `criterios-acelerato.test.ts` (4 marcas), hash de campos | consulta fora de `CONSULTAS` | passou |
| Estrutural: começa por SELECT, sem `;`, sem LIKE, coluna json só em JSON_TABLE | `estrutura das consultas Q6 e Q7` | uma ocorrência de `campos_personalizados_etapa` | passou |
| GRANT inalterado | `git diff` sem `grants.ts`; testes de papel existentes dentro da suíte | n/a | passou |

## Execução (2 workers, load 3,99 na partida)
- `git pull --ff-only origin feature/069-l9-etapa`: Already up to date.
- server, `vitest run --coverage`: `81 files passed, 33 skipped; 1647 passed, 232 skipped`; cobertura 100% nos quatro eixos (4865/4865, 3251/3251, 1101/1101, 3838/3838).
- packages: contratos 204 verdes, metricas 1262 verdes, mock 258 verdes, todos com 100% nos quatro eixos.
- tools/docs-contratos: `14 files, 102 passed`.
- `pnpm exec prettier --check web packages tools`: All matched files use Prettier code style.
- `pnpm run docs:check`: `ok (936 páginas Markdown, 69 métricas, 2 eventos)`.

## Vermelho antes do verde
- `forge-testes --vermelho 69e72a7...`: `nenhum teste prova a mudança.` Limite da ferramenta: reverte também os testes novos junto com o código, e a suíte da base não tem o que rodar. Sem veredito útil.
- Prova manual numa cópia fora da worktree: `server/src` da base com os testes do HEAD: `51 failed | 26 passed (77)` nos quatro arquivos; todos os 25 testes de `acelerato-campos-etapa.test.ts` que dependem do código novo caíram.

## Mutação (6 mutantes à mão na cópia, sobre `allow-list.ts` e `sql.ts`)
| Mutante | Resultado |
|---|---|
| remover a recusa por `tipo` texto | morto (1 falha) |
| aceitar valor sem checar domínio | morto (3 falhas) |
| `preenchido` sempre verdadeiro | morto (1 falha) |
| Q7 projetando `f.valor` | morto (2 falhas) |
| `CHAR_LENGTH(TRIM(...))` sem `TRIM` | morto (2 falhas, só pela comparação de texto da projeção) |
| `VARCHAR(80)` da Q6 para 4000 | morto (2 falhas) |

Sobreviventes: 0.

## Não feito
- Execução real da Q6 e da Q7 num MySQL: o duplo devolve linhas prontas, então o comportamento do `JSON_TABLE` e do `TRIM` só é guardado pela forma do texto. Fica para a primeira coleta real.
- `.pg.test.ts` não rodaram (sem Postgres neste ambiente).

## Achados
- A1 (recomendado) server/tests/acelerato-campos-etapa.test.ts:72 · semântica de TRIM e JSON_TABLE só verificada pelo texto da consulta; conferir numa coleta real com o dono antes de ligar a F3.
