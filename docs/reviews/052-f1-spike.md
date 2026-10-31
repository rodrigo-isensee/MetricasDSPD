---
tipo: review
contrato: 1
pedido: 052-integracao-businessmap
branch: feature/052-f1-spike
commit: 96b1621df7e30f85f246082b06f01c8fc32f5d75
parecer: aprovado
revisor: forge:tech-lead
data: 2026-10-30
---
# Review: 052-integracao-businessmap (E2.13, F1 do coletor do BusinessMap, CLI do spike, K-182)

**Veredito: aprovado** em `96b1621` (revalidação E2.17, abaixo). A rodada 1 (E2.13, `47695dc`, reprovada por A1 e A2) fica registrada nas seções seguintes, como foi escrita.

## Revalidação E2.17 (volta E2.15, 96b1621)

Delta lido: `3e5e994..96b1621`, 1 commit (`96b1621`), 5 arquivos, 305 linhas a mais e 32 a menos. A lista do `forge-check delta --parecer docs/reviews/052-f1-spike.md` (intervalo `47695dc..d0f135f`) dá os mesmos 5 arquivos e trechos: `spike-businessmap.ts:13-18`, `spike-forma.ts:70-91`, `spike-lista.ts:2-139` (10 trechos), `spike.ts:1-332` (14 trechos) e `spike-businessmap.test.ts:3-677` (7 trechos). Todos foram lidos. O resto da branch fica como "já lido" na rodada 1, e a F0 tem parecer próprio. Não li o `.env`, não chamei o BusinessMap e não rodei `bm:spike`. A única execução foi `vitest run tests/spike-businessmap.test.ts` contra o servidor falso (1 arquivo, 31 testes, todos passaram). O verde do `pnpm run pronto` fica com o QA. A segurança revalidou a volta em `d0f135f` (aprovado). Este review cita esse parecer e não refaz o link simbólico, os modos nem o `wx`.

### Estado de cada achado

- **A1 resolvido.** `spike-lista.ts:69-70`: o descarte vale pelo nome ou pela presença em `colunas_descartado`. A marca distingue três casos (`:75-83`), e um deles é "Descartado do arquivo com nome diferente de Descartado (H-11)". Teste em `spike-businessmap.test.ts:624`: a coluna 1008 "Descartados", que está no arquivo, sai como `descarte` com essa marca, e a 1009 "Concluído" sai como `entrega` sem marca. É o mesmo caso da prova da rodada 1, que agora sai certo.
- **A2 resolvido.** `spike-lista.ts:99-106`: um workflow sem folha que não seja descarte na seção 2 ou na 4 recebe "CONFERIR: ... (H-23)" na primeira folha e entra nos itens a conferir. A regra do cabeçalho cita a H-23 (`:139`). Teste em `:641`: o workflow completo fica sem marca, o que só tem Descartado na seção 4 é marcado, e o que não tem a seção 2 também. O teste de entradas fora do padrão (`:601-606`) passou a esperar a marca H-23. O workflow 200 da prova da rodada 1 (seções 1, 3 e 5) cai nesse caso.
- **A3 resolvido.** `spike-lista.ts:90-91`: a folha `homologacao` ganha a marca "regra H-26" e tem a mesma conferência de `flow_type` que a folha de trabalho. `renderizarLista` (`:125`) a põe entre os itens a conferir. Teste em `:662`.
- **A4 resolvido.** `linhasDeVinculos` (`spike-forma.ts:70-91`) conta, por `link_type`, quantos cards têm o tipo, o mínimo e o máximo de vínculos por card e quantos cards têm mais de um. O valor passa por `chaveSegura`, então texto fora do padrão vira `<chave>`. O relatório usa a função em `spike.ts:314-317`. Testes em `:530` (unitário, com ausente, `<chave>` e mais de um pai) e `:477` (execução completa).
- **A5 resolvido.** `prepararSaida` (`spike.ts:60-72`) roda dentro do try de configuração (`:136`), antes de o cliente ser criado. Erro de sistema vira código 2 com mensagem fixa só com o código do erro. Teste em `:459`: arquivo no lugar da pasta, `ENOTDIR` e pasta sem permissão (`EACCES`), sem pedido ao servidor falso.
- **A6 fora desta volta.** Segue para o software-architect em cartão próprio, depois do merge da F1 (decisão técnica do Jarvis de 2026-10-30). A linha continua em `## Achados` como recomendado.
- **A7 resolvido.** `spike-businessmap.ts:13-18`: o catch ignora só `ENOENT`. Qualquer outro erro sai com código 2 e mostra só o código do erro, nunca o conteúdo do arquivo. A entrada fica fora da cobertura por configuração (rodada 1), então não há teste, o que é aceito.

### O que a volta mudou fora dos achados

- **Quadros deduplicados** (`spike.ts:133`). Com o `wx` em toda gravação, um id repetido em `BUSINESSMAP_QUADROS_IDS` gravaria o mesmo rótulo duas vezes e pararia com código 1. Então a deduplicação é necessária, e não só economia de chamadas. Não há teste para ela: A8 (recomendado).
- **Teste de falha de gravação reescrito** (`spike-businessmap.test.ts:333-347`). Antes, a pasta ocupada já existia antes da execução, e agora seria recusada pelo `prepararSaida` (pasta não vazia, código 2). O teste cria o item no meio da execução, no handler de `request` do servidor falso: `relatorio-forma.md` no pedido a `/users` e `cardTypes.json` no pedido a `/cardTypes`. O `mkdirSync` síncrono termina antes de a resposta voltar ao cliente, então o teste é determinístico. Ele continua provando o código 1 sem a chave.
- **Chave de workflow por `chaveSegura`** (`spike-lista.ts:54`, A3 da segurança). Quando falta `workflow_id`, uma chave numérica, que é o id do workflow, vira `<id>`. Com isso o workflow perde o id na lista, a exceção do arquivo não casa com ele e dois workflows assim ficam iguais na tabela. O teste de `:601` passou de `'77'` a `'<id>'`. A9 (recomendado): usar `idTexto(chave)` antes de `chaveSegura`.
- **Ordenação por `localeCompare` numérico** (`spike-lista.ts:110-111`). Ela é necessária porque `<id>` e `<id?>` não são números. Confere.

### Teto M14 na revalidação

O código e o teste da F1 somam agora 1322 linhas em `e018d85..96b1621` (o `git diff --numstat --no-renames` sem os `.md`), contra 1049 na rodada 1. A exceção continua aceita pelos mesmos motivos: um comportamento só e a mesma CLI. A linha do PR passa a ser `teto: excedido, 1322 linhas, CLI única do spike F1: relatório de forma e lista de conferência saem da mesma execução manual, nunca agendada`. Sem essa linha, ou com o número antigo, o teto vira achado bloqueante quando o PR for aberto.

Escopo: só o delta `e018d85551cd09be903987b82f000d2a1f71a2d4..47695dcf59b56cb6910d9e3b2fe6a3b38898c0a7`, 1 commit (`47695dc`), 9 arquivos, 1047 linhas a mais e 2 a menos. A F0 que a branch ainda carrega já tem parecer próprio (`docs/reviews/052-f0-fundacoes.md`). Lidos: o diff inteiro e, no plano `docs/architecture/features/052-integracao-businessmap.md` (worktree 052), a seção "F1. Spike de leitura do quadro real", a linha 148 da F2 (regra do papel de coluna) e as decisões H-8 a H-11 e H-23 a H-26 (§10 e §11). Não li o `.env` e não chamei o BusinessMap; não rodei `bm:spike`.

## Regras de ferramenta

- Lint, typecheck, testes e cobertura ficam com o `pnpm run pronto`. Não rodei a suíte de novo (só uma por vez; a E2.12 corre em paralelo). O verde da suíte fica com o QA. O `docs/engineering/praticas.md` não marca as regras com "decidida por", então não há comando configurado a citar regra a regra; fica como pendência do arquivo de práticas, sem revisão manual no lugar.
- O `src/entradas/**` está fora da cobertura por configuração (`server/vitest.config.ts:28`). Por isso a entrada `spike-businessmap.ts` não tem teste, e isso é aceito.
- Segurança (gatilhos: segredo, integração externa e mudança na allow-list do cliente) tem parecer próprio em `docs/security/052-f1-spike.md` (E2.12), que este review não refaz.

## Conferência contra a seção F1 do plano

- **Caminhos.** Todas as chamadas passam pelo cliente da F0, só com GET:
  - `/boards/{id}/currentStructure` e `/boards/{id}/workflows`, por quadro;
  - `/cardTypes`;
  - `/customFields`, páginas 1 e 2;
  - uma página de `/cards` por quadro, com `expand=custom_fields,transitions,block_times,linked_cards`;
  - `/cards/{id}/revisions` de até 3 cards e `/cards/{id}/comments` até achar o primeiro card com comentário;
  - `/users`, só com `fields=user_id,realname` e `user_ids`.

  O plano cita `/boards`, `/columns` e `/lanes`. O `currentStructure` traz colunas e raias, e o diagnóstico da E1.20 já respondeu essa parte (o plano diz "não repetir"), então a troca fica.
- **Perguntas respondidas no relatório.**
  - Paginação de `/customFields`: veredito por página 2 vazia, diferente ou repetida.
  - Tipos de card por workflow: caminhos com `type` na forma de `/workflows`.
  - Campos de estado do card.
  - Formato de data aceito.
  - Os filtros `archived_from` e `discarded_from` com `state`. O controle é a data de amanhã zerar a contagem, e ele responde a ressalva do plano.
  - Se o `fields` de `/users` restringe a resposta.
  - Chaves com cara de pessoa nas revisões (P-T1).
  - Contagens do recorte Q-2b por quadro.
  - Forma de `transitions`, `block_times`, `linked_cards` e dos comentários (O22).

  Revisões por card aparecem só como o tamanho mínimo e máximo da lista na forma. A pergunta da forma do vínculo com mais de um pai fica só meio respondida (A4).
- **Saída.**
  - A saída bruta fica fora do clone, com permissões 0700 e 0600.
  - O relatório só traz nomes de campo, tipos e contagens. Chave fora do padrão aparece como `<chave>` e chave numérica como `<id>`, e a apikey é redigida nos avisos.
  - Não grava staging (ADR 0022).
  - Não há Acelerato nem cálculo de métrica.
- **Mudança no cliente da F0 (`http.ts:45` e `:203`).** `state` e `expand` valem só em `/cards`, com valores de lista fechada. Nos outros caminhos continuam recusados, e o teste cobre `/cards/5`, `/boards`, `/customFields` e `/users`. Isso atende o A10 do review da F0 quanto ao código e ao teste. O registro da decisão revista ainda falta (A6).

## Lista de conferência contra H-8 a H-11, H-23 e H-26

- **H-8:** o tipo vem do `flow_type` (2 fila, 1 execução), e a exceção do arquivo vale como tipo. As candidatas de nome de espera com `flow_type` 1 na seção 3 são marcadas, menos as que já estão no arquivo. O relatório também lista as exceções do arquivo sem folha correspondente. Confere.
- **H-9 e H-10:** a regra das seções (1 backlog, 2 compromisso, 3 trabalho, 4 e 5 entrega) confere. As candidatas de marco (Pre-Release, loja, publicação, nas seções 2 e 4) e as filhas de "Encerrado" são marcadas. Confere.
- **H-11:** o descarte é decidido só pelo nome "Descartado". O arquivo `colunas_descartado` serve só para escrever a marca, e a coluna do arquivo com outro nome sai como entrega, sem marca nenhuma. Prova no fim desta seção. Defeito: A1.
- **H-23:** a lista não mostra o workflow sem folha na seção 2 ou na 4. Nesse workflow o marco de todo card cai na seção seguinte, e o dono confere a lista sem ver isso. Pela decisão técnica do pedido (2026-10-30), o que faltar contra a H-23 volta ao autor: A2.
- **H-26:** a folha da seção 3 com "Homologação" no nome recebe o papel `homologacao` (com o nome normalizado, sem acento), e o teste prova. Confere. A folha não ganha marca e por isso não aparece entre os itens a conferir (A3).

Prova de A1 e A2. Rodei `tsx` sobre um script de prova no scratchpad, com o `montarLista` desta ponta, sem suíte e sem rede. A entrada tem a coluna 1008 no arquivo como Descartado, com o nome "Descartados" no quadro, e o workflow 200 só com folhas nas seções 1, 3 e 5. Saída:

```
[["100","1008","entrega",""],["200","1","backlog",""],["200","2","trabalho",""],["200","3","entrega",""]]
Folhas: 4. backlog: 1, entrega: 2, trabalho: 1. Candidatas e itens a conferir: 0.
```

## Testes

- **Servidor falso local, nunca o quadro real.** Toda execução afirma, pedido a pedido:
  - método GET;
  - caminho dentro de `CAMINHOS_PERMITIDOS`;
  - chave só no cabeçalho, nunca na URL;
  - `expand` só em `/cards`;
  - `/users` só com `fields` e `user_ids`.
- **Recusa antes da rede.** Caminho e parâmetro fora da lista são recusados no cliente e no `http.test.ts`, com `pedidos` vazio.
- **Ausência de pessoa.** Os marcadores de título, descrição, valor, nome, e-mail e comentário, e a própria chave, não aparecem na saída, no erro, no relatório nem na lista. O teste também prova que a saída bruta guarda o nome, fora do clone. Os laços percorrem listas com pelo menos 7 marcadores e mais de 20 pedidos.
- **Bordas cobertas:** 401 fatal, falha não fatal virando aviso, falha de gravação, configuração inválida sem rede e estrutura fora do formato.
- **Bordas que faltam:** não há teste para os casos de A1 e A2.

## Teto M14

O `docs/engineering/praticas.md` não traz teto próprio, então vale o da fábrica (decisão M14). O delta tem 1049 linhas de código e de teste pelo `git diff --numstat --no-renames` (1047 a mais e 2 a menos). São 523 de `src` e `package.json` e 526 de teste. A exceção está **aceita**, com a linha `teto: excedido, 1049 linhas, CLI única do spike F1: relatório de forma e lista de conferência saem da mesma execução manual, nunca agendada` no corpo do PR. Os motivos:
- É um comportamento só: a CLI de leitura.
- A mudança em `http.ts` (8 linhas) existe só para essa CLI.
- Separar a lista do relatório deixaria uma CLI que não responde o plano.

A linha precisa estar no PR. Sem ela, o teto excedido vira achado bloqueante quando o PR for aberto.

## Achados
- A6 (recomendado) server/src/plataforma/http.ts:45 · state e expand em /cards ainda sem registro na ADR 0022 (ou no k084); fica com o software-architect em cartão próprio, depois do merge da F1.
- A8 (recomendado) server/src/modulos/businessmap/spike.ts:133 · a deduplicação dos quadros não tem teste; com o wx, um id repetido em BUSINESSMAP_QUADROS_IDS pararia com código 1. Sugestão: teste com '10,10' que confira uma só leitura por quadro e o código 0.
- A9 (recomendado) server/src/modulos/businessmap/spike-lista.ts:54 · sem workflow_id, a chave numérica do workflow vira `<id>`: perde o id, não casa com a exceção do arquivo e iguala workflows. Sugestão: idTexto(chave) antes de chaveSegura(chave).

## Achados da rodada 1 (E2.13, 47695dc): A1 a A5 e A7 resolvidos em 96b1621, A6 segue acima
- A1 (bloqueante) server/src/modulos/businessmap/spike-lista.ts:67 · H-11: o descarte sai só do nome; coluna de colunas_descartado com outro nome vira entrega sem marca (prova no parecer). Papel descarte se o arquivo lista a coluna, marca se o nome diverge, com teste.
- A2 (bloqueante) server/src/modulos/businessmap/spike-lista.ts:46 · H-23 (decisão técnica do pedido, 2026-10-30): a lista não marca workflow sem folha na seção 2 ou 4, onde o marco cai na seção seguinte (prova no parecer). Marcar esses workflows e citar a H-23 na regra (linha 117), com teste.
- A3 (recomendado) server/src/modulos/businessmap/spike-lista.ts:79 · H-26: folha homologacao não ganha marca e fica fora dos itens a conferir; o flow_type fora de 1 e 2 só é conferido em trabalho. Sugestão: marca "regra H-26" e a mesma conferência de flow_type para homologacao.
- A4 (recomendado) server/src/modulos/businessmap/spike.ts:264 · a forma de linked_cards mostra o tamanho da lista, não quantos vínculos são de pai; a pergunta do plano (card com mais de um pai) fica meio respondida. Sugestão: contar por card os valores de link_type (enumeração, sem pessoa).
- A5 (recomendado) server/src/modulos/businessmap/spike.ts:101 · o mkdir da saída bruta fica fora do try: diretório sem permissão vira rejeição não tratada na entrada, sem código 2 nem mensagem limpa. Sugestão: levar o mkdir para o try de configuração, com teste.
- A6 (recomendado) server/src/plataforma/http.ts:45 · state e expand em /cards é a decisão revista pedida no A10 da F0; código e teste estão aqui, mas a ADR 0022 (ou o k084) não registra a ampliação. O software-architect registra; Jarvis decide a etapa.
- A7 (recomendado) server/src/entradas/spike-businessmap.ts:13 · o catch engole qualquer erro do loadEnvFile, inclusive .env malformado, e a falha sai depois como variável ausente. Sugestão: ignorar só ENOENT.
