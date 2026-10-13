# 004 - Marcar todos os valores de um filtro não remove o parâmetro da URL
- Severidade: baixa
- Responsável sugerido: react-frontend
- Ambiente: develop @ 252bed4, vite preview (VITE_MOCK_LATENCIA=0), Chromium 1280x800

## Passos para reproduzir
1. /operacional, abrir Equipe e marcar as 6 equipes.

## Resultado esperado
FIL-04 / spec 2.5: marcar todos os valores equivale ao padrão e remove o parâmetro; chip e "Limpar filtros" somem.

## Resultado obtido
URL fica ?equipe=erp-protheus%2Cfluig%2Csenior%2Cmarketing-e-vendas%2Cdados%2Cplataforma-5g (vírgula também codificada como %2C, contra "formato com vírgulas" da spec).

## Evidência
e2e/tests/filtros.spec.ts (FIL-04).

## Status: VERIFICADO (2026-10-12, QA, feature/lacuna-de-valor @ af9950e)
Chromium. `filtros.spec.ts` FIL-04 passou 3 de 3 isolado e 9 de 9 em repetição. Com 2 equipes a URL fica `?equipe=erp-protheus,fluig` (vírgula literal, sem `%2C`). Houve 1 falha em suíte completa sob carga, causada por leitura da URL logo após Esc (corrida do teste, não do produto); a asserção passou a usar `expect.poll` (e2e/tests/filtros.spec.ts, FIL-04 e FIL-22). Corrigido.

## Reabertura e correção (2026-10-13, PR #40, branch fix/fil-04-equipe-todas)
FIL-04 falhou de forma consistente na CI (2 tentativas, mesmo com `expect.poll`): o parâmetro `equipe` ficava na URL. Causa raiz no produto: `FiltroMulti` calculava a nova seleção a partir da prop `selecionados` (derivada da URL). Com a página mais pesada (K-036), o re-render da URL atrasa em relação aos cliques seguidos, e o clique N partia da prop velha, perdendo a marcação anterior; nunca se chegava às 6 equipes e `colapsarTodos` não disparava. Correção: `web/src/features/filtros/FiltroMulti.tsx` parte da última seleção emitida (ref), ressincronizada quando a prop muda de fato. Teste unitário em `filtros-componentes.test.tsx` (falhava antes, passa depois); FIL-04 verde 5 de 5 e o restante de `filtros.spec.ts` verde.
