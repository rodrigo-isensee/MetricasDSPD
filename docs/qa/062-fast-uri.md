---
tipo: qa
contrato: 1
pedido: 062-corrige-fast-uri
branch: feature/062-fast-uri
commit: 5c85b0efccf37658e85c4fbdb8b2bd7a1d1e9e09
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-03
---
# QA: 062-corrige-fast-uri, override do fast-uri (E1.4, K-198)

Links: review `docs/reviews/062-fast-uri.md` (aprovado), segurança `docs/security/062-fast-uri.md` (aprovado). Pedido sem especificação de UX, sem contrato novo e sem plano técnico: é troca de versão de dependência (alertas #18 a #25), então não há plano antecipado nem critério `CA-n`; as obrigações são as do brief (E1.4).

**Parecer: aprovado**, sem bug aberto, sobre o código em `5c85b0e` (a ponta `d5499aa` só soma os pareceres de review e de segurança; `git diff --name-only 5c85b0e HEAD` lista só os dois arquivos em `docs/`). Interface não muda: E2E e acessibilidade são n/a. Mutação n/a (nenhum código de aplicação no diff). Vermelho antes do verde n/a (nenhum teste novo).

## Achados
- A1 (recomendado) pnpm-workspace.yaml:22 · a suíte completa (`pronto`), os testes com PostgreSQL e o E2E não rodaram aqui (trava da suíte inoperante no sandbox); a CI do PR deve rodá-los e a instalação congelada valida a integridade dos dois pacotes novos, que não foi conferida contra o registry.

## Critério → teste → resultado

| Obrigação (E1.4) | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Só o fast-uri muda no lockfile | `git diff d05bbfc HEAD -- pnpm-lock.yaml pnpm-workspace.yaml`: 22 linhas no lockfile, todas de `fast-uri` (2 overrides, 2 entradas em `packages`, 2 em `snapshots`, 4 referências de consumidor), mais 3 linhas no workspace | nenhuma outra dependência nem hash alterado | passou |
| Todo consumidor aponta para 3.1.9 ou 4.2.3 | `grep -n fast-uri pnpm-lock.yaml`: 10 ocorrências, todas 3.1.9 ou 4.2.3; consumidores: `@fastify/ajv-compiler` 4.2.3, `fast-json-stringify` 4.2.3, `ajv@8.20.0` 3.1.9, `json-schema-resolver` 3.1.9; nenhuma 3.1.8 nem 4.2.2 | versões vulneráveis ausentes do lockfile | passou |
| Instalação local resolve as versões novas | os links de `ajv@8.20.0` e do `fast-json-stringify` em `node_modules/.pnpm` apontam para `fast-uri@3.1.9` e `fast-uri@4.2.3` | resolução real, não só o lockfile | passou |
| Testes do server que passam pelo fastify (validação de esquema e serialização), 4 workers | `vitest run --project unit --maxWorkers=4` em `app`, `apontamento-rota`, `metricas`, `qa011-fase1.api`, `fontes`: 5 arquivos, 183 testes; e em `metricas.pesquisa`, `metricas-acelerato-f2`, `qa-f6-painel`, `painel-real-f6`: 4 arquivos, 39 testes | 400 de esquema da consulta e serialização das respostas | passou (222 de 222) |
| Testes que não rodaram | suíte `pronto`, projeto `pg` (PostgreSQL real), E2E, `lhci` | n/a | fica para a CI do PR (A1) |

Ambiente: worktree `/home/rodrigoisensee/MetricasDSPD-052h`, carga da máquina 2,3 antes da rodada, nenhum teste pulado, nenhum `.env` lido.
