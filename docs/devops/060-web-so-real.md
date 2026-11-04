---
tipo: revisao-devops
contrato: 1
pedido: 060-triagem-dependabot
branch: feature/060-web-so-real
commit: df21afda697d9b4e4331950adfe31ab8754d15d4
parecer: aprovado
revisor: forge:devops-engineer
data: 2026-11-03
---
# Review de devops: branch do web com dado real (E2.33, K-195)

Histórico: 2026-11-03, commit atualizado para df21afd; o código revisado em b85663e não mudou (depois dele entraram só pareceres, tudo em docs/)

## Parecer
Aprovado, sem achado bloqueante. Lido por diff `b446021..bd6d6f2` em `docker/web/Dockerfile`, `docker-compose.homolog.yml`, `docker-compose.yml`, `e2e/playwright.config.ts` e `.github`, e o delta da volta 2 `bd6d6f2..b85663e`. Nada foi rodado (sem build, sem suíte).

A volta 2 (`bd6d6f2..b85663e`) não mudou nada do meu papel: nenhum Dockerfile, compose, e2e/playwright.config.ts ou `.github` no delta (só web/src e pareceres); o parecer anterior vale e só cita a ponta nova.

## Achados
- `docker/web/Dockerfile:8` · `ARG VITE_FONTE=api` troca o padrão de `mock` e segue o P4 do plano 060-sem-mock. É variável de build pública da SPA, não segredo; base, estágios e `nginx.conf` sem mudança. Aprovado.
- `docker-compose.homolog.yml:76-81` · `build.args.VITE_FONTE: mock` declarado, com comentário da decisão Q3 do dono. A imagem de homologação segue fictícia com selo global; porta em `127.0.0.1`, `mem_limit` mantido. Aprovado.
- `docker-compose.yml:97` · o `web` do compose normal não passa arg, logo sai em `api` (P5/A14). Era o efeito pretendido. Aprovado.
- `e2e/playwright.config.ts:44,54` · build e preview do grupo `@mock` com `VITE_FONTE=mock` explícito, inclusive a semente alternativa. Sem mudança de gatilho de CI. Aprovado.
- `.github` · sem mudança no diff; permissões, SHAs e `timeout-minutes` intactos.
- Recomendado, não devolve: nenhum workflow nem teste confere que a imagem de homologação saiu com `mock`; um smoke de selo global no `homolog:subir` fecharia a lacuna.

Ferramentas: `actionlint` e `shellcheck` sem alvo (nenhum workflow ou script alterado); `docker build` não rodado, pela restrição de recursos.

## Custo e rollback
Sem minuto de CI, serviço ou recurso novo (`R-CUSTO`); nada escreve na `main` (`R-MAIN`); nada desligado ou pulado (`R-VERIFY`). Rollback: reverter a branch na develop e reconstruir a imagem; sem migração nem estado de ambiente.
