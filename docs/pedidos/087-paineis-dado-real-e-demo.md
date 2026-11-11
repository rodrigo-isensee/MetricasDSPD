# Pedido 087: Operacional, Sustentação e Apontamento fechados com dado real e demo na main

- **Modo:** implementar
- **Objetivo:** fechar tudo o que é do time nos painéis Operacional, Sustentação (Acelerato) e Apontamento, levar à main e entregar ao dono uma demo com dado real para ele testar, só quando tudo estiver pronto.
- **Clareza:** 2 confirmado; 3 técnico; 1 suposição; 0 perguntas
- **Depende de:** 078 (release em curso), 075 (lotes 6b, 9a e 9b), 077 (Lote 7), 086 (inventário)

## Escopo
- E1. Release da develop atual até a homolog e PR de release para a main (pedido 078); o merge na main é do dono · `confirmado`
- E2. Lotes 6b, 9a e 9b do 075 (bloqueios reais) depois da primeira coleta real e da prova do dono, e segunda release · `confirmado`
- E3. Pendências técnicas pequenas dos painéis: K-215 (texto do recorte da sustentação), K-244 (categoria do erro no ref-sync do apontamento) e K-213 (leitura das marcas de qualidade e do "não classificado" do apontamento pelo código) · `técnico`
- E4. Comando único da demo, rodado pelo dono com o `.env` dele a partir da main: sobe o ambiente, roda as migrações, faz a carga inicial do BusinessMap, do Acelerato e do apontamento, projeta e imprime a consulta de prova do 075 (só contagens, sem dado de pessoa) · `técnico`
- E5. Lote 7 do 077 (tendência da sustentação com dado real) na develop antes da release final · `técnico`

## Etapas
- E1.1 (tech-lead): release pelo pedido 078.
- E2.1 (node-backend): lote 6b; E2.2 (react-frontend): lote 9a; E2.3 (node-backend): lote 9b; com review, QA e segurança por lote, pelo plano do 075.
- E3.1 (react-frontend): K-215. E3.2 (node-backend): K-244. E3.3 (software-architect): K-213, leitura só do código, parecer em docs/analises/, sem commit.
- E3.4 (tech-lead): review de cada branch do E3 (K-215 e K-244), parecer de review commitado e enviado na própria branch. E3.5 (qa-engineer): QA de cada branch do E3, parecer de QA commitado e enviado na própria branch. E3.6 (tech-lead): PR de cada branch do E3 para a develop (squash, CI verde).
- E4.1 (devops-engineer): o comando da demo (script e documentação), com parecer de devops, e o envio da branch de trabalho (o autor envia a branch, R-FLUXO); E4.2 (tech-lead): review, com parecer em docs/reviews/ commitado e enviado na branch (cartão K-258); E4.3 (qa-engineer): QA sem base real (simulação do roteiro), com parecer em docs/qa/ commitado e enviado na branch (cartão K-258); E4.4 (security-engineer): parecer (o script lê credenciais do `.env` e roda contra a base real quando o dono o executa), commitado e enviado pelo próprio security-engineer na branch (o forge-check exige o parecer de segurança na branch e só o papel de segurança grava em docs/security/); E4.5 (tech-lead): PR.
- E4.6 (node-backend): correção do BUG-087-2 (primeira execução da demo pelo dono: a carga do Acelerato para com dados-invalidos em campo_etapa.nome); o nome do campo de etapa que chega com outra grafia (acento, maiúscula, espaço no fim) é levado ao nome canônico da lista fechada com contagem da variante, e nome desconhecido continua falhando fechado; testes para cada variante. E4.7 (tech-lead): review; E4.8 (qa-engineer): QA; E4.9 (security-engineer): parecer (coletor do Acelerato, gatilho de segurança); E4.10 (devops-engineer): aviso na documentação da demo sobre a troca dos nomes ACELERATO_MYSQL_PORTA/BANCO/USUARIO/SENHA para _PORT/_DATABASE/_USER/_PASSWORD; E4.11 (tech-lead): PR de cada branch (a da correção e a do aviso de documentação). E4.12 (tech-lead): com o dono, a release da correção.
- E5.1 (tech-lead): PR do Lote 7 pelo pedido 077.
- E6.1 (dono): mesclar na main, rodar a primeira coleta pelo comando da demo e devolver a saída da consulta de prova; depois, a segunda release e a demo final.
- E6.2 (agile-coach): retrospectiva curta.

## Fora do escopo
- Configuração das ferramentas por pessoas (WS1 e WS4: limite de WIP, campos do quadro e do chamado, SLE, prazos de SLA, feriados); a demo mostra esses itens como "sem dado real" · `confirmado`
- Merge na main (do dono) · `confirmado`
- Agente lendo o `.env` ou rodando contra a base real (a sessão nega; o dono roda o comando) · `técnico`

## Suposições
- O dono roda a demo na máquina dele ou na VM, com o `.env` dele, a partir da main. Base: a sessão negou a leitura do `.env` em 2026-11-10 e o CLAUDE.md guarda as credenciais só no `.env`. Muda com: o dono liberar a leitura do `.env` para o time. Custo de reverter: baixo.

## Perguntas na fila

## Histórico
- 2026-11-10 12:45: DONO (literal): "quero que voce termine tudo para operacionais, acelerato e apontamentos e com isso na main suba uma demo com dados reais para eu testar. Mas so quando acabar tudo". Recibo (Jarvis): vou fazer: fechar o que é do time nos três painéis (Lote 7, release, 6b, 9a e 9b do 075 depois da primeira coleta, K-215, K-244, K-213) e um comando único da demo que o dono roda com o `.env` dele; não vou fazer: o que depende de pessoas da WS1 e WS4 nem o merge na main. DECISÃO DO DONO (2026-11-10 12:45): recibo confirmado: "isso".
- 2026-11-10 12:45: DECISÃO TÉCNICA (Jarvis): em paralelo agora: E4.1 (devops-engineer, worktree 056d, branch nova feature/087-demo-dado-real a partir da develop atual) e E3.3 (software-architect, só leitura); E3.1 e E3.2 entram quando o react-frontend e o node-backend liberarem.
- 2026-11-10 12:49: DECISÃO DO DONO (2026-11-10 12:45): recibo confirmado: "isso"
- 2026-11-10 12:49: brief selado docs/briefs/087-paineis-dado-real-e-demo-devops-engineer-2.md 2f3933a63d5fefc35579a7b8816d8159618ce4b1d7d4166ba0231b726dc543a1
- 2026-11-10 12:56: Entrega E4.1 (devops-engineer-2) conferida pelo conferente (cumpriu; PQ-2 rodado pelo Jarvis: bash -n rc=0). O forge-check entrega acusou só forma do brief: Base-sha do cabeçalho 7a44f941 (a develop andou com o PR 281 depois do gerar) fora da branch, e package.json e scripts/demo-dado-real.test.sh não nomeados no Entregar (o atalho e o teste pedidos no texto). DECISÃO TÉCNICA (Jarvis): o brief devops-engineer-3 é o -2 gerado de novo (Base-sha da branch) com esses dois arquivos nomeados; não é delegado: a entrega 1e4a8ba8 é conferida contra ele. O parecer de UX do 080 (docs/ux/080-revisao-leia-junto.md), não rastreado na 056d desde 2026-11-07, foi copiado para a cópia principal (branch do Jarvis) e tirado da worktree.
- 2026-11-10 12:56: brief selado docs/briefs/087-paineis-dado-real-e-demo-devops-engineer-3.md ca017659350be2c8bc23153f08202ebafd12d69dfdef1ce761b165101dab27a7
- 2026-11-10 12:56: brief selado docs/briefs/087-paineis-dado-real-e-demo-devops-engineer-4.md b7b82e598f74a1c70ca274a27a4fc218665a09e5db52057f0670f62e690f645d
- 2026-11-10 12:56: entrega conferida 1e4a8ba8a55c0fa0d57dcc7844dee5e478695dd8
- 2026-11-10 12:59: brief selado docs/briefs/087-paineis-dado-real-e-demo-security-engineer-1.md 874c9d866331ca440d518c05f05ff5095b40ce1bc127ba49e2d7ba3b05bdfc69
- 2026-11-10 13:00: brief selado docs/briefs/087-paineis-dado-real-e-demo-tech-lead-1.md a01d871be53a47d318a05db90c2bbdd497c92c4dce472e17bf2476320d693133
- 2026-11-10 13:05: brief selado docs/briefs/087-paineis-dado-real-e-demo-devops-engineer-5.md 4e33c8f1674c4bfc1065a743f488543f77901031658c8d77196a002f9b6a23d2
- 2026-11-10 13:07: Brief devops-engineer-5 (correção A1/A2: senha fora da linha de comando do script da demo) conferido (aprovado) e selado; delegado ao devops-engineer. Depois: review e segurança incrementais da correção, QA simulado (E4.3) e PR (E4.5).
- 2026-11-10 13:09: brief selado docs/briefs/087-paineis-dado-real-e-demo-software-architect-1.md 232b35651c3624a45da6f2ff5c85eee5718856cf6cd384f3644de39fed565f53
- 2026-11-10 13:11: DECISÃO TÉCNICA (Jarvis), E3.1 (K-215): se a API não devolver o recorte, a tela mantém o texto do recorte de hoje (sem mudança de comportamento); a decisão 2-A é do 077 e não se aplica aqui. Cartões dos commits: K-215 no E3.1 e K-244 no E3.2.
- 2026-11-10 13:12: E3.3 (K-213) entregue pelo software-architect: docs/analises/087-k213-qualidade-apontamento.md (sem commit; test -s rc=0). Leitura: nenhum bug de cálculo no M7; 40% "não classificado" = apontamento sem comentário que nenhuma regra por tipo capturou (inclui os 8,3% sem tipo); 95,8% inflado porque sem-vinculo também cobre execucao-tecnica. PERGUNTA: D1 (o campo comment vem preenchido na API?), D2 (execucao-tecnica deve contar como flag de qualidade? recomendação: não, com mudança de critério registrada pela T2.6) e D3 (rótulo "Não classificado" ou "Sem comentário"), vão ao dono em lote. Achado: a análise 064 cita o limite de atípico como 16 h; o código vigente é 10 h (pedido 067).
- 2026-11-10 13:12: brief selado docs/briefs/087-paineis-dado-real-e-demo-security-engineer-2.md eeccef39f2fb7ce8ce846e3fe540e41d4a90c37e3b1a15a48f3ee8ab6297756e
- 2026-11-10 13:13: brief selado docs/briefs/087-paineis-dado-real-e-demo-tech-lead-2.md b3246bcfd8392b0a09a68acff428ff122744f26cb405e548b0c04c260c2468f4
- 2026-11-10 13:13: brief selado docs/briefs/087-paineis-dado-real-e-demo-react-frontend-1.md 8e1b205b1bc88fbb3eefd2ee2b7e1718a3f3aa759ae08007617b9b40db197fd5
- 2026-11-10 13:13: brief selado docs/briefs/087-paineis-dado-real-e-demo-node-backend-1.md f840f3303399b7d72f556ea6a156a07c2557318694aaf019d61c98edb3a8c5ad
- 2026-11-10 13:18: entrega conferida dc7e2756625dd489c2ff18e1511a62feddafdad2
- 2026-11-10 13:19: brief selado docs/briefs/087-paineis-dado-real-e-demo-qa-engineer-1.md 36062abba3073b8943ea587307b6b729b9bcdcefbc2b73819607c66149b69482
- 2026-11-10 13:22: QA da demo (E4.3) reprovado com 1 bug médio bloqueante (A1/BUG-087-1): a chamada documentada `pnpm run demo:dado-real -- --reconhecer-mudanca` entrega o `--` ao script, que o recusa (rc 2). Volta ao devops-engineer (devops-engineer-6); depois review, segurança e QA incrementais. Simulação do resto do roteiro sem achados; o que só se vê com a base real fica para a primeira execução do dono.
- 2026-11-10 13:23: brief selado docs/briefs/087-paineis-dado-real-e-demo-devops-engineer-6.md d9ca792accca667662d22a81abd98325020e7918767fd5edc5c39d5980bd7210
- 2026-11-10 13:23: entrega conferida b98021961ea5bff74e452a3aee831cdc7cc53939
- 2026-11-10 13:24: DECISÃO TÉCNICA (Jarvis): etapas E3.4 (review), E3.5 (QA) e E3.6 (PR) acrescentadas às Etapas para K-215 e K-244 (CLAUDE.md: todo desenvolvimento passa por code review e QA; forge-check classe deu N para o K-244). K-244 entregue (b9802196) e conferido.
- 2026-11-10 13:26: entrega conferida 9fc2ac6a9cb429a1cdadbec8e3fc074c8d1aeeaa
- 2026-11-10 13:27: brief selado docs/briefs/087-paineis-dado-real-e-demo-tech-lead-3.md e174e82c1d31b5456479771ffec0bd2101e9aa2f9c0fd33f80856b719ce257c6
- 2026-11-10 13:29: brief selado docs/briefs/087-paineis-dado-real-e-demo-qa-engineer-2.md 19a2713b009f27a9006df062b247e45c2db9f5c3b342aeebf7be4ce30fbb7282
- 2026-11-10 13:31: brief selado docs/briefs/087-paineis-dado-real-e-demo-qa-engineer-3.md 734b7d5f5a2779723674f10fb434946a7502be2a3924bd7e0cbbc8c10713d0aa
- 2026-11-10 13:32: brief selado docs/briefs/087-paineis-dado-real-e-demo-security-engineer-3.md 9030545d5ff654356e19594752c81d3767061c486ca1b736ea931baa51a12fcd
- 2026-11-10 13:33: brief selado docs/briefs/087-paineis-dado-real-e-demo-tech-lead-4.md f9bfe10606c29eb459751cfa912b8a7055fe56a21d8632e97d7b2b6dadf8325e
- 2026-11-10 13:34: brief selado docs/briefs/087-paineis-dado-real-e-demo-tech-lead-5.md 8c0dc73256cefc11ce24853491118211652ea879f593fdaebff7beb905c4a2f0
- 2026-11-10 13:36: Demo (E4): BUG-087-1 corrigido (d98db2b2, 9fc2ac6a; entrega conferida); review (bd251b53), segurança (5f103281) e QA (0e206636) aprovados sobre 9fc2ac6a; forge-check pr aprovado (classe C, head 0e206636). Brief do PR (tech-lead-6, E4.5) no conferente.
- 2026-11-10 13:36: K-244 (E3.2): review (1f36a4ff) e QA (0f252f4f) aprovados sobre b9802196; forge-check pr aprovado; PR (tech-lead-5, E3.6) delegado.
- 2026-11-10 13:37: brief selado docs/briefs/087-paineis-dado-real-e-demo-tech-lead-6.md ce01df7ab8943fa1dff73a80c7ef8383ee60bed9d9ee8a6331e7dabe16e2cf04
- 2026-11-10 13:42: K-215 (E3.1) entregue em parte pelo react-frontend (5e051a37 na feature/087-k215-recorte-sust, pronto verde): só as equipes do recorte vêm da API (opcoesFiltro acelerato), e essas equipes vêm de uma constante do back-end, não do ref_dominio; organização e tipo seguem fixos porque a API não os expõe. DECISÃO TÉCNICA (Jarvis): sem ganho real hoje (o texto visível não muda e o risco L8 continua), o K-215 sai do fechamento do 087; a branch fica no remoto, sem review, QA nem PR; o cartão K-215 volta à fila com a necessidade de contrato do back-end (organização, tipo e equipes vigentes do ref_dominio na referência ou em OpcoesFiltroSustentacao). E3.4 a E3.6 ficam só para o K-244.
- 2026-11-10 13:57: E4.5: PR 284 (feature/087-demo-dado-real -> develop) aberto, CI verde, head 0e206636; mergeStateStatus BEHIND (1 commit atrás da develop). Merge recusado 2 vezes pelo hook R-REVIEW por prazo de 3 s (K-250), sem contorno. Vai ao dono junto com o PR 282 (mesma PERGUNTA: merge pelo terminal dele).
- 2026-11-10 17:23: Pela decisão "A" do dono: PR 286 (docs/078-release-b -> develop), PR 287 (develop -> homolog; portão da homolog verde, homolog-aprovada verde) e PR 288 (homolog -> main) mesclados pelo dono; a release 078 está na main desde 2026-11-10 16:44 (19:44 UTC). E1.4, E1.5 e E1.6 cumpridas. Falta E1.7 (retrospectiva). Pedido 087: a demo está na main; o dono roda pnpm run demo:dado-real (E6.1) e devolve os três números da prova.
- 2026-11-10 17:43: ERRO-JARVIS: o passo a passo da demo mandou o dono rodar git switch main na pasta principal do projeto, que é a cópia de trabalho do Jarvis (branch docs/jarvis-2026-10-23); as linhas do Histórico de 17:23 caíram em arquivos soltos na main e foram refeitas aqui. A branch do Jarvis passou para a worktree 052g até a demo acabar; nada se perdeu. Para a próxima: a demo roda numa pasta própria (worktree da main).
- 2026-11-10 20:06: Primeira execução da demo pelo dono (main 00494c09, worktree própria, com apoio de outra sessão do Claude): etapas 1 a 5 ok (BusinessMap carregado); etapa 6 (Acelerato) pediu --reconhecer-mudanca (esperado depois do L9-c) e, com ela, parou com {"codigo":"dados-invalidos","entidade":"campo_etapa","coluna":"nome"}. Causa provável (não confirmada contra o MySQL): a Q6 e a Q7 (server/src/modulos/acelerato/sql.ts) filtram o nome do campo pela collation da conexão, que ignora maiúscula, acento e espaço no fim, e o allow-list.ts valida o nome com z.enum exato. Também: o .env do dono usava os nomes antigos ACELERATO_MYSQL_PORTA/BANCO/USUARIO/SENHA. BUG-087-2 aberto. DECISÃO TÉCNICA (Jarvis): correção pela opção B (canonizar no TS com contagem da variante; desconhecido falha fechado), etapas E4.6 a E4.11 acrescentadas; mudar a Q6/Q7 não é preciso. A próxima coleta do dono repete com --reconhecer-mudanca se o sql_sha256 mudar.
- 2026-11-10 20:21: brief selado docs/briefs/087-paineis-dado-real-e-demo-node-backend-2.md 6997dc6ecaf95e47e80be5dbfb523bfc978350e1e2643c8f2643c3bc6ae9b933
- 2026-11-10 20:22: DECISÃO TÉCNICA (Jarvis): a E4.10 fica só na documentação da demo; o exemplo de configuração (`.env*.example`) sai dela, porque agente não abre nem edita arquivos `.env*` (sandbox e CLAUDE.md); se o dono quiser o aviso também lá, a edição é dele. Brief devops-engineer-7 reprovado na rodada 1 por isso e refeito.
- 2026-11-10 20:24: brief selado docs/briefs/087-paineis-dado-real-e-demo-devops-engineer-7.md d9a7f012a3f078ca8f41fe6bd04b8eb76aabf7ce80fbf2db24c98854dedef8a0
- 2026-11-10 20:25: entrega conferida 858b98b99d3384eda721ed4fb60598358036045e
- 2026-11-10 20:27: brief selado docs/briefs/087-paineis-dado-real-e-demo-tech-lead-7.md 7d688d88dc0699b472c794d5dd1441e0e1a027482c55511ab41a9a9bc6cf5e2e
- 2026-11-10 20:36: DECISÃO TÉCNICA (Jarvis): a E4.11 passa a ser o PR de cada branch (correção do BUG-087-2 e aviso de documentação) e a release da correção vira E4.12, para cada delegação cobrir uma etapa inteira; brief tech-lead-8 reprovado por isso e refeito como tech-lead-9.
- 2026-11-10 20:38: brief selado docs/briefs/087-paineis-dado-real-e-demo-tech-lead-9.md c3561243ea5f35b5bf6f5d63c784392104d012743bd8b771f8437239aa0cb711
- 2026-11-10 20:38: entrega conferida 6dd8b6824536132fd82b64888d28b293f311a75f
- 2026-11-10 20:40: brief selado docs/briefs/087-paineis-dado-real-e-demo-security-engineer-4.md 920200c25d57801e2dcee0a4eec5992bf54cac579c4495ece221f74cc6fc5315
- 2026-11-10 20:40: brief selado docs/briefs/087-paineis-dado-real-e-demo-qa-engineer-4.md a6450eb1513b1624682d178b8ea6b305e6fb7837c108a249c2c0eaa7f5411e3b
- 2026-11-10 20:40: brief selado docs/briefs/087-paineis-dado-real-e-demo-tech-lead-10.md 411cc697e6583349b64901016d911ffb254c038ac28d46ba3ffde1824370be54
- 2026-11-10 20:44: brief selado docs/briefs/087-paineis-dado-real-e-demo-tech-lead-11.md baae18587594d199c12c55edd1333d7c8119140ffd706dd8762a4d8a1e5b6cc8
- 2026-11-10 21:16: BUG-087-2: correção 6dd8b682 com review (05b6eb8b), segurança (feedf0b6) e QA (c26e5630) aprovados; PR 290 aberto, CI verde. Aviso de nomes na doc da demo: 858b98b9 com review (bfef7375); PR 289 aberto, CI verde. Merges dos dois e a promoção até a main ficam com o dono (hook R-REVIEW por prazo), comandos enviados; depois o dono roda a demo de novo com --reconhecer-mudanca.
