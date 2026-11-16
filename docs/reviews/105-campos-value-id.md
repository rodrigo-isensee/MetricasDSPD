---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-campos-value-id
commit: 2ddd243d863336f154c1f245dd53b1d2f264706c
parecer: aprovado
revisor: tech-lead
data: 2026-11-16
---

# Code review: campos 48 e 49 do BusinessMap casados pelo value_id, E7.203 (review E7.207, revalidação E7.223)

Branch `feature/105-campos-value-id` contra `develop` (base `2a4dc3b9`), head `2ddd243d` (volta 1). Primeira passada no head `ad04bc37`: 9 arquivos, 113 linhas de código e teste (fora o JSON de domínio, `.md` e CHANGELOG), abaixo do teto de 150; um comportamento: o casamento das listas 48 e 49 pelo `value_id`.

## Parecer
**Aprovado** no head `2ddd243d`. O A1 está corrigido e o job `banco` do CI passa; o A2 foi atendido. O A3 é recomendado e não bloqueia.

## Achados
- A1 (bloqueante) server/tests/dominio-businessmap.pg.test.ts:58 · corrigido em `2ddd243d`: o teste pg do arquivo real esperava só o campo 48. Agora afirma 2 campos, 38 linhas de campo, 395 inseridas, `campo_customizado` com 48 e 49, as linhas `valor_id_<coluna>` (código = `value_id`, rótulo = código, vigentes) e `afeta` `['O14','O17']`.
- A2 (recomendado) docs/architecture/fontes/businessmap-causa-raiz-carga.md:11 · atendido: o passo 3 diz 38 linhas dos campos 48 e 49 (2 de campo, 18 de opção, 18 de `value_id`).
- A3 (recomendado) server/tests/dominio-businessmap.pg.test.ts:77 · O comentário cita `dspd_coletor`, mas `dominiosDaColeta` roda na conexão `c` do `dspd_ref`, a única que vê a transação aberta. Corrija para "consulta da coleta, na transação do `dspd_ref`".

## Detalhe dos achados
- A3: a consulta testada é a da coleta, mas o papel não é o `dspd_coletor`. O GRANT do coletor sobre `ref_dominio` não mudou neste diff.

## Revalidação (delta lido)
`forge-check parecer delta docs/reviews/105-campos-value-id.md`: intervalo `ad04bc37..2ddd243d`. No domínio entram dois arquivos: `docs/architecture/fontes/businessmap-causa-raiz-carga.md` (1 linha, passo 3, A2) e `server/tests/dominio-businessmap.pg.test.ts` (linhas 51 a 98: A1 e o A3 acima).
- Conferi as contas: 2 campos + 2 × (12 + 6) = 38, e 38 + 6 setores + 4 de prioridade + fase de detecção + motivo de bloqueio = 395, que bate com o que o teste afirma. A comparação das chaves numéricas do 48 (114 a 125) ordena os dois lados. A do 49 (126 a 131) ordena só o mapa, mas o esperado já está em ordem.
- O mapa de `dominiosDaColeta` liga cada `value_id` e cada rótulo ao código. O caso `mapa.get('49').get('114')` indefinido prova que o mapa é separado por campo.
- O código de produção não mudou no delta. Os mutantes da primeira passada valem como estão.

## O que conferi (primeira passada, head `ad04bc37`)
- Catálogo contra `docs/architecture/fontes/businessmap-dominio.json`: os 12 `value_id` do 48 (114 a 125) e os 6 do 49 (126 a 131) ligam à opção certa. Os códigos do 49 de 126 a 130 são iguais a `ORIGENS_DEMANDA` (packages/contratos/src/comum.ts:114), e o 131 é "Demanda nova".
- Arquivo: o `value_id` aceita só dígitos e é opcional. Repetido no mesmo campo é recusado, com normalização (`0114` = `114`).
- `listasDoArquivo` grava uma lista `valor_id_<coluna>` por campo, mesmo vazia, e por isso fecha a vigência de uma opção que sair do arquivo. Sem migração nem GRANT novo.
- `dominiosDeLinhas` ignora: `value_id` não numérico, código inseguro ou reservado, `value_id` ligado a dois códigos, código fora da lista da coluna e chave que colide com rótulo. O mapa é por campo.
- Fronteira (`reduzirCamposCustomizados`) sem mudança; nenhum texto livre nem dado de pessoa entra. BusinessMap e Acelerato não se misturam.
- O14 (`server/src/modulos/metricas/mapa.ts:23`): "Demanda nova" e `desconhecido` viram `null`, então não contam como falha no T5.
- Mutantes na linha 289 (`codigos.has(codigo)`) e na linha 139 (guarda de `value_id` repetido) do `dominio-businessmap.ts`: cada um derruba 1 teste.

## CI e suíte
- Head `2ddd243d`, run 43888386557 (push): `banco` com sucesso. `rapida`, `build`, `seguranca`, `openapi` e `imagem` também passaram. O job `testes` foi cancelado porque o push seguinte (`770f5c3b`, só o parecer do QA) abriu um run novo.
- Run 43889322285 (`770f5c3b`, código igual ao de `2ddd243d`; o diff entre os dois é só `docs/qa/105-campos-value-id.md`): `success`, com `banco` e `testes` verdes. e2e e perf foram pulados pelo filtro.
- Localmente, o `vitest --project pg` do arquivo pula sem `PG_TESTE_URL`; o que vale é o job `banco`. Não rodei a suíte inteira. As 12 falhas locais do `test:pg` que o autor relata (apontamento-rota e migrações, banco compartilhado) estão em arquivos fora do diff.
