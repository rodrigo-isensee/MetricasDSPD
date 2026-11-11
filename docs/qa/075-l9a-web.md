---
tipo: qa
contrato: 1
pedido: 075-bloqueios-reais
branch: feature/075-9a
commit: f79685e841932a7043b681d9224cac66168de104
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-11
---
# QA: 075-bloqueios-reais, lote 9a (web sem o ramo da nota `bloqueio-sem-dado-real`, K-204)

Contrato: plano `docs/analises/075-plano.md`, "Lote 9a". Diff `eac38a64..f79685e8`: 4 arquivos (`CartaoComplementar.tsx` só comentário, `CartaoO1.tsx`, `CartaoO2.tsx`, `bloqueio-sem-dado.test.tsx`). Este parecer não criou nem mudou teste. A suíte inteira roda no CI do PR (check-run `bateria` do mesmo sha); aqui só os testes afetados.

## Achados
- A1 (recomendado) web/src/features/operacional/bloqueio-sem-dado.test.tsx:66 · Nenhum teste injeta a nota `bloqueio-sem-dado-real` na resposta do O2; religar o ramo da nota no CartaoO2 sobrevive (mutante M1). Um caso com a nota presente e o motivo real esperado fecharia o buraco.

## Execução (2 workers)
- `web/src/features/operacional` e `web/src/features/complementares`: 21 arquivos, 471 testes, todos passam (`vitest run --maxWorkers=2`).
- `grep -rn bloqueio-sem-dado-real web/src`: vazio (rc 1).
- Sem "Sem dado real" de bloqueio: BLOQUEADOS (W1), O1 (W2), O2 (W3), O5 (W4) e faixa "Pede atenção" (W5: itens presentes, sem o texto de parcial) afirmam a ausência do texto e do estado.
- Estado genérico de métrica sem fonte real de outras métricas: o diff não toca `FaixaAtencao.tsx`, `EstadoSemDadoReal` nem os testes de `coleta/` e `components/ui`; o ramo genérico segue no código (o testid do parcial continua em uso fora do bloqueio).

## Mutação (restaurada antes do commit; árvore limpa)
- M1 (religar o ramo da nota no O2, `d?.notas?.includes('bloqueio-sem-dado-real') ? 'Sem dado real' : ...`): sobrevive, 8 de 8 passam. Causa: as fixtures nunca trazem a nota, então o ramo é inalcançável nos testes (A1).
- M2 (coluna Bloqueado do O2 fixa em 'Sem dado real'): morre; W3 cai.

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Plano 9a: a web não depende da nota (O1, O2) | W2, W3 e `grep` vazio | nota ausente | passa |
| BLOQUEADOS e faixa mostram o dado real | W1, W5 | estado genérico preservado | passa |
| O1 com `bloqueados` null (contrato ainda aceita, sai no 9b) não inventa 0 | `O1 com bloqueados null`, com e sem equipe | null, quebra por coluna | passa |

Limites: o enunciado de "estado genérico" foi conferido pelo diff (componentes de estado intocados) e pela suíte de `complementares`; os testes de `coleta/` e `components/ui` não foram rodados aqui e vão ao CI.
