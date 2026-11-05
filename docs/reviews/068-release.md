---
tipo: review
contrato: 1
pedido: 068-release-065-067
branch: develop
commit: b66179b9f014768197a9017cd721b67cda2c3a47
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-05
---

# Review da release 068: develop contra homolog (E1.7, K-219)

Candidata: `develop` em `b66179b9f014768197a9017cd721b67cda2c3a47`. Base: `homolog` em `92c58922fe23852a7504b85f1e496f25e7e02f85`. Critério: `docs/engineering/fluxo-homologacao.md` §4. Este parecer confere que cada um dos 11 PRs de `92c5892..b66179b` tem review aprovado e passou pelos portões, e que a ordem e o banco fazem sentido para a homolog. Não relê código já revisado e não roda suíte: a suíte da ponta é da E1.8 (QA) e a segurança da release, da E1.9.

## Achados

- A1 (recomendado) CHANGELOG.md:5 · Sem notas para os PRs 212 a 225: a última seção é a 0.2.0. O §4 item 4 pede notas de versão no PR de release (E1.5); escrever antes dele, com as versões de critério datadas (065, 066, 067, L9-b).
- A2 (recomendado) server/src/modulos/acelerato/controle.ts:27 · Depois da promoção, a coleta ac na homolog falha com parametros-mudaram até registrar 069:L9-b-campos-etapa e rodar com --reconhecer-mudanca; o bm:ref-sync roda antes da coleta bm. Vale o §4 item 3 antes da main.
- A3 (recomendado) pnpm-lock.yaml:5339 · O PR 218 diz trazer o histórico da main, mas o squash não leva ancestralidade: nem homolog nem main são ancestrais da develop. O merge-tree com as duas sai limpo e com a árvore da develop (4d0a245), então é só registro.

## PR x pareceres
Head revisado é o `commit` do frontmatter de cada parecer. Onde o head do PR é posterior, conferi com `git log --no-merges <revisado>..<head> -- . ':!docs'` que o delta fora de `docs/` é só commit já na `develop` (outro PR desta tabela ou já na homolog: 1f1da67, 4e755ed, 5e93513). Todos os 11 PRs estão `MERGED` na `develop` com 19 checks `SUCCESS` e 4 ou 5 `SKIPPED`, nenhum vermelho (`gh pr view`).

| PR | O que entra | Review (head) | QA | Segurança | Delta até o head do PR, fora de docs |
|---|---|---|---|---|---|
| #212 | 063: plano, ADR 0025, especificação do aviso (só docs) | `063-docs-worklog-teto` (63db837) | aprovado | não se aplica | só 1f1da67, 4e755ed, 5e93513, já na homolog |
| #214 | 065: BLOQUEADOS e O5 sem dado real | `065-bloqueados` (c1e0c06) | aprovado | não se aplica | nada |
| #215 | 067: dia atípico acima de 10 h | `067-dia-atipico` (46ea941) | aprovado | não se aplica | #214 |
| #216 | 066: S8 só com resposta | `066-s8` (a54ac8d) | aprovado | não se aplica | nada |
| #217 | 069 L3-a: O2 e parados por etapa pela equipe | `069-l3-equipe` (4f52c57) | aprovado | não se aplica | nada |
| #218 | 068: zod 4 já na develop, ws 8.22.1 no lockfile | `068-zod` (da33f45) | aprovado (ffbf897) | aprovado (20ba6c6) | #214 a #217 |
| #219 | 069 M1-a: aviso de coleta parcial no apontamento | `069-m1-frescor` (01f29bc) | aprovado | não se aplica | #217, #218 |
| #220 | 069 L2-a: mapa de campos do BusinessMap, `bm:ref-sync` | `069-lote-l2a`, `069-z1-l2a`, `069-l2-campos` (1f62f20) | aprovado | aprovado | #219 |
| #221 | 069 L2-b: colunas de lista do `dim_card` | `069-z5-l2b` (53361bc) | aprovado | aprovado | nada |
| #225 | 069 L9-a: sem zero falso em S3 e S2 | `069-z7-l9a`, `069-z8-l9a`, `069-z9-l9a` (c28bae0) | aprovado | não se aplica | #221 |
| #224 | 069 L9-b: campos de etapa do Acelerato até o staging | `069-l9-etapa` (fb8ea39), `069-z9-l9b` (2ae89ee) | aprovado | aprovado (fb8ea39) | #225 |

Segurança "não se aplica": o PR não mexe em coleta, dependência nem dado de pessoa; a E1.9 cobre a release inteira. O modelo de ameaças do 069 (`docs/security/069-modelo-ameacas.md`) cobre L2-a, L2-b e L9-b.

Teto M14: os PRs acima de 150 linhas trazem a linha `teto: excedido` no corpo (#214 com 591, #220 com 677, #224 com 397, #225 com 255), aceita nos reviews. Os demais ficam abaixo (#215 101, #216 128, #217 109, #219 106, #221 133; #212 e #218 sem código).

## Ordem e banco
- **Sem migração nesta release:** `git diff 92c5892 b66179b -- server/migrations` está vazio. O L2-b grava as 10 colunas de lista no `dim_card` e o L2-a escreve em `dspd_bm.ref_dominio`; as duas já existem na homolog (`0006_bm_projecoes.ts`, `0007_bm_referencia.ts`). O L9-b grava em `payload.campos` do staging, sem coluna nova; a releitura gera versão nova de cada chamado (append-only).
- **Ordem coerente:** o L2-a (#220, carregador do `ref_dominio`) entra antes do L2-b (#221, projetor que lê o mapa); o L9-a (#225) antes do L9-b (#224, a ponta). O #218 só repete o zod da develop e soma o `ws` transitivo.
- **Merge para a homolog:** `git merge-tree --write-tree 92c5892 b66179b` sai limpo, com a árvore da `develop` (4d0a245). O mesmo vale contra a `origin/main` (30e8091), então o PR de release não terá conflito.
- **Dependência:** só `ws` 8.22.0 para 8.22.1 no `pnpm-lock.yaml` e o script `bm:ref-sync` no `server/package.json`; parecer `docs/security/068-zod.md`.

## Riscos
- **Coleta muda nas duas fontes** (L2-a, L2-b, L9-b): o §4 item 3 se aplica antes da main (A2). Passos na homolog: `bm:ref-sync`, registro do critério e coleta ac com `--reconhecer-mudanca` (está no corpo do #224), depois um ciclo incremental com a contagem conferida.
- **Interface muda** (065 O1 e O5, L9-a S2 e S3, M1-a aviso): a release pede validação manual do dono; as revisões de UX estão em `docs/ux/065-revisao-bloqueados.md`, `066-revisao-s8.md`, `069-m1-frescor-revisao.md` e `069-z7-l9a.md`.
- **Mudança de critério de cálculo:** versões registradas com data no 065 (`core/criterios.ts`), 066 (`criterios-acelerato.ts`), 067 (`067:limite-dia-atipico`) e L9-b (`069:L9-b-campos-etapa`, sem métrica afetada). L3-a e L9-a ficam sem versão por decisão do desenho, aceita nos reviews (não recalculam). Entra nas notas (A1).

## Rollback
A promoção é um merge commit único: reverter é `git revert -m 1 <merge da promoção>`, nunca reset nem force. Sem migração, não há reversão de esquema. Reverter o L9-b deixa versões do staging com `payload.campos` a mais, que ficam (histórico não se apaga). Reverter o L2-a sem o L2-b deixa o projetor lendo um `ref_dominio` que ninguém atualiza: os dois se revertem juntos.

## Parecer
Aprovado. Os 11 PRs têm review aprovado no head revisado, QA aprovado e, onde cabe, segurança aprovada; nenhum entrou sem os checks da `develop`. Sem migração, ordem coerente, merge limpo para a homolog e para a main. Os três achados são recomendações e não seguram a E1.8 e a E1.9.
