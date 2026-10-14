# IF-001 - Mudar um segundo filtro antes de o painel recarregar desfaz o primeiro
- Severidade: alta
- Responsável sugerido: react-frontend
- Ambiente: main @ 0af552a (worktree test/qa-intensivo-main), `vite build` padrão (latência simulada 150 a 400 ms), `vite preview`, Chromium 1248 (Playwright), 1280x800 e 375x812

## Passos para reproduzir
1. Abrir `/operacional?cadencia=semanal` e esperar os cartões.
2. Abrir **Equipe**, marcar **Fluig**, Esc.
3. Logo em seguida (sem esperar os cartões recarregarem), abrir **Tipo de demanda**, marcar **Incidente**, Esc.

Variações que reproduzem o mesmo defeito:
- Folha de filtros em 375 px: marcar Equipe Fluig, Tipo Melhoria e Período 4 semanas em sequência e tocar em "Ver resultados".
- `/operacional?equipe=fluig,dados&tipo=incidente`: remover o chip "Equipe: Fluig" e logo em seguida o chip "Tipo de demanda: Incidente" (reproduz sob CPU 6x mais lenta; intermitente).
- Marcar uma equipe e logo em seguida trocar a cadência para Semanal.

## Resultado esperado
Cada ação do usuário é aplicada sobre o estado anterior: a URL termina com `cadencia=semanal&equipe=fluig&tipo=incidente`, os dois chips aparecem e os cartões filtram pelos dois (spec 2.4: "aplica na hora a cada marcação"; 2.5: a URL é a fonte da verdade).

## Resultado obtido
A URL termina com `cadencia=semanal&tipo=incidente`: o filtro de equipe some sem aviso. Na folha de 375 px sobra só `periodo=4s` e o botão mostra "Filtros (1)" depois de 3 escolhas. O usuário lê números de um recorte diferente do que montou.

## Causa provável (para o react-frontend confirmar)
`useFiltros.definir` e `useFiltros.remover` montam o novo estado a partir de `base` (a leitura da URL do último render), e o `navigate` do React Router 7 é uma transição: num painel pesado o render da URL nova atrasa e a ação seguinte parte do estado velho. A correção do bug 004 (`FiltroMulti` partir da última seleção emitida) cobre só cliques dentro do mesmo popover. O `useParametroLocal` (cadência e abas) tem o mesmo padrão: `setParams` com `params` do fechamento, não a forma funcional.

## Evidência
- `e2e/tests/intensivo-filtros.spec.ts`: IF-I13 (barra desktop, 1280 px), IF-I07 (mesmo tick, folha 375 px), IF-I09 375 claro/escuro (folha), IF-I10 (preferências + filtros), IF-I11 (copiar link), IF-I05/IF-I06 (CPU 6x).
- Log do Playwright (IF-I13): `Expected: "cadencia=semanal&equipe=fluig&tipo=incidente"` / `Received: "cadencia=semanal&tipo=incidente"`.
- Log (IF-I09 375 px): `Expected: "equipe=fluig&periodo=4s&tipo=melhoria"` / `Received: "periodo=4s"`; botão "Filtros (1)".
- Reprodutibilidade: ver tabela de repetição em `docs/qa/intensivo-filtros.md`.

## Correção
- Correção: 935e51a (fix(web): filtros na URL partem do estado vigente, URL canônica e aviso de período inválido)
