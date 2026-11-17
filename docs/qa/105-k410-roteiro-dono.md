---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: docs/105-k410-roteiro-dono
commit: ed794f06103e7f39cd5470812be98121b22d4bc6
parecer: reprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-17
---
# QA: K-410, roteiro do dono alinhado à volta da 0041 (pedido 105, E7.567)

Branch `docs/105-k410-roteiro-dono`, head ed794f06, base acb62951. Diff: só `docs/devops/105-roteiro-dono.md` (+8 -2, seção 4). Documentação, sem código nem teste novo: vermelho-antes-do-verde e mutação não se aplicam. Sem PR: a suíte inteira fica para o CI do PR; este parecer não afirma CI verde.

parecer: reprovado

## Achados
- A1 (bloqueante) docs/devops/105-roteiro-dono.md:248-253 · a receita B passa a servir também à 0041, mas a conferência pós-`down 1` e o aviso seguem só da 0040: com a 0041 desfeita imprime `1`, `2` e `0040_ac_dim_chamado_escala_p`, não `0`, `2`, `0039`; "o segundo `down 1` tira a 0039" e "Com a 0040 desfeita" também não valem.
- A2 (recomendado) docs/devops/105-roteiro-dono.md:31,59-61,198,229 · a subida diz que faltam só 0038 a 0040 e a receita A confere só essas três; o `db:migrate` aplica a 0041 (existe em `server/migrations/`), então "0041 já aplicada" nasce de um passo que o roteiro não anuncia nem confere após a restauração.

## Obrigações → prova → resultado
| Obrigação (K-410) | Prova | Fronteira protegida | Resultado |
|---|---|---|---|
| `down 1` vale para a última migração aplicada (seção 4, linha 208) | leitura contra `105-implantacao-vm.md` seção 7, passo 2 (K-407, `origin/docs/105-k407-roteiro-vm`): mesma regra; o texto fala em última aplicada | última errada | ok |
| Receita B trata a última aplicada, 0040 ou 0041 | SQL `ORDER BY id DESC LIMIT 1` e o nome `0041_bm_ref_tipo_card_habilitador` conferem com `server/migrations/0041_bm_ref_tipo_card_habilitador.ts` e `dspd_core.pgmigrations` | migração errada | ok no passo de decisão; falha na conferência depois (A1) |
| SQL novo conta `habilitador` em `dspd_bm.ref_tipo_card` | esquema `dspd_bm`, tabela e coluna `categoria` conferem com a 0018 e a 0041; o `down` da 0041 recria o CHECK de seis valores e falha com linha `habilitador` (docstring da 0041) | contagem 0 versus maior que 0 | ok |
| Contagem maior que 0: só backup; 0: `down 1` serve | idêntico à seção "Reversão da migração 0041" da K-407 (aberta ou fechada, não rodar `bm:ref-sync`) | linha fechada continua `habilitador` | ok |
| Roteiro executável do começo ao fim na volta da 0041 | leitura do passo 3 inteiro | saída esperada igual à real | falha (A1) |
| `pnpm run docs:check` | executado na worktree: `docs:check: ok (1762 páginas Markdown, 70 métricas, 2 eventos).` | n/a | ok |

## Observações
- Comparação com a K-407: a ordem backup, timers parados e `down 1` com as duas travas coincide; a K-407 também lista a 0041 como possível última, o roteiro do dono só o faz na receita B (A2).
- Não rodei o `down` num PostgreSQL: o comportamento do CHECK vem da K-407 (provado pelo review dela) e da docstring da 0041.
- Reprovação por A1 apenas: texto que o dono executa numa volta em produção e cuja saída esperada contradiz a real.
