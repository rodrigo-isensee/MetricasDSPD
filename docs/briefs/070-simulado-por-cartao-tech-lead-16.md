Agente destino: forge:tech-lead
Pedido: 070-simulado-por-cartao
Tipo: codigo
Branch: docs/070-adr-0028-vigente   Base: develop   Base-sha: b8b2a22b77f80d9445a4af7aca7456ed6f7f731a
Etapa: merge-integracao   Cobre: E1.13

## Objetivo
Revisar a mudança da ADR 0028 e do desenho do 070 para vigente, commitar, abrir o PR só de documentação para a develop e mesclar (pedido 070, E1.13, K-221). Worktree `/home/rodrigoisensee/MetricasDSPD-052d`, branch `docs/070-adr-0028-vigente`.

## Entregar
- "E1.13 (tech-lead): review, commit e PR só de documentação da ADR 0028 vigente para a develop, merge por squash com a CI verde." (E1.13)
- (E1) (E1.13) `git -C /home/rodrigoisensee/MetricasDSPD-052d diff` (só docs/architecture/adr/0028-simulado-por-cartao.md e docs/analises/070-desenho.md, editados pelo software-architect na E1.12); revisar contra as decisões do dono abaixo: o estado vigente, a condição cumprida, Q-070-1 a Q-070-6 como respondidas sem mudar o que D1 a D7 decidem, a ligação da Q-070-6 à decisão "A" de 2026-11-04 (cartão simulado fora da Visão geral), a nota da Q-070-4 item b e a nota do F6; se houver achado bloqueante, pare e relate sem commitar; parecer de review em `docs/reviews/070-w1-adr-vigente.md` gravado inteiro pela ferramenta Write (sem editar depois), com `pedido: 070-simulado-por-cartao`, `branch: docs/070-adr-0028-vigente`, `commit:` igual ao sha do commit da mudança, veredito e `## Achados`; commits com `git -C /home/rodrigoisensee/MetricasDSPD-052d add <arquivos>` e `git -C /home/rodrigoisensee/MetricasDSPD-052d commit -m <mensagem> -m 'Cartão: K-221' -- <arquivos>` (sem heredoc e sem pipe), primeiro os dois arquivos da E1.12 e depois só o parecer; `pnpm run docs:check` verde; push com `git -C /home/rodrigoisensee/MetricasDSPD-052d push origin HEAD:refs/heads/docs/070-adr-0028-vigente`; `forge-check pr 070-simulado-por-cartao --ref origin/docs/070-adr-0028-vigente --base origin/develop` limpo (QA dispensado, só .md fora do controle); PR para a develop com `--body-file` num arquivo escrito pela ferramenta Write, citando o parecer e a decisão do dono de 2026-11-05; esperar os checks por laço com pausa (sem `--watch`), cada chamada abaixo de 2 minutos; com todos verdes, `gh pr merge docs/070-adr-0028-vigente --repo rodrigo-isensee/MetricasDSPD --squash --match-head-commit <sha literal do head do PR>`, sem `--admin`; se a develop andou, `gh pr update-branch docs/070-adr-0028-vigente --repo rodrigo-isensee/MetricasDSPD` e esperar de novo; se um check falhar, o forge-check pedir parecer novo ou o hook recusar, pare e relate a mensagem literal; sem promover para a homolog.
- (E2, E3) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Ler
- docs/pedidos/070-simulado-por-cartao.md: só `## Escopo`, `## Etapas` e `## Decisões` e, do `## Histórico`, só as linhas que este brief cita; nunca o pedido inteiro (docs/economia-de-tokens.md, regra 4)

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "Não consigo deixar os dados reais nas que já são possíveis fazer e nas que não deixar mocado?" e, ao recibo ("vou fazer: painel com dado real só com o real; sem dado real, o simulado com o selo Simulado visível; ADR nova revendo a 0026; não vou fazer: misturar real e simulado no mesmo gráfico, misturar BusinessMap e Acelerato, simulado em métrica individual; a troca é por cartão"), respondeu "Sim": dado simulado por cartão onde ainda não há dado real, com selo visível.
- DECISÃO DO DONO (2026-11-04): "A" (validação do protótipo docs/ux/070-selo-simulado/prototipo.html): protótipo aprovado como está (selo no cabeçalho, faixa com "O que é simulado?", borda tracejada, marca d'água, prefixo "Exemplo:"); ponto de compromisso do 070.
- DECISÃO DO DONO (2026-11-04): "A" (cartão simulado no resumo): o cartão com dado simulado fica fora de "O que pede atenção agora" e da Visão geral; só aparece na própria aba, com o selo; o resumo mostra só dado real.
- DECISÃO DO DONO (2026-11-05): "A" (suposições S1 a S3 do 070, pergunta das 12:28): confirmadas as três: S1 os filtros de equipe, sistema e prioridade não se aplicam ao cartão simulado; S2 a exportação leva só o dado real; S3 as duas tendências do Resumo e o EI_SUST ficam sem simulado; com isso a ADR 0028 pode passar a vigente.
- ADR 0026 (citada no pedido): revista pela 0028; não muda
- ADR 0028 (citada no pedido): é o arquivo revisado e mesclado aqui, só no estado e nas notas
- ADR 0021 (citada no pedido): não muda
- Erro recorrente deste destino (forge-check, 30 dias): base em 14 entregas · evita: gere o brief de novo com `--branch`, para o Base-sha real (BRIEF-BASE-ATUAL)
- Erro recorrente deste destino (forge-check, 30 dias): escopo em 13 entregas · evita: cada item do Entregar cita a etapa `(E<n>)` do pedido; só corta com a marca de corte (R-BRIEF, R-DECISAO)
- Erro recorrente deste destino (forge-check, 30 dias): ambiente em 7 entregas · evita: rode o `forge-check` da versão vigente; limitação de ferramenta vira melhoria (R-DECISAO)
### Do Histórico deste pedido, docs/pedidos/070-simulado-por-cartao.md (DECISÃO TÉCNICA do Jarvis; contexto)
- 2026-11-05 13:06: Dono confirmou S1 a S3 com "A" (DECISÃO DO DONO acima). DECISÃO TÉCNICA (Jarvis): ADR 0028 a vigente em três etapas: E1.11 tech-lead cria docs/070-adr-0028-vigente da develop na worktree 052d (a limpeza da branch do L7-b fica no 069); E1.12 software-architect edita a ADR e o desenho na worktree; E1.13 tech-lead revisa, commita, abre o PR só de documentação e mescla (QA dispensado por ser só .md fora do controle).
- 2026-11-05 13:13: E1.12 entregue pelo software-architect: ADR 0028 e desenho do 070 em vigente desde 2026-11-05, sem commit, na worktree 052d (branch docs/070-adr-0028-vigente): condição cumprida (selo 2026-11-04; Q-070-2 e Q-070-6 pela decisão A do resumo; Q-070-1, Q-070-3, Q-070-4 e Q-070-5 pela S1 a S3); D1 a D7 sem mudança; nota do F6 (+2,33 KB, 197,04 KB) na ADR e nas seções 6 e T-E4 do desenho. DECISÃO TÉCNICA (Jarvis): E1.13 com o tech-lead: review do texto (conferir a ligação da Q-070-6 à decisão A de 2026-11-04 e a nota da Q-070-4 item b), parecer de review, commit dos dois arquivos, PR só de documentação para a develop (QA dispensado, só .md fora do controle) e merge por squash com a CI verde.
### Restrições
- O agente não abre, lê nem edita arquivos `.env*`.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O GitHub precisa de `github.com` e `api.github.com` em `allowed_domains`; o hook `parecer` exige a branch no `gh pr merge`, não o número; `$?` e `$var` em comando com `gh pr` são barrados. R-VERIFY: nunca `--no-verify` nem `--force`. O pre-push e o forge-check docs barram frase de regra copiada no parecer (cite só o ID) e achado com mais de 300 caracteres.
- NÃO tocar: código, testes, outros arquivos além dos dois da E1.12 e do parecer, outras worktrees, a `homolog` e a `main`.

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
- "E1.12 (software-architect): ADR 0028 e desenho do 070 para vigente com as suposições S1 a S3 confirmadas pelo dono e a nota do F6 (+2,33 KB, A2 do review 070-v4), na branch docs/070-adr-0028-vigente." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (merge): `gh pr list --repo rodrigo-isensee/MetricasDSPD --head docs/070-adr-0028-vigente --state all --json state` · espera: contém 'MERGED'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
