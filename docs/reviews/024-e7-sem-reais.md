---
tipo: review
contrato: 1
pedido: 024-e7-sem-reais
branch: feature/024-e7-sem-reais
commit: 2de5d80
parecer: reprovado
revisor: tech-lead
data: 2026-10-17
---

# Code review: pedido 024, E7 sem R$, E8/E9 com a janela do cálculo, `concluidoEm` no E6 (rodada 1)

**Origem:** `feature/024-e7-sem-reais` contra a develop `8516ff8`: `7e92cd9` (E3, E8/E9), `beb71c6` (E4, E6), `1bdf1a5` (E1, E7), `cb2502f` (docs da API) do node-backend e `2de5d80` (plano do 011, E2.1 do software-architect, commitado pelo tech-lead conforme a decisão técnica do time de 2026-10-17). Referências: `docs/pedidos/024-e7-sem-reais-participacao.md`, decisão do usuário D2 = A (pedido 011), plano `docs/architecture/features/metricas-tambem-disponiveis.md` §2 E7, ADR 0011, ADR 0020, `docs/engineering/praticas.md` §8, regras invioláveis do `CLAUDE.md`.

**Veredito (rodada 1, `2de5d80`): ajustes necessários.** O código está correto e dentro das regras; o que bloqueia é documentação afetada que ainda descreve o E7 com R$ (`praticas.md` §8, item 10: falta de doc é bloqueia). Nenhuma correção de lógica.

## Ferramentas (citadas, não refeitas)
- `pnpm run pronto` em `cb2502f`: rc=0 (node-backend, entrega do pedido 024). Lint, formato, tipos, testes com cobertura de 100%, `docs:check`, `spec:check`, build.
- `pnpm run docs:check` da raiz da worktree, sobre o plano antes do commit `2de5d80`: rc=0 ("481 páginas Markdown, 67 métricas, 2 eventos").

## O que está conforme
- **E7 sem dinheiro (D2 = A):** `custoRateado`, `custoPorDemanda`, `custoConfigurado`, `custo.ts` (`custoDoPeriodo`, `ConfigCustoDspd`) e `ContextosMetricas.custo` saíram; `calcularE7(ctx, f)` sem parâmetro de custo. Schema `fechado` (estrito) sem nenhum campo de valor. Nenhuma hora apontada (briefing 7.1).
- **Teste anti-dinheiro** (`packages/metricas/src/businessmap/e7.test.ts`, primeiro `it`): percorre todas as chaves da saída, no mock e em fixture, contra `custo|rateio|rateado|valor|preco|reais|brl|dinheiro|orcamento|moeda`, recusa "R$" no JSON e prova que o schema estrito rejeita um campo de custo. `tambem.test.ts` repete a recusa no contrato (`custoTotal`, `valorPorDemanda`, `custoConfigurado`); `server/tests/metricas.test.ts` e `qa011-fase1.test.ts` (E7-2) recusam `"custo` na rota e em 4 períodos.
- **Mínimo de 20:** `participacao = taxa(entregas, total)` só com 20 ou mais entregas no sistema, `null` abaixo (front monta "k de n"); fronteira em `e7.test.ts` (Senior com 20). Cálculo pela biblioteca (`taxa` de `core/estatistica`, `MINIMO_AMOSTRA` do contrato).
- **T2.6:** `VERSAO_CRITERIO_E7_SEM_REAIS` (`criterio-2026-10-17-e7-sem-reais`, `afeta: ['E7']`) em `VERSOES_DA_BIBLIOTECA`; `REGRAS_METRICA.E7.refBriefing` cita D2 = A e a revisão da D-1' e da Q-E7-1, com teste em `fase2.regras.test.ts`.
- **E8/E9 (E3):** `APLICABILIDADE_FLUXO.E8 = []` e `E9 = ['sistema']`, só no contrato; `e8.ts` e `e9.ts` sem mudança de cálculo (E8 já ignora `_f`, janela de 12 meses até hoje; E9 filtra só sistema via `selecionar`). Teste de aplicabilidade com a exceção nominal `SEM_PERIODO` e mensagem por id; `docs/contratos/metricas/E8.md` e `E9.md` regenerados. Consumidores (`web/src/features/painel/propsCartao.ts`, `web/src/features/exportar/modelo.ts`, `tools/docs-contratos/src/insumos.ts`) tratam lista vazia.
- **E6 (E4):** `concluidoEm` (AAAA-MM-DD, `isoDeDia(diaLocal(...))`, mesmo padrão da linha 38 do `e6.ts`) no schema com regex, no OpenAPI, no snapshot e em `docs/contratos/metricas/E6.md`; teste novo em `e6.test.ts` (valor e `safeParse`) e as chaves exatas atualizadas.
- **OpenAPI, snapshots, `docs/contratos/metricas/E6|E7|E8|E9.md`, `docs/api/metricas.md` (tabela e seção "E7 sem R$")** coerentes com o código.
- **Plano (`2de5d80`):** D-1' e Q-E7-1 marcadas como revistas com histórico mantido; `ref_custo_dspd` fora da fase 3; §0, §4, §5, §7, §8 e o histórico do plano coerentes.
- **Front do E7** (`origin/feature/011-front-estrategicas`, `web/src/features/complementares/estrategicas.tsx`, `leituraE7` e `CartaoE7`): lê só `total`, `sistemas[].sistema`, `entregas`, `participacao` e `porNatureza`; nenhum campo de custo.
- Regras invioláveis: só BusinessMap; sistema como dimensão, sem equipe nem pessoa; sem comparação entre times; sem dado de pessoa (sem gatilho de segurança). Commits pequenos, Conventional Commits em português, um propósito cada.

## Ajustes

| # | arquivo:linha | problema | sugestão | severidade | quem |
|---|---|---|---|---|---|
| A-1 | `docs/architecture/regras-metricas.md:143` | O parágrafo "Fase 2 do pedido 011" ainda diz "**E7 com R$ por fixture:** Q-E7-1 = pró-rata por dias corridos ...; rateio e custo por demanda só com 20 ou mais entregas no sistema", contradizendo a linha 142, já corrigida. | Trocar pelo E7 sem R$ (D2 = A, revê a Q-E7-1), ou remover a frase e remeter à linha 142. | bloqueia | node-backend |
| A-2 | `docs/tecnica/biblioteca-de-calculo.md:153` | Documenta `custoDoPeriodo` e `ContextosMetricas.custo`, que foram removidos. | Apagar o item (ou trocar por uma linha de histórico: removido pelo pedido 024). | bloqueia | node-backend |
| A-3 | `docs/tecnica/biblioteca-de-calculo.md:265` | Linha do E7 na tabela das métricas ainda descreve `custoConfigurado`, `custo.ts`, `custoRateado` e `custoPorDemanda`, e a referência cita a D-1' = A. | Descrever só a participação (k de n com 20 ou mais) e citar D2 = A e `VERSAO_CRITERIO_E7_SEM_REAIS`. | bloqueia | node-backend |
| A-4 | `docs/tecnica/biblioteca-de-calculo.md:188` | "a decidida Q-E7-1 vale como regra do E7": a Q-E7-1 não vale mais. | "a D2 = A (2026-10-17) vale como regra do E7; revê a Q-E7-1". | bloqueia | node-backend |
| A-5 | `docs/architecture/features/metricas-tambem-disponiveis.md:301` | O contrato do E7 no plano escreve `participacao: taxaSchema`, sem anulável; o contrato (`packages/contratos/src/tambem.ts:232`, `taxaSchema.nullable()`), o `docs/api/metricas.md` e o próprio plano na linha 331 (aceite "E7, `participacao` anulável") dizem anulável. | `participacao: taxaSchema \| null` (null com menos de 20 entregas no sistema). | bloqueia | software-architect |
| A-6 | `docs/api/metricas.md:268` | O item histórico da fase 2 lista "E8: período" na `APLICABILIDADE_FLUXO`; a linha 267 e o código dizem `[]`. | Acrescentar "(E8 passou a `[]` no pedido 024)". | recomendado | node-backend |

A-1 a A-4 e A-6 voltam ao node-backend (uma rodada só de docs; `pnpm run docs:check` basta como prova, sem `pronto`, já que nenhum código muda); A-5 volta ao software-architect (o tech-lead commita a linha no mesmo padrão do `2de5d80`). A rodada 2 relê só esses trechos.

## Riscos e pendências
- **Integração com o front (cartão para o react-frontend, não bloqueia este pedido):** `web/src/features/complementares/estrategicas.test.tsx:143` (na `origin/feature/011-front-estrategicas`) faz `r.custoConfigurado = true` sobre `ResultadoDe<'E7'>`. Depois que este contrato entrar na develop, essa atribuição deixa de compilar no `tsc` (propriedade inexistente no tipo); quem mesclar por último precisa trocar por `Object.assign(r, { ['custo' + 'Configurado']: true })`, como já é feito com os outros dois campos na linha 145.
- O nome do E7 segue pendente de confirmação do usuário (fora do escopo deste review).
- `docs/ux/metricas-tambem-disponiveis/02-especificacao.md:306` ainda fala do custo fictício do E7 nesta branch; a correção está no `ccb9443` da branch do front (E2.2 coberta pelo pedido 028) e chega à develop com ela.
