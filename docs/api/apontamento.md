# API: aba Apontamento (`GET /api/apontamento`)

Pedido 059 (K-193), trilha B4. Contrato zod em `packages/contratos/src/apontamento.ts` (versão 1; mudar a forma depois que o front começou é mudança de contrato, `docs/contratos/politica-de-mudanca.md`). Decisão de arquitetura: ADR 0020, revisão 4 (R4-5); plano `docs/architecture/features/059-aba-apontamento.md` §3.8 e §3.9. Só BusinessMap; nunca Acelerato.

Exceção aprovada pelo dono à regra de métrica individual (cláusulas o1 a o4): ordem neutra das pessoas, sem semáforo nem média por pessoa, percentual por pessoa só com 20 apontamentos ou mais, aba fora da exportação. As horas servem a capacidade, utilização e distribuição do tempo, nunca a esforço de entrega, velocidade, custo de card ou meta.

## Rota única

`GET /api/apontamento` (fora do prefixo `/api/v1`). A rota só existe quando a API sobe com `PG_APONTAMENTO_URL` (papel `dspd_api_apontamento`); sem ela, 404. Nenhuma outra rota devolve nome, `pessoaRef`, `responsavel_id` nem `user_id`.

- **Autenticação:** nenhuma (decisão "C" do dono: qualquer usuário do painel vê a aba). Não substitui o login pelo AD, fatia futura.
- **Cabeçalhos de toda resposta da aba (inclusive 400, 421 e 500):** `Cache-Control: no-store`. Nenhum `Access-Control-*` (CORS fechado).
- **Cálculo:** nenhum na rota nem no front. Tudo vem de `calcularApontamento` (biblioteca T2.5, `@metricas-dspd/metricas/businessmap`); a rota lê as linhas, monta a moldura (período, opções, frescor, critérios) e valida a resposta com `respostaApontamentoSchema`.

## Consulta (`querystring`, estrita)

Chave desconhecida é 400. Listas separadas por vírgula (ou parâmetro repetido); valor repetido na lista é 400. Nada de texto livre.

| Parâmetro | Tipo | Padrão | Regra |
|---|---|---|---|
| `de`, `ate` | `AAAA-MM-DD` | 12 semanas terminando hoje (America/Sao_Paulo) | os dois ou nenhum; `de <= ate`; no máximo 366 dias (inclusive); data existente |
| `pessoa` | lista de `pessoaRef` (`p1`, `p27`) | todas | até 200; nunca nome |
| `projeto` | lista de `card_id` da raiz (dígitos) | todos | até 200 |
| `tipo` | lista de `type_id` (dígitos) | todos | até 50. O mesmo valor de `opcoes.tipos[].id` (o `type_id` do card do apontamento, ou do card pai quando o apontamento é de subtarefa). Valor fora de dígitos: 400 |
| `equipe` | lista de slugs de time (`time-alfa`, `sem-time`) | todos | até 50; cada valor `^[a-z0-9][a-z0-9-]{0,59}$`, o mesmo formato do fluxo; repetido: 400. Os ids de `opcoes.equipes[].id`. Recorta as linhas pelo time do card do lançamento (097 L2); vários times valem como um conjunto consolidado, sem série nem bloco por time |
| `subtarefa` | lista de códigos (`em-subtarefa`, `direto-no-card`) | todas | até 50 |
| `subgrupo` | lista de códigos do dicionário | todos | até 50 |
| `qualidade` | lista de `sem-comentario`, `generico`, `sem-vinculo`, `sem-iniciativa`, `valor-atipico`, `completo` | todas | até 6 |
| `nivelMatriz` | `tipo` \| `subtarefa` \| `subgrupo` | `tipo` | um nível por vez |
| `diarioDe`, `diarioAte` | `AAAA-MM-DD` | 4 semanas terminando no fim do período | os dois ou nenhum; no máximo 62 dias |
| `anomalos` | `incluir` \| `ocultar` | `incluir` | valor atípico (soma do dia da pessoa acima de 10 h desde 2026-11-04, antes 16 h; versão de critério `067:limite-dia-atipico`) é marcado, nunca descartado |

## Resposta 200

`respostaApontamentoSchema` (`packages/contratos/src/apontamento.ts`): `versaoContrato`, `dominio: "businessmap"`, `periodo`, `frescor { selo, ultimaColetaOk, ultimaTentativa? }`, `nomesReais`, `opcoes { pessoas, projetos, tipos, equipes?, subtarefas, subgrupos, historico }`, `kpis`, `distribuicao`, `qualidade`, `matriz`, `capacidade`, `diario`, `achados`, `criterios`. Horas em segundos inteiros (o front só formata). Pessoa só por `pessoaRef`.

- `nomesReais`: `true` só com `APONTAMENTO_NOMES=1`. Desligado (padrão), `opcoes.pessoas[].rotulo` é só um dos rótulos fixos que o contrato aceita (`Pessoa n`, com n = número do `pessoaRef`, ou `Outra área`; o contrato recusa qualquer outro texto com `nomesReais` falso) e o banco nem recebe consulta ao nome. Ligado, o rótulo é o nome real e é o **único** lugar do corpo em que ele aparece; pessoa sem nome na referência vira `Pessoa não identificada` com `identificada: false`. É pseudonimização, não anonimato: nenhuma legenda deve prometer anonimato.
- `frescor`: selo da última coleta do worklog (`tarefa = apontamento`): `atual`, `atrasado`, `falha` ou `sem-coleta`, pela regra do núcleo (`seloFrescor`). `ultimaColetaOk` em ISO com `-03:00`, ou `null`. `ultimaTentativa` (opcional, aditivo, 069 M1-a): `{ resultado: "ok" | "parcial" | "falha", fim }` da última coleta terminada, ou `null` sem coleta; coleta parcial não vale como ok (o selo e `ultimaColetaOk` seguem só com sucesso), o campo só permite à tela dizer que a última coleta foi parcial.
- `opcoes`: pessoas na ordem neutra (o1: alfabética pelo rótulo com nomes ligados, por número do `pessoaRef` com nomes desligados); projeto = título da raiz da hierarquia (`dim_card_raiz`), `foraDoEscopo` quando a raiz está fora dos quadros coletados; `sem-projeto` ("Sem iniciativa") quando o card não está na referência; `tipos[].id` = `type_id` do BusinessMap em dígitos (o valor que o filtro `tipo` aceita) e `rotulo` = categoria do card (`dim_card.tipo`); apontamento ainda sem `type_id` (linha não relida pela coleta) soma normalmente e aparece na distribuição como "Sem tipo", mas não é opção de filtro; `historico` = primeiro e último dia com apontamento ativo. `equipes` (opcional, 097 L2) = times do recorte do período: `id` = `slug(nome)` do time do card (`dim_card.equipe`, ou do card pai no lançamento de subtarefa) e `rotulo` = nome do time; lançamento em card sem time (frente, projeto, fora do escopo, ainda não projetado) soma normalmente e aparece como a opção `sem-time` ("Sem time"). O time é o do card, não o da pessoa: quem trabalha em dois times aparece nos dois recortes, cada um com as horas daquele time. Só recorte: nenhum bloco da resposta é agregado por time e o cartão de capacidade por pessoa segue o mesmo (mostra as horas de quem apontou no recorte). Campo ausente: o front trata como lista vazia.
- Apontamento excluído na origem (`excluido_em`) nunca entra nas somas; apontamento sem pessoa (eliminação a pedido) entra só no agregado do time.
- `criterios`: versões de critério (T2.6) do dicionário de subgrupo, do calendário de feriados e dos limiares provisórios dos achados (20, 20, 50, 1 dia, 10 pontos; registrados com data, revistos com 4 semanas de dado real), para marcar nos gráficos. O `id` de cada marca leva o prefixo da família (`dicionario-<n>`, `calendario-<n>` ou `achados-<n>`), que o front usa para desenhar a marca (pedido 089). Desde o pedido 089 há uma versão `dicionario-` que registra: `sem-vinculo` só para o apontamento sem comentário (`execucao-tecnica` deixou de contar como falha de qualidade) e o rótulo "Sem comentário"; a vigência é a data da primeira varredura completa que reclassifica. Sem mudança de formato: `id` já era string.
- Outra área (decisão do dono, 2026-11-02): do time é quem foi responsável por pelo menos um card do escopo do DSPD nos últimos 12 meses. As demais pessoas entram somadas numa entrada única com `pessoaRef: "outra-area"` e `rotulo: "Outra área"` (`identificada: true`), sem nome nem chave da pessoa, também com `nomesReais` ligado. A forma do contrato não muda: `outra-area` é o único valor fixo aceito além de `p<n>`, vem sempre por último na ordem neutra e vale como qualquer `pessoaRef` nos filtros e nas listas. O front mostra o rótulo como vier.
- Comentário escrito com até 3 palavras recebe a marca `generico`; comentário vazio recebe só `sem-comentario`.
- Calendário: o da referência (classe `apontamento` do domínio BusinessMap). Sem carga na referência, os cálculos usam dias úteis sem feriados (ver "Pendências").

### `registroIncompleto` (pedido 063, K-200; campo aditivo, `versaoContrato` segue 1)

Sinal de card do BusinessMap cujo registro de horas está INCOMPLETO na base (a coleta ainda não leu todos os registros dele) e que tem horas ativas no recorte da consulta. Base do aviso de `docs/ux/063-aviso-registro-incompleto.md`. Sempre presente nas respostas deste servidor; o schema o marca como opcional só para tolerar resposta antiga (campo ausente = nada a exibir, nunca "completo").

```json
"registroIncompleto": {
  "total": 2,
  "cards": [
    { "cardId": "9100000001", "titulo": "Título do card no BusinessMap", "projeto": { "id": "900", "rotulo": "Projeto Alfa", "foraDoEscopo": false } },
    { "cardId": "9100000002", "titulo": "Outro card", "projeto": { "id": "sem-projeto", "rotulo": "Sem iniciativa", "foraDoEscopo": true } }
  ],
  "projetoIds": ["900", "sem-projeto"]
}
```

- `total` = `cards.length`. Sem card incompleto no recorte: `{ "total": 0, "cards": [], "projetoIds": [] }` (o front não mostra faixa, selo nem nota).
- `cards[]`: `cardId` (dígitos), `titulo` (`dim_card.titulo`, até 200 caracteres; sem título na base vira `Card <id>`) e `projeto` (`id`, `rotulo` e `foraDoEscopo`, no mesmo formato de `opcoes.projetos`; card sem iniciativa: `id: "sem-projeto"`, `rotulo: "Sem iniciativa"`). Ordem pelo id do card (neutra, nunca por pessoa nem por horas).
- `projetoIds`: ids de projeto (os mesmos de `opcoes.projetos[].id` e das linhas de `distribuicao` por projeto, ou `sem-projeto`) que contêm card incompleto, sem repetição. É o que o front usa para o selo "Horas incompletas" da linha do projeto (`ap-projeto`) e para a coluna "Observação" da tabela alternativa.
- Recorte: o card entra se tem horas ativas (não excluídas) no período `[de, ate]` E nos filtros `projeto` e `tipo`, quando pedidos. O filtro `equipe` também entra nessa lista (time do card, ou do pai). Os demais filtros (`pessoa`, `subtarefa`, `subgrupo`, `qualidade`, `anomalos`) NÃO alteram a lista: o card é incompleto para todo mundo e o aviso nunca é por pessoa.
- Não traz horas faltantes, estimativa, contagem de registros nem pessoa. O único número é `total`.
- Some sozinho: quando a coleta lê o card inteiro numa passagem que cobre toda a janela da carga (carga inicial, retomada ou varredura longa de domingo), grava o evento `completo` e o card sai da lista no carregamento seguinte; o front não guarda nem decide isso.
- Origem: `bm.ctl_apontamento_cobertura` (eventos append-only por card; o estado atual é o último evento), lida pelo papel `dspd_api_apontamento` por GRANT de colunas (`cobertura_sk`, `card_id`, `estado`, `detectado_em`).

Exemplo (recortado; nomes desligados):

```json
{
  "versaoContrato": 1,
  "dominio": "businessmap",
  "periodo": { "de": "2031-01-01", "ate": "2031-02-28" },
  "frescor": { "selo": "atual", "ultimaColetaOk": "2031-02-10T06:10:00-03:00", "ultimaTentativa": { "resultado": "ok", "fim": "2031-02-10T06:10:00-03:00" } },
  "nomesReais": false,
  "opcoes": {
    "pessoas": [{ "pessoaRef": "p1", "rotulo": "Pessoa 1", "identificada": true }],
    "projetos": [{ "id": "9710000001", "rotulo": "Projeto Raiz Teste 059", "foraDoEscopo": false }],
    "tipos": [{ "id": "12", "rotulo": "Melhoria" }],
    "subtarefas": [{ "id": "direto-no-card", "rotulo": "Direto no card" }],
    "subgrupos": [{ "id": "desenvolvimento", "rotulo": "desenvolvimento" }],
    "historico": { "inicio": "2031-01-06", "fim": "2031-04-01" }
  },
  "kpis": { "segundos": 172800, "apontamentos": 24, "pessoasAtivas": 2, "completos": { "status": "ok", "n": 24, "pct": 83.3 }, "atipicos": 0 }
}
```

## Erros

Formato `{ "error": { "code", "message", "details" } }`. **Nunca** devolve o valor recebido.

| Status | Quando | Corpo |
|---|---|---|
| 400 | consulta inválida (chave desconhecida, `pessoa` com nome, `p0`, valor repetido, janela acima do máximo, só um limite, data impossível, lista acima do teto) | `code: "VALIDATION_ERROR"`, `message: "Parâmetros inválidos."`, `details: [{ "path": "pessoa.0", "code": "invalid_format" }]` (só `path` e `code`; nenhuma consulta ao banco é feita) |
| 421 | `Host` fora da lista fechada (`localhost`, `127.0.0.1`, `::1` e o `APONTAMENTO_REDE_LOCAL` declarado) ou `Origin` presente que não seja `http(s)` de um desses nomes | **sem corpo**; comparação exata, sem sufixo nem curinga; a porta não entra; vale com o interruptor ligado ou desligado |
| 500 | falha do banco ou resposta fora do contrato | `code: "INTERNAL_ERROR"`, `message: "Erro interno."`; sem detalhe interno |

O registro de requisição da aba leva só método e caminho (sem consulta, sem `Host`); a falha do banco registra só a classe do erro e o SQLSTATE.

## Configuração (`.env.example`)

| Variável | Efeito |
|---|---|
| `PG_APONTAMENTO_URL` | URL do papel `dspd_api_apontamento`; sem ela a rota não existe. O pool é aberto só em `server/src/modulos/apontamento/`. |
| `APONTAMENTO_NOMES` | `0` (padrão, "Pessoa n") ou `1` (nome real). Valor vazio ou diferente de `0` e `1` recusa a partida. |
| `APONTAMENTO_REDE_LOCAL` | um único IPv4 privado (10/8, 172.16/12, 192.168/16) aceito no `Host` e no `Origin`; recusa `0.0.0.0`, `::`, faixa, lista, nome de host e endereço público. |
| `APONTAMENTO_PUBLICACAO_LOOPBACK` | `1` declara que a porta é publicada só em loopback (necessário no contêiner, onde a API escuta `0.0.0.0`). |

**Guarda de partida:** com `APONTAMENTO_NOMES=1`, `HOST` precisa ser `127.0.0.1`, `::1` ou o `APONTAMENTO_REDE_LOCAL`, ou `0.0.0.0` com `APONTAMENTO_PUBLICACAO_LOOPBACK=1`; senão a partida falha, citando a variável (nunca o valor). Homologação, CI e servidor nunca ligam o nome real (testes sobre os arquivos de compose e de CI). Com o nome real ligado e `APONTAMENTO_REDE_LOCAL`, qualquer máquina da rede local lê a aba com nome, sem autenticação, até o login pelo AD (consequência das decisões "C" e P-1 do dono, ADR 0020 R4-5).

## Para o front (`react-frontend`)

- Consumir só esta rota; filtro de pessoa por `pessoaRef` na URL, nunca nome; não persistir pessoa em `localStorage` nem `sessionStorage`; aba fora da exportação (o4).
- **Mudança em relação à fixture:** o filtro `tipo` está ligado (deixou de responder 422): ofereça-o com `opcoes.tipos`, mandando de volta o `id` da opção na consulta (`?tipo=12&tipo=34`).
- `opcoes.tipos[].id` é o `type_id` do BusinessMap em dígitos (não mais o código do rótulo da categoria: `melhoria`, `sem-tipo`... deixaram de existir nas opções); o rótulo mostrado é o da categoria do card. Linhas sem `type_id` não aparecem nas opções.
- Em desenvolvimento, o proxy do Vite repassa o `Host` do navegador (`localhost`); atrás do nginx do painel, o `Host` original é repassado (`proxy_set_header Host $host`).
- **097 L2 (aditivo, versão do contrato segue 1):** parâmetro opcional `equipe` na consulta e `opcoes.equipes` opcional na resposta (ver acima). O parâmetro `pessoa` continua aceito nesta versão (o front deixa de enviá-lo no L3); a remoção fica para a próxima versão do contrato da aba.
- **097 K-286 (sem mudança de forma):** o mapa diário (`diario`) passa a ser recortado também pelo filtro `equipe` (time do card, como no recorte principal), além de `pessoa`; continua sem olhar `projeto`, `tipo`, `subtarefa`, `subgrupo`, `qualidade` nem `anomalos`. O valor atípico segue decidido sobre o dia inteiro da pessoa, antes de qualquer filtro. Sem pessoa na resposta além do `pessoaRef` já existente e sem comparação entre equipes: vários times valem como um conjunto. O front deixa de listar `Equipe` em "Não afetado por" no cartão do mapa.
- **063 (K-200), campo novo `registroIncompleto`:** ver a seção acima. Ler só `registroIncompleto.cards`, `.total` e `.projetoIds`; campo ausente: exibir a aba normalmente, sem aviso e sem erro; nunca inferir "completo".

## Pendências

1. **Filtro e distribuição por `type_id`: resolvida.** A coluna `fato_apontamento.type_id` (migração 0029 da coleta) é lida pelo papel da aba (GRANT por coluna) e preenchida pela coleta; linhas anteriores à coluna ficam sem tipo até a próxima leitura delas.
2. **Calendário `apontamento`.** Nenhum código carrega ainda `ref_calendario_aplicacao` (classe `apontamento`) nem os feriados (Q-A5, decisão do dono). Sem a carga, capacidade e utilização contam todos os dias úteis, sem feriado.
3. **Rótulo do subgrupo.** Vem de `ref_apontamento_subgrupo` (carga do dicionário pelo `ref:sync`, ainda não escrita); sem a linha, o rótulo é o próprio código, e os residuais `execucao-tecnica` ("Execução técnica") e `nao-classificado` ("Sem comentário", antes "Não classificado"; pedido 089, D3) têm rótulo fixo. Com a troca de rótulo a tabela guarda a linha fechada e a nova: vale a mais recente.
