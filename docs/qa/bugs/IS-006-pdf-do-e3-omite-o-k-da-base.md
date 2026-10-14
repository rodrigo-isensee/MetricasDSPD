# IS-006 - PDF do E3 mostra "Base: 11 iniciativas" enquanto a tela mostra "Base: 9 de 11 iniciativas"
- Severidade: baixa (o PDF não contradiz a tela, mas perde a parte "9 de" que a tela publica)
- Responsável sugerido: react-frontend (`web/src/features/exportar/modelo.ts`, texto da base; o cartão usa `baseK` em `CartaoE3.tsx`)
- Ambiente: main 0af552a, build de produção, Chromium do Playwright 1.64, 1280x800

## Passos para reproduzir
1. Abrir `/estrategico` e esperar os cartões.
2. Ler o selo de base do E3: `Base: 9 de 11 iniciativas`.
3. "Exportar" > "Gerar arquivo" > "Baixar" e ler o bloco "E3 · Entrega × resultado" do PDF.

## Resultado esperado
A mesma base da tela (`Base: 9 de 11 iniciativas`): a exportação traz os mesmos números da tela (pedido 008).

## Resultado obtido
`E3 · Entrega × resultado Fonte: BusinessMap Filtros: Sistema: Todos · Período: Últimos 12 meses Base: 11 iniciativas ...`. O E3 é o único cartão com `baseK`; nos 5 painéis exportados, todas as outras bases da tela aparecem iguais no PDF.

## Evidência
Teste `SIS-CONS-05` em `e2e/tests/intensivo-sistemico.spec.ts`: `"/estrategico E3: tela \"Base: 9 de 11 iniciativas\" e o PDF não traz 9"`.

## Correção
- Correção: 0759413 (fix(web): PDF do E3 traz a base 'k de n' como a tela)
