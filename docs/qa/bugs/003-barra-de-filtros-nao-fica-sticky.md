# 003 - Barra de filtros não fica fixa ao rolar (A7 confirmado, e pior)
- Severidade: média
- Responsável sugerido: react-frontend
- Ambiente: develop @ 252bed4, vite preview (VITE_MOCK_LATENCIA=0), Chromium 1280x800

## Passos para reproduzir
1. Abrir /operacional em 1024, 1100, 1180 ou 1280 px.
2. Rolar 300 px.

## Resultado esperado
Spec 2.4 e RESP-03: barra sticky logo abaixo do cabeçalho; com foco nela nada fica coberto.

## Resultado obtido
Cabeçalho quebra em 2 linhas de 1024 a ~1200 px (87 px; a variável --h-cabecalho mede certo: 87px), mas a barra sai da tela (top -55 px com cabeçalho em 87 px): o sticky fica limitado ao contêiner pai da barra, em todas as larguras (a 1280 px: top -17). Ou seja, a barra nunca acompanha a rolagem. O quebra de linha do cabeçalho em 1024-1180 px persiste (A7 parcial: altura é medida, mas a quebra continua).

## Evidência
e2e/tests/responsivo.spec.ts (A7 em 1024/1100/1180/1200, falham); script de medição no parecer.
