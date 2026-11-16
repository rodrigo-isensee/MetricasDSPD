---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-classe-pela-prioridade
commit: 8ec2598ede86bccdf3de8fbf8538fe2f8aa1d0a1
parecer: reprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 3
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-16
---
# QA: 105 classe pela prioridade nativa do BusinessMap (E7.100 e E7.161)

Diff de três pontos contra `develop` (74 arquivos). Sem especificação de UX nova: as obrigações são as decisões do dono de 16/11 (campo de urgência do BM, "leitura 2", D-T2, nula, P-1, P-3, P-4, P-5, P-7) e o plano `plano-prioridade.md` (fora do repositório, em `/home/rodrigoisensee/pedidos-assistente/`; critério de parada: minimo-20, nulo-media, t4-agregado). O head revisado é `8ec2598e` (back-end `44e8d62d` mais a tela).

## Achados
- A1 (bloqueante) server/tests/painel-real-f6.pg.test.ts:112 · CI `banco` vermelho no head: o teste (d) ainda espera `sem-dado-real` para T1, que agora é real (P-7). Trocar T1 por métrica ainda sem dado (como o `.test.ts` fez, T3).
- A2 (bloqueante) packages/mock/src/mock.test.ts:1 · CI `build`/gate: hash da base mock mudou (hashBase b6a3c384 para ef67b23e; hashBusinessMap 8d47d431 para 1f3e6fd7) e `docs/qa/evidencias/hash-base-fase-a.json` e `.nota.md` não foram atualizados com a razão.
- A3 (bloqueante) packages/mock/src/businessmap/gerador.ts:1 · CI `testes`/cobertura: `packages/mock` caiu a 99,86% de branches (743/744); o limite é 100%. Cobrir o ramo novo ou removê-lo.

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| T1, T2, T4, T6 e O6 separam por Crítica, Alta, Média e Baixa | `prioridade.test.ts` (biblioteca); `painel-real-f6.test.ts` (API, base real) | 19 insuficiente e 20 ok em cada nível | passou local (metricas 53 arquivos, 1401 testes) |
| Card sem prioridade na faixa "Sem prioridade", contada, nunca Média | `prioridade.test.ts`; `painel-real-f6.test.ts` (nula e valor fora do mapa contam 9) | nula e "Urgente" fora do mapa | passou local |
| O24 usa só a fila da Média | `o24.test.ts`; `painel-real-f6.test.ts` ("inícios da prioridade Média") | Alta e nula fora da fila | passou local |
| T4 uma linha por nível, sem total | `prioridade.test.ts`; `painel-real-f6.test.ts` (chaves exatas) | sem agregado | passou local |
| T1, T2, T4, T6 no mapa real; base real nunca lê o seed | `painel-real-f6.test.ts` (leituras fora do seed = 0); `.pg` (d) | T1 sai de "sem dado" | `.pg` REPROVADO (A1) |
| T2: SLE do nível e "SLE não definido" (D-T2) | `painel-real-f6.test.ts` (Média publica 5 dias; Alta e Crítica null) | prazo não definido | passou local |
| Tela e contrato | testes de web e contratos | n/a | verde no CI (`rapida`, `openapi`, `seguranca`) |
| Bateria completa do head | check-run `CI` do sha `8ec2598e` (run 43860935030) | n/a | VERMELHO: `build` (gate), `testes` (cobertura), `banco` (.pg) |
| `plano-prioridade.md` | existe fora do repositório; nenhuma cópia versionada na branch | n/a | só registro: o brief o cita, o repositório não o contém |

## Mutação no diff (pedida pelo brief)
Rodei 12 mutantes à mão, um por vez, na árvore descartável, e restaurei cada um (`git status` limpo ao fim). Os testes que deveriam cair, caíram: todos morreram.

| Mutante | Resultado |
|---|---|
| nula virando Média: T1, T4, O24 e leitura em `mapa.ts` (4) | morreu (3, 2, 18 e 3 testes falharam) |
| nível com 19 publicando (`MINIMO_AMOSTRA` 20 para 19) | morreu (63 testes) |
| níveis somados: T1, T2, O6, T6 (4) | morreu (5, 4, 5 e 3) |
| O24 lendo a fila Alta: varredura e seleção (2) | morreu (23 e 20) |
| faixa Sem prioridade do T1 não contada | morreu (3) |

Vermelho antes do verde: `forge-testes --vermelho` não existe neste repositório (projeto, não Forge); a prova foi a mutação acima, que dá o vermelho de cada regra nova sobre o código do head.

## Resultado
Reprovado por A1, A2 e A3: o CI do head está vermelho em três jobs, e o pedido exige o check-run `bateria` verde do mesmo sha. A lógica da prioridade está provada pelos testes locais e pelos mutantes; nada na regra de negócio reprovou. Na revalidação, reler o run do novo head e `forge-check parecer delta docs/qa/105-classe-pela-prioridade.md`.
