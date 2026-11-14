---
tipo: qa
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: fix/k321-teste-reprojetar-entrada
commit: a70e5fbc1c7cae6469655f5515bec19c7ec1544e
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-13
---
# QA: 099 K-321, teste da entrada ac:reprojetar-etapas, e conferência do K-308 na develop (E3.185)

Revisado a70e5fbc (o head abd7eaa8 só soma o parecer do review: `git diff --stat a70e5fbc abd7eaa8` é 1 arquivo de docs). Pedido de correção sem especificação nova, sem plano antecipado: as obrigações são a ADR 0027 item 7.4 e o A1 do QA do K-308 (`docs/qa/099-k308-d7-528.md`).

## Veredito
Aprovado. Parte 1: o teste novo passa (4 de 4), cobre o que a ADR 0027 7.4 pede da entrada e matou os 5 mutantes tentados. Parte 2: os testes do K-308 e da referência passam, o job `banco` passou no merge commit da develop e a junção do `referencia/index.ts` está íntegra. Nenhum defeito.

## Achados
- A1 (recomendado) server/tests/reprojetar-etapas-ac-entrada.test.ts:55 · o dublê de sucesso devolve `{ chamados, intervalos, versaoCriterio }`, fora da forma de `ResultadoReprojecao` (ADR 0027 7.4); a prova vale, o exemplo engana. Tipar o dublê (mesmo achado do review; sem defeito provado).

## Critério → teste → resultado
| Obrigação (ADR 0027 7.4, entrada) | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Sucesso: stdout só com as contagens (JSON mais quebra de linha), pool fechado, `exitCode` intacto | `sucesso: sai com 0, imprime o JSON só com as contagens...` | stdout exato; sem a URL do migrador | passou; M-A e M-B mortos |
| Recusa por calendário divergente: código 4 (não 1), só a mensagem da recusa, sem saída, sem escrita, pool fechado | `recusa por calendário divergente: código 4...` | `instanceof ErroReprojecao`; código 4 contra 1 | passou; M-E morto (e `recusa ? 4 : 1` trocado por `1`, no review) |
| Erro do banco: código 1, só a categoria, sem URL nem texto | `erro do banco: código 1...` | URL com senha e `code` 28P01 no erro | passou; M-C e M-D mortos |
| Configuração ausente: código 1, categoria, sem URL, stdout vazio | `sem configuração do banco falha com código 1...` (processo filho, `ambienteFilho()`) | env vazio | passou; M-C e M-D morreram aqui também |

Os 4 casos conferem com a ADR 0027 7.4: recusa com código 4 sem escrita, saída só com contagens, nenhum dado de pessoa nem texto de banco. A listagem do que diverge (turnos, feriados) é do módulo e tem teste em `acelerato-reprojecao-etapas.test.ts` (QA do K-308), não da entrada.

## Vermelho antes do verde
O pedido só soma teste; o código da entrada não mudou (`git diff 76c1fe90 HEAD` toca só o teste e o parecer do review). `forge-testes --vermelho` não se aplica (nada da base a reverter); a prova de que o teste não é vazio é a mutação abaixo.

## Mutação (à mão, restaurando pelo conteúdo do HEAD via `git show`)
Árvore limpa depois (`git status --short` vazio). Mutantes em `server/src/entradas/reprojetar-etapas-ac.ts`:
- M-A stdout com campo extra (`JSON.stringify({ ...r, url: cfg.PG_MIGRADOR_URL })`): morto, o caso de sucesso falha (`expected "Mock" to be called with arguments`).
- M-B `await pool?.end()` removido: morto, 3 testes caem (`expected "vi.fn()" to be called once, but got 0 times`).
- M-C erro com `e.message` sempre, no lugar da categoria: morto, 2 testes caem.
- M-D `recusa ? 4 : 0`: morto, 2 testes caem (`expected +0 to be 1`).
- M-E `e instanceof ErroReprojecao` trocado por `false`: morto (`expected 1 to be 4`).
Nenhum sobrevivente.

## Parte 2: K-308 na develop (merge commit 76c1fe90)
- Comando (worktree em abd7eaa8, que contém 76c1fe90): `vitest run acelerato-reprojecao-etapas acelerato-projetor acelerato-etapas-sinteticas criterios-acelerato turnos-sustentacao acelerato-estatico opcoes-setores --maxWorkers=2`: `Test Files 7 passed | 2 skipped (9)`, `Tests 75 passed | 8 skipped (83)`. Os 2 arquivos pulados são os `.pg` (sem banco local), cobertos pelo CI abaixo.
- `tsc --noEmit -p server`: sem erro.
- Check-runs do commit 76c1fe90 (run 43542669058, evento push, branch develop, conclusão success): `banco`, `testes`, `rapida`, `build`, `openapi`, `seguranca`, `imagem` e `filtro` em success; `perf` e `e2e` pulados pelo filtro. O log do job `banco` mostra `acelerato-reprojecao-etapas.pg.test.ts (4 tests)` e `acelerato-projetor.pg.test.ts (4 tests)` verdes e `Test Files 44 passed (44)`, `Tests 296 passed (296)`.
- Junção de `server/src/modulos/referencia/index.ts`: íntegra. O diff 699af53e (L10a) para 76c1fe90 é uma linha movida e uma estendida: `CRITERIOS_ACELERATO, CRITERIO_D7_528, REFERENCIA_D7_528, registrarCriterioD7528, registrarCriteriosAcelerato` (K-308) convivem com `lerSetoresBM` (export de `repositorio.js`) e `CAMPO_SETOR_QUADRO, CODIGO_QUADRO, rotuloDeSetorSeguro` de `setor.js` (L10a), sem export duplicado nem perdido; `opcoes-setores.test.ts` passa e o `tsc` fecha.

## Bugs
Nenhum.
