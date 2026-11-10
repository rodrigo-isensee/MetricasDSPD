# 086 · O que falta para Operacional, Sustentação (Acelerato) e Apontamento ficarem com dado real antes da VM

Pedido 086, etapa E1.1. Autor: software-architect. Data: 2026-11-10. Só leitura, sem commit, nada rodado contra a base e nenhum `.env` aberto.

## Como ler e o que este inventário não prova

- O mapa de partida é `docs/analises/064-lacunas-dado-real.md` (medição de 2026-11-04). Os pedidos 065 a 077 mudaram a develop depois dele. Onde o estado atual vem do histórico dos pedidos, a fonte está na célula. **Os números da base (contagens) são de 04/11 e precisam ser medidos de novo antes da migração.**
- `packages/contratos/src/origem.ts` não existe neste checkout (branch de docs). Li a cópia da worktree `/home/rodrigoisensee/MetricasDSPD-052f` (branch do Lote 7 do 077, com o Lote 5 já mesclado): `METRICAS_ORIGEM_REAL` (`origem.ts:12-37`) tem O1, O2, O3, O4, O6, O7, O9, O10, O11, O13, EI_FL1, PV1, S2, S3, S4, S8, S10, TENDENCIA_FLUXO (linha 34) e TENDENCIA_SUST (linha 36, só nessa branch). `BLOQUEIOS_COM_DADO_REAL = false` (`origem.ts:55`) e `AJUSTE_PRIORIDADE_COM_FONTE = false` (`origem.ts:60`). A leitura de `METRICAS_SEM_SIMULACAO` (mais adiante no arquivo, linhas 127-132 nas outras worktrees) não foi aprofundada: é o que impede dado simulado nas tendências.
- Não consegui rodar `gh pr list` (esta delegação não tem Bash). Usei o que o brief nomeia e o histórico dos pedidos: PR 279 (077 Lote 5) já mesclado pelo dono (`docs/pedidos/077-tendencias-dado-real.md:378`); PR 280 (085) e o PR do Forge 0.45.2 não li; Lote 7 do 077 sem PR (`feature/077-l7-sust-real`), com develop a receber (`077...:378`). Confirme a lista de PRs abertos com `gh pr list` antes de decidir.
- Estados usados: **real na develop**; **em PR aberto**; **lote pendente do time**; **preso** (e a quê: decisão do dono, pessoas/WS1 ou WS4, dado da fonte, governança). "Real" significa que a tela lê a base real, não que a base tenha massa suficiente: abaixo de 20 itens a estatística não publica (regra do briefing, não é defeito).

## 1. Painel Operacional (fluxo, BusinessMap)

| Métrica ou bloco | Estado | O que trava e próximo passo | Fonte |
|---|---|---|---|
| O2, O3, O4, O7, O9, O10 (parte do time), O11, O13, EI_FL1 | Real na develop, com massa | Nada trava. Melhoria tem 8 entregas na janela e não publica (regra de 20). Remedir na base atual | 064:209-211, `origem.ts:12-23` |
| O1 (WIP e aderência) | Real na develop, mas só 3 de 50 times com limite de WIP | Preso: pessoas/WS1 (limite e papel das colunas, M2 e M3). Sem limite o cartão fica "sem referência" | 064:201-202 |
| O6 (previsibilidade por classe) | Real na develop, sai sem classe | A projeção das colunas do card (L2-a e L2-b) entrou na develop; `classe_servico` depende do campo existir no quadro. Preso: pessoas/WS1. Remedir | `KANBAN.md:165` (K-206), 064:184 |
| O10 (visão do cliente) | Real, mas igual à visão do time enquanto `area_solicitante` estiver vazia | Preso: pessoas/WS1 preencher a área solicitante | 064:46, 184 |
| BLOQUEADOS, faixa "Pede atenção hoje", O5, parte de bloqueio do O1 e do O2, O19 | **Lote pendente do time** (pedido 075) e, no fim, release | Hoje fora do mapa real, "sem dado real" (de propósito, pedido 065). Lotes 1a, 1b, 2a, 3, 4a, 4b, 5a e 6a na develop (075:82, 127, 262, 324); lote 4c pronto, PR sem abrir por recusa do hook, ação do dono abrir (075:344); lotes 6b, 9a e 9b (ligar o interruptor `BLOQUEIOS_COM_DADO_REAL` e tirar o "sem dado real") esperam a prova da data da primeira coleta e a release (`KANBAN.md:124`). Próximo: dono abre o PR do 4c; depois 6b, 9a e 9b |
| O12 (acordos × vencidos) | Preso: pessoas/WS1 | Falta o campo `data_acordada` no quadro; K-231 espera a resposta do de-para P-L2-1 (`KANBAN.md:44`) |
| O8, O14, O15, O16, O18 | Preso: pessoas/WS1 | Campos T1.3 (tamanho, origem, fase de detecção, severidade, origem do bug) não existem no quadro; sem eles o time não projeta nada | 064:184 |
| O17, O20 a O26 | Preso: decisão e plano | Fora do mapa real; O20, O21 e O25 têm dado na base, falta plano de cálculo (plano F6b do 052, não aberto). Decisão do dono sobre prioridade | 064:61-67, 215 |
| Resumo, tendência do fluxo (TENDENCIA_FLUXO) | **Real na develop** (Lote 5, PR 279 mesclado em 2026-11-10) | Sem carga inicial mostra o motivo genérico de sem-dado-real (decisão "2-A", 077:377). Falta só medir a latência a frio (268 a 290 ms contra 300 ms, A2 do QA, 077:354) na homologação | 077:376-378 |
| Filtros de sistema, objetivo e área | Preso: pessoas/WS1 | `ref_dominio` do BusinessMap vazio; K-212 aguarda os domínios definidos por pessoas | `KANBAN.md:49`, 064:205 |
| SLE no O3 | Preso: governança | `ref_sle` sem carregador e sem definição (T6.2). O cartão mostra "SLE não definido"; esperado, não bloqueia | `KANBAN.md:51` (K-214), 064:187 |

## 2. Painel de Sustentação (Acelerato)

| Métrica ou bloco | Estado | O que trava e próximo passo | Fonte |
|---|---|---|---|
| S2 (aderência ao SLA) | Real na develop | Todo fechado conta como apurável enquanto `excecao_sla_registro_posterior` não tiver fonte (L9). P1 abaixo de 20 não publica. Preso (ressalva): pessoas/WS4 | 064:117, 145 |
| S3 (volume por prioridade) | Real na develop; "ajustes manuais" sai `null`, não 0 | `AJUSTE_PRIORIDADE_COM_FONTE = false` (`origem.ts:60`) até o campo vir da fonte e o dono ver a contagem. Preso: dado da fonte e decisão do dono | `origem.ts:56-60` |
| S4 (resolução por nível) | Real, sem estatística de tempo por etapa | 70% dos fechados sem `nivel_resolucao` e etapas sintéticas (decisão D-7). Preso: pessoas/WS4 (M4). Sem correção planejada de L10 | 064:120, 203 |
| S8 (reabertura) | Real, com ressalva | Decisão "B" do dono (pedido 066): só conta incidente com resposta, abaixo de 20 não publica; 95% sem resposta na medição, então a tela tende a não publicar. Preso: pessoas/WS4 preencher o campo | `KANBAN.md:170`, 064:127, 204 |
| S10 (fila de atribuição) | Real, sem massa | 9 intervalos no histórico, abaixo de 20 (regra, não defeito) | 064:126 |
| Resumo, tendência da sustentação (TENDENCIA_SUST) | **Lote pendente do time** (Lote 7 do 077) | Entregue e aprovado em review e QA, sem PR; recebe a develop (node-backend-17) e depois review e QA incrementais e PR (077:358-364, 378). Próximo: PR; mesclar | `origem.ts:36` (worktree 052f) |
| Tendência de SLA, ressalva do S2 | Na develop (lote 6a, PR 262) | Efeito nulo até o Lote 7 entrar | 077:133, 148 |
| S1 (MTTA e MTTR), faixa "Pede atenção no período" parcial | Preso: governança e dado da fonte | Faltam `ref_alvo_prioridade` (prazos de SLA por prioridade) e `primeiro_atendimento_em`. K-207 segue aberto | `KANBAN.md:48`, 064:118 |
| S5, S6, S7, S9, S11, S12 | Preso: pessoas/WS4 | Colunas e domínios do campo do chamado (P-DS-19) ainda não definidos. O projetor da ordem das etapas (L9-c, PR 238) está na develop, mas S9 segue SDR; a lista `etapa_fluxo` é trabalho de pessoas/WS4 | 069:198-200, 064:121-130 |
| EI_SUST | Preso: decisão do dono | Cálculo não definido para o Acelerato; é pergunta de regra de negócio | 064:124 |
| Texto do recorte (L8) | Real, risco latente | Coincide hoje com o `ref_dominio`; baixa prioridade (K-215, react-frontend) | 064:115, `KANBAN.md:52` |

## 3. Aba Apontamento (BusinessMap)

| Bloco | Estado | O que trava e próximo passo | Fonte |
|---|---|---|---|
| KPIs, Distribuição, Matriz, Dia a dia, Capacidade | Real na develop, com massa (15826 apontamentos, 11 subgrupos acima de 20 em 04/11) | Remedir. Dia atípico passou a 10 h (pedido 067, na main) | 064:101-107, `KANBAN.md:171` |
| Cabeçalho, frescor | Real; M1 resolvido no código (coleta parcial, PR 219 na main) | Depende de uma coleta do apontamento com sucesso na base da VM | `KANBAN.md:167` |
| Aviso "registro de horas incompleto" (pedido 063) | Na develop e na main (PR de release 211) | Depende da migração 0034 antes da API; na base local a tabela não existia (Q20 falhou em 04/11). K-200 e K-216 | 064:100, `KANBAN.md:46, 125` |
| Calendário e feriados (capacidade e dia útil) | Carregador na develop (L7-a e L7-b, K-210) | Os **dados** (feriados e calendário) são de pessoas ou do dono, via `ref:sync-calendario`; sem eles a capacidade conta feriado como dia útil | `KANBAN.md:166`, 064:189 |
| Achados e qualidade (flags) | Real, mas leitura a confirmar | 40% "não classificado" e 95,8% com flag: o significado dos bits precisa ser conferido antes de o dono ler a tela. K-213, software-architect, ainda aberto | `KANBAN.md:50`, 064:206 |
| Rota da aba | Condição de ambiente | Sem `PG_APONTAMENTO_URL` a rota não existe e a aba mostra erro (L12) | 064:148, 194 |

## 4. O que a migração para a VM exige do projeto

Só o que está escrito nos cartões; nada foi lido do `.env` nem da VM.

1. **Coleta agendada.** O roteiro da coleta diária está pronto (K-196, PR 204 na main). Mas só o roteiro do dono: instalar a agenda na VM é ação dele (`KANBAN.md:164`, `docs/pedidos/061`). A agenda diária do BusinessMap (P-075-7, E5.1 do 075) só entra depois da VM (075:54, 32).
2. **Variáveis de ambiente.** `.env` da VM com as credenciais da coleta (BusinessMap, Acelerato) e `PG_APONTAMENTO_URL` mais a senha do papel `dspd_api_apontamento`, diferente da do `.env` local (`KANBAN.md:16, 46, 125`).
3. **Banco.** `db:migrate` até a 0034, **antes** de subir a API (aviso de registro incompleto lê `ctl_apontamento_cobertura`; 064:100). A primeira coleta do Acelerato depois do L9-c exige `--reconhecer-mudanca` (069:198). Carga inicial do BusinessMap e do Acelerato precisa existir na base da VM, senão as tendências mostram o motivo genérico (077:377).
4. **Publicação.** Release `develop` → `homolog` → `main` por PR; a main é do dono. A release do noite de 2026-11-07 (K-242) está suspensa na P-078-1 (`KANBAN.md:35`). A homologação mede a latência a frio das tendências (077:354, 364). Há também o pedido de 085 e o Forge 0.45.2 (K-255) em andamento, que não li.
5. **Dados de configuração por pessoas** (ver tabelas): feriados e calendário, limite de WIP, papel e tipo das colunas, domínios do BusinessMap, campos T1.3 do quadro, nível de resolução e campos do chamado no Acelerato, SLE e prazos de SLA por prioridade. Nada disso o time implementa.

## 5. Ordem recomendada

1. **Agora, sem decisão nova:** mesclar o PR do Lote 7 do 077 (depois que receber a develop) e abrir e mesclar o PR do lote 4c do 075 (ação do dono por recusa do hook). Fecha as tendências nos dois lados e o último lote de tela do bloqueio.
2. **Medir de novo a base** (as 32 consultas Q01 a Q32 de 064 mais Q20 com a 0034 aplicada) antes de decidir o resto; os números de 04/11 estão velhos.
3. **Release até a main**, para a VM receber o código certo, resolvendo antes a P-078-1 (K-242).
4. **Na VM, na ordem:** `.env` e senhas, migrações até a 0034, carga inicial do BusinessMap e do Acelerato, `--reconhecer-mudanca` no Acelerato, agenda da coleta diária, medir latência a frio das tendências.
5. **Depois da primeira coleta na VM:** provar a data da primeira coleta e liberar os lotes 6b, 9a e 9b do 075 (bloqueios reais, BLOQUEADOS, O5, O19), e agendar a coleta diária do BusinessMap (E5.1).
6. **Em paralelo e sem prazo do time:** pessoas/WS1 e WS4 preenchem os dados de configuração (seção 4, item 5); decisões do dono pendentes: P-E10-2, P-E10-5 e P-E10-6 (073), P-077-6 (Acelerato, janela incompleta) e a leitura dos bits da flag do Apontamento (K-213). Sem elas, o que está "preso" não fecha.

O que vai para a VM com dado real confiável hoje: O2, O3, O4, O7, O9, O11, O13, EI_FL1, S2, S3, tendência do fluxo e a maior parte do Apontamento. O que vai com "sem dado real" declarado: bloqueios (até os lotes 6b a 9b), O12, O8, O14 a O26, S1, S5 a S7, S9, S11, S12, EI_SUST.
