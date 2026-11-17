---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-s1-pausa-validacao
commit: ec0d232e
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-17
---
# QA: S1 pausa o SLA em "Aguardando Validação" (K-389, E7.436)

Obrigações nomeadas: CA-1 a etapa real "Aguardando Validação" (e as grafias sem caixa, espaços ou acentos) pausa o relógio de SLA do S1; CA-2 a lista de etapas que pausam não muda (Aguardando Equipe Interna e Aprovação seguem sem pausar); CA-3 mudança de critério datada: versão `105:S1-pausa-validacao` em 11º, depois de `105:S1-escala-p` em 10º, afetando só S1; CA-4 CT-49 com onze entradas.

## Achados
- A1 (recomendado) packages/metricas/src/acelerato/totalizadores.ts:77 · motivoDaPendencia e a classe da espera (:130) seguem sensíveis a acento; só pausaOSla ficou tolerante. Sem dado real de divergência; não bloqueia.

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| CA-1 | packages/metricas/src/acelerato/acelerato.test.ts (pausaOSla: "Aguardando validação", "Aguardando Validação", "AGUARDANDO VALIDACAO", " Pendente ", "pendente") | caixa, acento e espaço das bordas | passou local; vermelho na base (cai o teste D5a, "expected false to be true") |
| CA-1 (efeito no S1) | acelerato.test.ts (S1 desconta pendências; 10 h corridas ou 9 h úteis) | pausa entra no relógio de resolução | passou; cai nas mutações M1 e M2 |
| CA-2 | acelerato.test.ts (pausaOSla Equipe Interna e Aprovação false; D5a de-para das esperas) | etapas decididas fora seguem fora | passou; cai na mutação M4 |
| CA-3, CA-4 | server/tests/criterios-acelerato.test.ts (CT-49: onze entradas, ordem do merge, métrica 11 → S1) | ordem 10º/11º; métrica afetada | passou local (6 testes); conferido no diff de criterios-acelerato.ts |

## Execução local (head ec0d232e)
- `vitest run src/acelerato` em packages/metricas: 6 arquivos, 58 testes passaram.
- `vitest run tests/criterios-acelerato.test.ts` em server: 6 testes passaram.
- A suíte inteira não foi rodada: fica para o CI do PR, que ainda não existe (sem PR para a branch); este parecer não afirma CI verde nem cita o PQ do autor.
- Diff conferido contra a base e1c98633: 4 arquivos (totalizadores.ts, acelerato.test.ts, criterios-acelerato.ts, criterios-acelerato.test.ts); escopo igual ao pedido. Único chamador de `pausaOSla` que muda número: indice.ts:82 (S1); a classe da espera (:130) já tratava a etapa.

## Vermelho antes do verde (manual, cópia do totalizadores.ts da base)
`git show e1c98633:packages/metricas/src/acelerato/totalizadores.ts` no lugar do arquivo:
```
FAIL  acelerato.test.ts > Acelerato > D5a: de-para das esperas decididas; ...
AssertionError: expected false to be true // Object.is equality
Tests  1 failed | 26 passed (27)
```
Arquivo restaurado e conferido (cmp) depois.

## Mutação no diff (pausaOSla, 4 mutantes manuais)
| Mutante | Resultado |
|---|---|
| M1 compara só `normaliza` (sem acento) | morto: 6 testes caem |
| M2 compara sem `toLocaleLowerCase` (caixa) | morto: 7 testes caem |
| M3 tira `'Pendente'` da lista | sobrevive: equivalente, `'Pendente'` já está em `ETAPAS_PAUSA`; a entrada é redundante |
| M4 tira as esperas do de-para da lista | morto: 2 testes caem |

Mutante equivalente aceito (M3). Não é a ferramenta `forge-mutante`: o pedido não é de controle do Forge.

## Acessibilidade
Sem interface alterada; n/a.

## Observação de dados
O número do S1 muda para os chamados que passaram por "Aguardando Validação" (critério datado, marcado pela versão `105:S1-pausa-validacao`); esperado pelo pedido.
