---
tipo: qa
contrato: 1
pedido: 077-tendencias-dado-real
branch: feature/077-l3b-historico-acelerato
commit: 92f2683f863efaa14c1231a1885d9460d38f8746
parecer: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-09
---
# QA: 077 lote 3b, o Acelerato nunca recebe `historicoDesde` (E2.3, K-211)

Código testado: `92f2683f`. O HEAD local `1c4d706b` é o merge da develop (`3514e1c1`) sobre ele. Obrigação: P-077-6 = (a) (o Acelerato não tem início de histórico; nenhum ponto da tendência de SLA sai janela incompleta por isso). Lote só de teste: `server/tests/metricas.historico-ac.test.ts` (63 linhas novas, nenhuma em `server/src`); sem tela, contrato nem migração, então sem E2E nem acessibilidade novos.

## Conferência contra a obrigação
| Obrigação | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| A carga do Acelerato não traz `historicoDesde`, com e sem coleta bem-sucedida, com chamados na base | 1 "fica ausente com e sem coleta..." | marca com `finalizadoEm` nulo e preenchido | passou |
| O início do BusinessMap fica só no contexto do BusinessMap quando os dois domínios carregam | 2 "com os dois domínios carregados..." | fontes nunca misturadas | passou |
| O início do BusinessMap nunca marca a `TENDENCIA_SUST` | 3 "nunca marca a TENDENCIA_SUST" | série não vazia (`meses.length > 0`) | passou |
| Sem início de histórico, a `TENDENCIA_FLUXO` não marca nada e o valor não vaza ao resultado | 4 "sem início de histórico..." | série não vazia; campo ausente do JSON | passou |

## Execução
- `vitest run tests/metricas.historico-ac.test.ts --maxWorkers=2` na worktree limpa: 4 passaram, 0 falharam.
- Só o teste mudou no lote (`git diff fb719e7a 92f2683f --stat -- server`: 1 arquivo, 63 inserções). Suíte completa não rodada aqui; vale a CI do push, que o review citou verde no `92f2683f`.

## Mutação à mão (código restaurado a cada rodada com `git checkout -- server/src`)
| Mutante | Resultado |
|---|---|
| M1 `carregarAC` devolve `historicoDesde: '2099-01-01'` | morto: falha o teste 1 (`not.toContain('historicoDesde')`) |
| M2 `ctx.ac` recebe `historicoDesde: bm?.historicoDesde` | morto: falha o teste 2 (`'2099-01-01'` esperado `undefined`) |
| M3 M2 mais `TENDENCIA_SUST` carregando também o BusinessMap (vazamento na sustentação) | morto: falham os testes 2 e 3 (`true` esperado `false`) |
| M4 série vazia (`meses: []`) em `TENDENCIA_FLUXO` e `TENDENCIA_SUST` | morto: falham os testes 3 e 4 (`expected 0 to be greater than 0`) |

Observação: sozinha, a M2 não derruba o teste 3, porque a `TENDENCIA_SUST` só carrega o Acelerato e `bm` é nulo; quem a pega é o teste 2, e o teste 3 pega o vazamento quando a sustentação passa a carregar o BusinessMap (M3). Cobertura por obrigação sem sobreposição que justifique cortar teste.

## Vermelho antes do verde
Lote só de teste sobre código que já cumpre a regra; não há base "sem a implementação" a restaurar. A prova de que os testes reprovam o que dizem é a mutação acima (cada mutante falha ao menos um teste).

## Achados
- Nenhum achado aberto nesta rodada.
