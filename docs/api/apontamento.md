# API: aba Apontamento (`GET /api/apontamento`)

Pedido 059 (K-193), trilha B4. Contrato zod em `packages/contratos/src/apontamento.ts` (versão 1; mudar a forma depois que o front começou é mudança de contrato, `docs/contratos/politica-de-mudanca.md`). Decisão de arquitetura: ADR 0020, revisão 4 (R4-5); plano `docs/architecture/features/059-aba-apontamento.md` §3.8 e §3.9. Só BusinessMap; nunca Acelerato.

Exceção aprovada pelo dono à regra de métrica individual (cláusulas o1 a o4): ordem neutra das pessoas, sem semáforo nem média por pessoa, percentual por pessoa só com 20 apontamentos ou mais, aba fora da exportação. As horas servem a capacidade, utilização e distribuição do tempo, nunca a esforço de entrega, velocidade, custo de card ou meta.

## Rota única

`GET /api/apontamento` (fora do prefixo `/api/v1`). A rota só existe quando a API sobe com `PG_APONTAMENTO_URL` (papel `dspd_api_apontamento`); sem ela, 404. Nenhuma outra rota devolve nome, `pessoaRef`, `responsavel_id` nem `user_id`.

- **Autenticação:** nenhuma (decisão "C" do dono: qualquer usuário do painel vê a aba). Não substitui o login pelo AD, fatia futura.
- **Cabeçalhos de toda resposta da aba (inclusive 400, 421, 422 e 500):** `Cache-Control: no-store`. Nenhum `Access-Control-*` (CORS fechado).
- **Cálculo:** nenhum na rota nem no front. Tudo vem de `calcularApontamento` (biblioteca T2.5, `@metricas-dspd/metricas/businessmap`); a rota lê as linhas, monta a moldura (período, opções, frescor, critérios) e valida a resposta com `respostaApontamentoSchema`.

## Consulta (`querystring`, estrita)

Chave desconhecida é 400. Listas separadas por vírgula (ou parâmetro repetido); valor repetido na lista é 400. Nada de texto livre.

| Parâmetro | Tipo | Padrão | Regra |
|---|---|---|---|
| `de`, `ate` | `AAAA-MM-DD` | 12 semanas terminando hoje (America/Sao_Paulo) | os dois ou nenhum; `de <= ate`; no máximo 366 dias (inclusive); data existente |
| `pessoa` | lista de `pessoaRef` (`p1`, `p27`) | todas | até 200; nunca nome |
| `projeto` | lista de `card_id` da raiz (dígitos) | todos | até 200 |
| `tipo` | lista de `type_id` (dígitos) | todos | até 50. **Ainda não atendido: 422 `FILTRO_INDISPONIVEL`** (ver "Pendências") |
| `subtarefa` | lista de códigos (`em-subtarefa`, `direto-no-card`) | todas | até 50 |
| `subgrupo` | lista de códigos do dicionário | todos | até 50 |
| `qualidade` | lista de `sem-comentario`, `generico`, `sem-vinculo`, `sem-iniciativa`, `valor-atipico`, `completo` | todas | até 6 |
| `nivelMatriz` | `tipo` \| `subtarefa` \| `subgrupo` | `tipo` | um nível por vez |
| `diarioDe`, `diarioAte` | `AAAA-MM-DD` | 4 semanas terminando no fim do período | os dois ou nenhum; no máximo 62 dias |
| `anomalos` | `incluir` \| `ocultar` | `incluir` | valor atípico (soma do dia da pessoa acima de 16 h) é marcado, nunca descartado |

## Resposta 200

`respostaApontamentoSchema` (`packages/contratos/src/apontamento.ts`): `versaoContrato`, `dominio: "businessmap"`, `periodo`, `frescor { selo, ultimaColetaOk }`, `nomesReais`, `opcoes { pessoas, projetos, tipos, subtarefas, subgrupos, historico }`, `kpis`, `distribuicao`, `qualidade`, `matriz`, `capacidade`, `diario`, `achados`, `criterios`. Horas em segundos inteiros (o front só formata). Pessoa só por `pessoaRef`.

- `nomesReais`: `true` só com `APONTAMENTO_NOMES=1`. Desligado (padrão), `opcoes.pessoas[].rotulo` é `Pessoa n` (n = número do `pessoaRef`) e o banco nem recebe consulta ao nome. Ligado, o rótulo é o nome real e é o **único** lugar do corpo em que ele aparece; pessoa sem nome na referência vira `Pessoa não identificada` com `identificada: false`. É pseudonimização, não anonimato: nenhuma legenda deve prometer anonimato.
- `frescor`: selo da última coleta do worklog (`tarefa = apontamento`): `atual`, `atrasado`, `falha` ou `sem-coleta`, pela regra do núcleo (`seloFrescor`). `ultimaColetaOk` em ISO com `-03:00`, ou `null`.
- `opcoes`: pessoas na ordem neutra (o1: alfabética pelo rótulo com nomes ligados, por número do `pessoaRef` com nomes desligados); projeto = título da raiz da hierarquia (`dim_card_raiz`), `foraDoEscopo` quando a raiz está fora dos quadros coletados; `sem-projeto` ("Sem iniciativa") quando o card não está na referência; `historico` = primeiro e último dia com apontamento ativo.
- Apontamento excluído na origem (`excluido_em`) nunca entra nas somas; apontamento sem pessoa (eliminação a pedido) entra só no agregado do time.
- `criterios`: versões de critério (T2.6) do dicionário de subgrupo e do calendário de feriados, para marcar nos gráficos.
- Calendário: o da referência (classe `apontamento` do domínio BusinessMap). Sem carga na referência, os cálculos usam dias úteis sem feriados (ver "Pendências").

Exemplo (recortado; nomes desligados):

```json
{
  "versaoContrato": 1,
  "dominio": "businessmap",
  "periodo": { "de": "2031-01-01", "ate": "2031-02-28" },
  "frescor": { "selo": "atual", "ultimaColetaOk": "2031-02-10T06:10:00-03:00" },
  "nomesReais": false,
  "opcoes": {
    "pessoas": [{ "pessoaRef": "p1", "rotulo": "Pessoa 1", "identificada": true }],
    "projetos": [{ "id": "9710000001", "rotulo": "Projeto Raiz Teste 059", "foraDoEscopo": false }],
    "tipos": [{ "id": "melhoria", "rotulo": "Melhoria" }],
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
| 422 | `tipo` informado (filtro ainda não disponível) | `code: "FILTRO_INDISPONIVEL"` |
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
- **Mudança em relação à fixture:** o filtro `tipo` ainda responde 422; não ofereça o filtro por tipo até a pendência abaixo ser resolvida (a distribuição e a matriz por tipo funcionam, com o rótulo da categoria do card).
- `opcoes.tipos[].id` é o código do rótulo da categoria (`melhoria`, `bug-interno`, `sem-tipo`...), não o `type_id` do BusinessMap.
- Em desenvolvimento, o proxy do Vite repassa o `Host` do navegador (`localhost`); atrás do nginx do painel, o `Host` original é repassado (`proxy_set_header Host $host`).

## Pendências

1. **Filtro e distribuição por `type_id`.** O fato do apontamento não guarda o `type_id` do card (só a staging de cards o tem, e o papel da aba não lê `stg_`). A rota usa `dim_card.tipo` (rótulo da categoria, ADR 0024; vazio para card que não é item). O filtro `tipo` por `type_id` exige uma coluna nova em `fato_apontamento` preenchida pela coleta: decisão do tech-lead e do arquiteto (muda migração e coletor da trilha A).
2. **Calendário `apontamento`.** Nenhum código carrega ainda `ref_calendario_aplicacao` (classe `apontamento`) nem os feriados (Q-A5, decisão do dono). Sem a carga, capacidade e utilização contam todos os dias úteis, sem feriado.
3. **Rótulo do subgrupo.** Vem de `ref_apontamento_subgrupo` (carga do dicionário pelo `ref:sync`, ainda não escrita); sem a linha, o rótulo é o próprio código, e os residuais `execucao-tecnica` e `nao-classificado` têm rótulo fixo.
