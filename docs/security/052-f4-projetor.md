---
tipo: revisao-seguranca
contrato: 1
pedido: 052-integracao-businessmap
branch: feature/052-f4-projetor
commit: 7a1907a3895d2727103f7582183e6262840f58b2
parecer: aprovado
revisor: forge:security-engineer
data: 2026-10-31
---
# Review de segurança: F4 do coletor do BusinessMap, normalizador e projetor (pedido 052, E2.60 e E2.65, K-182)

Propósito: parecer de segurança da F4 (`369d018`, `50b8b51`, `783612d`; diff `dd15c93...783612d`): comando `bm:projetar`, opção `--projetar` do `bm:coleta`, reconstrução da projeção, leitura de `ref_time` pelo projetor e mudança no guard `times-sem-comparacao`. Renovado por delta sobre `7a1907a` (E2.63). Gatilhos: dado de pessoa (responsáveis, nomes) e banco (R-SEGURANCA). Público: node-backend (dono do código), tech-lead, qa-engineer (E2.61), Jarvis.

**Veredito: aprovado** em `7a1907a`. Nenhum achado bloqueante; um recomendado aberto (A1), e A2 resolvido. Revisão estática: nada foi chamado no BusinessMap, o `.env` não foi aberto e nenhuma suíte foi executada por mim (a E2.61 roda a suíte .pg). Lacuna de ferramenta: sem varredura SAST nem `gitleaks` nesta rodada; os controles abaixo foram lidos no código e nos testes.

## O que foi verificado
- **`dspd_api` sem leitura de pessoa.** O diff não toca `grants.ts` nem migração. `grants.ts:55` dá à API só as colunas fora de `COLUNAS_PESSOA` e `COLUNAS_FORA_DA_API`; `dim_responsavel` só recebe GRANT do coletor (`grants.ts:73-74`) e não está em `paraApi`. O teste `projetor-businessmap.pg.test.ts:239-250` prova, com o papel `dspd_api` real, a recusa de `SELECT responsaveis` e de `SELECT *` em `dim_card`, `dim_card_versao` e `dim_responsavel`.
- **Projetor sem cliente HTTP e sem escrever nome.** `projetor.ts` importa só pool, esquemas, trava, `ErroColetaBm` e `responsaveis.ts`; não há `fetch`, cliente nem URL. `config.ts:77-78` (`esquemaProjetorBusinessMap`) exige só `PG_COLETOR_URL`: o comando não lê chave nem host do BusinessMap. Só ids de responsável passam (`Map` em memória, `coleta.ts:190-192`); `dim_responsavel` nunca é escrita pelo projetor (a gravação de ids em `dim_card` e `dim_card_versao` passa por `gravarResponsaveis`, já revisada na F3). O mapa não vai a log, banco nem resultado (`ResultadoComando` só traz contagens).
- **Reconstrução com lista explícita.** `projetor.ts:21` (`TABELAS_LIMPAS_NA_RECONSTRUCAO = ['dim_card']`), usada em `projetor.ts:210`; `dim_responsavel`, `evt_card`, `fato_transicao` e `dim_card_versao` não são tocadas. Os ids de responsável de `dim_card` voltam da versão vigente (`projetor.ts:161-165`) e a limpeza ocorre na mesma transação da reprojeção (rollback inteiro em erro). Teste: `projetor-businessmap.pg.test.ts:288-304` (nomes e `atualizado_em` preservados, zero chamadas a `/users`).
- **Guard de times.** A leitura de `ref_time` e `ref_time_workflow` está só em `projetor.ts:58-59` (papel `dspd_coletor`, fora da API); o nome do time vira `dim_card.equipe` por card, no dia do evento (`normalizador.ts:169`), sem agrupar, contar nem comparar. O guard (`times-sem-comparacao.test.ts:10-18`) fixa a lista exata de arquivos e proíbe `GROUP BY`, `count(`, `avg(`, `sum(`, `RANK` e `ORDER BY ... equipe` no projetor. Não há métrica por time nem por pessoa no diff.
- **`bm:projetar`.** Só `PG_COLETOR_URL` (`projetor-businessmap.ts:28`); `.env` lido só pelo programa e erro de leitura vira código (`:16-19`); saída em JSON só com contagens e códigos (`:30`); erro sai como código, sem mensagem de driver (`:33`); argumentos fora do formato recusados sem eco (`projetor.ts:236-242`). A execução corre sob a trava da fonte (`projetor.ts:247`).
- **SQL.** Parâmetros posicionais em todo valor (`projetor.ts:145-181`); o que é interpolado vem de constantes (esquemas, `COLUNAS_VERSAO`, `TAMANHO_LOTE`, notas fixas de `normalizador.ts`). Sem injeção.
- **Append-only.** Fatos e versões entram com `ON CONFLICT ... DO NOTHING` (`projetor.ts:145-151`, `:177`); `dim_card` é projeção com `DELETE` por card, permitido pelo GRANT de projeção (`grants.ts:64`).

## Revalidação por delta (E2.65)
Delta `88983e0..7a1907a` (E2.63), lido inteiro; `projetor.ts`, `grants.ts` e migrações ficaram fora dele.
- **A2 resolvido.** `times-sem-comparacao.test.ts:20-24` estende o guard a `normalizador.ts` (sem `GROUP BY`, `count(`, `sort`, `reduce` nem `Map` por equipe). O normalizador não agrupa por equipe: o único `Map` (`normalizador.ts:56`) indexa vigências de referência por id. Limite: o guard é por regex e não pega `groupBy`; vale como defesa em profundidade, sem devolver.
- **Equipe nula em frente e projeto.** `normalizador.ts:175`: só `story` exige equipe, e workflow fora (H-7) segue fora. Frente e projeto saem com `equipe` nula, o que reduz dado ligado a time; nenhum agrupamento novo e nada lê pessoa (`responsaveis` não aparece no delta).
- **Z e dia do evento.** `normalizador.ts:24` (Z vale +00:00) e `:162` (tipo no dia do evento) são cálculo de data, sem efeito em acesso, segredo ou pessoa.
- **Testes.** `projetor-businessmap.pg.test.ts:19-22` usa os nomes de time de `TIMES_PROPRIOS` (migração 0019), sem dado inventado de pessoa; o caso de projeto sem time está em `:185-189`.
- **A1 segue aberto (recomendado):** o delta não toca o título.

## Achados
- A1 (recomendado) server/src/modulos/businessmap/normalizador.ts:189 · `dim_card.titulo` passa a receber o título real, e a API o serve; é texto livre (L-2). Peça ao dono a confirmação de que o L-2 cobre a exposição pela API, ou tire `titulo` da leitura da API até lá. Dono: Jarvis e node-backend.
- A2 (recomendado) server/tests/times-sem-comparacao.test.ts:20 · resolvido em 7a1907a; o guard só varria `projetor.ts`; agrupar por `equipe` em JavaScript no `normalizador.ts` passaria. Resolvido: guard estendido ao normalizador.

### Detalhe do A1
Evidência: `normalizador.ts:189` (`texto(e.card.title)` cortado em 500) e `projetor.ts:181` (coluna `titulo` na projeção); `repositorio.ts:51` lê `titulo` e `mapa.ts:40` o entrega. Caminho de ataque: não há atacante; o risco é exposição acidental, um usuário do painel ver um título com dado de terceiro digitado por quem cria o card, hoje só com dado de teste e, após a carga real, com dado real. A coluna e a leitura já existiam; a F4 é a primeira a preenchê-la com dado real. O staging já guarda o título por decisão (L-2, I-4). Severidade: baixa. Esforço: P.

## Plano em cartões
- Cartão (decisão do dono, via Jarvis): A1, cobertura do L-2 sobre `dim_card.titulo` na API; sem bloquear a F4.
- A2: fechado em `7a1907a`; nenhum cartão.

## Riscos aceitos
Nenhum novo. Seguem em vigor os aceites anteriores do pedido (chave do dono com poder de escrita, coleta na máquina do dono, nomes só em `COLUNAS_PESSOA`).
