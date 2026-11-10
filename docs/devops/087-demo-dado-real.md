---
tipo: revisao-devops
contrato: 1
pedido: 087-paineis-dado-real-e-demo
branch: feature/087-demo-dado-real
commit: d98db2b2184a0008ddc51c8b73118c8541b76248
parecer: aprovado
revisor: forge:devops-engineer
data: 2026-11-10
---
# Review de devops: 087-demo-dado-real (K-258, E4.1)

## Parecer
Aprovado. Mudança: `scripts/demo-dado-real.sh`, o atalho `demo:dado-real` e o teste `scripts/demo-dado-real.test.sh` (ligado ao `test:trava`) no `package.json`, e `docs/engineering/demo-dado-real.md`. Nenhum arquivo de `.github/`, `Dockerfile*`, `docker-compose*` nem IaC mudou; o pipeline e a proteção de branch ficam como estão.

- Provado: `bash -n` e `shellcheck` limpos nos dois scripts; `bash scripts/demo-dado-real.test.sh` ok, sem base real e sem `.env` (docker e pnpm falsos): `.env` ausente falha com etapa e categoria e não executa nada; variável ausente cita só o nome, nunca o valor; argumento inválido sai 2; ordem banco, BusinessMap, apontamento, projeção, API/web, prova; a senha não aparece nos argumentos repassados ao `docker`; para no primeiro erro.
- BUG-087-1 / A1 do QA (corrigido): `pnpm run demo:dado-real -- --reconhecer-mudanca`, como a documentação manda, entrega o `--` ao script, e o `case` o recusava com rc 2. O `case` agora aceita e ignora um `--` isolado, sem mudar o resto do parsing. Dois casos novos no teste: `-- --reconhecer-mudanca` aceito (rc 0, flag reconhecida na saída) e `-- --outra` segue recusado com rc 2. O caso de aceitação foi visto vermelho antes da correção (2 falhas) e verde depois.
- Fontes: só reusa os comandos existentes (`bm:coleta carga-inicial`, `coleta.sh ac`, `bm:apontamento carga-inicial`), que só leem (GET no BusinessMap, leitura no Acelerato). O script não escreve nada nas fontes.
- Credenciais: o script lê o `.env` por `source` (como `db.sh` e `dev.sh`), só confere nomes com `grep -Eq` e nunca imprime valor. A senha do papel `dspd_coletor` é exportada só no ambiente do comando (`PGPASSWORD=... executar ...`) e o `docker compose exec` recebe apenas `-e PGPASSWORD` (o nome, sem valor): o valor não entra no argv do cliente `docker` e não aparece em `ps` nem em `/proc/<pid>/cmdline`. Corrigido após o A1 do review e da segurança; a frase anterior desta seção, que dizia isso quando o valor ainda ia no argv, estava errada (A2). Ressalva: o valor fica no ambiente do processo do cliente `docker`, legível só pelo mesmo usuário; que o Compose repasse o valor ao `psql` dentro do container é confirmado na primeira execução do dono. Nada de segredo em `ARG`, imagem ou arquivo versionado. A consulta de prova só tem contagens e um `min(coletado_em)`: sem nome, e-mail nem texto livre.
- Rede: Compose da raiz com portas em `127.0.0.1`; custo zero (`R-CUSTO`), sem CI nem nuvem.
- Diferença deliberada do `homolog:subir`: o da homologação semeia mock e usa outro Compose; a demo sobe o Compose da raiz sem seed (a coleta recusa base com seed, `esquema-com-seed`). Documentado.

## Lacunas
- Nada foi executado contra a base real nem contra o Docker (o time não tem o `.env`, e o brief proíbe). O texto e as colunas da consulta de prova (`dspd_bm.fato_bloqueio`, `evt_bloqueio.tipo = 'fim'`, `stg_card.coletado_em`) foram conferidos no código, não numa base; a primeira execução do dono é o teste real. Se um nome de esquema divergir, a etapa 10 falha com categoria `consulta` sem efeito colateral. O repasse de `-e PGPASSWORD` pelo Compose também só se confirma ali; se falhar, a etapa 10 acusa autenticação, sem vazamento.
- Duração não medida (documentada como tal). `actionlint` não se aplica.
- O script não decide sozinho "primeira coleta depois do L9-c": o dono passa `--reconhecer-mudanca` quando o `ac` recusar com `parametros-mudaram`, o que é o comportamento já pedido pelo `ac`.
- A chamada com `--` foi provada só com pnpm falso no teste; o pnpm real (10 ou 12) não foi executado aqui.
- recomendado: o QA (E4.3) pode simular o roteiro pelo teste incluído.

## Custo e rollback
Custo zero. Rollback: reverter o commit; o script não altera dado que não seja a carga inicial, repetível por desenho (marca d'água, staging idempotente).
