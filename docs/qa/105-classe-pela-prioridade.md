---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-classe-pela-prioridade
commit: d3795d736e7f4340a8cf6ceb1cdec3c632e8ecc3
parecer: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-16
---
# QA: 105 classe pela prioridade nativa do BusinessMap (E7.100 e E7.161), revalidação da volta 1

Revalidação do delta `8ec2598e..0b4afd15` (`forge-check parecer delta`, sem o que veio da `develop`). Obrigações: as decisões do dono de 16/11 (campo de urgência do BM, leitura 2, D-T2, nula, P-1, P-3, P-4, P-5, P-7) e o plano `plano-prioridade.md` (fora do repositório). Cabeça de código `d3795d73` (volta 1 do autor, hash regravado e e2e atualizado por mim); cabeça do CI `0b4afd15`, que só soma pareceres de review sobre ela.

## Achados

## Achados da rodada anterior (resolvidos)
- A1 (resolvido) server/tests/painel-real-f6.pg.test.ts:124 · `.pg` agora afirma T1 real com `semPrioridade.total = base.n + semPrioridade.n` (d1); check `banco` verde.
- A2 (resolvido) docs/qa/evidencias/hash-base-fase-a.json:1 · regravado por mim pelo gate do e2e (hashBase b6a3c384 para ef67b23e; hashBusinessMap 8d47d431 para 1f3e6fd7; Acelerato intacto), com a razão em `.nota.md`, commit `fcd3a117`; check `build` verde.
- A3 (resolvido) packages/mock · cobertura de branches em 744/744 (100%) local e check `testes` verde.
- A4 (novo, resolvido por mim) e2e/tests/b12-fluxo.spec.ts:326 · o e2e TAT-02/03 e TAT-06 ainda afirmavam a frase antiga e reprovaram no CI do head `fa07f541`; reescritos para a faixa nova com N de M e exigindo N maior que 0 (commit `d3795d73`).

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| T1, T2, T4, T6 e O6 separam por Crítica, Alta, Média e Baixa | `prioridade.test.ts`; `painel-real-f6.test.ts` | 19 insuficiente e 20 ok | passou (CI e local) |
| Faixa Sem prioridade com N de M (P%), universo e frase de campo vazio; nunca Média | `prioridade.test.ts` (`{n:7,total:85}`); `painel-real-f6.test.ts` (`{n:9,total:87}`); e2e TAT-02/03 e TAT-06 | nula e valor fora do mapa; semPrioridade maior que 0 exigido na tela e na API (T4 `n > 0`) | passou |
| T4 conta cartões distintos (A4 do review) | `prioridade.test.ts` ("sem prioridade que chegou e foi entregue conta 1, não 2") | cartão que chega e é entregue | passou |
| Contrato `semPrioridade { n, total }` com fotografias e openapi | `contratos` (`origem.test.ts`, `tambem.test.ts`), snapshots T1/T2/T4/T6/O6/O24, check `openapi` | chaves exatas, total maior ou igual a n | passou (CI) |
| O24 usa só a fila da Média | `o24.test.ts`; `painel-real-f6.test.ts` | Alta e nula fora da fila | passou |
| T1 real na base real, nunca lê o seed | `painel-real-f6.pg.test.ts` (d, d1) | T1 sai de "sem dado" | passou (`banco` verde) |
| T2: SLE do nível, "SLE não definido" (D-T2) | `painel-real-f6.test.ts` | prazo não definido | passou |
| Cobertura do mock em 100% | `packages/mock` (`--coverage`): 744/744 branches, 261 testes | limite 100% | passou |
| Hash da base mock | `hash-base-fase-a.json` e gate do e2e | mudança intencional registrada | passou (`build`); `--comparar` também OK após o merge da develop |
| Parecer da UX versionado | `docs/ux/` no delta (`a22b428c`) | n/a | presente |
| Bateria completa do head | check-run `CI` do sha `0b4afd15`, run 43877746733 | n/a | verde: build, testes, banco, openapi, seguranca, rapida, filtro, imagem, e2e-parte 1/2 e 2/2, e2e |

## Vermelho antes do verde
Projeto, não Forge: `forge-testes --vermelho` não se aplica. Provas observadas: (1) o e2e TAT-02/03 e TAT-06 falhou no CI do head `fa07f541` (run 43874169191, `Timeout: 5000ms`, texto da faixa nova no cartão), e passou com as assertões novas (local, `2 passed`, e CI `0b4afd15`); (2) o gate de hash reprovou o head `d4c535de` (run 43872330381, `difere em hashBase, hashBusinessMap`) e passou com a referência regravada. A mutação da rodada anterior (12 mutantes mortos, nula virando Média, 19 publicando, níveis somados, O24 na fila Alta, faixa não contada) segue válida: o delta de código da volta só soma a contagem distinta do T4 e a faixa com total, cobertas pelos testes acima.

## Resultado
Aprovado. Os quatro achados estão resolvidos, o check-run do mesmo sha está verde e o caso com `semPrioridade` maior que 0 está provado na biblioteca, na API e na tela. Nenhum bug aberto.
