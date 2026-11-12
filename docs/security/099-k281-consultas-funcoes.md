---
tipo: revisao-seguranca
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: fix/k281-consultas-funcoes
commit: 805130049313de3ec987d07b0cafbfa44c6b797c
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-12
---
# Review de segurança: K-281, recusa de query_to_xml, query_to_xmlschema, query_to_xml_and_xmlschema, ts_stat e ts_rewrite no comando de consultas de leitura (E3.6)

Propósito: fechar o A6 do parecer `docs/security/099-k277-consultas-escape.md` (develop) no head `80513004`. O diff desde a base `9e76d175` toca só `scripts/consultas-leitura-098-099.sh` (uma linha: cinco palavras novas em `PALAVRAS_PROIBIDAS`, `:90`) e o teste dele (sete sondas novas). Nada rodou contra base real e nenhum `.env*` foi aberto. Rodados `bash scripts/consultas-leitura-098-099.test.sh` (todos os casos passaram) e `shellcheck` nos dois arquivos (limpo); as sondas extras abaixo rodaram só sobre a função `validar_sql` extraída do script e texto literal, sem banco.

## Gatilhos
- Controle que analisa entrada: a lista do permitido no `.sql` (`validar_sql`).
- Banco real: o comando roda no PostgreSQL da demo e no MySQL do Acelerato, pelo dono, com o `.env` dele.

## Resultado por ponto do brief

**1. A6 fechado: conforme.** As cinco funções entram na lista de palavras, comparada com `grep -Eiw` (sem caixa, palavra inteira; `_` conta como parte da palavra, então `query_to_xml` não casa dentro de `query_to_xml_and_xmlschema`, e por isso as três estão listadas por extenso). S13 e S14 do parecer anterior viraram casos do teste e são recusadas sem chamar o banco; a recusa vem da palavra nova, não de outra regra (o texto delas não tem `pg_` contíguo nem palavra antiga da lista). Sondas extras, todas recusadas: `QuErY_To_XmL(...)` (caixa mista), `"query_to_xml"(...)` (entre aspas), `query_to_xml/**/(...)` (comentário antes do parêntese), `query_to_xml(concat('select p','g_sleep(5)'),...)` (nome montado por `concat`), `TS_STAT(...)`, `Ts_ReWrite(...)`, `query_to_xml_and_xmlschema` dentro de `WITH`, e `ts_stat` com quebras de linha antes do parêntese. O nome da função não pode ser montado por concatenação sem outra função que execute texto, e o `U&` (escape) e o prefixo `pg_` (forma qualificada `pg_catalog.`) seguem recusados pelo K-277. A sonda `U&"x"` sem `UESCAPE` (A1 do review do K-277) também é recusada.

**2. Nenhuma consulta legítima recusada: conforme.** O caso de corpus do teste exige que os 31 `.sql` versionados passem, e passou; nenhum deles usa as cinco palavras. Identificadores vizinhos passam, como devem: `ts_status` e `query_to_xml_x` (rc 0).

**3. Nenhum desvio novo aberto: conforme.** A mudança só acrescenta palavras ao fim da lista; nenhuma regra foi removida ou afrouxada (primeiro token, barra invertida, um `;` no fim, lista de palavras, `U&`/`UESCAPE`, prefixos `pg_` e `lo_`). O MySQL não tem essas funções e nenhum `.sql` dele as usa.

**4. Informativo, sem achado.** `database_to_xml`, `schema_to_xml` e `table_to_xml` passam (rc 0): não executam texto como SQL, só leem tabelas que o papel já lê por `SELECT`; a saída continua barrada pelo validador de TSV (só número, data e domínio) e o custo fica no teto do `statement_timeout`, na transação `READ ONLY`. `cursor_to_xml` exige cursor aberto, que um `SELECT` único não abre. Sem caminho de ataque além do que o parecer do comando já mediu; não vira achado.

**Lacunas de ferramenta:** `gitleaks`, `semgrep` e `osv-scanner` não foram rodados (fora do que o brief permite). Sem dependência nova.

## Achados

## Plano em cartões
Nenhum bloqueante nem recomendado novo: o K-281 fecha o A6 do K-277 e pode seguir para QA e review. O A2 do parecer do comando (papel `dspd_coletor` com escrita) segue recomendado, com o software-architect, não reavaliado aqui.

## Riscos aceitos
Nenhum.
