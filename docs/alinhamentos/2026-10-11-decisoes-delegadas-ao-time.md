# Decisões delegadas ao time (mediação do agile-coach)

Data: 2026-10-11 · Mediação: `agile-coach` · Origem: o usuário delegou ao time as decisões abertas ("pelo que o time achar melhor").

Critérios usados: (1) nenhuma opção pode contrariar as regras invioláveis do `CLAUDE.md` (opção que contraria é descartada e dito no texto); (2) empate real: a opção mais reversível e mais barata; (3) o que depende de dado, credencial ou acesso do usuário não é decidido aqui (seção "Só o usuário pode"). D-1 a D-4 da revisão de segurança já são do usuário e não foram reabertas.

Convenção das posições: "(doc)" = está escrita no documento citado; "(time)" = derivação do time a partir do documento citado, sem posição formal escrita; "—" = a área não tem o que dizer sobre o tema. Nenhuma posição foi inventada além dessas marcas.

Fontes: `S` = `docs/security/revisao-de-seguranca.md` (árvore principal); `INT-BM`/`INT-MB` = `docs/integracao/`; `DM` = `docs/architecture/data-model.md` §12; `K036` = `docs/ux/lacuna-de-valor/`; `CMP` = `2026-10-11-metricas-complementares-pendencias.md`; `REV06` = `docs/ux/metricas-fora-do-nucleo/06-revisao.md`; `SIG` = `2026-10-11-siegard.md` e `docs/analises/siegard-migracao-plano.md`.

## Tabela-resumo

| Nº | Decisão | Escolha | Reversível? |
|---|---|---|---|
| 1 | Retenção e eliminação de dados pessoais (D-5) | Redação nas tabelas append-only (S-32) com prazo parametrizável; padrão provisório 24 meses; logs 30 dias | Sim (parâmetro) |
| 2 | Títulos de cartão na API e no PDF (D-6) | Manter na tela, na API e no PDF; linha no glossário; revisar se o PDF circular fora do DSPD | Sim |
| 3 | Pessoa na coleta do BusinessMap | Lista fechada de campos (`fields=`); só `responsaveis` e `usuario` das transições (já decidido pelo usuário); descartar o resto | Parcial (dado já gravado não se des-expõe) |
| 4 | Pessoa na coleta do Acelerato | Excluir na origem (pergunta salva sem colunas de pessoa); `stg_` também não recebe | Sim |
| 5 | Webhook x polling | Polling diário é a fonte de verdade; webhook desligado até haver hospedagem (S-33) | Sim |
| 6 | Escopo das chaves de coleta | BusinessMap: usuário de serviço leitor, só `apikey`. Metabase: API key em grupo próprio, só a coleção da pergunta salva, sem "Create queries" | Sim |
| 7 | Plano de segurança S-24 a S-30 e risco I-4 | Executar como recomendado; cabeçalhos de segurança no nginx (S-25); aceitar I-4 com revisão | Sim |
| 8 | Gatilho para reverter o plugin Siegard por custo de contexto | Medir antes/depois; reverter para "só o formato" se o custo passar de 20% por pedido | Sim |
| 9 | Regra P1 (arquivado sem desfecho) na migração Siegard | Migrar: já é definitiva desde 10/10; remover `pendente-usuario` | Sim |
| 10 | N-3: webhook x revision | Revision é canônica; webhook só antecipa; tolerância de 120 s | Sim |
| 11 | N-5: origem de SLE, alocação acordada, limites | Arquivo versionado no repositório, preenchido pela governança (WS6) | Sim |
| 12 | N-6: calendário de plantão | Nenhuma classe usa até haver definição | Sim |
| 13 | Ausência do campo de reincidência | Nunca vira "não reincidente" em silêncio: expor cobertura "n de N" | Sim |
| 14 | S8: o que a taxa conta | (b) o próprio chamado reincidente no mês | Sim (critério versionado, T2.6) |
| 15 | O8: referência do "% acima do P85" | P85 das 12 semanas anteriores, mesmo tipo; nulo sem referência publicável | Sim |
| 16 | O16: densidade de bugs | Bugs criados no mês com `origem_bug` ÷ entregas de demanda do mês; nulo < 20 entregas | Sim |
| 17 | E4 (natureza Manter/Evoluir) e S11 (registro de problema, sintoma) sem fonte real | Continuam mockados e rotulados "Dados fictícios"; não inferir a natureza de outro campo | Sim |
| 18 | S9: cumprimento da previsão de retorno | Critério provisório do mock vira o vigente; tende a "insuficiente" | Sim |
| 19 | Mapa "Leia junto" | Mapa final (ver detalhe), lista por métrica | Sim |
| 20 | Correções da revisão de UX (M-2, M-3, M-4, L-1 a L-5) | Adotar; coluna "Dados" do catálogo = "Fictícios" para todos até a coleta real | Sim |
| 21 | Validação do protótipo de complementares (M-5) | Time aceita o roteiro após a correção de B-1; aceite do usuário fica como confirmação posterior | Sim |
| 22 | K-036 D-1: texto das 5 perguntas e escala | As 5 propostas da ideação, escala de 5 pontos | Sim (muda com versão e marca T2.6) |
| 23 | K-036 D-2: quem responde e quem opera | Gestores das áreas atendidas (mais de um por área); coordenação da sustentação opera | Sim |
| 24 | K-036 D-3: base mínima | Anonimato: 5 no consolidado, 3 por área; abaixo de 20 respostas só contagens "k de n", sem percentual | Sim |
| 25 | K-036 D-4: comentário livre | Fora do app; nunca importado | Sim |
| 26 | K-036 D-5: meta de taxa de resposta | Acompanhar, sem meta | Sim |
| 27 | K-036 D-6: meta de satisfação | Sem meta | Sim |
| 28 | K-036 D-7: bloco "O que mudou" | Sim; texto curto da coordenação, enviado junto com a carga | Sim |
| 29 | K-036 D-8: lugar | Painel Sustentação, ao lado de S1/S2 | Sim |
| 30 | K-036 D-9: por área ou só consolidado | Primeiro ciclo só consolidado; por área a partir do 2º ciclo, com a base mínima | Sim |
| 31 | K-036 D-10: quem carrega o resultado | Script/automação externa (T4.3) pela coordenação; sem rota de upload na API | Sim |

Total: 31 decisões. Nenhuma é irreversível; a única parcial é a 3 (dado de pessoa já gravado).

## Detalhe

### 1. Retenção e eliminação de dados pessoais (D-5, M-5, S-32)
- **Pergunta:** por quanto tempo guardar nomes em tabelas append-only e como atender eliminação sem violar "nunca sobrescrever histórico"?
- **Opções (S §5):** (a) prazo + procedimento de redação; (b) pseudonimizar na entrada; (c) guardar indefinidamente.
- **Produto/UX:** manter o histórico de fluxo intacto; nenhuma tela usa nomes (doc: S §6, "LGPD no desenho"). (b) já foi recusada pelo usuário em 10/10 (L-1).
- **Arquitetura/segurança:** (a) cumpre a LGPD sem perder fluxo; (c) "não recomendado: sem base" (doc: S M-5). Redação executada pelo `dspd_migrador` em transação que desliga o gatilho só da tabela alvo, sem apagar a linha nem mexer em datas (doc: S M-5).
- **Engenharia:** a biblioteca de cálculo não usa nomes, então redigir não muda métrica (doc: S M-5). Esforço M.
- **QA:** teste no Postgres de que o cálculo não muda e o gatilho volta (doc: S, tabela S-32).
- **Decisão:** (b) descartada pelo usuário; (c) descartada por falta de base. Vale (a). Prazo: parâmetro `RETENCAO_PESSOA_MESES`, padrão provisório 24 meses desde a última atividade do registro, mais redação a pedido do titular ou no desligamento. Logs com IP: 30 dias. Os números são provisórios do time; o DPO confirma (lista "só o usuário pode").
- **Por quê:** única opção que satisfaz LGPD e a regra de histórico ao mesmo tempo; o prazo como parâmetro evita travar o código à espera do DPO (D-5 é pré-requisito da primeira carga real, S §1).
- **Reverter:** mudar o parâmetro; a redação já feita não volta (por desenho), então a primeira execução exige confirmação do usuário.

### 2. Títulos de cartão na API e no PDF (D-6, L-2)
- **Pergunta:** os títulos (texto livre) saem na API e no PDF?
- **Opções (S §5):** (a) manter; (b) manter na tela, omitir no PDF; (c) só `cardId`.
- **Produto/UX:** o título é necessário para agir sobre o item envelhecido (doc: S §5 D-6).
- **Arquitetura/segurança:** risco é nome em título circulando no PDF fora do sistema (doc: S I-3). (b) só se o PDF circular fora do DSPD (doc: S).
- **Engenharia:** (a) não exige código novo; só glossário. **QA:** —.
- **Decisão:** (a), com uma linha no glossário "títulos não citam pessoas".
- **Por quê:** mais barata e reversível; o PDF hoje é exportação do usuário para uso do DSPD (pedido 008), sem evidência de circulação externa.
- **Reverter:** gatilho: o PDF passar a circular fora do DSPD. Então (b): omitir o título no PDF (mudança local no gerador).

### 3. Pessoa na coleta do BusinessMap
- **Pergunta:** quais dados de pessoa o coletor traz?
- **Opções (INT-BM §7.9, §3):** não coletar (padrão proposto no roteiro) ou coletar o que o modelo 4.5 prevê.
- **Produto/UX:** nenhuma visão individual; o dado não vira tela.
- **Arquitetura/segurança:** minimização com `fields=` em lista fechada (doc: INT-BM §3); `user_id` das revisões é pessoa (doc: INT-BM). GRANT por coluna impede a API de ler (doc: S §6).
- **Engenharia:** a coleta segue o usuário em 10/10 §8: nomes também nas tabelas analíticas (`responsaveis`, `usuario`).
- **QA:** teste de contrato que falha com campo fora da lista (padrão em INT-MB §10).
- **Decisão:** vale a decisão do usuário (nomes no analítico, só `responsaveis` e `usuario`). Fora da lista e descartados: `reporter`, `co_owner_ids`, `watcher_ids`, `logged_times` (horas apontadas como esforço é métrica proibida), `last_comment`, `comment_count`.
- **Por quê:** respeita a decisão já tomada e minimiza o resto; o roteiro "padrão: não coletar" é anterior à decisão de 10/10.
- **Reverter:** acrescentar campo à lista é barato; o que já foi gravado só sai pela redação (decisão 1).

### 4. Pessoa na coleta do Acelerato
- **Pergunta:** solicitante, agente e e-mail entram no staging?
- **Opções (INT-MB §4):** excluir na origem; aceitar no staging; sandboxing/impersonation (Pro/Enterprise).
- **Arquitetura/segurança:** "nem chegar ao staging" (recomendação, doc: INT-MB §4); L-3 já decidido "não" (doc: 10/10 §11).
- **Engenharia:** pergunta salva com lista explícita de colunas, schema zod `strict` rejeita coluna extra (doc: INT-MB §4). **QA:** teste de contrato (doc: INT-MB §10). **Produto/UX:** filtro por agente fora da sustentação já decidido.
- **Decisão:** excluir na origem (pergunta SQL salva sem `SELECT *`, incluindo `justificativa_ajuste`); `stg_chamado` não recebe pessoa.
- **Por quê:** funciona em qualquer edição do Metabase, custo zero, coerente com L-3.
- **Reverter:** adicionar a coluna à pergunta e à lista; depende do dono do Metabase.

### 5. Webhook x polling
- **Pergunta:** ligar o webhook do BusinessMap?
- **Opções (INT-BM §4.8; S M-2/D-2):** só polling; webhook com túnel; webhook após hospedagem.
- **Produto/UX:** coleta diária decidida pelo usuário (H3) e custo zero (10/10 §8).
- **Arquitetura/segurança:** webhook exigiria expor a API inteira (doc: S M-2); polling é a fonte de verdade, webhook só acelerador reconciliado (doc: INT-BM §4.8). I-6 (cabeçalho do segredo) segue por confirmar.
- **Engenharia/QA:** o código do webhook existe e está correto (doc: S §6); fica sem segredo configurado, rota inativa.
- **Decisão:** polling como fonte de verdade; `WEBHOOK_BM_SEGREDO` vazio até haver hospedagem (S-33).
- **Por quê:** nenhuma exposição, nenhum custo; coerente com D-2 já decidida pelo usuário.
- **Reverter:** quando houver hospedagem, S-33 (proxy só para `/webhooks/businessmap`, TLS).

### 6. Escopo das chaves de coleta
- **Pergunta:** que poder tem cada chave?
- **Opções:** BM: só `apikey` x OAuth; leitor x conta do usuário. Metabase: opção A (coleção view-only) x B (Pro/Enterprise).
- **Arquitetura/segurança:** BM só `apikey`, sem OAuth; usuário de serviço leitor, pois a chave herda as permissões (doc: INT-BM §1). Metabase: API key em grupo próprio, "Create queries = No", opção A funciona em qualquer edição (doc: INT-MB §1-2).
- **Engenharia:** carga por `card/{id}/query/json` (não o endpoint de 2.000 linhas) (doc: INT-MB §3). **QA:** testar que não há coluna de pessoa e que a contagem não é 2000 (doc: INT-MB §8).
- **Decisão:** adotar o desenho acima. Criar usuário, grupo, chave e informar IDs é do usuário.
- **Por quê:** menor privilégio, sem custo, vale em qualquer edição.
- **Reverter:** trocar de opção A para B se a edição do Metabase permitir; mudança de configuração.

### 7. Plano de segurança S-24 a S-30 e risco I-4
- **Pergunta:** executar o plano? Aceitar as 3 vulnerabilidades de dev (I-4)? Onde ficam os cabeçalhos (nginx ou helmet)?
- **Arquitetura/segurança:** executar; concordo com o descarte de I-4, com revisão quando o `@lhci/cli` atualizar (doc: S I-4). A ADR 0015 dispensa o helmet por causa do nginx, mas o nginx não os definia (doc: S B-1).
- **Engenharia:** S-24 (loopback) vem antes de qualquer carga real; S-25 a S-30 em paralelo (doc: S §4). **QA:** E2E dos cabeçalhos (S-25).
- **Decisão:** executar; cabeçalhos no nginx (S-25), ADR 0015 corrigida na frase do helmet; I-4 aceito em `auditConfig.ignoreGhsas`. S-31 segue D-3/D-4 do usuário.
- **Por quê:** esforço P cada; sem custo.
- **Reverter:** cada cartão é independente; I-4 sai da lista quando o pacote atualizar.

### 8. Gatilho para reverter o plugin Siegard
- **Pergunta:** quando desistir do plugin por custo de contexto?
- **Opções:** manter sem critério; medir e reverter para "só o formato" (decisão 5(b) do Siegard).
- **Arquitetura:** salvaguarda já registrada: medir antes e depois do `siegard.json` (doc: SIG, achado de custo; ~2 mil tokens por sessão e subagente).
- **Engenharia/QA:** —. **Produto/UX:** —.
- **Decisão:** medir os tokens por pedido antes e depois; se o aumento passar de 20% por pedido, voltar à opção (b). O limite é do time, ajustável.
- **Por quê:** sem número a salvaguarda nunca dispara; 20% é o ponto em que o custo supera o ganho de rastreabilidade (julgamento do time).
- **Reverter:** mudar o limite no registro; reverter o plugin é apagar o `siegard.json`.

### 9. Regra P1 (arquivado sem desfecho) na migração Siegard
- **Pergunta:** migrar P1 ou esperar o usuário?
- **Opções (SIG §5.9):** (a) não migrar até responder; (b) migrar com decisão provisória.
- **Decisão do usuário já existente:** em 10/10 §1 as decisões P1 e P2 da fase A passaram a definitivas (doc: `2026-10-09-decisoes-review-fase-a.md`).
- **Decisão:** P1 não está mais pendente: arquivado sem entrega e sem `motivo_descarte` não conta como aberto, permanece na base e é contado à parte ("arquivado sem desfecho"). Migrar a regra e retirar `pendente-usuario` das 8 células.
- **Por quê:** (b) contrariaria "dúvida não se resolve por inferência", mas aqui não há dúvida: o usuário confirmou.
- **Reverter:** reabrir a regra no nó e na matriz.

### 10 a 12. Perguntas de modelagem N-3, N-5, N-6 (DM §12)
- **N-3 (instante que vale):** recomendação do arquiteto: revision canônica, webhook só antecipa, 120 s (doc: DM §12). Combina com a decisão 5. **Decisão:** adotada.
- **N-5 (origem de SLE, alocação acordada, limites de frentes, fichas):** arquivo versionado no repositório, preenchido pela governança (WS6), contra campos no BusinessMap (doc: DM §12). **Decisão:** arquivo versionado. Por quê: WS6 é feita por pessoas, não pelo time, e o arquivo é auditável e barato; os valores são do usuário.
- **N-6 (classes com calendário de plantão):** recomendação "nenhuma até definição" (doc: DM §12). **Decisão:** nenhuma. Por quê: escolher classe seria regra de negócio por inferência.
- **Reverter (os três):** alterar a configuração/ADR; N-5 e N-6 aceitam acréscimo sem retrabalho.

### 13. Ausência do campo de reincidência
- **Pergunta:** como tratar chamado sem o campo preenchido?
- **Opções (INT-MB §6):** contar como "não reincidente"; expor cobertura.
- **Arquitetura/QA:** o briefing diz que o campo é pouco preenchido; tratar ausente como "não" subestima (doc: INT-MB). Recomendado expor "n de N".
- **Decisão:** nunca converter ausência em "não reincidente" em silêncio; S8 e S12 mostram a cobertura "n de N".
- **Por quê:** evita número enganoso; coerente com o tratamento de nulo em SLA.
- **Reverter:** retirar o texto de cobertura; o cálculo não muda.

### 14. S8: o que a taxa de reabertura conta
- **Pergunta:** a taxa conta (a) os incidentes originais apontados como ticket anterior ou (b) o próprio chamado reincidente no mês?
- **Produto/UX:** a decisão do usuário diz que reabertura = campo "reincidente" preenchido com o ticket anterior, e S12 já conta o chamado reincidente (doc: `2026-10-11-decisoes-complementares.md`).
- **Arquitetura:** (a) exige contar originais distintos que podem estar em outro mês e deduplicar; (b) usa só o chamado do mês (time, derivado de CMP).
- **Engenharia/QA:** (b) cabe numa consulta por mês e dá a mesma base que S12 (time).
- **Decisão:** (b): numerador = chamados do mês com "reincidente" preenchido; denominador = incidentes do mês; cobertura "n de N" (decisão 13); sem meta de 100%.
- **Por quê:** consistente com S12, mais simples; (a) mede "quantos originais voltaram" e ficaria em mês diferente do evento.
- **Reverter:** parâmetro versionado em `criterios` (T2.6); a mudança é marcada com data nos gráficos.

### 15. O8: referência do "% acima do P85"
- **Opções (CMP):** P85 da janela anterior x P85 da janela corrente x valor fixo.
- **Decisão:** a hipótese do mock vira regra: P85 das 12 semanas imediatamente anteriores, mesmo tipo; sem referência publicável (< 20 itens) o campo vem nulo.
- **Por quê:** referência da própria janela esconderia piora (item contra si mesmo); respeita 12 semanas e mínimo 20. O8 sempre ao lado de O3/O4 e nunca média isolada (doc: REV06, anti-meta).
- **Reverter:** parâmetro em `criterios`.

### 16. O16: densidade de bugs
- **Decisão:** manter o que o mock assumiu: bugs criados no mês com `origem_bug` preenchido ÷ entregas de demanda do mês (sem defeito em produção); nulo abaixo de 20 entregas; bug aberto = criado e ainda não entregue nem arquivado no instante. Sem alvo, lista por id de card, nunca por pessoa (doc: REV06).
- **Por quê:** não há alternativa mais barata nem proibida pelas regras; lê-se com a taxa de escape (O15).
- **Reverter:** parâmetro em `criterios` (T2.6).

### 17. E4 e S11 sem fonte real
- **Opções (CMP, "campos-sem-fonte-real"):** manter mock rotulado; inferir a natureza de outro campo (ex.: tipo).
- **Decisão:** manter mockado e rotulado "Dados fictícios" (decisão do usuário já aceita o rótulo). Não inferir Manter/Evoluir do tipo do card.
- **Por quê:** inferir seria decisão de regra de negócio por inferência (vedado).
- **Reverter:** quando o usuário apontar o campo real, troca `status: 'mock'` por real.

### 18. S9: cumprimento da previsão de retorno
- **Decisão:** vale o critério do mock: pendência encerrada com retorno até `previsao_retorno` ÷ pendências encerradas de chamados com previsão. Esperado "insuficiente" enquanto poucos chamados tiverem previsão; mostrar a base.
- **Por quê:** não há alternativa na documentação; falhar visivelmente (insuficiente) é melhor que número ralo.
- **Reverter:** parâmetro em `criterios`.

### 19. Mapa "Leia junto"
- **Pergunta (REV06 B-1):** quais links ligam o núcleo às complementares?
- **Produto/UX:** critério de sucesso: achar O5 a partir de O3 em 2 cliques e 15 s (doc: REV06, `03-ideacao.md`).
- **Engenharia:** `Def` passa de um par para lista.
- **Decisão (mapa final):** O3 → O5, O6, O8; O4 → O8; O10 → O11; O15 → O13, O16, O17; T1 → T6; T4 → T8; T5 → O14; T9 → T6, E5; E1 → E4, E5; S1 → S9, S10; S2 e S3 → S8, S12; S5 e S7 → S11. As mapeadas a partir de REV06 estão fixas; O11, O14, T8, E4 foram ligadas pelo time por afinidade de tema (O10 backlog, T5 origem, T4 chegada, E1 projetos) e cobrem as que ficavam sem entrada.
- **Reverter:** é uma tabela em `cartoes.ts`; ajuste sem custo.

### 20. Correções da revisão de UX (M-1 a M-4, L-1 a L-7)
- **Decisão:** adotar todas as correções propostas. Para M-2: a coluna do catálogo passa a "Dados" com "Fictícios" para todos até a coleta real (e "Real" quando houver). M-3: "Métricas: 9 de 9 e 8 complementares". M-4: link com código e nome. L-2: mantém o texto do design system. L-1, L-3, L-4: aplicar. L-5, L-6: não mudar (opcionais; observar no teste visual). L-7: garantir no teste que O6 não exibe "Fora da meta".
- **Por quê:** o design system 2.11 diz que nenhum número do app representa a operação real; correções baratas de texto e de rótulo.
- **Reverter:** cada texto é isolado.

### 21. Validação do protótipo de complementares (M-5)
- **Pergunta:** o usuário está ausente; a validação pode ser do time?
- **Posição:** o regimento exige a validação antes de "Pronto para fazer" (doc: REV06 M-5). O usuário delegou o desempate e as decisões de 11/10 cobrem D-1 a D-6.
- **Decisão:** o time aceita o roteiro depois de corrigir B-1 e registra isso em `05-validacao.md` como retorno parcial; gera `especificacao.md` a partir de 02, 03 e das decisões. O PR continua sendo validado e mesclado pelo usuário (única aprovação que o time não substitui).
- **Reverter:** o usuário pode pedir ajuste no PR.

### 22 a 31. K-036: lacuna de valor na sustentação (D-1 a D-10)
Contexto e posições (doc: `K036/02-definicao.md`, `03-ideacao.md`): coleta C2 (formulário externo + importação do agregado) e exibição D1 (seção no painel Sustentação) escolhidas; C1 como evolução. Sem nota única, sem ranking, sem meta. Produto/UX: anonimato por desenho e retorno aos respondentes. Arquitetura/segurança: tabela agregada trimestre x área x pergunta x faixa, validação sem coluna de pessoa, base mínima aplicada no back-end (perguntas do arquiteto, doc: 03-ideacao). QA: estados de importação, erro de arquivo com coluna/linha, reenvio com confirmação que guarda a versão anterior (doc: 03-ideacao). Engenharia: a distribuição por faixa é cálculo simples (pergunta 5 do arquiteto; decidir se passa pela biblioteca: sim, pela regra "todo cálculo passa pela biblioteca compartilhada").

| Nº | D | Opções | Decisão e porquê | Reverter |
|---|---|---|---|---|
| 22 | D-1 texto e escala | 5 propostas e escala de 5 pontos; texto próprio do usuário | As 5 propostas da ideação (resolve a necessidade; prazo atende à criticidade; informado do andamento; o problema não volta; confio no que é crítico), 5 pontos. Pergunta fechada, até 2 min (critério de sucesso) | Trocar texto = nova versão e marca T2.6 (quebra de série) |
| 23 | D-2 respondente e operação | só um gestor por área; mais de um | Gestores das áreas atendidas, mais de um por área (necessário para a base mínima por área); a coordenação da sustentação opera a pesquisa e a carga | Mudar a lista de respondentes é processo externo |
| 24 | D-3 base mínima | 5/3 da hipótese; aplicar a regra de 20 | Anonimato: 5 respostas no consolidado e 3 por área. Como a regra inviolável proíbe estatística abaixo de 20, abaixo de 20 respostas publica só contagens "k de n" por faixa, sem percentual, média ou percentil (mesmo tratamento de censo do T9); com 20 ou mais, percentual. Abaixo do mínimo: "Base insuficiente", sem número | Subir ou baixar os limites é parâmetro; a regra do 20 não se afrouxa |
| 25 | D-4 comentário livre | fora do app; importado moderado; motivo fechado | Fora do app, nunca importado (nomes de pessoas; recomendado em 03) | Motivo fechado de insatisfação pode entrar depois como domínio fechado |
| 26 | D-5 meta de resposta | com meta; só acompanhar | Acompanhar e exibir a taxa, sem meta (meta induz pressão sobre respondentes; recomendado em 03) | Definir alvo depois |
| 27 | D-6 meta de satisfação | com meta; sem | Sem meta (nota única vira meta, descartada em D3; regra 7.1) | Idem |
| 28 | D-7 "O que mudou" | sem bloco; com bloco | Com bloco: texto curto da coordenação por ciclo, enviado junto da carga, validado sem nomes de pessoas | Remover o bloco |
| 29 | D-8 lugar | Sustentação; Estratégico | Sustentação, no fim do painel, ao lado de S1/S2, fonte "Pesquisa de percepção" (não mistura com Acelerato) | Mover é mudança de rota |
| 30 | D-9 por área | por área já no 1º ciclo; só consolidado | 1º ciclo só consolidado (risco de identificação com poucas áreas); por área a partir do 2º ciclo, onde houver a base mínima, ordem alfabética, "Outras áreas" abaixo dela | Liberar por área antes, se a base permitir |
| 31 | D-10 quem carrega | upload no app com perfil; script/automação externa | Script/automação externa (T4.3), operada pela coordenação; sem rota de escrita na API. A API não tem autenticação (S M-1) e não pode ganhar rota de escrita sem ela; o script valida colunas, soma por pergunta e recusa arquivo com pessoa | Upload no app quando houver o SSO (ADR 0009) |

Validação do protótipo do K-036 (`05-validacao.md`): o time aceita com estas decisões; o usuário confirma na entrega.

### Adendo 2026-10-12 (I-2 do code review do K-036): reenvio e data de referência
Contexto: a rota aceita `dataReferencia`. Com a regra "vale a carga recebida até a data", comparar o painel antes e depois de um reenvio revela, por subtração, as respostas de 1 ou 2 pessoas (a mesma fuga que a supressão complementar A10 fecha dentro de um ciclo). Opções levadas ao usuário no review: (a) vigente = sempre a mais recente; (b) publicar a substituída só se a diferença por grupo for 0 ou 3 ou mais; (c) aceitar o risco.

Decisão do time (padrão restritivo e reversível, até o usuário decidir): **(a)**. A PV1 publica SEMPRE só a última carga vigente de cada trimestre (maior `cargaId`). A `dataReferencia` só decide se o trimestre já existia (alguma carga recebida até a data); nenhuma data devolve a carga substituída. A substituída continua guardada na base (nunca se sobrescreve histórico), mas não é publicada. Prova: teste de propriedade com até 2 reenvios (`regras.property.test.ts`, P7b) e teste sobre o mock (`pesquisa.test.ts`). Reverter: trocar `vigentes()` em `packages/metricas/src/pesquisa/pv1.ts` para (b) exige a regra de diferença por grupo e o aval do usuário. Registro de segurança: `docs/security/pesquisa-de-percepcao.md`.

## Consequências para o código

| Decisão | O que exige | Agente |
|---|---|---|
| 1 | Cartão S-32: ADR de retenção, procedimento de redação sob `dspd_migrador`, parâmetro `RETENCAO_PESSOA_MESES` (padrão 24), registro da eliminação sem o nome, teste de cálculo inalterado e gatilho restaurado; rotação de logs em 30 dias | `software-architect`, `node-backend` |
| 2 | Linha no glossário; nenhuma mudança de código | `ux-designer` |
| 3 | Coletor BM com `fields=` em lista fechada; teste de contrato que rejeita campo fora dela; sem `logged_times` | `node-backend`, `qa-engineer` |
| 4 | Schema zod `strict` da tabela Acelerato; teste de contrato que falha com coluna cujo segmento case `SEGMENTO_PESSOA` | `node-backend`, `qa-engineer` |
| 5 | Webhook inativo sem segredo; S-33 só com hospedagem; confirmar I-6 antes | `node-backend`, `software-architect` |
| 6 | Variáveis no `.env.example` (nomes, sem valores); coleta de Metabase só por `.../query/json`; teste de completude (contagem diferente de 2000) | `node-backend` |
| 7 | S-24 a S-30 como estão; corrigir a frase do helmet na ADR 0015; `auditConfig.ignoreGhsas` | `node-backend`, `react-frontend`, `tech-lead`, `qa-engineer` |
| 8 | Medição de tokens antes e depois do `siegard.json`; registrar o limite de 20% | `jarvis`, `agile-coach` |
| 9 | Migrar a regra P1; retirar `pendente-usuario` das 8 células em `REGRAS_METRICA` e em `regras-metricas.md`; teste de paridade | `software-architect`, `node-backend` |
| 10 a 12 | N-3: tolerância de 120 s na reconciliação; N-5: arquivo versionado de configuração (valores do usuário); N-6: nenhum calendário de plantão no código | `node-backend` |
| 13, 14 | S8 e S12 com cobertura "n de N"; S8 (b) com critério versionado em `criterios` e marca de mudança (T2.6); atualizar nota metodológica | `node-backend`, `react-frontend` |
| 15 a 18 | `REGRAS_METRICA` e notas: O8, O16, S9 viram vigentes; E4 e S11 seguem `status: 'mock'` com rótulo | `node-backend`, `react-frontend` |
| 19, 20 | Cartão de correção da revisão de UX: `Def.pares` como lista, mapa final, `LeiaJunto` com nome, coluna "Dados" do catálogo, contador com unidade, links de O15, notas M-1 (O5 e O11 regra vigente; O17 só "origem pendente") | `react-frontend`, `ux-designer`, `qa-engineer` |
| 21 | `05-validacao.md` com retorno parcial; `especificacao.md` do upstream | `ux-designer` |
| 22 a 31 | Novo cartão de implementação do K-036 (move a "Pronto para fazer"): tabela agregada de pesquisa (trimestre x área x pergunta x faixa), carga por script validando colunas e somas, back-end aplicando base mínima, contagens "k de n" abaixo de 20, cálculo pela biblioteca, versão guardada no reenvio, seção no painel Sustentação, bloco "O que mudou", sem rota de upload, sem texto livre | `software-architect`, `node-backend`, `react-frontend`, `qa-engineer` |

Mudança nas instruções de qualquer agente ou no `CLAUDE.md` decorrente destas decisões (por exemplo, citar o limite do plugin) precisa de aprovação do usuário.

## Só o usuário pode (não decidido aqui)
1. Credenciais, URLs, IDs e acessos: apikey do BusinessMap e usuário de serviço leitor; usuário, grupo e API key do Metabase; host da conta; IDs dos quadros e dos cards/perguntas do Metabase; campos customizados (`field_id`); tipo de vínculo pai/filho; colunas fila, execução, compromisso e entrega; nomes e existência das colunas do Acelerato (coluna "reincidente", P5, P6, P7); edição e SSO do Metabase (I-3).
2. Valores de negócio: SLE, alocação acordada, limites de frentes (N-5); quais classes usam plantão (N-6); fonte do campo Manter/Evoluir (E4) e de registro de problema e sintoma (S11); origem da O17 (BusinessMap ou Sustentação).
3. Confirmação do prazo de retenção (24 meses provisório) e dos 30 dias de logs com o DPO.
4. Licença do Siegard (pedir ao autor) e a decisão do usuário sobre D-1 a D-4 da revisão de segurança, já tomadas.
5. Visibilidade público/privado do repositório e transferência para organização: alterar a visibilidade pode desligar a proteção da `main` em plano gratuito.
6. Aprovações de merge na `main` e de mudanças em `.claude/agents/` e `CLAUDE.md`.
