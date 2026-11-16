---
tipo: revisao-seguranca
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-vm-producao
commit: efe4fb86203357427d789aff8198603595497494
parecer: reprovado
revisor: forge:security-engineer
data: 2026-11-16
---
# Review de segurança: configuração de produção da VM (105, E7.275)

Escopo: `ffc38fe7...efe4fb86` (E7.270): `docker-compose.prod.yml`, `deploy/sql/papeis-producao.sql`, `docs/devops/105-implantacao-vm.md`, aviso no runbook, `.env.example` e CHANGELOG. Conferência contra A1 a A8 de `docs/security/105-implantacao-vm.md` (na develop, commit b0552e47). Revisão estática; nada executado contra banco real nem contra a VM.

**Veredito: reprovado, por integração.** O conteúdo novo está certo e fecha A1, A2, A6 e A8 neste arquivo; mas a branch saiu de `ffc38fe7`, antes do #497, e não integra com a develop: o documento conflita (add/add) e a develop continua com o `00_papeis_e_banco.sql` gerado e o documento antigo, que mandam o DBA passar senhas por `-v` e criar os três papéis com LOGIN. Em produção ficariam dois roteiros de papéis contraditórios, e o que o documento da develop cita é o inseguro.

## Gatilhos
`R-SEGURANCA`: credenciais e papéis do banco, TLS ao banco, infraestrutura e acessos (grupo do motor de contêineres), dado pessoal em backup (LGPD).

## Achados
- A1 (bloqueante) deploy/sql/papeis-producao.sql:11 · Branch saiu antes do #497: conflito add/add em docs/devops/105-implantacao-vm.md e a develop mantém 00_papeis_e_banco.sql (gerado) com senhas por -v e webhook/automacao/pesquisa LOGIN. Rebase, um documento só e o gerador emitindo \getenv e NOLOGIN.
- A2 (recomendado) deploy/sql/papeis-producao.sql:11 · CREATE ROLE ... PASSWORD manda a senha em claro no comando e ela vai ao log do servidor se log_statement cobrir DDL: abrir o script com SET log_statement = 'none' na sessão do DBA ou criar sem senha e usar \password (hash no cliente).
- A3 (recomendado) docs/devops/105-implantacao-vm.md:11 · No cliente do banco da stack, sslmode=require já verifica a cadeia e o nome (alias de verify-full); com CA privada a conexão falha e o compose não leva CA nem NODE_EXTRA_CA_CERTS. Pôr o volume da CA e a variável no compose e dizer que nunca se baixa o sslmode.
- A4 (recomendado) docs/devops/105-implantacao-vm.md:23 · A7 do parecer anterior fecha em parte: falta pedir que, após restaurar backup, a eliminação a pedido (cfg_pessoa_eliminada) seja reaplicada antes de reabrir o painel, e retenção alinhada a ela.
- A5 (recomendado) docs/devops/105-implantacao-vm.md:1 · A3 e A4 do parecer anterior seguem abertos: pedir ao Acelerato SELECT só em ACELERATO_CHAMADOS (por coluna da allow-list quando possível) e, no BusinessMap, conta de serviço só leitura restrita aos quadros, com rotação, no lugar da chave pessoal do dono.
- A6 (recomendado) deploy/systemd/metricas-coleta-businessmap.service:11 · EnvironmentFile opcional (-): sem host.env as três coletas sobem o Compose de desenvolvimento (banco local, senhas padrão). Tornar obrigatório ou fixar COMPOSE_FILE na unidade, para falhar fechado.

## Sondas
- S1 · git merge-tree --write-tree --name-only origin/develop efe4fb86 · espera: sem conflito · obtido: CONFLICT (add/add) docs/devops/105-implantacao-vm.md e CONFLICT (content) CHANGELOG.md
- S2 · git show origin/develop:deploy/sql/00_papeis_e_banco.sql (linhas 5 e 12-14) · espera: senhas por getenv e três papéis NOLOGIN · obtido: senhas por -v pwd_x=... e dspd_webhook, dspd_automacao, dspd_pesquisa com LOGIN PASSWORD

## Detalhe dos achados
**Conferência A1 a A8 do parecer anterior.**
- A1 (TLS): fechado. As cinco URLs levam `sslmode=${DB_SSLMODE:-require}` (`docker-compose.prod.yml:15,21,22,40,56`); conferi com `docker compose config` e valores fictícios: as cinco saem com `sslmode=require`. Na versão do cliente do banco travada no lockfile, `require` é tratado como `verify-full` (verifica cadeia e nome), o que é mais forte do que o documento diz; ver A3 deste parecer.
- A2 (sem banco local nem senha padrão): fechado. Sem serviço postgres; `${VAR:?}` em `DB_HOST` e nos cinco `DSPD_PWD_*`; `docker compose config -q` sem variáveis falha com "defina DSPD_PWD_COLETOR". Portas só em `127.0.0.1` (`:26`, `:66`), conferido no config renderizado.
- A3 (SELECT nomeado no Acelerato) e A4 (conta de serviço do BusinessMap): abertos, ver A5 deste parecer. O documento da branch não trata o item 11 e o da develop segue como estava.
- A5 (senha fora da linha de comando): fechado em `papeis-producao.sql:5-9` por `\getenv` (variável não definida deixa a interpolação literal e o `ON_ERROR_STOP` aborta: falha fechada); a parte do log do servidor segue aberta (A2 deste parecer); e o roteiro da develop continua com `-v` (A1 deste parecer).
- A6 (NOLOGIN): fechado em `papeis-producao.sql:18-20`, sem CONNECT a eles (`:26`); aberto na develop (A1).
- A7 (backup): em parte (`105-implantacao-vm.md:23` pede cifrado, acesso restrito, retenção e restauração testada); falta a reaplicação da eliminação (A4).
- A8 (grupo docker): fechado (`105-implantacao-vm.md:§4`): só o administrador e um substituto nomeado, contas de serviço fora, revisão a cada release. As unidades rodam como root (sem `User=`), sem conta de serviço no grupo.

**A1 (bloqueante).** Evidência: S1 e S2; documento da develop, item 4 da tabela e passo 1 da seção do DBA (cita `00_papeis_e_banco.sql` e `-v pwd_...`); gerador `scripts/gerar-sql-migracoes.mjs:19-20,35,39` (develop). Caminho: o DBA segue o documento integrado, passa oito senhas na linha de comando (histórico e lista de processos da máquina do DBA, legíveis por outro usuário dela) e cria três papéis com LOGIN e senha que ninguém usa nem gira; quem obtiver uma delas entra no banco com os GRANTs daquele papel. Critério mudou: A5 e A6 eram recomendações para antes de a VM receber dado real; esta entrega é a configuração de produção e declara fechá-las, e o estado integrado não as fecha (defeito provado por S1 e S2). Severidade: média. Correção mínima: rebase em `origin/develop`; um único `docs/devops/105-implantacao-vm.md` (o da develop com as seções novas desta branch, sem citar `-v`); o gerador emite `00_papeis_e_banco.sql` com `\getenv` para os cinco papéis de login e `NOLOGIN` sem senha para `dspd_webhook`, `dspd_automacao` e `dspd_pesquisa`, CONNECT só aos cinco (`dspd_migrador`, `dspd_coletor`, `dspd_api`, `dspd_ref`, `dspd_api_apontamento`), e `papeis-producao.sql` sai (ou vira o gerado, nunca os dois). O consolidado `deploy/sql/` precisa continuar regenerável (`OK: runner e SQL gerado produzem o mesmo esquema`). Esforço P. Dono: `devops-engineer`.

**A2.** Severidade baixa (o log do servidor é da empresa, acesso do DBA). Correção: `SET log_statement = 'none';` no topo da sessão (o DBA é superusuário ou tem CREATEROLE; se não puder, `\password <papel>` interativo após criar sem senha). Esforço P. Dono: `devops-engineer`.

**A3.** Severidade baixa: a falha é fechada (não conecta), o risco é o operador "consertar" com `DB_SSLMODE=disable` ou `no-verify`. Correção: no compose, `NODE_EXTRA_CA_CERTS: ${DB_CA_ARQUIVO:-}` e volume somente leitura do PEM em `migrate`, `api`, `worker` e `coleta`; no documento, que `require` já verifica o certificado e que o valor mínimo aceito é `require`. Esforço P. Dono: `devops-engineer`.

**A4.** Severidade baixa (LGPD: restaurar backup antigo traria de volta `pessoa_ref` e nome já eliminados). Correção: uma frase no item 3 do pedido ao DBA e no runbook de restauração. Esforço P. Dono: `devops-engineer`.

**A5.** Severidade baixa (menor privilégio em sistemas de terceiros). Correção: no item 11, (a) conta de serviço só leitura do BusinessMap limitada a `BUSINESSMAP_QUADROS_IDS`, rotação combinada; (b) SELECT só em `ACELERATO_CHAMADOS` (`server/src/modulos/acelerato/sql.ts:23`). Esforço P. Dono: `devops-engineer`.

**A6.** Severidade baixa (o documento já manda conferir antes de ligar os timers; o Compose de desenvolvimento só expõe o banco em 127.0.0.1). Correção: `EnvironmentFile=/etc/metricas-dspd/host.env` sem `-` nas três unidades de coleta, ou `Environment=COMPOSE_FILE=docker-compose.prod.yml` nelas. Esforço P. Dono: `devops-engineer`.

**Sem achado.** Nenhum segredo nos arquivos do diff (busca por padrão de texto): só nomes de variável e `/etc/metricas-dspd/*.env` com 600. `APONTAMENTO_NOMES` fixo em `0` (`docker-compose.prod.yml:23`). A coleta é o único serviço com `COLETA_ENV_FILE` e o volume de segredos somente leitura; `environment` prevalece sobre `env_file`, então o `coleta.env` não troca as URLs do banco. Senha com `@`, `/` ou `#` quebra a URL (não há codificação): informativo, o documento pode pedir senhas só com caracteres seguros para URL.

## Riscos aceitos e ferramentas
Nenhum risco aceito. Suíte: sem PR, a suíte inteira fica para o CI do PR; este parecer não afirma CI verde e o brief não cita PQ do autor; as provas executadas aqui foram `docker compose config` (com e sem variáveis) e `git merge-tree` contra a develop. Varredura de segredos, de dependências, SAST e de imagem: ferramentas fora do PATH (lacuna); a busca por segredos foi por padrão de texto.
