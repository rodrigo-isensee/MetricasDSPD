---
tipo: review
contrato: 1
pedido: 041-estabilidade
branch: feature/041-estabilidade
commit: 43e0ba09e341a72cbb97228bf7e57f23683bd92b
parecer: aprovado
revisor: tech-lead
data: 2026-10-27
---

# Code review: estabilidade dos testes (041, E5.1)

Cartões: K-135, K-092, K-115, K-138, K-107, K-123, K-134, K-132.

**Veredito: aprovado**, sem achado bloqueante. Ficam recomendações que não devolvem a branch.

**Escopo:** a branch inteira, de `c4db73e` (base) até `ca0905f`. São 9 commits: o diagnóstico, as correções do E2.1, do E2.2 e do E3.1, e a ADR 0003 do E2.3. Antes do review, trouxe a `develop` (`e342a2c`) por merge em `43e0ba0`. A `develop` só tinha 2 commits de documentação do 037, sem conflito, e nenhum arquivo fora de `.md` mudou nessa integração. O SHA revisado é `43e0ba0`.

**Ferramentas (citadas, rodadas em `ca0905f` na worktree, com `nice -n 19`):**
- `pnpm run lint` deu EXIT=0.
- `pnpm run format:check` deu EXIT=0 ("All matched files use Prettier code style!").
- `pnpm --filter @metricas-dspd/e2e run pronto` deu EXIT=0. Ele roda `tsc --noEmit` do `e2e`.
- `pnpm --filter @metricas-dspd/metricas --filter @metricas-dspd/mock run typecheck` deu EXIT=0.

Não rodei nenhuma suíte de teste. Por decisão do dono, é uma suíte por vez, e quem roda é o QA na E4.1. Também não rodei o `pronto` completo, porque ele inclui as suítes. A prova de que as correções funcionam vem do QA.

**Pendência de outro papel:** o `forge-check pr 041-estabilidade` pede o parecer de segurança (`R-SEGURANCA`), porque o manifesto `e2e/package.json` mudou. A mudança é só nos `scripts` (`test` virou `test:e2e`, entraram `test:evidencias-qa` e `pronto`), sem dependência nova. Esse parecer cabe ao `security-engineer` e não foi refeito aqui. Ele precisa existir antes do PR.

## Causas e correções (sem aumentar o timeout e sem retry)

O diagnóstico em `docs/qa/041-estabilidade.md` (seções 8 e 10) separou as causas em grupos. Cada grupo foi tratado assim:

| Grupo / cartão | Correção na branch | Leitura |
|---|---|---|
| F4 (K-138) | `perf.spec.ts`: a primeira medição, a frio, sai do p95 e é registrada à parte (`F4_primeiraAFrio`). O laço segue até juntar `N_F4` medições, com teto de tentativas. Com n abaixo do mínimo, o teste falha com uma mensagem explícita. | Segue a ADR 0003, "Medição do F4": a primeira medição fica fora, n >= 20 e o limite de 100 ms continua igual (`ORCAMENTO`). |
| IF-U (K-092) | O teste único virou um por comportamento: ida e volta pela URL, Voltar/Avançar e outra aba. As sequências viraram janelas de 2 passos (1 passo no operacional semanal). | Nenhum passo da sequência original ficou sem cobertura (ver desvio b). |
| CA-19 (K-115) | Um teste por visão e por largura. | A asserção é a mesma (`r.bloqueantes` vazio). Antes eram 4 visões num teste; agora são 4 testes. |
| Espera frágil (K-135) | O helper único é `PainelPage.esperarPronto({ resumo })`. Ele substitui `esperarCartoesProntos`, o `esperarPronto` local do `intensivo-filtros` e `aguardar`/`aguardarResumo` das duas specs da sustentação. | A espera é por estado (`aguardando-coleta`, `aria-busy`, `estado-carregando-*`, `data-estado`, tendências do resumo). Não há `waitForTimeout`. O helper reúne todas as condições das versões duplicadas, então nenhum chamador ficou com uma espera mais fraca. |
| K-107 | Propriedade do Monte Carlo com um fluxo de PRNG por simulação, igual para k e k + 5, e `seed` fixa. O contraexemplo antigo entrou em `examples`. | A asserção é a mesma (`p85(k+5) >= p85(k)`). Agora a propriedade é exata e não depende mais de sorte estatística. |
| K-123 | O gerador passou a ser medido em CPU, com calibração (fator de 1 a 2) contra o trabalho de referência. | É o mesmo modelo do `desempenho.test.ts`. O limite base de 1.500 ms não mudou. |
| K-132 | `e2e/fixtures/evidencias.ts`: por padrão, as evidências vão para `e2e/evidencias-local/`, que está no `.gitignore`. Só `E2E_EVIDENCIAS=qa` (`test:evidencias-qa`) grava em `docs/qa/evidencias/`. O `test` do `e2e` virou `test:e2e`, então `pnpm test` na raiz não dispara mais a E2E. | Conferi que nenhuma spec ou perf grava no caminho versionado. Só sobram os scripts avulsos `e2e/scripts/*.mjs` (gate, hash), que ficam fora da E2E. A CI usa `test:chromium` e `test:perf`, que não mudaram (`ci.yml:223,266`, `homolog.yml:140,164`). |
| K-134 | `e2e/package.json` ganhou um `pronto` com o `typecheck`. O `pronto` da raiz (`pnpm -r --if-present run pronto`) passa a incluí-lo. | O `pnpm --filter @metricas-dspd/e2e run pronto` deu EXIT=0. |
| Workers (decisão do dono, opção A) | `playwright.config.ts`: fora da CI, `workers` usa `E2E_WORKERS` (padrão 2). Na CI fica `undefined`, ou seja, o padrão. | Igual à decisão. A CI não muda. |

O timeout de teste do Playwright não mudou: são 30 s nas suítes e 120 s no projeto `perf`. O `retries` também não mudou (`CI ? 1 : 0`). Os `{ timeout: 30_000 }` do helper já existiam nos helpers duplicados que ele substitui, e esse valor é igual ao orçamento do teste (ver A3).

## Desvios relatados pelo QA na E2.1

- **(a) O `CartaoMetrica.esperarPronto` foi mantido: aceito.** Ele espera um cartão só (`raiz` visível, sem `aria-busy`, sem carregando), num escopo diferente do painel. É usado nas specs que focam um cartão (`b12-fluxo`, `filtros`, `responsivo`). Não é uma duplicata do helper de painel.
- **(b) Janelas de 2 passos (1 no operacional): aceito.**
  - Cada janela parte do estado `de`, montado pela UI, e as janelas são vizinhas. Com isso, toda transição entre estados vizinhos da sequência original continua com retrato, com Voltar e com Avançar.
  - Cada ação continua gravando uma entrada de histórico.
  - O que se perde é o Voltar profundo, com mais de 2 entradas num único teste. Isso é aceitável, porque a propriedade testada é local (uma entrada por ação, e cada estado restaurado).
  - A asserção nova (todas as URLs distintas na janela, mais `goto` do estado de partida reproduzindo o retrato) reforça a cobertura em vez de enfraquecer.
- **(c) O F5 tem mais de 20 amostras: aceito.** A ADR exige pelo menos 20 por item, e para o F5 a regra geral não mudou (a primeira medição entra). Ter mais amostras só torna o p95 mais estável.
- **(d) `N_F4 = max(20, N)`: aceito.** Garante o mínimo da ADR mesmo com `PERF_REPETICOES` menor, e deixa subir o valor quando se quiser.

## ADR 0003 e decisão F4 = A

- A seção "Medição do F4 (pedido 041, 2026-10-23)" está coerente com a decisão: a primeira medição fica fora e é reportada à parte, n >= 20, o limite de 100 ms continua igual e os demais itens não mudam.
- A seção tem data (T2.6), motivo com evidência (seção 5 do diagnóstico), alternativas e critério de reversão próprio.
- A linha em "Leituras" está pendente da medição do QA na E4.
- O `perf.spec.ts` segue a regra.
- Uma ressalva de redação: a ADR fala em "garantir que toda troca gere medição", mas o teste descarta as trocas sem medição e segue até juntar n. O efeito sobre o p95 é conservador e a regra normativa (n >= 20 medições de verdade) é cumprida, então não há achado.

## Checklist (seção 8 do `praticas.md`)

- **1 (escopo):** faz o que o plano da seção 10 pede, sem extra.
- **2 e 3:** nenhuma regra de produto foi tocada. Não há campo por pessoa.
- **4 e 5:** o código é legível e os tipos estão corretos (o typecheck passa).
- **6:** não há segredo nem dado pessoal.
- **7:** não se aplica.
- **8:** o determinismo melhora (K-107 com seed, K-123 em CPU).
- **9:** não se aplica.
- **10 (documentação):** atualizada no mesmo intervalo. Foram README, `guia-do-desenvolvedor.md`, `qualidade-e-testes.md`, `web/README-dev.md` e a ADR 0003.
- **11:** os commits estão em Conventional Commits, com `Cartão:`.

**Teto por PR (M14):** são 543 linhas alteradas de código e teste, contando `e2e/`, `packages/`, `package.json` e `.gitignore`, sem os `.md`. Fica acima de 400. Aceito a exceção pelo seguinte motivo:
- É um pedido só, de estabilização, com 8 cartões interligados.
- Umas 200 linhas são a troca mecânica dos helpers duplicados pelo helper único.
- Dividir obrigaria a refazer a prova de estabilidade do QA por PR.

O corpo do PR vai levar `teto: excedido, 543 linhas, estabilização do 041 com troca mecânica do helper único em 20 specs; a prova de estabilidade do QA vale para o conjunto`.

## Achados

- A1 (recomendado) packages/mock/src/mock.test.ts:30 · `cpuMs`, `referencia` e `REF_OCIOSA_MS` duplicam o `desempenho.test.ts`, que já mede o gerador com o limite de 1.500 ms e calibração. Extrair num módulo de teste comum, ou deixar uma medição só.
- A2 (recomendado) e2e/perf/perf.spec.ts:21 · `MAX_TENTATIVAS_F4` (81 trocas, até 10 s cada) pode passar do timeout de 120 s do projeto `perf` antes da mensagem de amostra insuficiente. Limitar as tentativas pelo tempo restante, ou reduzir o teto.
- A3 (recomendado) e2e/pages/PainelPage.ts:64 · `{ timeout: 30_000 }` vale também para os chamadores antigos de `esperarCartoesProntos` (perf, api), que usavam 5 s. O teste não ganha tempo, mas a falha passa a aparecer como timeout do teste. Registrar no parecer do QA.
- A4 (recomendado) e2e/tests/a11y.spec.ts:5 · o comentário ainda diz que grava em `docs/qa/evidencias/fase-a`. O mesmo vale para `acabamento-ux-evidencias.spec.ts:6`. Atualizar para `pastaEvidencias` (`e2e/evidencias-local` por padrão).
- A5 (recomendado) e2e/tests/sustentacao-no-operacional.spec.ts:1 · o import perdeu o `;`, num arquivo que usa ponto e vírgula, e o `e2e` fica fora do Prettier. Também há `new PainelPage(page)` onde a fixture `painel` já existe. Ambos são cosméticos.
