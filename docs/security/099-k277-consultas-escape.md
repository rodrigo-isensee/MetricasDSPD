---
tipo: revisao-seguranca
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: fix/k277-consultas-escape
commit: a73f2c4bfaee44b15b09e0003f7ce7691778a83a
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-11
---
# Review de segurança: K-277, recusa de U&, UESCAPE e prefixos pg_ e lo_ no comando de consultas de leitura (E3.6)

Propósito: revalidar o A5 do parecer `docs/security/099-consultas-leitura.md` (develop) no head `a73f2c4b`. O diff desde a base `167f3a13` toca só `scripts/consultas-leitura-098-099.sh` (duas linhas em `validar_sql`) e o teste dele (oito sondas novas). Nada rodou contra base real e nenhum `.env*` foi aberto. Rodados `bash scripts/consultas-leitura-098-099.test.sh` (todos os casos passaram) e `shellcheck` nos dois arquivos (limpo); as sondas abaixo rodaram só sobre a função `validar_sql` extraída do script e texto literal, sem banco.

## Gatilhos
- Controle que analisa entrada: a lista do permitido no `.sql` (`validar_sql`).
- Banco real: o comando roda no PostgreSQL da demo e no MySQL do Acelerato, pelo dono, com o `.env` dele.

## Resultado por ponto do brief

**1. A5 fechado: conforme.** `scripts/consultas-leitura-098-099.sh:104` recusa `U&` em qualquer posição e caixa e a palavra `uescape` delimitada; `:105` recusa qualquer `pg_` ou `lo_` precedido de início ou de caractere que não seja letra, dígito ou `_`. Conferido por sonda:
- `u&"pg!005fsleep" uEsCaPe '!'(1)` (caixa mista) e `UESCAPE` sozinho numa linha nova: recusados.
- Entre aspas e depois de ponto: `pg_catalog."pg_sleep"(1)`, `"PG_SLEEP"(1)` e `x."lo_create"(0)` recusados (o aspas e o ponto não são letra, então o prefixo casa).
- S8 a S12 do parecer anterior viraram casos do teste e são recusados sem chamar o banco.
- `U &"x"` (com espaço) passa, e está certo: o PostgreSQL só lê escape Unicode com `U&` colado à aspa; separado é identificador `U`, operador `&` e identificador `"x"`.

**2. Nenhuma consulta legítima recusada: conforme.** O caso de corpus do teste exige que os 31 `.sql` versionados passem, e passou; nenhum deles usa `U&`, `UESCAPE`, `pg_` ou `lo_` fora de comentário. Uma coluna como `tempo_pg_x` passa (o `_` antes do `pg` não é fronteira). Recusa colateral aceitável: um texto literal `'pg_...'` ou `'...U&...'` também é recusado; nenhum dos 31 precisa disso, e a regra erra para o lado fechado.

**3. Nenhum desvio novo aberto: conforme.** As duas linhas só acrescentam recusas depois das existentes; não removem nem afrouxam nenhuma (primeiro token, barra invertida, um `;` no fim, lista de palavras). O MySQL não é afetado por elas além da recusa, e nenhum `.sql` do MySQL usa os padrões.

**4. Resíduo fora do A5 (A6, recomendado).** O PostgreSQL tem funções que executam um texto como consulta: `query_to_xml`, `query_to_xmlschema`, `query_to_xml_and_xmlschema` e `ts_stat` (e `ts_rewrite` na forma com consulta). Com concatenação (`'p'||'g_terminate_backend(...)'` ou `concat(...)`) o nome da função de sistema nunca aparece inteiro no `.sql` e a guarda deixa passar (S13, S14). Não é desvio aberto por esta entrega: já existia e é a mesma família do A5 (uma dimensão nova da matriz: texto executado como SQL). O impacto continua o que o parecer anterior mediu: a consulta interna roda na mesma transação `READ ONLY` com um comando só, então resta negação de serviço (`pg_terminate_backend` nas sessões do mesmo papel, `pg_sleep` no teto do `statement_timeout`), e o autor seria quem versiona um `.sql` que passa por review. Não segura o K-277.

**Lacunas de ferramenta:** `gitleaks`, `semgrep` e `osv-scanner` não foram rodados (fora do que o brief permite e não estavam no PATH na volta anterior). Sem dependência nova.

## Achados
- A6 (recomendado) scripts/consultas-leitura-098-099.sh:90 · query_to_xml, query_to_xmlschema, query_to_xml_and_xmlschema, ts_stat e ts_rewrite executam texto como SQL e, com concatenação, contornam a recusa de pg_ e lo_; impacto só de negação de serviço no READ ONLY. Dono: devops-engineer.

### Detalhe das correções
- **A6:** acrescentar a `PALAVRAS_PROIBIDAS` (`:90`) as cinco palavras `query_to_xml`, `query_to_xmlschema`, `query_to_xml_and_xmlschema`, `ts_stat` e `ts_rewrite`, com um caso no teste para cada uma (S13 e S14 abaixo como base). Os 31 `.sql` não usam nenhuma. Pode ir num cartão próprio; não segura o K-277.
- **A2** (do parecer anterior, papel `dspd_coletor` com escrita) não foi reavaliado aqui: segue recomendado, com o software-architect.

## Sondas
- S13 · `SELECT query_to_xml('select p'||'g_terminate_backend(pid) from p'||'g_stat_activity',true,false,'');` · espera: recusa · obtido: passa
- S14 · `SELECT ts_stat('select to_tsvector(p'||'g_sleep(5)::text)');` · espera: recusa · obtido: passa

## Plano em cartões
Nenhum bloqueante: o K-277 fecha o A5 e pode seguir para o PR. A6 ao devops-engineer em cartão próprio.

## Riscos aceitos
Nenhum.
