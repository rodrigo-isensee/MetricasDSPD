---
tipo: review
contrato: 1
pedido: 073-melhorias-tecnicas-2026-11-05
branch: feature/073-ca8-ref-dominio
commit: aaa52dab2e3850063edf34a645a60117e71dc143
parecer: aprovado
revisor: tech-lead
data: 2026-11-06
---
# Code review: 073 E3, listas de ref_dominio no CA-8 (K-224)

## Revalidação (volta do K-224, delta 848e4320)
Delta lido: `git show 848e4320` (2 arquivos de teste, 6 inserções e 1 remoção). Já lido: o restante (a6363d2c e o desenho), conforme a rodada anterior; o merge aaa52dab trouxe a develop e foi conferido por conteúdo (diff vazio contra origin/develop, pelo Jarvis).
- Teste pg: `mysql` passou de `const` a `let` e, depois do `ac:ref-sync` renomear a equipe, o Acelerato falso devolve `Equipe renomeada`. A closure `coletar` lê `mysql.conectar` na hora da chamada, então pega o falso novo. Nenhuma asserção saiu; a expectativa de comportamento (CA-11, fora do recorte quando o nome não casa com a lista vigente) fica como estava e o código do E3 não mudou.
- Teste de cobertura: duas linhas com mesmo campo e código, rótulos B e A, esperam `equipe|1|B` seguido de `equipe|1|A`, o que prova o desempate do comparador (`controle.ts:43`) e a estabilidade da ordenação. Rodei `acelerato-ca8-listas`: 20 passed. O pg segue para o QA e a CI.
- CI do push no head aaa52dab: run 42233046914, `completed success` (o run anterior, 42232411706, foi cancelado pelo push seguinte).
- Teto M14: o delta soma 4 linhas de teste; A1 segue como estava.

## Parecer
Aprovado. A entrega segue o desenho `docs/analises/073-e3-desenho.md` (§3 e §4) e as decisões do dono P-E3-1 "A" e P-E3-2 "A". Três recomendações, nenhuma devolve.

Lido: `git diff 8a789d43...a6363d2c` inteiro (8 arquivos, commits 805c583d e a6363d2c), o desenho e as duas decisões. Também li, fora do diff, `ultimoSucesso` e `parametrosDiferentes` (`controle.ts:64-75`) e a entrada `server/src/entradas/coleta.ts`, para conferir a coleta seguinte à releitura.

### O que está correto
- **Aderência ao desenho.** `ParametrosColeta` e `CHAVES_COMPARADAS` ganham `recorte_sha256` (tipo, organização, equipe) e `vocabulario_sha256` (etapa, prioridade, categoria, workflow e os domínios `cpe_*`). Não há migração: o `parametros` é jsonb e `ref_dominio` não muda. Não há mecanismo novo: o molde é o do `fluxo_sha256`.
- **Forma canônica do hash** (`controle.ts`, `listasSha256`): uma linha `campo|codigo|rotulo` por item vigente, ordenada por `campo` e `codigo`. A `ordem` de exibição fica fora e a lista vazia dá o hash da string vazia. Os testes provam: a ordem de chegada não muda o hash; incluir ou tirar código e trocar rótulo mudam; a `ordem` não muda; a lista vazia é estável. A separação entre os dois grupos também está provada: `natureza_prefixo`, `etapa_fluxo` e `campo_personalizado` ficam fora; `cpe_*` entra no vocabulário.
- **Mesmo retrato.** `carregarDominiosEtapaLidos` subiu para a partida, antes de `montarParametros`. Os hashes saem das mesmas linhas que alimentam o `PedidoLeitura`, e a linha de sucesso grava esses mesmos `hashes`. Um `ac:ref-sync` no meio da coleta não desalinha nada.
- **Recusa sem vazar valor.** A recusa usa o caminho de hoje: `parametros-mudaram` com `coluna` igual ao nome da chave, antes de abrir a conexão MySQL. Os 9 casos do `it.each` conferem o nome da chave, a ausência de conexão e a ausência dos valores no erro serializado. No pg, `erro_resumo = 'parametros-mudaram (recorte_sha256)'` e a linha de falha fica sem marca d'água.
- **P-E3-1.** `natureza_prefixo` não é chave. No pg, o `ac:ref-sync` grava a versão de critério e a coleta seguinte passa sem `--reconhecer-mudanca`.
- **P-E3-2, releitura só leitura e sem sobrescrever.** Com `--reconhecer-mudanca` numa coleta incremental e o `recorte_sha256` anterior diferente, o modo vira `releitura` e a tarefa vira `varredura` (`coletor.ts:212-218`). É o mesmo caminho da releitura semanal: `conhecidos`, `medirForaOrganizacoes`, `DATA_MINIMA` e nenhuma marca d'água. A tarefa efetiva volta ao `coletarAcelerato` por `anotarTarefa`, então uma falha no meio da releitura fica registrada como `varredura`. Conferi a coleta seguinte: `ultimoSucesso` toma os `parametros` da última linha de sucesso de qualquer das duas tarefas (já com o hash novo) e a marca d'água pelo `max` só das incrementais. A incremental seguinte passa sem a opção e retoma da marca antiga, sem buraco. O teste confere que o staging antigo fica intacto (`slice(0, chamadosAntes)`). Se a releitura falhar, nenhuma linha de sucesso entra e a recusa continua até um novo reconhecimento: falha fechada.
- **Primeira coleta depois do deploy.** A linha anterior não tem as chaves (`undefined !==`), então a coleta recusa com `recorte_sha256,vocabulario_sha256`. O reconhecimento libera sem reler, porque não há chave anterior de recorte. O comportamento segue o §4 do desenho, e as duas coisas estão testadas.
- **Histórico.** No pg, o `ac:ref-sync` fecha a vigência e abre outra (3 linhas de equipe, 2 vigentes): nada é apagado. BusinessMap e Acelerato não se misturam: as chaves ficam só no `dspd_ac.ctl_coleta`.
- **Documentação.** `acelerato-listas.md` ganhou o item de recusa e reconhecimento depois do `ac:ref-sync`, com as decisões P-E3-1 e P-E3-2 e o caso da primeira coleta. O CT-34 do plano de testes também foi atualizado. O `data-model.md` não lista as chaves de `parametros`, então não precisava mudar. A edição da ADR 0023 §6 fica fora desta entrega por decisão do desenho (§4: "por edição revisada, não nesta entrega").

### Pendências para o Jarvis (não são achados desta branch)
- ADR 0023 §6 (linha 100): a nova leitura ("valores vigentes das listas de recorte e de vocabulário de `ref_dominio`") pede uma edição do arquiteto, com review, como o desenho diz.
- Roteiro da release combinada: um `pnpm coleta ac --reconhecer-mudanca` depois do deploy cobre o L9-c e este item. Antes desse passo, a coleta agendada das 06:30 é recusada.

## Ferramentas
O autor relatou, e eu cito sem refazer (Histórico do pedido, 2026-11-06 08:31): eslint e tsc limpos, server com 1800 testes passando e 251 pg pulados, e `docs:check` ok. Os 25 testes que falham ficam só nos 4 arquivos de entrada que lançam o tsx em processo filho (`/tmp/tsx-1000` no sandbox). Esses 4 arquivos e os testes pg se provam na CI do PR.

No review rodei só os testes dos arquivos tocados e dos que importam o código mudado (MemAvailable 17 GB, load 1,0), com `npx vitest run --maxWorkers=2` em `acelerato-ca8-listas`, `acelerato-ca8-ref-sync.pg`, `acelerato-campos-etapa`, `acelerato-coletor`, `acelerato-allow-list`, `dominio-acelerato-real` e `esquema-com-seed`. Resultado: `Test Files 6 passed | 1 skipped (7)`, `Tests 140 passed | 3 skipped (143)`. O pg pulou sem banco e fica com o QA e a CI (D-5).

## Teto M14
O `praticas.md` do projeto não tem a regra escrita; aplico a regra da fábrica, como nos pareceres anteriores (069-zz5-l9c). A contagem por `git diff --numstat --no-renames 8a789d43...a6363d2c`, sem `.md`, dá 333 linhas: 90 de código (`coletor.ts` 37, `controle.ts` 32, `referencia.ts` 21) e 243 de teste. Fica acima de 150.

O PR carrega um comportamento só: a mudança de lista de `ref_dominio` pede o reconhecimento do CA-8. A releitura no reconhecimento é a consequência que o dono decidiu (P-E3-2), não um segundo comportamento. Aceito a exceção pelos motivos: 73% é teste, e o código é o mínimo para as duas chaves e a releitura. A condição está no A1.

## Achados
- A1 (recomendado) server/tests/acelerato-ca8-listas.test.ts:1 · Lote com 333 linhas de código e teste contra 8a789d43, acima do teto M14. Exceção aceita: o corpo do PR leva `teto: excedido, 333 linhas, <motivo>`, recontado na hora; sem a linha, vira bloqueante.
- A2 (recomendado) server/src/modulos/acelerato/coletor.ts:184 · O log de conclusão grava o `modo` pedido (incremental) quando o reconhecimento virou releitura; a saída do comando já mostra o efetivo. Usar `r.valor.modo` no log.
- A3 (recomendado) server/src/modulos/acelerato/referencia.ts:50 · `carregarListas` e `carregarDominiosEtapa` (linha 71) ficaram sem uso em produção; só os testes antigos as chamam. Migrar esses testes para as versões `Lidas` e apagar os embrulhos num lote futuro.
