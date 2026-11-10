---
tipo: qa
contrato: 1
pedido: 077-tendencias-dado-real
branch: feature/077-l7-sust-real-b
commit: 42bf48aaf5535918e1e8f3f3af2d15c39f9528ed
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-10
---
# QA: 077 lote 7, TENDENCIA_SUST no mapa real, branch limpa (E2.3, K-211)

Código testado: `42bf48aa` (um commit sobre a develop `7a44f941`; o HEAD `6cb5ae42` só soma o review em `docs/reviews/`). Obrigações: Lote 7 do pedido 077 (K-211), P-077-6 = (a), CA-8 (nota do S2), A11, ADR 0019 e regras invioláveis (BusinessMap e Acelerato não se misturam; abaixo de 20 itens não publica). Sem alteração minha em código ou teste: a mutação e a cópia temporária de teste foram restauradas (`git status` limpo antes do commit).

## Execução (Node do sandbox, `--maxWorkers=2`, sem base real)
- `server/tests/tendencia-sust-real-l7.test.ts`, `packages/contratos/src/origem.test.ts`, `server/tests/qa-f6-painel.test.ts`, `packages/metricas/src/businessmap/e7.test.ts` e `server/tests/corte-serie-o1-075.test.ts` (os dois últimos são os que usam `VERSOES_DA_BIBLIOTECA`): 5 arquivos, 45 testes, todos passaram.
- Marca da virada com a data da constante: o teste do lote compara com a constante, então conferi o literal à parte: cópia temporária (`server/tests/zz-qa-data.test.ts`, removida) com `id: 'criterio-2026-11-10-tendencia-sust-dado-real'` e `data: '2026-11-10'` escritos à mão em `criterios.serie`/`criterios.janela`: 5 passaram. A constante em `criterios.ts` traz os mesmos valores e está em `VERSOES_DA_BIBLIOTECA`.
- Suíte completa: não rodei local. Prova a citar é o check-run `bateria` do sha do PR (I5), que o tech-lead confere.

## Mutação (à mão, restaurada)
Mutante: tirar `'TENDENCIA_SUST'` de `METRICAS_ORIGEM_REAL` (`packages/contratos/src/origem.ts`). Resultado nos 3 arquivos: 7 testes falharam e 21 passaram (os 4 do lote 7, 2 de `origem.test.ts`, 1 de `qa-f6-painel.test.ts`). Mutante morto. Restaurado com `git checkout`.

## Vermelho antes do verde
O código de produção do lote é a entrada no mapa real e a constante; sem a entrada no mapa os testes novos caem (mutação acima, equivalente à reversão do lote). A rodada `forge-testes --vermelho` não se aplica a este pedido de produto fora do Forge.

## Escopo
- Dentro: `TENDENCIA_SUST` em `METRICAS_ORIGEM_REAL` (fora da simulação), constante `VERSAO_CRITERIO_TENDENCIA_SUST_DADO_REAL`, prova de rota sobre base real mínima (prioridade com 19 apuráveis, BusinessMap fora do resultado, sem janela incompleta, marca da virada, nota `excecao-sla-sem-fonte`).
- Fora: tela, E2E e acessibilidade (sem diff em `web/`), Postgres real, mudar O3, O4, S2 e S3.
- Escopo conferido contra o diff (5 arquivos): nada além do Lote 7.

## Critério → teste → resultado
| Obrigação | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Rota responde com dado real, pelo schema; prioridade com 19 apuráveis `insuficiente`, a de 60 publica | `tendencia-sust-real-l7.test.ts` "responde com dado real..." | 19 (mínimo - 1) | passou |
| Acelerato não tem início de histórico (P-077-6 = a): nenhum mês com `janelaIncompleta`, mesmo com início de carga do BusinessMap | "sem início de histórico..." | ausência de histórico | passou |
| BusinessMap e Acelerato não se misturam | "dado do BusinessMap não altera o resultado" | n/a | passou |
| Marca da virada em `criterios` (id e data 2026-11-10) | "a marca da virada aparece em criterios" + conferência do literal | n/a | passou |
| Nota da exceção de SLA sem fonte no resultado real (CA-8) | "a nota da exceção de SLA..." | n/a | passou |
| Id no mapa real e nunca simulável | `origem.test.ts` (T-C1, lista exata), `qa-f6-painel.test.ts` | lista exata de ids | passou |
| Constante registrada na biblioteca | `e7.test.ts`, `corte-serie-o1-075.test.ts` | n/a | passou |

## Bugs
Nenhum aberto.

## Achados
Nenhum.
