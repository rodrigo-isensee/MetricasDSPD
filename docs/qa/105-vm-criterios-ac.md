---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-vm-criterios-ac
commit: ffcafe2c2df5c95336fbf6621c0167ef9bc8087d
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-16
---
# QA: script ac:criterios e passos de base no roteiro da VM (pedido 105, K-396, E7.402)

Branch `fix/105-vm-criterios-ac`, head ffcafe2c, base 8a40f662. Diff: `server/package.json` (script `ac:criterios`), `docs/devops/105-implantacao-vm.md` (item 4a) e `docs/devops/105-roteiro-dono.md` (seção 5); `criterios-ac.ts` já existia. Sem especificação de UX: as obrigações vêm do brief. A suíte inteira fica para o CI do PR (sem PR ainda); este parecer não afirma CI verde e cita o que o autor rodou (8 marcas na 1ª, 0 na 2ª), que reproduzi.

## Achados
- A1 (recomendado) docs/devops/105-implantacao-vm.md:85 · A frase "comandos com pnpm leem o .env da raiz sozinhos" é falsa para os `ac:*`: com `.env` na raiz, `ac:criterios` e `ac:reprojetar-fluxo` falham com "PG_MIGRADOR_URL"; só `db:migrate` carrega o .env. O 4a precisa de `(set -a; . ./.env; set +a; ...)`, como o roteiro do dono já faz.

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Script `ac:criterios` existe e grava as marcas | CT-01: `db:migrate` num Postgres 17 descartável (39 migrações) e `ac:criterios`, banco sem marcas do Acelerato | vazio | passou: 8 referências gravadas, 13 linhas em `ref_versao_criterio_metrica`, rc=0 |
| Idempotente | CT-02: 2ª execução; CT-03: 3ª com data diferente (2026-11-20) | repetição | passou: `gravadas: []` nas duas, nada duplicado nem com data alterada |
| Data inválida recusada | CT-04: `ac:criterios 2026-13-99x` | entrada inválida | passou: "uso: criterios-ac.ts [AAAA-MM-DD]", rc=2 |
| Item 4a seguido como quem implanta | CT-05: roteiro na ordem, só com `.env` na raiz | permissão/ambiente | falhou como escrito (A1); com `PG_MIGRADOR_URL` no ambiente passou |
| `ac:reprojetar-fluxo` no banco migrado | CT-06 | vazio | passou: `{"lidos":0,"preenchidos":0,...}` |
| `ac:reprojetar-etapas` na ordem do 4a | CT-07 | dependência | recusou com rc=4: falta `ref:sync-calendario`, que está no item 4 (linha 95), antes do 4a; ordem do roteiro correta, mas fora do banco real não foi exercido |
| Passos condicionais da 0040 (S1, rollback) | leitura | n/a | não testável: a migração 0040 não existe nesta versão (`ls server/migrations` sem 0040); texto lido, coerente com a seção 4 do roteiro do dono |
| Seção 5 do roteiro do dono | CT-08: o comando usa `set -a; . .env` | ambiente | passou na leitura; é a forma que funciona |

## Cenários e resultado real
Ambiente: contêiner `postgres:17` descartável próprio (porta 55432, sem volume, com os papéis do `docker/postgres/init`), removido ao fim; o Postgres de desenvolvimento em 5432 não foi tocado. A 1ª execução foi refeita depois de apagar as marcas `acelerato` para registrar a saída completa:

```
== run 1
{"vigenteDesde":"2026-11-16","gravadas":["056:D-7","056:D-10","066:S8-com-resposta","069:L9-b-campos-etapa","069:L9-c-ordem-fluxo","105:S11-avaliacao-18b","105:S11-conversao-avaliacao","105:S8-so-respondidos"]}
rc=0
== run 2
{"vigenteDesde":"2026-11-16","gravadas":[]}
rc=0
```

As 8 referências coincidem com as de `CRITERIOS_ACELERATO`; a `099:D-7-528` não é gravada pelo `ac:criterios` (só pela reprojeção), como o texto do 4a diz. Sem teste novo de correção ou de regra no diff (só script e texto), então vermelho antes do verde e mutação não se aplicam.

## Bugs
Nenhum. O A1 é recomendação de texto com contorno de uma linha e a mensagem de erro do script aponta a variável que falta.
