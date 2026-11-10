Agente destino: forge:tech-lead
Pedido: 077-tendencias-dado-real
Tipo: merge
Branch: feature/077-l6b-tela-ressalva   Base: develop   Base-sha: ab423d02fa03d131f2bf48841c83fb9b7e8009d9
Etapa: merge-integracao   Cobre: E2.4

## Objetivo
Preparar o Lote 6b das tendências com dado real (K-211, pedido 077) para o PR: commitar o parecer de interface já escrito pelo ux-designer, trazer a develop atual, com os PRs 268 a 271 (hook de pre-push novo) e enviar a branch; o review e o QA incrementais e o PR vêm depois, em outras delegações. Worktree `/home/rodrigoisensee/MetricasDSPD-056d`, branch `feature/077-l6b-tela-ressalva` (head 9907be6e, sem a develop).

## Ler
- `/home/rodrigoisensee/MetricasDSPD-056d/docs/ux/077-revisao-l6b.md` (novo), só o cabeçalho (branch, commit e veredito).

## Entregar
- (E2) (E2.4) Na worktree `/home/rodrigoisensee/MetricasDSPD-056d`, conferir `git branch --show-current` = `feature/077-l6b-tela-ressalva`; commitar só `docs/ux/077-revisao-l6b.md` (`git add` explícito pelo caminho; mensagem `docs(ux): revisão de interface do lote 6b do 077` com `Cartão: K-211`, por `git commit -F` de arquivo gravado por Write no scratchpad). `docs/ux/080-revisao-leia-junto.md` fica fora (é de outro pedido): não adicionar, não apagar.
- (E2) (E2.4) `git fetch origin` e `git merge --no-ff origin/develop` (a develop atual). Conflito em código ou teste: `git merge --abort`, pare e relate os arquivos. Sem conflito: `git diff --name-only 9907be6e HEAD` deve listar só arquivos que a develop trouxe e o parecer de UX; os arquivos do 6b (`git diff --name-only origin/develop...9907be6e`) ficam iguais aos de 9907be6e (`git diff 9907be6e HEAD -- <cada um>` vazio); se não ficarem, pare e relate.
- (E2) (E2.4) Push em primeiro plano, com timeout de 600 s na ferramenta: `git -C /home/rodrigoisensee/MetricasDSPD-056d push origin HEAD:refs/heads/feature/077-l6b-tela-ressalva` (`github.com` em allowed_domains); sem PR.

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

- ADR 0019 (citada no pedido): cálculo das tendências pela biblioteca; nada muda nesta etapa.
## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho curto em docs/analises/077-desenho.md, só leitura, sem commit; regra de negócio vira pergunta ao dono." · etapa de outra delegação; continua no pedido
- "E1.2 (tech-lead): revisão do desenho docs/analises/077-desenho.md (lotes, contrato, testes, teto, ordem), parecer curto em docs/analises/077-desenho-revisao-tech-lead.md, sem commit." · etapa de outra delegação; continua no pedido
- "E2.0 (ux-designer): especificação curta da janela incompleta (P-077-1) e da ressalva do S2 na tendência de SLA (P-077-2), com acessibilidade e critérios de aceite, em docs/ux/077-tendencias.md, sem commit." · etapa de outra delegação; continua no pedido
- "E2.1 (node-backend): implementação por lote." · etapa de outra delegação; continua no pedido
- "E2.2 (tech-lead): review por lote." · etapa de outra delegação; continua no pedido
- "E2.3 (qa-engineer): QA por lote." · etapa de outra delegação; continua no pedido
- "E2.5 (react-frontend): parte de tela do lote L3 (ressalva e janela incompleta), pela especificação." · etapa de outra delegação; continua no pedido
- "E2.6 (ux-designer): revisão de interface do lote L3." · etapa de outra delegação; continua no pedido
- "E2.7 (devops-engineer): diagnóstico do pre-push preso no eslint . dentro do sandbox (só leitura, sem commit), para destravar os pushes da E2.4." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (push): `git -C /home/rodrigoisensee/MetricasDSPD-056d merge-base --is-ancestor origin/develop origin/feature/077-l6b-tela-ressalva` · espera: rc=0
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-056d show origin/feature/077-l6b-tela-ressalva:docs/ux/077-revisao-l6b.md` · espera: contém 'commit: 1335576d27fca37b7e7781b18c5a31fc89dbc91a'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
