---
tipo: qa
contrato: 1
pedido: 105-k411-roteiro-dono-texto
branch: docs/105-k411-roteiro-dono-texto
commit: 38e5579fc4b11408a372b3aecd549cc3e822f876
parecer: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-17
---
# QA: 105-k411-roteiro-dono-texto (K-411)

Escopo: delta `origin/docs/105-k410-roteiro-dono..38e5579f`, só `docs/devops/105-roteiro-dono.md`, linhas 60, 242 e 265 (A4 a A6 do review do K-410). Só documento, sem código nem teste novo (vermelho antes do verde e mutação não se aplicam). A suíte inteira fica para o CI do PR; o CI está parado por cobrança e este parecer não afirma CI verde.

## Achados

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| A4: linha 242 coerente com as linhas 209 e 248 | leitura cruzada das três linhas | n/a | passou |
| A5: efeito da linha 265 correto contra a 0041 | leitura contra `deploy/sql/0041_bm_ref_tipo_card_habilitador.sql` e `server/migrations/0041_*.ts` | n/a | passou |
| A6: vírgula na linha 60 | diff do delta | n/a | passou |
| Docs válidas | `pnpm run docs:check` | n/a | passou |

## Cenários e resultado real
- Linha 242 (nova): "para tirá-la, só pela receita A, sem repetir o `down 1`". A linha 248 diz "Não repita o comando" e a linha 209 diz "Não faça `down 2` nem mais sem falar com o Jarvis" e que a 0040 sai "ou por restauração (receita A)". As três dizem a mesma coisa: depois do `down 1` da 0041, a 0040 só sai pela receita A. A contradição apontada (outro `down 1`) sumiu. Observação sem achado: a frase descritiva da linha 209 ("o segundo tira a 0040") descreve a mecânica da sequência e vem logo antes da proibição; não contradiz.
- Linha 265 (nova): "o CHECK volta a seis valores e recusa o `bm:ref-sync` do código da release (que grava `habilitador`)". O `down` da 0041 volta ao CHECK de seis valores (`ANTES`), e `CATEGORIAS` em `server/src/modulos/businessmap/conferencia.ts:10` inclui `habilitador`. A sequência de verificação da linha 262 (conta `habilitador` no CHECK) bate com o texto. O efeito antigo ("o Enabler sai da categoria") estava errado com contagem 0, como o review notou. Correto agora.
- Linha 60: a vírgula depois de "(tabelas do toque do BusinessMap)" entrou; a frase lista 0038, 0039, 0040 e 0041 sem ambiguidade.
- `pnpm run docs:check`: `docs:check: ok (1764 páginas Markdown, 70 métricas, 2 eventos).`
- Diff do delta: 1 arquivo, 3 inserções e 3 remoções, só as linhas citadas.

## Resultado da execução
Ambiente: worktree `/home/rodrigoisensee/MetricasDSPD-061`, head `38e5579f`. Todos os cenários passaram; zero bugs. Sem PR, CI parado: nada de CI verde afirmado.
