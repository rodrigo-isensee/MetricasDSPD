---
tipo: review
contrato: 1
pedido: 101-release-filtros-sem-simulado
branch: docs/101-release
commit: 5d7fe1aac6db8b7f4a9f547719fc73cff7a887e5
parecer: aprovado
revisor: tech-lead
data: 2026-11-12
---

# Code review: release 101 (develop em ea826a9c contra a homolog)

Escopo: `git log --first-parent origin/homolog..ea826a9c`, 27 PRs (#329 a #356, sem o #332) sobre a homolog em 50387f96; 300 arquivos, +8694 −1920, dos quais 208 fora de `docs/` e `.md` (+3664 −1906). Etapa E1.1 do pedido `101-release-filtros-sem-simulado`. Cada PR teve review e QA próprios (`docs/reviews/097-*`, `docs/reviews/099-*`); este parecer lê a release como um todo e não refaz os itens.

## Conferências

- **CI da develop em ea826a9c:** run 43201970764 `completed/success` (imagem, testes, rapida, build, openapi, seguranca, filtro, banco verdes; `e2e`, `e2e-parte` e `perf` pulados pelo filtro de caminhos no push).
- **Diff por área:** web (filtros com busca, Equipe no Apontamento e no Resumo, tipo e prioridade reais, retirada do simulado), servidor (opções reais de tipo, prioridade e equipe; equipe opcional nas tendências; corte único K-280), biblioteca (`packages/metricas`: filtro de equipe nas tendências e no apontamento, sem mudança de regra de cálculo), consultas só de leitura (`scripts/consultas-leitura-098-099.sh` e `scripts/sql/consultas-098-099/`), testes e E2E (guardas G3 e G4), documentos.
- **Migrações:** nenhuma no range; a última segue 0035, já na homolog. O GRANT de `dim_card.equipe` ao `dspd_api_apontamento` (`server/src/plataforma/db/grants.ts:17`) é reaplicado pelo migrador a cada execução (`migrar.ts:94`), mesmo sem migração nova; está nas notas de implantação do CHANGELOG.
- **Contrato:** `simulavel`, `podeSimular` e `METRICAS_SEM_SIMULACAO` saem (`origem.ts`; resposta continua `.strict()`, campo era opcional e a web não o lê desde o #331); `equipe` opcional entra na consulta e nas opções do Apontamento e nas tendências (entrada nova opcional); a equipe da Sustentação passa de enum a slug, com os ids antigos como apelido por um ciclo (`filtros.ts:18-27`). `docs/contratos/snapshots/aceitas.json` sem mudança: o `docs:check` (job `testes`, `ci.yml:77`) e o `openapi:verificar` (job `openapi`) passaram em ea826a9c sem aceite novo, ou seja, mudanças compatíveis. Registrado em "Mudanças que quebram" para quem consome.
- **Critério de cálculo:** nenhuma versão nova; os filtros de equipe só recortam (união de equipes, nunca comparação) e o K-280 só centraliza a condição de corte que já existia.
- **Pessoa e segredo:** nenhuma coluna de pessoa nova lida pela API (`dim_card.equipe` é time; `COLUNAS_PESSOA` intocada). O filtro Pessoa sai da barra do Apontamento; a capacidade por pessoa continua como estava. O script de consultas lê o `.env` só para conferir nomes, passa senhas por ambiente ou arquivo 0600, recusa coluna de pessoa ou texto livre na saída e tem parecer de segurança próprio (`docs/reviews/099-consultas-leitura.md`, K-277, K-281). Nenhum segredo nos arquivos do diff.
- **Nada simulado na web:** `git grep` em `web/src` fora de testes acha só o modo mock declarado (`VITE_FONTE=mock`, `nucleoMock`, `simulacao.ts` do simulador de estados de erro e de coleta), que a ADR 0030 D7 mantém para testes e homologação. Rodei a G1 nesta revisão: `pnpm --filter @metricas-dspd/web build` e `node scripts/sem-mock.mjs` saíram 0 ("G1 ok: sem chunk, sentinela ou texto do mock").
- **Regras invioláveis:** BusinessMap e Acelerato seguem separados (equipe do Fluxo só do BusinessMap, da Sustentação só do Acelerato, cada uma no seu bloco); nenhum ranking ou comparação entre times; cálculo pela biblioteca.
- **CHANGELOG:** os 27 PRs do range estão citados em [Não publicado] (conferido por script, número a número).
- **Revalidação na develop em 5d7fe1aa (PR 357):** delta lido por `forge-check parecer delta docs/reviews/101-release.md` (intervalo ea826a9c..217ae4de, no domínio só o `CHANGELOG.md` desta branch) e `git diff ea826a9c 5d7fe1aa`: o PR 357 (K-273, E1.9) muda só três specs de `e2e/tests-api/` e traz o próprio review aprovado (`docs/reviews/101-specs-e2e-api.md`). FA5-04 e FA5-16 trocam `Incidente` por `Melhoria` (tipo que existe no dado real, 097 L6); TT-02 espera zero selo fictício (ADR 0030); CT-58 tira `equipe=x` dos parâmetros recusados e prova equipe válida 200 e inválida 400 (097 L4/L5); CT-59 só tira `descricao` do regex de pessoa para conferi-la à parte fora de `criterios` (texto fixo do sistema), com nome, e-mail, `usuarioKey`, título e responsável checados no corpo inteiro como antes. Nenhum código de produção, migração, contrato ou critério muda. CI do PR 357 verde com `e2e`, `e2e-parte` 1/2 e 2/2 e `banco`; CI do push na develop em 5d7fe1aa run 43227913561 `completed/success`. O PR 357 entra no CHANGELOG em Corrigido, linha de Testes.

## Achados

- A1 (recomendado) CHANGELOG.md:54 · O #351 (muda App.tsx e vite.config.ts) foi mesclado às 10:37 com testes rodando e e2e-parte 1/2 e 2/2 pendentes (run 43201955537); no push da develop o e2e foi pulado. O primeiro E2E sobre ea826a9c é o do QA (E1.3) ou o do portão.
- A2 (recomendado) .github/workflows/ci.yml:186 · A ADR 0030 põe a G1 no pronto e na CI, mas o job build roda build e size sem sem-mock; a G1 só vale no pronto local. Sugestão: cartão ao devops-engineer para rodar o sem-mock da web depois do build.
- A3 (recomendado) CHANGELOG.md:54 · Classe do A1 já apontada na release 100 (A2 e A4, merge com checks rodando); volta aqui. A linha `AR-<n>` em `docs/engineering/achados-recorrentes.md` fica pendente: o arquivo não existe e está fora da lista do brief.

## Parecer

Aprovado, revalidado na develop em 5d7fe1aa com o PR 357. A release em 5d7fe1aa pode seguir para a homolog quando os pareceres de QA e segurança desta release estiverem gravados; o meu não depende deles. Os achados não bloqueiam: o A1 se fecha com o E2E do QA ou do portão da homolog verde (o E2E do PR 357, já com o código do #351, passou).
