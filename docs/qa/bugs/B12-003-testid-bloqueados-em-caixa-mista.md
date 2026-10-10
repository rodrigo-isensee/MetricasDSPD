# B12-003 - testid do cartão Bloqueados é `metrica-Bloqueados` (convenção pede maiúsculas)
- Severidade: baixa
- Responsável sugerido: react-frontend
- Ambiente: 567e995, Chromium

## Passos para reproduzir
1. Abrir `/operacional` e inspecionar o cartão "Bloqueados agora".
## Resultado esperado
`data-testid="metrica-BLOQUEADOS"` (convenção: código em maiúsculas; ver `e2e/fixtures/constantes.ts` e o plano, R2.7).
## Resultado obtido
`metrica-Bloqueados`; `estado-vazio-*` e `estado-erro-*` também não existem para esse cartão (o vazio é só texto "Nenhum item bloqueado hoje.").
## Evidência
Testes B12 usam `cartao('Bloqueados')`. Se o front mantiver a caixa mista, QA ajusta a fixture em vez de exigir a mudança.
