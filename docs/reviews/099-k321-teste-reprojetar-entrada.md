---
tipo: review
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: fix/k321-teste-reprojetar-entrada
commit: a70e5fbc1c7cae6469655f5515bec19c7ec1544e
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-13
---
# Code review: K-321, teste da entrada ac:reprojetar-etapas (E3.184)

Diff lido: `git diff 76c1fe90...a70e5fbc` (1 arquivo, +88/-0, 1 commit: `a70e5fbc`): `server/tests/reprojetar-etapas-ac-entrada.test.ts`, contra o A1 do QA do K-308 (`docs/qa/099-k308-d7-528.md:23`) e a ADR 0027, item 7.4.

## Ferramentas (citadas, não refeitas)
- CI do push no head `a70e5fbc` (run 43543053555), pelos check-runs do commit: `testes`, `rapida`, `banco`, `build`, `seguranca`, `openapi`, `imagem` e `filtro` verdes; `perf` e `e2e` pulados pelo filtro.
- Autor (PQ conferido pelo Jarvis): mutante `recusa ? 4 : 1` morto; testes do Acelerato e da referência verdes.
- Rodado aqui só o teste novo: 1 arquivo, 4 testes, todos passaram.
- Mutante rodado aqui: `process.exitCode = recusa ? 4 : 1` trocado por `recusa ? 1 : 1` em `server/src/entradas/reprojetar-etapas-ac.ts:20`; o caso da recusa falha (`expected 1 to be 4`), mutante morto. Fonte restaurada (árvore limpa no head).
- Tamanho (M14): 88 linhas de teste, um comportamento (o contrato de saída da entrada).

## Conferência
- **ADR 0027, 7.4 (código 4 na recusa, sem gravar):** o caso da recusa lança o `ErroReprojecao` do próprio módulo dublado, confere `exitCode` 4, o stderr exato com a mensagem da recusa, stdout vazio e o pool fechado. O ramo `instanceof` fica preso: a recusa sai com a mensagem e o erro do banco, com a categoria.
- **Saída só com contagens:** o sucesso confere o stdout exato (`JSON` + quebra de linha), sem a URL do migrador, `exitCode` intacto e o pool fechado.
- **Sem dado sensível no erro:** o erro de banco carrega URL com senha e `code` `28P01`; o stderr é exatamente `autenticação` (pela `categoriaDoErro` real), sem `segredo`. O caso de configuração ausente roda em processo filho com `ambienteFilho()` (só `PATH` e `TMPDIR`, `.env` ignorado, K-261), código 1 e só a categoria.
- **Isolamento:** `afterEach` zera `process.exitCode`, restaura os espiões, reseta os módulos e desfaz os três `doMock`; o `await import` espera o `await` de topo da entrada. Determinístico, sem banco nem hora.
- **Regras invioláveis:** nada de métrica, pessoa nem mistura de fontes; credencial só fictícia no dublê.

## Achados
- A1 (recomendado) server/tests/reprojetar-etapas-ac-entrada.test.ts:55 · o dublê devolve `{ chamados, intervalos, versaoCriterio }`, fora da forma de `ResultadoReprojecao` (ADR 0027 7.4); a prova vale (a entrada só serializa), mas o exemplo engana. Tipar o dublê com `ResultadoReprojecao`.
