---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-e5-e-extensao
commit: 5446bd39a69aa58d9de952d5186be90bde36c372
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-16
---
# QA: E5 conta frente adicionada pela regra do T9 (105, K-376, E7.191)

Base 0c989148, código em 5446bd39 (merge da develop sobre fc27ecae). Classe N, sem UX nem contrato de API. Diff contra a develop conferido: 5 arquivos (CHANGELOG, businessmap.test.ts, comum.ts, e5.ts, t9.ts), sem escopo novo. Obrigação: o E5 conta frente adicionada pela mesma regra do T9 (`frenteAdicionadaAposInicio`), sem ler `adicionado_apos_inicio_pai`; projeto sem início não tem frente adicionada.

## Achados

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| E5 conta só a frente criada depois do início do projeto (T9 e E5 iguais) | businessmap.test.ts, "T9 calcula avanço e escopo pelos filhos" (E5: restantes 2, adicionadas 1) | frente anterior ao início não conta | passou; mutante (inicio !== null sem `criado_em > início`) derrubou o teste |
| Projeto sem início: nenhuma frente adicionada; frente criada antes e ligada depois é original; o campo antigo não é lido | businessmap.test.ts, "E5 (105, K-376): projeto sem início..." (campo antigo true, esperado 0) | início nulo; campo legado | passou; mutante (início nulo conta como adicionada) derrubou o teste |
| T9 segue igual após extrair a função | mesmo teste do T9 (agora sem forçar o campo antigo) | regra única | passou |

## Cenários e resultado real
- Local, `packages/metricas`: `vitest run src/businessmap/businessmap.test.ts`: 21 passaram, 0 falharam.
- Mutante 1 (frente anterior ao início): em comum.ts, `inicioProjeto !== null && criado_em > inicioProjeto` virou `inicioProjeto !== null`. Resultado: 1 falhou (teste do T9/E5), 20 passaram. Morto.
- Mutante 2 (projeto sem início): `inicioProjeto === null || criado_em > inicioProjeto`. Resultado: 1 falhou (teste "projeto sem início"), 20 passaram. Morto.
- Código restaurado (`git checkout`) após cada mutante; árvore limpa.
- Leitura: `adicionado_apos_inicio_pai` só resta no modelo (modelo.ts:50) e num comentário do T9; nenhum cálculo o lê.
- Vermelho antes do verde: o teste do T9/E5 só ganha a asserção do E5 neste diff; os dois mutantes acima reproduzem a falha sem a regra (equivalente ao E5 antigo, que ignora o início). `forge-testes --vermelho` não rodado: pedido de produto, não de controle.
- CI: o `run` do head 5446bd39 (43867166060) foi cancelado pelo push seguinte (parecer do review, só docs); o último CI concluído verde é o de fc27ecae (43858138963). Sem PR: a suíte inteira fica para o CI do PR; este parecer não afirma CI verde do head.
