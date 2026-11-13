---
tipo: revisao-seguranca
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: fix/k315-k306-projetor-pg
commit: 9515517db685f2ced9dc0d438c37bf250c3424d1
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-13
---
# Review de segurança: K-315 (lint da CI cobre o server) e K-306 (teste .pg do mapa prioridade_severidade) (E3.148)

Propósito: conferir que a mudança no manifesto da raiz não acrescenta dependência nem script que rode código externo, e que o teste .pg novo não grava dado de pessoa. Diff de `d71599f9` (develop) a `9515517d`: 3 arquivos (`package.json`, `server/tests/coleta-nomes-env.test.ts`, `server/tests/projetor-businessmap.pg.test.ts`); nenhum lockfile, workflow ou código de produção tocado. Nada rodou contra banco, BusinessMap ou Acelerato reais; nenhum `.env*` foi aberto. A suíte inteira fica com o CI: run 43457719601 verde no `9515517d`. Localmente rodou só `pnpm --filter @metricas-dspd/server run lint` (sem erro).

## Achados

## Gatilhos
- Manifesto (`package.json` da raiz): script `lint`, executado pela CI (`.github/workflows/ci.yml:34`, `.github/workflows/homolog.yml:75`) e pelo `pronto:interno`.

## Detalhe dos achados
Nenhum achado. Resultado por ponto do brief:

**1. Manifesto: conforme.** `package.json:12` passa de `eslint .` a `eslint . && pnpm --filter @metricas-dspd/server run lint`. O segundo comando chama um script já existente do próprio workspace (`server/package.json:14`, `eslint .`), com o `eslint` já declarado em `server/package.json:64` e resolvido pelo lockfile atual (o diff não toca `pnpm-lock.yaml`). Não há `dlx`, `npx`, URL, `pre`/`post`install nem pacote novo; `--filter` só aponta para o pacote local. O `&&` falha fechado: erro na raiz impede o resto e erro no server derruba o job. Os jobs da CI que o rodam não mudam de permissões nem de segredos (workflows fora do diff).

**2. Teste .pg do K-306: conforme.** O caso C8a (`server/tests/projetor-businessmap.pg.test.ts:383`) grava cartões pelo `novo()` (`:95`), que só tem id numérico, título fixo `Card de teste`, tipo, datas, quadro, workflow, coluna e `priority`; nenhum `owner_user_id`, nome, e-mail ou responsável. O mapa inserido em `ref_dominio` são quatro pares código/rótulo de severidade. Tudo vive nos schemas de prefixo exclusivo do arquivo (`prefixoDeTeste()`/`montarEsquemas`, `:29`), e o `DELETE` do `finally` (`:404`) está restrito a `${E.bm}` e a `campo = 'prioridade_severidade'`, sem efeito fora do conjunto do teste. SQL com valores por parâmetro (`$1`, `$2`); a única interpolação é o nome do schema gerado pelo próprio teste.

**3. Cópia mais delete: conforme.** As duas trocas (`coleta-nomes-env.test.ts:33`, `projetor-businessmap.pg.test.ts:369`) são equivalentes à desestruturação anterior: cópia rasa e remoção de uma chave em objeto local do teste. O teste de nomes de ambiente continua provando que `ACELERATO_MYSQL_USER` falta e que o valor sentinela não aparece.

## Riscos aceitos e ferramentas
Riscos aceitos: nenhum. O lote pode seguir para o QA; a suíte inteira fica com o CI.

Ferramentas: `gitleaks`, `semgrep` e `osv-scanner` não estão no PATH desta estação e não foram rodados (lacuna registrada). Sem dependência nova no diff.
