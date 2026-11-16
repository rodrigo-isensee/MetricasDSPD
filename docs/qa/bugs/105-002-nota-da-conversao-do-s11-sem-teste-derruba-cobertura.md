# 105-002 - Nota da conversão do S11 no cartão sem teste web derruba o portão de cobertura
- Severidade: média
- Responsável sugerido: react-frontend
- Ambiente: feature/105-s11-conversao, commit 3b9ead50, CI run 43843842467 (job testes)

## Passos para reproduzir
1. Rodar `pnpm run cobertura` no head 3b9ead50 (job `testes` do CI).
2. Ver o resumo do pacote web.

## Resultado esperado
Cobertura de ramos do web em 100%, como o portão exige.

## Resultado obtido
`Branches: 99.94% ( 5717/5720 )` e `ERROR: Coverage for branches (99.94%) does not meet global threshold (100%)`; o job `testes` falha. Os 3 ramos novos estão em `web/src/features/complementares/sustentacao.tsx` (`CartaoS11`, bloco `r.conversao !== null`: o próprio bloco, `(r.foraDaConversao ?? 0)` e o `&&`). O diff não toca nenhum teste do web, então a nota "conversão pela decisão registrada no chamado, não pelo vínculo" (exigida pelo dono) nunca é afirmada por teste.

## Evidência
Log do job testes do run 43843842467, linhas "web cobertura: Branches : 99.94%". Mutação: remover a nota do cartão não derruba nenhum teste.
