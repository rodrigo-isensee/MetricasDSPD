---
tipo: review
contrato: 1
pedido: 087-paineis-dado-real-e-demo
branch: feature/087-demo-dado-real
commit: 1e4a8ba8a55c0fa0d57dcc7844dee5e478695dd8
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-10
---
# Review: comando da demo com dado real (087, E4.2, K-258)

## Parecer
Aprovado. Revisado o diff `4388083c..1e4a8ba8`: `scripts/demo-dado-real.sh`, `scripts/demo-dado-real.test.sh`, atalho `demo:dado-real` e o teste ligado ao `test:trava` no `package.json`, `docs/engineering/demo-dado-real.md` e o parecer de devops. O código de produto não mudou.

## Contra o E4 do pedido
- Sobe o ambiente (`docker compose up -d --wait postgres`), migra (`scripts/db.sh migrate`, antes da API), faz a carga inicial do BusinessMap (`bm:coleta carga-inicial`), do Acelerato (`scripts/coleta.sh ac`) e do apontamento (`bm:apontamento carga-inicial`), projeta (`bm:projetar`) e imprime a consulta de prova do 075. Ordem e parada no primeiro erro cobertas pelo teste.
- A consulta de prova só conta linhas (`fato_bloqueio`, `evt_bloqueio` com `tipo = 'fim'`) e pega `min(coletado_em)` de `stg_card`: sem nome, e-mail nem texto. Colunas e tabelas conferidas nas migrações 0005 e 0006; o `dspd_coletor` tem SELECT nelas pelo `gerarGrants`.

## Contra as regras invioláveis
- Credenciais só no `.env`: o script confere só os nomes (`grep -Eq`), nunca imprime valor; o teste prova que valor não vai à tela.
- Acelerato só por GET e com a allow-list: o script não tem cliente próprio, reusa `coleta.sh ac`, que aplica a allow-list na fronteira. Nada de pessoa chega à saída.
- Carga incremental sem sobrescrever histórico: só reusa as cargas existentes; não apaga dado, sem `--force`.
- BusinessMap e Acelerato não se misturam: etapas separadas, nenhum cálculo novo.

## Verificação
- `bash scripts/demo-dado-real.test.sh`: 11 casos ok (rodado nesta revisão, docker e pnpm falsos).
- `shellcheck` nos dois scripts: limpo.
- Não rodado contra base real nem Docker (brief proíbe). A primeira execução do dono é o teste real.
- Guardas: as guardas do script (arquivo ausente, variável ausente, argumento inválido, falha de etapa) têm teste do ramo de falha; o script é shell de orquestração, sem mutante declarado, por não haver `tests/mutantes` neste projeto.

## Achados
- A1 (recomendado) scripts/demo-dado-real.sh:114 · `-e "PGPASSWORD=${DSPD_PWD_COLETOR}"` põe o valor na linha de comando do cliente `docker`, visível por `ps` na máquina do dono; o parecer de devops afirma o contrário. Troque por `-e PGPASSWORD` (só o nome) com `PGPASSWORD="$DSPD_PWD_COLETOR"` exportado no ambiente do comando. Risco baixo (estação de uso único), por isso não bloqueia; vale tratar junto do parecer de segurança.
- A2 (recomendado) docs/devops/087-demo-dado-real.md · a frase "ambiente do processo, fora da linha de comando visível por `ps`" fica incorreta enquanto o A1 existir; corrigir o texto ou o código.

## Itens do Entregar
Todos com commit: script, teste, atalho e documentação em e635f429; parecer de devops em 1e4a8ba8.
