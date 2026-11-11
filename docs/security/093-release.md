---
tipo: revisao-seguranca
contrato: 1
pedido: 093-release-6b-homolog
branch: docs/093-release-b
commit: 1d1dc74ca30e03f9a3a35e2ff37615233673ddf0
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-11
---
# Review de segurança: release 093 (develop em 9fe4b61f contra a homolog)

Propósito: parecer de segurança da release 093 sobre a develop atual (`9fe4b61f`), com o CHANGELOG da volta `1d1dc74c` na branch `docs/093-release-b`. Substitui o parecer anterior (sobre `c6e5fd8f`, CHANGELOG `ce704f9b`), cujo conteúdo segue válido e é repetido abaixo, e cobre o delta `c6e5fd8f..9fe4b61f` (31 arquivos, +542 -16: PRs 303, 304, 305, 306 e 307). Revisão estática: nada rodou contra a base real e nenhum `.env*` foi lido.

## Gatilhos
- Projeção lida pela API (`R-SEGURANCA`): `BLOQUEIOS_COM_DADO_REAL = true` (`packages/contratos/src/origem.ts:58`) leva o conteúdo real de `fato_bloqueio` para BLOQUEADOS, O1, O2, O5 e O19 (PR 298).
- CI/CD: regra do check obrigatório `homolog-aprovada`, que libera o PR de release para a `main` (PR 304, K-263).

## Resultado da release até c6e5fd8f (parecer anterior, mantido)
- **Patch do 6b mesclado igual ao revisado: conforme.** O parecer do lote (`docs/security/075-l6b-publicacao-real.md`, aprovado sobre `bd76128a`) vale para o código da release.
- **Produção alterada só na publicação: conforme.** Interruptor e mapa real (`packages/contratos/src/origem.ts`), `DATA_BLOQUEIO_COM_DADO_REAL = '2026-11-01'` (`packages/metricas/src/core/criterios.ts:127`) e comentários em `server/src/modulos/metricas/servico.ts:322-324`; sem workflow, migração, GRANT nem dependência nova.
- **Sem dado de pessoa nem texto livre do motivo, sem avaliação individual, BusinessMap e Acelerato separados, T2.6 registrada: conforme** (detalhe no parecer do lote).

## Resultado do delta c6e5fd8f..9fe4b61f
- **K-263 (PR 304), patch mesclado igual ao revisado: conforme.** As linhas alteradas em `tools/homolog/src` no squash `18701297` são idênticas às de `6e42dfb8..d1693a72`, aprovado em `docs/security/091-homolog-reavalia.md` (comparação por `diff`, sem saída). Esse parecer é a base e vale para a release.
- **K-263 não aprova candidato nem portão indevido: conforme.** Fork, hotfix, origem diferente de `homolog`, branch ausente e candidato fora da ponta retornam antes do laço (`tools/homolog/src/aprovacao.ts:77-92`), sem esperar. A consulta (`:94-97`) e o laço (`:101-105`) só repetem a mesma leitura de `ponta` com a mesma `temPortaoVerde(..., ['push'])`; esgotadas as tentativas, `aprovada: false` (`:106-107`). Nada vira verde por tempo. O check roda `aprovacao.ts` do `base.sha`: a regra só passa a valer na `main` e o candidato não a troca pela própria branch. `.github/` sem diff (permissões `contents: read`, `actions: read` inalteradas). Teste do arquivo: `vitest run src/aprovacao.test.ts`, 23 verdes.
- **K-264 (PR 305) repassa só a pasta temporária: conforme.** `ambienteFilho` (`server/tests/ajuda-cli-filho.ts:3-7`) monta o ambiente do filho com `PATH`, `TMPDIR` quando definida e os extras explícitos de cada teste; nada mais do `process.env` é herdado, e nenhuma credencial (`PG_*`, apikey, token do Acelerato) passa. `TMPDIR` é um caminho, não segredo. Os cinco testes de CLI tocados usam o helper; o `.env` real segue ignorado (K-261). Só arquivo de teste: sem código de produção. Testes dos arquivos tocados: 5 arquivos, 38 verdes.
- **PRs 303, 306 e 307 e CHANGELOG `1d1dc74c`: conforme.** Só documentação (prática do pronto, pareceres da release, `contrato: 0` em frontmatter antigo, notas do CHANGELOG). Busca por apikey, token, senha, password, secret e e-mail nas linhas adicionadas achou só menções em prosa de pareceres, sem segredo nem e-mail.
- **Nada novo expõe dado de pessoa: conforme.** Sem diff em `server/src`, `server/migrations`, `packages/`, `web/`, `.github/`, `package.json` nem `pnpm-lock.yaml` no delta.
- **Lacunas de ferramenta:** `gitleaks`, `semgrep`, `osv-scanner`, `actionlint` e `zizmor` não estão no PATH; não rodei nenhum. Sem dependência nem workflow novos, ficam com o CI.

## Achados
- A1 (recomendado) server/tests/painel-real-f6.test.ts:339 · o A1 do parecer do lote 075 segue aberto: a regex PESSOA do S6 não cobre bloquead[oa]_?por, quem, coment nem observ; vale um cartão para o QA ou o node-backend, sem bloquear a release.
- A2 (recomendado) .github/workflows/homolog-aprovada.yml:7 · o A1 do parecer do K-263 segue aberto: os comentários (linhas 7-8 e 45-46) ainda dizem "sem espera"; atualizar com a espera de até 6 x 10 s só no portão sem sucesso. Informativo, devops-engineer.

## Plano em cartões
Nenhum bloqueante. A1 ao qa-engineer (ou node-backend) e A2 ao devops-engineer (enviado pelo dono, escopo `workflow`), em cartões próprios, se o tech-lead concordar.

## Riscos aceitos
Nenhum.
