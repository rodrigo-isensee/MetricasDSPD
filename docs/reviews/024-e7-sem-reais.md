---
tipo: review
contrato: 1
pedido: 024-e7-sem-reais
branch: feature/024-e7-sem-reais
commit: d0fcb7b
parecer: aprovado
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

## Rodada 2 (2026-10-17)

**Escopo:** de `2de5d80` a `092d0d1`: `8913d54` (A-1 a A-4 e A-6, node-backend), `df75e29` (A-5, software-architect), o merge `d4c0821` (develop `d83024b`, com o #108 e o #109; resolução do node-backend, E1.6), `de018c6` (nome "Entregas por sistema" no back e na doc gerada, E5.1), `97ddd0b` (teste do front sem `custoConfigurado` e nome no catálogo, E1.4) e `092d0d1` (documentos da UX do E5.2, commitados pelo tech-lead pela decisão técnica do time de 2026-10-17). Decisão do dono (pedido 021, opção A): o E7 passa a se chamar "Entregas por sistema".

**Veredito (rodada 2, `092d0d1`): ajustes necessários.** Os achados A-1 a A-6 estão resolvidos e o merge está correto; o que bloqueia é uma frase na tela que ainda chama o E7 pelo nome antigo (A-7).

### Ferramentas (citadas, não refeitas)
- `pnpm run docs:check` da raiz da worktree, antes do `092d0d1`: rc=0 ("492 páginas Markdown, 69 métricas, 2 eventos").
- `pnpm run pronto` e E2E: não rodados neste review (restrição do usuário de 2026-10-17: dois agentes de dia, uma tarefa pesada por vez); ficam com o QA e com a CI. O hook de pre-push (typecheck do web) passou no push do `092d0d1`.

### Achados da rodada 1
- **A-1** (`regras-metricas.md`, fase 2): resolvido. "E7 sem R$ (revisto em 2026-10-17 pela D2 = A)", e a Q-E7-1 e o custo por fixture deixam de valer.
- **A-2** (`biblioteca-de-calculo.md` 3.9.1): resolvido. O título não cita mais `custo.ts` e o item virou linha de histórico.
- **A-3** (`biblioteca-de-calculo.md`, tabela): resolvido. A linha do E7 descreve só a participação e cita D2 = A (revisão da D-1').
- **A-4** (`biblioteca-de-calculo.md`, estado atual): resolvido. "A Q-E7-1, revista pela D2 = A em 2026-10-17, não vale mais".
- **A-5** (plano, contrato do E7): resolvido. `participacao: taxaSchema | null`, igual a `tambem.ts` e a `docs/api/metricas.md`.
- **A-6** (`docs/api/metricas.md`, mudanças de contrato): resolvido. "E8: nenhum, revisto pelo pedido 024".

### Merge `d4c0821` (develop `d83024b`)
- O delta `d83024b..d4c0821` só tem conteúdo do pedido 024 (30 arquivos: contrato do E7 sem custo, `concluidoEm` no E6, aplicabilidade de E8 e E9, `custo.ts` e `e7.custo.test.ts` removidos, critério T2.6 e docs). Nada do #108 nem do #109 se perdeu.
- `docs/api/metricas.md`: a seção da fase 2 ficou com O22 e O26 (69 ids, `primeiroToque` e `passagens`, C4 da develop), o título "E7 sem R$" e o E8 com `APLICABILIDADE_FLUXO.E8 = []`. A seção "E7 com R$ por fixture" foi trocada pela "E7 sem R$ (pedido 024)".
- `regras-metricas.md` e `biblioteca-de-calculo.md`: os textos da develop (O22, O26, "os seis ids", Q-a e Q-b) foram mantidos, com a regra do 024 no lugar da Q-E7-1.
- `fase2.regras.test.ts`: um teste só junta Q-a e Q-b (O26) com D2 = A (E7) e afirma `D2 = A` e `sem R$` no `refBriefing` do E7; o que a develop afirma do O26 (incluindo `segmentacao`) continua lá.
- `docs/contratos/metricas/E9.md`: só a data de revisão; a seção de cartões do #108 entrou pela parte automática do merge.

### Nome "Entregas por sistema"
- `de018c6`: `CATALOGO_CARTOES` (`cartoes.ts:251`), JSDoc do `resultadoE7` (`tambem.ts:221`), `docs/api/metricas.md`, o plano (§1 e §2), `docs/contratos/metricas/E7.md` e o `README.md` gerados. Só o nome exibido muda (id, rota e cálculo continuam os mesmos), então não é mudança de critério: não precisa de nova versão em `criterios.ts`, e a descrição de `VERSAO_CRITERIO_E7_SEM_REAIS` (`criterios.ts:109`) é registro histórico e fica como está.
- `97ddd0b`: nome em `catalogo-metricas.ts:534` e título do `describe` em `estrategicas.test.tsx`. O teste "nunca mostra valor em reais" deixou de atribuir `custoConfigurado` (o campo não existe mais no tipo) e continua injetando `custoRateado` e `custoPorDemanda` por `Object.assign`; o texto que ele procura (`R$`, `123456`, `rateio`, `custo`) é o que o cartão nunca deve mostrar, então o teste de ausência continua válido (item 11).
- `092d0d1` (UX): o título do E7 na §5 da especificação, a linha 15 de `01-cobertura.md`, uma linha nova no histórico de decisões e a nota da seção 11 da revisão de UX (o texto anterior fica como registro histórico). A pergunta e os CA continuam iguais.
- Busca por "Capacidade por sistema" fora de `docs/qa/`, `docs/reviews/` e `criterios.ts`: só sobrou na revisão de UX (A-10, registro) e na lista de temas da `02-especificacao.md:10` (o tema, não o nome do cartão). **Mas** a busca sem diferenciar maiúsculas encontrou o nome antigo no código (A-7 e A-8).

### Ajustes

| # | arquivo:linha | problema | sugestão | severidade | quem |
|---|---|---|---|---|---|
| A-7 | `web/src/features/complementares/estrategicas.tsx:483` | O "Leia junto" do cartão E8, que aparece na tela, ainda diz "Leia junto com a capacidade por sistema (E7)". Contradiz a decisão do dono (pedido 021) e o nome do cartão ao lado. | "Leia junto com as entregas por sistema (E7)." e um teste que afirme esse texto (hoje nenhum teste o lê). | bloqueia | react-frontend |
| A-8 | `packages/metricas/src/businessmap/e7.ts:14` e `e7.test.ts:45` | O JSDoc e o `describe` ainda dizem "E7: capacidade por sistema". | Trocar por "E7: entregas por sistema". | recomendado | node-backend |
| A-9 | `docs/api/metricas.md:159` | Erro de digitação: "nenhum valor em dinheiro na resposta. os três campos" (minúscula depois do ponto). | "Os três campos". | recomendado | node-backend |

A-7 volta ao react-frontend (prova: `pnpm --filter web test` do arquivo e typecheck); A-8 e A-9 vão juntos ao node-backend, num commit só de texto (`docs:check` basta como prova). A rodada 3 relê só esses trechos.

### Riscos e pendências
- A pendência de integração da rodada 1 (`custoConfigurado` no teste do front) ficou resolvida pelo `97ddd0b`; a do custo fictício na `02-especificacao.md` chegou com a develop (a linha 17 já diz que o E7 não entra em `COM_EXTENSAO_MOCK`).
- Sem gatilho de segurança: não há dado de pessoa, autenticação, segredo nem banco no delta.

## Rodada 3 (2026-10-17)

**Escopo:** de `191015e` a `d0fcb7b`: `19accc9` e `83c5f49` (A-7, react-frontend) e `d0fcb7b` (A-8 e A-9, node-backend). Cinco arquivos, 10 linhas inseridas e 5 removidas; nada além dos três achados.

**Veredito (rodada 3, `d0fcb7b`): aprovado.** A-7, A-8 e A-9 estão resolvidos e o diff não traz mais nada.

### Ferramentas (citadas, não refeitas)
- `pnpm run docs:check` da raiz da worktree, no `d0fcb7b`: rc=0 ("492 páginas Markdown, 69 métricas, 2 eventos").
- `pnpm run pronto` e E2E: não rodados (restrição do usuário de 2026-10-17: uma tarefa pesada por vez); ficam com o QA e com a CI.

### Achados
- **A-7** (`estrategicas.tsx:483`): resolvido. O "Leia junto" do E8 diz "Leia junto com as entregas por sistema (E7).". O teste novo "manda ler junto com o nome vigente do E7" (`estrategicas.test.tsx`) abre o cartão E8 e afirma esse texto com `toHaveTextContent`, ou seja, lê o que a tela mostra. O título do teste não repete o texto lido (`83c5f49`).
- **A-8** (`e7.ts:14`, `e7.test.ts:45`): resolvido. JSDoc e `describe` dizem "E7: entregas por sistema".
- **A-9** (`docs/api/metricas.md:159`): resolvido. "Os três campos", com maiúscula.
- Busca sem diferenciar maiúsculas por "capacidade por sistema" em `.ts`, `.tsx` e `.md` fora de `docs/qa/`, `docs/reviews/` e `criterios.ts`: só restam `docs/ux/revisao-011-front-estrategicas.md` (registro histórico) e `docs/ux/metricas-tambem-disponiveis/02-especificacao.md` (lista de temas), ambos já aceitos na rodada 2.

### Riscos e pendências
- Segue o QA (E1.3), que roda `pronto` e E2E. Sem gatilho de segurança no delta.
