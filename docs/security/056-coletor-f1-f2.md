---
tipo: revisao-seguranca
contrato: 1
pedido: 056-acelerato-mysql
branch: feature/056-coletor-acelerato
commit: 3b2f98f41e130c9f7c11799701efb0dee29c81fb
parecer: riscos-aceitos
revisor: forge:security-engineer
data: 2026-10-30
---
# Revisão de segurança da F1 e da F2 do coletor do Acelerato (056, E4.7; revalidação E4.14)

Escopo: o diff de `server/` entre a base 11141d7 e o commit acima (coletor, cliente MySQL, TLS, allow-list, staging, controle, projetor, migrações 0016 e 0017, entradas `coleta`, `criterios-ac` e `reconciliar-ac`, mudanças em `metricas/`), mais o pacote `mariadb` 3.5.4 lido em `server/node_modules` e no registro. Nada foi instalado, nenhuma conexão ao MySQL real foi aberta e o `.env` não foi lido. Na E4.7 rodei os testes locais `acelerato-config-tls` e `acelerato-estatico` (42 passam, inclusive os contra o driver real e um servidor TLS de teste); na E4.14, a revalidação abaixo.

## Gatilhos
Dado pessoal e texto livre na fronteira, credencial externa, banco, dependência nova, consulta SQL escrita pelo projeto e mudança de regra do `CLAUDE.md` (R-SEGURANCA).

## Veredito
Revalidação (E4.14) sobre a volta aed1930..3b2f98f: A1, A2 e A5 resolvidos, sem achado novo e sem bloqueante. O parecer segue `riscos-aceitos` só por causa do R-1 (conta compartilhada com host aberto), aceito pelo dono em 2026-10-30 14:24 no Histórico do pedido; o registro formal em `docs/security/aceites/`, agora com `commit: 3b2f98f41e130c9f7c11799701efb0dee29c81fb` (o deste parecer), é do usuário e está pendente (pedir pelo Jarvis, R-SEGURANCA e R-DECISAO).

## Achados
- A1 (recomendado) server/src/modulos/acelerato/cliente-mysql.ts:47 · Resolvido em 7bea909: `permitRedirect: false` e `restrictedAuth` com os dois plugins; o driver 3.5.4 honra as duas opções (connection.js:2149, authentication.js:296). Teste novo em acelerato-config-tls.
- A2 (recomendado) server/src/modulos/acelerato/cliente-mysql.ts:99 · Resolvido em 7bea909: tratador de `error` mudo, registrado logo após conectar; o `on` do driver repassa ao Connection (connection-promise.js:287). Teste confere zero saída em stderr.
- A3 (recomendado) CLAUDE.md:23 · A regra ainda diz que o Acelerato é lido só pela API pública, contra a ADR 0023 e o código. Aplicar o texto do A1 do parecer da E4.2 (TLS verificado, filtro na origem por lista fechada) antes do PR, por decisão do dono. Esforço P; dono tech-lead.
- A4 (recomendado) server/package.json:39 · `mariadb` é LGPL-2.1-or-later. Uso sem modificação, como dependência de ferramenta interna sem redistribuição, é aceitável; registrar essa premissa na ADR 0023 para o caso de o servidor ser distribuído. Esforço P; dono software-architect.
- A5 (recomendado) server/src/modulos/acelerato/allow-list.ts:112 · Resolvido em d038e4f: `categoria` (e `descricao_workflow`, linha 134) só por domínio fechado vigente no `ref_dominio`; fora vira nulo com contagem, sem o valor. A forma curta saiu.

## Detalhe dos achados

### Revalidação E4.14 (volta aed1930..3b2f98f)
Li o diff inteiro da volta (com `forge-check delta` sobre este parecer) e rodei `acelerato-config-tls`, `acelerato-allow-list` e `acelerato-coletor` (85 passam). Nada instalado, sem conexão ao MySQL real, `.env` não lido.
- **A1.** `opcoesConexao` passa `permitRedirect: false` (sem ele, com TLS verificado, o padrão do driver seria permitir; connection-options.js:153) e `restrictedAuth` com `caching_sha2_password` e `mysql_native_password`; plugin fora da lista é recusado pelo driver antes de enviar a resposta de autenticação.
- **A2.** `aberta.on?.('error', () => undefined)` logo após a conexão abrir e antes da primeira instrução; a falha da operação em curso continua chegando por rejeição e passa pela tradução sem texto do driver. O método é opcional só no tipo, para os duplos de teste; o Connection promise do driver o expõe.
- **A5.** `carregarListas` lê também os campos `categoria` e `descricao_workflow` vigentes; `noDominio` substitui a forma curta, com as contagens `fora_dominio_categoria` e `fora_dominio_workflow`. Teste novo com um nome de pessoa curto em `categoria` mostra que vira nulo.
- **Resto da volta, sem achado.** A releitura passa a reconsultar ids já ausentes, pela `Q5_SAIDA` constante com placeholders numéricos, e a recarga suspeita conta só as ausências novas (o limite de 5% continua barrando recarga em massa). Chamado com prioridade nula fica na base e sai do EI; a consulta da API não ganhou coluna. O teste `.pg` e o snapshot de esquema usam só a base local.

### Observações sem achado (volta)
- Enquanto o dono não preencher as listas `categoria` e `descricao_workflow` no `ref_dominio` (E4.8, documentadas na E4.15), toda `categoria` vira nula e a natureza, que sai do prefixo dela, também. É falha fechada (sem risco de pessoa), mas a carga real depende das listas; vale conferir a contagem `fora_dominio_categoria` na E4.8.

### Conferências pedidas na E4.7 (todas atendidas)
- **TLS antes da credencial.** `opcoesSsl` (tls.ts:52) fixa `rejectUnauthorized: true`, `ca` com o PEM cuja impressão é conferida na partida (tls.ts:36), `allowPartialTrustChain` e `checkServerIdentity` por impressão SHA-256. No `mariadb`, o objeto `ssl` vai ao `tls.connect` do Node depois do pedido de SSL e antes da resposta de autenticação (connection.js:1383-1397); como o `ca` está presente, o modo de impressão do próprio driver não liga (connection.js:1379). O teste contra o driver real prova: impressão trocada gera erro `tls-impressao-diferente` e zero bytes após o TLS; servidor sem TLS recusa sem cair para texto puro. `NODE_TLS_REJECT_UNAUTHORIZED=0` recusa a partida (config.ts:44).
- **Sem arquivo local nem múltiplas instruções.** `permitLocalInfile: false` e `multipleStatements: false` (cliente-mysql.ts:45); no driver, a capacidade `LOCAL_FILES` só é anunciada com `permitLocalInfile` verdadeiro (client-capabilities.js:34), e não há `infileStreamFactory`. `compress: false` e `allowPublicKeyRetrieval: false` explícitos.
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

### Observações sem achado (E4.7)
- `SET SESSION max_execution_time` (sql.ts) é variável do MySQL; num servidor MariaDB o nome é `max_statement_time` e a coleta falharia fechada na partida. A origem é MySQL, então não é achado; vale conferir na E4.8.
- Os `ctl_coleta_contagem` recebem nomes de contadores fixos do código, sem valor de origem.

## Riscos aceitos e ferramentas
R-1 (M1, conta compartilhada de desenvolvimento com host aberto): aceito pelo dono em 2026-10-30 14:24, válido até o time de ciência de dados criar usuário próprio e, no máximo, até a coleta agendada. Condições (mitigações de M2, M3, M5 e M11) conferidas neste parecer e reconferidas na E4.14: TLS fixado, erro sem texto do driver (agora também com a conexão ociosa), filtro de origem por lista em `ref_dominio` e consultas constantes. Pendente: registro formal do dono em `docs/security/aceites/`, ligado ao commit deste parecer (3b2f98f).
Ferramentas usadas: leitura de código, `pnpm view`, `gh api` (avisos), `forge-check delta` e os testes locais citados. Faltaram no PATH: `osv-scanner`, `gitleaks`, `semgrep`.
