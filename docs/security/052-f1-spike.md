---
tipo: revisao-seguranca
contrato: 1
pedido: 052-integracao-businessmap
branch: feature/052-f1-spike
commit: 47695dcf59b56cb6910d9e3b2fe6a3b38898c0a7
parecer: reprovado
revisor: forge:security-engineer
data: 2026-10-30
---
# Review de segurança: F1 do coletor do BusinessMap, CLI do spike de forma (pedido 052, E2.12, K-182)

Propósito: parecer de segurança da E2.11 (CLI manual `bm:spike` que lê a forma do quadro real, grava a saída bruta fora do clone e gera a lista de conferência das colunas). Gatilhos: segredo, dados de pessoa e integração externa (R-SEGURANCA). Público: node-backend (dono do código), tech-lead (E2.13, em paralelo), qa-engineer, Jarvis.

**Veredito: reprovado** em `47695dc`, por um bloqueante (A1): a guarda que mantém a saída bruta, que contém dado de pessoa, fora do clone é contornada por link simbólico. O resto do pedido de revisão está cumprido. Escopo: só o delta `e018d85..47695dc` (9 arquivos). Revisão estática; nada foi chamado no BusinessMap, `bm:spike` não foi rodado, o `.env` não foi lido e nenhuma suíte foi rodada. A única execução foi uma cópia da lógica de `foraDoRepositorio` em pasta temporária, sem rede, para provar o A1.

## O que foi verificado e está cumprido
- **Só GET:** o spike usa só `cliente.get` do cliente da F0, com o método fixo em GET (`server/src/plataforma/http.ts:264-269`). Todos os caminhos chamados (`/boards/{id}/currentStructure`, `/boards/{id}/workflows`, `/cardTypes`, `/customFields`, `/cards`, `/cards/{id}/revisions`, `/cards/{id}/comments`, `/users`) já estavam na lista fechada da F0 (`http.ts:15-21`), que o delta não muda. O teste de execução completa confere método, caminho e chave só no cabeçalho em todo pedido (`server/tests/spike-businessmap.test.ts:203-217`).
- **Mudança na allow-list:** `state` e `expand` ficam numa lista própria (`http.ts:43-48`) aplicada só quando o caminho é exatamente `/cards` (`http.ts:203`). `expand` aceita só os quatro valores, até quatro itens; `state` só `active`, `archived` e `discarded`. Testes de recusa: `expand` fora da lista, repetido cinco vezes e com `;`, `state` desconhecido ou com `;`, e os dois em `/cards/5`, `/boards`, `/customFields` e `/users`, todos sem tocar a rede (`server/tests/http.test.ts:159-176`, `spike-businessmap.test.ts:383-391`).
- **`/users` conforme a ADR 0020:** só `fields` com a constante `CAMPOS_USERS` e `user_ids` com até três ids da amostra (`server/src/modulos/businessmap/spike.ts:215-219`); a lista de `/users` da F0 continua valendo. O teste confere que saem só os dois parâmetros (`spike-businessmap.test.ts:219-223`). Quando o servidor devolve campo a mais, o relatório mostra só o nome do campo, e não o valor (`spike.ts:222-224`, teste em `spike-businessmap.test.ts:292-294`).
- **Pessoa fora do relatório e da lista:** o relatório só traz caminhos de chave, tipos e contagens (`server/src/modulos/businessmap/spike-forma.ts:83-107`). Chave numérica vira `<id>`, chave fora do padrão de identificador vira `<chave>` (`spike-forma.ts:17-20`). A lista traz só ids de quadro, workflow e coluna e o nome da coluna, limpo de quebra, barra vertical e crase e cortado em 80 caracteres (`spike-lista.ts:62`); nome de coluna é estrutura, já aceito no diagnóstico da WS1. Os ids de dono dos cards ficam em memória e só vão como `user_ids`. O teste injeta título, descrição, valor, nome, e-mail e comentário marcados e confere que nenhum aparece na saída, no erro, no relatório nem na lista, e que não sai nenhum `@` (`spike-businessmap.test.ts:233-236`).
- **Chave fora da saída:** as mensagens de `ErroBusinessMap` têm texto fixo, sem corpo nem `cause` (F0). O spike ainda passa avisos e o erro final por `limpar` (`spike.ts:97`, `110`, `283`). Um erro de configuração devolve só o nome da variável. O teste confere que a chave não aparece em nenhuma URL nem saída.
- **Leitura do `.env`:** `process.loadEnvFile` da raiz carrega o ambiente do processo, e a falha é engolida sem imprimir nada (`server/src/entradas/spike-businessmap.ts:11-15`). A entrada só escreve o relatório, a lista e o caminho da saída bruta.
- **Saída bruta, modos:** pasta criada com `0o700`, inclusive o pai `~/metricas-dspd-spike-bm` na primeira vez, e arquivos com `0o600` (`spike.ts:101`, `113`, `278-279`). O caminho padrão é novo a cada execução (carimbo de hora). O caso de pasta que já existe está no A2.
- **Saída bruta dentro do clone por caminho direto:** é recusada, inclusive com `..` e quando o caminho é o próprio clone (`spike.ts:21-26`, testes em `spike-businessmap.test.ts:376` e `466-471`). Caminho relativo resolve a partir de `server/`, dentro do clone, e também é recusado.
- **Varreduras:** `gitleaks`, `osv-scanner` e `semgrep` não estão no PATH (lacuna registrada). O delta não traz dependência nova (`process.loadEnvFile` é do Node) nem segredo literal: a chave dos testes é marcador fictício.

## Achados
- A1 (bloqueante) server/src/modulos/businessmap/spike.ts:21 · foraDoRepositorio compara caminhos só pelo texto (resolve e relative): BM_SPIKE_SAIDA ou ~/metricas-dspd-spike-bm apontando por link simbólico para dentro do clone passa (provado em pasta temporária), e o dado de pessoa da saída bruta cai no clone.
- A2 (recomendado) server/src/modulos/businessmap/spike.ts:101 · mkdir e writeFile só aplicam 0700 e 0600 ao criar: uma BM_SPIKE_SAIDA que já existe mantém o modo dela, e um arquivo que já existe é sobrescrito com o modo antigo. Nenhum teste confere os modos.
- A3 (recomendado) server/src/modulos/businessmap/spike-lista.ts:54 · workflow (na falta de workflow_id inteiro) e coluna (linha 59, String de column_id) entram na lista sem passar por chaveSegura nem por idTexto: texto vindo da resposta pode chegar à lista e quebrar a tabela.

### Detalhe dos achados
**A1, bloqueante (gatilho de dados de pessoa; o requisito "sem seguir symlink" está no pedido de revisão da E2.12).**
- Evidência: `spike.ts:21-26` usa `resolve` e `relative`, que não resolvem link simbólico. Depois, `mkdir` (`spike.ts:101`) e `writeFile` (`spike.ts:113`) seguem o link. A prova reproduz a lógica literal com um clone falso e um atalho para `clone/dentro`: o caminho é aceito, e o destino real fica dentro do clone (`aceito: true destino real dentro do clone: true`).
- Caminho de ataque: não há atacante externo; o risco é acidental. Quem dispara a CLI (o agente, pela decisão do dono de 2026-10-30 20:26, ou o dono) aponta `BM_SPIKE_SAIDA`, ou já tem `~/metricas-dspd-spike-bm`, como link para uma pasta do clone. Os JSON brutos, com `realname`, e-mail, título, descrição e texto de comentário, caem no clone. O `.gitignore` não os cobre, e um `git add` amplo os leva ao GitHub. Isso fere a regra do `CLAUDE.md` sobre dados de pessoa e a ADR 0020.
- Severidade: alta, pela consequência (dado de pessoa no repositório remoto); a probabilidade é baixa.
- Correção mínima: em `foraDoRepositorio`, comparar `realpath` com `realpath`. Do lado do clone, usar `realpathSync(raiz)`. Do lado do destino, usar o `realpath` do ancestral mais próximo que já existe, mais o resto do caminho. Recusar também quando o próprio diretório de saída já existe e é link (`lstat`). Na gravação, usar `writeFile(..., { flag: 'wx', mode: 0o600 })`, que recusa arquivo existente (inclusive link). Teste: link fora do clone apontando para dentro dele é recusado, sem nenhuma chamada à rede e sem nenhum arquivo criado no clone. Esforço P. Dono: node-backend.

**A2, recomendado.** Correção mínima: se a pasta de saída já existe, recusar quando ela não estiver vazia, ou aplicar `chmod 0o700` nela; usar `flag: 'wx'` nos arquivos (o mesmo do A1); teste com `statSync(...).mode & 0o777` igual a `0o700` na pasta e `0o600` em cada arquivo. Sem caminho de ataque realista: a estação tem um usuário só, e o caminho padrão é sempre novo. Esforço P. Dono: node-backend.

**A3, recomendado.** Correção mínima: `workflow = idTexto(wf.workflow_id) ?? chaveSegura(chave)` e `coluna = idTexto(c.column_id) ?? '<id?>'`, ou pular a coluna sem id inteiro, marcando-a como CONFERIR. A resposta do BusinessMap é entrada não confiável (fronteira F1 do modelo de ameaças). Hoje o BusinessMap devolve ids numéricos, então não há caminho de ataque realista. Esforço P. Dono: node-backend.

## Plano em cartões
- K-182 (node-backend): volta da E2.11 com o A1 (bloqueante) e, por decisão técnica do time, A2 e A3, com testes; depois, revalidação por delta neste mesmo parecer (`forge-check delta --parecer docs/security/052-f1-spike.md`).

## Casos de abuso para o QA
Cobertos pelos testes do delta: `expand` e `state` fora da lista ou fora de `/cards` recusados antes da rede; `/users` só com `fields=user_id,realname` e `user_ids`; nenhum valor marcado de pessoa nem a chave na saída; saída dentro do clone por caminho direto recusada. Falta, pelo A1: saída por link simbólico que aponta para dentro do clone deve ser recusada, sem chamada à rede e sem arquivo no clone.

## Observações para a execução real (depois da volta)
- A saída bruta tem dado de pessoa e fica no diretório do usuário sem prazo. Quem roda a CLI não abre os JSON brutos; só o relatório e a lista entram em contexto ou documento. Depois que o `businessmap-estrutura-real.md` for escrito e esta revisão da saída for feita, a pasta é apagada pelo dono.
- Cada execução faz cerca de 9 chamadas por quadro, mais algumas fixas, bem abaixo do limite de 550 por hora do cliente. Duas execuções na mesma hora somam no servidor; nesse caso, o 429 longo para a execução (observação da F0).

## Riscos aceitos
Nenhum novo. Seguem as decisões do dono: a própria chave, com poder de escrita (S-1 = Q-5 B), e o agente disparando a conexão real da máquina do dono (2026-10-30 20:26). A F1 cumpre a mitigação no cliente (só GET, lista fechada, sem credencial na saída). A troca por usuário de serviço só leitor segue pendente antes da coleta agendada.
