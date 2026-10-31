---
tipo: qa
contrato: 1
pedido: 052-integracao-businessmap
branch: feature/052-f1-spike
commit: 96b1621df7e30f85f246082b06f01c8fc32f5d75
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-10-30
---
# QA: 052-integracao-businessmap (E2.18, F1 do coletor do BusinessMap, K-182)

Veredito: aprovado, com 3 recomendações que não devolvem. Testado o código de `96b1621` (a ponta da branch, `2c6182c`, só soma os pareceres de segurança e de review depois dele; árvore limpa). Escopo: o delta da F1 `e018d85..96b1621`, sem a F0. Obrigações lidas da seção "F1" do plano e das regras H-8 a H-11, H-23 e H-26, sem especificação de UX nem contrato de API novo (CLI interna). Review e segurança aprovados, lidos só por veredito e achados. Nada chamou o BusinessMap real: o `.env` não foi lido, o `bm:spike` não foi rodado, e todo teste usa servidor falso local.

## Execução (uma suíte por vez, `nice -n 19`)
Antes de rodar, conferi os processos: só havia o `dev:full` (servidores de desenvolvimento), nenhuma suíte. O `scripts/suite-unica.sh` do projeto serializou a chamada.
- `nice -n 19 pnpm --dir /home/rodrigoisensee/MetricasDSPD-052d run pronto`: rc=0. server: 34 arquivos passaram, 16 pulados (os `.pg`), 705 testes passaram e 96 pulados; cobertura do server 100% (2020/2020 instruções, 1337/1337 ramos, 481/481 funções, 1638/1638 linhas). Demais pacotes aprovados: web 1228, metricas 1092, mock 258, contratos 161, docs-contratos 102, homolog 73, pesquisa 33. `docs:check` ok (806 páginas). `test:trava`, `lint` e `format:check` ok.
- Os testes novos da F1 (`server/tests/spike-businessmap.test.ts`, 31 casos, mais a alteração em `server/tests/http.test.ts`) rodam sem a rede real: servidor HTTP falso na porta efêmera, diretório temporário e relógio injetado.
- Vermelho antes do verde: não rodado por commit (o `forge-testes` não é do projeto, e o código da F1 é arquivo novo, sem base para voltar). Substituído pela mutação abaixo, que mostra cada guarda quebrando um teste. Mesma aceitação do parecer da F0.

## Mutação manual no diff
Cópia in loco, restaurada por `git checkout` a cada mutante (árvore limpa ao fim), só `spike.ts` e `spike-lista.ts`, rodando `tests/spike-businessmap.test.ts`.

| Mutante | Resultado |
|---|---|
| Homologação no nome deixa de dar papel `homologacao` (H-26) | morreu |
| `flow_type` 2 deixa de ser fila (H-8) | morreu |
| H-23 só confere a seção 2 (não a 4) | morreu |
| folha pai deixa de ser pulada (só folhas) | morreu |
| coluna "Descartado" pelo nome deixa de ser descarte (H-11) | morreu |
| erro fatal (401, limite, bytes) deixa de interromper | morreu |
| falha de configuração sai com código 1 em vez de 2 | morreu |
| diretório da saída que é link deixa de ser recusado | morreu |
| arquivos da saída bruta em 0644 em vez de 0600 | morreu |
| `/users` com campo extra `email` | morreu |
| redação da chave na mensagem de erro removida (`limpar`) | sobreviveu (A1) |
| quadros repetidos em `BUSINESSMAP_QUADROS_IDS` sem deduplicar | sobreviveu (A2) |
| `rel === ''` removido em `foraDoRepositorio` | sobreviveu: equivalente, `''` já cai na segunda condição |

## Achados
- A1 (recomendado) server/src/modulos/businessmap/spike.ts:145 · o mutante que troca `limpar` por identidade sobrevive: nenhum teste faz o cliente devolver mensagem com a chave. A redação do spike é só a segunda camada, a primeira é do cliente da F0. Afirmar um erro com a chave literal.
- A2 (recomendado) server/tests/spike-businessmap.test.ts:193 · nenhum teste usa id de quadro repetido (`10,10`); sem a deduplicação em `spike.ts:133`, o segundo `wx` falharia no meio da rodada real, com código 1. Prender a deduplicação com um caso.
- A3 (recomendado) server/src/entradas/spike-businessmap.ts:12 · a entrada (leitura do `.env`, código 2 em falha que não seja ENOENT, `exitCode`) não tem teste e fica fora da execução do QA, que não pode ler o `.env`. Conferir no primeiro uso real, com o dono.

## Critério → teste → resultado
Obrigação = item da seção F1 do plano e do Entregar da E2.18. Todos os testes são do arquivo `server/tests/spike-businessmap.test.ts`, salvo indicação.

| Obrigação | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Só GET, só caminhos da lista, chave só no cabeçalho | "só GET, só caminhos e parâmetros da lista, chave só no cabeçalho..." (todo pedido do servidor falso é GET, casa com a lista, traz a apikey no cabeçalho e não na URL; o `expand` só em `/cards`) | método e caminho fora da lista | passou |
| Recusa de caminho e de parâmetro fora da lista, antes da rede | "o cliente da F1 recusa caminho e parâmetro fora da lista antes da rede" e o caso novo em `http.test.ts` (`state` e `expand` em `/cards`); `pedidos` vazio | `/users` sem parâmetros, com `email`, `expand` em `/boards` | passou |
| Nenhum valor de pessoa e nenhuma chave no relatório e na lista | mesmo teste da execução completa: marcadores de nome, `@` e a chave ausentes de saída, erro, relatório e lista; `/users` pedido uma vez só com `fields` e `user_ids`; nome só em `users.json` bruto | marcador de pessoa em campo de texto, `/users` com campos extras | passou |
| Nome de coluna, id e linha da lista sem texto livre da resposta | "A3 da segurança: workflow sem workflow_id e coluna sem column_id inteiro..." e "chaveSegura" | id fora de formato, chave com espaço | passou |
| Saída bruta só fora do clone, inclusive por link | "saída por link simbólico que aponta para dentro do clone...", "saída que já existe e é link...", "clone alcançado por link...", "foraDoRepositorio..." | clone, link para dentro, link quebrado, clone alcançado por link | passou |
| Saída bruta com modos 0700 e 0600 e pasta só vazia | "modos: pasta nova em 0700 e arquivos em 0600..." e "saída que não é pasta ou que não pode ser criada..." | pasta não vazia, arquivo no lugar da pasta | passou |
| Lista de colunas pela regra das H-8 a H-11 | "a lista gerada aplica a regra da H-8 a H-11 e marca as candidatas", "papel pela seção e tipo pelo flow_type" | `flow_type` fora de 1 e 2, folha pai, exceção do arquivo | passou |
| H-11: Descartado é descarte, pelo nome e pelo arquivo | "H-11: coluna listada em colunas_descartado..." | nome diferente de Descartado listado no arquivo | passou |
| H-23: marco que faltou | "H-23: marca o workflow sem folha na seção 2 ou na 4..." (só Descartado na seção 4 não vale) | seção 2 e seção 4 ausentes, workflow completo | passou |
| H-26: homologação na seção 3 | "H-26: folha de homologação ganha a marca..." | folha de homologação fora da seção 3 | passou |
| Código de saída em falha de configuração | "configuração inválida: nada vai à rede" (código 2, sem rede) e as falhas de pasta (código 2) | variável obrigatória ausente, saída inválida | passou |
| Falha fatal e falha não fatal | "401 interrompe a execução...", "falha não fatal vira aviso...", "falhas de leitura não fatais em cada etapa...", "falha de gravação...encerra com código 1" | 401, 5xx isolado, disco | passou |
| Perguntas do plano respondidas só em forma (paginação de `/customFields`, filtros de data, `/users`, comentários, vínculos) | "paginação... as cinco respostas", "filtro de data com state...", "/users: sem ids...", "comentários: primeiro card...", "linked_cards..." e "veredictos" | servidor que ignora a data, página 2 igual à 1, sem comentário | passou |

## Resultado
Aprovado. Nenhum bug aberto, então não há arquivo em `docs/qa/bugs/`. Falta a execução real com o dono, que não é deste parecer (sem acesso ao `.env` nem ao quadro).
