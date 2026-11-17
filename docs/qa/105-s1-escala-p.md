---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-s1-escala-p1-p5
commit: 07cfc675032c45616599d29a0dc9ec8de547bd8c
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
| CA-7 | `criterios-acelerato.test.ts` | histórico preservado | passou |
| CA-8 | `sustentacao.test.tsx`, com o teste novo de U8 | números no lugar certo | passou |
| Migração (pg) | `acelerato-l9c.pg`, `catalogo.pg` | down/up e snapshot | passou local |

## Vermelho antes do verde e mutação
Da 1ª rodada (código da base `57989aa0` sobre os testes do head): os testes novos do S1, da escala, do critério e do cartão caem sem a implementação. Mutantes M1 a M4 e U1 a U8: todos mortos, exceto M1 (equivalente observável, aceito: o SELECT já filtra nulos na mesma transação). U5 e U8 passaram de sobreviventes a mortos nesta rodada.
