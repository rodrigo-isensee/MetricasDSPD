# 099: o PROC 30.000.010 (gestão de incidentes) confrontado com o plano de dado real da sustentação (E2.2)

- **Propósito:** conferir o documento de processo que o dono enviou ("aqui tem os slas dos atendimentos e o processo") contra a matriz do briefing §3.4 e contra o plano `docs/analises/099-dado-real-operacional.md` (linhas OP-13 a OP-20, perguntas Q-099-4 a Q-099-10), e dizer o que o documento resolve, o que muda nas recomendações e o que ainda pede decisão do dono.
- **Documento lido:** `docs/referencia/PROC_30.000.010-gestao-de-incidentes-de-sistemas.pdf`, inteiro (14 páginas), procedimento "Gestão de Incidentes de Sistemas", versão 002, data de homologação 24/07/2026, **status "Em Aprovação"**. Nomes de pessoa do documento não são copiados aqui; os papéis (Atendente N1, Coordenador de Sistemas / Plantão etc.) são citados porque são do processo.
- **Também lidos:** briefing §3.4 e o catálogo S1 a S12 (linhas 388 a 399); `docs/pedidos/056-acelerato-mysql.md` (decisões D-2 a D-16 do dono); `docs/tecnica/biblioteca-de-calculo.md` (S1); o comentário de `server/src/modulos/acelerato/normalizador.ts:128` na `develop` (worktree demo). **Não li a base real nem `.env` e não rodei nada.**
- **Estado:** proposta. Nenhuma linha de código muda por esta análise.

## 0. Resumo para o dono

1. **Os prazos batem 100% com o briefing.** Os 10 prazos (primeiro atendimento e restauração, P1 a P5) e a matriz Impacto × Urgência do PROC são iguais aos do briefing §3.4 (§1). A Q-099-5a deixa de ser dúvida de valor: o arquivo versionado de alvos cita o PROC 30.000.010 v002 como fonte.
2. **Ponto novo que o documento expõe: a unidade de tempo dos prazos não é uniforme.** O PROC escreve "úteis" em sete prazos e não escreve nos três de P1 e P2 em minutos e horas (P1 15 min e 4 h, P2 30 min). A biblioteca calcula a S1 toda em horas úteis (D-3 do 056). Vira a **Q-099-11** (§5), porque é regra de cálculo e não se resolve por inferência.
3. **Primeiro atendimento já tem decisão do dono que o plano 099 não citou:** a D-13 do 056 (2026-10-30 17:02, "A") manda contar o primeiro comentário como está, com nota de que inclui respostas automáticas. O código ainda diz "espera a D-13" (`normalizador.ts:128`), o que está desatualizado. O PROC define primeiro atendimento como "primeiro atendimento **significativo pelo atendente**", o que é mais estrito que a D-13. A Q-099-5b vira **"manter a D-13 ou reabri-la"** (§5); recomendação: manter agora, com a nota, e reabrir quando houver fonte que separe atendente de automação.
4. **Pendência: o PROC confirma os quatro motivos do briefing** (aguardando solicitante, fornecedor, área vinculada, janela de mudança) e **muda a recomendação da Q-099-8 numa etapa**: o PROC usa "equipe interna" para a equipe **responsável pelo chamado**, não para a área vinculada. Então "Aguardando Equipe Interna" não pode virar "aguardando área vinculada" sem o dono dizer para que a etapa é usada (§3.2).
5. **O17 (causa raiz) muda de recomendação:** pelo PROC, o chamado de incidente registra só a **causa aparente**; a causa raiz é investigada no Registro de Problemas de Sistemas (outro processo, PROC 30.000.020). Um campo de causa raiz no chamado de incidente é improvável, e "causa aparente" não é causa raiz (§4, Q-099-7).
6. **Parte da Q-099-4 já foi decidida no 056:** D-14 (S9 sem cumprimento da previsão) e D-15 (S11 sem conversão em Registro de Problema até haver campo). A Q-099-4 fica só para O8, O16, S12, S1 (exceção de registro posterior) e as extensões do O22 e do O26.
7. **Sigilo:** o PDF diz "Uso interno. É proibido o compartilhamento." e está não rastreado em `docs/referencia/`. Commitá-lo leva o documento ao GitHub. Recomendo não commitar o PDF sem o "ok" do dono; esta análise só cita valores e definições do processo, sem nomes.

## 1. Prazos por prioridade: PROC × briefing §3.4

Fonte do PROC: tabela da etapa 3 "Priorizar (Impacto × Urgência)", p. 5. Fonte do briefing: §3.4, "Matriz de prioridade", linha 97.

| Prioridade | Primeiro atendimento (PROC) | Primeiro atendimento (briefing §3.4) | Restauração (PROC) | Restauração (briefing §3.4) | "úteis" escrito no PROC? | Resultado |
|---|---|---|---|---|---|---|
| P1 — Crítico | Até 15 minutos | 15 min | Até 4 horas | 4 h | não, nos dois | **igual** |
| P2 — Alto | Até 30 minutos | 30 min | Até 8 horas úteis | 8 h úteis | só na restauração | **igual** |
| P3 — Médio | Até 2 horas úteis | 2 h úteis | Até 2 dias úteis | 2 dias úteis | sim, nos dois | **igual** |
| P4 — Baixo | Até 4 horas úteis | 4 h úteis | Até 5 dias úteis | 5 dias úteis | sim, nos dois | **igual** |
| P5 — Planejado / Muito baixo | Até 1 dia útil | 1 dia útil | Até 10 dias úteis | 10 dias úteis | sim, nos dois | **igual** |

**Matriz Impacto × Urgência** (p. 5): Alto/Alta P1, Alto/Média P2, Alto/Baixa P3; Médio/Alta P2, Médio/Média P3, Médio/Baixa P4; Baixo/Alta P3, Baixo/Média P4, Baixo/Baixa P5. **Igual** à do briefing.

**O que o PROC tem e a matriz do briefing não tem (faltando no briefing):**

| Item do PROC | Onde | Efeito nas métricas |
|---|---|---|
| Frequência de comunicação por prioridade (P1 a cada 1 h; P2 a cada 2 h; P3 a cada 4 h úteis; P4 no encerramento e em mudança relevante; P5 no encerramento ou sob demanda) | p. 5, etapas 4 e 6 | Não é métrica do catálogo. O briefing já põe a "cadência de comunicação por prioridade" na automação externa (§3.4, "O que não é nativo"). Nenhuma ação no 099. |
| Responsável pela comunicação por prioridade (papel) | p. 5 | Papel, não pessoa; não entra em métrica (regra de não avaliação individual). |
| Encerramento automático sem retorno do solicitante em até 2 dias úteis | etapa 12, p. 8 | Explica o motivo "Encerrado sem retorno" do briefing (S6). Sem efeito no cálculo. |
| Designação de substituto em até 15 minutos quando N2/N3 indisponível | 4.1.2, p. 10 | Coerente com a S10 (aceite em 15 min, D-14 do 056). |
| Formalização do chamado em até 30 minutos no tratamento emergencial | 4.1.1, p. 9 | Define a "exceção de SLA por registro posterior" (S1, S2, S12). |
| Metas dos indicadores: % restaurados dentro do SLA > 90%; reabertura < 5%; P1/P2 com avaliação de problema 100%; registro posterior com tendência de redução | §6, p. 12-13 | Iguais às metas do catálogo (S2, S8, S11, S12). A D-16 do 056 já tira a comparação da S8 com 5% enquanto a cobertura for baixa. |

**O que o briefing tem e o PROC não tem:** as 11 etapas do Acelerato, a coluna "SLA corre / pausa" e os campos personalizados (§3.4). O PROC fala em estados e sub status "quando o sistema de ITSM permitir"; a tradução em etapas é da solicitação de mudança (WS4), não do PROC. Em especial, **o PROC não diz que o SLA pausa** em pendência ou em aguardando validação; quem diz é o briefing §3.4. Não há conflito (o PROC é silencioso), mas a fonte da pausa é o briefing.

## 2. Definições do PROC que tocam S1 e S9

| Conceito | Definição no PROC (resumo fiel) | Onde |
|---|---|---|
| Início do SLA | "a partir da abertura do chamado no sistema de ITSM" | §3 SLA, p. 1 |
| Primeiro atendimento (MTTA) | tempo entre a abertura formal e "o primeiro atendimento **significativo pelo atendente**", com os casos de exceção de registro posterior considerados separadamente | §3 e §6, p. 2 e 12 |
| Restauração (MTTR) | tempo entre a abertura formal e "a **restauração validada** do serviço", com a exceção de registro posterior à parte | §3 e §6, p. 2 e 12 |
| Restauração do serviço | restabelecimento da operação normal percebida pelo usuário, por contorno ou resolução definitiva | §3, p. 2 |
| Estados principais | Aberto, Em diagnóstico, Em atendimento, Aguardando validação, Encerrado | §3 "Estado do Chamado", p. 2 |
| Sub status ou motivos de pendência | aguardando informações do solicitante; aguardando fornecedor; aguardando área vinculada; aguardando janela de mudança/manutenção (e, como sub status que não são pendência: tratamento por contorno, avaliação de problema, exceção de SLA por registro posterior) | §3 p. 2; 4.1.1 p. 9; 4.1.3 p. 10-11 |
| "Equipe interna" | a equipe **responsável pelo chamado**, que segue com o acompanhamento enquanto o fornecedor atua ("sob responsabilidade da equipe interna designada") | etapa 11 p. 7; 4.1.3 p. 10 |
| "Área vinculada" | **outra área** de que a restauração depende, por chamado vinculado | §3 "Chamado Vinculado" p. 1; 4.1.3 "Atraso na tratativa vinculada" p. 10-11 |
| Escalação não reinicia o prazo | o PROC mantém o chamado de incidente como registro principal e o controle dos prazos com a equipe interna; o briefing explicita "escalação não reinicia SLA" | etapa 11, 4.1.3; briefing §3.4 |
| Causa | o chamado de incidente registra a **causa aparente** ("razão superficial"); a causa raiz é investigada no Registro de Problemas de Sistemas, com vínculo ao incidente | §1, §3, etapas 13 e 14 |

## 3. Confronto com o plano 099 (S1 e S9)

### 3.1 S1 (OP-13): primeiro atendimento e restauração

| Ponto do plano | O que o PROC diz | Conclusão |
|---|---|---|
| Alvo por prioridade (Q-099-5a, opção A: matriz do briefing num arquivo versionado) | Mesmos 10 valores (§1) | **Confirmado.** O arquivo do lote D3 cita "PROC 30.000.010 v002" e o briefing §3.4. Como o PROC está "Em Aprovação", uma versão nova com prazo diferente entra como versão de critério (T2.6, `afeta = ['S1', 'S2']`). A Q-RO-11 continua: compara a matriz com o prazo gravado em cada chamado (`sla_pa_prazo_min`, `sla_r_prazo_min`), que é o "SLA vigente" que o PROC também cita na meta (§6). |
| Unidade: a biblioteca calcula a S1 toda em horas úteis (`biblioteca-de-calculo.md`, S1 "HU"; D-3 do 056) | P1 (15 min e 4 h) e P2 primeiro atendimento (30 min) sem "úteis"; P1 e P2 têm Coordenador / Plantão | **Diferença nova.** Medir um P1 aberto às 18h de sexta em horas úteis contra "4 horas" dá outro resultado do que em horas corridas. Vira a Q-099-11 (§5). |
| Início = `aberto_em` | "a partir da abertura do chamado no sistema de ITSM" | **Confirmado.** |
| Primeiro atendimento: "espera a D-13" (plano §2, OP-13; `normalizador.ts:128`) | "primeiro atendimento significativo pelo atendente" | **O plano e o comentário do código estão desatualizados:** a D-13 foi decidida em 2026-10-30 17:02 ("A": o primeiro comentário como está, com nota de que inclui respostas automáticas). A D4 pode projetar `primeiro_atendimento_em` de `data_primeiro_comentario` já, com a nota. O PROC pede mais que isso ("significativo", "pelo atendente"): a diferença vai ao dono como Q-099-5b revista (§5). |
| Fim = `restaurado_em` = `data_pronto` ("fim do relógio de resolução", `normalizador.ts:128`) | "restauração **validada**"; a restauração ocorre na etapa 10 e a validação na 12 (até 2 dias úteis, depois encerramento automático) | **Conferir, não perguntar ainda.** Se `data_pronto` for o instante da restauração (entrada em aguardando validação), bate com o PROC. Se for o encerramento, a S1 inclui a espera da validação, que o briefing §3.4 marca como pausa: a biblioteca já desconta pendências; o node-backend confere no lote D4 se o intervalo de aguardando validação entra no desconto. Pergunta ao time de ciência de dados (por meio do dono, como as P-DS): "`data_pronto` é a restauração ou o encerramento?". |
| "Exceções segregadas" (catálogo S1) | MTTA e MTTR contam a exceção de registro posterior **à parte** | **Parte sem fonte:** o campo "Exceção de SLA por registro posterior" ainda não existe (WS4; o mesmo da S12, 064 L9). A S1 publica com nota "exceção de registro posterior não identificável até o campo", como a S2 já faz. Entra na Q-099-4. |
| Pendências descontadas (biblioteca) | PROC silencioso sobre pausa; briefing §3.4: Pendente e Aguardando validação pausam | **Sem conflito.** Mas, enquanto a etapa `Pendente` não estiver em produção, **o que a S1 desconta é o mesmo de-para da Q-099-8**: a resposta da Q-099-8 entra como versão de critério com `afeta = ['S1', 'S9']`, não só S9. |
| Média | O PROC chama os indicadores de "Tempo Médio" (MTTA, MTTR) | **Sem mudança.** A regra inviolável proíbe média sem percentis; a S1 já publica P50/P85/P95 com a média ao lado. O UX pode manter os nomes MTTA e MTTR do processo, com os percentis. |

### 3.2 S9 (OP-17): tempo em pendência

| Ponto do plano | O que o PROC diz | Conclusão |
|---|---|---|
| Domínio de motivos (briefing: aguardando fornecedor, solicitante, área vinculada, janela de mudança) | Os mesmos quatro (§2) | **Confirmado.** O domínio do campo "Motivo de pendência" da WS4 tem fonte no processo. |
| De-para "Aguardando Solicitante" → aguardando solicitante | "aguardando informações do solicitante" (4.1.1) | **Confirmado pelo texto.** |
| De-para "Aguardando Suporte Terceiros" → aguardando fornecedor | "Dependência de fornecedor terceiro", sub status "aguardando fornecedor" (4.1.3) | **Confirmado pelo texto.** |
| De-para "Aguardando Equipe Interna" → aguardando área vinculada | O PROC chama de "equipe interna" a equipe **responsável pelo chamado**, e de "área vinculada" a **outra área** | **Muda.** O nome da etapa real, lido com o vocabulário do PROC, pode significar esperar a própria equipe (que no PROC não é pendência: o SLA corre) ou outra equipe da casa (área vinculada, que pausa). Escolher seria inferência: vai ao dono na Q-099-8 revista (§5). |
| "Aguardando janela de mudança" | Sub status do PROC (4.1.3) | Nenhuma etapa real hoje (064, Q27): o motivo aparece com zero até a WS4. Sem pergunta. |
| Aguardando validação | Estado próprio do PROC, não motivo de pendência | **Fora da S9.** A S9 mede o tempo em pendência por motivo; aguardando validação é outro estado (o briefing também separa: "Motivo de pendência" é obrigatório só na entrada em `Pendente`). Se a Q-RO-9 achar uma etapa real "Aguardando Validação", ela não entra na S9. Sem pergunta: é a definição do PROC e do briefing. |
| Cumprimento da previsão de retorno | O PROC pede "prazo esperado de retorno" no acionamento do fornecedor (etapa 11) e "atualização da previsão de normalização" (4.1.3) | **Sem mudança:** a D-14 do 056 já decidiu a S9 sem o cumprimento da previsão; a base só guarda o booleano (migração 0035). A parte sai nula com nota. |

## 4. O que muda nas recomendações de cada pergunta

| Pergunta | Recomendação no plano 099 | Depois do PROC (e das decisões do 056 que o plano não citou) |
|---|---|---|
| **Q-099-4** (parte real e parte sem fonte) | A | **A, com escopo menor.** S9 (previsão) e S11 (conversão em Registro de Problema) já estão decididas pela D-14 e pela D-15 do 056 no sentido da A. Fica para O8, O16, S12 (exceção e recorrentes) e as extensões do O22 e do O26, e entra a **S1** (exceção de registro posterior à parte, §3.1). |
| **Q-099-5a** (alvo da S1) | A (matriz do briefing) | **A, agora com o processo como fonte:** os 10 valores são iguais no PROC. Pede só o "ok" do dono; a divergência com o prazo de cada chamado (Q-RO-11), se houver, volta ao dono. |
| **Q-099-5b** (primeiro atendimento) | A só se o time de ciência de dados confirmar que é o comentário do atendente; senão B | **Muda.** A D-13 do 056 já decidiu: o primeiro comentário como está, com nota. O PROC define "significativo pelo atendente". Nova forma da pergunta e recomendação no §5. |
| **Q-099-6** (O18, vínculo do bug) | A | **Sem mudança.** É BusinessMap; o PROC não trata. |
| **Q-099-7** (O17, causa raiz) | A se a Q-RO-10 achar o campo; senão B | **Muda.** Pelo PROC, o chamado de incidente guarda só a **causa aparente**; a causa raiz é do Registro de Problemas (PROC 30.000.020). A busca da Q-RO-10 pode achar um campo de "causa aparente", e ele **não** é causa raiz. Nova recomendação: (B') publicar o O17 por sistema (real) e deixar a parte "por causa raiz" sem dado real até haver o Registro de Problemas com vínculo ao incidente (a mesma lacuna da D-15); não usar a causa aparente como causa raiz sem decisão do dono. A Q-RO-10 ganha o padrão `%parente%`, só para saber se o campo existe. A opção C (causa raiz do BusinessMap) continua fora: mudaria a fonte do cartão. |
| **Q-099-8** (S9, o que é pendência) | A: as três esperas reais contam, de-para Solicitante, Fornecedor, Área vinculada | **Muda em uma etapa:** Solicitante e Terceiros ficam confirmados pelo texto do PROC; "Aguardando Equipe Interna" depende do uso real da etapa (§3.2). A versão de critério passa a ser `afeta = ['S1', 'S9']`. Nova forma no §5. |
| **Q-099-9** (O24 sem classe de serviço) | A | **Sem mudança.** BusinessMap. |
| **Q-099-10** (O12, data acordada) | A | **Sem mudança.** BusinessMap. |

**Correção ao plano 099 que não depende de pergunta:** a linha OP-20 (S12) diz que os recorrentes não têm fonte; a **D-4** do 056 (2026-10-30 14:44) já definiu "recorrente por categoria, volume alto e repetido na janela de 12 semanas", com o limiar a definir pelo dono na montagem do painel. O PROC é coerente ("identificação de padrões de recorrência" por categoria/sistema, §6). A parte dos recorrentes depende só do limiar da D-4, não de campo novo.

## 5. O que o documento resolve e o que ainda pede decisão do dono

### 5.1 Resolvido pelo documento (sem pergunta nova)

- Os 10 prazos e a matriz Impacto × Urgência (§1): fonte do arquivo versionado de `ref_alvo_prioridade` (lote D3).
- O início do relógio da S1 na abertura do chamado.
- Os quatro motivos de pendência do domínio da WS4.
- Os de-para "Aguardando Solicitante" → aguardando solicitante e "Aguardando Suporte Terceiros" → aguardando fornecedor (pelo texto do PROC; entram como versão de critério quando a Q-099-8 for respondida, porque a pergunta toda é do dono).
- Aguardando validação fora da S9.
- A causa aparente não é causa raiz (O17).
- As metas do PROC iguais às do catálogo (S2, S8, S11, S12).

### 5.2 Ainda pede decisão do dono (com recomendação)

- **Q-099-5a (só confirmação).** Alvos da S1 = a matriz do PROC 30.000.010 v002, igual ao briefing §3.4, num arquivo versionado. **Recomendação: confirmar.** Se a Q-RO-11 mostrar prazo de chamado diferente da matriz, o dono decide qual vale. Reabre se: o PROC for aprovado com prazo diferente (versão nova).
- **Q-099-5b (revista). A D-13 continua ou reabre?** O PROC define primeiro atendimento como "significativo pelo atendente"; a D-13 conta o primeiro comentário como está (inclui automático e talvez o do solicitante). (A) Manter a D-13: a S1 publica o MTTA com `data_primeiro_comentario` e a nota "inclui respostas automáticas; o processo pede o primeiro atendimento significativo do atendente". (B) Reabrir a D-13 e esperar a etapa "Em triagem" da WS4 (saída de Novo) como marco do primeiro atendimento. **Recomendação: A agora**, porque já é decisão do dono e põe a S1 com dado real, com a diferença dita no cartão; **reabre se** o time de ciência de dados mostrar uma coluna que separe comentário de atendente de resposta automática, ou se a etapa "Em triagem" entrar em produção. Pergunta de apoio ao time de ciência de dados (pelo dono, só estrutura): o `data_primeiro_comentario` conta comentário do solicitante e resposta automática?
- **Q-099-11 (nova). Unidade dos prazos de P1 e P2.** O PROC não escreve "úteis" em P1 (15 min e 4 h) e no primeiro atendimento de P2 (30 min), e escreve nos outros sete; a S1 hoje mede tudo em horas úteis (D-3). (A) Cada prazo na unidade escrita no PROC: P1 e o primeiro atendimento de P2 em tempo corrido (regime de plantão, a exceção que o briefing §4.2 já prevê), o resto em tempo útil; o arquivo de alvos guarda a unidade por célula e a biblioteca mede cada prioridade na unidade do seu alvo; entra como versão de critério (T2.6, `afeta = ['S1']`), exceção à D-3. (B) Tudo em horas úteis, como hoje (D-3), com nota no cartão de P1 e P2. **Recomendação: A**, porque compara cada chamado com o prazo na mesma régua do processo; a Q-RO-11 e a reconciliação com `sla_pa_tempo_min` e `sla_r_tempo_min` mostram como a própria ferramenta conta P1 e P2, e o dono confere. Reabre se: a reconciliação mostrar que a ferramenta mede P1 e P2 em tempo útil.
- **Q-099-8 (revista). O que é pendência enquanto `Pendente` não está em produção.** (A) "Aguardando Solicitante" → aguardando solicitante e "Aguardando Suporte Terceiros" → aguardando fornecedor contam como pendência (texto do PROC); "Aguardando Equipe Interna" conta como "aguardando área vinculada" **só se** o dono confirmar que a etapa é usada quando a restauração depende de outra equipe; se for usada para esperar a própria equipe responsável, ela não é pendência (o SLA corre) e fica fora da S9 e do desconto da S1. (B) Esperar a etapa `Pendente` e o campo "Motivo de Pendência" (WS4). **Recomendação: A**, com o dono dizendo em uma linha para que serve "Aguardando Equipe Interna"; o de-para entra como versão de critério com `afeta = ['S1', 'S9']`.
- **Q-099-7 (revista). O17: causa raiz.** (B') O17 por sistema (real) agora; a divisão por causa raiz fica "sem dado real" até o Registro de Problemas de Sistemas com vínculo ao incidente (a mesma lacuna da D-15). (A) Usar o campo que a Q-RO-10 achar, se for de causa raiz (não de causa aparente). (D) Usar a causa aparente como causa, com o nome trocado no cartão: muda a definição da métrica. **Recomendação: B'**, e A só se a Q-RO-10 achar um campo de causa raiz no próprio chamado; D não, porque o PROC define a causa aparente como superficial.

## 6. Efeito nos lotes do plano 099 (§3 do plano)

| Lote | Efeito |
|---|---|
| D3 (carregador de `ref_alvo_prioridade`) | Pode começar depois do "ok" da Q-099-5a; o arquivo traz a unidade por célula se a Q-099-11 for A, e cita o PROC v002. |
| D4 (primeiro atendimento e S1 no mapa real) | Não espera mais a D-13 (decidida); espera a Q-099-5b revista (manter ou reabrir), a Q-099-11 e a conferência de `data_pronto`. O comentário de `normalizador.ts:128` sai do "espera a D-13" no mesmo lote. |
| D5 (S9) | Espera a Q-099-8 revista; a versão de critério afeta S1 e S9. |
| D8 (O17) | Fica para quando houver Registro de Problemas com vínculo, salvo resposta A da Q-099-7 revista. A parte por sistema pode sair antes, pela Q-099-4. |
| D9 (S12) | A parte dos recorrentes depende do limiar da D-4, não de campo; a exceção de registro posterior segue sem fonte (WS4). |
| D0 (WS4, pessoas) | O roteiro da parametrização usa o PROC como fonte dos domínios de "Motivo de pendência" e da matriz; acrescenta a pergunta sobre o uso de "Aguardando Equipe Interna" na migração das etapas antigas. |

## 7. Critério de reversão desta análise

Esta análise deixa de valer, no todo ou em parte, se: (1) o PROC 30.000.010 for aprovado com prazos, estados ou motivos de pendência diferentes da v002; (2) a Q-RO-11 mostrar prazos de chamado diferentes da matriz; (3) o time de ciência de dados mostrar que `data_pronto` é o encerramento ou que `data_primeiro_comentario` já exclui automação e solicitante. Em qualquer um, o arquiteto refaz o §1, o §3 e o §5.
