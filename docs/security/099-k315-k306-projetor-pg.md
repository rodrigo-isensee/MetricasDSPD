---
tipo: revisao-seguranca
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: fix/k315-k306-projetor-pg
commit: 33edc8d5b2c99ce5a8c4086af501a6910bb26f0f
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-13
---
# Review de segurança: K-315 (lint da CI cobre o server) e K-306 (teste .pg do mapa prioridade_severidade) (E3.148, revalidado em E3.161)

Propósito: conferir que a mudança no manifesto da raiz não acrescenta dependência nem script que rode código externo, e que o teste .pg novo não grava dado de pessoa. Diff de `d71599f9` (develop) a `9515517d`: 3 arquivos (`package.json`, `server/tests/coleta-nomes-env.test.ts`, `server/tests/projetor-businessmap.pg.test.ts`); nenhum lockfile, workflow ou código de produção tocado. Nada rodou contra banco, BusinessMap ou Acelerato reais; nenhum `.env*` foi aberto. A suíte inteira fica com o CI: run 43457719601 verde no `9515517d`. Localmente rodou só `pnpm --filter @metricas-dspd/server run lint` (sem erro).

Revalidação (E3.161) no head `33edc8d5`: `forge-check parecer delta` de `9515517d` a `33edc8d5`, sem o que veio da develop, dá "nenhum arquivo do domínio mudou" (fora do domínio: `server/tests/coleta-nomes-env.test.ts`). Entraram a junção da develop `4ccfb74a` (PRs 375, K-305, e 376, K-311, cada um com parecer próprio em `docs/security/099-k305-pos-d1a.md` e `docs/security/099-k311-pos-k304.md`; a junção não traz resolução de conflito, o diff da develop até ela são só os 6 arquivos deste lote) e o `33edc8d5`, que troca em `coleta-nomes-env.test.ts:92` a desestruturação com variáveis descartadas por cópia de `AC_VALIDAS` mais `delete` de `ACELERATO_MYSQL_USER` e `ACELERATO_MYSQL_HOST`, equivalente em comportamento. O sentinela continua coberto: `SEGREDO` (`:15`) entra como senha (`:18`) e nas URLs, e as asserções de não vazamento seguem em `:39`, `:47`, `:70`, `:125`, `:135` e `:159`. Manifesto, lockfile e workflows sem mudança desde `9515517d` (`git diff` vazio em `package.json`, `*/package.json` e `pnpm-lock.yaml`). `docs/architecture/fontes/acelerato-listas.md` veio do K-305 (nomes exatos com dois-pontos e "Qual suporte foi acionado?" fora da lista fechada, o que reduz o que sai do MySQL), já revisado no parecer dele. O teste não foi rodado aqui (instalar dependência não é do papel de segurança, `R-CONFORMIDADE`); vale o CI do head: runs 43470490358 (push) e 43470501934 (pull_request), ambos verdes.

## Achados

## Gatilhos
- Manifesto (`package.json` da raiz): script `lint`, executado pela CI (`.github/workflows/ci.yml:34`, `.github/workflows/homolog.yml:75`) e pelo `pronto:interno`.

## Detalhe dos achados
Nenhum achado. Resultado por ponto do brief:

**1. Manifesto: conforme.** `package.json:12` passa de `eslint .` a `eslint . && pnpm --filter @metricas-dspd/server run lint`. O segundo comando chama um script já existente do próprio workspace (`server/package.json:14`, `eslint .`), com o `eslint` já declarado em `server/package.json:64` e resolvido pelo lockfile atual (o diff não toca `pnpm-lock.yaml`). Não há `dlx`, `npx`, URL, `pre`/`post`install nem pacote novo; `--filter` só aponta para o pacote local. O `&&` falha fechado: erro na raiz impede o resto e erro no server derruba o job. Os jobs da CI que o rodam não mudam de permissões nem de segredos (workflows fora do diff).

**2. Teste .pg do K-306: conforme.** O caso C8a (`server/tests/projetor-businessmap.pg.test.ts:383`) grava cartões pelo `novo()` (`:95`), que só tem id numérico, título fixo `Card de teste`, tipo, datas, quadro, workflow, coluna e `priority`; nenhum `owner_user_id`, nome, e-mail ou responsável. O mapa inserido em `ref_dominio` são quatro pares código/rótulo de severidade. Tudo vive nos schemas de prefixo exclusivo do arquivo (`prefixoDeTeste()`/`montarEsquemas`, `:29`), e o `DELETE` do `finally` (`:404`) está restrito a `${E.bm}` e a `campo = 'prioridade_severidade'`, sem efeito fora do conjunto do teste. SQL com valores por parâmetro (`$1`, `$2`); a única interpolação é o nome do schema gerado pelo próprio teste.

**3. Cópia mais delete: conforme.** As trocas (`coleta-nomes-env.test.ts:33` e `:92`, `projetor-businessmap.pg.test.ts:369`) são equivalentes à desestruturação anterior: cópia rasa e remoção de chaves em objeto local do teste. O teste de nomes de ambiente continua provando quais variáveis faltam e que o valor sentinela não aparece.

## Riscos aceitos e ferramentas
Riscos aceitos: nenhum. A suíte inteira fica com o CI.

Ferramentas: `gitleaks`, `semgrep` e `osv-scanner` não estão no PATH desta estação e não foram rodados (lacuna registrada). Sem dependência nova no diff.
