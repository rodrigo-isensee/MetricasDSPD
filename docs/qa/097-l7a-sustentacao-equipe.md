---
tipo: qa
contrato: 1
pedido: 097-resumo-filtro-time
branch: feature/097-l7a-sustentacao-equipe
commit: d4ba9bf9d681082e3c899c9189c6393e4f0cdd1a
parecer: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-11
---

# QA: L7a, equipe da Sustentação vira slug (097, E3.3)

Base develop 4b1e3122 (anterior ao K-280). Diff conferido contra o plano (`docs/analises/097-filtros-plano.md`, linhas 60 a 90): o escopo é o do plano (contrato, biblioteca, schema de consulta, opções do `dim_chamado`, docs/api). Volta 1: revalidação pelo delta 0f61133b2d3e..ad0522d9a851. Volta 2 (L7b): delta b7442810..d4ba9bf9 (codec da web por slug).

## Veredito
**Aprovado.** O A1 da rodada anterior está fechado sem afrouxar a prova: `server/tests/api.sistemico-intensivo.test.ts:44` trocou `equipe=xpto` (que virou slug válido) por `equipe=Equipe_Outra`, que o padrão `^[a-z0-9][a-z0-9-]{0,59}$` recusa (maiúscula e sublinhado). A matriz das 69 rotas continua exigindo 400 `VALIDATION_ERROR` sem eco para equipe inválida da Sustentação. O resto do delta: `CORTE_CARDS` e `CORTE_CHAMADOS` movidos para `referencia/cortes.ts` e reusados por `lerCards`, `lerChamados` e as opções (texto SQL idêntico), `corte-unico.test.ts` novo e o ajuste do `.pg` (`responsavel_id` não existe em `dim_card`, 42703) vindo da develop.

## Execução (`VITEST_MAX_WORKERS=2`, dentro de `server/`; nada contra a base real nem `.env*`; o `.pg` fica no CI)
- `server/`: 104 arquivos passaram, 41 pulados (`.pg`); 1974 testes passaram, 276 pulados, 0 falhas (antes: 14 falhas, todas do A1).
- `packages/` fora do delta: os resultados da rodada anterior (contratos 219, metricas 1305 passaram) seguem valendo; o autor relata sem falha.
- Suíte inteira e `.pg`: a prova é o check-run `bateria` do CI no mesmo sha.
- Mutações da rodada anterior seguem válidas: `lerEquipesAC` só trocou a origem da constante, com o mesmo texto.

## Critério → teste → resultado
| Conferência | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| A1 fechado sem afrouxar | `api.sistemico-intensivo.test.ts` (`equipe=Equipe_Outra`) | padrão do slug | passa |
| Opções no corte, slug, vazio, apelidos, equipe nova | `app.test.ts`, `metricas.test.ts`, `tendencia.test.ts`, `contratos.test.ts` | corte, duplicata, vazio, 60/61 caracteres | passam, sem mudança |
| Corte único (K-280) | `corte-unico.test.ts` | condição única | passa |

## Volta 2: L7b, codec da web por slug (d4ba9bf9)
Diff conferido: `codec.ts` (lerLista ganha o `apelido`; a equipe da Sustentação valida contra `opcoes.equipes` e aplica `idEquipeSustentacao`; `colapsarTodos` usa só as opções), `useFiltros.ts`, `BarraFiltros.tsx` (casts), mock, `docs/contratos/http.md`, e2e (constantes e specs). O ponto do parecer anterior (`codec.ts:249`) foi atendido.
- Web (`VITEST_MAX_WORKERS=2`, filtros, exportar, operacional): 30 arquivos, 356 testes, 0 falhas.
- Slug novo (`equipe=sssc-totvs,time-novo`): aceito, sem inválidos. Id antigo (`totvs,sssc-totvs,fluig`): vira `sssc-totvs,sssc-fluig`, sem duplicar, e a escrita da URL sai com o slug. Slug inválido (`nao-existe`): ignorado e anotado como `equipe "nao-existe"` (texto original, não o apelido).
- Mutação: troquei `idEquipeSustentacao` por identidade no `lerLista` da equipe; `codec.test.ts` falhou em "id antigo na URL vira o slug novo, sem duplicar" (1 falha de 16). Restaurada com `git checkout`; árvore limpa.
- CI do head d4ba9bf9 (consulta à API): banco, build, filtro, seguranca, rapida, imagem, openapi verdes; `testes` em andamento na consulta; `e2e`, `e2e-parte` e `perf` pulados neste sha. Não há check-run `bateria` listado: a prova da suíte inteira e do e2e fica pendente do CI.

## Observações (sem bloqueio)
- Com as opções ainda não carregadas (`idsDe` nulo), qualquer slug passa na leitura; é o comportamento anterior dos demais filtros.
- Aprovação condicionada ao check `testes` verde no mesmo sha.

## Achados
