---
tipo: qa
contrato: 1
pedido: 063-worklog-cards-acima-do-teto
branch: docs/063-worklog-teto
commit: ded2bf0dbf099a5782f9478bb195c08c4adc6281
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-04
---
# QA: 063 docs (plano, ADR 0025 e especificação do aviso)

QA documental da branch só de documentação (4 arquivos: plano, ADR 0025, especificação de UX e review). Sem código tocado. Método: leitura dos três documentos na ponta ded2bf0 e conferência contra o código já mesclado na develop (1f1da67, PR 209), por `git show` e `git grep` em `origin/develop`. O `git pull` do brief falhou por rede (`github.com` fora do sandbox); a ponta local já era ded2bf0, igual à `origin/docs/063-worklog-teto` da última busca.

## Achados

- A1 (recomendado) docs/architecture/063-worklog-acima-do-teto.md:149 · O plano manda gravar em `ctl_coleta_contagem` as páginas lidas e os cards incompletos (`apontamento_cobertura`); na develop essa entidade não existe (só `lidos/inseridos/falhas` por entidade). Ajustar o texto ou abrir cartão.
- A2 (recomendado) docs/architecture/063-worklog-acima-do-teto.md:119 · O plano lista o GRANT em `card_id, estado, detectado_em`; o código (`grants.ts:25`) soma `cobertura_sk`, usada no DISTINCT ON do estado atual. Alinhar o texto ao código.
- A3 (recomendado) docs/architecture/adr/0025-coleta-do-worklog-businessmap.md:3 · A ADR e o plano seguem `proposta` com o lote já na develop; falta a transição para vigente depois da leitura do `security-engineer` sobre `page` na lista fechada (ADR 0015).

## Critério → teste → resultado
Conferência documental (texto contra o código da develop); não há teste executável novo.

| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| D-5: leitura de todas as páginas (`page=1..all_pages`) | leitura de `lotes.ts` (cabeçalho, linhas 4 a 9 e 86 a 93) | `all_pages` mudando no meio vira `paginacao_instavel`; sem `pagination` e 1000 itens vira `lote_no_teto` | bate |
| `page` na lista fechada (ADR 0015) | `http.ts:79`, `CONSULTA_WORKLOG` com `^[1-9]\d{0,3}$` | página 0, negativa ou de 5 dígitos recusada | bate |
| Migração 0034 sem INSERT (ADR 0014) | `server/migrations/0034_bm_ctl_apontamento_cobertura.ts` | append-only, `UNIQUE (card_id, estado, coleta_id)`, estado em lista fechada | bate |
| Semeadura no coletor (A2 do review) | `gravacao.ts:144` `semearCoberturaDeFalhas`, chamada em `coleta.ts:282`; idempotente por `NOT EXISTS` | card com evento prévio não é tocado; só `lote_no_teto` de `apontamento` com id numérico | bate |
| Sinal `registroIncompleto` aditivo | `servico.ts:135`, `repositorio.ts:137` `lerCardsIncompletos`; `versaoContrato: 1` | filtro de projeto, tipo e período; sem pessoa nem horas; campo calculado só do último evento do card | bate |
| GRANT por coluna, sem `ctl_coleta_falha` (ADR 0020 R4-5) | `grants.ts:24-25` | papel da aba não lê controle de falha | bate com ressalva (A2) |
| Aviso nos 3 lugares (UX CA-1, CA-3, nota KPIs) | `ApontamentoPage.tsx:126` (faixa abaixo da legenda e acima dos filtros), `CartaoDistribuicao.tsx:45,89,132` (selo, coluna Observação, "Como ler"), `CartaoKpis.tsx:64` | faixa fora do "Ocultar cartões"; campo ausente ou total 0 não mostra nada (CA-12) | bate |
| Dica abre ao ativar o selo (CA-4, A3 do review) | `AvisoRegistroIncompleto.tsx` (selo é botão dentro de `Dica`; `Dica.tsx` abre por clique e Esc, não por foco) | foco simples não abre; o hover do mouse também abre, o que a especificação aceita ("não só ao passar o mouse") | bate |
| Microcopia (CA-8) | `textos.ts:303-320` contra a tabela da especificação | sem "teto", "lote", "1000", "worklog", "paginação" | bate |
| Observabilidade da cobertura (plano C4) | busca de `apontamento_cobertura` e contagem em `coleta.ts` | n/a | não bate (A1) |

## Cenários e resultado real
- `pnpm run docs:check` na worktree (ponta ded2bf0): `docs:check: ok (906 páginas Markdown, 69 métricas, 2 eventos)`.
- Estado da coleta, causa da parada em 1000 (página 1 lida, `pagination` descartada) e dados do spike: conferidos entre plano, ADR 0025 e código anterior; coerentes entre si. Os números do banco (coleta 8, 5 cards) e do spike não são verificáveis aqui (sem banco nem chamada à API, por regra).
- Fora de alcance desta etapa: execução dos testes do lote (parecer de QA do 063 em outro arquivo), E2E e acessibilidade automática.
- Nenhum bug aberto; sem mutação nem vermelho antes do verde, por não haver teste novo.
