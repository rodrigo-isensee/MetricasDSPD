---
tipo: revisao-seguranca
contrato: 1
pedido: 105-melhorias-15-11
branch: docs/105-implantacao-vm
commit: b0552e477a0fccba09302cc993ce418ccc38eb89
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-16
---
# Review de segurança: pacote de implantação na VM (105, E7.249)

Escopo: `57989aa0...b0552e47` (E7.244 e E7.246): `docs/devops/105-implantacao-vm.md`, `deploy/sql/` (papéis, 39 migrações, GRANTs, consolidado) e o gerador `scripts/gerar-sql-migracoes.{sh,mjs}`. Revisão estática; nada executado contra banco real nem contra a VM.

**Veredito: aprovado, com recomendações.** Nenhum segredo nos arquivos; papéis e GRANTs iguais aos do projeto (provado por regeneração); `dspd_api` sem coluna de pessoa; Apontamento só no `dspd_api_apontamento`; o pedido à infraestrutura é de menor privilégio. As recomendações abaixo valem antes de a VM receber dado real, não para o envio do pacote.

## Gatilhos
`R-SEGURANCA`: credenciais e papéis do banco, GRANT por coluna (dado de pessoa, LGPD), infraestrutura e acessos externos.

## Achados
- A1 (recomendado) docs/devops/105-implantacao-vm.md:164 · TLS ao banco é pedido, mas a aplicação monta as URLs sem `sslmode` e aponta ao contêiner local (`docker-compose.yml:35`): o compose de produção (LACUNA da seção 4) deve ler `PG_*_URL` do `.env` com `sslmode=verify-full` e a CA da empresa.
- A2 (recomendado) docs/devops/105-implantacao-vm.md:92 · O passo 2.1/2 sobe o banco local com senhas padrão quando falta variável (`docker-compose.yml:11-19`), em contradição com o banco gerenciado do item 5.3; o compose de produção não deve ter banco nem valor padrão (falhar sem a variável).
- A3 (recomendado) docs/devops/105-implantacao-vm.md:170 · Item 11(b) pede SELECT "nas tabelas que a coleta lê" sem nomeá-las: a coleta só lê `ACELERATO_CHAMADOS` (`server/src/modulos/acelerato/sql.ts:23`); pedir SELECT só nela, por coluna da allow-list quando o banco permitir.
- A4 (recomendado) docs/devops/105-implantacao-vm.md:55 · A chave do BusinessMap é "a do dono" (pessoal, com os poderes dele): pedir no item 11(a) uma conta de serviço só leitura, restrita aos quadros de `BUSINESSMAP_QUADROS_IDS`, com rotação combinada.
- A5 (recomendado) deploy/sql/00_papeis_e_banco.sql:5 · Senhas passadas por `-v` na linha de comando ficam no histórico do shell e na lista de processos do DBA, e `CREATE ROLE ... PASSWORD` pode ir ao log do servidor; preferir criar sem senha e definir com o comando interativo de senha do cliente (hash no cliente).
- A6 (recomendado) docs/devops/105-implantacao-vm.md:163 · `dspd_webhook`, `dspd_automacao` e `dspd_pesquisa` nascem com LOGIN sem uso previsto na VM; criá-los NOLOGIN até a função ser ligada (GRANTs não mudam, o esquema gerado continua igual).
- A7 (recomendado) docs/devops/105-implantacao-vm.md:165 · Backups levam `pessoa_ref` e nome do responsável: o item 6 deve pedir backup cifrado, acesso restrito ao DBA e retenção alinhada à eliminação a pedido (`cfg_pessoa_eliminada` reaplicada após restauração).
- A8 (recomendado) docs/devops/105-implantacao-vm.md:161 · A conta de serviço que roda as coletas pelo motor de contêineres equivale a root se estiver no grupo dele; o item 2 deve dizer quem fica no grupo e que a conta de serviço não tem sudo.

## Sondas

## Detalhe dos achados
**Segredos.** `deploy/sql/*.sql`, o documento e o gerador não trazem valor secreto: senhas só como variáveis do cliente (`deploy/sql/00_papeis_e_banco.sql:8-15`), o documento lista só nomes de variável, e a senha `descartavel` do gerador (`scripts/gerar-sql-migracoes.sh:16`) é de um banco efêmero em `127.0.0.1`, apagado ao fim. A carga 0019 grava só nomes de time e workflow, nenhum de pessoa.

**Papéis e GRANTs iguais aos do projeto.** `00_papeis_e_banco.sql` repete `docker/postgres/init/01-databases-papeis.sh:10-28` (mesmos oito papéis, CONNECT, CREATE só ao migrador, `public` fechado). `9000_grants.sql` sai da mesma `gerarGrants` (`server/src/plataforma/db/grants.ts`) sobre o catálogo do banco migrado pelo runner real. Regenerei em b0552e47 (porta descartável própria): "OK: runner e SQL gerado produzem o mesmo esquema (4304 linhas de dump)" e "OK: 39 migracoes registradas nos dois caminhos", com a árvore limpa depois (saída idêntica ao commitado). O dump compara também as ACLs, então os GRANTs dos dois caminhos são iguais.

**Pessoa fora da API.** `dspd_api` não recebe `fato_apontamento`, `dim_responsavel`, `apt_pessoa_time`, `cfg_pessoa_eliminada`, `stg_`/`evt_` nem o dicionário do Apontamento; em `dim_card` o GRANT é por coluna sem `responsaveis` (`deploy/sql/9000_grants.sql:125`). `pessoa_ref` e `responsavel_nome` só para `dspd_api_apontamento` (`9000_grants.sql:403-433`), igual a `COLUNAS_API_APONTAMENTO`. `dspd_api` lê `ctl_apontamento_cobertura` (`9000_grants.sql:133`), que só tem card e estado, como no projeto.

**Menor privilégio no pedido à infraestrutura.** Itens 4, 11 e 15 pedem papéis sem superusuário, contas só leitura e acesso administrativo nominal; item 7 publica só o painel, não a API. A1 a A8 apertam o que falta. Dono de A1, A2, A3, A4, A6, A7 e A8: `devops-engineer` (documento e compose de produção); de A5: `devops-engineer` (gerador). Esforço P em todos, exceto A1/A2 (M, junto com o compose de produção). Severidade: A1 média (credencial em claro na rede interna, se o banco aceitar sem TLS), A2 média (senha padrão pública, mitigada por porta em 127.0.0.1), A3 a A8 baixa.

**Divergência registrada pelo autor** (`docs/devops/105-implantacao-vm.md:151`): o `CLAUDE.md` diz que o Acelerato é lido pela API pública só com GET; o código lê o banco MySQL em leitura (ADR 0023). É decisão do dono (`R-DECISAO`), não achado deste parecer; a allow-list na fronteira continua valendo nos dois caminhos.

## Riscos aceitos e ferramentas
Nenhum risco aceito. Suíte: sem PR, a suíte inteira fica para o CI do PR; este parecer não afirma CI verde e não há PQ do autor citado no brief; a prova executada aqui foi a regeneração reprodutível acima. Ferramentas de varredura de segredos, de dependências e SAST não estão no PATH (lacuna); a busca por segredos foi por padrão de texto nos arquivos do diff.
