---
tipo: revisao-devops
contrato: 1
pedido: 060-triagem-dependabot
branch: feature/060-api-so-real
commit: 0183e430d6b3df391a60320abc652022d0f17aab
parecer: aprovado
revisor: forge:devops-engineer
data: 2026-11-03
---
# Review de devops: branch da API do 060 (E2.19, K-195), renovado por delta

## Parecer
Aprovado, sem achado bloqueante. Renovação por delta `110e467..0183e43` (merge da develop, 5ac7ace) em `docker-compose.homolog.yml scripts tools .github package.json`: nenhum arquivo mudou. Lido por diff e busca, sem rodar workflow nem suíte.

## Achados
- `docker-compose.homolog.yml:52` · `DSPD_MODO_MOCK: homologacao` segue só no serviço `api`, igual ao parecer anterior; `worker` e `migrate` sem a variável, porta em `127.0.0.1`, sem segredo novo. Aprovado.
- Guarda-mock (`api.ts`, `guarda-mock.ts`) · só roda com o modo mock e só lê `ctl_coleta`, contando linhas cuja `versao_coletor` não é do seed. O banco da homologação tem só seed (volume próprio), a contagem dá zero e a subida segue igual. Aprovado.
- `scripts/com-api-mock.sh` e `homolog:subir` (`tools/homolog/src/comandos.ts`) · sem mudança no delta; o seed segue por `PG_SEED_URL` preso a banco `_test`. Aprovado.
- `docker-compose.yml` (vindo da develop, serviço `coleta` do pedido 061) · perfil `coleta`, sem porta, fora do `up`; parecer próprio em `docs/devops/061-coleta-diaria.md`. Nada a repetir aqui.
- `server/Dockerfile` (+2 linhas, também do 061) · fora do escopo desta branch; coberto pelo parecer do 061.
- Workflows em `.github`: sem mudança; permissões, SHAs, `timeout-minutes` e gatilhos intactos.
- Recomendado, não devolve: os dois recomendados do parecer anterior seguem abertos (`.env.example:24,26` com variáveis que agora recusam a partida, ação do dono; nota no fluxo de homologação de que o subir de demonstração é o `dev`).

Ferramentas: `actionlint` fora do PATH (lacuna registrada, nada instalado); `shellcheck` e `docker build` não rodados, sem script nem Dockerfile alterado no escopo.

## Custo e rollback
Sem minuto de CI, serviço ou recurso novo (`R-CUSTO`); nada escreve na `main` (`R-MAIN`); nada desligado ou pulado (`R-VERIFY`). Rollback: reverter a branch na develop; sem migração nem estado de ambiente envolvido.
