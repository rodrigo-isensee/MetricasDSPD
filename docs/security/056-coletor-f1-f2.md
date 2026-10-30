---
tipo: revisao-seguranca
contrato: 1
pedido: 056-acelerato-mysql
branch: feature/056-coletor-acelerato
commit: cb91ff56dbfb3582729064a4f0dad3bf6225490d
parecer: riscos-aceitos
revisor: forge:security-engineer
data: 2026-10-30
---
# Revisão de segurança da F1 e da F2 do coletor do Acelerato (056, E4.7)

Escopo: o diff de `server/` entre a base 11141d7 e o commit acima (coletor, cliente MySQL, TLS, allow-list, staging, controle, projetor, migrações 0016 e 0017, entradas `coleta`, `criterios-ac` e `reconciliar-ac`, mudanças em `metricas/`), mais o pacote `mariadb` 3.5.4 lido em `server/node_modules` e no registro. Nada foi instalado, nenhuma conexão ao MySQL real foi aberta e o `.env` não foi lido. Rodei só os testes locais `acelerato-config-tls` e `acelerato-estatico` (42 passam, inclusive os contra o driver real e um servidor TLS de teste).

## Gatilhos
Dado pessoal e texto livre na fronteira, credencial externa, banco, dependência nova, consulta SQL escrita pelo projeto e mudança de regra do `CLAUDE.md` (R-SEGURANCA).

## Veredito
Nenhum achado bloqueante. As recomendações abaixo não devolvem a entrega. O parecer é `riscos-aceitos` por causa do R-1 (conta compartilhada com host aberto), aceito pelo dono em 2026-10-30 14:24 no Histórico do pedido; o registro formal em `docs/security/aceites/`, com `commit:` igual ao deste parecer, é do usuário e está pendente (pedir pelo Jarvis, R-SEGURANCA e R-DECISAO).

## Achados
- A1 (recomendado) server/src/modulos/acelerato/cliente-mysql.ts:43 · Acrescentar `permitRedirect: false` e `restrictedAuth: ['caching_sha2_password', 'mysql_native_password']`. Hoje o driver aceita redirecionar a conexão a outro host e trocar o plugin de autenticação, o que o TLS fixado já limita. Esforço P; dono node-backend.
- A2 (recomendado) server/src/modulos/acelerato/cliente-mysql.ts:91 · Registrar `conexao.on('error', ...)` com um tratador que não imprime nada. O driver emite `error` sem checar ouvinte (connection.js:1427 e 1444); sem tratador, erro com a conexão ociosa derruba o processo com o texto cru do driver (M2). Esforço P; dono node-backend.
- A3 (recomendado) CLAUDE.md:23 · A regra ainda diz que o Acelerato é lido só pela API pública, contra a ADR 0023 e o código. Aplicar o texto do A1 do parecer da E4.2 (TLS verificado, filtro na origem por lista fechada) antes do PR, por decisão do dono. Esforço P; dono tech-lead.
- A4 (recomendado) server/package.json:39 · `mariadb` é LGPL-2.1-or-later. Uso sem modificação, como dependência de ferramenta interna sem redistribuição, é aceitável; registrar essa premissa na ADR 0023 para o caso de o servidor ser distribuído. Esforço P; dono software-architect.
- A5 (recomendado) server/src/modulos/acelerato/allow-list.ts:74 · `categoria` e `descricao_workflow` entram por forma curta (texto livre de até 80 caracteres sem arroba). Um nome de pessoa digitado ali passaria. Preferir domínio fechado em `ref_dominio`, como já é em status e prioridade. Esforço M; dono node-backend.

## Detalhe dos achados

### Conferências pedidas (todas atendidas)
- **TLS antes da credencial.** `opcoesSsl` (tls.ts:52) fixa `rejectUnauthorized: true`, `ca` com o PEM cuja impressão é conferida na partida (tls.ts:36), `allowPartialTrustChain` e `checkServerIdentity` por impressão SHA-256. No `mariadb`, o objeto `ssl` vai ao `tls.connect` do Node depois do pedido de SSL e antes da resposta de autenticação (connection.js:1383-1397); como o `ca` está presente, o modo de impressão do próprio driver não liga (connection.js:1379). O teste contra o driver real prova: impressão trocada gera erro `tls-impressao-diferente` e zero bytes após o TLS; servidor sem TLS recusa sem cair para texto puro. `NODE_TLS_REJECT_UNAUTHORIZED=0` recusa a partida (config.ts:44).
- **Sem arquivo local nem múltiplas instruções.** `permitLocalInfile: false` e `multipleStatements: false` (cliente-mysql.ts:43); no driver, a capacidade `LOCAL_FILES` só é anunciada com `permitLocalInfile` verdadeiro (client-capabilities.js:34), e não há `infileStreamFactory`. `compress: false` e `allowPublicKeyRetrieval: false` explícitos.
- **Só SELECT com placeholder.** As cinco consultas são constantes (sql.ts), sem `*`, sem `OFFSET`, valores só por `?`; `expandir` gera apenas `?` pela quantidade (1 a 5000). A sessão expõe só `consultar`, que usa `execute` (protocolo preparado). As únicas instruções por `query` são três constantes de controle (`SET SESSION TRANSACTION READ ONLY`, `START TRANSACTION READ ONLY`, `ROLLBACK`). O fim é sempre `ROLLBACK`, nunca `COMMIT`. O teste estático confere o texto, as 11 colunas barradas e `agente_key` só como `IS NOT NULL`.
- **Nenhuma coluna de pessoa.** O SELECT lê as 35 colunas listadas mais `com_agente` derivado; a allow-list zod `strictObject` falha fechado em coluna ou chave extra, e o erro cita só o nome da coluna. `com_agente` entrou em `EXCECOES_PESSOA` como booleano (lgpd.ts), sem tocar em `COLUNAS_PESSOA`. Q2 lê só as cinco chaves de `workflow.etapas[]`; Q3 só o campo dos 90 dias por nome exato, com valor de até 80 caracteres e domínio de três respostas. Tipo, organização e equipe têm de coincidir com o rótulo da lista vigente. Logs e `ctl_*` recebem só código, entidade, `id_origem` e nome de coluna (erros.ts, controle.ts); o host e o banco vão como hash.
- **GRANT.** O coletor tem SELECT e INSERT em `stg_*` e em `ctl_*` (grants.ts:60, 65), sem UPDATE nem DELETE no staging (os gatilhos também barram); UPDATE em `ctl_coleta` só por quatro colunas. O SELECT no staging é necessário para a dedução de versão e não expõe pessoa, que nunca chega lá. A API não lê `stg_*`. As migrações 0016 e 0017 são aditivas e sem GRANT próprio.
- **Credenciais e configuração.** Variáveis `ACELERATO_MYSQL_*` separadas, validadas na partida (host e banco por padrão restrito), mensagens só com o nome da variável. A entrada `coleta` nunca imprime configuração nem o erro do driver.

### Pacote `mariadb` 3.5.4 (cadeia de suprimentos)
Fonte: leitura em `node_modules`, `pnpm view` e a base de avisos do GitHub. Lacuna: `osv-scanner`, `gitleaks` e `semgrep` não estão no PATH; a varredura roda no CI.
- Versão exata no `package.json` e no lockfile (`mariadb@3.5.4`, integridade presente), a mais recente (publicada em 2026-09-01), Node 20 ou superior. Mantenedores: três contas (rusher, npm_mariadb, dbart), todas da MariaDB Corporation. Sem script `install` ou `postinstall` (só `build` e `prepublishOnly`).
- Licença LGPL-2.1-or-later (A4). Dependências diretas: `denque` (Apache-2.0), `iconv-lite` (MIT), `lru-cache` (BlueOak-1.0.0), `@types/node` e `@types/geojson` (só tipos). Todas permissivas, sem script de instalação.
- Avisos publicados: o mais grave para este desenho era GHSA-cqhc-2h57-wpxf (senha em claro a um intermediário apesar de `ssl: true`, corrigido em 3.5.3); também há injeção em protocolo de texto, em `SET` expandido, memória não inicializada por GeoJSON e queda no ed25519 com TLS sem configuração (corrigidos em 3.5.4). A 3.5.4 está acima de todas as correções. O projeto só usa `execute` com placeholder e nenhum parâmetro de objeto, GeoJSON ou Buffer, o que reduz a superfície das classes de injeção.
- Parecer do driver: aceito. O plano B (`mysql2`) não é necessário.

### Observações sem achado
- `SET SESSION max_execution_time` (sql.ts) é variável do MySQL; num servidor MariaDB o nome é `max_statement_time` e a coleta falharia fechada na partida. A origem é MySQL, então não é achado; vale conferir na E4.8.
- Os `ctl_coleta_contagem` recebem nomes de contadores fixos do código, sem valor de origem.

## Riscos aceitos e ferramentas
R-1 (M1, conta compartilhada de desenvolvimento com host aberto): aceito pelo dono em 2026-10-30 14:24, válido até o time de ciência de dados criar usuário próprio e, no máximo, até a coleta agendada. Condições (mitigações de M2, M3, M5 e M11) conferidas neste parecer: TLS fixado, erro sem texto do driver, filtro de origem por lista em `ref_dominio` e consultas constantes. Pendente: registro formal do dono em `docs/security/aceites/`, ligado ao commit deste parecer.
Ferramentas usadas: leitura de código, `pnpm view`, `gh api` (avisos) e os testes locais citados. Faltaram no PATH: `osv-scanner`, `gitleaks`, `semgrep`.
