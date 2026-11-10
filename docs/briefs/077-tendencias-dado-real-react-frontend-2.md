Agente destino: forge:react-frontend
Pedido: 077-tendencias-dado-real
Tipo: volta
Branch: feature/077-l4a-tela-janela-fluxo   Base: develop   Base-sha: 718d46beb4be314dd6d1f1c55454e64e62e4fe7d
Etapa: codigo   Cobre: E2.5
Volta-de: docs/briefs/077-tendencias-dado-real-react-frontend-1.md sha256 7b9c4968b4c02579e2b8f6f3987bcf8937cf6134f92541755ebe69ad87fd808c

## Objetivo
Lote 4a das tendências com dado real (K-211, pedido 077, E2.5): a tela da tendência do fluxo mostra o mês de janela incompleta (marcador vazado, motivo em texto, situação na tabela, frase do subtítulo), consumindo o campo `janelaIncompleta` que o contrato já traz (Lote 1a, PR 249). Worktree `/home/rodrigoisensee/MetricasDSPD-052h` (livre: o Lote 2 já está na develop pelo PR 251), branch nova `feature/077-l4a-tela-janela-fluxo` a partir da develop.

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/077-desenho.md`: as seções "Lote 4a" e "5. Ordem, teto e conflito com o 075".
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/ux/077-tendencias.md`: as seções "1. Janela incompleta (P-077-1)", "5. Acessibilidade (WCAG 2.2 AA)" e "6. Microcopy", e os critérios CA-1 a CA-7 e CA-14.
- docs/reviews/077-l4a-tela-janela-fluxo.md (parecer, lido de 5334e03)
- `/home/rodrigoisensee/MetricasDSPD-052h/docs/ux/077-revisao-l4a.md`: os achados A-1 e A-2.

## Entregar (volta 1)
- Escopo da entrega original, já conferido e inalterado; esta volta só corrige os achados abaixo (E1, E2, E2.5).
- (review 5334e03 A1) o eixo escreve "poucos itens" sob todo mês com valor null, inclusive o de janela incompleta (até com 30 itens): o gráfico mostra o motivo errado, contra o CA-4. Levar o motivo do ponto ao TickMes e testar o rótulo. [web/src/components/charts/GraficoMensal.tsx:65]
Recomendados (cada um entra no Entregar acima ou vira corte com a marca "Retira do escopo original" em Fora do escopo):
- (review 5334e03 A2) o CA-3 pede "Poucos itens (n=N). Estatística não publicada." e a lista mostra "poucos itens (n=14)"; texto anterior ao lote, igual ao A-1 da revisão de interface; alinhar na mesma volta do A1. [web/src/features/operacional/resumo/modelo.ts:233] · entra nesta volta, com o A-1 da revisão de interface: a frase da seção 6 nos dois motivos.
- (review 5334e03 A3) o padrão de `vazioJanela` é o texto do fluxo num componente compartilhado; o Lote 4b deve passar o texto da sustentação (spec, seção 1), senão a sustentação fala em "itens". [web/src/features/operacional/resumo/SerieMensal.tsx:59] · não entra aqui: vai ao Lote 4b (a sustentação passa o próprio `vazioJanela`), DECISÃO TÉCNICA do Histórico.
- (UX A-2) o texto do ponto "janela incompleta (histórico começa em ...)" (em modelo.ts) segue a microcopy da seção 6 da especificação · entra nesta volta.
- (E2) (E2.5) Testes de unidade do rótulo do eixo por motivo (janela incompleta, poucos itens) e dos textos do CA-3 e da microcopy; eslint, `tsc -b` e os testes dos arquivos tocados com no máximo 2 workers verdes, cobertura de 100% nos arquivos tocados; `docs:gerar` e `openapi:gerar` sem mudança nos artefatos; a contagem do teto pela saída literal de `git diff --numstat --no-renames 718d46beb4be314dd6d1f1c55454e64e62e4fe7d...HEAD` (adições e remoções); commits com `Cartão: K-211` (mensagem gravada por Write em `/tmp/claude-1000/-home-rodrigoisensee-Metricas-MetricasDSPD/73d03d2b-ba9f-4d84-b635-cabe917583a2/scratchpad/msg-rf-077-l4a-v1.txt` e `git commit -F` com esse caminho literal), `git add` explícito por caminho; não incluir nem apagar `docs/ux/077-revisao-l4a.md`; antes do commit, `git -C /home/rodrigoisensee/MetricasDSPD-052h pull --ff-only origin feature/077-l4a-tela-janela-fluxo`; conferir `git -C /home/rodrigoisensee/MetricasDSPD-052h rev-parse --abbrev-ref HEAD` e enviar com `git -C /home/rodrigoisensee/MetricasDSPD-052h push origin HEAD:refs/heads/feature/077-l4a-tela-janela-fluxo`, em primeiro plano, com o comando puro; se o rc não for 0, conferir `git ls-remote` antes de repetir; push ou pre-push com mais de 15 minutos está preso: pare e relate (o Jarvis avisa o dono e refaz; DECISÃO TÉCNICA de 2026-11-07 01:20 do 075); esperar a CI do push com `gh run watch <id> --exit-status` (id literal) e relatar; sem PR.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho curto em docs/analises/077-desenho.md, só leitura, sem commit; regra de negócio vira pergunta ao dono." · etapa de outra delegação; feita
- "E1.2 (tech-lead): revisão do desenho docs/analises/077-desenho.md (lotes, contrato, testes, teto, ordem), parecer curto em docs/analises/077-desenho-revisao-tech-lead.md, sem commit." · etapa de outra delegação; continua no pedido
- "E2.0 (ux-designer): especificação curta da janela incompleta (P-077-1) e da ressalva do S2 na tendência de SLA (P-077-2), com acessibilidade e critérios de aceite, em docs/ux/077-tendencias.md, sem commit." · etapa de outra delegação; feita
- "E2.2 (tech-lead): review por lote." · etapa de outra delegação; continua no pedido
- "E2.3 (qa-engineer): QA por lote." · etapa de outra delegação; continua no pedido
- "E2.4 (tech-lead): PR por lote, depois do QA." · etapa de outra delegação; continua no pedido
- "E2.1 (node-backend): implementação por lote." · etapa de outra delegação; continua no pedido
- "E2.6 (ux-designer): revisão de interface do lote L3." · etapa de outra delegação; continua no pedido

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- 2026-11-06 11:11: DECISÃO DO DONO: "A" (K-211, registrada no pedido 073): as tendências do Resumo entram no mapa real, como pedido novo (077).
- 2026-11-06 12:06: DECISÃO DO DONO (literal "Faca suas recomendacoes", resposta às P-077-1 a P-077-3): as três recomendações do Jarvis.
- 2026-11-06 12:06: DECISÃO DO DONO: "A" (P-077-1, pela recomendação): ponto cuja janela de 12 semanas começa antes da primeira carga não publica e mostra janela incompleta.
- 2026-11-06 12:06: DECISÃO DO DONO: "A" (P-077-2, pela recomendação): a tendência de SLA leva a ressalva do S2 (lote L3: notas no contrato e na tela, com o ux-designer).
- 2026-11-06 12:06: DECISÃO DO DONO: "A" (P-077-3, pela recomendação): a passagem para dado real vira marca de critério (T2.6) no eixo das tendências.
- 2026-11-06 14:54: DECISÃO DO DONO: "A" (P-077-4, pela recomendação): a primeira carga é a data em que o histórico carregado começa (inicio_carga da carga inicial), não o dia em que a carga rodou. Destrava o Lote 3. PERGUNTA: P-077-5 vai ao dono; na fila: tabela P-E10-2, P-E10-5 e P-E10-6 (073).
### Dos pedidos de que este depende (064, 073), literais
- (064) DECISÃO DO DONO (2026-11-04): "A" (levantamento das lacunas de dado real): o software-architect e o qa-engineer comparam cada tela das operacionais, do apontamento e da sustentação com o dado real da base e listam o que falta, sem mudar código. [Nota do Jarvis: o "sem mudar código" vale para este levantamento; as correções viram pedidos próprios, como o 065, decidido pelo dono na "C".]
- (064) 2026-11-04 08:04: DECISÃO DO DONO "C" (bloqueados no mapa real): A agora (tirar a tela de bloqueados do mapa real, Sem dado real até a coleta gravar bloqueios) e B depois (coleta grava bloqueios) como cartão. DECISÃO TÉCNICA (Jarvis): A vira o pedido 065 (modo implementar; este pedido segue em analisar); B vira o cartão K-204.
- (064) 2026-11-04 14:11: DECISÃO DO DONO "B" (S8): contar só os incidentes com resposta; abaixo de 20 não publica. DECISÃO TÉCNICA (Jarvis): vira o pedido 066 (implementar).
- (064) 2026-11-04 14:13: DECISÃO DO DONO "Atipico acima de 10 horas" (L6): o dia atípico passa a acima de 10 h. DECISÃO TÉCNICA (Jarvis): vira o pedido 067 (implementar); os outros limites seguem provisórios até o dono dizer o contrário (suposição no recibo).
- (073) 2026-11-05 20:24: [SUSPENSA em 2026-11-05 20:31: a pergunta do Jarvis disse que nenhum dos dois alertas roda em produção; pela triagem o 27 roda no deploy, no CLI de migração; pergunta refeita ao dono] DECISÃO DO DONO: "A" (alertas 16 e 27 do Dependabot): aceitar o risco com prazo de revisão de 30 dias ou quando o pacote pai corrigir; o security-engineer registra a aceitação num parecer.
- (073) 2026-11-05 20:27: DECISÃO DO DONO: "A" (P-0023-2): a ADR 0023 é vigente desde 2026-11-04, data do merge do PR 203 (4e755edd); as decisões do dono no 056 ("B") e no 060 ("A") mais esse merge contam como aceitação. O software-architect edita o estado da ADR pela proposta de docs/analises/073-adr-0023-estado.md, com review.
- (073) 2026-11-05 20:27: DECISÃO DO DONO: "A" (próxima release): uma release só com a L9-c e o pedido 073, depois que os PRs do 073 estiverem na develop.
- (073) 2026-11-05 20:34: DECISÃO DO DONO: "A" (alertas 16 e 27, pergunta refeita): aceitar o risco do 16 (zod via lighthouse, só teste) agora; o 27 (glob via node-pg-migrate, roda no deploy pelo CLI de migração) só depois de o security-engineer ler o advisory e confirmar que não se aplica ao uso do projeto (o glob lê só a pasta de migrações do repositório, sem entrada externa); confirmado, a aceitação do 27 entra no mesmo parecer, com revisão em 2026-12-05 ou quando o pacote pai corrigir; achado risco real, volta ao dono como pergunta nova.
- (073) 2026-11-05 21:05: [SEM EFEITO no ajuste do CLAUDE.md em 2026-11-05 21:17: o CLAUDE.md da develop já diz isso desde a decisão do dono de 2026-10-27 ("enviada" quer dizer o PR para a develop; o push da feature branch é liberado antes); só o checkout velho da branch do Jarvis não tinha o texto] DECISÃO DO DONO: "A" (envio da branch antes do QA): a regra do CLAUDE.md ("nenhuma branch é enviada sem o parecer do QA") vale para o PR: nenhum PR para a develop sem o parecer do QA; a branch de trabalho pode ir ao GitHub antes. O tech-lead ajusta o texto do CLAUDE.md num PR de documentação. Com isso, o review do E8 (347106ef) é enviado e o QA do E8 segue.
- (073) 2026-11-05 21:07: DECISÃO DO DONO: "A" (P-E3-1, natureza_prefixo, pelo "faça sua recomendação" do dono): a mudança de natureza_prefixo não para a coleta; fica registrada como versão de critério pelo ac:ref-sync e marcada nos gráficos (T2.6).
- (073) 2026-11-05 21:08: DECISÃO DO DONO: "A" (P-E3-2, equipe, organização ou tipo que entra no recorte): os chamados antigos entram junto com o reconhecimento: reconhecer uma mudança de recorte dispara a releitura completa do recorte (só leitura no Acelerato, carga só acrescenta versões).
- (073) 2026-11-06 10:31: DECISÃO DO DONO: "A" (P-E9-3, literal "Decisao e a A"): o E9 (CA-8 no coletor do BusinessMap) entra junto com o P-L2-1, quando o mapa de campos do BusinessMap tiver listas. DECISÃO TÉCNICA (Jarvis): o E9 sai do 073 em andamento e o K-234 volta à Entrada com a dependência do P-L2-1; P-E9-1, P-E9-2 e P-E9-4 ficam para quando ele voltar; o desenho docs/analises/073-e9-desenho.md fica como base. Próxima pergunta da fila: P-E10-1.
- (073) 2026-11-06 11:11: DECISÃO DO DONO: "A" (P-E10-1): editar ref_dominio direto no banco não é caminho aceito: a coleta recusa até a lista voltar pelo ac:ref-sync (opção C do desenho do E10).
- (073) 2026-11-06 11:11: DECISÃO DO DONO: "A" (P-E10-2): o time propõe quais métricas de sustentação cada grupo de lista afeta e o dono valida (vale também para a marca da P-E3-1).
- (073) 2026-11-06 11:11: DECISÃO DO DONO: "A" (P-E10-3): mudança de SQL, colunas e campos também exige versão de critério, registrada no deploy.
- (073) 2026-11-06 11:11: DECISÃO DO DONO: "A" (P-E10-4): voltar uma lista a um estado anterior é nova mudança de critério, com data nova.
- (073) 2026-11-06 11:11: DECISÃO DO DONO: "A" (DEV-1): exigir checks verdes para mesclar na develop (proteção da branch no GitHub).
- (073) 2026-11-06 11:11: DECISÃO DO DONO: "A" (K-211): as tendências do Resumo entram no mapa real, como pedido novo (077).
- Nota do Jarvis: das decisões do 064 e do 073, só a K-211 "A" (073) e a lacuna L4 (064) tocam este pedido; as demais não mudam este lote.
- ADR 0019 (citada no pedido): o cálculo das tendências já existe por ela (uma fonte por tendência, mínimo de 20); este lote não muda o cálculo de O3, O4, S2 e S3 (Fora do escopo do pedido).
- 2026-11-06 15:47: DECISÃO TÉCNICA (Jarvis): desenho fechado para 1a, 1b, 2, 3a, 4a, 4b, 6a e 6b pela ordem do §5.
- 2026-11-07 05:59: DECISÃO TÉCNICA (Jarvis): o "lote L3" da etapa E2.5 é, no desenho revisto, a parte de tela dos Lotes 4a, 4b e 6b; esta delegação é o 4a.
- 2026-11-07 06:41: DECISÃO TÉCNICA (Jarvis): volta única ao react-frontend no 4a com A1 do review, o CA-3 (A2 do review e A-1 da interface) e a microcopy (A-2 da interface); A3 e A-3 vão ao 4b; A-4 fica como recomendado.
- 2026-11-06 17:22: DECISÃO TÉCNICA (Jarvis): todo brief de lote do 077 nomeia no Entregar os artefatos gerados (docs/api/openapi.json, docs/contratos/metricas, snapshots) e manda rodar docs:gerar e openapi:gerar antes do push.
- Recursos: vitest com no máximo 2 workers (DECISÃO TÉCNICA do Jarvis, 075, 14:40); regra da noite do dono (075, 2026-11-07 00:07): até 3 agentes e 1 git push por vez, escalonados pelo Jarvis.
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. GitHub: `github.com` e `api.github.com` em `allowed_domains`; npm: `registry.npmjs.org`. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: `server/`, `packages/` (contratos e métricas), `TendenciaSustentacao.tsx` (Lote 4b), a ressalva do S2 (Lote 6b), `origem.ts`, o mapa real, `docs/contratos/snapshots/aceitas.json`, o desenho, a especificação, o pedido, `KANBAN.md`, outras worktrees, a `develop`, a `homolog` e a `main`.
- Nesta volta (head 5334e030): `GraficoMensal.tsx` pode mudar só no rótulo do eixo por motivo (A1); os pareceres de review e de interface e o arquivo sem commit `docs/ux/077-revisao-l4a.md` não se tocam.
- Erro recorrente deste destino (forge-check, 30 dias): escopo em 6 entregas · evita: cada item do Entregar cita a etapa `(E<n>)` do pedido; só corta com a marca de corte (R-BRIEF, R-DECISAO)
- Erro recorrente deste destino (forge-check, 30 dias): base em 3 entregas · evita: gere o brief de novo com `--branch`, para o Base-sha real (BRIEF-BASE-ATUAL)

## Pronto quando
- PQ-1 (cmd): `gh run list --repo rodrigo-isensee/MetricasDSPD --branch feature/077-l4a-tela-janela-fluxo --event push --limit 1 --json conclusion` · espera: contém '"success"'
- PQ-2 (push): `git ls-remote origin refs/heads/feature/077-l4a-tela-janela-fluxo` igual ao head local (`git -C /home/rodrigoisensee/MetricasDSPD-052h rev-parse HEAD`)
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052h diff --name-only 718d46beb4be314dd6d1f1c55454e64e62e4fe7d -- server packages docs/contratos` · espera: linhas=0
- PQ-4 (cmd, do autor): `forge-check entrega 077-tendencias-dado-real --branch feature/077-l4a-tela-janela-fluxo --base develop --base-sha 718d46beb4be314dd6d1f1c55454e64e62e4fe7d --etapa codigo --desde 9342bc7aaef52c2b05773d11725c8bd5fdc4320c` · espera: rc=0
- PQ-5 (cmd, do autor): `bin/forge-mutante --cobertura --base 718d46beb4be314dd6d1f1c55454e64e62e4fe7d` · espera: rc=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
