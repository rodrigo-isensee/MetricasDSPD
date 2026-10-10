# IR-002 - Falha de leitura do estado de coleta fica presa em "Verificando a coleta..."
- Severidade: média
- Responsável sugerido: react-frontend
- Ambiente: branch feature/integracao-real (4acedbb), build de produção, Chromium

## Passos para reproduzir
1. Abrir `/operacional?mock=coleta-erro:bm`.
2. Esperar 20 s.
Teste: `e2e/tests/integracao-real.spec.ts` CT-34.

## Resultado esperado
Mensagem "Não foi possível verificar a coleta." com o botão "Tentar de novo" (FrescorFonte, ramo `isError`), em linguagem neutra, distinta de "Coleta falhou em..." (UX r1 M-1).

## Resultado obtido
O texto permanece "Verificando a coleta..." (estado pendente) por mais de 20 s; nunca chega ao erro nem ao botão. Na Q1 esse estado aparecia; regressão provável de K-061/K-062 (`ProvedorCalibracao`/`statusOculto` ou retry da consulta). O axe de CT-27 nessa rota passa, mas avalia o estado de carregamento.
Sem o sufixo (`/operacional`, falha de coleta real) o selo Falha e o aviso funcionam.

## Evidência
CT-34 falha; `e2e/test-results` (trace). Capturas de M-1 foram refeitas em `/operacional` (falha de coleta).
