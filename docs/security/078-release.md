---
tipo: revisao-seguranca
contrato: 1
pedido: 078-release-noite-2026-11-07
branch: docs/078-release-b
commit: ace67959d5560fb3563cf3230e11776e00506a3c
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-10
---
# Review de segurança da release: develop (ace67959) contra homolog (pedido 078, E1.3, volta)

Revisão estática do diff `origin/homolog...ace67959` (PRs 238 a 285): coletor do Acelerato, ref-sync, projetor e derivador de bloqueio do BusinessMap, migração 0035, GRANT, scripts, pre-push, dependências e, nesta volta, o que entrou depois do parecer anterior (commit 4388083c): PR 281 (Forge 0.45.2), 283 (categoria do erro no ref-sync do apontamento), 284 (comando da demo com dado real) e 285 (tendência da sustentação). Nada foi executado contra base real nem lido de `.env*`. A release é um agregado de lotes que já tiveram parecer próprio (069 L9-c, 073, 075, 081, 083, 085, 087); aqui se confere a soma e o delta até a ponta.

## Gatilhos
Coletor do Acelerato (dado de pessoa na fronteira), migração e views, projeção de bloqueio, pre-push e scripts da catraca, e o comando da demo que lê o `.env` do dono e usa credenciais em linha de comando.

## Resultado por pergunta
1. **Credencial no código:** nenhuma. Só uma constante de teste fictícia na varredura anterior; o delta novo lê tudo do ambiente (`.env` do dono, só por `source`), sem valor versionado.
2. **Acelerato só por leitura e allow-list:** mantido. O delta desde 4388083c não toca `server/src` além de `entradas/ref-sync-apontamento.ts`; a allow-list, o `strictObject` e as consultas `SELECT` da análise anterior seguem intactos. Nome, e-mail, `usuarioKey`, descrição e título não passam.
3. **Comando da demo `scripts/demo-dado-real.sh` (PR 284):** lê o `.env` só por `grep -Eq` de nomes (imprime só nomes faltantes), faz `source` do arquivo do próprio dono (mesmo padrão de `db.sh` e `dev.sh`, sem fronteira nova), sem xtrace; o `case` aceita só `--`, `--reconhecer-mudanca` e recusa o resto com `exit 2` (nada do argumento é expandido ou executado). Só chama comandos já somente-leitura nas fontes (`bm:coleta`, `coleta.sh ac`, `bm:apontamento`). A senha do `dspd_coletor` vai pelo ambiente e o argv do `docker compose exec` leva só `-e PGPASSWORD`. A consulta de prova devolve três contagens e um `min(coletado_em)`, sem pessoa nem texto livre. Erros saem como etapa, categoria e código, sem texto de driver. `shellcheck -S warning` nos dois scripts: sem avisos. Parecer próprio 087 aprovado; conferido sem divergência.
4. **Categoria do erro no ref-sync do apontamento (PR 283):** a falha imprime `ErroDicionario.message` (texto próprio, sem valor de configuração) ou só `categoriaDoErro(e)` (categoria e nomes de variáveis, nunca valor, URL nem texto do banco). Reduz o vazamento em stderr em relação ao texto anterior; sem caminho de ataque novo.
5. **Tendência da sustentação (PR 285):** acrescenta `TENDENCIA_SUST` ao conjunto de métricas de origem real e uma versão de critério (T2.6, com data e id, marcada nos gráficos). Sem rota, consulta, coluna ou GRANT novos; o teste prova que o BusinessMap não altera o resultado (fontes separadas) e que prioridade com menos de 20 apuráveis sai `insuficiente` (regra de não publicar abaixo de 20).
6. **API (`dspd_api`) e GRANT por coluna:** `server/migrations`, Compose e `.github/` não mudaram no delta; a análise da 0035 (guarda, views `security_invoker`, sem coluna de pessoa, sem GRANT novo) segue válida.
7. **Projeções de bloqueio e fontes separadas:** sem mudança desde o parecer anterior (6 chaves do payload, motivo só dígitos, sem DELETE, sem cruzamento BusinessMap e Acelerato).
8. **Dependências e Forge 0.45.2 (PR 281):** o delta muda só `.forge/versao` (0.44.2 para 0.45.2, agora coerente com o pedido 084), `package.json` da raiz (scripts `demo:dado-real` e entrada na `test:trava`) e documentação; nenhum pacote novo nem alteração de lockfile no delta. `osv-scanner` não está no PATH: auditoria fica com o CI.
9. **CI e pre-push:** `.github/` e `.githooks/` sem mudança no delta; a recomendação A1 do parecer anterior permanece.

## Achados
- A1 (recomendado) .githooks/pre-push:13 · O pre-push só vê o que mudou contra `origin/develop`; defeito de lint ou tipo fora do diff passa até o CI, que roda o conjunto inteiro. Sem caminho de ataque realista; manter a CI inteira como portão.
- A2 (recomendado) .forge/versao:1 · RESOLVIDO: o marcador agora é 0.45.2, o valor do pedido 084; nada a fazer.

## Riscos aceitos
Nenhum; A1 é recomendação e não bloqueia. Parecer `aprovado`.

## Lacunas de ferramenta
`gitleaks`, `osv-scanner`, `semgrep`, `zizmor` e `actionlint` não estão no PATH (só `shellcheck`, rodado nos dois scripts da demo): varredura de segredos no histórico e auditoria de dependências ficam com o CI. Os testes dos arquivos tocados no delta não foram rodados aqui; a suíte completa é do QA e do CI.
