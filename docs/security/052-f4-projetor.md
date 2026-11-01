---
tipo: revisao-seguranca
contrato: 1
pedido: 052-integracao-businessmap
branch: feature/052-f4-projetor
commit: 783612d50dc4da48d04ab19eb4e91b6abc727a09
parecer: aprovado
revisor: forge:security-engineer
data: 2026-10-31
---
# Review de segurança: F4 do coletor do BusinessMap, normalizador e projetor (pedido 052, E2.60, K-182)

Propósito: parecer de segurança da F4 (`369d018`, `50b8b51`, `783612d`; diff `dd15c93...783612d`): comando `bm:projetar`, opção `--projetar` do `bm:coleta`, reconstrução da projeção, leitura de `ref_time` pelo projetor e mudança no guard `times-sem-comparacao`. Gatilhos: dado de pessoa (responsáveis, nomes) e banco (R-SEGURANCA). Público: node-backend (dono do código), tech-lead, qa-engineer (E2.61), Jarvis.

**Veredito: aprovado** em `783612d`. Nenhum achado bloqueante; um recomendado (A1) e uma observação de defesa em profundidade (A2). Revisão estática: nada foi chamado no BusinessMap, o `.env` não foi aberto e nenhuma suíte foi executada por mim (a E2.61 roda a suíte .pg). Lacuna de ferramenta: sem varredura SAST nem `gitleaks` nesta rodada; os controles abaixo foram lidos no código e nos testes.

## O que foi verificado
- **`dspd_api` sem leitura de pessoa.** O diff não toca `grants.ts` nem migração. `grants.ts:55` dá à API só as colunas fora de `COLUNAS_PESSOA` e `COLUNAS_FORA_DA_API`; `dim_responsavel` só recebe GRANT do coletor (`grants.ts:73-74`) e não está em `paraApi`. O teste `projetor-businessmap.pg.test.ts:239-250` prova, com o papel `dspd_api` real, a recusa de `SELECT responsaveis` e de `SELECT *` em `dim_card`, `dim_card_versao` e `dim_responsavel`.
- **Projetor sem cliente HTTP e sem escrever nome.** `projetor.ts` importa só pool, esquemas, trava, `ErroColetaBm` e `responsaveis.ts`; não há `fetch`, cliente nem URL. `config.ts:77-78` (`esquemaProjetorBusinessMap`) exige só `PG_COLETOR_URL`: o comando não lê chave nem host do BusinessMap. Só ids de responsável passam (`Map` em memória, `coleta.ts:190-192`); `dim_responsavel` nunca é escrita pelo projetor (a gravação de ids em `dim_card` e `dim_card_versao` passa por `gravarResponsaveis`, já revisada na F3). O mapa não vai a log, banco nem resultado (`ResultadoComando` só traz contagens).
- **Reconstrução com lista explícita.** `projetor.ts:21` (`TABELAS_LIMPAS_NA_RECONSTRUCAO = ['dim_card']`), usada em `projetor.ts:210`; `dim_responsavel`, `evt_card`, `fato_transicao` e `dim_card_versao` não são tocadas. Os ids de responsável de `dim_card` voltam da versão vigente (`projetor.ts:161-165`) e a limpeza ocorre na mesma transação da reprojeção (rollback inteiro em erro). Teste: `projetor-businessmap.pg.test.ts:288-304` (nomes e `atualizado_em` preservados, zero chamadas a `/users`).
- **Guard de times.** A leitura de `ref_time` e `ref_time_workflow` está só em `projetor.ts:58-59` (papel `dspd_coletor`, fora da API); o nome do time vira `dim_card.equipe` por card, no dia do evento (`normalizador.ts:169`), sem agrupar, contar nem comparar. O guard (`times-sem-comparacao.test.ts:10-18`) fixa a lista exata de arquivos e proíbe `GROUP BY`, `count(`, `avg(`, `sum(`, `RANK` e `ORDER BY ... equipe` no projetor. Não há métrica por time nem por pessoa no diff.
- **`bm:projetar`.** Só `PG_COLETOR_URL` (`projetor-businessmap.ts:28`); `.env` lido só pelo programa e erro de leitura vira código (`:16-19`); saída em JSON só com contagens e códigos (`:30`); erro sai como código, sem mensagem de driver (`:33`); argumentos fora do formato recusados sem eco (`projetor.ts:236-242`). A execução corre sob a trava da fonte (`projetor.ts:247`).
- **SQL.** Parâmetros posicionais em todo valor (`projetor.ts:145-181`); o que é interpolado vem de constantes (esquemas, `COLUNAS_VERSAO`, `TAMANHO_LOTE`, notas fixas de `normalizador.ts`). Sem injeção.
- **Append-only.** Fatos e versões entram com `ON CONFLICT ... DO NOTHING` (`projetor.ts:145-151`, `:177`); `dim_card` é projeção com `DELETE` por card, permitido pelo GRANT de projeção (`grants.ts:64`).

## Achados
- A1 (recomendado) server/src/modulos/businessmap/normalizador.ts:189 · `dim_card.titulo` agora recebe o título real do card (até 500 caracteres) e a API o serve (`mapa.ts:40`); o título é texto livre que pode ter nome de pessoa ou cliente (L-2). Peça ao dono a confirmação de que o L-2 cobre a exposição pela API e pelo navegador, ou omita `titulo` da leitura da API até lá. Dono: Jarvis (decisão) e node-backend.
- A2 (recomendado) server/tests/times-sem-comparacao.test.ts:18 · o guard só varre `projetor.ts`; um agrupamento por `equipe` em JavaScript no `normalizador.ts` ou em módulo novo passaria. Estenda o guard a `normalizador.ts` (sem `groupBy`, `reduce` nem `Map` chaveado por `equipe`) ou documente o limite no teste. Dono: node-backend.

### Detalhe do A1
Evidência: `normalizador.ts:189` (`texto(e.card.title)` cortado em 500) e `projetor.ts:181` (coluna `titulo` na projeção); `repositorio.ts:51` lê `titulo` e `mapa.ts:40` o entrega. Caminho de ataque: não há atacante; o risco é exposição acidental, um usuário do painel ver um título com dado de terceiro digitado por quem cria o card, hoje só com dado de teste e, após a carga real, com dado real. A coluna e a leitura já existiam; a F4 é a primeira a preenchê-la com dado real. O staging já guarda o título por decisão (L-2, I-4). Severidade: baixa. Esforço: P.

### Detalhe do A2
Evidência: `times-sem-comparacao.test.ts:18` testa só o texto de `projetor.ts`. Caminho: regressão interna futura; hoje `normalizador.ts` não agrupa por equipe. Severidade: informativa. Esforço: P.

## Plano em cartões
- Cartão (decisão do dono, via Jarvis): A1, cobertura do L-2 sobre `dim_card.titulo` na API; sem bloquear a F4.
- Cartão (node-backend): A2, no próximo toque do guard, sem devolver a F4.

## Riscos aceitos
Nenhum novo. Seguem em vigor os aceites anteriores do pedido (chave do dono com poder de escrita, coleta na máquina do dono, nomes só em `COLUNAS_PESSOA`).
