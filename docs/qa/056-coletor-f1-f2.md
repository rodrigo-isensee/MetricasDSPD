---
tipo: qa
contrato: 1
pedido: 056-acelerato-mysql
branch: feature/056-coletor-acelerato
commit: 9b39924a1af89504320ad7702a2f1f967f70b70a
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-10-30
---

# Parecer de QA - coletor do Acelerato, F1 e F2 (E4.10, K-190)

Plano: `docs/qa/056-coletor-plano-de-testes.md` (CA-1 a CA-10 da §7 das ameaças). Review: `docs/reviews/056-coletor-f1-f2.md` (aprovado em 414533f). Segurança: `docs/security/056-coletor-f1-f2.md` (c86e6b3, sem achado novo). Sem interface: sem E2E de navegador nem acessibilidade. Nada foi conectado no MySQL real; o `.env` não foi lido.

Veredito: aprovado. Suíte completa verde, testes `.pg` verdes contra o PostgreSQL local, conferência do código contra CA-1 a CA-10 sem divergência. A2 do review (frontmatter do plano) corrigido neste commit.

## Saída real dos comandos (ponta 414533f, `nice -n 19`, um de cada vez)

`pnpm run pronto` (rc 0; lint, typecheck, unitários e `docs:check`):
- server: Test Files 39 passed, 17 skipped (56); Tests 817 passed, 94 skipped (911). Os 94 pulados são os `.pg`, que o `pronto` não roda por desenho (rodam no `test:pg`); nenhum `skip` foi escrito para isso.
- packages/metricas: 37 arquivos, 1092 testes passando. packages/mock: 14 arquivos, 258. packages/contratos: 7, 161. web: 80 arquivos, 1228 testes passando.
- tools/docs-contratos: 14 arquivos, 102 testes; `docs:check: ok (807 páginas Markdown, 69 métricas, 2 eventos)`.

`pnpm run test:pg` (rc 0, PostgreSQL local):
- Test Files 17 passed (17); Tests 94 passed (94).

## Critério -> teste -> resultado

| Critério (ameaças §7) | Testes (arquivo) | Resultado | Fronteira protegida |
|---|---|---|---|
| CA-1 allow-list sem coluna de pessoa | `acelerato-allow-list.test.ts`, `acelerato-estatico.test.ts`, `acelerato.pg.test.ts` (primeira carga, nenhuma linha com marcador) | passa; `sql.ts` lista as colunas, sem `*`; `agente_key` só como `IS NOT NULL AS com_agente`; json só por caminho de `JSON_TABLE` ou nome exato | coluna fora da lista, pessoa em json |
| CA-1b domínio fechado | `acelerato-allow-list.test.ts`, `acelerato-normalizador.test.ts` | passa; fora da lista vira nulo contado | valor fora do domínio |
| CA-2 credencial fora de log e erro | `acelerato-config-tls.test.ts`, `acelerato-coletor.test.ts` | passa | segredo em erro, config vazia |
| CA-3 TLS fixado | `acelerato-config-tls.test.ts` com servidor TCP de teste (`acelerato-tls-helper.ts`); `tls.ts`: `rejectUnauthorized: true`, impressão SHA-256 conferida no aperto de mão | passa | sem TLS, impressão trocada |
| CA-4 caractere inválido | `acelerato-allow-list.test.ts`, `acelerato-normalizador.test.ts` | passa | `\u0000`, json malformado |
| CA-5 só SELECT, consulta constante | `acelerato-estatico.test.ts`; `cliente-mysql.ts`: `multipleStatements: false`, `permitLocalInfile: false`, `execute` com placeholder, `SET SESSION TRANSACTION READ ONLY` e `START TRANSACTION READ ONLY` | passa | statement empilhado, injeção |
| CA-6 LOCAL INFILE | `acelerato-estatico.test.ts` e `acelerato-config-tls.test.ts` (opção efetiva `permitLocalInfile: false`; sem servidor TCP que peça arquivo) | passa | pedido de arquivo local |
| CA-7 histórico e incremental | `acelerato.pg.test.ts` (hash igual ignora, SCD2, releitura, ausente, fora do recorte), `acelerato-coletor.test.ts`; `coletor.ts:159` recarga suspeita com ausentes x 20 > conhecidos | passa | página cheia, limiar de 5%, marca perdida |
| CA-8 mudança de origem | `acelerato-coletor.test.ts`, `acelerato.pg.test.ts` (parâmetros no controle) | passa | host, banco, SQL diferentes |
| CA-9 fontes separadas | `acelerato-estatico.test.ts` | passa | BusinessMap x Acelerato |
| CA-10 GRANT por coluna | `acelerato.pg.test.ts` (papel do coletor só INSERT; UPDATE e DELETE negados; dono barrado pelo gatilho; API não lê `stg_*`) | passa | histórico append-only, `dspd_api` |

Itens que o brief pediu conferir:
- Staging append-only: GRANT sem UPDATE e DELETE (`0016`, comentário e `.pg`), gatilho barra o dono; o `DELETE` do projetor (`projetor.ts:87,93`) atinge só `dim_chamado` e `fato_etapa_chamado` (derivadas, reconstruíveis), nunca `stg_*`.
- Reconciliação: `acelerato-reconciliacao.test.ts` passa; a consulta de conferência não filtra prioridade.
- Chamado sem prioridade contando em S2 e S3: `metricas-acelerato-f2.test.ts:92` passa ("o chamado sem prioridade fica na base: conta no S2 e no S3"); o A1 do review (filtro `prioridade IS NOT NULL`) está resolvido (nenhuma ocorrência no `server/src`).
- Recarga suspeita: limiar "estritamente maior que 5%" no código, teste do coletor passa.
- Vermelho antes do verde: os testes do coletor são novos e o módulo `server/src/modulos/acelerato/` não existe na base (11141d7), então falham por ausência do módulo; não rodei `forge-testes --vermelho` (ferramenta do Forge, fora do escopo deste brief); mutação (stryker) também não rodada: ver A1.

## Revalidação por delta (E4.21, K-190)

Frontmatter `commit:` renovado de 414533f para 9b39924 (ponta de leitura 9d803e5, que só somou o parecer de segurança). No que este parecer cobre, mudou um arquivo: `docs/architecture/fontes/acelerato-listas.md`, uma linha (E4.16, e6fd5fd), a regra de valor fora das listas. Texto de documento, sem código: não rodei a suíte (o código testado em 414533f não mudou neste intervalo, conforme o brief).

Leitura do delta contra a tabela acima: status, prioridade e etapa fora da lista viram nulo com contagem em `ctl_coleta_contagem`, que é o que a linha CA-1b já registra ("fora da lista vira nulo contado"); chamado fora do recorte (tipo, organização, equipe) falha fechado com `fora-do-recorte`, que é o comportamento do CA-7 e do filtro de origem. O documento passou a dizer o que o código faz; nenhum critério mudou. Veredito mantido: aprovado, sem achado novo; A1 segue como recomendação.

## Achados

- A1 (recomendado) docs/qa/056-coletor-plano-de-testes.md:1 · Vermelho antes do verde por `forge-testes --vermelho` e mutação nos arquivos do diff não rodados neste parecer (escopo do brief: pronto, test:pg e conferência); rodar na revalidação ou na F3 se o dono quiser a prova de mutação.
