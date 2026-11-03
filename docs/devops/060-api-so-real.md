---
tipo: revisao-devops
contrato: 1
pedido: 060-triagem-dependabot
branch: feature/060-api-so-real
commit: 110e4678705dfd44eb72d647c4b2a49d3ebe1981
parecer: aprovado
revisor: forge:devops-engineer
data: 2026-11-02
---
# Review de devops: branch da API do 060 (E2.19, K-195)

## Parecer
Aprovado, sem achado bloqueante. Escopo: `git diff 3c284ff...110e467 -- docker-compose.homolog.yml scripts tools .github package.json`: 2 arquivos, 3 linhas a mais e 1 a menos. Lido por diff e por busca, sem rodar workflow nem suíte.

## Achados
- `docker-compose.homolog.yml:52` · o serviço `api` ganha `DSPD_MODO_MOCK: homologacao`, o único valor aceito pela config (`config.ts:35`). Só a `api` recebe; `worker` e `migrate` não. Porta em `127.0.0.1`, sem segredo novo. Q3 cumprida. Aprovado.
- `scripts/com-api-mock.sh:2` · só comentário trocado. O servidor que ele sobe usa `modoMock: true` por injeção (`servidor-api-mock.ts`), não por variável, e o `PG_SEED_URL` segue preso a banco `_test`. Aprovado.
- `homolog:subir` · `tools/homolog/src/comandos.ts` não mudou: o seed usa `PG_SEED_URL` (P1) e não passa variável removida. Ele sobe o mock por decisão de Q3, em volume e porta próprios. Aprovado.
- Busca em `.github`, `scripts`, `tools`, `package.json`, `docker`, `server`, `web`, `e2e`: nenhum workflow nem script passa `DADOS_FONTE` ou `DSPD_SCHEMA_PREFIXO_SEED`. Só sobram comentários em `web/paridade/paridade.test.ts:2,137` e `e2e/tests-api/api.spec.ts:4` (P4) e um comentário em `repositorio-pesquisa.ts:73`. Recomendado, não devolve: o node-backend ou o react-frontend limpa no P4.
- Q5 · `scripts/dev.sh` e `docker-compose.yml` não têm `DSPD_MODO_MOCK`: o subir do dono (`pnpm run dev`) parte de dado real. Só o `homolog:subir` leva o mock, por Q3. Recomendado, não devolve: o tech-lead deixar no `docs/engineering/fluxo-homologacao.md` que o subir de demonstração do dono é o `dev`, não o `homolog:subir`.
- `.env.example:24,26` · cita `DSPD_SCHEMA_PREFIXO_SEED` e `DADOS_FONTE`, que agora recusam a partida da API. Quem copiar o exemplo e descomentar quebra a API. Ação do dono (agente não lê nem edita `.env*`). Recomendado, não devolve.
- Workflows (`ci.yml`, `homolog*.yml`, `restauracao.yml`): sem mudança na branch; permissões, SHAs, `timeout-minutes` e gatilhos intactos. `restauracao.yml` já usa `PG_SEED_URL` (parecer do P1).

Ferramentas: `shellcheck` em `scripts/com-api-mock.sh` com 3 avisos antigos, nenhum na linha alterada; `actionlint` fora do PATH (lacuna registrada, nada instalado); `docker build` não rodado (sem Dockerfile no diff).

## Custo e rollback
Sem minuto de CI novo, serviço ou recurso novo (`R-CUSTO`); nada escreve na `main` (`R-MAIN`); nada desligado ou pulado (`R-VERIFY`). Rollback: reverter a branch na develop; a variável sai do compose e a homologação volta a depender do código antigo, sem migração nem estado de ambiente envolvido.
