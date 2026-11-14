---
tipo: qa
contrato: 1
pedido: 097-resumo-filtro-time
branch: test/k283-provas-pessoa-helper
commit: affd76f5a660a1c538c2f4f4b8f74030a0e0fb9f
parecer: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-14
---

# QA: pedido 097, K-283 (demais provas de pessoa passam ao helper de COLUNAS_PESSOA)

Links: pedido `docs/pedidos/097-resumo-filtro-time.md` (E3.3, E4.10), A1 do review do K-282 (`docs/qa/097-k282-grant-colunas-pessoa.md`), `server/tests/pg/colunas-pessoa.ts`, `server/src/plataforma/db/lgpd.ts`.

## Veredito
**Aprovado** sobre o HEAD df78e1a6 (base develop 02272442). Classe T, só testes (`server/tests/`). Conferência por leitura do diff contra `COLUNAS_PESSOA` e o helper. Os `.pg` não rodaram aqui (regra do dono: prova de banco é o job `banco` do CI do PR). Local, `tsc --noEmit` em `server/` saiu limpo. Branch e árvore da worktree conferidas (branch certa, status vazio).

## Critério, teste, resultado
Seis provas em quatro arquivos. O helper exige que cada coluna de `COLUNAS_PESSOA` da tabela exista (via `information_schema`) e que o SELECT do papel falhe com 42501 exato.

| Prova trocada | Antes | Agora (colunas em `COLUNAS_PESSOA`) | Fronteira protegida | Resultado |
|---|---|---|---|---|
| `apontamento-rota`, `dspd_api` em `fato_apontamento` | `pessoa_ref` 42501 | `provarSemPessoa(api, ...fato_apontamento)`: `pessoa_ref` (única) | pessoa_ref fora do GRANT do `dspd_api` | igual, mais a checagem de existência |
| `apontamento-rota`, `dspd_api` em `apt_pessoa_time` | `pessoa_ref` 42501 | `apt_pessoa_time`: `pessoa_ref` (única) | view da aba fora do `dspd_api` | igual, mais existência |
| `apontamento`, `dspd_api` em `dim_responsavel` | `pessoa_ref` 42501 | `dim_responsavel`: `responsavel_id`, `responsavel_nome`, `pessoa_ref` | colunas de pessoa fora do `dspd_api` | mais forte (3 colunas) |
| `apontamento`, `dspd_api` em `fato_apontamento` | `pessoa_ref` 42501 | idem primeira linha | idem | igual, mais existência |
| `papeis`, `dspd_api` em `dim_card` | `responsaveis` rejeitado com 42501 | `dim_card`: `responsaveis` (única) | responsaveis fora do `dspd_api`; `SELECT *` e `fato_transicao.usuario` (42703) seguem na linha própria | igual, mais existência |
| `projetor-businessmap-qa`, `dspd_api` em `dim_responsavel` | `responsavel_nome` 42501 | `dim_responsavel`: as 3 colunas | idem | mais forte (3 colunas) |

Mesma tabela, mesmo papel (`api`), mesmo 42501 em todas; nenhuma ficou mais frouxa. Conferido também: `dono`, `api`, `S.bm`/`E.bm` existem no escopo de cada teste (o do projetor usa `E.bm`, o schema com prefixo daquele arquivo), os imports de `provarSemPessoa` foram adicionados onde faltavam (`apontamento-rota` já importava), e `falha`/`nega` continuam em uso nas linhas vizinhas (sem import morto).

## Observação (não bloqueia)
Uma coluna nova em `COLUNAS_PESSOA` para essas tabelas passa a ser provada sem editar o teste, e coluna renomeada derruba a prova com mensagem clara (era 42703 mudo). Risco: a prova depende do esquema migrado no CI; se o job `banco` falhar por isso, a causa é o esquema, não o teste.

## Revalidação (14/11, delta sobre a junção da develop, E4.58)
`forge-check parecer delta`: no domínio do QA entra um só arquivo, `server/tests/apontamento.pg.test.ts` (2 linhas: o `down` passa de `quantas: 4` para `5`). A causa é a migração `0036_ac_alvo_prioridade_unidade` vinda da develop; os cinco downs (0036, 0035, 0034, 0033, 0032) levam ao estado da 0031, como o comentário diz. Nenhum `.pg` de provas de pessoa mudou; o helper `provarSemPessoa` está igual ao aprovado.

**Job `banco`:** NÃO confirmado. No PR 391 (head 2ec4af26) o run 43550919563 estava na fila (`banco`, `testes`, `build`, `e2e-parte` pendentes; `filtro`, `openapi`, `seguranca`, `imagem` passaram). Sem o `banco` verde com os quatro `.pg` tocados, a prova de banco fica pendente: o tech-lead confere o check-run antes de mesclar.

**Mutante à mão** (lista de colunas vazia em `provarSemPessoa`: `const colunas: string[] = [];`). Os testes do repositório que usam o helper são todos `.pg` (pulados sem banco) e não há teste do helper em si. Com um teste descartável (pools falsos, apagado depois), o mutante cai (`promise resolved "undefined" instead of rejecting`), mas esse teste não está na branch. Pela leitura, o mutante passaria nos `.pg` do CI: o loop vazio não afirma nada, e a guarda `colunas.length === 0` fica em `colunasDePessoa`, não em `provarSemPessoa`. Restaurado por `git show HEAD:server/tests/pg/colunas-pessoa.ts`; árvore limpa.

## Achados
- A1 (recomendado) server/tests/pg/colunas-pessoa.ts:22 · `provarSemPessoa` não afirma que percorreu ao menos uma coluna nem tem teste próprio sem banco; lista vazia ali passaria verde. Guarda de tamanho após o filtro ou teste unitário com pool falso.
