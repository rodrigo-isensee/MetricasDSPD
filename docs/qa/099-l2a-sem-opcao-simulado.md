---
tipo: qa
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: fix/099-l2a-sem-opcao-simulado
commit: 78e5a2c180c45e37cec36054a815c5b9696879bb
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-11
---

# QA: pedido 099, L2a (tirar a opção `simulado` de `useMetrica` e dos cartões)

Links: análise `docs/analises/099-varredura-simulado.md` (lote L2a), decisão do dono no pedido `docs/pedidos/099-nenhuma-metrica-simulada.md`, ADR 0030.

## Veredito
**Aprovado** sobre o HEAD 78e5a2c1 (base develop 27ac9064). Nenhum bug aberto. O diff (41 arquivos, só `web/src`) tira `simulado` das opções de `useMetrica`, o `{ simulado: true }` dos cartões e o campo `origem` do retorno (sem consumidor); `FonteComSimulado`, `simulado.ts`, o selo e `SemDadoRealErro.simulavel` ficam para L2b e L2c, como declarado.

## Critério, teste, resultado
| Critério (L2a / decisão do dono) | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Nenhum cartão pede simulado: sem `simulado: true` em `web/src` fora dos testes do decorador | `grep -rn "simulado: true" web/src`: zero ocorrências fora de `OrigemDosCartoes.tsx:58`, que é o campo do selo (L2b/L2c), não a opção do hook | opção removida do tipo: `simulado` na chamada não compila | passa |
| Hook sem a opção; `sem-dado-real` com `simulavel: true` continua "Sem dado real" e o mock não é criado | `data/simulado.test.tsx` "099: simulavel true também fica Sem dado real..." e "T-W6" | `simulavel: true` (o caso que antes ativava o simulado) | passa; cai na mutação |
| Operacional sem dado real: "Sem dado real", sem selo, O3 real segue, contagem igual ao mapa | `coleta/simulado.test.tsx` "Operacional semanal..." | cartão simulável da API vs cartão real no mesmo painel | passa; cai na mutação |
| Tático: cartões e faixa de atenção "Sem dado real", sem selo | `coleta/simulado.test.tsx` "Tático..." | idem | passa; cai na mutação |
| Sustentação e Espera invisível (EI_SUST): sem número, sem selo, S2 real segue | `coleta/simulado.test.tsx` "Sustentação..." | idem | passa; cai na mutação |
| Visão geral nunca simulada | `coleta/simulado.test.tsx` "Visão geral..." | n/a (regressão) | passa |
| Cobertura de 100% mantida | `vitest run --coverage` | limiar 100% em linhas, funções, ramos e declarações | passa |
| Fonte `api` é a HTTP pura (L1) e demais testes de composição | `app/composicao.test.tsx` | n/a | passam |

## Execução
- `TZ=UTC vitest run --coverage --maxWorkers=2` em `web/` da worktree 041b, head 78e5a2c1: 98 arquivos, 1500 testes, 1500 passaram (378 s). Cobertura: Statements 100% (5551/5551), Branches 100% (5147/5147), Functions 100% (2043/2043), Lines 100% (4750/4750). Uma rodada completa, nada contra base real nem `.env*`.
- Mutação (devolver a leitura simulada no hook): troquei `useMetrica.ts` pela versão da base com o padrão `simulado = true`. Rodei `coleta/simulado.test.tsx`, `data/simulado.test.tsx` e `app/composicao.test.tsx`: 2 arquivos falharam, 5 testes caíram (os dois do hook e os de Operacional, Tático e Sustentação), 23 passaram. Mutante morto. Restaurado com `git checkout -- web/src/data/useMetrica.ts`; árvore limpa antes do commit.
- Vermelho antes do verde: a mutação acima é a prova (os testes novos de L2a falham quando o hook volta a simular).

## Fora do escopo desta passada
Suíte completa no CI do PR (check-run `bateria` do mesmo sha) é a prova da suíte inteira; os 1500 testes locais só do `web/`. Remoção do código morto (L2b/L2c), contrato do servidor (L3) e E2E (L5) são de outras etapas.

## Achados
