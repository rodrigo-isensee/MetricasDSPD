---
tipo: review
contrato: 1
pedido: 059-aba-apontamento
branch: feature/059-coleta-worklog
commit: 82d136001f371cef0e142426d092e4b1f15e6df3
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-02
---
# Review: 059-aba-apontamento, branch da coleta do worklog (trilha A, E2.37, K-193)

**Rodada 2 (revalidação por delta). Veredito: aprovado em `82d1360`.** Os recomendados A3 a A6, A8 e A9 da rodada 1 foram aplicados. A2 e A7 foram implementados como o plano decide (§3.3 e §3.1, ramo do discovery em `5661e86`), e a migração 0032 traz o preenchimento. O bloqueante A1 (teto da decisão M14) fica resolvido pela decisão do dono de 2026-11-02 (teto por PR da aba): um PR para a develop com a linha `teto: excedido` e o motivo no corpo. Sobra um recomendado novo (A10), que não devolve.

## Delta lido
- Intervalo `1dc1b37..82d1360`, 15 commits (de `a697ee9` a `82d1360`), lido pela saída de `forge-check delta --parecer docs/reviews/059-beta.md`: `docs/architecture/server.md`, as migrações 0026 (comentário) e 0032 (nova), `checksums.json`, `coleta-businessmap.ts`, `eliminar-pessoa-apontamento.ts`, `apontamento/coleta.ts`, `dicionario.ts`, `eliminacao.ts`, `gravacao.ts`, `index.ts`, `registro.ts`, `coleta-comando.ts`, `coleta.ts` (cards), `usuarios.ts` e os testes do intervalo (li os nomes de todos os casos novos e os blocos de A2, A7 e da 0032 em `apontamento.pg.test.ts`).
- Fora do delta, lido só para conferir o efeito: `processarFolha` inteiro (`coleta.ts:140-198`, onde entram os `vistos`) e o cálculo do estado (`coleta.ts:339`).
- Já lido na rodada 1 e não relido: o restante da branch (migrações 0021 a 0031, cliente, lotes, supressão, hierarquia, montagem, comando de carga) e as conferências do §3.1 a §3.6.
- O commit `28f92fe` (parecer de segurança renovado, só `docs/security/059-beta.md`) está na worktree, acima da ponta revisada, e não mexe em código.
- Plano `docs/architecture/features/059-aba-apontamento.md` §3.1 (decisão A7) e §3.3 (decisão A2) em `5661e86`.

## Resolução dos achados da rodada 1
- **A1 (bloqueante): resolvido pela decisão do dono** (2026-11-02, teto por PR da aba). Recontagem em `82d1360`: `git diff --numstat --no-renames origin/develop...82d1360 -- server`, sem `.md`, sem o snapshot do esquema e sem `checksums.json`, dá **5316 linhas** (1870 em `server/src` e `server/migrations`), ainda com a trilha B herdada. O PR da coleta para a develop leva no corpo a linha `teto: excedido, <n> linhas, <motivo>`, com o número recontado na hora do PR (depois do merge do α, sem a trilha B). Sem essa linha, o A1 volta.
- **A2 (recomendado): aplicado como a decisão A2 do plano.** A 0032 troca a chave por `UNIQUE (logged_time_id, versao)` com o mesmo nome (`uq_stg_apontamento`, para o `ON CONFLICT ON CONSTRAINT`) e `CHECK (versao >= 1)`. O preenchimento usa `row_number()` por id na ordem de `stg_sk`, com o gatilho desligado só entre o UPDATE e a volta, dentro da transação. O `down` recusa quando há hash repetido por id. `ix_stg_apontamento_ultima` sai, porque o índice da chave nova serve ao `ORDER BY versao DESC LIMIT 1`. A gravação (`gravacao.ts:48-52`) busca a última versão por `LATERAL` e insere só com o hash diferente (`IS DISTINCT FROM`), com `versao` = última + 1. No fato, `versoes` passa a ser `max(versao)`. Os testes cobrem A, B, A (três linhas, fato A, `versoes` 3), A, A (uma linha), a invariante fato igual à maior versão em todos os ids, a chave (23505, 23514), o preenchimento e o `down`. Confere.
- **A3: aplicado.** O comentário da 0026 e o `motivo` da versão de critério (`dicionario.ts:214`) dizem que a vigência vale a partir da data e que a varredura reclassifica a janela relida. O comentário da 0026 mudou, mas o DDL não: o checksum é do DDL serializado (`checksums.ts:6-7`), e `checksums.json` só ganhou a linha da 0032.
- **A4: aplicado.** A recusa da versão repetida com outro sha256 usa `starts_with` (sem curinga do LIKE) e roda depois da saída "sem diferença", então a recarga do mesmo arquivo continua idempotente. A regex do campo `versao` (`dicionario.ts:42`) não aceita `:`, então o prefixo não casa com outra versão. Testes unitário e `.pg`. Confere.
- **A5: aplicado.** `ErroColetaBm` da etapa vira `apontamento: { falha: <codigo> }`, os cards e a projeção saem no JSON, o código de saída é 3, e erro que não é `ErroColetaBm` segue subindo, com teste.
- **A6: aplicado.** A etapa roda só com `--projetar` (`coleta-comando.ts:125`), e o `server.md` explica por quê. Ver o A10.
- **A7 (recomendado): aplicado como a decisão A7 do plano.** Os cinco códigos de recusa ficam numa lista fechada (`coleta.ts:37`), vão para `recusas` e para o JSON como `recusados`, e não entram no estado. `classificacao-falhou`, falha de lote e as duas guardas seguem como falha de execução. Recusa com id válido já põe o id em `vistos` (`coleta.ts:149`) e não tira o lote de completo; recusa com id nulo tira. A guarda `recusa_em_massa` (mais de 5 por cento e pelo menos 10, ajustáveis em `DepsApontamento`) segura a marca e o checkpoint da carga. Testes unitários e `.pg` cobrem os casos de borda do plano (5 por cento exato e menos de 10 não disparam). Confere.
- **A8: aplicado.** Os comentários de `registro.ts` e `gravacao.ts` dizem que o bit 16 está reservado e só é preservado pela máscara 24, com teste da máscara.
- **A9: aplicado.** A etapa recebe o pool do coletor por argumento, e o apelido saiu.

## Achados
- A10 (recomendado) server/src/entradas/apontamento-businessmap.ts:15 · o comentário diz que o incremental roda como etapa do bm:coleta incremental; depois do A6, só roda com --projetar. Acerte o texto.

## Ferramentas e outros pareceres
- O `docs/engineering/praticas.md` não tem regra "decidida por: `<comando>`". A pendência do tech-lead com o arquiteto continua (a mesma do `059-alfa.md`), sem review manual de lint ou formatação.
- CI verde em `82d1360` (run 41424217697). Não refiz a suíte. O autor relatou pronto verde e 205 testes `.pg` verdes.
- Segurança: `docs/security/059-beta.md`, aprovado em `82d1360` (commit `28f92fe`), com o recomendado A4 (minimização do nome de quem é de Outra área). Não refiz os achados.
- Devops: o delta não mexe em workflow, compose nem nginx.
- QA: vem agora, sobre `82d1360`.

## Pendências fora da volta do autor
- Linha `PESSOA_ELIMINADA_SAL=` no `.env.example`: fica com o tech-lead na integração (decisão técnica do Jarvis de 2026-11-02 04:30).
- `data-model.md` §3, §8 e §9 com as tabelas novas e a chave `(logged_time_id, versao)`: G3 do arquiteto, em PR de documentação (§7.2).
- A rota renumera a view de quem é do time para depois da 0032 (E2.48).
- A trilha B desta branch é a anterior à volta dela. Depois do merge do α na develop, a coleta traz a develop por merge na hora do PR (`R-FLUXO`), e o `forge-check pr` aponta o que invalida.
- A 0032 precisa entrar antes da carga inicial real na máquina do dono (plano §3.3).
