---
tipo: qa
contrato: 1
pedido: 097-resumo-filtro-time
branch: fix/k272-ap-tipo-categoria
commit: 59fd6ba9b36e029eb47750f04ff08a0232a119d1
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-11
---

# QA: K-272, AP-TIPO e filtro tipo por categoria (097, E6.3)

Base develop eac38a64. Diff `eac38a64..59fd6ba9`: `server/src/modulos/apontamento/servico.ts` (+44 -8) e `server/tests/apontamento-rota.test.ts` (+25 -1).

## Veredito
**Aprovado.** Sem bug aberto. Os testes `.pg` ficam com o CI (o check-run `bateria` do mesmo sha é a prova da suíte inteira, fora desta passada local).

## Execução
- `npx vitest run tests/apontamento-rota.test.ts --maxWorkers=2` (R-TETO): 1 arquivo, 72 testes passaram, 0 pulados.
- Mutação (voltar a agrupar por type_id: `idDaCategoria.set(t, id)` trocado por `idDaCategoria.set(t, t)`): o teste "K-272: dois type_id da mesma categoria..." falhou (opções vieram com '12' e '9' separados); 1 falhou, 71 passaram. Arquivo restaurado com `git checkout` antes do commit; árvore limpa.

## Critério → teste → resultado
| Obrigação (decisão P-097-7, opção a) | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Uma linha por categoria no AP-TIPO, somando os type_id | K-272 (`porTipo` 'Trabalho de produto': 1 linha, 10 800 s, 2 apontamentos) | dois type_id na mesma categoria | passou |
| Uma opção por categoria, id = menor type_id | K-272 (opções `[34 Incidente], [9 Trabalho de produto]`) | menor type_id (9, não 12) | passou |
| Filtrar por qualquer type_id cobre a categoria | K-272 (`tipo=9` e `tipo=12` dão 10 800 s e 2 apontamentos) | type_id não-menor | passou |
| lerCardsIncompletos recebe todos os type_id | K-272 (`valores[3]` = `['9','12']` na consulta `ctl_apontamento_cobertura`) | filtro no banco | passou |
| "Sem tipo" à parte e fora das opções | teste da moldura (opções só `[12 Tipo Novo]`; "Sem tipo" soma, sem opção); K-272 inclui linha com `tipo: null` fora das opções | categoria nula | passou |
| Link antigo `tipo=<dígitos>` segue válido | K-272 (`tipo=12` aceito) e teste existente de 400 para valor fora de dígitos | contrato do filtro | passou |
| Nenhum rótulo repetido nas opções | K-272 (2 opções, rótulos distintos) | duplicidade | passou |

## Observação
O teste K-272 não afirma a linha "Sem tipo" em `porTipo`; ela é coberta pelo teste da moldura apenas nas opções. Sem risco novo, a ordem de cálculo não mudou para esse ramo.

## Achados
