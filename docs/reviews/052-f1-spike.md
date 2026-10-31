---
tipo: review
contrato: 1
pedido: 052-integracao-businessmap
branch: feature/052-f1-spike
commit: 47695dcf59b56cb6910d9e3b2fe6a3b38898c0a7
parecer: reprovado
revisor: forge:tech-lead
data: 2026-10-30
---
# Review: 052-integracao-businessmap (E2.13, F1 do coletor do BusinessMap, CLI do spike, K-182)

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
- A1 (bloqueante) server/src/modulos/businessmap/spike-lista.ts:67 · H-11: o descarte sai só do nome; coluna de colunas_descartado com outro nome vira entrega sem marca (prova no parecer). Papel descarte se o arquivo lista a coluna, marca se o nome diverge, com teste.
- A2 (bloqueante) server/src/modulos/businessmap/spike-lista.ts:46 · H-23 (decisão técnica do pedido, 2026-10-30): a lista não marca workflow sem folha na seção 2 ou 4, onde o marco cai na seção seguinte (prova no parecer). Marcar esses workflows e citar a H-23 na regra (linha 117), com teste.
- A3 (recomendado) server/src/modulos/businessmap/spike-lista.ts:79 · H-26: folha homologacao não ganha marca e fica fora dos itens a conferir; o flow_type fora de 1 e 2 só é conferido em trabalho. Sugestão: marca "regra H-26" e a mesma conferência de flow_type para homologacao.
- A4 (recomendado) server/src/modulos/businessmap/spike.ts:264 · a forma de linked_cards mostra o tamanho da lista, não quantos vínculos são de pai; a pergunta do plano (card com mais de um pai) fica meio respondida. Sugestão: contar por card os valores de link_type (enumeração, sem pessoa).
- A5 (recomendado) server/src/modulos/businessmap/spike.ts:101 · o mkdir da saída bruta fica fora do try: diretório sem permissão vira rejeição não tratada na entrada, sem código 2 nem mensagem limpa. Sugestão: levar o mkdir para o try de configuração, com teste.
- A6 (recomendado) server/src/plataforma/http.ts:45 · state e expand em /cards é a decisão revista pedida no A10 da F0; código e teste estão aqui, mas a ADR 0022 (ou o k084) não registra a ampliação. O software-architect registra; Jarvis decide a etapa.
- A7 (recomendado) server/src/entradas/spike-businessmap.ts:13 · o catch engole qualquer erro do loadEnvFile, inclusive .env malformado, e a falha sai depois como variável ausente. Sugestão: ignorar só ENOENT.
