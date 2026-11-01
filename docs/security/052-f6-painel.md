---
tipo: revisao-seguranca
contrato: 1
pedido: 052-integracao-businessmap
branch: feature/052-f6-painel
commit: 469ee8fd28171e9473a7f64d751b521ecedbd7da
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-01
---
# Review de segurança: F6 do painel operacional com dado real (pedido 052, E2.73, K-182)

Propósito: parecer de segurança da F6 (delta `e1e5f86..469ee8f`): leitura de `ref_time` e `ref_coluna` pela API, guard `times-sem-comparacao` alterado, base real separada da base do seed pelo prefixo `DSPD_SCHEMA_PREFIXO_SEED`, descarte de tipo fora da lista. Gatilhos: dado de pessoa (nada novo chega à API), banco e configuração (R-SEGURANCA). Público: node-backend (dono do código), tech-lead, qa-engineer (E2.75), Jarvis.

**Veredito: aprovado** em `469ee8f`. Nenhum bloqueante; três recomendados. Revisão estática: nada foi chamado no BusinessMap, o `.env` não foi aberto e nenhuma suíte foi executada por mim. Lacuna de ferramenta: `gitleaks`, Semgrep e `osv-scanner` não estão no PATH; o delta não toca dependência, workflow nem `.env`, e li o diff inteiro de `server/src` e as partes de `web` e `packages` que tocam dado.

## O que foi verificado
- **API sem pessoa.** O delta não toca `grants.ts` nem migração. Os GRANTs de `ref_time`, `ref_time_workflow` e `ref_coluna` para `dspd_api` seguem por coluna (`grants.ts:55`, `:97-99`); só `registrado_por` fica fora (`grants.ts:17-18`) e nenhuma dessas tabelas tem coluna de `COLUNAS_PESSOA`. As novas leituras (`repositorio.ts:88-102`, `referencia/repositorio.ts:14`) pedem nome de time, vigência, tipo e papel de coluna: sem responsável, nome de pessoa, e-mail ou título. `responsaveis` só aparece no delta como fixture de teste.
- **Times: só filtro.** `lerTimesAtivos` devolve `SELECT DISTINCT nome` dos times ativos, em ordem alfabética de nome, para o filtro de equipe; não conta, não soma, não ordena por métrica. `lerColunasReais` só liga a coluna ao time do workflow (`LEFT JOIN`), sem agregação. O guard `times-sem-comparacao.test.ts:14` fixa a lista exata de quatro arquivos que citam `ref_time` e `:17-22` proíbe `GROUP BY`, `count(`, `avg(`, `sum(` e `RANK` nos dois repositórios da API. Nenhuma métrica por time nem por pessoa foi criada.
- **Duas bases sem mistura.** `servico.ts:98-106` escolhe os schemas por métrica (`origemDaMetrica`); `carga`, `marca`, cache de critério e cache de resultado têm chave por base (`servico.ts:163-174`, `:267-270`); as extensões mockadas só entram quando `!real` (`servico.ts:286-287`). No `app.ts:80-85` as extensões mockadas só valem com `SMock`. Nenhuma métrica real é de domínio `ambos`, e BusinessMap e Acelerato seguem com cargas separadas.
- **Variável nova.** `config.ts:27-28` valida o prefixo por regex (`^[a-z][a-z0-9_]{0,30}$`) e `montarEsquemas` o revalida (`esquemas.ts:8-11`); o identificador não vem de entrada do usuário. Sem credencial nem URL na variável. `api.ts:15` só monta `SMock` quando ela existe. O mesmo pool `dspd_api` e os GRANTs por coluna valem nas duas bases.
- **Descarte de tipo.** `mapa.ts:137-139` filtra por `TIPOS_CARD` e só a contagem sai, por `servico.ts:116-118` (`{ cardsForaDoContrato: n }`); nenhum valor de card, título ou id no log. `normalizador.ts:199` grava o rótulo do contrato; sem cast cego.
- **SQL.** Interpolação só de esquemas validados e constantes (`repositorio.ts:66-72`, `:88-102`); sem valor vindo de requisição.

## Achados
- A1 (recomendado) server/src/plataforma/config.ts:28 · `DSPD_SCHEMA_PREFIXO_SEED` igual a `DSPD_SCHEMA_PREFIXO` não é recusado; as métricas "mock" leriam a base real com extensões mockadas, sob selo de fictício. Recuse prefixos iguais na partida. Dono: node-backend.
- A2 (recomendado) .env.example:21 · a variável nova não está documentada (o `.env.example` não cita `DSPD_SCHEMA_PREFIXO_SEED`; a E2.69 foi barrada ao autor). Acrescente a linha comentada, sem valor, explicando que liga o modo de duas bases. Dono: Jarvis ou node-backend.
- A3 (recomendado) server/tests/times-sem-comparacao.test.ts:20 · o guard de agregação cobre só SQL e só dois repositórios; `limitesDosTimes` (`mapa.ts:92-98`) soma limite de WIP por time em JavaScript, fora do guard. Hoje é configuração, não desempenho. Cubra `mapa.ts` com a lista fixa de usos. Dono: node-backend.

### Detalhe
Caminho de ataque: nenhum atacante. O risco é de regra inviolável por regressão: alguém reutilizar `limitesDosTimes` ou o join com `ref_time` para ordenar ou comparar times e passar no guard. Severidade: baixa nos três. A1 só ocorre por erro de configuração na máquina do dono; A2 é documentação. Esforço: P cada.

## Plano em cartões
- A1, A2 e A3: cartões recomendados ao node-backend, sem devolver a F6; entram quando houver volta por outro motivo (promoção a bloqueante exige `critério mudou:`).

## Riscos aceitos
Nenhum novo. Seguem em vigor os aceites do pedido (chave do dono com poder de escrita, coleta na máquina do dono, nomes só em `COLUNAS_PESSOA`).
