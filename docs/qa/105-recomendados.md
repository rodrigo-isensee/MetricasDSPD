---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/099-recomendados-o8-o16-o21
commit: 91043934dd4767310ae3bf81146bb8e5e7e6dec9
parecer: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-15
---
# QA: recomendados do O8, O16 e O21 (pedido 105, K-348, K-352, K-353)

resultado: aprovado. Base 204924b2, head e7bd8dfa (o brief selou af433a56; a ponta mudou com o superRefine alinhado à L24 (a), a cobertura do contratos, o caso (b) do O16 e a formatação, e este parecer vale para ela). Classe N. CI do head e7bd8dfa verde (check-run `bateria` do mesmo sha); a suíte inteira não foi rerrodada aqui (I5). Rodei local só os cenários abaixo.

## Achados
- A1 (recomendado) packages/metricas/src/businessmap/o8.ts:35 · a branch não contém o K-359 (be03b1b1, PR 450); `git merge origin/develop` conflita em o8.ts (comentário da branch ao lado de `tipoComTamanho` da develop) e no CHANGELOG. Só texto: manter as duas linhas; com isso os testes do O8 passam.
- A2 (recomendado) server/tests/o16-real-c8.pg.test.ts:102 · o laço do caso (b) segue sem piso de itens; sobre `meses` vazio passa sem ler nada (o comentário assume que é esperado, janela de 1 dia). A densidade nula só é provada se houver mês; não tentei provar que há.

## Ponto central: o superRefine quebra o K-359?
Não. O superRefine é só na raiz (`resultadoO8`, schemas.ts:930) e a regra é "motivo obrigatório só quando `tipos.length > 0` e todos os tipos têm `porTamanho` nulo" (L24 (a)). Um tipo com `porTamanho` nulo e sem motivo próprio, com outro tipo publicando, passa. Prova em duas camadas:
1. Contrato: `o8-motivo-por-tamanho.test.ts`, caso "aceita um tipo com porTamanho nulo e motivo nulo quando outro tipo publica (L24 (a))": passa (7 de 7 passam).
2. Saída real do K-359 sobre o schema: simulei o merge de `origin/develop` na worktree (conflito de texto resolvido mantendo as duas linhas; merge abortado depois, árvore limpa em e7bd8dfa). Teste temporário (apagado): 25 Melhorias com `tamanho_declarado = 'M'` e 25 Incidentes sem; `calcularO8` devolveu Incidente com `porTamanho` nulo, Melhoria publicando e `motivoPorTamanho` nulo, e `SCHEMAS_RESULTADO.O8.safeParse(r).success` = true (1 passou). Com o mutante `every` → `some` o mesmo teste cai. Na mesma árvore mesclada, `o8.test.ts` e `complementares.test.ts` passam (28 de 28).

## Critério → teste → resultado
| Critério (obrigação) | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| K-353: nenhum tipo publica e motivo nulo é recusado, no campo `motivoPorTamanho` | `o8-motivo-por-tamanho.test.ts` casos 1 e 5 | motivo nulo, 1 e vários tipos | passa; mutantes M1 e M2 matam |
| K-353 / L24 (a): algum tipo publica, outros nulos, motivo nulo, aceito | caso 4 + teste temporário com saída do K-359 | tipo misto | passa |
| K-353: porTamanho nulo com motivo, e publicado sem motivo, aceitos; motivo vazio recusado | casos 2, 3 e 7 | `min(1)`, string vazia | passam |
| K-353: lista de tipos vazia sem motivo é aceita | caso 6 | tipos vazios | passa; mutante M3 mata |
| K-353: ramo esperado do O8 vem da base (d2) e sem tamanho todo nulo com o motivo do contrato (d3) | `painel-real-f6.pg.test.ts` (d2, d3) | base sem tamanho, base com tamanho | CI verde do head (a suíte pg roda no CI) |
| K-352: laços do O16 não vazios, guarda do seed nos casos a2, b e c | `o16-real-c8.pg.test.ts` (a), (a2), (b), (c) | piso de bugs do seed (5), laço não vazio | 4 de 4 passam local contra o Postgres de dev; mutantes M4 e M5 matam |
| K-348: textos do O21 (origem.ts, docs/api) e suposição do seed comentada | leitura do diff (comentários e docs; `o21-real-a1.pg.test.ts` só ganhou comentário) | n/a | coerente: O22 a O24 e O26 seguem mock; CI verde |

## Vermelho antes do verde
O teste novo é `o8-motivo-por-tamanho.test.ts`; o código que ele guarda é o superRefine. Sem o superRefine (condição trocada por `false`, equivalente a removê-lo): 2 falharam, 5 passaram ("recusa porTamanho nulo sem motivo, apontando o campo do motivo" e "recusa motivo nulo quando todos os tipos têm porTamanho nulo"). A versão sem superRefine não tinha o arquivo; falha vista, não é vermelho de `forge-testes` (comando do repositório do Forge, não deste projeto).

## Mutação (feita à mão, restaurada com `git checkout`; árvore limpa depois)
| Id | Mutante | Resultado |
|---|---|---|
| M1 | superRefine do O8 desligado (`false &&`) | morreu: 2 falhas no teste do contrato |
| M2 | `every` → `some` (quebraria o K-359) | morreu: caso L24 (a) falha; o teste com saída real do K-359 também |
| M3 | tira `tipos.length > 0` | morreu: caso da lista vazia falha |
| M4 | laço (a) do O16 esvaziado (`filter(() => false)`) | morreu: `expected 0 to be greater than 0` |
| M5 | guarda do seed trocada por `0 >= 5` | morreu: (a2), (b) e (c) falham |
Sobreviventes: nenhum.

## Revalidação em 91043934 (delta desde e7bd8dfa)
O `forge-check parecer delta` lista no domínio do QA: CHANGELOG.md, docs/api/metricas.md, o8.ts e painel-real-f6.pg.test.ts (o resto veio da develop). Sem marcador de conflito em o8.ts nem no CHANGELOG. Os achados A1 e A2 acima de e7bd8dfa: A1 resolvido; o A2 do review (caso d2) também.
- A1 (merge da develop, K-359): resolvido. O o8.ts traz o comentário novo (L24 a), `tipoComTamanho` por tipo e `algumPublica` para o motivo. `o8.test.ts` passa local (3 de 3). O superRefine do contrato segue compatível: o motivo só sai quando nenhum tipo publica, a mesma regra L24 (a) que o M2 guardava.
- d2 do pg (A1 e A2 do review): o caso deixou de contar `dim_card` e passa a afirmar que cada tipo é nulo ou lista não vazia, e que o motivo do contrato só existe quando nenhum tipo publica. O ramo sem tamanho fica no (d3), como o comentário diz. Fronteira protegida: lista vazia (nunca) e motivo com algum tipo publicando.
- Prova do d2: o job `banco` do CI do head 91043934 está verde (run 43724890774; também `testes`, `rapida`, `seguranca`, `openapi`, `build`, `filtro` e `imagem`; `e2e` e `perf` pulados pelo filtro). Não rodei o pg local.
- Sobreviventes: nenhum. M1 a M5 seguem válidos (o delta não toca o contrato nem o O16).

## Pendências para o CI
Suíte inteira: check-run `bateria` do sha e7bd8dfa (CI verde, run 43722981532). Os testes `.pg` rodam lá; localmente rodei só o O16.
