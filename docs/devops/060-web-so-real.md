---
tipo: revisao-devops
contrato: 1
pedido: 060-triagem-dependabot
branch: feature/060-web-so-real
commit: bd6d6f239916c31e2e90b31870c76ddc4c819c38
parecer: aprovado
revisor: forge:devops-engineer
data: 2026-11-03
---
# Review de devops: branch do web com dado real (E2.33, K-195)

## Parecer
Aprovado, sem achado bloqueante. Lido por diff `b446021..bd6d6f2` em `docker/web/Dockerfile`, `docker-compose.homolog.yml`, `docker-compose.yml`, `e2e/playwright.config.ts` e `.github`. Nada foi rodado (sem build, sem suíte): só o QA roda pesado nesta rodada.

## Achados
- `docker/web/Dockerfile:8` · `ARG VITE_FONTE=api` troca o padrão de `mock` e segue o P4 do plano 060-sem-mock. É variável de build pública da SPA, não segredo; base, estágios e `nginx.conf` sem mudança. Aprovado.
- `docker-compose.homolog.yml:76-81` · `build.args.VITE_FONTE: mock` declarado, com comentário da decisão Q3 do dono. A imagem de homologação segue fictícia com selo global; porta em `127.0.0.1`, `mem_limit` mantido. Aprovado.
- `docker-compose.yml:97` · o `web` do compose normal não passa arg, logo sai em `api` (P5/A14). Era o efeito pretendido. Aprovado.
- `e2e/playwright.config.ts:44,54` · build e preview do grupo `@mock` com `VITE_FONTE=mock` explícito, inclusive a semente alternativa. Sem mudança de gatilho de CI. Aprovado.
- `.github` · sem mudança no diff; permissões, SHAs e `timeout-minutes` intactos.
- Recomendado, não devolve: nenhum workflow nem teste confere que a imagem de homologação saiu com `mock`; um smoke de selo global no `homolog:subir` fecharia a lacuna.

Ferramentas: `actionlint` e `shellcheck` fora do PATH ou sem alvo (nenhum workflow ou script alterado); `docker build` não rodado, pela restrição de recursos.

## Custo e rollback
Sem minuto de CI, serviço ou recurso novo (`R-CUSTO`); nada escreve na `main` (`R-MAIN`); nada desligado ou pulado (`R-VERIFY`). Rollback: reverter a branch na develop e reconstruir a imagem; sem migração nem estado de ambiente.
