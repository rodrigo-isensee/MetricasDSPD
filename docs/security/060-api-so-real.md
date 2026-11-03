---
tipo: revisao-seguranca
contrato: 1
pedido: 060-triagem-dependabot
branch: feature/060-api-so-real
commit: 0183e430d6b3df391a60320abc652022d0f17aab
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-03
---
# Review de segurança: 060-api-so-real (P2, P3 e a parte de servidor do P5 do plano 060-sem-mock)

Renovação por delta sobre `110e467..0183e43` (`forge-check delta` sobre o parecer anterior): `affccc7` (guarda do modo mock) e o merge da develop `5ac7ace` (guardas do seed, PR 205, e coleta diária do 061, PR 204). Li inteiros `server/src/plataforma/db/guarda-mock.ts`, `server/tests/guarda-mock.test.ts`, o diff de `entradas/api.ts` e `config.ts`, `guarda-seed.ts` (contadores) e `grants.ts` (leitura do `dspd_api` em `ctl_`); do merge, os diffs de `server/Dockerfile`, `.dockerignore` e `docker-compose.yml` e as linhas adicionadas em busca de segredo. O que ficou fora do delta segue como no parecer de `110e467`. Revisão estática; nada rodou no banco e nenhum arquivo `.env*` foi lido.

## Gatilhos
Configuração de ambiente (partida da API no modo mock), banco (leitura de `ctl_coleta` na partida), Docker (imagem e compose trazidos da develop), R-SEGURANCA.

## Resumo
1. **A1 anterior fechado.** `entradas/api.ts:22-24`: com o modo mock, antes de `buildApp` e de abrir a porta, `exigirMockSemColetaReal` conta `contarColetasReais` em `S.bm` e `S.ac` e recusa a partida se houver coleta real, fechando os pools. Falha fechada: esquema sem `ctl_coleta` faz a consulta lançar e a API não sobe. O identificador do esquema passa pela validação `ident` de `guarda-seed.ts`. Sem permissão nova: o `dspd_api` já lê `ctl_` (`grants.ts:108`) e `ctl_coleta` não tem coluna de pessoa.
2. **Mensagem.** A recusa traz só esquema, tabela e contagem (`guarda-mock.ts:17`); a dica de `config.ts:139` não cita mais a variável do modo mock. Os dois casos têm teste que confere a ausência do nome (`guarda-mock.test.ts:21` e `:34`).
3. **Corrida mock × coleta.** Uma coleta real posterior sobre a base de homologação é recusada pela guarda da coleta (esquema com seed, já na develop pelo PR 205); a guarda da partida cobre o sentido inverso.
4. **Merge da develop sem mudança na leitura da API.** Nenhum arquivo de `app.ts`, `metricas/`, `contratos/` ou `grants.ts` muda no delta; os 11 arquivos das guardas chegam idênticos aos de `110e467`. O serviço `api` do `docker-compose.yml` não muda; o serviço novo `coleta` (perfil próprio, sem porta) é o único que recebe a credencial das fontes, pelo arquivo de ambiente do host, e já tem parecer próprio (`docs/security/061-coleta-diaria.md`).
5. **Imagem.** `server/Dockerfile:18` e `.dockerignore` passam a copiar `docs/architecture/fontes` (listas, dicionários e a consulta SQL do Acelerato); conferido por leitura: nenhum segredo. O `.dockerignore` segue deixando o resto de `docs` e `.claude` fora.
6. **Segredos.** As linhas adicionadas no delta não trazem credencial; a única menção é texto de runbook sobre rotação, sem valor. O valor `postgres://u:s@h...` do teste é fictício.

Lacuna: `gitleaks`, `osv-scanner`, `semgrep`, `zizmor`, `actionlint` e `trivy` não estão no PATH desta estação; segredos conferidos por leitura das linhas adicionadas. As varreduras seguem no CI.

## Achados
- A2 (recomendado) server/src/modulos/businessmap/coleta.ts:257 · A trava `dspd:seed` cobre só a transação curta da guarda (idem `acelerato/coletor.ts:175`): um seed logo depois grava antes da 1ª linha da coleta. Opcional: abrir o `ctl_coleta` na transação da guarda. Dono: node-backend.

## Plano em cartões
- A1 (anterior): fechado em `affccc7`; o QA cobre o caso de abuso "variável de homologação no ambiente da base real" na E2.16.
- Recomendado A2: cartão de recomendados do node-backend, sem prazo (não bloqueia; fora do delta, inalterado).

## Riscos aceitos
Nenhum.
