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
