---
tipo: revisao-seguranca
contrato: 1
pedido: 098-acelerato-todos-os-times
branch: feature/098-b1-nomes-times
commit: 856804d29c3c5644f0544447c901e40d673b70b0
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-18
---
# Review de segurança: 098-acelerato-todos-os-times (lote B1, migração 0043)

Etapa E1.11. Diff revisado: `acb62951..856804d2` (7 arquivos: `server/migrations/0043_bm_nomes_times.ts`, `checksums.json`, quatro testes e o registro em `server/tests/migracoes.ts`).

## Gatilhos
Gatilhos: migração de banco em tabela de referência com vigência imutável (gatilho de vigência desligado no `down`); dado vindo de arquivo do dono fora do repositório.

## Achados
- A1 (recomendado) server/migrations/0043_bm_nomes_times.ts:48 · lista de workflows unificados entra no SQL entre aspas cruas, sem o `aspas()` da linha 82; hoje é constante só de dígitos, sem entrada externa; usar `aspas(w)` para uniformidade.
- A2 (recomendado) server/migrations/0043_bm_nomes_times.ts:82 · nomes entram em blocos `DO $$` só com escape de aspa simples; um nome com `$$` fecharia o bloco; constante revisada, sem entrada externa; recusar `$` em `validarNomes` ou usar delimitador com rótulo.

## Sondas

## Detalhe dos achados
**SQL montado com texto (injeção).** Todo valor interpolado é constante do próprio arquivo (lista fechada revista pelo dono), não há entrada de usuário, de API nem de ambiente além dos nomes de schema (`Esquemas`, padrão das 42 migrações anteriores). Texto passa por `aspas()` (`:82`), números são `number` tipado, `REFERENCIA_VERSAO` e `REGISTRADO_POR` são constantes sem aspa. Sem caminho de ataque: quem altera a lista já tem escrita no repositório e passa por review. A1 e A2 são endurecimento, severidade informativa, esforço P, dono `node-backend`.

**Gatilho desligado no `down` só dentro da transação.** O runner usa `singleTransaction: true` nas duas direções (`server/src/plataforma/db/migrar.ts:91`), e o executor só emite `pgm.sql` (`server/src/plataforma/db/executar.ts:10`), sem `noTransaction` em nenhuma migração. A guarda (`down[0]`) roda antes do `DISABLE` (`:146`); o `ENABLE` (`:151`) vem antes do último `DELETE`; uma falha no meio desfaz também o `ALTER TABLE` (DDL transacional). Só o gatilho de linha `tg_*_vigencia` é desligado; o de TRUNCATE fica ativo. Os `DELETE` do `down` filtram por `registrado_por` da própria correção, e a reabertura só alcança vigências da carga 0019 fechadas dentro da lista (guarda). Teste: `server/tests/nomes-times.pg.test.ts` T-B1.5 prova o gatilho religado (código 55000) e a recusa com vigência posterior. Mesmo padrão já aprovado na 0019.

**GRANT por coluna (`dspd_api`).** A migração não cria coluna nem GRANT; só insere linhas. `registrado_por` segue fora do papel da API (`server/src/plataforma/db/grants.ts:43-44`), conferido por `server/tests/referencia-times.pg.test.ts` (bloco de privilégios, linha ~167), cujo ajuste (`WHERE vigente_ate IS NULL`) não afrouxa a checagem de privilégio. O valor `correcao-098-E4` não identifica pessoa.

**Nome de pessoa.** Os 45 nomes são de time, sistema ou projeto (incluindo nomes de marca e mitológicos, que a decisão do dono de 2026-11-12 15:27 manda tratar como time/sistema). Nenhum nome próprio de pessoa. As mensagens de erro citam só `time_id` (testes T-B1.2 e a suíte sem banco provam que o nome não vaza na exceção).

**Dado do arquivo de consultas do dono.** O commit leva do arquivo só o necessário: nome, `workflow_id` e o quadro `24` dos dois unificados, conferidos contra a 0019 pelos testes. Nenhuma chave de equipe do Acelerato, contagem, organização ou linha bruta da saída; a mensagem de commit não cita o arquivo nem o conteúdo. Conforme a liberação do dono de 2026-11-12 15:27.

**checksums.json.** Entrada nova só para a 0043; nenhuma entrada existente mudou. O teste "SHA-256 de ddl(S_PADRAO) bate com checksums.json" passou localmente.

**Fora do domínio de segurança (para o `tech-lead`):** `migracoes.estatico.test.ts:62` falha localmente porque a 0042 (T8) ainda não está na base; com `checkOrder: true`, a ordem de chegada da 0042 em relação à 0043 importa para o deploy. Não é achado de segurança.

## Riscos aceitos e ferramentas
Riscos aceitos: nenhum.
Ferramentas: leitura estática do diff e do runner; testes sem banco rodados localmente (`nomes-times.test.ts` e `migracoes.estatico.test.ts`: 35 de 36, a falha é a sequência 0042 acima). Suíte com banco não rodada (sem docker por restrição do brief): vale o CI do PR. Lacunas no PATH: varredor de segredos, SAST e varredor de dependências ausentes; o diff não toca dependência nem configuração.
