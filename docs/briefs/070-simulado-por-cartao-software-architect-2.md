Agente destino: forge:software-architect
Pedido: 070-simulado-por-cartao
Tipo: codigo
Branch: docs/070-adr-0028-vigente   Base: develop   Base-sha: b8b2a22b77f80d9445a4af7aca7456ed6f7f731a
Etapa: codigo   Cobre: E1.12

## Objetivo
Levar a ADR 0028 e o desenho do 070 a vigente, com as suposições S1 a S3 confirmadas pelo dono, e registrar o aumento do F6 (pedido 070, E1.12, K-221). Worktree `/home/rodrigoisensee/MetricasDSPD-052d` (na branch `docs/070-adr-0028-vigente`, já criada pelo tech-lead).

## Entregar
- "E1.12 (software-architect): ADR 0028 e desenho do 070 para vigente com as suposições S1 a S3 confirmadas pelo dono e a nota do F6 (+2,33 KB, A2 do review 070-v4), na branch docs/070-adr-0028-vigente." (E1.12)
- (E1) (E1.12) com a ferramenta Edit, em `/home/rodrigoisensee/MetricasDSPD-052d/docs/architecture/adr/0028-simulado-por-cartao.md`: Estado de proposta para vigente com a data 2026-11-05; a condição para passar a vigente marcada como cumprida (selo validado pelo dono em 2026-11-04 e S1 a S3 confirmadas em 2026-11-05, decisão "A" do dono); as propostas Q-070-1 a Q-070-6 citadas como decididas, sem mudar o que decidem; uma nota de que o F6 subiu 2,33 KB (197,04 KB, com folga de cerca de 3 KB até 200 KB; A2 do review 070-v4), ao contrário do "F6 não muda" do desenho.
- (E1) (E1.12) em `/home/rodrigoisensee/MetricasDSPD-052d/docs/analises/070-desenho.md`: Estado de proposta para vigente, as perguntas Q-070-1 a Q-070-6 marcadas como respondidas (com a fonte: decisões do dono de 2026-11-04 e 2026-11-05) e a mesma nota do F6 onde o desenho diz que o F6 não muda.
- (E2, E3) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Ler
- docs/pedidos/070-simulado-por-cartao.md: só `## Escopo`, `## Etapas` e `## Decisões` e, do `## Histórico`, só as linhas que este brief cita; nunca o pedido inteiro (docs/economia-de-tokens.md, regra 4)

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "Não consigo deixar os dados reais nas que já são possíveis fazer e nas que não deixar mocado?" e, ao recibo ("vou fazer: painel com dado real só com o real; sem dado real, o simulado com o selo Simulado visível; ADR nova revendo a 0026; não vou fazer: misturar real e simulado no mesmo gráfico, misturar BusinessMap e Acelerato, simulado em métrica individual; a troca é por cartão"), respondeu "Sim": dado simulado por cartão onde ainda não há dado real, com selo visível.
- DECISÃO DO DONO (2026-11-04): "A" (validação do protótipo docs/ux/070-selo-simulado/prototipo.html): protótipo aprovado como está (selo no cabeçalho, faixa com "O que é simulado?", borda tracejada, marca d'água, prefixo "Exemplo:"); ponto de compromisso do 070.
- DECISÃO DO DONO (2026-11-04): "A" (cartão simulado no resumo): o cartão com dado simulado fica fora de "O que pede atenção agora" e da Visão geral; só aparece na própria aba, com o selo; o resumo mostra só dado real.
- DECISÃO DO DONO (2026-11-05): "A" (suposições S1 a S3 do 070, pergunta das 12:28): confirmadas as três: S1 os filtros de equipe, sistema e prioridade não se aplicam ao cartão simulado; S2 a exportação leva só o dado real; S3 as duas tendências do Resumo e o EI_SUST ficam sem simulado; com isso a ADR 0028 pode passar a vigente.
- ADR 0026 (citada no pedido): revista pela 0028; não muda
- ADR 0028 (citada no pedido): é o arquivo que esta etapa leva a vigente, só no estado e nas notas; as decisões D1 a D6 não mudam
- ADR 0021 (citada no pedido): não muda
### Do Histórico deste pedido, docs/pedidos/070-simulado-por-cartao.md (DECISÃO TÉCNICA do Jarvis; contexto)
- 2026-11-05 13:01: Review 070-v4 aprovado: parecer do tech-lead (c5ce5b8a, commit: 3c552b0): E2E conforme a seção 7 do desenho e a decisão A do resumo, fixture só no E2E, color-contrast ativa; teto 190 linhas, 89% teste, exceção aceita com a linha no corpo do PR; A1: a checagem de 320 px em simulado-070-l3.spec.ts:97 passa sem medir se a marca não existir; A2: F6 em 197,04 KB (+2,33 KB vindos do L2), registrar no desenho ou na ADR 0028. DECISÃO TÉCNICA (Jarvis): o PR do L3 (E1.8) sai depois do QA v4 com a linha teto: excedido, 190 linhas, E2E e medição C6 do simulado por cartão (T-E1 a T-E3, T-E5, T-E6) com a correção 070-001 que o T-E6 exige, 89% teste; A1 e A2 viram cartão de melhoria técnica; o A2 entra no PR de documentação da ADR 0028.
- 2026-11-05 13:06: Dono confirmou S1 a S3 com "A" (DECISÃO DO DONO acima). DECISÃO TÉCNICA (Jarvis): ADR 0028 a vigente em três etapas: E1.11 tech-lead cria docs/070-adr-0028-vigente da develop na worktree 052d (a limpeza da branch do L7-b fica no 069); E1.12 software-architect edita a ADR e o desenho na worktree; E1.13 tech-lead revisa, commita, abre o PR só de documentação e mescla (QA dispensado por ser só .md fora do controle).
### Restrições
- O agente não abre, lê nem edita arquivos `.env*`.
- Só as ferramentas Read, Edit e Write nos dois arquivos acima; sem commit (o tech-lead commita na E1.13); o pre-push e o forge-check docs barram frase de regra copiada (cite só o ID).
- NÃO tocar: código, testes, outras ADRs, a especificação e o protótipo do UX, os pareceres, outras worktrees, o `CLAUDE.md`, os arquivos `.env*` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho de como o cartão escolhe real ou simulado (quais métricas estão sem dado real hoje, de onde vem o simulado, contrato da API) e a ADR nova que revê a 0026." · etapa de outra delegação; continua no pedido
- "E1.2 (ux-designer): especificação do selo "Simulado" e do texto de explicação, com protótipo para o dono validar." · etapa de outra delegação; continua no pedido
- "E1.3 (node-backend): implementação na API." · etapa de outra delegação; continua no pedido
- "E1.4 (react-frontend): implementação nos cartões." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): code review." · etapa de outra delegação; continua no pedido
- "E1.6 (qa-engineer): QA." · etapa de outra delegação; continua no pedido
- "E1.7 (ux-designer): revisão de interface." · etapa de outra delegação; continua no pedido
- "E1.8 (tech-lead): PR para a develop e merge." · etapa de outra delegação; continua no pedido
- "E1.9 (tech-lead): trazer a develop para a branch do 070 e resolver o conflito, sem PR, antes do review, do QA e da revisão de interface da volta 1." · etapa de outra delegação; continua no pedido
- "E1.10 (tech-lead): branch nova a partir da develop com a correção da volta 3 aplicada por cherry-pick, depois do merge do PR 230 sem ela." · etapa de outra delegação; continua no pedido
- "E1.11 (tech-lead): branch docs/070-adr-0028-vigente a partir da develop, na worktree 052d (livre depois do merge do PR 232), enviada ao remoto sem commit novo." · etapa de outra delegação; continua no pedido
- "E1.13 (tech-lead): review, commit e PR só de documentação da ADR 0028 vigente para a develop, merge por squash com a CI verde." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `grep '^Estado: vigente' /home/rodrigoisensee/MetricasDSPD-052d/docs/architecture/adr/0028-simulado-por-cartao.md` · espera: linhas=1
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052d diff --name-only` · espera: linhas=2

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
