---
tipo: qa
contrato: 1
pedido: 089-apontamento-qualidade-d2-d3
branch: feature/089-apontamento-d2-d3
commit: 2ea9c636e2f584d97ce20b0fb27a1736b24a2b8e
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-10
---

# Parecer de QA - 089 D2 e D3 do apontamento (back-end: servidor e biblioteca)

Alvo: `129fc3d5..2ea9c636` (classe N, passada única, mesmo head do review `docs/reviews/089-apontamento-d2-d3.md`, aprovado em 92b65a3f). Plano: `docs/analises/089-plano-apontamento-d2-d3.md`. Escopo: só a branch do back-end (servidor e biblioteca); a tela (E1.3) e o UX estão em outra delegação. O `.env` não foi aberto, nenhuma base real foi usada e não há `PG_TESTE_URL` nesta sessão.

Veredito: aprovado, com uma lacuna declarada: os testes `.pg` (releitura no Postgres, `CASE` de família de `lerCriterios`, desempate do rótulo) não rodaram por falta de banco de teste. A suíte inteira vale pelo check-run `bateria` do mesmo sha no CI do PR, não pelo local.

## Execução local (2 workers, testes afetados)
- Servidor: `vitest run --maxWorkers=2` em `apontamento-classificador`, `apontamento-rota`, `apontamento-dicionario`, `criterios-apontamento`, `apontamento-registro`, `apontamento-montagem`, `apontamento-coleta`: Test Files 7 passed (7); Tests 244 passed (244).
- Biblioteca: `classificarApontamento.test.ts` e `src/businessmap/apontamento`: Test Files 2 passed (2); Tests 150 passed (150).

## Mutação no diff (vermelho antes do verde)
Mutante: em `packages/metricas/src/coletor/classificarApontamento.ts`, devolver `execucao-tecnica` ao `sem-vinculo` (`if (subgrupo === SUBGRUPO_EXECUCAO_TECNICA || subgrupo === SUBGRUPO_NAO_CLASSIFICADO) flags.push('sem-vinculo')`, ou seja, o comportamento da base). Resultado: morto.
- Servidor: Test Files 1 failed; Tests 2 failed | 5 passed: `pedido 089 (D2): comentário escrito que o dicionário não reconhece é execução técnica e NÃO liga sem-vinculo` e `pedido 089: a releitura com a máscara nova muda o registro_sha256`.
- Biblioteca: Tests 3 failed | 82 passed: `sem vínculo: só o subgrupo não classificado (pedido 089, D2)`, `A3: corpus ... número de chamado`, `... só número`.
Mutante restaurado por `git checkout` antes do commit (árvore limpa). O `forge-testes --vermelho` não existe neste projeto; a prova do vermelho é o mutante acima, que reproduz a base para a regra de D2. Os testes de rótulo, `id` de família e rótulo vigente não têm vermelho observado aqui (ver lacuna).

## Critério -> teste -> resultado
| Obrigação (pedido 089) | Teste | Resultado | Fronteira protegida |
|---|---|---|---|
| D2: execução técnica não liga `sem-vinculo` | `classificarApontamento.test.ts` (sem vínculo só não classificado) e `apontamento-classificador.test.ts` (D2) | passa; mutante morto | comentário com 4 ou mais palavras sem termo: nenhuma flag |
| D2: só sem comentário e sem regra por tipo liga o bit 4 | os mesmos | passa | sem comentário (vazio) |
| D3: rótulo "Sem comentário" (fallback e dicionário v3) | `apontamento-dicionario.test.ts`, `apontamento-rota.test.ts` | passa | n/a |
| Releitura gera versão nova (hash muda com a máscara) e a antiga fica | `apontamento-classificador.test.ts` (hash) | passa só no nível de hash; Postgres não rodou | bits 8 e 16 preservados (`& 24`): sem prova no banco |
| T2.6: critério `089:sem-vinculo-so-sem-comentario` idempotente, sem UPDATE, data do argumento | `criterios-apontamento.test.ts` | passa | data de vigência |
| Marca T2.6 chega à tela (`id` com prefixo de família) | `apontamento-rota.test.ts` (dublê), `apontamento-rota.pg.test.ts` | dublê passa; `.pg` não rodou | precedência dicionário > calendário > achados |
| Rótulo vigente sem duplicar após `ref:sync` | `apontamento-rota.test.ts` (texto do SQL com `DISTINCT ON`) | passa só como texto de SQL; `.pg` não rodou | código retirado mantém o último rótulo |
| Sem dado pessoal e GRANT por coluna | `apontamento-sql.test.ts`, `apontamento-papel.test.ts` | passa | colunas fora do GRANT |

## Lacuna: teste da releitura no Postgres
Sem `PG_TESTE_URL`, o teste de releitura em `server/tests/apontamento.pg.test.ts` (staging append-only, versão nova com a máscara nova, bits 8 e 16 preservados) não foi escrito nem rodado: um teste de banco escrito sem poder ser executado não prova nada, e não entra um teste que nunca foi visto passar nem falhar. Fica para quem tem o banco de teste (ver A1 e A2). O que protege o risco hoje é o teste de hash, mais a leitura do código: `gravacao.ts` não foi alterado pelo diff e é ele que faz o INSERT de versão nova e preserva `& 24`.

## Nota de leitura dos números
Depois da varredura completa, `completos` sobe (comentário com 4 ou mais palavras sem termo do dicionário deixa de ter flag), então o "95,8% com flag" da 087 muda de patamar. A leitura do painel deve citar a marca T2.6 da data.

## Achados
- A1 (recomendado) server/tests/apontamento.pg.test.ts:1 · rodar com `PG_TESTE_URL` os `.pg` (`apontamento-rota`, `apontamento-dicionario`, `apontamento`) e escrever o teste da releitura: staging com 2 versões, fato com máscara nova, bits 8 e 16 intactos. Sem isso a prova do append-only fica só no hash.
- A2 (recomendado) server/tests/apontamento-rota.pg.test.ts:268 · o `CASE` de família de `lerCriterios` e o `DISTINCT ON` de `lerRotulosSubgrupo` (desempate por `incluido_por_versao_id`) só têm prova de texto de SQL; exigir verde do `.pg` no CI (`bateria` do mesmo sha) antes do merge.
- A3 (recomendado) docs/api/apontamento.md:1 · registrar a ordem de implantação (`ref:sync`, `criterios-apontamento <data>`, coleta de 12 meses, no mesmo dia) e o oráculo de término (zero linhas ativas com `execucao-tecnica` e bit 4); mesmo ponto do A1 e A3 do review.

Nenhum achado bloqueante. Bugs: 0 crítico, 0 alto, 0 médio, 0 baixo.
