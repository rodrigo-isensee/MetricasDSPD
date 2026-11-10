---
tipo: revisao-seguranca
contrato: 1
pedido: 087-paineis-dado-real-e-demo
branch: feature/087-demo-dado-real
commit: 699ad94dd8efa5cc39362ae031b1dec978c196c0
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-10
---
# Review de segurança: 087-demo-dado-real (K-258, E4.4), volta incremental

Revisão estática do comando `scripts/demo-dado-real.sh` (atalho `demo:dado-real`) e do teste `scripts/demo-dado-real.test.sh`, agora no head 699ad94d, depois da correção A1/A2 (commits 93844c45 e 699ad94d). O diff de código continua só em `scripts/` e `package.json`; `server/`, `.github/`, Compose e migrações não mudaram. Nada foi executado contra base real nem lido de `.env`.

## Gatilhos
Credenciais lidas do `.env` e usadas em linha de comando; execução contra base real com dado de pessoa na fonte (R-SEGURANCA).

## Achados
- A1 (recomendado) scripts/demo-dado-real.sh:114 · RESOLVIDO: a senha vai só pelo ambiente (`PGPASSWORD="${DSPD_PWD_COLETOR}" executar ...`) e o argv do `docker compose exec` leva só `-e PGPASSWORD` (linha 115); o teste novo (`.test.sh:51`) prova a ausência do valor no argv.
- A2 (recomendado) docs/devops/087-demo-dado-real.md:18 · RESOLVIDO: a frase sobre a senha fora do `ps` foi corrigida e traz a ressalva do ambiente do processo cliente (legível só pelo mesmo usuário).

## Sondas

## Detalhe
**Verificação da correção.** A atribuição antes de função em bash vale como ambiente temporário e é exportada aos filhos durante a chamada; assim o cliente `docker` herda `PGPASSWORD` e repassa o valor ao `psql` (`-e NOME` sem valor copia do ambiente do cliente). O valor não entra em `/proc/<pid>/cmdline`; fica em `/proc/<pid>/environ`, legível só pelo mesmo usuário, aceitável na estação do dono. O repasse pelo Compose só se confirma na primeira execução do dono; se falhar, a etapa 10 acusa autenticação, sem vazamento. `bash -n` ok e `scripts/demo-dado-real.test.sh` rodado: "tudo ok".

**Conferido sem achado (mantido da rodada anterior, nada mudou nestes pontos):**
- `.env` lido sem imprimir valor: só `grep -Eq` e nomes faltantes impressos (linhas 46 e 49); sem xtrace; mensagens de erro só com etapa, categoria, dica e código.
- `source` do `.env` (linha 54): mesmo padrão de `db.sh`/`dev.sh`; arquivo do próprio dono, sem fronteira nova. URLs de conexão por variável de ambiente, não impressas.
- Fontes só por leitura: o script só chama `bm:coleta`, `coleta.sh ac` e `bm:apontamento`; allow-list do Acelerato e GRANT por coluna intactos (`server/` sem mudança).
- Consulta de prova (linhas 110 a 115): três contagens e um `min(coletado_em)`, sem pessoa nem texto livre; o teste barra nome, e-mail, título e descrição.
- Portas do Compose só em `127.0.0.1`; sem segredo em `ARG`, imagem ou arquivo versionado.

## Riscos aceitos e ferramentas
Sem riscos aceitos. Ferramentas: `bash -n` e o teste dos arquivos tocados. `gitleaks`, `shellcheck` e `osv-scanner` não rodados por mim (sem dependência nova); lacuna registrada.
