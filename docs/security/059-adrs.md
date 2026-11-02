---
tipo: revisao-seguranca
contrato: 1
pedido: 059-aba-apontamento
branch: docs/059-apontamento-discovery
commit: 114c4352e4021c0cdbc67f1727e8cb29d7a8991f
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-01
---
# Leitura de segurança das ADRs da aba Apontamento: ADR 0020 revisão 4 e ADR 0025 da coleta do worklog (pedido 059, E2.8 e E2.13, K-193)

Propósito: ler, antes do código, a revisão 4 da ADR 0020 (`docs/architecture/adr/0020-protecao-de-pessoa-no-coletor.md:110-168`) e a ADR 0025 (`docs/architecture/adr/0025-coleta-do-worklog-businessmap.md`) contra os controles do modelo de ameaças (`docs/security/059-aba-apontamento-ameacas.md`). Público: software-architect (dono das ADRs), tech-lead, node-backend, Jarvis. Leitura estática; o `.env` não foi lido, nada foi chamado no BusinessMap, nenhum nome de pessoa neste documento.

**Veredito da renovação (E2.13): aprovado.** A volta do arquiteto (E2.11) fecha os três bloqueantes da primeira leitura (A1 a A3, que reprovou o commit 784659c) e as recomendações A4 a A6. Restam três recomendações que não devolvem (A5 residual, A7, A8). Com isto a revisão 4 pode passar a vigente pelo lado da segurança (PE-2); falta o outro requisito do texto da ADR, o PR da exceção mesclado pelo dono no `CLAUDE.md` e no briefing, que não é meu.

## Revalidação por delta
Intervalo lido com `forge-check delta` sobre o parecer anterior (784659c..114c435): ADR 0020 `:3`, `:110-168` e `:209-210`; ADR 0025 inteira (renomeada de 0024); plano 059 (§3.4 classificador, §3.3 grants, §3.8 contrato, riscos); dicionário e textos do UX. O delta não toca controle do Forge (hook, conferente, workflow).

| Achado anterior | Resultado | Evidência |
|---|---|---|
| A1 (bloqueante) eventos do histórico sem lista fechada | Fechado | ADR 0020 R4-2b (`:129-133`): `CAMPOS_EVENTO_APONTAMENTO` com os cinco `event_type`, nunca autor, `user_id`, valores antigo e novo, comentário nem `payload`; `/loggedTime/history` fora de `CAMINHOS_PERMITIDOS` até o dono liberar (spike deu 403); teste com marcador. ADR 0025 itens 1 e 7 coerentes |
| A2 (bloqueante) DNS rebinding | Fechado | R4-5 (`:143`): 421 sem corpo nem eco para `Host` e `Origin` fora da lista fechada, comparação exata, vale com o interruptor ligado e desligado, nginx repassa o `Host`, testes escritos (`:157`) |
| A3 (bloqueante) classificador sem matriz nem orçamento | Fechado | ADR 0020 `:125` e plano §3.4 (`:128-134`): truncagem em 2000 pontos de código antes de normalizar, `startsWith` sem regex do dicionário, matriz de seis dimensões, corpus, gerador fast-check, propriedades e orçamento de tempo (5 s para 10 000 comentários, 5 ms no pior caso), critério do cartão B2 entregue antes do código |
| A4 guarda de partida | Fechado | R4-5 (`:144-149`): `HOST` contra lista fechada, `APONTAMENTO_REDE_LOCAL` só IPv4 privado único (zod recusa `0.0.0.0`, `::`, faixa, nome), `0.0.0.0` só com `APONTAMENTO_PUBLICACAO_LOOPBACK=1` e teste sobre os compose; consequência da rede local registrada |
| A5 eliminação sem durabilidade | Fechado no desenho, com resíduo declarado | R4-6 (`:152-155`): `cfg_pessoa_eliminada` com HMAC-SHA256 e sal no `.env`, consultada antes do `/users`, GRANT só ao coletor e ao migrador, CA-AP-10 estendido; arrays `responsaveis` do card ficam de fora, declarados (DT-3) |
| A6 `id_origem` e `redact` | Fechado | R4-2 (`:126`): `id_origem` é o `logged_time_id`, nunca o `user_id`; `redact` com variantes `*.*.x` |
| A7 pessoas de fora do escopo | Aberto, pergunta ao dono | plano R-10 (`:461`); não bloqueia |

Notas de leitura, sem achado: (1) o HMAC com sal dá durabilidade sem guardar o id em claro; o risco de força bruta com o sal vazado está declarado (`:153`) e o sal fica só no `.env` do dono. (2) `Host` com IP literal da rede local não é vetor de rebinding (o ataque exige nome resolvível), então a lista fechada basta. (3) Com a varredura de presença como única fonte de exclusão, o lote completo e a guarda de massa de 20 por cento (ADR 0025 itens 4 e 6) impedem que resposta parcial da origem apague horas; o QA deve cobrir os dois (E2.14). (4) Os pontos da primeira leitura sobre a legenda (pseudonimização, não anonimato) foram incorporados (`:144`).

## Achados
- A5 (recomendado) docs/architecture/adr/0020-protecao-de-pessoa-no-coletor.md:154 · resíduo declarado: `dim_card.responsaveis` e `dim_card_versao.responsaveis` guardam `user_id` fora da eliminação; entram na lista de supressão na fatia de retenção (DT-3).
- A7 (recomendado) docs/architecture/adr/0025-coleta-do-worklog-businessmap.md:21 · o escopo por `card_ids` não limita as pessoas: quem de outras áreas apontou horas em card do escopo aparece na aba com nome; pergunta ao dono pelo Jarvis (plano R-10).
- A8 (recomendado) docs/architecture/adr/0020-protecao-de-pessoa-no-coletor.md:125 · a lista de recusas do `ref:sync` omite o metacaractere que o plano §3.4 (`:130`) recusa; alinhar o texto (sem regex do dicionário, risco baixo).

## Detalhe dos achados abertos

### A5 (recomendado): resíduo dos responsáveis do card
O procedimento da R4-6 anula o vínculo das horas, mas os arrays de responsáveis em `dim_card` e `dim_card_versao` continuam com o `user_id` do BusinessMap. Caminho: o titular pede eliminação e, depois do procedimento, o id ainda liga a pessoa a cards, sem nome e sem horas. Severidade baixa (id sem nome, lido só por coletor e migrador, DT-3 já registrado no 052). Correção mínima: na fatia de retenção, tratar o array pela mesma lista de supressão, como a R4-6 já anuncia. Esforço M. Dono: node-backend na fatia de retenção; prazo e base legal ficam com o DPO.

### A7 (recomendado): pessoas de fora do escopo na aba
O escopo é a lista de cards, mas o worklog desses cards traz o `user_id` de quem apontou, de qualquer área. A decisão "C" do dono diz "qualquer usuário do painel vê a aba", não "pessoas de outras áreas aparecem". Pergunta ao dono (R-DECISAO, via Jarvis): aceita mostrar quem apontou nos cards do escopo, mesmo de fora do time, ou limita às pessoas do cadastro de membros (`cfg_equipe_membro`)? Se limitar, as demais viram "Outros" sem `pessoa_ref` e o `/users` não é chamado para elas. Esforço P. Dono: Jarvis (pergunta), software-architect (texto).

### A8 (recomendado): lista de recusas do dicionário
ADR 0020 `:125` recusa termo vazio, de 1 caractere, com espaço, maiúscula, acento, repetido e acima de 500; o plano §3.4 recusa também metacaractere. Como não se constrói regex a partir do dicionário, o risco é baixo; alinhar para a regra ter uma só redação. Esforço P. Dono: software-architect.

## O que foi verificado e está correto
- O `dspd_api` continua sem coluna de `COLUNAS_PESSOA` e sem tabela da aba; o papel `dspd_api_apontamento` lê só `pessoa_ref` e `responsavel_nome` de `dim_responsavel`, nada em `stg_` nem `evt_` (R4-5 `:140`, "O que não muda" `:161`).
- Comentário: três camadas coerentes (pedido em memória, classificação na fronteira, só lista fechada e inteiros gravados); `registro_sha256` sobre a allow-list, nunca sobre o comentário (`:124`).
- Cliente só GET, `fields` fixo, `card_ids` sempre, 401 e 403 sem nova tentativa; histórico fora do cliente enquanto o 403 durar (ADR 0025 itens 1 e 10).
- Staging append-only com `UNIQUE (logged_time_id, registro_sha256)` e eventos com chave natural e `ON CONFLICT DO NOTHING`; nunca `UPDATE` nem `DELETE` na staging.
- Limites o1 a o4 viram requisito de contrato (R4-8); BusinessMap e Acelerato não se misturam, o Acelerato fica fora da exceção (R4-1).
- Critério de reversão da revisão 4 (`:167`) cobre nome fora da rota, módulo fora do papel, `Host` e `Origin` sem 421, eliminação sem supressão e uso para ranking.
- Numeração: as listas de `stg_bloqueio` e afins passam a revisão 5, sem conflito com a ADR 0022 item 3 (`:116`).

## Plano em cartões
- A5: node-backend na fatia de retenção (cartão A4 do plano); DPO para prazo.
- A7: Jarvis leva a pergunta ao dono; software-architect ajusta o texto.
- A8: software-architect, junto da próxima edição da ADR 0020.

## Riscos aceitos
Nenhum proposto por esta renovação. Que, ligado em rede local, qualquer máquina da rede leia a aba sem autenticação é consequência da decisão "C" e da resposta de P-1 do dono (2026-11-01), com o login pelo AD como fatia futura; está registrado na R4-5 (`:149`), sem aceite novo.

## Ferramentas e lacunas
Leitura estática e `grep`. `gitleaks`, `osv-scanner`, `semgrep`, `zizmor`, `actionlint` e `trivy` não estão no PATH desta máquina (lacuna registrada; não se aplicam a ADRs, e as varreduras rodam no CI do `devops-engineer`). Nenhum segredo foi lido ou exibido; nenhum arquivo fora de `docs/security/` foi tocado.
