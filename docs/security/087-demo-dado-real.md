---
tipo: revisao-seguranca
contrato: 1
pedido: 087-paineis-dado-real-e-demo
branch: feature/087-demo-dado-real
commit: 9fc2ac6a9cb429a1cdadbec8e3fc074c8d1aeeaa
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-10
---
# Review de segurança: 087-demo-dado-real (K-258, E4.4), volta incremental

Revisão estática do comando `scripts/demo-dado-real.sh` (atalho `demo:dado-real`) e do teste `scripts/demo-dado-real.test.sh` no head 9fc2ac6a, depois da correção do BUG-087-1 (A1 do QA: o pnpm repassa o `--` ao script; commits d98db2b2 e 9fc2ac6a). Delta desde a rodada anterior: uma linha no `case` do script (`--) ;;`) e quatro asserções no teste; o resto é documentação. `server/`, `.github/`, Compose e migrações não mudaram. Nada foi executado contra base real nem lido de `.env`.

## Gatilhos
Credenciais lidas do `.env` e usadas em linha de comando; execução contra base real com dado de pessoa na fonte (R-SEGURANCA).

## Achados
- A1 (recomendado) scripts/demo-dado-real.sh:114 · RESOLVIDO (rodada anterior): a senha vai só pelo ambiente e o argv do `docker compose exec` leva só `-e PGPASSWORD`; o teste prova a ausência do valor no argv.
- A2 (recomendado) docs/devops/087-demo-dado-real.md:18 · RESOLVIDO (rodada anterior): a frase sobre a senha fora do `ps` foi corrigida, com a ressalva do ambiente do processo cliente.

## Sondas

## Detalhe
**Delta do BUG-087-1 (scripts/demo-dado-real.sh:15).** O ramo `--) ;;` só descarta o `--` isolado; nenhum valor é atribuído, nada é expandido nem executado a partir do argumento, e o `*)` continua barrando qualquer outro argumento com `exit 2`. Não abre caminho de injeção nem muda o que o script faz com credencial ou fonte. O teste novo prova `-- --outra` com rc 2 e `-- --reconhecer-mudanca` aceito com rc 0. `bash -n` ok e `scripts/demo-dado-real.test.sh` rodado: "tudo ok".

**Conferido sem achado (sem mudança nestes pontos):**
- `.env` lido sem imprimir valor: só `grep -Eq` e nomes faltantes impressos (linhas 46 e 49); sem xtrace; mensagens de erro só com etapa, categoria, dica e código.
- `source` do `.env` (linha 54): mesmo padrão de `db.sh`/`dev.sh`; arquivo do próprio dono, sem fronteira nova. A senha do `dspd_coletor` vai só pelo ambiente (`PGPASSWORD=...` antes da função, linha 114) e o argv do docker leva só `-e PGPASSWORD`; fica em `/proc/<pid>/environ`, legível só pelo mesmo usuário.
- Fontes só por leitura: o script só chama `bm:coleta`, `coleta.sh ac` e `bm:apontamento`; allow-list do Acelerato e GRANT por coluna intactos (`server/` sem mudança).
- Consulta de prova (linhas 110 a 115): três contagens e um `min(coletado_em)`, sem pessoa nem texto livre; o teste barra nome, e-mail, título e descrição.
- Portas do Compose só em `127.0.0.1`; sem segredo em `ARG`, imagem ou arquivo versionado.

## Riscos aceitos e ferramentas
Sem riscos aceitos. Ferramentas: `bash -n` e o teste dos arquivos tocados. `gitleaks`, `shellcheck` e `osv-scanner` não rodados por mim (sem dependência nova); lacuna registrada.
