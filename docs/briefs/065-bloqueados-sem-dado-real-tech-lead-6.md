Agente destino: forge:tech-lead
Pedido: 065-bloqueados-sem-dado-real
Tipo: codigo
Branch: feature/065-bloqueados   Base: develop   Base-sha: 1f1da673b0fbb8210f2cd5cae5c3a4525afff901
Etapa: review   Cobre: E1.9

## Objetivo
Aprovar ou recusar a decisão de contrato do arquiteto para o 065 (aceite na v1 para O1 e O3, O2 compatível, desfazer o nullable do O5), pela política, §5 (pedido 065, E1.9, K-205).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/065-decisao-contrato.md`; `/home/rodrigoisensee/MetricasDSPD-052d/docs/contratos/politica-de-mudanca.md` (§2, §5, Como o gate funciona); `/home/rodrigoisensee/MetricasDSPD-052d/packages/contratos/src/schemas.ts` perto da linha 860.

## Entregar
- "E1.9 (tech-lead): aprovar ou recusar a decisão de contrato do arquiteto (política, §5)." (E1.9)
- (E1) (E2) (E1.9) preencher a seção `Aprovação do tech-lead` de `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/065-decisao-contrato.md` pela ferramenta Edit com: aprovado ou recusado, motivo, e qual opção vale para o O5 (desfazer o nullable ou aceite); sem commit (o node-backend leva a decisão para a branch na etapa seguinte).

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "C" (bloqueados no mapa real, pedido 064): fazer A agora (tirar a tela de bloqueados do mapa real; ela mostra "Sem dado real" até a coleta gravar bloqueios) e B depois (corrigir a coleta para gravar os bloqueios), como cartão.
- DECISÃO DO DONO (2026-11-04): "isso" (recibo do 065): tirar BLOQUEADOS do mapa real e mostrar "Sem dado real" também nas partes do O1 (bloqueados), do O2 (motivo do bloqueio) e do O5 (horas bloqueadas), em vez de zero; a coleta gravar bloqueios fica no K-204.
- DECISÃO DO DONO (2026-11-04): "B" (Q-065-1, percentual de eficiência do O5): o O5 inteiro mostra "Sem dado real" até a coleta gravar bloqueios (K-204), em vez de publicar o percentual com ressalva.
- ADR 0026 (citada no pedido): métrica fora do mapa real responde Sem dado real; o texto ainda está sem commit, na worktree 052b
- ADR 0002 (citada no pedido): imports entre pacotes; não muda nesta etapa
- 2026-11-04 13:30: E1.8 cumprida pelo software-architect: decisão em docs/analises/065-decisao-contrato.md (sem commit): nada vai para /api/v2; O1 e O3 com aceite na v1 (motivo: único consumidor é o web do mesmo repositório, mesmo pacote de contratos e mesmo release); O2 compatível (só fotografar); O5: desfazer a troca de horasBloqueio para nullable (schemas.ts:860), porque pela decisão B o O5 responde Sem dado real e nada produz null (o arquivo traz também o aceite do O5 como alternativa); risco baixo: aba aberta com bundle antigo mostra erro de resposta inválida no O1 até recarregar; contradição da política entre §2 e a saída 2 do gate vira cartão (melhoria). DECISÃO TÉCNICA (Jarvis): E1.9 com o tech-lead para aprovar ou recusar.
- (064-lacunas-dado-real) DECISÃO DO DONO (2026-11-04): "A" (levantamento das lacunas de dado real): o software-architect e o qa-engineer comparam cada tela das operacionais, do apontamento e da sustentação com o dado real da base e listam o que falta, sem mudar código. [Nota do Jarvis: o "sem mudar código" vale para este levantamento; as correções viram pedidos próprios, como o 065, decidido pelo dono na "C".]
- O agente não abre, lê nem edita arquivos `.env*`.
- Sem código, sem commit e sem mudar a política.
- NÃO tocar: código, testes, a política, os pareceres, outros documentos, o `CLAUDE.md`, os arquivos `.env*` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho curto: onde tirar do mapa real (origem.ts e o mapa da ADR 0026) e como O1, O2 e O5 mostram a parte sem dado." · etapa de outra delegação; continua no pedido
- "E1.2 (node-backend): implementação no server e testes." · etapa de outra delegação; continua no pedido
- "E1.3 (react-frontend): ajuste de tela, se o desenho pedir." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): code review." · etapa de outra delegação; continua no pedido
- "E1.5 (qa-engineer): QA." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR para a develop e merge." · etapa de outra delegação; continua no pedido
- "E1.7 (ux-designer): revisão de interface dos cartões O1, O2 e O5 e da tela de bloqueados com a parte Sem dado real, sem commit (o tech-lead commita no começo do review)." · etapa de outra delegação; continua no pedido
- "E1.8 (software-architect): decisão de contrato pela política de mudança (aceite na v1 em aceitas.json ou contrato /api/v2) para O1, O3 e O5, que o tech-lead aprova depois." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (cmd): `sed -n '/Aprovação do tech-lead/,$p' /home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/065-decisao-contrato.md` · espera: contém 'aprovad'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).