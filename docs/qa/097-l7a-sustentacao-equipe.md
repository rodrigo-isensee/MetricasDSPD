---
tipo: qa
contrato: 1
pedido: 097-resumo-filtro-time
branch: feature/097-l7a-sustentacao-equipe
commit: ad0522d9a8515913fea2313d1ae1d0e487fe5181
parecer: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-11
---

# QA: L7a, equipe da Sustentação vira slug (097, E3.3)

Base develop 4b1e3122 (anterior ao K-280). Diff conferido contra o plano (`docs/analises/097-filtros-plano.md`, linhas 60 a 90): o escopo é o do plano (contrato, biblioteca, schema de consulta, opções do `dim_chamado`, docs/api). Volta 1: revalidação pelo delta 0f61133b2d3e..ad0522d9a851.

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

## Observações (sem bloqueio)
- `web/src/features/filtros/codec.ts:249` fica para a etapa do front; o apelido `totvs` nos links antigos depende dele.

## Achados
