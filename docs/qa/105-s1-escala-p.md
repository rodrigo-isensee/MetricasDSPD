---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-s1-escala-p1-p5
commit: 549dfd8b9d8c7e7f85eca204ac7db7740a2f561c
parecer: aprovado
resultado: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-16
---
# QA: S1 só com a escala P1 a P5 (E7.238, decisão S1 B do dono)

Obrigações nomeadas (decisão S1 B, pedido 105): CA-1 migração 0040 do zero (`dim_chamado.escala_p boolean NULL`, só em `dim_chamado`); CA-2 migração sobre base com dados (linhas intactas, coluna nasce nula); CA-3 normalizador e projetor gravam `escala_p`; CA-4 `ac:reprojetar-escala` preenche só onde nula, pelo staging, e é idempotente; CA-5 o S1 conta só `escala_p` diferente de false e informa `foraDaMatriz {outrasEscalas, semPrazo}`; CA-6 sem escala projetada o S1 real responde sem dado real, com motivo; CA-7 critério `105:S1-escala-p` registrado; CA-8 cartão mostra a contagem de fora da conta.

Histórico: a 1ª rodada (head `744e5a36`) reprovou com A1 e A2 (testes de banco) e três recomendados (A3 a A5). Esta revalidação é no head `07cfc675`. Sem PR: a suíte inteira fica para o CI do PR e não afirmo CI verde.

Sem achados abertos: A1 a A5 da 1ª rodada estão resolvidos, na seção Revalidação.

## Achados

## Revalidação (head 07cfc675, escopo incremental)
Delta lido com `forge-check parecer delta` (intervalo 744e5a36..07cfc675, sem o que veio da develop): 0040, `deploy/sql`, contratos, S1, mapa, critérios, os testes de banco e o snapshot. Árvore limpa.

- A1 resolvido: `acelerato-l9c.pg.test.ts:25` tira `fluxo` e `escala_p`; passa.
- A2 resolvido: `esquema.snapshot.json:80` traz `dspd_ac.dim_chamado.escala_p boolean NULL`; `catalogo.pg` passa.
- A3 resolvido: o novo teste "as exceções de registro posterior contam só dentro da escala P" mata o mutante U5 (`fechados.length - apuraveis.length`): 1 falha em 53 testes; restaurado.
- A4 resolvido: o novo teste do cartão (7 de outras escalas, 3 sem prazo) mata o mutante U8 (`semPrazo` no lugar de `outrasEscalas`): 1 falha em 38 testes; restaurado.
- A5 resolvido: `deploy/sql/0040_ac_dim_chamado_escala_p.sql` existe (`ADD COLUMN IF NOT EXISTS`, registro em `pgmigrations`) e entra no `consolidado.sql`; 40 migrações em `server/migrations`.
- Meu caso de PostgreSQL real entrou no head como `server/tests/acelerato-escala-p.pg.test.ts` (5 casos: 0040 do zero, base com dados, normalizador e projetor, reprojeção só onde nula e idempotente, 2600 linhas em dois lotes).

Execução (banco descartável `qa105b` no PostgreSQL 17 do Compose, criado e removido por mim):
- `acelerato-escala-p.pg`, `acelerato-l9c.pg`, `catalogo.pg`, `migracoes.pg`, `acelerato-projetor.pg`, `grants-api-colunas.pg`: 6 arquivos, 33 testes, todos passam.
- `test:pg` completo (`--project pg`): 335 passam, 12 falham, todas nos dois arquivos de ambiente conhecidos (K-392): 11 em `apontamento-rota.pg.test.ts` e 1 em `referencia-times.pg.test.ts`. Nenhuma falha nova; nenhuma em arquivo do S1.

## Critério → teste → resultado (revalidado)
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| CA-1, CA-2 | `acelerato-escala-p.pg` casos 1 e 2 | coluna só na dimensão; base com dados | passou |
| CA-3 | caso 3 e `acelerato-normalizador.test.ts` | P, família, fora do mapa, vazio | passou |
| CA-4 | casos 4 e 5 | nulo x preenchido; idempotência; mais de um lote | passou |
| CA-5 | `acelerato.test.ts` (S1), com o teste novo de U5 | 19 x 20; escala fora da matriz | passou |
| CA-6 | `painel-real-f6.test.ts` | escala não projetada | passou |
| CA-7 | `criterios-acelerato.test.ts` (dez entradas: S8, EI_SUST 9º, S1 10º) | histórico preservado; ordem da junção | passou no head 549dfd8b |
| CA-8 | `sustentacao.test.tsx`, com o teste novo de U8 | números no lugar certo | passou |
| Migração (pg) | `acelerato-l9c.pg`, `catalogo.pg` | down/up e snapshot | passou local |

## Vermelho antes do verde e mutação
Da 1ª rodada (código da base `57989aa0` sobre os testes do head): os testes novos do S1, da escala, do critério e do cartão caem sem a implementação. Mutantes M1 a M4 e U1 a U8: todos mortos, exceto M1 (equivalente observável, aceito: o SELECT já filtra nulos na mesma transação). U5 e U8 passaram de sobreviventes a mortos nesta rodada.

## Revalidação da junção (head 549dfd8b, só a junção com a develop)
Head revisado: 549dfd8b (merge da develop edfff4d8, com #505 EI_SUST e #515 K-394, sobre 07cfc675). Escopo incremental, só a junção.

Delta: o `forge-check parecer delta` lista no domínio os arquivos que o S1 e a EI_SUST tocam em comum (criterios-acelerato.ts e seu teste, origem.ts, schemas.ts, openapi.json, metricas.md, CHANGELOG.md, acelerato.test.ts, painel-real-f6.test.ts). Conferi que o S1 não mudou: comparei as linhas mudadas de ab12a37f..07cfc675 com as de origin/develop..549dfd8b. Mesmos arquivos, mais docs/devops/105-s1-escala-p.md (documento); no código e nos testes a única diferença é a ordem da lista de critérios (EI_SUST 9º, S1 10º) e o teste de criterios-acelerato com dez entradas e o par 10/S1. Migração 0040, normalizador, projetor, S1, serviço e cartão idênticos aos aprovados.

Execução local no head (só os cenários; a suíte inteira fica para o CI do PR; não afirmo CI verde, sem PR):
- server: criterios-acelerato.test.ts e painel-real-f6.test.ts, 2 arquivos, 64 testes passaram.
- packages/metricas: acelerato.test.ts (S1), 27 passaram.
- web: sustentacao.test.tsx (cartão do S1), 25 passaram.

Resultado: aprovado, sem achados. A marca 105:S1-escala-p segue com a métrica S1 e a EI_SUST fica na 9ª posição.
