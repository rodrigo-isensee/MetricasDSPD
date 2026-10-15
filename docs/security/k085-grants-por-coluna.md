---
tipo: revisao-seguranca
contrato: 1
pedido: 011-metricas-tambem-disponiveis
branch: fix/grants-por-coluna
commit: 21dabc0aedd7bb105a41b1e6b10c3588302a143c
parecer: aprovado
revisor: forge:security-engineer
data: 2026-10-15
---
# Review de segurança: K-085, GRANT por coluna do `dspd_api` (M-4 e B-3 da ADR 0020)

Propósito: fechar o parecer `adr-0020-protecao-de-pessoa.md` nos itens M-4 e B-3 no código. Público: tech-lead, node-backend, qa-engineer, software-architect.

**Veredito: aprovado** (duas leituras: a4643d8 e, depois, 21dabc0; ver "Releitura de 21dabc0"). O mecanismo fecha M-4 e B-3 para os nomes combinados. Na releitura, o commit 21dabc0 fecha também B-K1 (itens 1 a 3) e B-K2, que eram as ressalvas relevantes da primeira leitura. Resta uma recomendação de severidade baixa (B-K3, checklist do cartão da fase 3) e duas observações informativas (R-1, R-2).

Revisão estática do diff `origin/develop...HEAD` (primeira leitura, a4643d8: `server/src/plataforma/db/grants.ts`, `server/tests/papeis.pg.test.ts`, `server/tests/plataforma.test.ts`) e do diff `2e90f3d..21dabc0` (releitura: `grants.ts`, `plataforma.test.ts`, `guarda-api.pg.test.ts` novo). Nada foi executado. Lacuna: não rodei a suíte; a evidência de que os testes passam é a do autor e da CI.

## Gatilhos
Banco (GRANT por papel) e dado pessoal (reidentificação de vazão individual e identificação de contas de pessoa).

## O que o mecanismo faz
- M-4: `COLUNAS_FORA_DA_API` (`grants.ts:14`) tira `dspd_bm.agg_conhecimento_sistema.entregas` do `GRANT SELECT (colunas)` da API (`grants.ts:48-51`); a tabela entra em `paraApi` pelo nome (`grants.ts:68`). A API lê `tem_entrega` e `faixa_concentracao`; `entregas` e `SELECT *` dão 42501. Como `REVOKE ALL ON ALL TABLES` roda antes (`grants.ts:40`), reaplicar é idempotente e não sobra privilégio de coluna antigo.
- B-3: `TABELAS_FORA_DA_API` (`grants.ts:17`) filtra `ref_conta_automacao` de `paraApi` (`grants.ts:69`). O `dspd_coletor` mantém `SELECT` por `COM(tabs,'ref_')` (`grants.ts:66`), que é o consumidor previsto (ADR 0020, 4b).
- Testes: o unitário confere o SQL gerado e que `entregas|ref_conta_automacao` não aparece em nenhum GRANT da API (`plataforma.test.ts`); o de integração aplica o `aplicarGrants` real em schemas isolados e conecta como `dspd_api` e `dspd_coletor` (`papeis.pg.test.ts`, bloco novo). Isso prova o efeito no banco, não só o texto do SQL. Bom.

M-4 e B-3: **fechados** para `dspd_bm.agg_conhecimento_sistema.entregas` e `ref_conta_automacao`.

## Releitura de 21dabc0 (depois do parecer aprovado em 2e90f3d)

Commit `test(grants): guarda da API classifica toda agg_/ref_ e verifica privilégio no banco migrado`. Mexe em `grants.ts` (+5/-2), `plataforma.test.ts` (+8) e cria `server/tests/guarda-api.pg.test.ts` (98 linhas). Nenhuma dependência, nenhum segredo, nenhum privilégio novo.

**Veredito da releitura: aprovado.** O commit só restringe o que a API lê e acrescenta teste. Nada amplia acesso.

| Achado anterior | Situação em 21dabc0 | Evidência |
|---|---|---|
| **B-K2** exclusão só no schema `dspd_bm`; `ref_` do core ia inteira à API | **Fechado.** `TABELAS_FORA_DA_API` lista `ref_conta_automacao` nos três schemas (`dspd_bm`, `dspd_ac`, `dspd_core`). O loop do core deixou de dar `SELECT` à API sobre todas as `ref_`: `refCoreApi` tira as da lista (`nomeLogico('core')`), e `dspd_coletor` e `dspd_automacao` seguem com `refCore` completo. O teste unitário cobre o core e o ac e confere que coletor e automação mantêm o `SELECT`. | `grants.ts:16-17, 78-82`; `plataforma.test.ts:153-160` |
| **B-K1 item 1** classificação à mão de toda `agg_`/`ref_` | **Atendido.** `CLASSIFICACAO_API` é escrita à mão, não importa nada de `grants.ts`, e o teste consulta `information_schema.tables` nos três schemas (com prefixo de teste) e falha listando as não classificadas. Há guarda contra consulta vazia (`> 10`) e contra entrada "na API" que já não existe. | `guarda-api.pg.test.ts:12-38, 49-70` |
| **B-K1 item 2** privilégio zero no que está fora, no banco migrado | **Atendido.** Para toda tabela classificada "fora da API", o teste procura linha em `table_privileges` e `column_privileges` com `grantee = 'dspd_api'` e exige zero. | `guarda-api.pg.test.ts:72-81` |
| **B-K1 item 3** regex de nome de coluna sensível | **Atendido, com escopo menor que o proposto.** O regex é `/entreg\|respons\|autor\|usuario\|email\|nome/i`, aplicado às colunas de `agg_*` com `SELECT` para a API, com exceção explícita `tem_entrega`. Pega `entregas`, `total_entregas`, `qtd_entregas`, `responsavel`, `autor_*`. Não inclui `owner` nem `user` (o parecer propunha `owner\|user`); ver R-1. | `guarda-api.pg.test.ts:40-42, 83-92` |
| **B-K1 item 4** (opcional) `ref_` da API por lista permitida | **Não feito**, e era opcional. O padrão de `ref_` para a API continua sendo conceder por prefixo; o que protege agora é a guarda de classificação, que obriga a decisão no code review. Fica como recomendação ao architect. | `grants.ts:68` |
| **B-K3** cartão da fase 3 cita o K-085 e roda a guarda | **Continua aberto**, é checklist do tech-lead. A guarda já existe, e a migração da fase 3 vai rodá-la no mesmo PR de qualquer forma (a tabela nova sem classificação derruba o teste). | n/a |

Efeito prático: criar `ref_conta_automacao` em qualquer schema, ou uma `ref_`/`agg_` nova com outro nome, agora falha a suíte (com Postgres) em vez de abrir acesso em silêncio. A assimetria apontada na B-K1 (aberto por padrão) foi tratada pelo lado do teste.

### Observações da releitura (informativas, sem exigir correção)
- **R-1. O regex da guarda é mais estreito que o proposto e só olha `agg_*`.** Falta `owner` e `user`, e colunas de `ref_*` e de `vw_*`/`ctl_*` não passam por ele. Hoje não há caminho de ataque: `ref_*` é configuração, e `vw_`/`ctl_` não têm coluna de pessoa conhecida. Sugestão ao node-backend, quando houver ocasião: acrescentar `owner|user` ao regex e, se o architect adotar o item 4 da B-K1, estender a verificação às `ref_`. Dono: node-backend. Esforço P.
- **R-2. As guardas dependem do que a migração já criou.** Hoje `agg_conhecimento_sistema` e `ref_conta_automacao` não existem nas migrações (a classificação "fora da API" e "por coluna" passa por vazio, e o teste "toda entrada na API existe" só cobre as da API). O teste ganha força quando a migração da fase 3 criar as tabelas; até lá o caso `entregas` é exercido só pelo teste de integração de `papeis.pg.test.ts`. Quando as tabelas nascerem, vale conferir que a guarda de nome de coluna as enxerga (ver B-K3). Não bloqueia.
- A entrada `'na API'` obriga a atualizar a lista a cada `ref_` nova (falha alto, como queríamos). O custo é aceitável e é o ponto da guarda.
- Ferramentas: revisão estática. `gitleaks`, `semgrep` e `osv-scanner` não estão no PATH (lacuna); o diff não toca dependências nem configuração.

## Achados (primeira leitura, a4643d8, com a situação atual)

### Baixa

**B-K1. A exclusão por nome falha em silêncio (aberto por padrão) se a tabela ou a coluna nascer com outro nome ou em outro schema** — **mitigado por 21dabc0** (guarda de classificação e de privilégio no banco migrado; o item 4, opcional, não foi feito)
- Evidência original: `grants.ts:68-69`. `paraApi` inclui por prefixo `ref_`, `vw_` e `ctl_` (`COM(tabs,'vw_','ref_','ctl_')`) e a exclusão compara o id literal. Para `ref_`, o padrão é **conceder**; só o nome exato escapa. A lista de colunas fora da API também compara o id literal (`grants.ts:48-51`).
- Caminho de ataque (interno, LGPD): a migração da fase 3 cria `ref_contas_automacao`, `ref_conta_automacao_v2`, ou põe a tabela em `dspd_core`, ou renomeia a coluna para `total_entregas`/`qtd_entregas`. O GRANT passa a incluir o recurso e a API volta a ler ids de contas e a contagem de entregas por sistema (caminho do M-4 e do B-3). Quem ganha: quem tem acesso à API ou a uma rota futura. Custo do erro: silencioso.
- Correção proposta: guarda de teste (itens 1 a 3 acima, atendidos em 21dabc0) e, opcional, `ref_` por lista permitida (item 4).

**B-K2. A exclusão é por schema lógico `dspd_bm`** — **fechado em 21dabc0** (`TABELAS_FORA_DA_API` nos três schemas e filtro no loop do core).

**B-K3. Comentário e nome de lista descrevem "quando existir"**
- Evidência: `grants.ts:11-13`. Como as tabelas ainda não existem na migração, o código de exclusão é código morto no banco real até a fase 3; o teste de integração é o único exercício. Não é vulnerabilidade. Pedido: o cartão da migração da fase 3 deve citar o K-085 e rodar a guarda no mesmo PR, para que a primeira criação da tabela já passe por ela. Dono: tech-lead (checklist do cartão).

## Suposição do autor
"As tabelas não existem; a exclusão vale pelo nome e pelo schema quando forem criadas." Confirmada pela leitura (nenhum `agg_conhecimento_sistema` nem `ref_conta_automacao` em `server/migrations/`; ver também o plano O22). Com 21dabc0, a suposição deixa de ser o único ponto de proteção, porque a guarda de classificação falha se o nome ou o schema forem outros.

## O que passou na revisão (sem achado)
- `COLUNAS_FORA_DA_API` separada de `COLUNAS_PESSOA`: preserva o catálogo LGPD (`lgpd.ts`) sem poluir com coluna que não é de pessoa. Adequado.
- O `dspd_ref` ainda recebe `INSERT` em `ref_conta_automacao` (para o cadastro pela WS1) e `UPDATE (vigente_ate)`; não lê pela API. Coerente com B-3 ("só contas de serviço, com justificativa").
- Nenhum privilégio novo para `dspd_api`; em 21dabc0 só diminui. Sem `stg_`, `evt_`, `_versao`.
- Sem segredo, sem dependência nova.

## Cartões
| Cartão | Achado | Dono | Quando |
|---|---|---|---|
| Avaliar `ref_` da API por lista permitida (fail-closed) | B-K1 (item 4) | software-architect | opcional, com a fase 3 |
| Cartão da migração cita o K-085 e roda a guarda | B-K3 | tech-lead | fase 3 |
| Regex da guarda com `owner\|user` e estendido às `ref_` | R-1 | node-backend | quando houver ocasião |

## Riscos aceitos
Nenhum. As ressalvas restantes são recomendações com prazo; não dependem de aceite do usuário.
