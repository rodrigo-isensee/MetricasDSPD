---
tipo: revisao-seguranca
contrato: 1
pedido: 059-aba-apontamento
branch: feature/059-coleta-worklog
commit: 82d136001f371cef0e142426d092e4b1f15e6df3
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-02
---
# Review de segurança da branch da coleta do worklog (pedido 059, E2.26, K-193)

**Rodada 2 (revalidação por delta).** Intervalo: `2462ee5..82d1360` (16 commits, 33 arquivos, +940 -88), lido com `forge-check delta --parecer docs/security/059-beta.md`. Referências: ADR 0025 no ramo `docs/059-apontamento-discovery` em 5661e86 (itens 4, 5, 9 e 10 alinhados às decisões A2 e A7 do plano), revisão 4 da ADR 0020 e o parecer `docs/security/059-adrs.md`. Revisão estática: o `.env` não foi lido, nada foi chamado no BusinessMap, nenhum nome, e-mail ou id de pessoa aparece aqui. Público: node-backend (dono do código), tech-lead, Jarvis.

**Veredito: aprovado em 82d1360.** O bloqueante A1 da rodada 1 está corrigido e testado; os recomendados A2 e A3 também. As decisões de modelagem A2 (staging com `versao`) e A7 (recusa de registro sem segurar a marca) não abrem caminho para pessoa nem texto livre. Fica um recomendado (A4), que não devolve.

## Gatilhos
Dado pessoal (nome, `user_id`, `pessoa_ref`, comentário do apontamento), integração externa (chave do BusinessMap), migração nova (0032) com gatilho de imutabilidade desligado dentro dela, segredo (`PESSOA_ELIMINADA_SAL`), eliminação a pedido. Nenhum workflow, compose, hook ou controle do Forge muda neste intervalo (conferido no `diff --stat`).

## Achados
- A4 (recomendado) server/src/modulos/businessmap/apontamento/coleta.ts:161 · o worklog pede /users e grava o nome de quem é de Outra área, que a aba nunca mostra com nome; minimização a decidir na fatia de retenção (sem mudança desde a rodada 1).

## Resolução dos achados da rodada 1
- **A1 (bloqueante): resolvido.** `resolverResponsaveis` recebe o sal (`server/src/modulos/businessmap/usuarios.ts:55-68`): com sal válido, os ids suprimidos saem antes do pedido e antes do UPSERT (a gravação já só aceita ids pedidos no lote, `usuarios.ts:87`); sem sal ou com sal curto e `cfg_pessoa_eliminada` não vazia, a etapa não roda e devolve `sem-sal`, registrado em `ctl_coleta_falha` só com o código (`server/src/modulos/businessmap/coleta.ts:320-321`). O sal chega da entrada pelo comando (`server/src/entradas/coleta-businessmap.ts:39`, `server/src/modulos/businessmap/coleta-comando.ts:109`). `resolverResponsaveis` tem só dois chamadores (coleta de cards e worklog), os dois com o sal; o projetor não escreve em `dim_responsavel` (`projetor.ts:15`). O `dspd_coletor` já tinha SELECT na lista. Testes: unitários com o HMAC (só o hash vai ao banco) em `server/tests/usuarios-businessmap.test.ts:136-191` e `.pg` da recriação pelos cards, com e sem sal, em `server/tests/coleta-businessmap.pg.test.ts:300-332`. Textos de `eliminacao.ts:13` e `server.md:202` corrigidos. A view de quem é do time da rota junta com `dim_responsavel`: sem a linha, não há `pessoa_ref`; a conferência na view fica para a segurança da rota depois do merge (`059-rota-apontamento.md`).
- **A2 (recomendado): resolvido.** `--usuario=-` lê o id da entrada padrão, com teto de 64 bytes, formato `^[1-9]\d{0,11}$` e recusa sem eco (`eliminacao.ts:29-50`); a doc indica `read -rs` (`server.md:202`). O id por argumento segue aceito só para teste; o caminho documentado é a entrada padrão.
- **A3 (recomendado): resolvido.** `server.md:206` pede 32 bytes aleatórios em hexadecimal (`openssl rand -hex 32`), explica o risco de força bruta com sal fraco e que a guarda só confere o tamanho.

## Decisões de modelagem A2 e A7 (plano §3.1 e §3.3, ADR 0025 itens 4, 5, 9 e 10)
- **Staging com `versao` (0032, `gravacao.ts:41-56`).** Só entra a coluna `versao` (smallint, CHECK >= 1) e a chave `UNIQUE (logged_time_id, versao)`; nenhuma coluna de pessoa ou texto livre. O hash continua sobre a allow-list mais a classificação, nunca sobre o comentário ou o `user_id` (`registro.ts:124-134`). O INSERT segue parametrizado (JSON por `$1`, lista de colunas de constante) e append-only: linha nova só quando o hash difere da última versão, `ON CONFLICT ... DO NOTHING`. O gatilho `tg_stg_apontamento_imutavel` fica desligado só entre o preenchimento e a volta, dentro da transação da migração (`migrar.ts:59`), pelo dono do esquema; a ordem é travada por teste (`apontamento-esquema.test.ts:138-142`), sem DELETE nem TRUNCATE; o `down` recusa quando a chave antiga não comporta. O `dspd_coletor` segue sem UPDATE na staging. Teto de 32767 versões por id: só se alcança com uma edição que mude o hash a cada coleta diária, sem caminho realista.
- **Recusa de registro sem segurar a marca e guarda `recusa_em_massa` (`coleta.ts:30-37`, `:188-205`, `:288-291`).** A recusa vai a `ctl_coleta_falha` com código de lista fechada e `id_origem` = `logged_time_id` em dígitos (`registro.ts:81-111`), e ao JSON só como contagem por código (`recusados`); nenhum valor lido, `user_id` ou comentário. Recusa com id inválido tira o lote de completo (direção segura: sem exclusão falsa); com id válido o id entra nos vistos e o apontamento não é dado como excluído. A guarda (mais de 5 por cento dos lidos e pelo menos 10 recusas) segura a marca e o checkpoint da carga, o que contém a mudança de contrato da API. Quem aponta no BusinessMap pode provocar recusas dos próprios registros, mas não esconde registro alheio nem grava dado novo; o pior caso é a coleta fechar `parcial`, como já acontecia antes com qualquer recusa.
- **Falha da etapa do worklog no `bm:coleta` (`coleta-comando.ts:115-124`).** Só `ErroColetaBm` vira `{ falha: <código> }`, sem mensagem; outro erro sobe. A etapa roda só com `--projetar`, o que mantém o escopo de cards atual (minimização do item 2 da ADR 0025).
- **Dicionário (`dicionario.ts:193-202`).** A recusa de rótulo de versão repetido com outro conteúdo usa `starts_with` parametrizado (sem curinga de LIKE) e a mensagem cita só o rótulo do arquivo versionado, sem dado da API.

## O que foi verificado e segue correto (rodada 1, fora do delta)
Allow-list na fronteira e comentário só em memória; staging e eventos sem pessoa nem texto livre; cliente só GET com `/loggedTime` em lista fechada e `fields` fixo; varredura de presença com guarda de massa; supressão com HMAC antes de `/users` no worklog; dicionário com vigência; GRANTs do coletor, do `dspd_ref` e do `dspd_api`; segredos só por variável de ambiente; regras invioláveis (só BusinessMap, histórico preservado). O delta não toca nesses pontos além do listado acima.

## Plano em cartões
- A4: software-architect na fatia de retenção, com o DPO; node-backend implementa o que for decidido.
- Para o qa-engineer: o teste `.pg` da recriação pelos cards (CA-AP-10 estendido) já está na branch; conferir no QA também o caso `sem-sal`.
- Para a segurança da rota: depois do merge desta ponta, conferir que a view de quem é do time não devolve `pessoa_ref` para a pessoa eliminada.

## Riscos aceitos
Nenhum proposto. O resíduo dos arrays `responsaveis` de `dim_card` e `dim_card_versao` segue declarado (A5 de `059-adrs.md`, DT-3) e não é aceite novo.

## Ferramentas e lacunas
Leitura estática do diff, `forge-check delta` e `grep`. `gitleaks`, `osv-scanner`, `semgrep`, `zizmor`, `actionlint` e `trivy` não estão no PATH desta máquina (lacuna registrada; as varreduras rodam no CI do devops-engineer). Nenhuma dependência nova no intervalo. Suítes não foram rodadas por este papel (o node-backend relatou pronto e `.pg` verdes em 82d1360). Nenhum segredo foi lido ou exibido; nenhum arquivo fora de `docs/security/` foi tocado.
