---
tipo: revisao-seguranca
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-vm-criterios-ac
commit: e0b84358cc250856eec48476842b47bb375a2d30
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-16
---
# Review de segurança: 105-melhorias-15-11, vm:preparar (K-396, E7.407)

Escopo: o delta `2ca29f8b..e0b84358` (comando `vm:preparar`, entrada e módulo, teste, serviço `migrate` do `docker-compose.prod.yml`, tratamento de erro do `ac:criterios`, roteiros). Pontos pedidos: as credenciais novas no compose (`PG_REF_URL`, papel `dspd_ref`), a leitura do `.env` e se algo imprime URL ou senha.

Resultado: **aprovado**, com três recomendações que não bloqueiam.

## Gatilhos
Credenciais e configuração (segredos em variável de ambiente, URL de banco) e pipeline de implantação (serviço que migra a base de produção na subida). R-SEGURANCA.

## Achados
- A1 (recomendado) server/src/entradas/vm-preparar.ts:30 · No serviço migrate o compose define DSPD_BACKUP_CONFIRMADO vazio, e o operador ?? não cai para DSPD_BACKUP_DIR: a via do arquivo ultimo-backup-ok fica morta no Docker, embora a recusa a ofereça. Falha fechada (recusa), sem risco; use || e ajuste o texto.
- A2 (recomendado) server/src/entradas/migrar.ts:6 · O passo migrar não tem catch: falha de migração sai como exceção não tratada, com pilha e texto do erro do banco (host e porta vistos na sonda; senha não). O roteiro promete só a categoria. Envolver em try/catch com categoriaDoErro, como os irmãos.
- A3 (recomendado) server/src/entradas/vm-preparar.ts:50 · Os filhos herdam o ambiente inteiro (env: process.env); à mão, com o .env da raiz, recebem a apikey do BusinessMap e o token do Acelerato sem precisar. Mínimo privilégio: passar só PG_*, DSPD_SCHEMA_PREFIXO, NODE_EXTRA_CA_CERTS e o necessário.

## Sondas

## Detalhe dos achados

**O que foi conferido e está correto**
- Credencial nova no compose: `docker-compose.prod.yml:27` monta `PG_REF_URL` com o papel `dspd_ref`, senha só por interpolação de `DSPD_PWD_REF` (obrigatória, `:?`), `sslmode=verify-full` e a CA montada somente leitura. É a mesma forma já usada no serviço da linha 85; nenhum valor literal no arquivo. Os passos de referência (`ref-sync-calendario`, `ref-sync-businessmap`, `ref-sync-ac`) usam `carregarConfigRef`/`PG_REF_URL`, então a separação de papéis se mantém: `dspd_ref` só para as tabelas `ref_`, migrador só para migração, reprojeções e critérios. O contêiner `migrate` já tinha o migrador (mais forte); somar o `dspd_ref` não amplia privilégio.
- Leitura do `.env`: `vm-preparar.ts:21` carrega só `<raiz>/.env` se existir; a imagem não o contém (`.dockerignore` exclui `.env` e `.env.*`), então no Docker vale só o ambiente do compose. Conferido no runtime da stack: variável já no ambiente vence o arquivo, inclusive quando vazia; nenhum caminho vem de entrada externa.
- Nada imprime URL nem senha no caminho novo: as mensagens do `vm:preparar` trazem passo, contagens, nomes de migração e categoria do erro (`categoriaDoErro` devolve só categoria e nomes de variável). Sonda local com URLs falsas apontando para porta fechada: saída `migrar recusado: conexão` e `FALHOU no passo "migrar"`, zero ocorrências das senhas-sonda e de `postgres://`. O `ac:criterios` ganhou o mesmo tratamento.
- Roteiro: manda `docker compose ... config -q` (sem `-q` o comando imprimiria as senhas interpoladas); o `compose.env` é root 600.
- Trava de backup: é atestação do operador, não controle contra atacante (quem roda o `up` já é root na VM); falha fechada quando ausente ou de outro dia. Adequado ao propósito (proteger contra erro, não contra abuso).

**A1** · evidência `server/src/entradas/vm-preparar.ts:30`, `docker-compose.prod.yml:29`, mensagem em `server/src/plataforma/db/vm-preparar.ts:50` · caminho de ataque: nenhum (falha fechada); o efeito é operacional, a sugestão da mensagem não funciona no Docker · severidade: informativa · correção mínima: trocar `??` por `||` (string vazia cai para o arquivo) ou tirar a menção a `DSPD_BACKUP_DIR` da mensagem quando no Docker; o `DSPD_BACKUP_DIR` também não é passado ao serviço · esforço P · dono: node-backend.

**A2** · evidência `server/src/entradas/migrar.ts:5-7` (sem try/catch), contrato em `docs/devops/105-implantacao-vm.md:94` · caminho de ataque: quem lê o log do serviço `migrate` (root ou grupo docker na VM, já com acesso ao `compose.env`) vê o texto do erro do banco, que em violação de restrição pode trazer valor de linha; não expõe senha (sonda: a URL com senha-sonda não aparece, só `127.0.0.1:1`). Pré-existente, mas agora no caminho da subida e contra o que o roteiro promete · severidade: baixa · correção mínima: `try { ... } catch (e) { process.stderr.write(\`migrar falhou: ${categoriaDoErro(e)}\n\`); process.exitCode = 1 }` e manter o log de progresso das migrações · esforço P · dono: node-backend.

**A3** · evidência `server/src/entradas/vm-preparar.ts:50` · caminho de ataque: nenhum direto (os passos não chamam API externa e não imprimem o ambiente); é redução de superfície, para que um passo futuro com log de ambiente não leve a apikey e o token · severidade: informativa · correção mínima: montar o `env` do filho com a lista: `PATH`, `HOME`, `NODE_EXTRA_CA_CERTS`, `PG_MIGRADOR_URL`, `PG_REF_URL`, `PG_COLETOR_URL`, `DSPD_PWD_REF`, `DSPD_SCHEMA_PREFIXO`, `TZ`, `LOG_LEVEL`, mais as que os passos lerem (conferir `config.ts`) · esforço P · dono: node-backend.

**Informativo, sem achado:** a senha entra crua na URL do compose (caractere como `@`, `/`, `#` quebra a URL; padrão já existente para todos os papéis) e fica visível em `docker inspect` para quem administra o Docker na VM, que já lê o `compose.env`. Efeito colateral declarado pelo autor (cada subida soma linhas em `ctl_coleta` e mexe na última carga do Acelerato) é de integridade operacional, sem caminho de ataque.

## Riscos aceitos e ferramentas
Sem risco aceito. Teste novo `server/tests/vm-preparar.test.ts` rodado localmente: 11 de 11 passaram. Suíte inteira: sem PR nesta branch, fica para o CI do PR; este parecer não afirma CI verde e se apoia no PQ do autor. Sondas locais e passivas (porta fechada em 127.0.0.1, senhas fictícias). Ferramentas: o varredor de segredos não está no PATH (lacuna; roda no CI); revisão manual do delta.
