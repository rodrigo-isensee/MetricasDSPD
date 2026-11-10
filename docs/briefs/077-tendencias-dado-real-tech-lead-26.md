Agente destino: forge:tech-lead
Pedido: 077-tendencias-dado-real
Tipo: review
Branch: feature/077-l8a-contagem-parcial   Base: develop   Base-sha: fb719e7a57a220cde49dfb1b044841d5942a145b
Etapa: review   Cobre: E2.2

## Objetivo
Review do Lote 8a das tendências com dado real (K-211, pedido 077): campo opcional `contagemParcial: { historicoDesde }` no item de `meses` (molde aditivo, P-077-5 = A confirmada), decidido por `contagemParcial` em `core/series.ts`, com `concluidos` e `volume` mantidos no payload; código em 01877ac8 (enviado em 50241b30, com a develop fb719e7a mesclada), CI verde, entrega conferida. Worktree `/home/rodrigoisensee/MetricasDSPD-052d` (pode estar na branch do 3b, em volta pelo node-backend: leia o 8a pelas refs ou espere a volta terminar antes de trocar), branch `feature/077-l8a-contagem-parcial`.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052d diff 54f02c42b51aba3355e9f0428f058113f916c4c9 01877ac84137125b1d7dd1a24edac44856a29e40` (o lote, sem o merge da develop).
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/077-desenho.md`: as seções "Lote 8" e "P-077-5 revista".

## Entregar
- "E2.2 (tech-lead): review por lote." (E2.2)
- (E2) (E2.2) Foco: aderência ao Lote 8a (fronteira: mês que começa no `historicoDesde` não é parcial; ausente sem `historicoDesde`; condição diferente da janela, A10); função única pela biblioteca (T2.5); contrato aditivo (campo opcional; `docs:check` sem entrada em `aceitas.json`); artefatos gerados coerentes (openapi, TENDENCIA_FLUXO.md, TENDENCIA_SUST.md e as duas fotografias); os 8 timeouts da suíte web relatados pelo autor sob carga (a web não foi tocada: diga se a CI do push confirma); teto (80 linhas de código e teste; 144 com artefatos); BusinessMap e Acelerato sem mistura. Parecer em `docs/reviews/077-l8a-contagem-parcial.md` gravado inteiro pela ferramenta Write, com `pedido: 077-tendencias-dado-real`, `branch: feature/077-l8a-contagem-parcial`, `commit: 50241b30c45bee9679fc24002de4051a8afe6c0a`, veredito e bloco `## Achados` só com linhas de achado (até 300 caracteres, regra só pelo ID); commit só do parecer com `Cartão: K-211` (mensagem por `git commit -F` com arquivo gravado por Write em `/tmp/claude-1000/-home-rodrigoisensee-Metricas-MetricasDSPD/73d03d2b-ba9f-4d84-b635-cabe917583a2/scratchpad/msg-tl-077-l8a.txt`, `git add` explícito pelo caminho), na branch do 8a; push com `git -C /home/rodrigoisensee/MetricasDSPD-052d push origin feature/077-l8a-contagem-parcial:refs/heads/feature/077-l8a-contagem-parcial` em segundo plano, com corte em 15 minutos; sem PR.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- - 2026-11-06 11:11: DECISÃO DO DONO: "A" (K-211, registrada no pedido 073): as tendências do Resumo entram no mapa real, como pedido novo (077).
- - 2026-11-06 12:06: DECISÃO DO DONO (literal "Faca suas recomendacoes", resposta às P-077-1 a P-077-3): as três recomendações do Jarvis.
- - 2026-11-06 12:06: DECISÃO DO DONO: "A" (P-077-1, pela recomendação): ponto cuja janela de 12 semanas começa antes da primeira carga não publica e mostra janela incompleta.
- - 2026-11-06 12:06: DECISÃO DO DONO: "A" (P-077-2, pela recomendação): a tendência de SLA leva a ressalva do S2 (lote L3: notas no contrato e na tela, com o ux-designer).
- - 2026-11-06 12:06: DECISÃO DO DONO: "A" (P-077-3, pela recomendação): a passagem para dado real vira marca de critério (T2.6) no eixo das tendências.
- - 2026-11-06 14:54: DECISÃO DO DONO: "A" (P-077-4, pela recomendação): a primeira carga é a data em que o histórico carregado começa (inicio_carga da carga inicial), não o dia em que a carga rodou. Destrava o Lote 3. PERGUNTA: P-077-5 vai ao dono; na fila: tabela P-E10-2, P-E10-5 e P-E10-6 (073).
- - 2026-11-07 12:56: DECISÃO DO DONO (literal): "Isso a 1" (merge agrupado, leitura 1): cada lote segue com review, QA e conferência próprios e entra numa branch de integração; só ela vira um PR único para a develop. DECISÃO TÉCNICA (Jarvis): branch `integracao/2026-11-07` criada pelo tech-lead a partir da develop atual; cada lote, depois do QA conferido, entra nela por merge (--no-ff) feito pelo tech-lead, com o forge-check pr do lote limpo; no fim, um PR único integracao/2026-11-07 → develop (merge commit), com a lista de lotes e pareceres; os PRs 256 e 266 ficam abertos até lá e fecham com o PR único. O dono faz um update-branch e um merge só.
- - 2026-11-07 19:15: DECISÃO DO DONO (literal): "A" (P-077-5, pela recomendação): mês anterior ao início do histórico não mostra a contagem (concluídos e volume); fica marcado janela incompleta com o motivo. DECISÃO TÉCNICA (Jarvis): molde aditivo do desenho (Lote 8: 8a node-backend, 8b react-frontend), antes do Lote 5, como o desenho manda. PERGUNTA: (Jarvis) 3 de 4: P-077-6.
- - 2026-11-07 19:16: DECISÃO DO DONO (literal): "A" (P-077-6, opção (a), pela recomendação): o Acelerato não tem início de histórico; nenhum ponto da tendência de SLA sai janela incompleta por isso. Destrava os Lotes 3b e 7. PERGUNTA: (Jarvis) 4 de 4: QA do PR 256 (pedido 082).
- - 2026-11-07 21:55: DECISÃO DO DONO (literal): "Sim foi A" (confirmação da P-077-6: o "A" é a opção (a), o Acelerato não tem início de histórico). O 3b deixa de estar segurado. PERGUNTA: (Jarvis) ao dono: confirmação da P-077-5 (contagem parcial na API com marca e escondida só na tela, ou fora da API).
- - 2026-11-07 21:56: DECISÃO DO DONO (literal): "A" (confirmação da P-077-5, pergunta "O que me recomenda para 2?" respondida com a recomendação: o número parcial continua no resultado da API, marcado como contagem parcial, e só a tela o esconde; molde aditivo, Lotes 8a e 8b). O 8a deixa de estar segurado. PERGUNTA: (Jarvis) ao dono: como fechar o merge agrupado.
- - 2026-11-07 21:57: DECISÃO DO DONO (literal): "A" (como fechar o merge agrupado: voltar a um PR por lote para a develop; a branch integracao/2026-11-07 é descartada). Revoga, para o que falta, a leitura 1 de 12:56. DECISÃO TÉCNICA (Jarvis): o tech-lead atualiza cada branch com a develop, abre os PRs do 4c e do 6a (075) e do 4b e do 6b (077, com os pareceres de interface commitados antes) e deixa cada um pronto pelo forge-fechar; o dono mescla, um por vez, com update-branch quando ficarem BEHIND. MELHORIA (cartão Forge): forge-check pr reconhecer os pareceres dos lotes mesclados numa branch de integração.
- - 2026-11-07 22:46: DECISÃO DO DONO (literal): "A" (o dono pausa o guarda de lint enquanto o time envia). Fila: PRs do 075 (tech-lead-35) agora; depois os PRs do 4b e do 6b (tech-lead-23); o push do 3b sai com o node-backend depois do 8a.
- - 2026-11-08 20:01: DECISÃO DO DONO (literal): "A" (pre-push só com os arquivos alterados): vira o pedido 083.
- ADR 0019 (citada no pedido): cálculo das tendências pela biblioteca; o 8a marca o mês parcial pela biblioteca, sem cálculo novo na API.
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`; comandos com mais de 2 minutos em segundo plano.
- NÃO tocar: código, testes, a branch do 3b (em volta), outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho curto em docs/analises/077-desenho.md, só leitura, sem commit; regra de negócio vira pergunta ao dono." · etapa de outra delegação; continua no pedido
- "E1.2 (tech-lead): revisão do desenho docs/analises/077-desenho.md (lotes, contrato, testes, teto, ordem), parecer curto em docs/analises/077-desenho-revisao-tech-lead.md, sem commit." · etapa de outra delegação; continua no pedido
- "E2.0 (ux-designer): especificação curta da janela incompleta (P-077-1) e da ressalva do S2 na tendência de SLA (P-077-2), com acessibilidade e critérios de aceite, em docs/ux/077-tendencias.md, sem commit." · etapa de outra delegação; continua no pedido
- "E2.1 (node-backend): implementação por lote." · etapa de outra delegação; continua no pedido
- "E2.3 (qa-engineer): QA por lote." · etapa de outra delegação; continua no pedido
- "E2.4 (tech-lead): PR por lote, depois do QA." · etapa de outra delegação; continua no pedido
- "E2.5 (react-frontend): parte de tela do lote L3 (ressalva e janela incompleta), pela especificação." · etapa de outra delegação; continua no pedido
- "E2.6 (ux-designer): revisão de interface do lote L3." · etapa de outra delegação; continua no pedido
- "E2.7 (devops-engineer): diagnóstico do pre-push preso no eslint . dentro do sandbox (só leitura, sem commit), para destravar os pushes da E2.4." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052d show origin/feature/077-l8a-contagem-parcial:docs/reviews/077-l8a-contagem-parcial.md` · espera: contém 'commit: 50241b30c45bee9679fc24002de4051a8afe6c0a'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
