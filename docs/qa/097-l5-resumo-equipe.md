---
tipo: qa
contrato: 1
pedido: 097-resumo-filtro-time
branch: feature/097-l5-resumo-equipe
commit: 914f082ca60321143ae7388f4d7c8074d4b8dedc
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-12
---

# QA: filtro Equipe dentro de cada bloco do Resumo (097 L5, E3.3, K-273)

Links: especificação `docs/ux/097-filtros-time-busca.md` (CA-1 a CA-6; o rótulo "Equipe" em vez de "Time" é a decisão do E1.3 sobre a Q-2), pedido `docs/pedidos/097-resumo-filtro-time.md`, base develop 696ca87c.

## Veredito
**Aprovado.** CA-1 a CA-6 têm teste que prova no Vitest e no Playwright. Não há número de equipes lado a lado nem soma das fontes. A mudança em `useFiltros.ts` (dois conjuntos de filtros na mesma URL) não regrediu os outros painéis: `src/features` inteiro passa. Um achado recomendado, de teste e2e (A1). A suíte inteira é a do check-run `bateria` do mesmo sha no PR; aqui rodei os testes afetados e os meus cenários.

## Execução
- Diff conferido contra CA-1 a CA-6: 13 arquivos (BlocoFluxo, BlocoSustentacao, FiltroEquipeBloco, consultas, useFiltros, buscaPendente, contarAtivos, LinhaFiltrosGuardados e seus testes, mais `e2e/tests/resumo-equipe.spec.ts`); o escopo não mudou.
- `VITEST_MAX_WORKERS=2 npx vitest run src/features/operacional src/features/filtros`: 24 arquivos, 303 testes passaram.
- `VITEST_MAX_WORKERS=2 npx vitest run src/features` (inclui os painéis Fluxo, Sustentação, Apontamento etc. que usam `useFiltros`): 75 arquivos, 1198 testes passaram, 0 pulados.
- Playwright (chromium, 2 workers, build mock): `resumo-equipe.spec.ts` 6 de 6; `sustentacao-no-operacional.spec.ts`, `operacional-lote3.spec.ts` e `filtros.spec.ts` 63 de 63 passaram. O e2e do PR segue sendo a prova final.

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| CA-1 filtro em cada bloco, "Todas" | vitest "CA-1"; e2e "CA-1 e CA-2" | valor inicial; dois blocos | passou |
| CA-2 só equipes da própria fonte | vitest "CA-2"; e2e "CA-1 e CA-2" | fluxo só BusinessMap, Sustentação só Acelerato | passou |
| CA-3 muda só o bloco marcado, números e tendência | vitest "CA-3" (inclui o inverso e a URL `equipe` / `sust_equipe`); e2e "CA-3" | bloco vizinho intacto | passou |
| CA-4 aviso consolidado, um conjunto de números | vitest "CA-4 e CA-5"; e2e "CA-4 e CA-5" | 2 equipes; 1 equipe sem aviso | passou |
| CA-5 sem lado a lado, ordenação nem soma de fontes | vitest "CA-4 e CA-5"; e2e (contagem de cartões por bloco; ausência de "ranking/total geral/combinado/somado") | um só `numeros-fluxo` | passou |
| CA-6 menos de 20 itens não publica | vitest "CA-6" (`Poucos itens (n=14). Estatística não publicada.`, sem `numero-p85-valor`); e2e "CA-6" (ver A1) | n<20 | passou |
| Estados: carregando, vazio, erro, link inválido, id antigo | vitest (5 testes) | opções vazias; falha da API; `equipe` inexistente; duas normalizações somadas | passou |
| Acessibilidade | e2e axe nos dois blocos | zero violações sérias | passou |
| Outros painéis iguais após `useFiltros.ts` | `src/features` inteiro; e2e filtros e Sustentação | `contarAtivos` do Resumo × demais visões | passou |

## Vermelho antes do verde
Os arquivos de produção do diff (7) voltados à base `origin/develop` em cópia na árvore da worktree, depois restaurados (`git status --short` vazio):
`vitest run equipe.test.tsx` na base: 12 de 12 testes falharam (`CA-1` a `CA-6`, URL, chip, links, normalização, carregando, vazio, erro). No head, os 12 passam.

## Mutação no código alterado
- M1 `contarAtivos.ts`: `if (semEquipe) ...` vira `if (false) ...`. Morto por 2 testes ("sem barra de filtros...", "no Resumo diz que nenhum se aplica...").
- M2 `BlocoFluxo.tsx`: a tendência deixa de levar a equipe. Morto por 2 testes ("só a equipe do bloco na consulta", "CA-3").
- M3 `BlocoSustentacao.tsx`: a equipe do bloco vira `[]`. Morto por "CA-3" (1 falhou, 105 passaram).
- Restaurados por `git checkout`; árvore limpa antes do commit.

## Bug
Nenhum aberto.

## Achados
- A1 (recomendado) e2e/tests/resumo-equipe.spec.ts:78 · no CA-6 o laço sai sem falhar se nenhuma equipe tiver menos de 20 itens (o `expect` do motivo está dentro do `if`): numa semente maior passa sem provar. Afirmar `poucos > 0` depois do laço. O Vitest prova o CA-6 hoje.
