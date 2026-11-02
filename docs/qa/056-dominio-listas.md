---
tipo: qa
contrato: 1
pedido: 056-acelerato-mysql
branch: feature/056-dominio-listas
commit: 8865ee78da61d7f4e755ad732b090abdfd73b5a8
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-01
---

# Parecer de QA - listas de domínio do Acelerato (056, E4.45, K-190)

Alvo: E4.42 (8865ee7), sobre a base 55301e0. Review: `docs/reviews/056-dominio-listas.md` (aprovado em ce881d1). Segurança: `docs/security/056-dominio-listas.md` (aprovado em aae448d). Valores reais: consulta só leitura da E4.40, arquivo fora do repositório. Sem interface: sem E2E de navegador nem acessibilidade. Nada foi conectado ao MySQL, o `.env` não foi aberto e o PostgreSQL usado foi o de teste local (`metricas_test`).

Veredito: aprovado. Os valores reais casam com as listas e não geram contagem fora do domínio, o mapa D-12 dá P1 a P5 pelas quatro famílias, só a organização 3 entra, e vocabulário vazio falha fechado sem gravar dado. O vermelho antes do verde foi visto e a mutação no diff não deixou sobrevivente.

## Saída real dos comandos (HEAD 8865ee7 mais o teste do QA, `nice -n 19`, uma suíte por vez)

- `pnpm --filter @metricas-dspd/server run test`: Test Files 56 passed, 25 skipped (81); Tests 1098 passed, 163 skipped (1261). Com o teste novo do QA: Test Files 57 passed, 25 skipped (82); Tests 1109 passed, 163 skipped (1272).
- `.pg` com `PG_TESTE_URL` apontando para `metricas_test` local (`vitest run --project pg` nos quatro arquivos do domínio, do coletor e do projetor: `dominio-acelerato.pg.test.ts`, `dominio-acelerato.qa.pg.test.ts`, `acelerato.pg.test.ts`, `acelerato-projetor.pg.test.ts`): Test Files 4 passed (4); Tests 20 passed (20).
- `pnpm run pronto`: terminou em `Done`; `docs:check: ok (833 páginas Markdown, 69 métricas, 2 eventos)`.

## Conferência dos valores reais (E4.40 contra `acelerato-dominio.json`, por script do QA, conjunto contra conjunto)

- Status: 22 nomes distintos, todos dentro da lista `etapa` do arquivo; contagem fora do domínio = 0 (a causa da E4.39 eram 5093 chamados fora).
- Etapa: 44 nomes distintos, nem um a mais nem um a menos no arquivo; contagem fora do domínio = 0.
- Prioridade: 23 nomes distintos não nulos, iguais aos 23 do arquivo; contagem fora do domínio = 0; as 29 nulas ficam nulas, sem contagem de domínio.
- Natureza: os 4 prefixos do arquivo são exatamente os 4 da E4.40 que a decisão (c) manda mapear (`SSSC-I-`, `SSSC-I `, `SSSC-R-`, `SSSC-R `); SSSC-P, TESTADE, Outros e PEQUENA ficam sem natureza.
- Recorte: `organizacao_recorte` tem só a chave 3; as chaves 1, 13, 2, 8 e -1 da E4.40 não estão na lista.
- O arquivo não contém `@` nem texto de pessoa; só nomes de domínio.

## Critério -> teste -> resultado

| Obrigação (delegação E4.45) | Teste | Resultado | Fronteira protegida |
|---|---|---|---|
| Status, etapa e prioridade reais casam sem contagem fora do domínio | `dominio-acelerato-real.test.ts` (status, prioridade, etapa pela allow-list) e o script de conferência acima | passa | todo valor real; um valor inexistente continua contado sem o valor |
| Natureza dos prefixos reais (decisão c) | `dominio-acelerato-real.test.ts` (categorias do arquivo, prefixos com hífen e com espaço) e `.pg` do arquivo real | passa | `SSSC-I`/`SSSC-R` com hífen e com espaço; os demais prefixos sem natureza |
| Mapa D-12: P1 a P5 pelas quatro famílias | `acelerato-normalizador.test.ts` (5 níveis x 4 famílias), `dominio-acelerato-real.test.ts` (23 prioridades reais todas mapeadas) | passa | 5 níveis, 4 famílias |
| D-12 sem inferência de grafia | `acelerato-normalizador.test.ts` (sem acento, caixa, outra área, vazio) e QA `dominio-acelerato-056.qa.test.ts` (forma decomposta do acento, espaço duplo, espaço no fim, família alheia, nível fora dos cinco) | passa | grafia exata |
| Organização fora da 3 fica fora (decisão b) | QA `dominio-acelerato-056.qa.test.ts`: chaves 1, 13, 2, 8 dão `fora-do-recorte`, a 3 passa, a -1 dá `dados-invalidos` | passa | chave logo fora do recorte |
| Vocabulário vazio falha fechado | `dominio-acelerato-real.test.ts` (`carregarListas` por campo) e QA: a coleta completa com cada um dos 4 vocabulários vazios dá `listas-vazias` com o campo, zero conexões MySQL, nada no staging e só a linha de falha no controle (código e campo) | passa | lista vazia |
| Natureza vazia falha fechado na projeção sem gravar | `dominio-acelerato-real.test.ts` e QA: `listas-vazias`, nenhum INSERT, ROLLBACK, nenhum COMMIT | passa | lista vazia ou só de rótulo desconhecido |
| Gravar e ler de volta no PostgreSQL | `dominio-acelerato.pg.test.ts` (arquivo real: acentos, prefixo com espaço, ordem) | passa | nome com acento e espaço final no banco |

## Vermelho antes do verde

Comando (projeto, não há `forge-testes` aqui): cópia do HEAD em `$TMPDIR` com `acelerato-dominio.json`, `normalizador.ts`, `projetor.ts` e `referencia.ts` voltados à base 55301e0, e os testes novos do autor contra ela. Árvore do autor intocada.

- Unitários: `Test Files 2 failed | 1 passed (3); Tests 21 failed | 54 passed (75)`. Caem os 5 casos D-12 de `acelerato-normalizador.test.ts` e 16 de 18 em `dominio-acelerato-real.test.ts` (campos ausentes, status, prioridade e etapa reais, natureza, mapa, vocabulário vazio).
- `.pg`: `dominio-acelerato.pg.test.ts`: `Tests 1 failed | 6 passed (7)`; cai "o arquivo real grava etapa, prioridade e natureza_prefixo" com `TypeError: Cannot read properties of undefined (reading 'length')`.
- Os 2 testes de `dominio-acelerato-real.test.ts` que passam na base são os de recorte (organização 3) e de falha por grafia, ambos já verdadeiros antes da correção (a lista de organização já era só a 3, desde a E4.32).

## Mutação no diff (6 mutantes à mão, nos três arquivos de produção mudados, em cópia descartável)

Referência: 109 testes verdes nos cinco arquivos rodados.

| Mutante | Resultado |
|---|---|
| `normalizador.ts`: ALTA mapeada a P1 em vez de P2 | morto (1 falha) |
| `normalizador.ts`: família `DSPD - REQUISIÇÃO` fora da lista | morto (6 falhas) |
| `normalizador.ts`: mapa D-12 retorna sempre nulo | morto (6 falhas) |
| `referencia.ts`: etapa e prioridade fora da checagem de lista vazia | morto (4 falhas) |
| `referencia.ts`: checagem de lista vazia desligada | morto (9 falhas) |
| `projetor.ts`: guarda de natureza vazia desligada | morto (2 falhas) |

Nenhum sobrevivente.

## Testes novos do QA

`server/tests/dominio-acelerato-056.qa.test.ts` (11 testes, passam): organização fora da 3, coleta completa com vocabulário vazio sem gravar dado, projeção com natureza vazia sem INSERT, e grafia da D-12 sem inferência. Por ordem do brief, este commit leva só o parecer: o arquivo fica na árvore da worktree, sem commit, para o Jarvis decidir se entra no PR.

## Observações (sem bloqueio)

- A chave de organização -1 que aparece na E4.40 nunca chega à lista: não passa nem pelo esquema (`dados-invalidos`), e a consulta de origem já filtra a organização. Comportamento seguro e coerente com a decisão (b).
- A coleta com lista vazia grava uma linha de falha em `ctl_coleta` (código e campo, nenhum valor): é o desenho do coletor, e não grava dado de chamado.

## Achados

- A1 (recomendado) server/tests/dominio-acelerato-056.qa.test.ts:1 · o teste do QA fica fora do commit por ordem do brief; o Jarvis decide se entra no PR da E4.46, sem efeito na releitura do dono.
