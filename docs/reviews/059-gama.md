---
tipo: review
contrato: 1
pedido: 059-aba-apontamento
branch: feature/059-rota-apontamento
commit: abfd28728b443a40cb53c553583683b1031a4a86
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-02
---
# Review: 059-aba-apontamento, branch da rota da aba (trilha B4, E2.51, K-193)

**Rodada 1. Veredito: aprovado em `abfd287`.** Nenhum bloqueante. Quatro recomendados (A1 a A4), que não devolvem; o A1 leva uma pergunta ao dono. O teto da decisão M14 fica coberto pela decisão do dono de 2026-11-02 (teto por PR da aba): o PR da rota para a develop leva no corpo a linha `teto: excedido, <n> linhas, <motivo>`, com o número recontado na hora do PR.

## O que foi lido
- `git diff origin/develop...origin/feature/059-rota-apontamento` (136 arquivos). O que veio do contrato e biblioteca (`d75e5ac`) e da coleta (`6106442`, contida na ponta; `d3d50b4` da coleta só acrescenta o parecer de QA) tem review aprovado em `docs/reviews/059-alfa.md` e `docs/reviews/059-beta.md` e não foi relido. As mudanças de `limpar-seed` e os pareceres do 052 vêm da develop.
- O que a rota soma, lido linha a linha (`git diff 6106442 abfd287`, sem o que veio do contrato): `server/src/modulos/apontamento/` inteiro (`hosts.ts`, `pool.ts`, `repositorio.ts`, `rotas.ts`, `servico.ts`, `index.ts`), a migração `0033_bm_apt_pessoa_time.ts` e `checksums.json`, `modulos/referencia/criterios-apontamento.ts` e a entrada `entradas/criterios-apontamento.ts`, `plataforma/config.ts`, `plataforma/db/grants.ts`, `plataforma/db/lgpd.ts`, `app.ts`, `entradas/api.ts`, `entradas/openapi.ts`, `eslint.config.js`, `scripts/test-pg.sh`, `tools/homolog/src/ambiente.ts`; dos testes, os nomes de todos os casos de `apontamento-rota.test.ts`, `apontamento-rota.pg.test.ts`, `apontamento-papel.test.ts` e `apontamento-config.test.ts`, e o corpo dos casos de Outra área e da view.
- Plano `docs/architecture/features/059-aba-apontamento.md` §3.7 a §3.9 e a revisão 4 da ADR 0020 no ramo `origin/docs/059-apontamento-discovery`.
- Pareceres da branch, citados e não refeitos: segurança `docs/security/059-rota-apontamento.md` (aprovado em `75bd9d9`, código até `8a92a49`; a renovação sobre `a1e211f` e `abfd287` é etapa dela) e devops `docs/devops/059-rota-apontamento.md` (aprovado em `8a92a49`; CI, compose, nginx e scripts de papéis).

## Ferramentas (citadas, não refeitas)
- CI do GitHub no HEAD revisado: run `41429255932`, `abfd287`, `success` (pronto, lint, tipos e `.pg`). O autor relata pronto e `.pg` 224 verdes (E2.48).
- Pendência: o `docs/engineering/praticas.md` do projeto não marca as regras com "decidida por"; o review seguiu o checklist da skill `engineering-practices` para o que é leitura.

## Conferência do que a rota soma
- **Módulo e rota:** rota única `GET /api/apontamento` registrada num contexto próprio do Fastify, então os ganchos de 421 e `no-store` valem só para ela; sem `deps.apontamento` a rota não existe (teste). A consulta passa pelo schema do contrato mais a recusa de valor repetido; erro 400 sai só com caminho e código, sem eco. Falha de banco vira 500 genérico, com só classe e SQLSTATE no log. Serializador de requisição sem consulta nem `Host`. Confere com o plano §3.9.
- **Papel e GRANTs:** `dspd_api_apontamento` em `PAPEIS` (entra no REVOKE geral), USAGE só em `bm` e `core`, SELECT por coluna pela lista fechada `COLUNAS_API_APONTAMENTO`; de `dim_responsavel`, só `pessoa_ref` e o nome; de `fato_apontamento`, sem `logged_time_id`, hash, comentário nem categoria. Teste confere que toda coluna concedida existe no catálogo e que o `dspd_api` segue sem nada da aba. `type_id` concedido para o filtro.
- **View de quem é do time (0033):** sem `security_invoker`, entrega só `pessoa_ref` e `vigencia_ate`; o corte dos 12 meses é parâmetro da rota. Exceção nomeada em `lgpd.ts`. A semântica do corte para card encerrado é o A1.
- **Filtro por tipo:** `opcoes.tipos[].id` é o `type_id` em dígitos, o mesmo valor que o filtro aceita; linha sem `type_id` entra nas somas como `sem-tipo` e não vira opção. Valor do filtro nunca entra no SQL (filtragem na biblioteca). Teste ponta a ponta com o papel da aba.
- **Rótulos fixos:** com `nomesReais` falso, rótulo `Pessoa <ref>` e `Outra área`, e a coluna do nome nem é consultada (teste conta as consultas). Ligado, o nome sai só em `opcoes.pessoas[].rotulo` e só para quem é do time.
- **Interruptor:** `APONTAMENTO_NOMES` em `0|1` sem `vazioIndefinido` (vazio recusa a partida); ligado, exige `HOST` em loopback, no `APONTAMENTO_REDE_LOCAL` (um IPv4 privado específico) ou `0.0.0.0` com a publicação declarada em loopback. Testes de config e de arquivos de compose e CI.
- **421:** lista fechada, comparação exata, porta fora, `Origin` só `http(s)`; vale com o interruptor ligado ou desligado; sem corpo e sem eco; `no-store` também na 421 (o `onSend` roda depois do `onRequest`).
- **Lint do pool:** `noInlineConfig` em todo o server; o módulo da aba só é importável por `app.ts`, `entradas/api.ts` e `entradas/openapi.ts`; outro módulo, plataforma ou entrada falha o lint (testes que rodam o ESLint de verdade).
- **Cálculo:** o serviço só lê e monta a moldura; soma, capacidade, utilização, achados e piso de 20 são de `calcularApontamento` (T2.5). Só BusinessMap. Limiares dos achados registrados como versão de critério (T2.6), a partir da constante única da biblioteca.

## Achados
- A1 (recomendado) server/migrations/0033_bm_apt_pessoa_time.ts:22 · a última versão de todo card tem ate nulo, então quem é responsável num card encerrado há anos conta como do time para sempre e aparece com nome; levar ao dono se responsabilidade em card encerrado vale para os 12 meses
- A2 (recomendado) server/src/modulos/referencia/criterios-apontamento.ts:31 · os dois INSERT sem transação: falha entre eles deixa a versão sem a ligação à métrica, e a reexecução a pula pela referência, então ela nunca aparece em criterios; envolver o laço em BEGIN e COMMIT
- A3 (recomendado) server/src/modulos/apontamento/servico.ts:144 · opcoes.subtarefas sai de linhas (período mais diário) e as outras opções saem de noRecorte; usar noRecorte, ou comentar por que as duas opções fixas saem sempre
- A4 (recomendado) server/src/modulos/apontamento/rotas.ts:40 · cast `as never` sem comentário que o explique; tipar o parâmetro como o tratarErro espera ou comentar o escape

## Encaminhamentos
- A1: pergunta ao dono pelo Jarvis (dúvida de regra de negócio não se resolve no código). Toca dado de pessoa (nome de quem saiu do time): cartão para o `security-engineer` considerar na renovação do parecer da rota. Se o dono decidir que card encerrado não conta, a view precisa de uma data de encerramento do card (conclusão ou arquivamento) como fim da responsabilidade.
- A2 a A4: ao `node-backend` numa volta futura, sem bloquear o QA.
- Teto da decisão M14: recontar na hora do PR, com a linha `teto: excedido` no corpo. Hoje, `git diff --numstat --no-renames origin/develop...abfd287` sem `.md`, snapshot e `checksums.json` dá 12964 linhas, com o contrato e a coleta herdados; o que a rota soma sobre a coleta, em `server/` e scripts, sem `limpar-seed`, é cerca de 1678 linhas.
- Integração: os PRs da aba para a develop esperam o PR da exceção mesclado pelo dono (a revisão 4 da ADR 0020 só vale na branch até lá); depois de mesclados o contrato e a coleta, a rota se atualiza com a develop na hora do merge, e o `forge-check pr` aponta se o parecer precisa de revalidação.
