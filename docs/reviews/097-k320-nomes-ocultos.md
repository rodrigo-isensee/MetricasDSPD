---
tipo: review
contrato: 1
pedido: 097-resumo-filtro-time
branch: fix/k320-nomes-ocultos
commit: 0e0e41bd096a193ff1f5759366631ac7213216c7
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-13
---
# Review: K-320, linha de nomes ocultos onde a tela lista Pessoa n (E4.49)

## Achados
- A1 (recomendado) web/src/features/apontamento/components/CartaoDiario.tsx:279 · guarda `linhas.length > 0 &&` sem teste do ramo de falha: removida, os 223 testes da pasta seguem verdes. Afirmar a linha ausente no teste de `diario-sem-pessoas`.

## Leitura
- **Faz o que o cartão pede:** `NotaNomesOcultos` (12 linhas, `Pick<RespostaApontamento, 'nomesReais'>`) devolve `null` com `nomesReais` e a linha `LINHA_NOMES_OCULTOS` sem; os quatro lugares que listam Pessoa n a usam: AP-MATRIZ, AP-QUALIDADE-PESSOA, AP-CAPACIDADE-PESSOA (que trocou o `<p>` próprio pelo componente, sem duplicação de texto) e AP-DIARIO (só com linhas no mapa). Nada além disso.
- **Regras invioláveis:** só um texto explicativo do rótulo; nenhuma métrica, ordenação ou ranking por pessoa novos, nenhuma comparação entre times; o `data-testid` e o texto são os mesmos de antes.
- **Testes:** `revisao-ux.test.tsx` cobre os quatro cartões nos dois ramos (uma linha sem nomes, nenhuma com nomes reais); `apontamento.test.tsx` passou a exigir 4 linhas na aba. Mutante `if (r.nomesReais) return null` → `if (false)`: 4 testes "não mostra a linha com nomes reais" falham (morto). Mutante da guarda do mapa: vivo (A1).
- **CT-67 com `.first()`:** antes havia uma linha só na aba; agora há quatro e o `toBeVisible()` estrito quebraria. O que o caso prova (sem nomes reais, a linha aparece, sem aviso de nome real, rótulos Pessoa n) continua; o ramo com nomes reais fica nos testes de unidade. `npx playwright test tests/apontamento-qa.spec.ts --project=chromium --workers=1 -g CT-67`: 1 passed (11.1s).
- **Ferramentas citadas:** `npx vitest run` de `revisao-ux.test.tsx` e `apontamento.test.tsx` com `-t "nomes ocultos|Pessoa n"`: 11 passando; `src/features/apontamento` inteiro (no mutante do A1): 223 passando. CI do head pelos check-runs: banco, openapi, seguranca, filtro, build, rapida e imagem com success; e2e e perf skipped pelo filtro; `testes` em andamento na hora do parecer. A suíte completa vale pelo CI do PR.
- **Tamanho:** 45 linhas adicionadas e 10 removidas (`git diff --numstat --no-renames 4bb55c33...0e0e41bd`), um comportamento só.
- **Commit:** um `fix(apontamento)` em Conventional Commits em português, com o K-320 no assunto.

## Parecer
Aprovado em 0e0e41bd. O componente é único, some com nomes reais nos quatro lugares e o CT-67 segue provando o que provava; o A1 é teste a mais de uma guarda de exibição e não bloqueia.
