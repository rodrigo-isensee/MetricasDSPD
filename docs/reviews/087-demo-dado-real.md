---
tipo: review
contrato: 1
pedido: 087-paineis-dado-real-e-demo
branch: feature/087-demo-dado-real
commit: 699ad94dd8efa5cc39362ae031b1dec978c196c0
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-10
---
# Review: comando da demo com dado real (087, E4.2, K-258)

## Parecer
Aprovado. Revisado o diff `4388083c..699ad94d`: `scripts/demo-dado-real.sh`, `scripts/demo-dado-real.test.sh`, atalho `demo:dado-real` e o teste ligado ao `test:trava` no `package.json`, `docs/engineering/demo-dado-real.md` e o parecer de devops. O código de produto não mudou. Esta volta incremental (`1e4a8ba8..699ad94d`) corrige os achados A1 e A2 da rodada anterior.

## Contra o E4 do pedido
- Sobe o ambiente (`docker compose up -d --wait postgres`), migra (`scripts/db.sh migrate`, antes da API), faz a carga inicial do BusinessMap (`bm:coleta carga-inicial`), do Acelerato (`scripts/coleta.sh ac`) e do apontamento (`bm:apontamento carga-inicial`), projeta (`bm:projetar`) e imprime a consulta de prova do 075. Ordem e parada no primeiro erro cobertas pelo teste.
- A consulta de prova só conta linhas (`fato_bloqueio`, `evt_bloqueio` com `tipo = 'fim'`) e pega `min(coletado_em)` de `stg_card`: sem nome, e-mail nem texto.

## Contra as regras invioláveis
- Credenciais só no `.env`: o script confere só os nomes, nunca imprime valor. A senha do `dspd_coletor` agora vai só pelo ambiente do comando (`PGPASSWORD="..." executar ...`) e o argv do `docker` leva `-e PGPASSWORD` (só o nome). O prefixo de atribuição antes da função `executar` é herdado pelo filho `docker` em bash; o teste confere que o valor falso não aparece no argv.
- Acelerato só por GET e com a allow-list: reusa `coleta.sh ac`; nenhum cliente novo.
- Carga incremental sem sobrescrever histórico; BusinessMap e Acelerato em etapas separadas, sem cálculo novo.

## Verificação
- `bash scripts/demo-dado-real.test.sh`: 12 casos ok, "tudo ok" (rodado nesta revisão, docker e pnpm falsos), incluindo o novo caso "senha so pelo nome da variavel no argv do docker".
- `shellcheck` nos dois scripts: limpo.
- Guarda: a mudança é de ambiente, não de ramo de controle; as guardas existentes seguem cobertas por teste do ramo de falha.
- Não rodado contra base real nem Docker (brief proíbe). O repasse de `-e PGPASSWORD` pelo Compose ao `psql` só se confirma na primeira execução do dono; se falhar, a etapa 10 acusa autenticação sem vazar a senha (já registrado no parecer de devops).

## Achados
- A1 (resolvido) scripts/demo-dado-real.sh:113 · senha fora do argv do `docker`; corrigido em 93844c45.
- A2 (resolvido) docs/devops/087-demo-dado-real.md · frase sobre `ps` corrigida, com a ressalva do ambiente do processo, em 699ad94d.

## Itens do Entregar
Todos com commit: script, teste, atalho e documentação em e635f429; correção A1 em 93844c45; correção A2 em 699ad94d.
