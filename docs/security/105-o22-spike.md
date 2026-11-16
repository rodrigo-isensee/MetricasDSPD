---
tipo: revisao-seguranca
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-o22-spike
commit: a6297bbc0711a66b6cde86be15585cdc96740717
parecer: reprovado
revisor: forge:security-engineer
data: 2026-11-16
---
# Review de segurança: spike B5b do O22 (E7.123)

Propósito: dizer se o spike `bm:spike-o22` pode rodar de novo na máquina do dono (amostra 60) e se a mudança que ele leva ao cliente HTTP de produção pode ir para a `develop`. Público: Jarvis, node-backend, tech-lead, qa-engineer. Revisão estática do diff `2c56d33b..a6297bbc` (6 arquivos: `spike-o22.ts`, a entrada `spike-o22-businessmap.ts`, `index.ts`, `package.json`, `http.ts` e o teste), mais duas sondas locais sem rede (fetch falso).

**Resumo.** O spike em si está correto pelo lado da segurança: só GET, o texto do comentário não é extraído, nome e `user_id` vão só ao arquivo do dono (0600, `wx`, fora do clone), a tela traz só contagens e forma, o erro sai como código e a credencial vem só do `.env`. **Rodar o spike com a amostra 60 no código revisado não amplia a exposição**: as chamadas dele a `/cards/comments` levam sempre `card_ids` e `page` (teste `spike-o22.test.ts:238`). O parecer é **reprovado** pelo efeito na produção (A1): `/cards/comments` entrou na lista fechada do cliente compartilhado sem a guarda de `card_ids`, ao contrário do que o próprio comentário de `http.ts:23` afirma e do precedente da ADR 0025 item 2. O merge na `develop` espera a correção, que é pequena.

## Gatilhos
Fronteira externa (caminho novo na lista fechada do cliente do BusinessMap), dados pessoais (comentários com texto e autor, `/users` com nome), arquivo de saída com nome de pessoa, credencial (apikey pelo `.env`), script novo no `package.json` (sem pacote novo; lockfile intocado).

## Achados
- A1 (bloqueante) server/src/plataforma/http.ts:24 · /cards/comments na lista de produção aceita consulta sem card_ids (e com board_ids): devolveria comentários (texto, autor, e-mail externo) de toda a conta. Exigir card_ids em montarAlvo, como /loggedTime (http.ts:258), e aceitar só card_ids e page.
- A2 (recomendado) server/src/modulos/businessmap/spike-o22.ts:401 · a saída é recusada só dentro do clone em que o script roda; outro clone ou worktree do mesmo repositório passa (sonda S2), e o arquivo com nomes ficaria não rastreado num diretório de trabalho git. Recusar também caminho com .git num ancestral.
- A3 (recomendado) server/src/modulos/businessmap/spike-o22.ts:317 · o arquivo do dono tem nome e atividade por hora de cada conta; a 1a linha diz não versionar mas não diz apagar. Acrescentar: apague depois da decisão do O22 (retenção mínima, LGPD), e o Jarvis registra que a saída da rodada de 21 cards também foi apagada.

## Sondas
- S1 · criarClienteHttp com fetch falso, c.get('/cards/comments', { consulta: {} }) e { board_ids: '1' } · espera: erro tipo consulta (card_ids exigido) · obtido: ACEITO, GET .../cards/comments e GET .../cards/comments?board_ids=1
- S2 · validarSaida('/home/rodrigoisensee/Metricas/MetricasDSPD/o22-x.md', raiz do worktree 063) · espera: recusado (diretório de trabalho do repositório) · obtido: ACEITO, devolve o próprio caminho

## Detalhe dos achados
**A1, lista de caminhos da produção sem a guarda de `card_ids`.** Evidência: `server/src/plataforma/http.ts:24` adiciona `/^\/cards\/comments$/` a `CAMINHOS_PERMITIDOS`; a consulta desse caminho cai em `CONSULTA_PERMITIDA` (`http.ts:34`), que tem `card_ids` opcional e também `board_ids`, `workflow_ids` e filtros de data; só `/users` e `/loggedTime` têm a exigência (`http.ts:254` e `http.ts:258`). O comentário de `http.ts:23` diz "`card_ids`, até 200, só GET e só no spike", mas nada no cliente faz valer "com `card_ids`" nem "só no spike". Sonda S1 (sem rede): `{}` e `{ board_ids: '1' }` saem para a rede. Caminho de ataque: não há atacante externo; o risco é de minimização. Qualquer código da coleta (o cliente é o mesmo da produção, que roda com a apikey do dono) que chame `/cards/comments` sem `card_ids` traz à memória o texto e o autor de comentários de quadros e áreas fora do escopo, incluindo e-mail de remetente externo; é a mesma razão pela qual a ADR 0025 item 2 fez o cliente recusar `/loggedTime` sem `card_ids` (`docs/architecture/adr/0025-coleta-do-worklog-businessmap.md:23`, e a alternativa rejeitada na linha 45). Bloqueante por ser defeito provado contra o contrato escrito no próprio código, numa fronteira com gatilho. Severidade: baixa. Correção mínima (node-backend, esforço P): em `montarAlvo`, para `caminho === '/cards/comments'`, usar uma consulta própria só com `card_ids` (`LISTA_IDS`, até 200) e `page`, e recusar a chamada sem `card_ids` (`ErroBusinessMap('consulta', ...)`); acrescentar ao `spike-o22.test.ts` os casos `{}`, `{ page: 1 }` e `{ board_ids: '1' }` recusados com `tipo: 'consulta'`. Alternativa igualmente aceita: tirar `/cards/comments` da lista ao fim do spike, se o O22 não o usar na coleta; nesse caso o merge espera a remoção. Se o O22 adotar a rota na coleta, a ADR 0020 (item 4e) registra a chamada em lote com `card_ids`.

**A2, guarda do arquivo de saída.** Evidência: `validarSaida` (`spike-o22.ts:399-409`) usa `foraDoRepositorio` (`spike.ts:50-57`), que compara só com a raiz do clone de onde o script roda (`spike-o22-businessmap.ts:10`). Os outros controles conferem: caminho relativo recusado, link simbólico no último trecho recusado, ancestral resolvido pelo caminho real, arquivo existente recusado e gravação com `flag: 'wx'` e `mode: 0o600` (`spike-o22.ts:438`), que também recusa link criado entre a validação e a escrita. Caminho: o dono passa, por engano, um caminho dentro do clone principal enquanto roda de um worktree (ou o contrário); o arquivo com nomes fica não rastreado ali e um `git add` amplo de um agente o levaria a um commit. Severidade: baixa. Correção mínima (node-backend, P): recusar se algum ancestral do caminho real tiver `.git` (pasta ou arquivo). Em paralelo, a mensagem de erro herdada diz "diretório da saída bruta" para um arquivo (só texto).

**A3, retenção do arquivo do dono.** Evidência: `relatorioDoDono` (`spike-o22.ts:312-359`) grava `user_id`, `realname` (de `/users`, que o cliente limita a `fields=user_id,realname`, `http.ts:62`), ações por hora e marcas de suspeita por conta. É levantamento para achar contas de automação, decidido pelo dono, e não métrica; mesmo assim é perfil de atividade por pessoa, e o arquivo deve viver só até a decisão. Correção mínima (node-backend, P): a primeira linha do relatório e a mensagem final da tela pedem que o arquivo seja apagado depois da decisão do O22. Dono do registro de que a saída da rodada de 21 cards (feita antes desta revisão) foi apagada: Jarvis, com o dono.

## Evidência do que está certo
- **Só GET.** O spike usa só `cliente.get`; o cliente fixa `method: 'GET'`, `redirect: 'manual'` e a chave só no cabeçalho (`http.ts:311-313`). Nada é escrito no BusinessMap nem no banco (a entrada não abre conexão).
- **Texto do comentário.** `analisarComentarios` (`spike-o22.ts:207-228`) lê só `card_id`, `created_at`, `type` (passado por `chaveSegura`) e o autor; `autorDoComentario` (`:87-95`) só pega `value` numérico de autor `internal` e descarta o de `external` (onde vem e-mail). `somarForma` guarda só nomes de chave (padrão de identificador, número vira `<id>`) e tipos, nunca valor (`spike-forma.ts:17-36`). O teste confere com marcador de texto e e-mail (`spike-o22.test.ts:146-162`).
- **Tela e log.** `resumoDaTela` (`spike-o22.ts:362-381`) traz só contagens, a forma e o caminho escolhido pelo dono; nenhum id de conta, nome nem campo. Não há logger; erro sai como código (`ErroBusinessMap.tipo`, `erro-interno`, `configuracao`) em stderr (`spike-o22-businessmap.ts:16,37-39`), sem mensagem da API. `realname` tem `|` e quebra de linha trocados por espaço antes da tabela.
- **Credencial.** `.env` da raiz lido só na entrada; nada dele é impresso; apikey vai só ao cliente.
- **Testes e commits.** Fixtures fictícias (`spike-o22.test.ts:11`); nenhum nome, e-mail ou apikey real no diff; o texto "SÓ PARA O DONO" aparece no histórico só no código-fonte (nenhum relatório versionado).
- **Limites.** Amostra limitada a 60 cards, 60 quadros, 3 páginas de listagem por quadro, 5 páginas de comentários; `/users` em lotes de 200 com `fields` fixo.

## Provas
- Teste do spike rodado por mim no head a6297bbc: `vitest run tests/spike-o22.test.ts`, 1 arquivo, 14 testes, todos passam.
- Sondas S1 e S2 acima, locais, sem rede (fetch falso; nenhuma chamada à API real).
- A suíte inteira roda só no CI do PR (não há PR para a branch); este parecer não afirma CI verde.

## Plano em cartões
- A1: guarda de `card_ids` (e só `card_ids`/`page`) para `/cards/comments` em `montarAlvo`, com os testes de recusa; dono node-backend (P). Depois, revalidação por delta deste parecer.
- A2: recusar saída dentro de qualquer diretório de trabalho git; dono node-backend (P).
- A3: aviso de apagar o arquivo após a decisão e registro de que a saída da rodada de 21 foi apagada; donos node-backend (texto) e Jarvis (registro).

## Riscos aceitos e ferramentas
Nenhum risco aceito. Ferramentas: leitura do diff, `vitest` no arquivo do spike, duas sondas locais. Lacunas: `gitleaks`, `osv-scanner` e o SAST não estão no PATH desta estação; o job de segurança do CI os cobre no PR.
