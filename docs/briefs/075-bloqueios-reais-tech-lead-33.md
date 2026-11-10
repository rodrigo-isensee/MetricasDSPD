Agente destino: forge:tech-lead
Pedido: 075-bloqueios-reais
Tipo: codigo
Branch: feature/075-l6a-versao-criterio   Base: develop   Base-sha: 54f02c42b51aba3355e9f0428f058113f916c4c9
Etapa: review   Cobre: E1.6

## Objetivo
Review do lote 6a dos bloqueios reais (K-204): versão de critério "bloqueio com dado real" e corte da série do O1 atrás do interruptor, com a data pendente num ponto só, na ponta 9e3078c17f4586afb3308108059755e2ebe6dc85, com a CI do push verde e a entrega conferida (pedido 075). Sem gatilho de segurança pelo plano (sem leitura nova). Worktree `/home/rodrigoisensee/MetricasDSPD-052g`, branch `feature/075-l6a-versao-criterio`.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052g diff 54f02c42b51aba3355e9f0428f058113f916c4c9...9e3078c17f4586afb3308108059755e2ebe6dc85` e a seção `## Lote 6a` de `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/075-plano.md`.
- Do pedido, as linhas do `## Histórico` de 2026-11-07 15:00 e da entrega, da volta e da conferência do 6a.

## Entregar
- "E1.6 (tech-lead): review por lote." (E1.6)
- (E1) (E1.6) Foco: aderência à seção `## Lote 6a` do plano (versão `criterio-AAAA-MM-DD-bloqueio-com-dado-real` em `VERSOES_DA_BIBLIOTECA`, `afeta` O1, O2, O5, O19 e BLOQUEADOS, descrição começando por "histórico parcial de bloqueios" com a regra do instante da coleta; função pura que anula a série do O1 antes da data, CA-7; código escuro: com o interruptor desligado a resposta não muda); a forma da data pendente (`DATA_BLOQUEIO_COM_DADO_REAL = '2099-12-31'`, num ponto só, para o 6b trocar) contra o que o plano prevê; os avisos da conferência (a descrição não cita P-075-2 e P-075-6, só o comentário; a chamada em `servico.ts` sem teste próprio); T2.5 (cálculo pela biblioteca) e T2.6 (marca de critério); teto (62 linhas); sem diff em `server/src/modulos/businessmap`, `packages/contratos`, `server/migrations` e `web`; CI do push no head. Parecer em `docs/reviews/075-l6a-versao-criterio.md` gravado inteiro pela ferramenta Write (sem editar depois), com `pedido: 075-bloqueios-reais`, `branch: feature/075-l6a-versao-criterio`, `commit: 9e3078c17f4586afb3308108059755e2ebe6dc85`, veredito e bloco `## Achados` só com linhas de achado (sem linha solta; cite regra só pelo ID; até 300 caracteres); commit só do parecer com `Cartão: K-204` (mensagem gravada por Write em `/tmp/claude-1000/-home-rodrigoisensee-Metricas-MetricasDSPD/73d03d2b-ba9f-4d84-b635-cabe917583a2/scratchpad/msg-tl-075-l6a.txt` e `git commit -F` com esse caminho literal, `git add` explícito pelo caminho); antes do commit, `git -C /home/rodrigoisensee/MetricasDSPD-052g pull --ff-only origin feature/075-l6a-versao-criterio`; enviar com `git -C /home/rodrigoisensee/MetricasDSPD-052g push origin HEAD:refs/heads/feature/075-l6a-versao-criterio` na ferramenta Bash com `run_in_background: true`, conferindo por chamadas curtas `git ls-remote` e `date +%H:%M`; passou de 15 minutos, encerre a tarefa de fundo, deixe o commit local e relate o sha (o dono envia pelo terminal); caminhos literais, sem `$VAR`; sem PR.
- (E4) Nada a entregar aqui: não nesta delegação.
- (E2, E3, E5) Nada a entregar aqui: não nesta delegação.

## Decisões e restrições
- 2026-11-06 11:11: DECISÃO DO DONO: "A" (P-075-1): a via A: o bloqueio vem da comparação entre coletas do que já chega ao stg_card (is_blocked, block_reason_id, current_block_time), sem dado novo da fonte; perde bloqueio curto e o passado anterior à primeira coleta.
- 2026-11-06 11:11: DECISÃO DO DONO: "A" (P-075-2): início e fim do bloqueio = instante da coleta que viu a mudança.
- 2026-11-06 11:11: DECISÃO DO DONO: "A" (P-075-3): motivo sem mapa para os 7 do briefing aparece como "não classificado" na tela (o mapa dos motivos fica para quando as pessoas o definirem). DECISÃO DO DONO: "A" (P-075-3b): trocar de motivo sem desbloquear é o mesmo bloqueio.
- 2026-11-06 11:11: DECISÃO DO DONO: "A" (P-075-4): o fornecedor do bloqueio é o do card no início do bloqueio.
- 2026-11-06 11:11: DECISÃO DO DONO: "A" (P-075-5): card arquivado, descartado ou entregue ainda bloqueado: o bloqueio fecha nesse instante.
- 2026-11-06 11:11: DECISÃO DO DONO: "A" (P-075-6): O5 e a série do O1 voltam já com o histórico parcial, marcados nos gráficos (T2.6), respeitando o mínimo de 20 itens.
- 2026-11-06 11:11: DECISÃO DO DONO: "A" (P-075-7): a coleta do BusinessMap passa a ter agenda diária (depois da VM).
- 2026-11-06 11:11: DECISÃO DO DONO: "A" (P-075-8): O19, T10 e T12 entram no mapa real neste pedido.
- 2026-11-06 11:28: DECISÃO DO DONO (literal "faca as recomendacoes", resposta às P-075-9 a P-075-12): as quatro recomendações do Jarvis.
- 2026-11-06 11:28: DECISÃO DO DONO: "A" (P-075-9, pela recomendação): fim antes do início observado vira fim = início (duração 0; o bloqueio conta).
- 2026-11-06 11:28: DECISÃO DO DONO: "A" (P-075-10, pela recomendação): com troca de motivo no mesmo bloqueio, vale o motivo do início.
- 2026-11-06 11:28: DECISÃO DO DONO: "B" (P-075-11, pela recomendação): o T10 espera o campo fornecedor no mapa de campos (WS1); o lote 7 sai deste pedido.
- 2026-11-06 11:28: DECISÃO DO DONO: "B" (P-075-12, pela recomendação): o T12 espera a WS1 preencher a área solicitante; o lote 8 sai deste pedido. ESCOPO- (dono): o T10 e o T12 da E4 (P-075-8) ficam para depois da WS1; o O19 continua.
### Dos pedidos de que este depende (064, 065), literais
- (064) DECISÃO DO DONO (2026-11-04): "A" (levantamento das lacunas de dado real): o software-architect e o qa-engineer comparam cada tela das operacionais, do apontamento e da sustentação com o dado real da base e listam o que falta, sem mudar código. [Nota do Jarvis: o "sem mudar código" vale para este levantamento; as correções viram pedidos próprios, como o 065, decidido pelo dono na "C".]
- (064) 2026-11-04 08:04: DECISÃO DO DONO "C" (bloqueados no mapa real): A agora (tirar a tela de bloqueados do mapa real, Sem dado real até a coleta gravar bloqueios) e B depois (coleta grava bloqueios) como cartão. DECISÃO TÉCNICA (Jarvis): A vira o pedido 065 (modo implementar; este pedido segue em analisar); B vira o cartão K-204.
- (064) 2026-11-04 14:11: DECISÃO DO DONO "B" (S8): contar só os incidentes com resposta; abaixo de 20 não publica. DECISÃO TÉCNICA (Jarvis): vira o pedido 066 (implementar).
- (064) 2026-11-04 14:13: DECISÃO DO DONO "Atipico acima de 10 horas" (L6): o dia atípico passa a acima de 10 h. DECISÃO TÉCNICA (Jarvis): vira o pedido 067 (implementar); os outros limites seguem provisórios até o dono dizer o contrário (suposição no recibo).
- (065) DECISÃO DO DONO (2026-11-04): "C" (bloqueados no mapa real, pedido 064): fazer A agora (tirar a tela de bloqueados do mapa real; ela mostra "Sem dado real" até a coleta gravar bloqueios) e B depois (corrigir a coleta para gravar os bloqueios), como cartão.
- (065) DECISÃO DO DONO (2026-11-04): "isso" (recibo do 065): tirar BLOQUEADOS do mapa real e mostrar "Sem dado real" também nas partes do O1 (bloqueados), do O2 (motivo do bloqueio) e do O5 (horas bloqueadas), em vez de zero; a coleta gravar bloqueios fica no K-204.
- (065) DECISÃO DO DONO (2026-11-04): "B" (Q-065-1, percentual de eficiência do O5): o O5 inteiro mostra "Sem dado real" até a coleta gravar bloqueios (K-204), em vez de publicar o percentual com ressalva.
- Nota do Jarvis: as do 064 sobre S8 e dia atípico não tocam esta entrega; as do 065 valem "até a coleta gravar bloqueios" e este pedido é essa parte B.
- ADR 0020 (citada no pedido; leia na develop): a revisão 5 dela é a condição da via B, que o dono não escolheu; nada nesta entrega.
- ADR 0022 (citada no pedido; leia na develop): o item 3 nega o stg_bloqueio por padrão; a via A não o usa; nada nesta entrega.
- ADR 0004 (citada no pedido; leia na develop): formato dos pareceres e aceite do dono a bug médio ou baixo aberto; não muda este lote.
- ADR 0029 (citada no pedido; em proposta, já na develop pelo PR 248): derivação de bloqueio por comparação de versões; este lote só testa e não muda o que ela decide.
- 2026-11-06 11:47: Plano corrigido pelo software-architect (docs/analises/075-plano.md, sem commit; tabela §0 liga achado a trecho): lotes de até 150 linhas e um comportamento (1a/1b, 2a/2b, 3, 4a/4b/4c, 5a/5b, 6a/6b, 9a/9b); 1a e 9b incompatíveis com entrada em aceitas.json; evt_bloqueio guarda o reason_id e fato_bloqueio aplica o mapa na projeção (o mapa preenchido depois reclassifica o passado); P-075-9 a 12 decididas, T10 e T12 fora, pendências na §5; recomendados todos aplicados. Ponto aberto TL-A7: de qual checkout roda a projeção real. DECISÃO TÉCNICA (Jarvis): pela decisão do dono de 10:29 ("faça tudo por aqui"), a projeção real roda no ambiente local a partir da worktree da main (pedido 076), então a release que leva os lotes à main vem antes da prova do lote 6b; o tech-lead confirma os bloqueantes do plano (E3.3) e o lote 1a começa depois.
- 2026-11-06 11:50: E3.3 confirmada pelo tech-lead: docs/analises/075-plano-revisao-tech-lead.md, aprovado com ressalvas, A1 a A8 resolvidos; regra de reabertura do TL-A5 aceita sem pergunta ao dono; recomendados novos A9 (lote 2b: card arquivado ou entregue que segue bloqueado não abre bloqueio novo, com teste), A10 (lotes 4a, 5b e 9a sem margem no teto), A11 (lote 4b: VERSAO_PROJETOR sobe para bm-f4/3?). Desenho técnico fechado. DECISÃO TÉCNICA (Jarvis): o lote 1a começa com o node-backend; os recomendados A9 a A11 entram nos briefs dos lotes 2b, 4a, 4b, 5b e 9a.
- 2026-11-07 12:56: DECISÃO TÉCNICA (Jarvis): lote 4c ao node-backend (052f, branch nova feature/075-l4c-colunas-grant a partir da ponta do 4b 3ae2d53d2be8d61573226af64ee1e6f505dd4fba, que ainda não está na develop; entra na integração depois do 4b, pela decisão do dono de 12:56). Entram o plano do Lote 4c e o CA-075-1 ponta a ponta (adiado do 4a); depois, enquanto o teto de 150 couber, nesta ordem: (1) A1 do review do 4b (comentários de append-only em projetor.ts:26 e :274), (2) A2 do review do 4b (teste .pg de bloqueio aberto que fecha numa projeção seguinte, atualizado_por_coleta_id só nas linhas mudadas), (3) A1 do QA do 4b (vigência de ref_coluna num instante passado), (4) A3 do QA do 4b (dublê que prove M5 e M13); o que não couber fica registrado no relatório. A medida do TL-A6 segue sem PostgreSQL local (pendência para a prova do dono no 6b).
- 2026-11-07 15:00: DECISÃO TÉCNICA (Jarvis): lote 6a ao node-backend na worktree 052g (livre: o PR 256 já foi mesclado), branch nova feature/075-l6a-versao-criterio a partir da develop 54f02c42b51aba3355e9f0428f058113f916c4c9 (já com o 4b). O 6a não toca arquivo do 4c (criterios.ts e parte-sem-dado.ts), então não se empilha sobre ele; a dependência "4c em develop" do plano vale para a ordem de entrada: o 6a entra na integração depois do 4c. A data da versão segue pendente (prova do dono): o 6a sai com a data pendente marcada, como o plano prevê. Os recomendados A1 e A2 da segurança do 4c (testes do 4c) vão ao lote 6b, que já depende do 4c mesclado, e não ao 6a.
- 2026-11-07 19:22: Conferência da entrega do 6a (node-backend-12, rodada 1): não cumpriu; PQ-2 e PQ-3 cumpriram, PQ-1 com a CI ainda rodando; escopo: fora em server/src/modulos/metricas/servico.ts (+3 -1, a chamada da função atrás do interruptor), que o Entregar não nomeava. DECISÃO TÉCNICA (Jarvis): falha do brief (o "ligada só com o interruptor" exige a chamada em servico.ts); o node-backend-13 é o -12 com servico.ts nomeado, sem nova delegação, e a entrega 0fa4d217 é conferida contra ele quando a CI fechar (como no 077 react-frontend-8).
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real.
- Recursos: vitest com no máximo 2 workers (DECISÃO TÉCNICA do Jarvis, 075, 14:40); regra da noite do dono (075, 2026-11-07 00:07): até 3 agentes e 1 git push por vez, escalonados pelo Jarvis.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O GitHub precisa de `github.com` e `api.github.com` em `allowed_domains`; o npm, de `registry.npmjs.org`. R-VERIFY: nunca `--no-verify` nem `--force`.
- 2026-11-06 13:00: Retomada do Jarvis em sessão nova (a anterior perdeu o controle remoto). DECISÃO TÉCNICA (Jarvis): push simples dos dois commits dos pareceres do lote 1a, com limite de 15 minutos; em paralelo, QA do lote 1a (E1.8) e o lote 3 com o node-backend (E1.4, independente do 1a, branch feature/075-l3-motivo-dominio a partir da develop, pela ordem do plano §7 que permite o 3 antes do 2a); o 1b espera o 1a mesclado na develop.

- 2026-11-06 14:15: Lote 1b entregue pelo node-backend: feature/075-l1b-leitura (worktree 052e) em 0af840f66c10d7136766800eacf025f055c0856f, CI do push verde (run 42258362444), 2 commits, cerca de 30 linhas: bloqueioDe em mapa.ts devolve "não classificado" para motivo fora dos 7 (nunca o texto lido); o O19 fica em packages/metricas/src/businessmap/o19.ts (não em server/, como o brief supunha) e itera MOTIVOS_BLOQUEIO_PUBLICADOS com "não classificado" por último; 4 testes que contavam 7 motivos passaram a 8 (o de metricas.test.ts só apareceu na CI do primeiro push); contratos e businessmap sem diff. DECISÃO TÉCNICA (Jarvis): conferências do merge do PR 246 e da entrega do 1b em paralelo; depois review (tech-lead) e segurança (controle 2, leitura de projeção) do 1b; o node-backend segue para o lote 2a (derivador puro) a partir da develop d1f22008.
- NÃO tocar: código, testes, os pareceres de outros papéis, as ADRs, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho em docs/analises/075-desenho.md, só leitura, sem commit; regra de negócio vira pergunta ao dono." · etapa de outra delegação; continua no pedido
- "E1.2 (security-engineer): modelo de ameaças em docs/security/075-modelo-ameacas.md, só leitura, sem commit." · etapa de outra delegação; continua no pedido
- "E1.3 (dono): validar o desenho e responder as perguntas." · etapa de outra delegação; continua no pedido
- "E3.1 (software-architect): plano técnico com lotes depois da validação, cobrindo E1, E2 e E4, com as decisões do dono de 11:11." · etapa de outra delegação; continua no pedido
- "E3.2 (ux-designer): especificação curta do motivo "não classificado" e da marca de histórico parcial na tela de bloqueados e no O5, em docs/ux/, sem commit." · etapa de outra delegação; continua no pedido
- "E3.3 (tech-lead): revisão do plano docs/analises/075-plano.md (lotes, testes, teto, ordem), parecer curto em docs/analises/075-plano-revisao-tech-lead.md, sem commit." · etapa de outra delegação; continua no pedido
- "E3.4 (security-engineer): revisão de segurança do plano contra o modelo de ameaças, parecer curto em docs/analises/075-plano-revisao-seguranca.md, sem commit." · etapa de outra delegação; continua no pedido
- "E1.5 (react-frontend): implementação dos lotes de tela (5a, 5b e a parte web do 9b)." · etapa de outra delegação; continua no pedido
- "E1.4 (node-backend): implementação por lote do plano (1a, 1b, 2a, 2b, 3, 4a, 4b, 4c, 6a, 6b, 9a), cada um numa branch feature/075-<lote> a partir da develop." · etapa de outra delegação; continua no pedido
- "E1.7 (security-engineer): parecer de segurança por lote com gatilho." · etapa de outra delegação; continua no pedido
- "E1.8 (qa-engineer): QA por lote." · etapa de outra delegação; continua no pedido
- "E1.9 (tech-lead): PR por lote, depois do QA." · etapa de outra delegação; continua no pedido
- "E1.10 (ux-designer): revisão de interface dos lotes de tela." · etapa de outra delegação; continua no pedido
- "E3.5 (software-architect): desenho da distribuição por motivo do O2 (agregado no contrato num lote novo ou não), em docs/analises/075-o2-distribuicao.md, sem commit." · etapa de outra delegação; feita
- "E3.6 (ux-designer): ajuste da especificação do O2 em docs/ux/075-bloqueios-reais.md se o agregado não vier, sem commit." · etapa de outra delegação; feita
- "E5.1 (devops-engineer): agenda diária da coleta do BusinessMap, depois da migração para a VM." · etapa de outra delegação; continua no pedido


## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052g show origin/feature/075-l6a-versao-criterio:docs/reviews/075-l6a-versao-criterio.md` · espera: contém 'commit: 9e3078c17f4586afb3308108059755e2ebe6dc85'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
