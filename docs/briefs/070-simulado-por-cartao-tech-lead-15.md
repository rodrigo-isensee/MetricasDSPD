Agente destino: forge:tech-lead
Pedido: 070-simulado-por-cartao
Tipo: codigo
Branch: docs/070-adr-0028-vigente   Base: develop   Base-sha: b8b2a22b77f80d9445a4af7aca7456ed6f7f731a
Etapa: codigo   Cobre: E1.11

## Objetivo
Preparar a branch onde a ADR 0028 passa a vigente, depois que o dono confirmou as suposições S1 a S3 (pedido 070, E1.11, K-221). Worktree `/home/rodrigoisensee/MetricasDSPD-052d`, branch `docs/070-adr-0028-vigente`.

## Entregar
- "E1.11 (tech-lead): branch docs/070-adr-0028-vigente a partir da develop, na worktree 052d (livre depois do merge do PR 232), enviada ao remoto sem commit novo." (E1.11)
- (E1) (E1.11) conferir que `git -C /home/rodrigoisensee/MetricasDSPD-052d status --porcelain` está vazio e que a branch atual da worktree (feature/069-l7b-leitura) já está mesclada (PR 232, head dc5e3f3); `git -C /home/rodrigoisensee/MetricasDSPD-052d fetch origin`; `git -C /home/rodrigoisensee/MetricasDSPD-052d switch -c docs/070-adr-0028-vigente b8b2a22b77f80d9445a4af7aca7456ed6f7f731a`; `git -C /home/rodrigoisensee/MetricasDSPD-052d push origin HEAD:refs/heads/docs/070-adr-0028-vigente`; sem commit, sem PR; se a worktree tiver mudança local, pare e relate.
- (E2, E3) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Ler
- docs/pedidos/070-simulado-por-cartao.md: só `## Escopo`, `## Etapas` e `## Decisões` e, do `## Histórico`, só as linhas que este brief cita; nunca o pedido inteiro (docs/economia-de-tokens.md, regra 4)

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "Não consigo deixar os dados reais nas que já são possíveis fazer e nas que não deixar mocado?" e, ao recibo ("vou fazer: painel com dado real só com o real; sem dado real, o simulado com o selo Simulado visível; ADR nova revendo a 0026; não vou fazer: misturar real e simulado no mesmo gráfico, misturar BusinessMap e Acelerato, simulado em métrica individual; a troca é por cartão"), respondeu "Sim": dado simulado por cartão onde ainda não há dado real, com selo visível.
- DECISÃO DO DONO (2026-11-04): "A" (validação do protótipo docs/ux/070-selo-simulado/prototipo.html): protótipo aprovado como está (selo no cabeçalho, faixa com "O que é simulado?", borda tracejada, marca d'água, prefixo "Exemplo:"); ponto de compromisso do 070.
- DECISÃO DO DONO (2026-11-04): "A" (cartão simulado no resumo): o cartão com dado simulado fica fora de "O que pede atenção agora" e da Visão geral; só aparece na própria aba, com o selo; o resumo mostra só dado real.
- DECISÃO DO DONO (2026-11-05): "A" (suposições S1 a S3 do 070, pergunta das 12:28): confirmadas as três: S1 os filtros de equipe, sistema e prioridade não se aplicam ao cartão simulado; S2 a exportação leva só o dado real; S3 as duas tendências do Resumo e o EI_SUST ficam sem simulado; com isso a ADR 0028 pode passar a vigente.
- ADR 0026 (citada no pedido): revista pela 0028; nada nesta entrega
- ADR 0028 (citada no pedido): é a ADR que a branch vai levar a vigente (E1.12); esta etapa não a edita
- ADR 0021 (citada no pedido): nada nesta entrega
- Erro recorrente deste destino (forge-check, 30 dias): base em 14 entregas · evita: gere o brief de novo com `--branch`, para o Base-sha real (BRIEF-BASE-ATUAL)
- Erro recorrente deste destino (forge-check, 30 dias): escopo em 13 entregas · evita: cada item do Entregar cita a etapa `(E<n>)` do pedido; só corta com a marca de corte (R-BRIEF, R-DECISAO)
- Erro recorrente deste destino (forge-check, 30 dias): ambiente em 7 entregas · evita: rode o `forge-check` da versão vigente; limitação de ferramenta vira melhoria (R-DECISAO)
### Do Histórico deste pedido, docs/pedidos/070-simulado-por-cartao.md (DECISÃO TÉCNICA do Jarvis; contexto)
- 2026-11-05 13:06: Dono confirmou S1 a S3 com "A" (DECISÃO DO DONO acima). DECISÃO TÉCNICA (Jarvis): ADR 0028 a vigente em três etapas: E1.11 tech-lead cria docs/070-adr-0028-vigente da develop na worktree 052d (a limpeza da branch do L7-b fica no 069); E1.12 software-architect edita a ADR e o desenho na worktree; E1.13 tech-lead revisa, commita, abre o PR só de documentação e mescla (QA dispensado por ser só .md fora do controle).
### Restrições
- O agente não abre, lê nem edita arquivos `.env*`.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: arquivos (nenhuma edição), a branch feature/069-l7b-leitura (a limpeza dela é do 069), outras worktrees, a `homolog` e a `main`.

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
- "E1.12 (software-architect): ADR 0028 e desenho do 070 para vigente com as suposições S1 a S3 confirmadas pelo dono e a nota do F6 (+2,33 KB, A2 do review 070-v4), na branch docs/070-adr-0028-vigente." · etapa de outra delegação; continua no pedido
- "E1.13 (tech-lead): review, commit e PR só de documentação da ADR 0028 vigente para a develop, merge por squash com a CI verde." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (push): `git -C /home/rodrigoisensee/MetricasDSPD-052d ls-remote origin refs/heads/docs/070-adr-0028-vigente` · espera: contém 'b8b2a22b77f80d9445a4af7aca7456ed6f7f731a'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
