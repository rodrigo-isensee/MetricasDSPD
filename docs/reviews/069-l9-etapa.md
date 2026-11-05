---
tipo: review
contrato: 1
pedido: 069-lacunas-alta
branch: feature/069-l9-etapa
commit: fb8ea39e27f54e3e7023e86a5bdcae494143ae32
parecer: aprovado
revisor: tech-lead
data: 2026-11-04
---
# Code review: 069 L9-b, campos de etapa do Acelerato até o staging (K-220)

## Parecer

Aprovado, com a exceção de teto aceita (A4) e quatro recomendações que não devolvem. O lote faz a F3 da ADR 0023 item 4 como o desenho do L9-b manda, com os controles A1 e A2 do modelo de ameaças no código: nomes e tratamento por constante, tratamento decidido pelo nome no `SELECT`, `tipo` só recusa, zod `strict` por forma de linha, domínio por valor, hash e versão de critério.

## O que foi lido

Diff `origin/develop...fb8ea39` (13 arquivos), a seção "Lote L9-b" de `docs/analises/069-desenho.md` e a parte do L9-b de `docs/security/069-modelo-ameacas.md` (controles 1 a 7, CA-069-6 a 11).

- Constante (`listas-fechadas.ts`): `CAMPOS_ETAPA_F3` com 7 nomes `lista` e 2 `preenchido`, a lista do controle 1; "Categoria de solução" e "Número do ticket anterior" fora, como o desenho diz. `ref_dominio` só guarda valores (`cpe_<chave>`), e o `campo` consultado também vem da constante (`referencia.ts`). Uma linha a mais em `ref_dominio` não entra no `IN` (teste sobre os parâmetros montados).
- Q6 e Q7 (`sql.ts`, `acelerato-mysql.sql`): só `SELECT`, `campos_personalizados_etapa` só dentro de `JSON_TABLE`, nomes por placeholder com igualdade exata, sem `LIKE`. Q7 não projeta `valor` nem `tipo`. Q6 só recebe nomes `lista`, então nenhum nome `preenchido` tem valor projetado, qualquer que seja o `tipo` da fonte. As duas estão em `CONSULTAS`, e o teste de paridade do `.sql` versionado as cobre.
- Allow-list (`camposEtapa`): `z.strictObject` por forma de linha; nome fora da constante, chave extra, 81 caracteres, booleano em `lista`, coluna `valor` na Q7: falha fechado `dados-invalidos`, com `coluna` e sem o valor (`falhar`). Contadores `fora_dominio_<chave>` e `tipo_texto_<chave>`, no máximo 32 caracteres, dentro do `varchar(40)` de `ctl_coleta_contagem.entidade`.
- Staging: os campos entram em `payload.campos` ao lado de `reincidente_90d`. O `payload` muda, então a releitura gera versão nova de cada chamado (append-only, como o L9-c prevê). `grants.ts` sem diff: `dspd_api` continua sem `stg_`.
- Hash e critério: `campos_sha256` passa a incluir `nome|tratamento` (trocar o tratamento muda o hash, com teste). `sql_sha256` muda com as duas consultas. Versão `069:L9-b-campos-etapa` com `metricas: []`, correta para lote só de staging. CA-8 continua pelo `parametros-mudaram` (ver A5).
- Desvios relatados:
  - Nomes Q6 e Q7 no lugar de "Q4": certo, porque `Q4_FORA_ORGANIZACOES` já existe (A7 do modelo).
  - `CHAR_LENGTH(TRIM(valor)) > 0` no lugar de `valor <> ''`: mais estrito (só espaço conta como não preenchido) e continua saindo só o booleano. O `TRIM` do MySQL tira só espaço; tab ou quebra de linha contam como preenchido, sem efeito de segurança.
  - Recusa por `tipo` que contém "text": mais larga que "texto" e só recusa, nunca libera, como o A2 exige.
- Testes (`acelerato-campos-etapa.test.ts` e ajustes): os nomes esperados e proibidos estão escritos à mão (não derivados da constante). Cobrem CA-069-6, 7, 8, 9, 10 e 11, a estrutura das consultas e `carregarDominiosEtapa`. O duble da Q6/Q7 compara o nome com igualdade exata (item 12 do checklist): é mais estrito que a colação do MySQL, mas o z.enum fecha o caminho (A6).
- Regras invioláveis: nada de pessoa nem de texto livre sai do MySQL pelos nomes `preenchido`; nenhuma métrica muda; fontes não se misturam.
- Ferramentas: o autor relata server com 1646 testes verdes e cobertura 100%, `docs:check` e prettier ok. Não refeitos aqui. O `git pull --ff-only` confirmou o HEAD em fb8ea39.
- Segurança: o parecer do lote é do security-engineer (E1.8, `docs/security/069-l9-etapa.md`), em paralelo; este review não o refaz e não abriu cartão novo.
- Teto M14: 154 linhas de código e 243 de teste (`git diff --numstat`), 397 no total; o `.sql` versionado é documentação e fica fora. Um comportamento só. A exceção está aceita no A4.

## Achados

- A1 (recomendado) server/src/modulos/acelerato/allow-list.ts:190 · Nome repetido em várias etapas (kanbanStatusKey) na Q6: o último valor vence, inclusive um nulo sobre um valor preenchido. A regra de qual etapa vale não está no desenho: vira pergunta ao arquiteto e ao dono antes do L9-c (R-DECISAO).
- A2 (recomendado) server/src/modulos/acelerato/allow-list.ts:205 · O valor passa se bater com o código ou com o rótulo do domínio, e o staging grava o valor cru da fonte. O S8 grava o código (DOMINIO_90_DIAS). Normalizar para o código aqui, ou decidir isso no L9-c.
- A3 (recomendado) server/src/modulos/referencia/dominio-acelerato.ts:17 · A lista fechada de campos do ac:ref-sync não tem cpe_*: a P-DS-19 não carrega sem mudar o carregador. Esse PR passa pelo controle 7 do modelo (parecer de segurança). Pendência do plano, não devolve.
- A4 (recomendado) server/tests/acelerato-campos-etapa.test.ts:1 · 397 linhas, acima do teto de 150. Exceção aceita: um comportamento, e os testes CA-069-6 a 11 vêm com a consulta. O PR da E1.6 leva a linha "teto: excedido, 397 linhas, <motivo>"; sem ela, é bloqueante (M14).
- A5 (recomendado) server/src/modulos/acelerato/controle.ts:27 · Depois do merge, a coleta falha com parametros-mudaram (sql_sha256 e campos_sha256) até rodar o registro do critério 069:L9-b-campos-etapa e pnpm coleta ac --reconhecer-mudanca. Pôr isso em riscos e em "como testar" no PR.
- A6 (recomendado) server/src/modulos/acelerato/sql.ts:56 · Colação ai_ci do MySQL: um nome com caixa ou acento diferente volta da Q6/Q7, e o z.enum derruba a coleta inteira (fecha sem vazar). Mesmo padrão da Q3; avaliar COLLATE utf8mb4_bin no IN se a fonte variar.
