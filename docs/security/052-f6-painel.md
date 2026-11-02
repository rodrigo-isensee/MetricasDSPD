---
tipo: revisao-seguranca
contrato: 1
pedido: 052-integracao-businessmap
branch: feature/052-f6-painel
commit: c71b2d96d89594b5652286c4e0de59dd80a71063
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-01
---
# Review de segurança: F6 do painel operacional com dado real (pedido 052, E2.73, K-182)

Propósito: parecer de segurança da F6 (delta `e1e5f86..469ee8f`): leitura de `ref_time` e `ref_coluna` pela API, guard `times-sem-comparacao` alterado, base real separada da base do seed pelo prefixo `DSPD_SCHEMA_PREFIXO_SEED`, descarte de tipo fora da lista. Gatilhos: dado de pessoa (nada novo chega à API), banco e configuração (R-SEGURANCA). Público: node-backend (dono do código), tech-lead, qa-engineer (E2.75), Jarvis.

**Veredito: aprovado** em `469ee8f`, mantido por delta em `c71b2d9` (seção abaixo). Nenhum bloqueante; dois recomendados abertos (A1, A3), A2 resolvido. Revisão estática: nada foi chamado no BusinessMap, o `.env` não foi aberto e nenhuma suíte foi executada por mim. Lacuna de ferramenta: `gitleaks`, Semgrep e `osv-scanner` não estão no PATH; o delta não toca dependência, workflow nem `.env`, e li o diff inteiro de `server/src` e as partes de `web` e `packages` que tocam dado.

## Conferência por delta sobre o merge da develop (E2.98, 2026-11-01)
Intervalo `469ee8f..c71b2d9` (`forge-check delta`), mais os commits só de documento até `c44bc7b`. O que entrou:
- **Voltas da F6.** `db37a4b` (A1 do review): a Visão geral decide selo e Exportar pela origem de `VISAO_GERAL`; só rótulo no front, sem dado novo nem chamada nova. `afe7f56`: linha comentada `DSPD_SCHEMA_PREFIXO_SEED` no `.env.example:24`, sem valor, com o aviso de usar prefixo diferente: resolve o A2.
- **Merge c71b2d9.** Comparado com a develop (81fcd63), estão idênticos `coleta.ts`, `http.ts`, `acelerato/`, `dominio-acelerato.ts`, `ref-sync-ac.ts`, `db/grants.ts` e as migrações: nenhuma correção da F4, da coleta nem do Acelerato se perdeu, e o papel `dspd_ref` chega como revisado em `docs/security/056-dominio-listas.md`. O `normalizador.ts` difere da develop só pelas mudanças da F6 (rótulo do contrato em `dim_card.tipo`, `noDia` exportada).
- **Guard de times.** `times-sem-comparacao.test.ts` traz as duas mudanças: a lista fixa de quatro arquivos da F6 e o teste do normalizador (A2 da segurança da F4). A busca por `ref_time` em `server/src` dá exatamente esses quatro arquivos; o Acelerato novo não lê a tabela de times.
- **Seed e real separados.** API, `metricas/`, `referencia/repositorio.ts`, `app.ts`, `web/src` e `packages` não mudaram no merge em relação à F6; `api.ts:15` continua montando `SMock` só com a variável definida, e `config.ts:28` com a mesma regex.
- **Nada de pessoa na API.** O merge não toca GRANT nem migração; `PG_REF_URL` (papel `dspd_ref`) é usado só pelo comando `ac:ref-sync`, fora da API.

## O que foi verificado
- **API sem pessoa.** O delta não toca `grants.ts` nem migração. Os GRANTs de `ref_time`, `ref_time_workflow` e `ref_coluna` para `dspd_api` seguem por coluna (`grants.ts:55`, `:97-99`); só `registrado_por` fica fora (`grants.ts:17-18`) e nenhuma dessas tabelas tem coluna de `COLUNAS_PESSOA`. As novas leituras (`repositorio.ts:88-102`, `referencia/repositorio.ts:14`) pedem nome de time, vigência, tipo e papel de coluna: sem responsável, nome de pessoa, e-mail ou título. `responsaveis` só aparece no delta como fixture de teste.
- **Times: só filtro.** `lerTimesAtivos` devolve `SELECT DISTINCT nome` dos times ativos, em ordem alfabética de nome, para o filtro de equipe; não conta, não soma, não ordena por métrica. `lerColunasReais` só liga a coluna ao time do workflow (`LEFT JOIN`), sem agregação. O guard `times-sem-comparacao.test.ts:14` fixa a lista exata de quatro arquivos que citam `ref_time` e `:17-22` proíbe `GROUP BY`, `count(`, `avg(`, `sum(` e `RANK` nos dois repositórios da API. Nenhuma métrica por time nem por pessoa foi criada.
- **Duas bases sem mistura.** `servico.ts:98-106` escolhe os schemas por métrica (`origemDaMetrica`); `carga`, `marca`, cache de critério e cache de resultado têm chave por base (`servico.ts:163-174`, `:267-270`); as extensões mockadas só entram quando `!real` (`servico.ts:286-287`). No `app.ts:80-85` as extensões mockadas só valem com `SMock`. Nenhuma métrica real é de domínio `ambos`, e BusinessMap e Acelerato seguem com cargas separadas.
- **Variável nova.** `config.ts:27-28` valida o prefixo por regex (`^[a-z][a-z0-9_]{0,30}$`) e `montarEsquemas` o revalida (`esquemas.ts:8-11`); o identificador não vem de entrada do usuário. Sem credencial nem URL na variável. `api.ts:15` só monta `SMock` quando ela existe. O mesmo pool `dspd_api` e os GRANTs por coluna valem nas duas bases.
- **Descarte de tipo.** `mapa.ts:137-139` filtra por `TIPOS_CARD` e só a contagem sai, por `servico.ts:116-118` (`{ cardsForaDoContrato: n }`); nenhum valor de card, título ou id no log. `normalizador.ts:199` grava o rótulo do contrato; sem cast cego.
- **SQL.** Interpolação só de esquemas validados e constantes (`repositorio.ts:66-72`, `:88-102`); sem valor vindo de requisição.

## Achados
- A1 (recomendado) server/src/plataforma/config.ts:28 · `DSPD_SCHEMA_PREFIXO_SEED` igual a `DSPD_SCHEMA_PREFIXO` não é recusado; as métricas "mock" leriam a base real com extensões mockadas, sob selo de fictício. Recuse prefixos iguais na partida. Segue aberto em c71b2d9. Dono: node-backend.
- A2 (recomendado) .env.example:24 · resolvido em afe7f56: a variável está documentada, comentada e sem valor, com o aviso de prefixo diferente. Nada a fazer. Dono: node-backend.
- A3 (recomendado) server/tests/times-sem-comparacao.test.ts:20 · o guard de agregação cobre só SQL e só os repositórios e o normalizador; `limitesDosTimes` (`mapa.ts:92-98`) soma limite de WIP por time em JavaScript, fora do guard. Cubra `mapa.ts` com a lista fixa de usos. Segue aberto. Dono: node-backend.

### Detalhe
Caminho de ataque: nenhum atacante. O risco é de regra inviolável por regressão: alguém reutilizar `limitesDosTimes` ou o join com `ref_time` para ordenar ou comparar times e passar no guard. Severidade: baixa. A1 só ocorre por erro de configuração na máquina do dono (o `.env.example` agora avisa). Esforço: P cada.

## Plano em cartões
- A1 e A3: cartões recomendados ao node-backend, sem devolver a F6; entram quando houver volta por outro motivo (promoção a bloqueante exige `critério mudou:`).

## Riscos aceitos
Nenhum novo. Seguem em vigor os aceites do pedido (chave do dono com poder de escrita, coleta na máquina do dono, nomes só em `COLUNAS_PESSOA`).
