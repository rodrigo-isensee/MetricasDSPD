---
tipo: qa
contrato: 1
pedido: 097-resumo-filtro-time
branch: feature/097-l3-apontamento-equipe-web
commit: 494b79d206fcc035a162f069af497ce01a98eba7
parecer: reprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 1
bugs_baixos: 0
data: 2026-11-12
---
# QA: 097 L3, Equipe no lugar de Pessoa no Apontamento (web)

**Veredito: reprovado, por um defeito de gate e não de comportamento.** CA-7, CA-8 e CA-9, "Sem equipe", a nota junto da capacidade e o cartão de capacidade estão corretos e provados. O job `testes` do CI do mesmo head (run 43146390103) falhou em `pnpm run cobertura`: `web cobertura: ERROR: Coverage for branches (99.96%) does not meet global threshold (100%)`. Os 1520 testes do web, os 1973 do server e os demais pacotes passaram. Os jobs `build`, `imagem`, `openapi`, `rapida`, `filtro`, `seguranca` e `banco` passaram; `e2e`, `e2e-parte` e `perf` ficaram "skipped" (dependem de `testes`), então o Playwright do L3 ainda não rodou.

## Execução (`VITEST_MAX_WORKERS=2`, sem `.env`, sem base real)
- `web`: `vitest run src/features/apontamento`: `Test Files 11 passed (11)`, `Tests 174 passed (174)`. `tsc --noEmit` do web sem erro.
- Cobertura local só da pasta (`--coverage.include='src/features/apontamento/**'`): branches 99.63%; sem cobertura total: `filtros.ts:103` (98.92%) e `fixture.ts:550` (97.87%). São os dois `?? []` sobre `opcoes.equipes`, o ramo "resposta sem `equipes`".

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| CA-7: filtro Equipe é o 1º depois do período; Pessoa não existe | `apontamento.test.tsx` "CA-7: o filtro Equipe vem logo depois do período e o filtro Pessoa não existe"; E2E `apontamento-qa.spec.ts` CT-10 (`button /^Pessoa/` count 0) | ausência do filtro Pessoa; ordem | passou (vitest); E2E a conferir no CI |
| CA-8: equipe recorta e o cartão de capacidade mantém o formato | `apontamento.test.tsx` "CA-8: ..." (colunas Pessoa, Intervalo, Dias úteis, Capacidade, Apontado, Apontamentos, Utilização); `ligacao.test.tsx` (a rota recebe `equipe=`) | formato do cartão; slug na rota, nunca nome | passou |
| CA-9: `pessoa=` na URL ignorado, com aviso, página funcional | `unidades.test.ts`, `ligacao.test.tsx`, `apontamento.test.tsx` "CA-9" | `pessoa=` nunca vai à consulta nem ecoa o valor | passou (a mutação abaixo derruba os 3) |
| "Sem equipe" | `apontamento.test.tsx` "a opção sem equipe se chama 'Sem equipe'..." e `unidades.test.ts` (`Equipe=Sem equipe`) | id `sem-time` com rótulo da tela | passou |
| Nota de nomes ocultos e "outra área" junto da capacidade | `apontamento.test.tsx` "com nomesReais ..." e "sem nomesReais ... uma linha explica o rótulo 'Pessoa n'" | nota na nova moradia; sem nome real na barra | passou |
| Mapa diário sem recorte ("Não afetado por: Equipe") | `mapa-diario.test.tsx` (alterado no diff) | `aplicaveis=[]` | passou; o desvio é decisão do dono (recortar pede servidor) |
| Nome real nunca em URL, rota nem storage | E2E CT-10 | LGPD | a conferir no CI (bloqueado pelo job `testes`) |

## Mutação (uma, restaurada, árvore limpa)
| Mutante | Resultado |
|---|---|
| `web/src/features/apontamento/filtros.ts`: trocar `if (params.has('pessoa')) invalidos.push('pessoa')` por comentário | morto: 3 testes caíram (`unidades.test.ts` CA-9, `ligacao.test.tsx` CA-9, `apontamento.test.tsx` CA-9), 90 passaram |

Restaurado por cópia do arquivo original; `git status` limpo.

## Bugs (fora do bloco de achados)
- B1 (média): o limiar de 100% de branches do web falha, `filtros.ts:103` e `fixture.ts:550`: o ramo `?? []` sobre `opcoes.equipes` nunca é exercido por teste. Impede o CI verde e o PR. Correção: ou um teste da resposta sem `equipes` (resposta antiga) para `opcoesDeEquipe`, ou tirar o `?? []` se o tipo torna `equipes` obrigatório. Responsável: react-frontend.

## Achados
- A1 (bloqueante) web/src/features/apontamento/filtros.ts:103 · ramo `?? []` de `opcoes.equipes` sem teste: `cobertura` do web cai a 99.96% < 100% e o job `testes` do CI reprova; o mesmo em `fixture.ts:550`. Cobrir com teste ou remover o ramo.
