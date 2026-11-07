---
tipo: qa
contrato: 1
pedido: 075-bloqueios-reais
branch: feature/075-l4b-fato-bloqueio
commit: 65859649df7bc4525b94521938fe9bc75150038d
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-07
---
# QA: 075-bloqueios-reais, lote 4b (projetor monta `fato_bloqueio`, K-204)

Contrato: ADR 0029, plano `docs/analises/075-plano.md` (Lote 4b e item QA da seção 7). Segurança (108983f9) e review (37252d36) aprovados sobre o mesmo código; os commits depois de `65859649` só trazem esses dois pareceres (`git diff --stat 65859649 HEAD`: 2 arquivos em `docs/`).

## Achados
- A1 (recomendado) server/tests/projetor-businessmap.test.ts:245 · o recomendado 1 (marcos pela vigência de `ref_coluna`) não prova o instante: o mutante que avalia a vigência sempre numa data futura sobrevive; falta versão na coluna 10 antes de 2026-10-31 esperando marco. Somar no 4c.
- A2 (recomendado) server/src/modulos/businessmap/projetor.ts:161 · A3 do review (TL-A6, ADR 0003): sem PostgreSQL local, o tempo do `bm:projetar` e o `EXPLAIN` do fato não foram medidos; fica registrado como não medido e vai ao 4c, pela decisão técnica de 11:41.
- A3 (recomendado) server/tests/projetor-businessmap.test.ts:262 · dublê não prova o `tipo = 'inicio'` do filtro nem o `motivo` no SET do UPDATE (mutantes M5 e M13 sobrevivem); só o `.pg` da CI cobre a reclassificação. Aceito porque o `.pg` do 4b a exercita; reforçar no 4c.

## Conferência do lote contra o plano
- Diff `b906f4fa..65859649`: 8 arquivos, 126 inserções e 23 remoções (código: `projetor.ts`, `bloqueios.ts`; testes: 2 unitários, 2 `.pg`; docs: `data-model.md` e `businessmap-api-configuracao.md`).
- `git diff --stat` sobre `allow-list.ts`, `coleta.ts`, `server/src/plataforma` (inclui `grants.ts` e `lgpd.ts`), `server/migrations` e `packages/contratos`: vazio.
- Mapa vazio: `ctx.motivos.get(código ?? '') ?? MOTIVO_NAO_CLASSIFICADO`; `.pg` e dublê esperam "não classificado" em todos.
- Mapa novo reclassifica: `contextoDoFato` lê o domínio vigente uma vez por projeção e o fato é remontado de `evt_bloqueio`; o `.pg` compara `SELECT *` do evento antes e depois (conteúdo e contagem idênticos) e a terceira projeção dá `fatosBloqueio.inseridos` 0.
- Calendário: dublê (offset e feriados da referência dão 1 h onde o padrão dá 2 h) e `.pg` (calendário `4b` muda 2 para 1).
- Controle 2: `.pg` exige zero linhas com `motivo` fora de `MOTIVOS_BLOQUEIO_PUBLICADOS`; o mapa só aceita rótulo dos 8 (`motivosDeLinhas`).
- Aberto sem `fim` e sem duração; fim igual ao início com duração 0 (P-075-9): dublê (`[..., null, null, ...]`, `0`) e `.pg` (card arquivado antes do início).
- Motivo do início na troca de motivo (P-075-10): o derivador mantém o do início (`bloqueios.test.ts`, "troca de motivo bloqueado não gera evento"), e o fato lê o `motivo_codigo` do evento de início.
- Desvio aceito (10:12): `UPDATE ... IS DISTINCT FROM` só do que mudou, `INSERT ... DO NOTHING`, sem `DELETE` (dublê confere os três textos); a reexecução sem mudança grava zero (`.pg`).
- Recomendados: 1 (vigência) com ressalva do A1; 2 (`archivedAt` Date), 3 (`coletadoEm` inválido lança `RangeError` sem eco) e 4 (nota `campo_fora_do_dominio` só do fornecedor) com teste em `bloqueios.test.ts` e mutante morto; A3 do review do 2b incluído no 4.
- `VERSAO_PROJETOR` = `bm-f4/3` (asserção no `.pg` do projetor).

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Plano 4b: mapa vazio, todos "não classificado" | dublê "monta o fato dos eventos"; `.pg` 4b | vazio (mapa sem linha, código nulo) | passou (dublê e CI) |
| Plano 4b: mapa novo reclassifica o passado, `evt_bloqueio` idêntico | `.pg` 4b (eventos antes e depois, `toEqual`) | repetição (zero linha nova na terceira projeção) | passou na CI |
| Plano 4b: troca de calendário recalcula a duração | dublê "troca de calendário"; `.pg` 4b | calendário vigente ausente x presente | passou |
| Controle 2: `motivo` só com os 8 valores | `.pg` 4b (`motivo <> ALL(publicados)` dá 0) | valor fora do conjunto | passou na CI |
| Aberto sem `fim` e sem duração | dublê e `.pg` | fim nulo | passou |
| P-075-9: fim = início, duração 0 | dublê e `.pg` | limite inferior (0 h) | passou |
| P-075-10: motivo do início | `bloqueios.test.ts` | troca de motivo no mesmo bloqueio | passou |
| Desvio 10:12: sem `DELETE`, grava só o que mudou | dublê (`IS DISTINCT FROM`, `DO NOTHING`, zero `DELETE`); `.pg` (terceira projeção) | idempotência | passou; mudança só de `motivo` no SET sem prova no dublê (A3) |
| Recomendado 1: vigência de `ref_coluna` | dublê (coluna 10 entrega depois trabalho; coluna 99 desconhecida); `.pg` (descarte) | vigência vencida; coluna desconhecida | passou; instante passado sem prova (A1) |
| Recomendados 2, 3, 4 | `bloqueios.test.ts` | `Date`, data inválida, campo fora do domínio | passou |
| `VERSAO_PROJETOR` `bm-f4/3` | `.pg` do projetor | n/a | passou na CI (dublê não confere) |
| Arquivos sem diferença contra a base | `git diff --stat` | n/a | vazio |

## Execução
- `npx vitest run tests/bloqueios.test.ts tests/projetor-businessmap.test.ts --maxWorkers=2` em `server`, na worktree: `Test Files 2 passed (2)`, `Tests 44 passed (44)`.
- Os `.pg` ficam com a CI do push: `gh run view 42375310643 --repo rodrigo-isensee/MetricasDSPD --json headSha,conclusion` devolveu `{"conclusion":"success","headSha":"65859649df7bc4525b94521938fe9bc75150038d"}`, o mesmo SHA do código.
- Suíte completa não rodada nesta delegação (o brief limita aos dois arquivos).
- Medida do A3 do review: sem PostgreSQL local (`psql` e `pg_ctl` ausentes), não medido; vai ao 4c.

## Vermelho antes do verde (base b906f4fa, cópia em `/tmp/claude-1000/qa-engineer-075-l4b/base`)
`bloqueios.ts` e `projetor.ts` da base com os testes de `65859649`: `Tests 6 failed | 38 passed (44)`.
- `bloqueios.test.ts` (4): entregue, descartado, arquivado no marco (assinatura de marcos como função) e o caso novo de `Date`, `coletadoEm` e nota.
- `projetor-businessmap.test.ts` (2): "monta o fato dos eventos" e "troca de calendário".
Parte só prova a ausência do código; por isso mutação à mão sobre o head (cópia em `/tmp/claude-1000/qa-engineer-075-l4b/mut`), 13 mutantes:
| Mutante | Resultado dos 44 testes |
|---|---|
| M1: motivo sempre "não classificado" | 1 falhou |
| M2: `IS NOT DISTINCT FROM` no UPDATE | 1 falhou |
| M3: calendário sempre o padrão | 1 falhou |
| M4: aberto com duração 0 | 1 falhou |
| M5: sem `tipo = 'inicio'` na leitura | sobreviveu (só o `.pg` o alcança; A3) |
| M6: vigência avaliada sempre em 2099 | sobreviveu (A1) |
| M7: nota com o mapa inteiro | 1 falhou |
| M8: sem o ramo `Date` do `archivedAt` | 1 falhou |
| M9: sem o `RangeError` | 1 falhou |
| M10: versão `bm-f4/2` | sobreviveu (afirmada só no `.pg`, verde na CI) |
| M11: `RETURNING 1` no INSERT | sobreviveu (equivalente: o dublê e o texto não mudam o efeito) |
| M12: sem a contagem `projecao_bloqueio_fato` | 1 falhou |
| M13: `motivo` fora do SET | sobreviveu (reclassificação só no `.pg`; A3) |
Os sobreviventes M5, M6 e M13 viraram achados recomendados; M10 e M11 têm justificativa acima.

## Regras invioláveis
BusinessMap e Acelerato separados (nenhuma leitura de `dspd_ac`); o fato nasce só de `evt_bloqueio` (código, instante, coluna e fornecedor, nunca texto de pessoa); histórico sem `DELETE` e `evt_bloqueio` intacto; duração pela biblioteca compartilhada com o calendário vigente; `grants.ts`, `lgpd.ts`, `allow-list.ts`, `coleta.ts`, migrações e contratos sem diferença. Nenhuma métrica nova, nada individual.

## Bugs
Nenhum aberto (críticos 0, altos 0, médios 0, baixos 0). Os três achados são recomendados.
