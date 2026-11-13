---
tipo: review
contrato: 1
pedido: 097-resumo-filtro-time
branch: feature/k286-mapa-diario-equipe
commit: b0ba260bbe693ecce9aab29fb80673cbf6ec0ca0
parecer: aprovado
revisor: tech-lead
data: 2026-11-13
---

# Code review: 097 K-286, mapa diário do Apontamento recortado pela Equipe (E3.2, E4.14, E4.17)

## Revalidação depois da correção do A3 (E4.17, 2026-11-13)
Parecer: **aprovado** em b0ba260b. O A3 foi resolvido.

- **Delta lido.** `forge-check parecer delta`, `62a622ab..b0ba260b` sem o que veio da develop. No domínio entra só `web/src/features/apontamento/mapa-diario-equipe.test.tsx`, com um caso novo: `?equipe=integracoes,portal` afirma o nome da grade `/^Horas apontadas por pessoa e dia, das equipes Integrações, Portal, de /`. Produção não mudou e não há `istanbul ignore`. Da develop vieram 7 arquivos de servidor, SQL e docs (K-305 e K-311), iguais aos da base, nenhum no Apontamento.
- **Teste e mutante.** O arquivo roda local com 8 testes, todos passando. Troquei o ramo plural de `daEquipe` (`CartaoDiario.tsx:86`, `'das equipes'` → `'da equipe'`) e o caso novo caiu, com 1 falha e 7 passando. O mutante morreu, e o arquivo foi restaurado.
- **CI do PR 377 no head b0ba260b.** Os runs 43469310948 (pull_request) e 43469295271 (push) terminaram em `success`, com `e2e-parte` 1/2 e 2/2 verdes. `web cobertura: Branches : 100% ( 5226/5226 )`.
- **Escopo do teste.** O caso afirma o nome da grade (`CartaoDiario.tsx:128`), mas não a legenda (`:241`) que o A3 sugeria. A grade sozinha já cobre o ramo, porque nome e legenda saem da mesma `daEquipe`. Não bloqueia.
- A1 e A2 (recomendados) seguem abertos e não bloqueiam. O A3 está resolvido.

## Revalidação na junção com a develop (E4.14, 2026-11-13)
Parecer: **reprovado**. A junção está limpa, mas o CI do PR 377 está vermelho por um ramo do próprio K-286 sem teste.

- **Delta lido.** `forge-check parecer delta`, `62a622ab..cc79d3fb` sem o que veio da develop: nenhum arquivo do domínio mudou.
- **O que a develop trouxe e encosta no K-286** (PRs 361 a 374): `packages/contratos` (K-296 `mock` vira `sem-dado`, S1 `unidade`/`horasPorDiaUtil`, S12 `excecaoSla` nulo), `server/tests/apontamento.pg.test.ts` (o down agora desfaz 5 migrações, por causa da 0036) e `web/src/lib/formatar.ts` (sai `fmtHorasUteis`). Nenhum arquivo do K-286 importa o que mudou. Os imports de `formatar` no Apontamento são `fmtMes`, `fmtNumero`, `fmtData` e `fmtDataCurta`. O contrato do Apontamento e os filtros não foram tocados.
- **Execução local** (worktree em cc79d3fb, `--maxWorkers=2`, uma suíte por vez): `web` `src/features/apontamento`, 12 arquivos e 182 testes passaram. `packages/metricas` `src/businessmap/apontamento`, 68 passaram. `server` `tests/apontamento-rota.test.ts`, 83 passaram.
- **CI do PR 377 no head cc79d3fb** (run 43465378846): o job `testes` falhou em `web cobertura` com `ERROR: Coverage for branches (99.98%) does not meet global threshold (100%)`, 5225/5226. O mesmo erro já aparecia em ff183256 (run 43251845652, 5218/5219), antes da junção. O CI de 62a622ab foi cancelado. A develop está verde em d71599f9. A falha, portanto, não vem da junção.
- **O ramo.** Cobertura só da área (`--coverage.include='src/features/apontamento/**'`) aponta 562/563, com o único ramo descoberto em `CartaoDiario.tsx:86`: o plural `'das equipes'` de `daEquipe`, nascido em 62a622ab. Nenhum teste escolhe mais de uma equipe. O parecer de 12/11 dizia que "os dois ramos estão testados na grade", mas isso valia para com e sem Equipe, não para singular e plural. Foi um erro deste revisor.

## Parecer anterior (12/11, volta 1)

Revalidação da volta 1 (62a622ab), que atende à revisão de UX. O parecer anterior aprovou dfba8a37.

## Delta lido
`forge-check parecer delta` do parecer anterior, `dfba8a37..62a622ab`. Entram no domínio 5 arquivos, todos em `web/src/features/apontamento/`: `ApontamentoPage.tsx`, `components/CartaoDiario.tsx`, `dados.tsx`, `mapa-diario-equipe.test.tsx` (novo) e `textos.ts`. Biblioteca e servidor não mudaram. O delta não muda o veredito.

## Execução (`VITEST_MAX_WORKERS=2`, sem `.env`, sem banco)
- `web`, `vitest run` em `mapa-diario-equipe.test.tsx` e `apontamento.test.tsx`: 69 passaram.
- `eslint` nos 5 arquivos tocados: sem erro. `tsc --noEmit` na `web`: sem erro.

## Leitura do delta
- **DadosAba.** Ganhou dois campos, `equipes: string[]` e `removerEquipe`. Os dois são montados em `ApontamentoPage.tsx:92-93` a partir de `ativos` (só a chave `equipe`) e de `uso.remover('equipe')`, e `ativos` entrou nas dependências do `useMemo`. Só há um provedor, e o `tsc` confirma que nenhum outro consumidor ficou para trás.
- **Pessoa e comparação.** `daEquipe` (`CartaoDiario.tsx:83`) só junta os rótulos das equipes escolhidas, sem nome de pessoa. O único dado de pessoa continua sendo o `pessoaRef`, que já existia. Várias equipes aparecem como um só recorte ("das equipes A, B"), sem série nem comparação por equipe. Nenhuma regra inviolável foi tocada.
- **A1 (comoLer).** O texto agora diz que a Equipe recorta o mapa, que os demais filtros não o afetam e que o atípico é decidido sobre o dia inteiro. Isso bate com a biblioteca (`index.ts:58,72`).
- **A2 (vazio).** Sem linhas, o cartão mostra uma mensagem própria e esconde mapa e legenda. Com Equipe ativa, aparece o botão "Remover filtro Equipe", que limpa a URL (testado). Um detalhe: a classe `alvo` já está no botão.
- **A3 (dica do atípico).** A frase `dicaRecorteEquipe` só aparece com Equipe ativa. Os dois ramos estão testados.
- **A4 (aria-label e legenda).** O recorte entra no nome da grade e na legenda da tabela. Os dois ramos estão testados na grade.
- **Tamanho.** São 186 linhas de código e teste contra `origin/develop`, das quais 84 são do teste novo, acima da orientação de 150. O corpo do PR do lote precisa trazer `teto: excedido`. Não bloqueia.

## Achados
- A3 (bloqueante) web/src/features/apontamento/components/CartaoDiario.tsx:86 · ramo plural de `daEquipe` ("das equipes") sem teste: o CI do PR 377 fica vermelho no portão de 100% de ramos da web (run 43465378846). Correção: caso com duas equipes em `mapa-diario-equipe.test.tsx`, afirmando o nome da grade e a legenda.
- A1 (recomendado) packages/metricas/src/businessmap/apontamento/apontamento.test.ts:350 · segue do parecer anterior (M3 do QA sobreviveu): falta um teste via `calcularApontamento` ou rota afirmando que `diario.linhas[].celulas[].atipico` não muda com `equipe`. Código correto; não bloqueia.
- A2 (recomendado) web/src/features/apontamento/components/CartaoDiario.tsx:283 · o vazio sem Equipe ("Nenhum apontamento nesta janela.") não tem teste: o caso `sem filtro de equipe` usa uma fonte com linhas. As duas mensagens também estão no componente, não em `textos.ts`. Não bloqueia.
