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
