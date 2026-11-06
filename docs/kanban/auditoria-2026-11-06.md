# Auditoria do quadro, 2026-11-06 (pedido 074, E1.1)

Levantamento só leitura. Nada foi editado no `KANBAN.md` nem no `historico.md`; as colunas propostas são para o Jarvis aplicar.

Base da prova (após `git fetch`, 2026-11-06): `origin/develop` f21220fe, `origin/homolog` 9a5705b5, `origin/main` 8bb1210b (merge do PR 237, release do 071). "Na main" = o commit do PR é ancestral de `origin/main` (conferido com `git merge-base --is-ancestor`). PRs conferidos com `gh pr view`.

Limites do levantamento: onde a prova é só a linha do pedido (sem PR), está dito. Os merges por squash fazem `ahead/behind` das branches `feature/048-*` e `feature/056-*` enganar; para elas a prova é a ausência de PR e de commit citando o cartão em `origin/develop`. Cartões marcados "não verificado" precisam de conferência de quem tem a prova (Jarvis ou dono).

Estados: entregue, encerrado sem código, aberto, esperando o dono, duplicado. Linhas "Entrada (K-nnn)" abaixo estão todas hoje na coluna Entrada, salvo indicação.

## Tabela (uma linha por cartão fora de Pronto: 93 cartões)

| ID | Coluna atual | Estado real | Prova | Coluna proposta |
|---|---|---|---|---|
| K-219 | Entrada | entregue | PR 229 (homolog para main) mesclado 2026-11-05T11:22Z; PRs 218, 226, 227 na develop; linha do 068 de 2026-11-05 08:38 "Release 068 na main pelo dono" | Pronto |
| K-218 | Entrada | entregue | PR 215 mesclado na develop 2026-11-04T19:12Z; na main via PR 229 | Pronto |
| K-217 | Entrada | entregue | PR 216 mesclado na develop 2026-11-04T20:03Z; na main via PR 229 | Pronto |
| K-205 | Entrada | entregue | PR 214 (f1753097) mesclado 2026-11-04T17:48Z; na main via PR 229 | Pronto |
| K-208 | Entrada | entregue | PR 217 (939e0917, L3-a) na develop e na main (PR 229) | Pronto |
| K-209 | Entrada | entregue | PR 219 (d2ec79d1, M1-a) na develop e na main (PR 229) | Pronto |
| K-210 | Entrada | entregue | PRs 222 (L7-a) e 232 (L7-b); 222 na main via PR 237 (release do 071) | Pronto |
| K-206 | Entrada | entregue | PRs 220 (L2-a) e 221 (L2-b), na main via PR 229; o que sobrou é o K-231 | Pronto |
| K-207 | Entrada | entregue na develop | PRs 224 (L9-b, main via 229), 225 (L9-a, main via 229), 238 (L9-c, develop 2026-11-05T21:00Z, ainda fora da homolog e da main) | Aguardando sua validação (vai à main na próxima release) |
| K-196 | Entrada | entregue | PR 204 (46f0e121) na develop e na main; pedido 061 de 2026-11-02 23:48. Pendência do dono (VM, segredos) está no K-200 | Pronto |
| K-198 | Entrada | entregue | PR 206 (c6a75a03) mesclado em 2026-11-03 e na main | Pronto |
| K-199 | Entrada | entregue | PR 203 (4e755edd) mesclado em 2026-11-04T00:58Z e na main | Pronto |
| K-195 | Entrada | entregue | PRs 205, 207 e 208 (060, mesclados 2026-11-03 a 11-04), na main pela release PR 211 (2026-11-04T11:03Z) | Pronto |
| K-193 | Entrada | entregue | PRs 197 a 199 (059) na develop; linha do 059 de 2026-11-05 00:45 "aba está na main desde 2026-11-02 20:25 (PR 201)" | Pronto |
| K-200 | Entrada (obs.: aguardando o dono) | esperando o dono | PRs 209 e 212 mesclados e PR 211 (release) mesclado em 2026-11-04T11:03Z; falta só o deploy na VM (.env, coleta diária, senha, db:migrate 0034), ação do dono | Aguardando o dono |
| K-194 | Entrada | encerrado sem código | Pedido 060: triagem dos 15 alertas decidida (risco aceito, PR 213 mesclado pelo dono 2026-11-04T14:06Z); modo analisar, sem mudar dependência (não verificado se há linha de encerramento do cartão) | Pronto (prova: pareceres e linhas do 060; Jarvis confirma) |
| K-197 | Entrada | encerrado sem código (não verificado) | Cartão diz "modo planejar; nada implementado"; sem commit citando K-197 na develop; o desenho pode ter ido no pedido 060 E3 | Pronto se o desenho foi entregue; senão aberto (Jarvis confirma) |
| K-202 | Entrada | encerrado sem código | Linha do 064 de 2026-11-04 08:21 "E1.6 cumprida pelo agile-coach", retrospectiva commit 42953e69; levantamento cumprido (mapa 064 de 08:17) | Pronto |
| K-203 | Entrada | aberto | Nenhum commit citando K-203 na develop; ressalvas do QA documental do 063 (linha do 063 de 2026-11-04 07:23) | Entrada (puxar quando houver vaga) |
| K-204 | Entrada | aberto | Sem commit; pedido próprio ainda não aberto (obs.: "depois do 065"; 065 já entregue na develop e na main) | Entrada |
| K-211 | Entrada | aberto | Sem commit; depende de O3, O4, S2, S3 | Entrada |
| K-212 | Entrada | aberto, espera o dono | Sem commit; domínios definidos por pessoas (WS1) | Aguardando o dono |
| K-213 | Entrada | aberto | Sem commit | Entrada |
| K-214 | Entrada | aberto, espera o dono | Sem commit; depende da governança definir o SLE (T6.2) | Aguardando o dono |
| K-215 | Entrada | aberto | Sem commit | Entrada |
| K-216 | Entrada | esperando o dono | Sem commit; é deploy na VM (PG_APONTAMENTO_URL, migração 0034), a mesma ação do K-200 | Aguardando o dono |
| K-226 | Entrada | aberto | Pedido 073 E5; análise em docs/analises/073-format-server.md (linha de 2026-11-05 19:38); sem PR na develop | Entrada (ou Em andamento quando o E5 começar) |
| K-233 | Entrada | aberto | Sem commit; lacuna irmã do K-226, vista na E5.1 | Entrada |
| K-231 | Entrada | esperando o dono | Obs. do cartão: espera a resposta do P-L2-1 (docs/analises/069-desenho.md); depende das pessoas (WS1) | Aguardando o dono |
| K-235 | Entrada | esperando o dono | Pedido 073: desenho E10 entregue 2026-11-06 10:40 com a P-E10-2 ao dono | Aguardando o dono |
| K-188 | Entrada | aberto | Sem commit; recorte do dono "depois de 2026-11-02" (data já passou) | Entrada |
| K-191 | Entrada | aberto | Sem commit; teste instável (também citado no 073 como K-191, K-192) | Entrada |
| K-186 | Entrada | aberto | Sem commit citando K-186 na develop | Entrada |
| K-183 | Entrada | aberto, espera de terceiros | Depende de jspdf e mermaid exigirem dompurify >= 3.4.17 (conferir na revisão semanal) | Bloqueado (motivo: espera versões externas) |
| K-176 | Entrada | aberto | Sem commit; depende do K-175 (não está no quadro fora de Pronto) | Entrada |
| K-177 | Entrada | aberto | Sem commit; depende do merge de docs/048-t14-desenho | Entrada |
| K-165 | Entrada | aberto (Forge) | Sem commit; "vai ao Forge, só propor" | Entrada (fábrica) |
| K-166 | Entrada | aberto (Forge) | Idem | Entrada (fábrica) |
| K-167 | Entrada | aberto (Forge) | Idem | Entrada (fábrica) |
| K-168 | Entrada | aberto (Forge) | Idem | Entrada (fábrica) |
| K-170 | Entrada | aberto (Forge) | Idem; repete ação da retro do 025 | Entrada (fábrica) |
| K-156 | Entrada | aberto (Forge) | Idem | Entrada (fábrica) |
| K-157 | Entrada | aberto (Forge) | Idem | Entrada (fábrica) |
| K-158 | Entrada | aberto (Forge) | Idem | Entrada (fábrica) |
| K-159 | Entrada | aberto (Forge) | Idem | Entrada (fábrica) |
| K-147 | Entrada | aberto (Forge) | Idem; vários itens num cartão só | Entrada (fábrica) |
| K-160 | Entrada | esperando o dono | Obs. do cartão: acesso do dono (delete-branch-on-merge); responsável já é "dono" | Aguardando o dono |
| K-161 | Entrada | esperando o dono | Obs.: merge queue = decisão do dono (pode custar, mexe no ruleset) | Aguardando o dono |
| K-146 | Entrada | aberto | Sem commit; decisões do dono de 2026-10-17 e 10-21 já registradas | Entrada |
| K-145 | Entrada | aberto | Sem commit; decisão do dono (opção B) já registrada | Entrada |
| K-143 | Entrada | aberto | Sem commit | Entrada |
| K-142 | Entrada | aberto | Sem commit | Entrada |
| K-126 | Entrada | aberto | Mesmo lote 048d do K-128 (QA); branch feature/048-ajustes-front não mesclada, sem PR visto | Entrada ou QA junto com o K-128 |
| K-127 | Entrada | aberto | Idem (lote 048d) | Entrada ou QA junto com o K-128 |
| K-133 | Entrada | aberto | Idem (lote 048d) | Entrada ou QA junto com o K-128 |
| K-137 | Entrada | aberto | Sem commit | Entrada |
| K-125 | Entrada | aberto, espera o dono | Pedido 072 (linha de 2026-11-05 15:06): feature/011-metricas-tambem-back fica porque faltam pareceres na develop; vira cartão de PR depois da release 071 | Aguardando o dono (decisão A do 039 já dada; ver duplicidade com K-223) |
| K-086 | Entrada | aberto | Sem commit; ADR 0020 | Entrada |
| K-087 | Entrada | aberto | Sem commit; ADR 0020 (spike B-5 do tipo do campo Time responsável) | Entrada |
| K-088 | Entrada | aberto | Sem commit | Entrada |
| K-089 | Entrada | aberto | Sem commit | Entrada |
| K-075 | Entrada | aberto | Pedido 010; nenhum commit citando K-075 (o #87 cita K-072 e K-073) | Entrada |
| K-223 | Em andamento | esperando o dono | Pedido 072: E1.4 entregue só leitura 2026-11-05 15:06 com os comandos das 10 branches descartadas; apagar branch é ação do dono. Obs. do quadro "brief em conferência" está velha | Aguardando o dono |
| K-190 | Em andamento | entregue | PRs 175, 185 e 187 (F1 e F2 do coletor, carga inicial) na develop e na main; linha do 056 de 2026-11-01 14:05 "E4.46 cumprida: PR 187 mesclado" | Pronto |
| K-182 | Em andamento | entregue em parte (não verificado o escopo todo) | PRs 188, 190 e 191 (FL1 real, limpeza do seed, sustentação real) na main; o cartão também cita webhook T2.3 e FL2/FL3, que não achei no git | Pronto só com confirmação de que T2.3, FL2 e FL3 foram cortados ou viraram outro cartão; senão fica |
| K-189 | Em andamento | entregue | CLAUDE.md com o Acelerato: PR 203 na main; ADR 0023: K-227 (QA ok) ainda aberta no 073 | Pronto |
| K-185 | Em andamento | entregue | PR 173 (11141d75, script de diagnóstico) na develop e na main | Pronto |
| K-129 | Em andamento | aberto | Branch feature/048-k129-pico (E5.6 entregue 2026-10-30 07:26) sem PR visto, sem commit na develop; parado há 7 dias | Code review (se o PR do 048 existir) ou Bloqueado |
| K-164 | Em andamento | esperando o dono ou aberto (não verificado) | Push do dono em 2026-10-29; PR de proposta ao Forge (E3.5, opção A do dono em 2026-10-29 10:14); não verifiquei o repositório do Forge | Aguardando o dono (se o PR do Forge está aberto); Pronto se mesclado |
| K-074 | Em andamento | aberto | Branch feature/048-usabilidade não mesclada; DECISÃO DO DONO 048-03 = A (E4.1 volta 2); parado desde 2026-10-29 | Em andamento (sem mudança) ou Bloqueado se não há agente |
| K-104 | Em andamento | entregue em parte | "Na develop (#102)"; pendentes os CAs da especificação do ux-designer (E3.2) | Entrada (parte restante) |
| K-229 | Em andamento | esperando o dono | Pedido 073: proposta docs/analises/073-changelog.md pronta; as seções entram no chore(release) da release combinada | Aguardando o dono |
| K-234 | Em andamento | esperando o dono | Pedido 073: desenho E9.1 entregue; E9 espera a P-E9-3 do dono (linha de 2026-11-06 10:00) | Aguardando o dono |
| K-139 | Code review | aberto, parado 14 dias | Obs.: "ficha ajustada sem commit, vai no PR de docs do Jarvis"; sem commit na develop; responsável é o ux-designer, mas o review é do tech-lead | Code review (sem mudança) com prazo; Jarvis decide |
| K-128 | QA | aberto | Lote 048d (volta 1) review aprovado ed5b0c2; feature/048-ajustes-front sem PR; parado 7 dias | QA (sem mudança) |
| K-224 | QA | aberto | Pedido 073 E3: review e segurança aprovados, QA em curso (brief qa-engineer-6); worktree 052e em feature/073-ca8-ref-dominio | QA (sem mudança) |
| K-227 | QA | aberto | QA b369cbae aprovado; PR depois do PR 242 (worktree 052g, branch docs/073-adr-0023-claude, sem PR) | Aguardando sua validação quando o PR abrir |
| K-232 | QA | aberto | PR 242 OPEN (develop); head a8810bf2 com CI verde, rerun do e2e-parte pendente (linha do 073 de 2026-11-06 10:50) | Aguardando sua validação (PR aberto; o merge na develop é do tech-lead) |
| K-141 | Bloqueado | esperando o dono | Obs.: aguardando o dono (E2.1) desde 2026-10-27; a máquina nova parece já em uso (worktrees e banco existem), mas não verifiquei o ambiente | Aguardando o dono (ou Pronto se o dono confirmar o ambiente) |
| K-152 | Bloqueado | esperando o dono | Aplicar docs/analises/043-f21-pre-push.patch (ação do dono) | Aguardando o dono |
| K-153 | Bloqueado | esperando o dono | Abrir o PR do F22 pelo terminal (decisão B) | Aguardando o dono |
| K-144 | Pronto para fazer | entregue | PR 159 (be0a8d79, E2E do portão em 2 partes com agregador) na develop e na main | Pronto |
| K-150 | Pronto para fazer | entregue | PR 158 (efbc0877, teste SELECT * corrigido sem aumentar timeout) na develop e na main | Pronto |
| K-172 | Pronto para fazer | entregue em parte (não verificado) | O commit be0a8d79 cita K-172, mas é ajuste de CI; o cartão pede alinhar praticas.md:115 à decisão do dono, e não confirmei o texto | Pronto só se praticas.md:115 já foi alinhado; senão fica |
| K-171 | Pronto para fazer | encerrado sem código | Obs. "recibo enviado ao dono"; existe docs/retrospectivas/2026-10-28-problemas-para-o-forge.md | Pronto |
| K-187 | Pronto para fazer | esperando o dono | Pedido 055 (linhas de 2026-10-30 13:29 e 13:30): decisão do dono, o trabalho de Forge sai do time; melhorias anotadas em docs/kanban/melhorias.md para o dono levar ao Jarvis do Forge | Aguardando o dono |
| K-201 | Pronto para fazer | aberto | Sem commit citando K-201 na develop; cartão de prioridade "bloqueia o pronto de todos os agentes" parado desde 2026-11-03 | Pronto para fazer (sem mudança; ordem é do Jarvis) |
| K-192 | Pronto para fazer | aberto | Sem commit; mesmo achado do K-191 (e2e L3-01) | Pronto para fazer; ver duplicidade com K-191 |
| K-175 | Pronto para fazer | aberto | Sem commit; o K-176 depende dele | Pronto para fazer |
| K-173 | Pronto para fazer | aberto | Sem commit | Pronto para fazer |
| K-174 | Pronto para fazer | aberto | Sem commit | Pronto para fazer |
| K-121 | Pronto para fazer | aberto | Sem commit | Pronto para fazer |
| K-120 | Pronto para fazer | aberto | Sem commit | Pronto para fazer |

Total: 93 linhas (62 em Entrada, 12 em Pronto para fazer, 11 em Em andamento, 1 em Code review, 4 em QA, 3 em Bloqueado; a coluna Aguardando sua validação está vazia). Resumo da proposta: 22 cartões a Pronto com prova (K-219, K-218, K-217, K-205, K-208, K-209, K-210, K-206, K-196, K-198, K-199, K-195, K-193, K-194, K-202, K-190, K-189, K-185, K-144, K-150, K-171 e K-197, este último sujeito a confirmação); K-182, K-172 e K-164 só fecham depois de conferido o escopo; K-207 vai a Aguardando sua validação por estar só na develop; K-227 e K-232 vão para lá quando os PRs forem mesclados.

## Duplicados, sem dono ou que só fecham com decisão do dono

Não decido regra de negócio nem prioridade; cada item diz só o motivo.

**Duplicados ou sobrepostos (o Jarvis decide fundir ou manter)**
- K-200 e K-216: os dois tratam do mesmo deploy na VM (PG_APONTAMENTO_URL, migração 0034, depois rodar a Q20). O K-200 já está com o dono; o K-216 repete a ação com outro responsável (devops-engineer).
- K-224 e K-234: mesmo controle CA-8, em coletores diferentes (Acelerato e BusinessMap); não são duplicados, mas o K-234 foi aberto a partir do desenho do K-224 (073 E9). Manter os dois.
- K-125 e K-223: o K-223 (limpar branches mescladas, pedido 072) e o K-125 (avaliar feature/011-metricas-tambem-back e feature/011-fase2-back) cobrem a mesma branch; o 072 E1.4 já decidiu que ela fica por causa dos pareceres que faltam na develop.
- K-126, K-127, K-128, K-133 (e K-129): mesmo lote 048d/feature/048-ajustes-front; hoje só o K-128 aparece em QA e os outros estão em Entrada, dando a impressão de que não começaram.
- K-189 e K-190 (056) e K-182 e K-185 (052): cartões guarda-chuva e cartões de fatia da mesma integração, com a mesma responsável (tech-lead); com os PRs na main, o guarda-chuva só fecha se o escopo restante for conferido.
- K-226 e K-233: lacunas irmãs (format:check do server e do e2e); fechar juntas ou manter separadas, sem duplicidade.
- K-147: junta cinco melhorias de fábrica num só cartão, o que contraria "um cartão por revisão de uma vez".

**Sem dono real ou com dono errado**
- K-160 (responsável "dono") e K-200 (responsável "dono"): dono ocupa o campo de agente; devem ir para "Aguardando o dono".
- K-139: responsável ux-designer, mas a coluna é Code review (tocada pelo tech-lead); sem commit há 14 dias.
- K-141: responsável devops-engineer, coluna Bloqueado esperando o dono desde 2026-10-27 (10 dias).
- K-128, K-129, K-074: parados em "Em andamento" ou QA sem movimento desde 2026-10-29 e 2026-10-30; sem agente com WIP declarado.
- K-104: "Em andamento" desde 2026-10-17, com a parte do software-architect já na develop e a do ux-designer pendente.

**Só fecham com decisão ou ação do dono**
- K-161: merge queue, decisão do dono (custo e ruleset).
- K-160: ativar delete-branch-on-merge ou apagar branches, ação de acesso do dono.
- K-152 e K-153: aplicar patch e abrir PR do Forge pelo terminal, ações do dono.
- K-141: ambiente da máquina (E2.1), ação do dono.
- K-200 e K-216: publicar na VM, ação do dono.
- K-231: resposta do P-L2-1 (existência do campo data_acordada), das pessoas (WS1).
- K-212 e K-214: domínios do BusinessMap (WS1) e SLE (governança, T6.2), definidos por pessoas.
- K-229, K-234, K-235: perguntas e propostas ao dono no pedido 073 (CHANGELOG, P-E9-3, P-E10-2).
- K-223: apagar as branches descartadas, ação do dono.
- K-125: destino das branches 011, depois da release 071.
- K-164: se o PR de proposta ao Forge ainda está aberto, decisão de merge no Forge.

## Observações para o Jarvis (não fazem parte do pedido)
- "Entrada" tem 62 cartões: pelo menos 14 (K-193, K-195, K-196, K-198, K-199, K-205, K-206, K-208, K-209, K-210, K-217, K-218, K-219 e K-194) são entrega ou encerramento já provados, e vários outros esperam o dono, misturados ao backlog. "Pronto para fazer" tem 12 cartões contra limite 5 (WIP 5) na coluna.
- "Em andamento" tem 11 cartões; vários são guarda-chuva sem trabalho ativo (K-182, K-185, K-189, K-190, K-104).
- Também em duplicidade: K-191 e K-192 são o mesmo teste e2e instável (L3-01, axe target-size em leia-junto-o15).
