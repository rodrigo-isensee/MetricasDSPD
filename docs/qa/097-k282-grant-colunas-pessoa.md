---
tipo: qa
contrato: 1
pedido: 097-resumo-filtro-time
branch: fix/k282-grant-colunas-pessoa
commit: 72b9892823876ffac0d2f1f4a98d40a259ccb81d
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-11
---

# QA: pedido 097, K-282 (provas de GRANT derivadas de COLUNAS_PESSOA)

Links: pedido `docs/pedidos/097-resumo-filtro-time.md` (E3.3, E4.6), `server/src/plataforma/db/lgpd.ts`, `server/src/plataforma/db/grants.ts`.

## Veredito
**Aprovado** sobre o HEAD 72b98928 (base develop aa2c3c01). Classe T, só testes (`server/tests/`). Conferência por leitura do diff e do código: nada foi rodado contra banco (o `.pg` roda no CI, job `banco`). Local, `tsc --noEmit` em `server/` e eslint nos três arquivos tocados saem limpos.

## Critério, teste, resultado
| Obrigação (K-282) | Teste / leitura | Fronteira protegida | Resultado |
|---|---|---|---|
| Lista de colunas de pessoa vem de `COLUNAS_PESSOA`, não de lista à mão | `colunasDePessoa` filtra `COLUNAS_PESSOA` por `schema.tabela.`; usada em `apontamento-rota.pg.test.ts` (dim_card, dim_card_versao) e `projetor-businessmap.pg.test.ts` (dim_card, dim_card_versao, dim_responsavel) | coluna nova de pessoa em `lgpd.ts` entra na prova sem editar o teste | conforme |
| Helper falha se a lista cita coluna inexistente | `provarSemPessoa` consulta `information_schema.columns` pelo `dono` e lança `Error` se a coluna não está lá; no caminho de `negados` (apontamento, linha 156) a coluna inexistente dá 42703, diferente de 42501, e a asserção cai | coluna renomeada ou removida do esquema (42703 não passa por 42501) | conforme (leitura) |
| Helper exige 42501 exato | `codigo !== '42501'` lança, inclusive quando a leitura é permitida (`codigo` indefinido); `negados` usa `toBe('42501')` | GRANT que passou a permitir a coluna; erro de outra classe | conforme (leitura) |
| Chave sem entrada em `COLUNAS_PESSOA` não passa em silêncio | `colunasDePessoa` lança com lista vazia | tabela renomeada em `lgpd.ts` (suíte vazia) | conforme (leitura) |
| Nenhuma prova anterior afrouxada | comparação linha a linha do diff abaixo | n/a | conforme |
| `dim_responsavel` ganha as colunas de pessoa que faltavam | projetor: antes só `responsavel_id`; agora `responsavel_id`, `responsavel_nome` e `pessoa_ref` (as três de `COLUNAS_PESSOA`) para o papel `api` | colunas de pessoa fora do GRANT do `dspd_api` | conforme |

### Afrouxamento (conferido)
- `apontamento-rota`, `dim_card`: antes `responsaveis`; agora todas as de `COLUNAS_PESSOA` (hoje só `responsaveis`): igual ou mais forte. `card_pai` continua provado com 42501 exato, em linha própria.
- `apontamento-rota`, `dim_card_versao`: antes `.code` 42501; agora `provarSemPessoa` (existência + 42501). Mais forte.
- `apontamento-rota`, `dim_responsavel` (aba): inalterado e correto, porque o papel da aba lê `pessoa_ref` e `responsavel_nome` por GRANT (`grants.ts:18`), então só `responsavel_id` e `*` são negados.
- `projetor`: os seis SELECT antes eram 42501 via `toMatchObject`; os três `SELECT *` seguem. Os três de coluna nomeada foram trocados por `provarSemPessoa` sobre três tabelas. Nenhuma asserção removida sem substituta.

## Observação (não bloqueia)
Na prova de `negados` do apontamento a lista não passa pela checagem de existência explícita do helper; ela é coberta pelo 42501 exato (42703 reprova). Efeito equivalente, mensagem menos clara. Nenhum bug.

## Vermelho antes do verde e mutação
Não se aplica a `forge-testes --vermelho` (pedido de teste de GRANT em `.pg`, que não roda local). A prova de falha é por leitura das três ramificações do helper (lista vazia, coluna inexistente, código diferente de 42501), cada uma com `throw`. O check-run do job `banco` do mesmo sha no CI é a evidência de verde; o parecer não o cita por ainda não ter sido consultado nesta rodada.

## Achados
