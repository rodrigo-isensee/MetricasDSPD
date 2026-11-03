---
tipo: qa
contrato: 1
pedido: 060-triagem-dependabot
branch: docs/060-claude-md-acelerato
commit: 475862bddea4af09070ca2e526dc1897fa51fbea
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-02
---
# QA documental: texto do CLAUDE.md sobre a leitura do Acelerato (060, E4.5, K-199)

Ponta testada: 475862b (51078b1 mais o review). `git pull --ff-only` já atualizado. Escopo: conferir o texto do `CLAUDE.md` contra a ADR 0023; sem código de produção e sem teste automatizado novo (pedido só de documentação).

## Achados
- A1 (recomendado) docs/architecture/adr/0023-acelerato-pela-tabela-mysql.md:3 · O CLAUDE.md passa a citar a ADR 0023, que ainda está como "proposta"; o arquiteto deve marcá-la aceita em PR próprio (mesmo ponto do A1 do review).
- A2 (recomendado) CLAUDE.md:24 · `usuarioKey` é nome da API antiga; a coluna do MySQL tem outro nome. A lista de proibidos segue válida, e a troca de nome cabe a outro pedido (A2 do review).

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Diff de código é só o `CLAUDE.md` | `git diff --stat origin/develop...HEAD`: `CLAUDE.md` (1 linha) e `docs/reviews/060-claude-md-acelerato.md`; nada em `server/`, `web/`, `e2e/` | escopo | passou |
| Troca 1: leitura pela tabela MySQL em transação só de leitura | Texto: "somente pela tabela MySQL do time de ciência de dados, em transação só de leitura (ADR 0023); nada é escrito". ADR 0023 §1: `SET SESSION TRANSACTION READ ONLY`, `START TRANSACTION READ ONLY`, `ROLLBACK`, conta só com `SELECT` e `SHOW VIEW`; tabela `ACELERATO_CHAMADOS` | escrita no Acelerato | passou |
| Troca 2: credenciais como usuário e senha do MySQL, só no `.env` | Texto: "usuário e senha do MySQL do Acelerato ... só em `.env`". ADR 0023 §1: host, porta, banco, usuário e senha do `.env`, nunca URL com senha | credencial no código | passou |
| Troca 3: a tabela como sujeito da frase de dado de pessoa | Texto: "Essa tabela traz dados de pessoa ... e texto livre"; sem sobra de "API pública", "GET" nem "e-mail e token" (`grep` no CLAUDE.md: zero) | texto residual da API | passou |
| Allow-list igual | Frase mantida literal ("lista fechada de campos (allow-list) na fronteira"); ADR 0023 §2.1 e linha 86: zod strict `allow-list.ts`, falha fechada | campo fora da lista | passou |
| Proibidos iguais (nome, e-mail, `usuarioKey`, descrição, título) | Lista do CLAUDE.md idêntica à anterior (diff mostra só as três trocas); ADR 0023 linhas 85 e 116: pessoa e texto livre não saem do MySQL | pessoa e texto livre | passou |
| GRANT por coluna igual | Frase final intacta: papel `dspd_api` não lê colunas de pessoa (GRANT por coluna); ADR 0023: "nenhuma entrada nova em `COLUNAS_PESSOA`" | leitura de pessoa pela API | passou |
| Regra de não misturar fontes e demais linhas do CLAUDE.md | Diff de uma única linha (24); linhas 16 e 14 intocadas | regressão de regra | passou |
| `docs:check` | `pnpm run docs:check` | links e contratos | passou: "docs:check: ok (885 páginas Markdown, 69 métricas, 2 eventos)" |

## Cenários e resultado real
Conferência por leitura do diff (`git diff origin/develop...origin/docs/060-claude-md-acelerato`) lado a lado com a ADR 0023. As três trocas batem; allow-list, proibidos e GRANT permanecem iguais. Sem teste de vermelho nem mutação: não há código nem regra executável no diff. Suíte unitária e E2E não se aplicam (nenhum arquivo de código mudou).

## Bugs
Nenhum.
