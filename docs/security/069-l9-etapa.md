---
tipo: revisao-seguranca
contrato: 1
pedido: 069-lacunas-alta
branch: feature/069-l9-etapa
commit: fb8ea39e27f54e3e7023e86a5bdcae494143ae32
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-04
---
# Review de segurança: lote L9-b do 069, campos de etapa do Acelerato até o staging (K-220)

Propósito: parecer de segurança (`R-SEGURANCA`, E1.8) do lote L9-b contra o modelo de ameaças `docs/security/069-modelo-ameacas.md` (A1, A2, controles 1 a 7, CA-069-6 a 11). Público: tech-lead, qa-engineer, node-backend, Jarvis.

**Veredito: aprovado.** A1 e A2 do modelo estão no código e nos testes; nada de pessoa nem de texto livre chega ao staging, ao log ou às `ctl_`; `grants.ts`, `lgpd.ts` e as migrações sem diff.

Revisão estática de `git diff origin/develop...fb8ea39` (13 arquivos, +387 -24). Executado só o recorte de testes do lote, sem banco real: `vitest run --maxWorkers=2` em `acelerato-campos-etapa`, `acelerato-estatico`, `acelerato-coletor` e `criterios-acelerato`: 4 arquivos, 77 testes verdes. Nenhum `.env` lido, nenhuma API nem base consultada.

## Gatilho
Campo novo do Acelerato na fronteira: duas consultas SQL novas sobre a coluna `json` `campos_personalizados_etapa`, que na origem mistura campos de seleção, texto livre e pessoa.

## Conferência contra o modelo
- **A1, nomes só da constante (controle 1, CA-069-6, CA-069-11).** `CAMPOS_ETAPA_F3` (`server/src/modulos/acelerato/listas-fechadas.ts:40`) traz os 9 nomes com tratamento fixo: 7 `lista` e 2 `preenchido`, sem "Categoria de solução" nem "Número do ticket anterior", como no controle 1. O coletor passa só `NOMES_ETAPA_LISTA` e `NOMES_ETAPA_PREENCHIDO` como parâmetros (`coletor.ts:119-120`). `carregarDominiosEtapa` (`referencia.ts:52`) lê de `ref_dominio` só valores, com o `campo` (`cpe_<chave>`) também vindo da constante e por placeholder. O teste da linha a mais em `ref_dominio` com "Acelerato - Atendente" confere os parâmetros da consulta montada (`acelerato-campos-etapa.test.ts:81-93`), e a lista de proibidos está escrita à mão no teste (`:22-25`), não derivada da constante.
- **A2, tratamento pelo nome no `SELECT` (controle 2, CA-069-7, CA-069-8).** A Q7 (`sql.ts:68`) consulta só nomes `preenchido` e projeta `c.ticket_key, f.nome` e o booleano `CHAR_LENGTH(TRIM(f.valor)) > 0`; nem `valor` nem `tipo` saem do MySQL, qualquer que seja o `tipo` da fonte. Teste estrutural fixa a projeção literal (`test.ts:72-77`). A Q6 (`sql.ts:56`) consulta só nomes `lista`, com `valor VARCHAR(80)`. O `tipo` só recusa (`allow-list.ts:175`): contendo "text", o valor vira nulo com `tipo_texto_<chave>`, mesmo que estivesse no domínio (`test.ts:131-139`).
- **Zod strict (controle 3, CA-069-9).** `esquemaEtapaLista` e `esquemaEtapaPreenchido` (`allow-list.ts:168, 172`) são `strictObject` com `nome` em `z.enum` da constante; nome de `preenchido` na Q6 ou de `lista` na Q7 falha. O erro sai por `falhar` (`allow-list.ts:73-77`), que leva só entidade e nome de coluna, nunca o valor; os 8 casos do `it.each` (`test.ts:179-193`) conferem o marcador ausente da mensagem e do objeto do erro.
- **Domínio (controle 4, CA-069-10).** Valor fora do domínio, ou domínio vazio (estado atual, até a P-DS-19), vira nulo com `fora_dominio_<chave>`; os contadores usam só a `chave` da constante, nunca o valor (`allow-list.ts:182-209`, `test.ts:141-154, 201-205`).
- **SQL versionado (controle 5).** Nomes próprios Q6 e Q7 (resolve o A7 do modelo), incluídas em `CONSULTAS` (`sql.ts:89`) e no `docs/architecture/fontes/acelerato-mysql.sql`; `campos_sha256` passa a incluir nome e tratamento (`controle.ts:27`), então trocar `lista` por `preenchido` muda o hash; a mudança de parâmetros sem reconhecimento recusa a coleta antes de conectar (`coletor.ts:204-209`, CA-8 do 056); versão de critério `069:L9-b-campos-etapa` registrada sem métrica afetada. `campos_personalizados_etapa` só aparece dentro de `JSON_TABLE`, uma vez por consulta, e em nenhuma das Q1 a Q5 (`acelerato-estatico.test.ts`).
- **Analítico e GRANT (controle 6).** Sem diff em `server/src/plataforma/` (`grants.ts`, `lgpd.ts`) nem em `server/migrations/`; os campos entram só no `payload.campos` do staging, ao lado de `reincidente_90d`, sem colisão de chave.
- **Fronteira ponta a ponta.** A fixture de 50 colunas com os marcadores de `PROIBIDOS` e a fixture de nomes proibidos com marcadores passam pela coleta inteira; nenhum marcador aparece no estado do banco, nos logs nem no resultado (`test.ts:95-116`). O log do coletor registra só contagens e códigos (`coletor.ts:184, 188, 193`).
- **Controle 7** (domínios da P-DS-19) não é deste lote: vale para o PR que preencher `cpe_*` no `acelerato-dominio.json`, que volta a parecer.

## Ferramentas
Sem `gitleaks`, `semgrep` nem `osv-scanner` no PATH: lacuna registrada; o lote não mexe em dependência nem em configuração com segredo, e a evidência de varredura é a da CI do PR.

## Achados
- A1 (recomendado) server/src/modulos/acelerato/referencia.ts:58 · O domínio aceita código e rótulo de cpe_*; com os valores ainda vazios, o controle 7 do modelo segue valendo: o PR que carregar a P-DS-19 passa por parecer, sem texto livre nem nome próprio. Dono: node-backend.
- A2 (recomendado) server/src/modulos/acelerato/sql.ts:56 · f.nome IN segue a collation da JSON_TABLE; grafia variante de um nome falharia fechado no zod e pararia a coleta (disponibilidade, sem vazamento). No QA com dado real, observar dados-invalidos de campo_etapa. Dono: qa-engineer.

## Riscos aceitos
Nenhum.
