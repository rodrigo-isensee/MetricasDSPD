---
tipo: review
contrato: 1
pedido: 073-melhorias-tecnicas-2026-11-05
branch: feature/073-e10-l1-versao
commit: c9f887118bf9d6272e027b1043e1d2541123f55b
parecer: aprovado
revisor: tech-lead
data: 2026-11-07
---

# Code review: E10 Lote 1, versão nova a cada mudança de vigência no ac:ref-sync (pedido 073, E10.4, K-235)

## Conferido
- Diff lido: `78cf396c...c9f88711`, 1 commit (c9f88711), 5 arquivos, +35 -16. Teto M14: 49 linhas de código e teste (o `.md` fica fora), abaixo de 150; um comportamento só (P-E10-4).
- Aderência à seção "Lote 1" de `docs/analises/073-e10-plano.md`:
  - Referência com a data: `referenciaDaVersao(sha256, dia)` devolve `056:ref-dominio:<sha256>:<AAAA-MM-DD>` (`dominio-acelerato.ts:153`); 91 caracteres, cabe no `varchar(200)` de `referencia` (`0010_core_referencia.ts:13`).
  - Idempotência pela referência nova: o ramo `mudou` consulta e grava pela referência com `hoje` (`dominio-acelerato.ts:181-187`); o `vigente_desde` da versão é o mesmo `hoje` das vigências gravadas.
  - Versões antigas intactas: nenhum UPDATE nem DELETE em `ref_versao_criterio`; nenhuma migração. O prefixo `056:ref-dominio:` segue achando as duas formas (base do Lote 2).
  - Limite de mesmo dia mantido: `planejarDominio` sem mudança (recusa de vigência aberta no mesmo dia, linhas 136-139).
  - `server/src/entradas/ref-sync-ac.ts` fora do diff; nenhum outro chamador de `referenciaDaVersao` do Acelerato em `server/src` (as homônimas de `dicionario.ts`, `dominio-businessmap.ts` e `calendario.ts` são de outros domínios e não mudaram).
- Os três testes do plano: `dominio-acelerato.test.ts:184-185` (referência com a data, literal e pela função); `dominio-acelerato.pg.test.ts:110-124` (A, B e de novo A em D1, D2 e D3 geram três versões; a mesma carga no mesmo dia não grava nem registra; total de 3 pelo prefixo); `acelerato-ca8-ref-sync.pg.test.ts:30-31,51,59` ajustado à data. O ramo "mudou, mas a versão já existe" segue coberto pelo dublê (`dominio-acelerato.test.ts:206`).
- Documentação: `docs/architecture/server.md:220` traz a referência nova, "uma por hash e dia", a P-E10-4 e as versões antigas como estão.
- CI do push no head: run 42331476876, evento `push`, `headSha` c9f88711, conclusão `success` (build, testes, banco, seguranca, openapi, imagem, rapida e filtro verdes; e2e e perf pulados pelo filtro). Os dois `.pg` rodam no job `banco`.
- Testes dos arquivos tocados no review (D-5): `vitest run` dos três arquivos, 29 passaram; os dois `.pg` pulam sem banco local (contam pela CI acima).
- Regras invioláveis: sem cálculo de métrica, sem dado de pessoa, histórico só acrescentado; nenhuma versão T2.6 própria, como o plano diz. Segurança (gatilho banco) fica no parecer próprio do security-engineer (E10.5).

## Achados
- A1 (recomendado) docs/architecture/server.md:220 · "data da carga" é o argumento de vigência (padrão hoje), não a data de execução; dizer "data de vigência da carga" evita ler a referência como data do relógio. Não devolve.

## Parecer
Aprovado.
