---
tipo: revisao-seguranca
contrato: 1
pedido: 059-aba-apontamento
branch: docs/059-apontamento-discovery
commit: 784659c5efb8eaabeb521772f2a21b105d1c32f8
parecer: reprovado
revisor: forge:security-engineer
data: 2026-11-01
---
# Leitura de segurança das ADRs da aba Apontamento: ADR 0020 revisão 4 e ADR da coleta do worklog (pedido 059, E2.8, K-193)

Propósito: ler, antes do código, a revisão 4 da ADR 0020 (`docs/architecture/adr/0020-protecao-de-pessoa-no-coletor.md:110-150`) e a ADR da coleta do worklog (`docs/architecture/adr/0024-coleta-do-worklog-businessmap.md`, a ser renomeada 0025 na E2.4) contra os controles do modelo de ameaças (`docs/security/059-aba-apontamento-ameacas.md`). Público: software-architect (dono das ADRs), tech-lead, node-backend, Jarvis. Leitura estática; o `.env` não foi lido, nada foi chamado no BusinessMap, nenhum nome de pessoa neste documento. O conteúdo lido é a árvore de trabalho da worktree 052c (ADRs ainda sem commit; o `commit` do frontmatter é o HEAD da branch). Ao commitar as ADRs, a revalidação sai por delta.

**Veredito: reprovado, por três bloqueantes de texto (A1 a A3), todos de correção barata e nenhum que pede mudar o desenho.** Os seis controles pedidos estão cobertos no desenho; os bloqueantes são lacunas dentro de controles que existem. Com A1 a A3 incorporados, a segurança renova por delta e libera a revisão 4 a passar a vigente (PE-2).

## Cobertura dos controles do modelo de ameaças
| Controle | Onde está | Cobre? |
|---|---|---|
| Papel dedicado (AP-2) | ADR 0020 R4-5 (`:133-134`): `dspd_api_apontamento`, GRANT por coluna, só `pessoa_ref` e `responsavel_nome` de `dim_responsavel` (mais estrito que a proposta, correto), nada em `stg_`/`evt_`, pool e módulo próprios, `dspd_api` intacto (`:133`, `:144`) | Sim |
| Allow-list (AP-4, AP-6) | R4-2 (`:120-126`): constante única, `fields` fixo, lista de gravação e de proibidos, validação com falha só com código e id (`:125`), spike antes do código (`:126`); ADR 0024 itens 1 e 2 (caminhos na lista fechada, só GET, `card_ids` sempre) | **Parcial**: a entidade apontamento sim; os eventos de `/loggedTime/history` não (A1) |
| Comentário na fronteira (AP-4) | R4-2 (`:124`): `classificarApontamento` em `coletor/`, só saída de lista fechada e inteiros, comentário nunca em staging, nem hash nem trecho (`:123`); P-8 adotada | **Parcial**: falta o orçamento e a matriz de dimensões do classificador (A3) |
| Chave de pessoa (AP-8, AP-10) | R4-4 (`:130`): `pessoa_ref` identity, sem relação com `user_id`, em `COLUNAS_PESSOA`, `p<n>` na API, preservada na reconstrução; `user_id` nunca no fato; ADR 0024 item 6 (mapa em memória) | Sim |
| Interruptor de nome (AP-1, P-1) | R4-5 (`:136`): `APONTAMENTO_NOMES` por zod, padrão desligado, rota nem seleciona o nome, partida recusa fora do loopback ou de rede local declarada, teste sobre compose de homologação e CI | **Parcial**: falta a defesa de Host (A2) e a definição exata da guarda (A4) |
| Retenção (AP-10, P-2 = "A") | R4-6 (`:138`): fora do gatilho, procedimento do `dspd_migrador` (apagar `dim_responsavel`, anular `pessoa_ref` no fato, horas como agregado), prazo ao DPO antes da fatia de retenção | Sim no desenho; mecanismo de "impedir releitura" em aberto (A5) |
| Limites o1 a o4 | R4-8 (`:142`) e contrato sem campo de meta, faixa ou média | Sim |
| Log e erro (AP-9) | R4-2 (`:125`): `redact` com 4 caminhos; item 6 da ADR 0020 mantido | Sim, com ressalva A6 |
| Exportação e cache (AP-8) | o4 e R4-5 (`no-store`, sem log de corpo) | Sim |

## Achados
- A1 (bloqueante) docs/architecture/adr/0024-coleta-do-worklog-businessmap.md:24 · `GET /loggedTime/history` e a tabela `evt_apontamento` não têm allow-list nem lista de campos gravados; o evento (campos `[NÃO LIDO]`, `:13`) tende a trazer o autor da alteração (id de usuário) e valores antigo e novo, que podem incluir o comentário.
- A2 (bloqueante) docs/architecture/adr/0020-protecao-de-pessoa-no-coletor.md:136 · a rota que devolve nome, sem autenticação, em API só em loopback, é lida por qualquer página que o navegador do dono abra (DNS rebinding); o interruptor e o CORS fechado não impedem; falta validar o cabeçalho `Host`.
- A3 (bloqueante) docs/architecture/adr/0020-protecao-de-pessoa-no-coletor.md:124 · `classificarApontamento` analisa texto livre vindo da origem e a revisão 4 não traz a matriz de dimensões, o corpus de legítimos nem o orçamento de tempo e de tamanho da entrada exigidos para controle que analisa entrada.
- A4 (recomendado) docs/architecture/adr/0020-protecao-de-pessoa-no-coletor.md:136 · a guarda de partida "recusa ligar fora do loopback ou de rede local declarada" não define o que se compara; o servidor em contêiner escuta `0.0.0.0` (`server/src/plataforma/config.ts:26`) e o desenho fica ambíguo.
- A5 (recomendado) docs/architecture/adr/0020-protecao-de-pessoa-no-coletor.md:138 · "impedir a releitura do id eliminado" não tem mecanismo, e a projeção da ADR 0024 item 6 (`:30`) recria `dim_responsavel` e `pessoa_ref` a partir de qualquer apontamento relido; a eliminação não se sustenta.
- A6 (recomendado) docs/architecture/adr/0020-protecao-de-pessoa-no-coletor.md:125 · `ctl_coleta_falha.id_origem` é legível pelo `dspd_api` e, em falha de resolução de usuário, seria um `user_id`; e o `redact` do pino com `*.x` cobre só um nível de aninhamento.
- A7 (recomendado) docs/architecture/adr/0024-coleta-do-worklog-businessmap.md:20 · o escopo por `card_ids` não limita as pessoas: quem de outras áreas apontou horas em card do escopo é resolvido por `/users` e aparece na aba com nome; decisão "C" do dono não cobriu esse caso.

## Detalhe dos achados

### A1 (bloqueante): eventos do histórico sem lista fechada
Evidência: ADR 0024 itens 4(b) e 5 (`:24`, `:27`) usam `/loggedTime/history` e gravam `evt_apontamento` (colunas no plano §3.3: `logged_time_id`, `tipo`, `detectado_em`, `coleta_id`), mas a allow-list `CAMPOS_APONTAMENTO` (R4-2, `:121-123`) cobre só o registro de `/loggedTime`. O próprio texto marca os campos do evento como `[NÃO LIDO]`. A ADR 0022 item 3 nega gravação em `stg_` sem lista fechada; a regra deve valer também para o que o coletor lê do histórico e guarda em `evt_`.
Caminho de ataque: não há atacante externo; é regressão por omissão. O node-backend, sem lista, copia o evento inteiro para `payload` ou para a linha de `evt_apontamento` "para auditoria", e leva a uma tabela append-only o autor da edição e o comentário antigo ou novo (texto livre, com a possibilidade de nome de cliente ou de colega), sem eliminação viável. Severidade: média-alta (mesma classe do M-1 da ADR 0020 na staging do card).
Correção mínima: a ADR 0020 R4-2 ganha o item 4h-2 "eventos do histórico": constante `CAMPOS_EVENTO_APONTAMENTO` com `logged_time_id`, `card_id`, `event_type` (valor de lista fechada, os cinco do §12 da OpenAPI; fora dele o evento é descartado e conta como falha de código) e `created_at`/instante do evento; **nunca** autor, `user_id`, valores antigo e novo, `comment` e qualquer outro campo; pedido com `fields` fixo se a API aceitar, e a lista do código como 2ª camada. `evt_apontamento` guarda só essas colunas e nunca `payload`. Teste com marcador no autor e no comentário do evento (CA-AP-2 estendido). Campo a mais que o spike E2.3 mostrar entra só por esta ADR. Esforço P. Dono: software-architect (texto); node-backend (código, depois).

### A2 (bloqueante): rota com nome, sem autenticação, exposta a DNS rebinding
Evidência: não há `onRequest` de autenticação nem checagem de `Host` na API (`server/src/app.ts`, sem ocorrência de `host`); o painel é servido por nginx em `127.0.0.1:8080` e a API em `127.0.0.1:3000` (`docker-compose.yml:48`, `:70`). A R4-5 (`:135-136`) fecha CORS e liga `no-store`, mas CORS só barra a leitura de origem diferente; não barra a página cujo domínio foi reapontado para o loopback.
Caminho de ataque: o dono (ou qualquer pessoa que rode o painel com `APONTAMENTO_NOMES` ligado) abre num navegador uma página de terceiro, por exemplo via link recebido. O domínio da página passa a resolver para `127.0.0.1` depois da carga; o script dessa página, agora "mesma origem" do nome do atacante, faz `GET /api/apontamento` com `Host` do atacante e lê nome e horas de toda a equipe. Quem: qualquer site que o navegador visite. De onde: a internet, sem tocar a rede da empresa. Ganha: nome e horas por pessoa e dia. É o cenário que torna "só em loopback" insuficiente como única barreira. Severidade: média-alta (vazamento de dado pessoal real, com precondição de interruptor ligado, que é justamente quando importa).
Correção mínima: na R4-5, a rota (de preferência o `onRequest` do módulo `apontamento/`) recusa com 421 qualquer requisição cujo `Host` (e `Origin`, quando houver) não esteja numa lista fechada vinda da configuração: padrão `localhost`, `127.0.0.1`, `[::1]` com a porta, mais o host de rede local declarado pelo dono (A4). Vale sempre que o interruptor estiver ligado, e recomendado também desligado. Teste: `Host: atacante.exemplo` com o interruptor ligado devolve 421 sem corpo e sem eco do valor; `Host: localhost:3000` passa. O nginx do painel deve repassar o `Host` original (`proxy_set_header Host $host`) para a checagem valer atrás dele; confirmar no `devops-engineer`. Esforço P. Dono: software-architect (texto da R4-5), node-backend (código). A correção não exige autenticação; ela chega com o login pelo AD, fatia futura.

### A3 (bloqueante): classificador sem matriz de dimensões nem orçamento
Evidência: R4-2 (`:124`) descreve a assinatura e as saídas, mas não limites. O plano §3.4 diz normalização (NFD, minúsculas), casamento "por início de palavra" e termos vindos de tabela de referência. O comentário é texto livre de origem externa. A skill `cyber-security` pede, para controle que analisa entrada, a matriz das dimensões da família **antes do código**, com gerador, corpus de legítimos e orçamento de tempo e tamanho.
Caminho de ataque: apontamento com comentário de centenas de milhares de caracteres, ou formado para explodir um regex mal escrito (termo do dicionário que vira expressão regular sem escape, ou alternância aninhada), trava o coletor na coleta diária (negação de serviço da carga, com a marca d'água parada), ou faz o classificador devolver subgrupo errado sistematicamente (acento, caixa, Unicode compatível), corrompendo a métrica. Quem: qualquer pessoa que apontou horas no BusinessMap; de onde: o próprio BusinessMap. Severidade: média.
Correção mínima, a matriz mínima que a segurança propõe (o architect completa):
- Dimensões: (1) tamanho do comentário (vazio, 1 palavra, 3, 4, comprimento do limite, acima do limite); (2) codificação (ASCII, acentos pré-compostos e decompostos, caixa mista, `ß`/`İ`, emoji, surrogate isolado, `\u0000`, caracteres de controle e de direção); (3) posição do termo (início, meio, fim, colado a outra palavra, após pontuação); (4) tipo do card e categoria (cada `type_id` e categoria do dicionário, e fora dele); (5) dicionário (vazio, termo de 1 caractere, termo com metacaractere de regex, termos repetidos, prioridade em empate); (6) versão do dicionário.
- Orçamento: o coletor trunca o comentário a um máximo fixo de caracteres (valor a decidir pelo architect; proposta 2000) **antes** de normalizar; termos casados por comparação de prefixo sobre palavras já separadas, sem construir regex a partir do dicionário (ou com escape total e sem quantificador aninhado); tempo por apontamento medido em teste com limite fixo; falha do classificador vira `ctl_coleta_falha` só com código e `id_origem`.
- Corpus de legítimos (o que deve passar e classificar): comentários curtos em português com e sem acento, siglas, números de chamado, texto com quebra de linha. Gerador (fast-check): produto das dimensões 1 a 3 e 5. Propriedades: nunca lança; saída sempre em lista fechada; `qtdPalavras` coerente; mesma entrada igual saída; nada do texto aparece na saída.
Inserir na R4-2 (ou no plano §3.4) e na trilha B2 do plano 059 como critério do cartão, entregue antes do código. Esforço P-M. Dono: software-architect (matriz), node-backend e qa-engineer (gerador e testes).

### A4 (recomendado): definição exata da guarda de partida
Evidência: R4-5 (`:136`) diz que a partida "recusa ligar se o servidor não escuta em loopback ou num endereço de rede local declarado pelo dono". `HOST` tem padrão `0.0.0.0` (`config.ts:26`) e o contêiner da API escuta `0.0.0.0` dentro dele com a porta publicada em `127.0.0.1` pelo compose (`docker-compose.yml:48`); o servidor não vê a publicação.
Caminho: sem definição, ou a guarda nega o uso legítimo no contêiner do dono (e alguém a contorna declarando `0.0.0.0` como "rede local", expondo em todas as interfaces), ou compara a coisa errada e passa sem proteger. Severidade: baixa-média (defesa em profundidade; a fronteira real é o bind do compose).
Correção mínima: a guarda compara `HOST` com uma lista fechada: loopback (`127.0.0.1`, `::1`) ou o endereço em `APONTAMENTO_REDE_LOCAL` (nome a decidir), que é um IP privado específico e **nunca** `0.0.0.0`, `::` nem nome de host público (rejeitado por zod); no contêiner, `HOST=0.0.0.0` só é aceito com `APONTAMENTO_NOMES` ligado se uma segunda variável declarar que a publicação é só em loopback, e o teste sobre os compose (já previsto) confere que a porta da API é `127.0.0.1:` em todos. Registrar na ADR que, ligado em rede local, qualquer máquina dessa rede lê a aba (decisão "C" do dono, sem autenticação) até o login pelo AD. Esforço P. Dono: software-architect (texto), node-backend e devops-engineer.

### A5 (recomendado): eliminação a pedido sem durabilidade
Evidência: R4-6 (`:138`) manda "impedir a releitura do id eliminado (procedimento da I-12)", sem mecanismo. A ADR 0024 item 6 (`:30`) projeta, a cada execução, **todos** os apontamentos lidos, inclusive versões já presentes, resolvendo o `user_id` por `/users` e gravando `dim_responsavel`. Releitura vem da sobreposição de 1 h, de card editado (`:24`) e da carga inicial ou retomada (`:31`). O mesmo resíduo já está registrado na F3 do 052 (DT-3, R-11) para os responsáveis. Além disso, `dim_card.responsaveis` e `dim_card_versao.responsaveis` guardam o `user_id` (ADR 0020 item 4b) e a eliminação da R4-6 não os menciona.
Caminho: o titular pede eliminação; o migrador apaga a linha e anula `pessoa_ref` no fato; na coleta seguinte o mesmo `user_id` volta nos apontamentos relidos, `dim_responsavel` é recriada com novo `pessoa_ref` e o vínculo se refaz. O dono acredita ter eliminado e não eliminou. Severidade: média (LGPD, art. 18; hoje sem dado real, não explorável agora).
Correção mínima: o mecanismo vai à ADR, não só ao procedimento: tabela de configuração `cfg_pessoa_eliminada` com a **hash salgada** do `user_id` (sha256 com sal do `.env`, nunca o id em claro), lida só pelo `dspd_coletor`, fora do GRANT do `dspd_api` e do `dspd_api_apontamento`; o projetor a consulta antes de gravar `dim_responsavel` e `pessoa_ref` e, se casar, grava o apontamento com `pessoa_ref` nulo (horas no agregado do time); o procedimento do migrador cobre também `dim_card.responsaveis` e `dim_card_versao.responsaveis` (ou a ADR declara a diferença explicitamente). Teste CA-AP-10 estendido: reler o mesmo `user_id` depois da eliminação não recria a linha. É requisito da fatia de retenção, não bloqueia esta leitura; se o CA-AP-10 for cortado (corte do plano), a ADR registra a eliminação como não entregue. Esforço M. Dono: software-architect (texto), node-backend (código); prazo e base legal ficam com o DPO.

### A6 (recomendado): `id_origem` de usuário e alcance do `redact`
Evidência: R4-2 (`:125`) manda a falha de validação para `ctl_coleta_falha` com `id_origem`; para apontamento o id é `logged_time_id`, sem problema. Mas a resolução de usuário (R3-1, `/users`) também pode falhar, e `ctl_coleta_falha` é legível pelo `dspd_api` (ADR 0020 item 6). O `redact` do pino (`server/src/plataforma/log.ts:5-18`) usa `*.apikey` e semelhantes; em pino `*.chave` cobre um único nível, então `{ erro: { contexto: { comment } } }` não é redigido.
Caminho: falha de `/users` grava `user_id` do BusinessMap numa tabela que a API geral lê (id de pessoa fora do papel dedicado); log com objeto aninhado vaza texto de comentário ou nome apesar dos 4 caminhos novos. Severidade: baixa.
Correção mínima: na R4-2, `id_origem` de falha de usuário é omitido ou substituído pelo `logged_time_id` do apontamento que o pediu; o teste CA-AP-3 grava um marcador em dois níveis de profundidade; os 4 caminhos do `redact` ganham a variante `*.*.x` (como `*.*.headers.apikey` já faz) e continuam sendo defesa secundária da regra "nunca registrar valor". Esforço P. Dono: software-architect (texto), node-backend.

### A7 (recomendado): pessoas de fora do escopo na aba
Evidência: o escopo é a lista de cards (ADR 0024 item 2, `:20`), mas o worklog desses cards traz o `user_id` de quem apontou, de qualquer área. Esses ids são resolvidos por `/users` e viram `pessoa_ref` e nome (R4-3).
Caminho: pessoa de outra equipe que lançou tempo num card do DSPD aparece, com nome e horas, para qualquer um que veja a aba; a decisão "C" do dono diz "qualquer usuário do painel", não "pessoas de outras áreas".
Correção mínima: não é correção de código; é pergunta ao dono (R-DECISAO, via Jarvis): aceita mostrar quem apontou nos cards do escopo, mesmo de fora do time, ou quer limitar às pessoas do cadastro de membros (`cfg_equipe_membro`, R2-1)? Se limitar, as demais viram "Outros" sem `pessoa_ref` e o `/users` não é chamado para elas (minimização). Esforço P. Dono: Jarvis (pergunta), software-architect (texto).

## O que foi verificado e está correto
- O `dspd_api` continua sem coluna de `COLUNAS_PESSOA` e sem tabela da aba (R4-5 `:133`, "O que não muda" `:144`, ADR 0024 Consequências). A restrição do papel novo a `pessoa_ref` e `responsavel_nome` (sem `responsavel_id`) é mais estrita que a proposta da segurança.
- Comentário: três camadas coerentes entre as ADRs e o plano (`:123`, `:124`, ADR 0024 item 1 e Consequências, P-8). Hash do registro sobre a allow-list, nunca do comentário. A saída `flags`, `subgrupo`, `qtd_palavras` é de lista fechada e inteiros.
- Cliente: só GET, `fields` de valor fixo, `card_ids` sempre, chamada sem `card_ids` recusada (ADR 0024 item 2), 401 e 403 sem nova tentativa (item 8), cota compartilhada com o limitador local, carga inicial só manual com o dono presente (item 7, ADR 0022 itens 4 e 5).
- Histórico e retenção: staging append-only com `UNIQUE (logged_time_id, registro_sha256)`, exclusão por marca, nunca `DELETE` (item 5); `fato_apontamento` fora do gatilho só para anular `pessoa_ref`, sem sobrescrever valor de métrica (R4-6).
- Limites o1 a o4 viram requisito de contrato (R4-8): sem campo de meta, faixa ou média por pessoa.
- BusinessMap e Acelerato não se misturam; o Acelerato fica fora da exceção (R4-1).
- Critério de reversão (R4, `:150`) inclui nome em log, `ctl_`, `stg_`, exportação, URL ou cache, módulo fora do papel e uso para ranking ou comparação entre times.
- Consistência: onde a revisão 4 amplia a R3-3, a ressalva é uma só (rota da aba com o interruptor); a numeração "revisão 5" para `stg_bloqueio` e afins está explicitada (`:116`), sem conflito com a ADR 0022 item 3.

## Pontos para o architect que não são achado
- A R4-5 usa `APONTAMENTO_NOMES` desligado como rótulo "Pessoa n"; o `pessoa_ref` estável continua ligando as horas à pessoa. É o desenho aceito (o dono decidiu a exceção), mas o texto da legenda não pode prometer anonimato com o interruptor desligado: é pseudonimização (LGPD art. 13 §4).
- O plano §3.1 lista no `redact` só `*.comment`, `*.comentario`, `*.realname`; a ADR (R4-2) acrescenta `*.responsavel_nome`. Vale a lista da ADR.

## Plano em cartões
- A1: software-architect, na ADR 0020 R4-2 (4h-2) e ADR 0024 itens 4 e 5; node-backend depois, no código da trilha B (β coleta).
- A2: software-architect (R4-5); node-backend (onRequest do módulo `apontamento/`); devops-engineer confere o `Host` no nginx.
- A3: software-architect (matriz e orçamento na R4-2 ou plano §3.4, antes do B2); node-backend e qa-engineer (gerador e propriedades).
- A4: software-architect (R4-5); node-backend e devops-engineer.
- A5: software-architect (R4-6 e ADR 0024 item 6); node-backend na fatia de retenção; DPO para prazo.
- A6: software-architect (R4-2); node-backend.
- A7: Jarvis leva a pergunta ao dono; software-architect ajusta.

## Riscos aceitos
Nenhum proposto por esta leitura. O risco de que, ligado em rede local, qualquer máquina da rede leia a aba sem autenticação é da decisão "C" e da resposta de P-1 do dono (2026-11-01), com o login pelo AD como fatia futura; fica registrado na A4, não como aceite novo.

## Ferramentas e lacunas
Leitura estática e `grep`. `gitleaks`, `osv-scanner`, `semgrep`, `zizmor`, `actionlint` e `trivy` não estão no PATH desta máquina (lacuna registrada; não se aplicam a ADRs, e as varreduras rodam no CI do `devops-engineer`). Nenhum segredo foi lido ou exibido; nenhum arquivo fora de `docs/security/` foi tocado; sem commit, por ordem do brief.
