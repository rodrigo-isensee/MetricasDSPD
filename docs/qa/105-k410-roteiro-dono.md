---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: docs/105-k410-roteiro-dono
commit: 907470582198670e6b51f28f1f0248726f4fbdfe
parecer: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-17
---
# QA: K-410, roteiro do dono alinhado à volta da 0041 (pedido 105, E7.567 e E7.572)

Branch `docs/105-k410-roteiro-dono`, head 90747058, base acb62951. Diff de `docs/devops/105-roteiro-dono.md` (só a seção 4 e as menções às migrações). Documentação, sem código nem teste novo: vermelho-antes-do-verde e mutação não se aplicam. Sem PR: a suíte inteira fica para o CI do PR; este parecer não afirma CI verde.

parecer: aprovado

## Achados
- A1 (recomendado) docs/devops/105-roteiro-dono.md:61 · cosmético: falta vírgula entre "(tabelas do toque do BusinessMap)" e "`0040`"; não bloqueia, sem cartão.

## Revalidação (delta ed794f06..90747058)
`forge-check parecer delta` disse "nenhum arquivo do domínio mudou" (o roteiro é documento); li o diff de `docs/devops/105-roteiro-dono.md` à mão.

| Item | Prova | Fronteira protegida | Resultado |
|---|---|---|---|
| A1: conferência por migração na receita B | Tirou a 0040: `0`, `2`, `0039_bm_toque_primeiro`. Tirou a 0041: `1`, `2`, `0040_ac_dim_chamado_escala_p` e `0`. Aviso "o segundo `down 1` tira a migração anterior" cobre os dois casos; "Com a 0040 desfeita" agora só vale na 0040 | migração errada, última aplicada | resolvido |
| CHECK volta a seis valores | O nome `ref_tipo_card_categoria_check` do SQL de conferência é o `NOME` da `server/migrations/0041_bm_ref_tipo_card_habilitador.ts`; o `down` recria o CHECK de seis valores (docstring, linha 11); `LIKE '%habilitador%'` dá `0` depois | CHECK de sete versus seis valores | resolvido |
| A2: texto inclui a 0041 | linhas 31, 59 a 61, 198 a 218, título da seção 4 e tabela têm "0038 a 0041", "quatro" e a linha da 0041; `grep` de "três migrações", "0038 a 0040" e "0040 juntas" não acha resíduo (os "três" que restam são as três colunas do coletor) | contagem de migrações | resolvido |
| A3: "última migração aplicada" | linha 275 (`down 1` só para a última migração aplicada, receita B) | n/a | resolvido |
| Contra a K-407 | `origin/docs/105-k407-roteiro-vm`, `105-implantacao-vm.md` linhas 258 a 263: contagem 0 serve ao `down 1`, maior que 0 só backup, sem `bm:ref-sync`; idêntico ao roteiro | linha `habilitador` fechada | ok |
| `pnpm run docs:check` (após `pnpm install --frozen-lockfile`) | `docs:check: ok (1764 páginas Markdown, 70 métricas, 2 eventos).` | n/a | ok |
| Formato do bloco Achados | linha única no formato `A<n> (bloqueante\|recomendado) arquivo:linha · texto`; sem achado aberto, o bloco diz "Nenhum aberto" e o `docs:check` passa | n/a | ok |

## Observações
- Cosmético, sem cartão: linha 61 sem vírgula entre "`0039` (tabelas do toque do BusinessMap)" e "`0040`".
- Receita A confere só contagens (`0`, `0`, `0`); o CHECK não é conferido depois da restauração, o que é coerente: o backup anterior à subida já nasce com seis valores.
- Não rodei o `down` num PostgreSQL: o comportamento do CHECK vem da K-407 (provado pelo review dela) e da docstring da 0041.
