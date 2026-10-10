# B3-002 - Alerta da Visão geral leva a âncora inexistente (/operacional#o12)
- Severidade: média (no commit testado; reavaliar quando O12 for entregue, hoje em andamento em outra instância)
- Responsável sugerido: react-frontend
- Ambiente: e4ccab7 (K-026), Chromium

## Passos para reproduzir
1. Abrir `/` e seguir os links da faixa "O que pede atenção agora" (`/operacional#o2`, `#o1`, `#o12`, `/tatico#t2`, `#t4`, `#t3`).
2. Seguir `/operacional#o12`.

## Resultado esperado
VG-03: todo alerta leva ao cartão de origem existente e visível.
## Resultado obtido
`/operacional#o12`: nenhum elemento com `id="o12"`. O alerta aparece na Visão geral antes de o cartão existir no painel.
## Evidência
`e2e/tests/b3-sust-ei-vg.spec.ts` > VG-03. O teste deve passar sem alteração quando O12 existir; se o alerta não for esperado antes disso, suprimi-lo.
