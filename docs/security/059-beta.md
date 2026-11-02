---
tipo: revisao-seguranca
contrato: 1
pedido: 059-aba-apontamento
branch: feature/059-coleta-worklog
commit: 2462ee5be7d52f214e2ad4498667f2777a3c137a
parecer: reprovado
revisor: forge:security-engineer
data: 2026-11-02
---
# Review de segurança da branch da coleta do worklog (pedido 059, E2.26, K-193)

Intervalo revisado: `origin/feature/059-contrato-biblioteca..origin/feature/059-coleta-worklog` (15 commits, de 57413dc a 2462ee5; 70 arquivos, +4739). Referências: ADR 0025 e revisão 4 da ADR 0020 no ramo `docs/059-apontamento-discovery`, e o parecer `docs/security/059-adrs.md` (aprovado em 114c435). Revisão estática: o `.env` não foi lido, nada foi chamado no BusinessMap, nenhum nome, e-mail ou id de pessoa aparece aqui. Público: node-backend (dono do código), tech-lead, Jarvis.

**Veredito: reprovado em 2462ee5**, por um bloqueante (A1): a eliminação a pedido é desfeita pela coleta de cards. O resto do intervalo está correto (lista abaixo). Três recomendações não devolvem (A2 a A4).

## Gatilhos
Dado pessoal (nome, `user_id`, `pessoa_ref`, comentário do apontamento), integração externa (chave do BusinessMap), migrações e GRANTs, segredo novo (`PESSOA_ELIMINADA_SAL`), controle que analisa entrada (dicionário). Nenhum workflow, compose ou controle do Forge muda neste intervalo.

## Achados
- A1 (bloqueante) server/src/modulos/businessmap/coleta.ts:315 · a coleta de cards chama /users para todos os ids vistos sem consultar cfg_pessoa_eliminada: pessoa eliminada que é responsável de card volta a dim_responsavel com nome e pessoa_ref nova, e pela view apt_pessoa_time da rota volta à aba.
- A2 (recomendado) server/src/modulos/businessmap/apontamento/eliminacao.ts:16 · o user_id do titular vai na linha de comando (--usuario=), fica no histórico do shell e na lista de processos da máquina do dono; ler da entrada padrão.
- A3 (recomendado) docs/architecture/server.md:206 · a doc pede 32 caracteres para PESSOA_ELIMINADA_SAL mas não diz como gerar; sal de baixa entropia permite testar ids por força bruta contra os HMAC; indicar valor aleatório de 32 bytes.
- A4 (recomendado) server/src/modulos/businessmap/apontamento/coleta.ts:147 · o worklog pede /users e grava o nome de quem é de Outra área, que a aba nunca mostra com nome; minimização a decidir na fatia de retenção.

## Detalhe dos achados

### A1 (bloqueante): a coleta de cards recria a pessoa eliminada
Evidência: `server/src/modulos/businessmap/coleta.ts:315` chama `resolverResponsaveis(d.pool, d.cliente, x.vistos, ...)` com os ids dos responsáveis de card, sem passar pela lista de supressão; `server/src/modulos/businessmap/usuarios.ts:56-83` pede `/users` para id sem linha em `dim_responsavel` e a insere com o nome; `server/migrations/0024_bm_dim_responsavel_pessoa_ref.ts:11` dá `pessoa_ref` nova por identidade. A supressão só existe no caminho do worklog (`server/src/modulos/businessmap/apontamento/coleta.ts:145-148`). O comentário de `eliminacao.ts:12` e o `docs/architecture/server.md:202` afirmam que "a coleta seguinte não recria a pessoa", e o teste `server/tests/apontamento-eliminacao.pg.test.ts:107-113` só confere a recoleta do worklog, nunca a dos cards.

Caminho: o titular pede eliminação; o dono roda `bm:eliminar-pessoa --confirmar` (o nome sai de `dim_responsavel`, o vínculo do fato é anulado). Na noite seguinte o `bm:coleta incremental` lê os cards do DSPD, onde a pessoa é responsável (é justamente o critério de quem é do time), vê o id, chama `/users` e recria a linha com o nome e uma `pessoa_ref` nova. Na branch da rota, `server/migrations/0029_bm_apt_pessoa_time.ts` (em `origin/feature/059-rota-apontamento`) junta `dim_card_versao.responsaveis` com `dim_responsavel` e entrega essa `pessoa_ref` como pessoa do time, então o nome pode reaparecer na aba, visível a qualquer usuário do painel. O direito de eliminação (decisão do dono de retenção, R4-6, CA-AP-10) fica desfeito em um dia, sem aviso. As horas continuam desvinculadas (o worklog suprime), por isso a severidade é média, não alta.

Correção mínima: a lista de supressão vale para todo pedido a `/users`, não só para o worklog. Opção enxuta: `resolverResponsaveis` recebe o filtro (`usuariosSuprimidos` com o sal) e descarta os ids suprimidos antes de pedir e antes de inserir; o `bm:coleta` passa o sal. Sem sal configurado e com `cfg_pessoa_eliminada` não vazia, a etapa de `/users` dos cards não roda e registra a falha por código (por exemplo `sem-sal`), em vez de recriar a pessoa; isso pede que o `dspd_coletor` conte as linhas da lista (já tem SELECT). Ajustar o texto de `eliminacao.ts:12` e de `server.md:202`. Teste `.pg`: eliminar a pessoa, rodar a coleta de cards com o id dela entre os responsáveis de um card e conferir que `/users` não foi pedido para ela, que `dim_responsavel` continua sem a linha e que a view de quem é do time (depois do merge na rota) não devolve `pessoa_ref` para ela. O resíduo dos arrays `responsaveis` de `dim_card` e `dim_card_versao` segue declarado (A5 de `059-adrs.md`, DT-3), sem mudança. Esforço P a M. Dono: node-backend.

### A2 (recomendado): id do titular na linha de comando
`analisarArgumentosEliminacao` lê `--usuario=<id>` de `argv` (`eliminacao.ts:21-26`, uso em `:16`). O id fica no histórico do shell e aparece em `ps` durante a execução. Caminho realista só na máquina do dono, e o id do BusinessMap sem o nome é pseudônimo: baixo. Correção mínima: aceitar o id pela entrada padrão (por exemplo `--usuario=-`), mantendo `argv` para teste. Esforço P. Dono: node-backend.

### A3 (recomendado): geração do sal
A guarda é de comprimento (`config.ts`, `z.string().min(32)`; `supressao.ts:9`, 32 bytes). Com sal previsível, quem obtiver uma cópia da base testa os ids do BusinessMap (inteiros de até 12 dígitos, espaço pequeno) contra `cfg_pessoa_eliminada.hash_usuario` e descobre quem pediu eliminação. Correção mínima: em `server.md`, "Variável de ambiente `PESSOA_ELIMINADA_SAL`", indicar valor aleatório de 32 bytes em hexadecimal gerado por ferramenta local (por exemplo `openssl rand -hex 32`). Esforço P. Dono: node-backend (doc da branch).

### A4 (recomendado): nome de quem é de Outra área
O worklog resolve por `/users` todo `user_id` não suprimido (`apontamento/coleta.ts:146-148`), inclusive de quem a decisão do dono de 2026-11-02 manda mostrar só somado como "Outra área". O nome dessas pessoas fica em `dim_responsavel` sem uso na aba. Não há caminho de exposição novo (a tabela segue fora do `dspd_api` e o papel da aba não lê `responsavel_nome` de quem não é do time, pela rota), por isso não bloqueia; é minimização (LGPD). Correção: decidir na fatia de retenção se `pessoa_ref` de quem não é do time pode existir sem nome. Esforço M. Dono: software-architect (desenho), node-backend.

## O que foi verificado e está correto
- **Allow-list na fronteira e comentário fora da base.** `CAMPOS_APONTAMENTO` e `CAMPOS_CLASSIFICACAO` (`allow-list.ts:42-46`); `lerApontamento` (`registro.ts:77-107`) recusa sem eco do valor (só código e `logged_time_id`), comentário e `user_id` saem só em memória; `LinhaClassificada` não tem comentário nem `user_id`, e é o único objeto serializado para o banco (`gravacao.ts:42-48`). `registro_sha256` é sobre a allow-list mais a classificação, nunca sobre o comentário (`registro.ts:126-131`). A saída da função externa é conferida contra lista fechada e inteiros (`registro.ts:110-119`), e exceção dela vira o código `classificacao-falhou` (`coleta.ts:115-123`). `redact` cobre `comment`, `comentario`, `realname` e `responsavel_nome` em um e dois níveis (`log.ts:18-27`).
- **Staging e eventos.** `stg_apontamento` e `evt_apontamento` append-only por gatilho, sem coluna de pessoa nem texto livre, ids só em dígitos (`IDN`), chaves naturais com `ON CONFLICT ... DO NOTHING` de alvo explícito (0022, 0023); teste estrutural nega `comment`, `user_id`, `payload`, e-mail e título (`apontamento-esquema.test.ts:37`). SQL todo parametrizado; o único texto montado é a lista de colunas vinda de constante (`gravacao.ts:14-16`).
- **Cliente só GET com lista fechada.** Só `/loggedTime` entra em `CAMINHOS_PERMITIDOS` (`http.ts:21-23`); `/loggedTime/history`, `/loggedTimeCategories` e `/loggedTime/{id}` ficam fora. `CONSULTA_WORKLOG` com `fields` fixo por regex de valor exato, sem `page` nem `user_ids`, e recusa sem `card_ids` e `fields` (`http.ts:76-84`, `:250-253`); método fixo `GET` (`http.ts:304`). Lote no teto ou grande demais é dividido e, num card só, fica incompleto (`lotes.ts:190-212`).
- **Varredura de presença e guarda de massa.** Só lote completo, sem registro recusado, vira fonte de exclusão (`coleta.ts:182`); acima de 20 por cento dos ativos da janela nenhum evento é gravado e a execução fecha `parcial` (`coleta.ts:189-202`); nada é apagado, `reaparecido` devolve o apontamento às somas (`gravacao.ts:104-120`). Erro fatal (401, 403, limites) interrompe sem detectar exclusão (`coleta.ts:295-301`).
- **Eliminação a pedido e supressão com HMAC.** HMAC-SHA256 com o sal do `.env`, consulta só pelo hash (`supressao.ts:13-23`); supressão antes de `/users` e de `pessoa_ref` no worklog (`coleta.ts:144-148`); procedimento do `dspd_migrador`, sob a trava da fonte, numa transação, com ensaio sem `--confirmar`, saída só com contagens (`eliminacao.ts:49-73`, entrada `:83-111`); horas preservadas, só `pessoa_ref` anulada; `executado_por` guarda só o papel de banco (0031), sem dado de pessoa; sal ausente ou curto impede coleta e eliminação (`config.ts`, `coleta.ts:223`, `eliminacao.ts:50`). Falha aqui é só o A1, no outro caminho de `/users`.
- **Dicionário com vigência e recusa de termo vazio** (nota do parecer da trilha B, `059-alfa.md`). Termo só `^[a-z0-9]{2,40}$` no zod (`dicionario.ts:44`) e no CHECK da tabela (0026), lista de termos com pelo menos um item, rótulos sem controle, invisível, separador de linha nem arroba (`dicionario.ts:37`), limites de quantidade (500 termos, 100 subgrupos); termo vazio ou de um caractere não entra por nenhum dos dois caminhos. Vigência: INSERT e `UPDATE (vigente_ate)` ao `dspd_ref`, gatilho `proibir_alteracao_vigencia` contra qualquer outro UPDATE, DELETE e TRUNCATE (0030), chave natural única só entre vigentes, data da carga não volta no tempo, versão de critério por carga (T2.6); `execucao-tecnica` e `nao-classificado` não saem (`dicionario.ts:134-140`). O coletor lê só o vigente e não roda sem carga (`dicionario.ts:234-239`). Mensagens de erro citam o caminho, não o valor.
- **GRANTs do coletor e do `dspd_ref`.** `dspd_coletor`: SELECT, INSERT e UPDATE em `fato_apontamento` e `dim_card_raiz`, sem DELETE; só SELECT em `cfg_pessoa_eliminada`; INSERT e SELECT em `stg_` e `evt_` (`grants.ts:79-83`). `dspd_ref`: SELECT, INSERT e `UPDATE (vigente_ate)` nas `ref_apontamento_*`. `dspd_api`: nenhuma das tabelas novas (dicionário em `TABELAS_FORA_DA_API`; `fato_apontamento`, `dim_card_raiz` e `cfg_pessoa_eliminada` fora de `paraApi`); `pessoa_ref` e `hash_usuario` em `COLUNAS_PESSOA` (`lgpd.ts:17-21`).
- **Segredos e configuração.** `PESSOA_ELIMINADA_SAL` só por variável de ambiente, validada na partida; as entradas leem o `.env` pelo programa e imprimem só contagens e códigos; o hash do host vai a `ctl_coleta`, nunca a URL. Nenhum segredo no diff (leitura manual; ver lacuna abaixo).
- **Regras invioláveis.** Só BusinessMap, nada do Acelerato; histórico preservado (staging append-only, exclusão por evento, dicionário por vigência).

## Plano em cartões
- A1: node-backend, na branch da coleta, antes do QA; o teste `.pg` da recriação pelos cards entra no plano do qa-engineer (CA-AP-10 estendido). Depois, renovação por delta deste parecer.
- A2 e A3: node-backend, junto da volta do A1, se couber; não devolvem.
- A4: software-architect na fatia de retenção, com o DPO.

## Riscos aceitos
Nenhum proposto. O resíduo dos arrays `responsaveis` de `dim_card` e `dim_card_versao` segue declarado (A5 de `059-adrs.md`, DT-3) e não é aceite novo.

## Ferramentas e lacunas
Leitura estática do diff e `grep`. `gitleaks`, `osv-scanner`, `semgrep`, `zizmor`, `actionlint` e `trivy` não estão no PATH desta máquina (lacuna registrada; as varreduras rodam no CI do devops-engineer). Nenhuma dependência nova entrou no intervalo (só um subcaminho de exportação em `packages/metricas/package.json`). Suítes não foram rodadas por este papel. Nenhum segredo foi lido ou exibido; nenhum arquivo fora de `docs/security/` foi tocado.
