---
tipo: revisao-seguranca
contrato: 1
pedido: 087-paineis-dado-real-e-demo
branch: feature/087-demo-dado-real
commit: 1e4a8ba8a55c0fa0d57dcc7844dee5e478695dd8
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-10
---
# Review de segurança: 087-demo-dado-real (K-258, E4.4)

Revisão estática do comando `scripts/demo-dado-real.sh` (atalho `demo:dado-real`) e do teste `scripts/demo-dado-real.test.sh`. O diff de código é só `scripts/` e `package.json`; nenhum arquivo de `server/`, `.github/`, Compose ou migração mudou. Nada foi executado contra base real nem lido de `.env`. Testes dos arquivos tocados: ver "Ferramentas".

## Gatilhos
Credenciais lidas do `.env` e usadas em linha de comando; execução contra base real com dado de pessoa na fonte (R-SEGURANCA).

## Achados
- A1 (recomendado) scripts/demo-dado-real.sh:114 · `-e "PGPASSWORD=${DSPD_PWD_COLETOR}"` põe a senha do papel coletor no argv do `docker compose exec`, visível em `ps` e `/proc/<pid>/cmdline` enquanto roda; o parecer de devops afirma o contrário. Passar o nome sem valor.

## Sondas

## Detalhe dos achados
**A1 (baixa, esforço P, dono devops-engineer).** Evidência: `scripts/demo-dado-real.sh:114`; a afirmação "fora da linha de comando visível por `ps`" em `docs/devops/087-demo-dado-real.md` não procede, porque `-e CHAVE=valor` é argumento do processo do cliente na máquina do dono. Caminho de ataque: outro usuário local da estação lendo `/proc` durante a etapa 10 (segundos); estação pessoal de um usuário só, e a senha é de um papel sem coluna de pessoa (`dspd_coletor`), por isso só recomendação. Correção mínima: `PGPASSWORD="${DSPD_PWD_COLETOR}" docker compose exec -T -e PGPASSWORD postgres psql ...` (o Compose repassa o valor do ambiente do cliente; confirmar na primeira execução) e corrigir a frase do parecer de devops. Não bloqueia a release.

**Conferido sem achado:**
- `.env` lido sem imprimir valor: a checagem é `grep -Eq` sobre o arquivo (linha 46) e só os nomes faltantes são impressos (linha 49); o teste (linhas 33 a 37 do `.test.sh`) prova que nenhum valor aparece. Não há `set -x`/xtrace no script nem em `coleta.sh`/`db.sh`. As mensagens de erro de `falhar` só trazem etapa, categoria, dica e código de saída; o texto de erro dos comandos reusados é o que eles já sanitizam, sem alteração neste diff.
- `source` do `.env` (linha 54, com `set -a`): executa o arquivo como shell, o mesmo padrão de `db.sh`/`dev.sh`/`coleta.sh`; o arquivo é do próprio dono, então não há fronteira de confiança nova. `DEMO_ENV_ARQUIVO` é variável do mesmo usuário (só teste), sem escalada. Todas as chaves ficam exportadas aos filhos (pnpm, docker), menos que o ideal (princípio do menor privilégio) mas sem vazamento: não há log de ambiente e o Compose só repassa o que o YAML declara.
- URLs de conexão (linhas 55 a 57) vão por variável de ambiente, não por argumento, e não são impressas.
- Rede: portas do Compose só em `127.0.0.1` (`docker-compose.yml:20,54,98`).
- Fontes só leitura e allow-list do Acelerato: o script só chama comandos existentes (`bm:coleta`, `coleta.sh ac`, `bm:apontamento`) sem tocar o código do coletor; a allow-list na fronteira e o GRANT por coluna seguem intactos porque `server/` não mudou. Nenhum verbo de escrita foi adicionado nas fontes.
- Consulta de prova (linhas 110 a 114): três contagens e um `min(coletado_em)`; sem nome, e-mail, id de usuário, título nem descrição; papel `dspd_coletor`; o teste (linha 50) barra esses termos. O `${PREFIXO}` vem do `.env` do próprio dono (mesmo usuário, sem entrada externa): informativo, sem achado.
- Sem segredo em `ARG`, imagem, arquivo versionado nem `package.json`; o teste usa só valores falsos.

## Riscos aceitos e ferramentas
Sem riscos aceitos. Ferramentas: `bash -n` (ok) e leitura do diff; rodei o teste `scripts/demo-dado-real.test.sh` ("tudo ok"), que é autocontido (docker e pnpm falsos, sem `.env`). `gitleaks`, `shellcheck` e `osv-scanner` não foram rodados por mim (não conferi o PATH nem há dependência nova); lacuna registrada. Nenhuma execução contra a base real: a primeira execução do dono é o teste real, e o dono devolve só a saída da etapa 10 (contagens).

Nota de rastreio: o `commit` deste parecer é o do brief (`1e4a8ba8`), que inclui o parecer de devops; o código revisado é o de `e635f429`, e as diferenças entre os dois são só `docs/`.
