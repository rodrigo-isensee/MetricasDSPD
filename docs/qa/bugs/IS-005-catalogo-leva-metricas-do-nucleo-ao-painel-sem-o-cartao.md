# IS-005 - Catálogo: "Ir ao painel" das métricas do núcleo não leva ao cartão; 8 do Operacional caem numa visão sem a métrica
- Severidade: média (navegação do catálogo quebrada para 8 métricas; contorno: trocar a cadência para Semanal e procurar o cartão)
- Responsável sugerido: react-frontend (`web/src/features/catalogo/linhas.ts`, campo `destino`)
- Ambiente: main 0af552a, build de produção, Chromium do Playwright 1.64, 1280x800

## Passos para reproduzir
1. Abrir `/metricas`.
2. Na linha O3 (Tempo de ciclo), clicar em "Ir ao painel de O3".

## Resultado esperado
Chegar ao cartão O3 (como já acontece com as complementares, que usam `destinoDoCartao`: `/operacional?cadencia=semanal#o5`).

## Resultado obtido
- O link é `/operacional`, que abre a cadência diária (só O2, BLOQUEADOS e O1). O3, O4, O7, O9, O10, O12, O15 e O18 não existem nessa visão: o usuário não encontra a métrica que escolheu.
- Nenhuma das 29 linhas do núcleo tem âncora do cartão (O1 a O18, T1 a T9, E1 a E3, S1 a S7, EI e PV1): o link leva ao topo do painel. Só as 17 complementares levam ao cartão.

`linhas.ts` usa `destinoDoCartao(cartao)` só quando acha um cartão `complementar`; para o núcleo devolve `/${m.painel}`. O próprio `destinoDoCartao` documenta que no Operacional os cartões fora da faixa do dia "vivem na semanal, então o link já pede `cadencia=semanal`".

## Evidência
Teste `SIS-CONS-01` em `e2e/tests/intensivo-sistemico.spec.ts` (trecho da falha):
```
"O3: \"Ir ao painel\" sem âncora do cartão (/operacional)",
"O3: o destino /operacional não tem o cartão #o3",
... (o mesmo para O4, O7, O9, O10, O12, O15, O18)
"T1: \"Ir ao painel\" sem âncora do cartão (/tatico)", ... "PV1: \"Ir ao painel\" sem âncora do cartão (/sustentacao)"
```

## Correção
- Correção: 0bd48bd (fix(web): Ir ao painel do catálogo leva ao cartão de toda métrica); 6b30aae e c485929 (O1, O2 e Bloqueados levam à visão diária)
