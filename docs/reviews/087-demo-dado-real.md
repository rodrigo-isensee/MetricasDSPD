---
tipo: review
contrato: 1
pedido: 087-paineis-dado-real-e-demo
branch: feature/087-demo-dado-real
commit: 9fc2ac6a9cb429a1cdadbec8e3fc074c8d1aeeaa
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-10
---
# Review: comando da demo com dado real (087, E4.2, K-258)

## Parecer
Aprovado. Revisado o diff `4388083c..9fc2ac6a`: `scripts/demo-dado-real.sh`, `scripts/demo-dado-real.test.sh`, atalho `demo:dado-real` e o teste ligado ao `test:trava` no `package.json`, `docs/engineering/demo-dado-real.md` e o parecer de devops. Esta volta incremental (`dc7e2756..9fc2ac6a`) corrige o BUG-087-1 (A1 do QA): o `--` isolado que o pnpm repassa ao script era recusado. O código de produto não mudou.

## Delta lido (`dc7e2756..9fc2ac6a`)
- `scripts/demo-dado-real.sh`: uma linha nova no `case`, `--) ;;`, que ignora o `--` isolado; `--reconhecer-mudanca` e o ramo `*)` (uso, rc 2) ficam como estavam.
- `scripts/demo-dado-real.test.sh`: três verificações novas, `-- --outra` (rc 2), `-- --reconhecer-mudanca` (rc 0) e a flag reconhecida na saída.
- `docs/devops/087-demo-dado-real.md`: parecer revalidado no novo commit; `docs/qa/`: parecer do QA, que não é meu.

## Contra o E4 do pedido
- Sobe o ambiente (`docker compose up -d --wait postgres`), migra (`scripts/db.sh migrate`), faz a carga inicial do BusinessMap (`bm:coleta carga-inicial`), do Acelerato (`scripts/coleta.sh ac`) e do apontamento (`bm:apontamento carga-inicial`), projeta (`bm:projetar`) e imprime a consulta de prova do 075. Ordem e parada no primeiro erro cobertas pelo teste.
- A consulta de prova só conta linhas e pega `min(coletado_em)`: sem nome, e-mail nem texto.

## Contra as regras invioláveis
- Credenciais só no `.env`: o script confere só os nomes, nunca imprime valor; a senha do `dspd_coletor` vai pelo ambiente do comando e o argv do `docker` leva só `-e PGPASSWORD`.
- Acelerato só por GET e com a allow-list: reusa `coleta.sh ac`, nenhum cliente novo. BusinessMap e Acelerato em etapas separadas, sem cálculo novo, sem sobrescrever histórico.

## Verificação
- `bash scripts/demo-dado-real.test.sh` (rodado nesta revisão, no commit 9fc2ac6a): todos `ok`, "tudo ok", incluindo os três casos novos do `--`.
- `shellcheck` nos dois scripts: limpo.
- Guarda do diff: `--) ;;` é ramo de aceitação; o ramo de falha vizinho (`-- --outra` devolve rc 2) tem teste de comportamento, e a aceitação tem o teste de `-- --reconhecer-mudanca`.
- Tamanho: 119 + 65 linhas de script e teste no PR inteiro (orientação 150 por PR, contando a soma 184); o excesso é de script novo com teste junto, um comportamento só; o corpo do PR registra `teto: excedido`.
- Não rodado contra base real nem Docker (brief proíbe); o que só aparece na primeira execução do dono está no parecer do QA.

## Achados
- A1 (resolvido) scripts/demo-dado-real.sh:113 · senha fora do argv do `docker`; corrigido em 93844c45.
- A2 (resolvido) docs/devops/087-demo-dado-real.md · frase sobre `ps` corrigida, com a ressalva do ambiente do processo, em 699ad94d.
- A3 (resolvido) scripts/demo-dado-real.sh:15 · o `--` repassado pelo pnpm era recusado (BUG-087-1, A1 do QA); corrigido em d98db2b2, com teste.

## Itens do Entregar
Todos com commit: script, teste, atalho e documentação em e635f429; correções em 93844c45, 699ad94d e d98db2b2.
