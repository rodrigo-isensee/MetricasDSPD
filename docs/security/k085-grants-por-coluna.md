---
tipo: revisao-seguranca
contrato: 1
pedido: 011-metricas-tambem-disponiveis
branch: fix/grants-por-coluna
commit: a4643d85975aa188b00526ac7fa3b6754ab63834
parecer: aprovado
revisor: forge:security-engineer
data: 2026-10-15
---
# Review de segurança: K-085, GRANT por coluna do `dspd_api` (M-4 e B-3 da ADR 0020)

Propósito: fechar o parecer `adr-0020-protecao-de-pessoa.md` nos itens M-4 e B-3 no código. Público: tech-lead, node-backend, qa-engineer, software-architect.

**Veredito: aprovado.** O mecanismo fecha M-4 e B-3 para os nomes combinados. Há três ressalvas de severidade baixa (B-K1 a B-K3), nenhuma bloqueante para o K-085, mas a B-K1 deve virar cartão antes da migração que cria as tabelas (fase 3 do pedido 011).

Revisão estática do diff `origin/develop...HEAD` (3 arquivos: `server/src/plataforma/db/grants.ts`, `server/tests/papeis.pg.test.ts`, `server/tests/plataforma.test.ts`). Nada foi executado. Lacuna: não rodei a suíte; a evidência de que os testes passam é a do autor e da CI.

## Gatilhos
Banco (GRANT por papel) e dado pessoal (reidentificação de vazão individual e identificação de contas de pessoa).

## O que o mecanismo faz
- M-4: `COLUNAS_FORA_DA_API` (`grants.ts:14`) tira `dspd_bm.agg_conhecimento_sistema.entregas` do `GRANT SELECT (colunas)` da API (`grants.ts:48-51`); a tabela entra em `paraApi` pelo nome (`grants.ts:68`). A API lê `tem_entrega` e `faixa_concentracao`; `entregas` e `SELECT *` dão 42501. Como `REVOKE ALL ON ALL TABLES` roda antes (`grants.ts:40`), reaplicar é idempotente e não sobra privilégio de coluna antigo.
- B-3: `TABELAS_FORA_DA_API` (`grants.ts:17`) filtra `dspd_bm.ref_conta_automacao` de `paraApi` (`grants.ts:69`). O `dspd_coletor` mantém `SELECT` por `COM(tabs,'ref_')` (`grants.ts:66`), que é o consumidor previsto (ADR 0020, 4b).
- Testes: o unitário confere o SQL gerado e que `entregas|ref_conta_automacao` não aparece em nenhum GRANT da API (`plataforma.test.ts`); o de integração aplica o `aplicarGrants` real em schemas isolados e conecta como `dspd_api` e `dspd_coletor` (`papeis.pg.test.ts`, bloco novo). Isso prova o efeito no banco, não só o texto do SQL. Bom.

M-4 e B-3: **fechados** para `dspd_bm.agg_conhecimento_sistema.entregas` e `dspd_bm.ref_conta_automacao`.

## Achados

### Baixa

**B-K1. A exclusão por nome falha em silêncio (aberto por padrão) se a tabela ou a coluna nascer com outro nome ou em outro schema**
- Evidência: `grants.ts:68-69`. `paraApi` inclui por prefixo `ref_`, `vw_` e `ctl_` (`COM(tabs,'vw_','ref_','ctl_')`) e a exclusão compara o id literal. Para `ref_`, o padrão é **conceder**; só o nome exato escapa. A lista de colunas fora da API também compara o id literal (`grants.ts:48-51`).
- Caminho de ataque (interno, LGPD): a migração da fase 3 cria `ref_contas_automacao`, `ref_conta_automacao_v2`, ou põe a tabela em `dspd_core` (o loop de `refCore` em `grants.ts:80-81` dá `SELECT` de **toda** `ref_` do core à API, sem passar por `TABELAS_FORA_DA_API`), ou renomeia a coluna para `total_entregas`/`qtd_entregas`. O GRANT passa a incluir o recurso, nenhum teste falha (o de integração cria a tabela com o nome combinado, não a da migração) e a API volta a ler ids de contas e a contagem de entregas por sistema. É o caminho do M-4 (vazão de uma pessoa na faixa 1) e do B-3. Quem ganha: quem tem acesso à API ou a uma rota futura; custo do erro: silencioso.
- Contraste: o inverso, tabela `agg_` com outro nome, fica **sem GRANT** (falha alto, a API quebra e alguém percebe). A assimetria é o risco.
- Correção mínima (proposta, dono: node-backend, revisão tech-lead; esforço P). Um teste que falha se alguma tabela nova não estiver classificada, no `papeis.pg.test.ts` ou em teste próprio rodando sobre as migrações reais (o schema de teste migrado de `ctx.js`):
  1. Lista fechada no teste, escrita à mão e independente do código: `{ tabela: 'api' | 'fora' }` para **toda** tabela `agg_*` e `ref_*` dos três schemas (`dspd_bm`, `dspd_ac`, `dspd_core`). Consultar `information_schema.tables` e falhar com a lista das não classificadas ("classifique em `CLASSIFICACAO_API`"). Tabela nova obriga a decisão explícita no code review.
  2. Para o que está `fora`, consultar `information_schema.column_privileges` (ou `has_table_privilege`/`has_column_privilege`) como `dspd_api` e exigir zero privilégio, **no banco migrado**, não num fixture.
  3. Para toda coluna de `agg_*` visível à API, falhar se o nome casar `/entreg|autor|respons|owner|usuario|user/i` e não estiver numa lista de exceções (`tem_entrega`). Pega a coluna renomeada.
  4. Opcional, mais forte: no código, inverter o padrão de `ref_` para a API (lista de `ref_` permitidas em vez de proibidas), como já é feito com `PROJECAO`. Mantém o fail-closed. Vale discutir com o architect; o teste 1 já entrega a maior parte do ganho.

**B-K2. A exclusão é por schema lógico `dspd_bm` e não cobre `ref_conta_automacao` se a tabela for criada em `dspd_ac` ou `dspd_core`**
- Evidência: `grants.ts:69` (só `dspd_bm.`), `grants.ts:80-81` (`ref_` do core vai à API, sem filtro).
- Caminho: o mesmo da B-K1. A ADR 0020 e o plano O22 colocam a tabela no schema do BusinessMap, então hoje está coerente; o risco é só de desvio futuro. Tratado pela guarda 1 e 2 da B-K1 (varre os três schemas). Esforço P. Dono: node-backend.

**B-K3. Comentário e nome de lista descrevem "quando existir"**
- Evidência: `grants.ts:11-13`. Como as tabelas ainda não existem na migração, o código de exclusão é código morto no banco real até a fase 3; o teste de integração é o único exercício. Não é vulnerabilidade. Pedido: o cartão da migração da fase 3 deve citar o K-085 e rodar o teste da B-K1 no mesmo PR, para que a primeira criação da tabela já passe pela guarda. Dono: tech-lead (checklist do cartão).

## Suposição do autor
"As tabelas não existem; a exclusão vale pelo nome e pelo schema `dspd_bm` quando forem criadas." Confirmada pela leitura (nenhum `agg_conhecimento_sistema` nem `ref_conta_automacao` em `server/migrations/` na HEAD revisada; ver também o plano O22). É válida **só** com a guarda da B-K1, pois nome e schema são exatamente o ponto frágil.

## O que passou na revisão (sem achado)
- `COLUNAS_FORA_DA_API` separada de `COLUNAS_PESSOA`: preserva o catálogo LGPD (`lgpd.ts`) sem poluir com coluna que não é de pessoa. Adequado.
- O `dspd_ref` ainda recebe `INSERT` em `ref_conta_automacao` (para o cadastro pela WS1) e `UPDATE (vigente_ate)`; não lê pela API. Coerente com B-3 ("só contas de serviço, com justificativa").
- Nenhum privilégio novo para `dspd_api` além de `agg_conhecimento_sistema` por coluna. Sem `stg_`, `evt_`, `_versao`.
- Sem segredo, sem dependência nova.

## Cartões
| Cartão | Achado | Dono | Quando |
|---|---|---|---|
| Teste-guarda: toda `agg_`/`ref_` classificada, privilégio da API verificado no banco migrado, regex de nome de coluna | B-K1, B-K2 | node-backend (revisão tech-lead, QA confere) | antes ou junto da migração da fase 3 |
| Avaliar `ref_` da API por lista permitida (fail-closed) | B-K1 (item 4) | software-architect | opcional, com a fase 3 |
| Cartão da migração cita o K-085 e roda a guarda | B-K3 | tech-lead | fase 3 |

## Riscos aceitos
Nenhum. As ressalvas B-K1 a B-K3 são recomendações com prazo; não dependem de aceite do usuário.
