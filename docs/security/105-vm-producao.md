---
tipo: revisao-seguranca
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-vm-producao
commit: 9c3c2ebae42ece652e02bbbca92b73cbe99f0353
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-16
---
# Review de segurança: configuração de produção da VM (105, E7.283)

Escopo: revalidação por delta `efe4fb86..9c3c2eba` (E7.276), sem o que veio da develop (`forge-check parecer delta`): `docker-compose.prod.yml`, `deploy/sql/00_papeis_e_banco.sql` (gerado), `scripts/gerar-sql-migracoes.mjs` e `.sh`, as quatro unidades `deploy/systemd/*.service` e o timer, `.env.example`, a remoção de `deploy/sql/papeis-producao.sql` e o `docs/devops/105-implantacao-vm.md` fundido. Conferência contra A1 a A6 do parecer anterior (commit 255d0250) e A1 a A8 de `docs/security/105-implantacao-vm.md`. Revisão estática; nada executado contra banco real nem contra a VM.

**Veredito: aprovado.** A branch integra com a develop sem conflito, há um roteiro de papéis só (o gerado), sem senha por `-v` e com os três papéis sem uso em NOLOGIN; TLS ao banco em `verify-full` fixo com a CA montada; as unidades falham fechadas. Os seis achados do parecer anterior fecham.

## Gatilhos
`R-SEGURANCA`: credenciais e papéis do banco, TLS ao banco, infraestrutura e acessos (grupo do motor de contêineres), dado pessoal em backup (LGPD).

## Achados
- A1 (recomendado) docker/postgres/init/01-databases-papeis.sh:7 · Fora do caminho de produção: o init do banco local (desenvolvimento e homologação) e reparar-papeis.sh:15 ainda passam senhas por -v e criam webhook, automação e pesquisa com LOGIN. Só dado fictício; alinhar ao gerado (\getenv, NOLOGIN) quando mexerem no arquivo.

## Detalhe dos achados
**Conferência do parecer anterior (255d0250).**
- A1 (bloqueante, integração): fechado. `git merge-tree` de `origin/develop` (655029ad) com 9c3c2eba sem conflito; `papeis-producao.sql` removido; o gerador (`scripts/gerar-sql-migracoes.mjs:19-23,36-58`) emite `00_papeis_e_banco.sql` com `\getenv` para os cinco papéis de login (`dspd_migrador`, `dspd_coletor`, `dspd_api`, `dspd_ref`, `dspd_api_apontamento`), `NOLOGIN` sem senha para `dspd_webhook`, `dspd_automacao`, `dspd_pesquisa`, e CONNECT só aos cinco (`deploy/sql/00_papeis_e_banco.sql:10-29`). O `.sh` aplica o próprio SQL gerado no descartável (`gerar-sql-migracoes.sh:24`), então gerador e arquivo não divergem sem o CI acusar. Nenhuma ocorrência de `-v pwd`, `papeis-producao` nem `DB_SSLMODE` fora de docs de parecer e do init local (A1 acima). Variável ausente deixa `:'pwd_x'` literal e o `ON_ERROR_STOP` aborta antes de criar papel: falha fechada.
- A2 (senha no log do servidor): fechado. `SET log_statement = 'none'` antes dos `CREATE ROLE` (`00_papeis_e_banco.sql:15`); o documento (`105-implantacao-vm.md:191`) dá a alternativa `\password` se o DBA não puder o `SET` (e o `ON_ERROR_STOP` para o script antes de qualquer `CREATE ROLE`).
- A3 (TLS com CA privada): fechado. As seis URLs com `sslmode=verify-full` fixo (o `DB_SSLMODE` saiu, não há como baixar por variável); `NODE_EXTRA_CA_CERTS` e o PEM `${DB_CA_ARQUIVO:?}` somente leitura em `migrate`, `api`, `worker` e `coleta`. Conferido em `pg-connection-string@2.14.1` (lockfile): `verify-full` usa o repositório padrão de CAs do Node, que inclui `NODE_EXTRA_CA_CERTS`. Documento (`:210`) diz que nunca se baixa o modo.
- A4 (eliminação após restaurar backup): fechado (`105-implantacao-vm.md:163`).
- A5 (menor privilégio no BusinessMap e no Acelerato): fechado (`105-implantacao-vm.md:168`: conta de serviço só leitura limitada a `BUSINESSMAP_QUADROS_IDS` com rotação; SELECT só em `ACELERATO_CHAMADOS`, por coluna quando possível).
- A6 (falha fechada nas unidades): fechado. As quatro unidades (`metricas-coleta-businessmap`, `metricas-coleta-acelerato`, `metricas-coleta-acelerato-releitura`, `metricas-referencias`) com `EnvironmentFile=` obrigatório e `COMPOSE_FILE=docker-compose.prod.yml` e `COMPOSE_ENV_FILES` fixos: sem os arquivos a unidade não sobe e nunca cai no Compose de desenvolvimento.
- Informativo do parecer anterior (senha com caractere de URL): tratado (`105-implantacao-vm.md:15`, `.env.example`: só `openssl rand -hex 32`).

**Conferência A1 a A8 de `docs/security/105-implantacao-vm.md`:** A1 (TLS), A2 (sem banco local nem senha padrão), A3 e A4 (acessos de terceiros), A5 (senha fora da linha de comando), A6 (NOLOGIN), A7 (backup cifrado, restrito, retenção e reaplicação da eliminação) e A8 (grupo `docker` restrito, `:212`) fechados no estado integrado.

**Novo no delta, sem achado.** `metricas-referencias.service` roda os quatro `ref-sync-*` no contêiner `coleta`, que recebe o `coleta.env` inteiro; a `PG_REF_URL` vem do `environment` do Compose (prevalece sobre `env_file`), papel `dspd_ref`; a unidade avisa para nunca pôr a URL do migrador ou do coletor no `coleta.env`. `PESSOA_ELIMINADA_SAL` só como nome vazio no `.env.example`. Nenhum segredo nos arquivos do delta (busca por padrão de texto).

**A1.** Evidência: `docker/postgres/init/01-databases-papeis.sh:7-9`, `docker/postgres/reparar-papeis.sh:15`. Caminho: só na máquina do desenvolvedor ou na homologação local (portas em 127.0.0.1, dado fictício); quem lê a lista de processos do contêiner já tem o banco. Severidade: informativa. Correção mínima: reaproveitar o padrão `\getenv` e NOLOGIN do gerado. Esforço P. Dono: `devops-engineer`.

**Inconsistências de texto (não segurança, ao `tech-lead`):** `105-implantacao-vm.md:55` diz que `PESSOA_ELIMINADA_SAL` não está em nenhum `.env.example` e `:145` mantém a lacuna do Apontamento; o `.env.example` desta branch já o traz.

## Sondas
- S1 · git merge-tree --write-tree --name-only origin/develop 9c3c2eba · espera: sem conflito · obtido: só o id da árvore, sem CONFLICT
- S2 · docker compose -f docker-compose.prod.yml config -q sem variáveis · espera: falha · obtido: required variable DSPD_PWD_MIGRADOR is missing a value: defina DSPD_PWD_MIGRADOR
- S3 · o mesmo com valores fictícios, DB_CA_ARQUIVO e DB_SSLMODE=disable, --profile coleta · espera: verify-full em todas, CA só leitura, portas em 127.0.0.1 · obtido: seis URLs sslmode=verify-full (DB_SSLMODE ignorado), ca.pem read_only nos quatro serviços, 127.0.0.1:3000 e 127.0.0.1:8080

## Riscos aceitos e ferramentas
Nenhum risco aceito. Suíte: sem PR, a suíte inteira fica para o CI; o pronto local do autor não rodou (fila). CI do head 9c3c2eba: ver o relatório ao Jarvis (este parecer não afirma CI verde). Varredura de segredos, de dependências, SAST e de imagem: ferramentas fora do PATH (lacuna); a busca por segredos foi por padrão de texto.
