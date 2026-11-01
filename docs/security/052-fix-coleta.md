---
tipo: revisao-seguranca
contrato: 1
pedido: 052-integracao-businessmap
branch: feature/052-f6-painel
commit: c71b2d96d89594b5652286c4e0de59dd80a71063
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-01
---
# Review de segurança: 052-fix-coleta

Diff revisado originalmente: `origin/develop..f763d6a` (E2.83): `coleta.ts`, `http.ts`, o servidor falso, os testes e `businessmap-api-configuracao.md`, mesclado na develop em squash (848aca3, PR 186). Revisão estática; nada foi executado contra o BusinessMap e o `.env` não foi lido.

## Renovação por delta (E2.98, 2026-11-01)
Na `feature/052-f6-painel`, depois do merge da develop (c71b2d9). O `f763d6a` não é ancestral desta branch (squash), então o delta foi medido contra o squash 848aca3 nos arquivos que este parecer cobre: `coleta.ts`, `http.ts`, `allow-list.ts`, `businessmap-coleta-duble.ts`, `coleta-businessmap.test.ts` e `businessmap-api-configuracao.md` estão idênticos ao 848aca3; nenhuma linha da correção se perdeu na resolução dos conflitos. Fora deles, só mudaram:
- `.env.example:24`: linha comentada `DSPD_SCHEMA_PREFIXO_SEED`, sem valor, com o aviso de usar prefixo diferente do da base real (afe7f56, A2 da segurança da F6). Não é credencial nem URL; não toca a coleta.
- `config.ts:28`: a validação por regex da mesma variável (F6, já revisada em `docs/security/052-f6-painel.md`).

Veredito mantido: aprovado em c71b2d9. O A1 segue recomendado, sem mudança.

## Gatilhos
Integração externa e credencial (cliente HTTP do BusinessMap, allow-list de consulta) e dado de pessoa (`co_owner_ids`), R-SEGURANCA.

## Achados
- A1 (recomendado) server/src/plataforma/http.ts:45 · `EXPAND_CARDS` aceita `block_times` e `co_owner_ids` em qualquer caminho de `/cards`; a coleta usa só quatro valores. Sem risco hoje; vale um teste que fixe o conjunto da coleta. Dono: node-backend.

## Detalhe dos achados
**Allow-list de `expand` (`http.ts:45`).** O regex ganhou só `co_owner_ids`, com repetição de até cinco valores, e continua âncorado (`^...$`) e sem curinga. Os valores de pessoa e texto livre seguem fora: `watcher_ids`, `reporter`, `description`, `comments` e `logged_times` não casam, e o teste novo (`coleta-businessmap.test.ts`) prova a recusa de `watcher_ids` anexado a `EXPAND_COLETA`. `fields` não mudou de mecanismo (lista fechada), e `co_owner_ids` saiu dele. O cliente continua só GET, com caminho e parâmetro em lista fechada. Ids de co-responsável são ids numéricos, não nome nem e-mail; o `expand` não amplia a classe de dado pedido, que já era pedida em `fields` (ADR 0020, 4b).

**Fluxo de `co_owner_ids` só em memória.** Em `coleta.ts:200`, `extrairResponsaveis(card)` lê `owner_user_id` e `co_owner_ids` do card bruto (`allow-list.ts:177`) e entrega ao mapa em memória e ao conjunto `vistos`; o `card` vai então a `gravarStgCard`, que usa `registroCard` com cópia só dos escalares de `CAMPOS_CARD`, sem esses campos. O `expand=co_owner_ids` muda só a presença da chave no objeto lido, não o destino. O fluxo até `dim_card.responsaveis` e o `houveTroca` do O26 (ADR 0020, 4b e 4c) fica como antes: projetor e `gravarResponsaveis` inalterados, coluna fora do GRANT do `dspd_api`.

**Staging sem pessoa.** O novo teste de coleta confere que nenhum payload do staging contém `owner_user_id` nem `co_owner_ids` com dados de co-responsável presentes na resposta; os testes `allow-list.test.ts`, `allow-list.qa.pg.test.ts` e `responsaveis.pg.test.ts` já cobrem o mesmo contra o banco. O `expand=transitions` segue reduzido por `CAMPOS_TRANSICAO`, sem alteração.

**Filtro de data.** `filtroDeData` (`coleta.ts:257`) só acrescenta `T00:00:00Z` ao dia calculado pelo código; o regex `DATA` de `http.ts` já aceitava a forma e continua recusando texto livre. O recorte (Q-2b, Q-2c) não muda.

**Limite de requisições.** O padrão da coleta é 25 por minuto (`config.ts:63`, teto 25), abaixo dos 30 da API; sem mudança.

**Servidor falso.** Recusa as duas formas antigas com 400 e valida `fields`/`expand` contra os enums da API; não tem chave nem rede, e a regressão aparece no teste.

**Documento.** `businessmap-api-configuracao.md` só registra a forma aceita; sem segredo nem dado de pessoa.

## Riscos aceitos e ferramentas
Nenhum novo. Seguem em vigor os aceites do pedido 052 (chave do dono com poder de escrita, coleta só na máquina do dono, nomes só em `COLUNAS_PESSOA`). Lacuna: `gitleaks`, `osv-scanner` e Semgrep não estão no PATH e não foram rodados (o delta não toca dependências nem workflow; as varreduras ficam no CI).
