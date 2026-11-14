---
tipo: qa
contrato: 1
pedido: 092-melhorias-tecnicas-fila
branch: fix/k268-simulado-intermitente
commit: 52aa703de382c0e3e3eb55175ce2536b1f7991e2
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-11
---
# QA: K-268, caso intermitente de simulado.test.tsx

Classe de teste só (um arquivo, `web/src/features/coleta/simulado.test.tsx`, +4 -1; nenhum código de produção). Sem especificação de UX nova, logo sem plano antecipado nem `CA-n`. A obrigação é a do próprio caso: o mock do simulado nasce uma só vez, pelo primeiro cartão simulável (T-W1), e o caso deixa de ser intermitente.

## Execução
- 20 execuções seguidas de `TZ=UTC npx vitest run --maxWorkers=2 src/features/coleta/simulado.test.tsx` (em `web/`, sem outra suíte junto, R-TETO): **20 de 20 passaram**, cada uma com `Tests 6 passed (6)`.
- A suíte inteira roda só no CI do PR (check-run `bateria` do mesmo sha); não é citada aqui.

## Mutação (restaurada antes do commit; árvore limpa conferida)
| Mutação | Efeito | Resultado |
|---|---|---|
| `web/src/data/FonteComSimulado.ts:111` chama `criarMock` duas vezes (`(this.criarMock(dia), this.criarMock(dia))`) | o mock nasce duas vezes | caiu 1 de 6, o caso "o mock é criado uma só vez" (`toHaveBeenCalledTimes(1)`). Morta. |
| tirar a espera `await waitFor(() => expect(o12).toHaveAttribute('data-estado', 'ok'))` | o selo é procurado com o cartão ainda carregando | caiu 1 de 6, em 6 de 6 rodadas. Morta. A linha sai em duas ocorrências do arquivo (o `sed` apagou 2 linhas), então a prova é do padrão, não só deste caso. |

Uma primeira tentativa (recursão em `criarMock` na própria fábrica do teste) estourou `RangeError` e foi descartada sem valer como mutação; restaurada.

## Critério → teste → resultado
| Obrigação | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| T-W1: o painel só com reais não cria o mock; o primeiro simulável o cria uma vez | `o mock é criado uma só vez, pelo primeiro cartão simulável` | n/a (contagem exata de 1 chamada) | passou 20 de 20; mutação "duas vezes" a derruba |
| Sem intermitência: o selo só é lido com o cartão O12 em `ok` | mesmo caso | estado de carregando do cartão | passou 20 de 20; sem a espera, cai |
| Demais casos do arquivo seguem verdes | os outros 5 de `simulado.test.tsx` | n/a | 5 de 5 em cada rodada |

Vermelho antes do verde: o caso não é novo; é correção de teste existente que a mutação sem a espera reproduz em vermelho. Não se aplica `forge-testes --vermelho` (projeto não é o Forge).

## Achados
