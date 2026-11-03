---
tipo: review
contrato: 1
pedido: 060-triagem-dependabot
branch: feature/060-api-so-real
commit: 0183e430d6b3df391a60320abc652022d0f17aab
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-03
---
# Review: 060-triagem-dependabot, branch da API (P2, P3 e a parte de servidor do P5) (E2.14, K-195)

**Rodada 2 (revalidação por delta). Veredito: aprovado em `0183e43`.** O A1 da rodada 1 (dois comportamentos numa branch) está resolvido: as guardas do seed foram para a develop pelo PR 205 e não aparecem mais no diff da branch. A guarda-mock (A1 de segurança) está correta e testada. O merge da develop não mudou código da API.

## Delta lido
`forge-check delta --parecer docs/reviews/060-api-so-real.md`, intervalo `110e467..0183e43`. Li o delta de `server`, `packages`, `docker-compose.homolog.yml`, `scripts` e `tools`:

- **Guarda-mock (`affccc7`):** `server/src/plataforma/db/guarda-mock.ts:10-19`. `exigirMockSemColetaReal` conta as coletas reais de `ctl_coleta` nos esquemas do BusinessMap e do Acelerato, reusando `contarColetasReais` da guarda do seed (`guarda-seed.ts:34`). A contagem só lê, e `versao_coletor` nulo conta como real, que é o lado seguro. Basta um esquema com coleta real para recusar. A mensagem leva só a tabela e a contagem, sem nenhum valor de configuração. O `dspd_api` já tem SELECT em `ctl_*` (`grants.ts`, `paraApi`), então a guarda não precisa de permissão nova.
- **Entrada `api.ts:19-25`:** a guarda roda só com `DSPD_MODO_MOCK=homologacao` e antes do `buildApp`, ou seja, antes de abrir a porta. Se recusa, fecha os três pools e relança o erro, e a partida falha. Fora do modo mock não há consulta extra.
- **Mensagem de recusa das variáveis antigas:** `config.ts:139` deixou de indicar a variável que liga o modo mock.
- **Testes:** `server/tests/guarda-mock.test.ts` cobre a base limpa (duas consultas, passa), a coleta real só no BusinessMap e só no Acelerato (recusa com tabela e contagem, sem o outro esquema e sem `DSPD_MODO_MOCK`) e a mensagem do `carregarConfigApi`. Rodei o arquivo: 4 de 4 verdes.
- **Merge `0183e43`:** `git diff affccc7 0183e43 -- server/src packages` sai vazio, então a develop não tocou código da API. O resto do delta (`deploy/systemd`, `docker-compose.yml`, `server/Dockerfile`, `.dockerignore`, ADRs 0022 e 0023, `README.md`) é a develop (PR 204, coleta diária, e PR 205), já revisada nos PRs dela. Não releio.
- **A1 anterior:** `git diff origin/develop...0183e43 --stat` não traz nenhum dos 11 arquivos das guardas (`guarda-seed.ts`, `seed.ts`, coletores e testes do seed).

Já lido na rodada 1 e sem mudança no delta: P2 (`config.ts`, recusa na partida), `app.ts`, o portão do P3 (`servico.ts`, `rotas.ts`), o contrato (`origem.ts`), as docs da API e os demais testes. As conclusões da rodada 1 sobre eles valem para esta ponta.

## Ferramentas, teto e outros pareceres
- O `praticas.md` não tem regra "decidida por: `<comando>`". A pendência com o arquiteto é a mesma da rodada 1. Cito o autor e a E2.29 sem refazer: typecheck e testes unitários verdes em `affccc7`, e em `0183e43` `tsc` verde e vitest com 423 + 11 verdes. Os `.pg` e o `pronto` ficam para a CI do PR.
- Decisão M14: `git diff --numstat --no-renames origin/develop...0183e43`, sem `.md` e sem a `docs/api/openapi.json` gerada, dá **582 linhas** (395 adições e 187 remoções) em 29 arquivos, todas da API. A rodada 1 aceitou a exceção (520 linhas mais as 62 da guarda-mock, que é o mesmo comportamento: o modo mock da API). O PR leva no corpo `teto: excedido, 582 linhas, P2 e P3 do 060-sem-mock: a API sem modo mock e o portão do mapa real não se separam; troca mecânica de SMock por modoMock nos testes; guarda do modo mock`, recontado na abertura. Sem essa linha, é bloqueante.
- Segurança: `docs/security/060-api-so-real.md`, ainda no `110e467` (reprovado) e em renovação paralela. O A1 dele é o que a guarda-mock resolve. Não refaço o parecer dele, e o merge depende de ele aprovar. Devops: `docs/devops/060-api-so-real.md`, aprovado em `0183e43`, que cito sem refazer.

## Achados
- A1 (recomendado) server/src/entradas/api.ts:22 · A guarda só é provada pelo dublê. Falta um teste .pg com o papel dspd_api sobre base com coleta real (a partida recusa) e sobre base só com seed (sobe). Sugestão: um caso em painel-real-f6.pg.test.ts, num PR à parte.
- A2 (recomendado) server/src/plataforma/config.ts:139 · Mantido da rodada 1: o .env.example ainda cita DADOS_FONTE e DSPD_SCHEMA_PREFIXO_SEED, e um .env copiado dele faz a API recusar a partida. Sugestão: o dono tira as duas linhas, e o PR da API lista isso como ação do dono.

## Parecer
Aprovado em `0183e43`. O A1 de forma da rodada 1 saiu com a divisão (PR 205). A guarda-mock está correta, com a mensagem sem a variável e testes, e o merge não mudou código da API. A1 e A2 são recomendações e não devolvem. O PR depende do parecer de segurança renovado e da linha `teto:` no corpo.
