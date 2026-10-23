Agente destino: forge:agile-coach
Pedido: 025-front-do-011-lote2
Tipo: volta
Branch: docs/jarvis-2026-10-23   Base: develop   Base-sha: ae009a75d4383c3d6c9a8ba4851f9b5b2ba5dbb8
Volta-de: docs/briefs/025-front-do-011-lote2-agile-coach-2.md sha256 ce35ec672d046a0891ddf7923fcab6b0f0849b5535d13b7f8822a5512d035edd

## Objetivo
Retrospectiva do pedido 025 (front das táticas T10 a T14), etapa R.1, cartão K-110. O pedido saiu na release #144 (main, 2026-10-23 17:28Z) depois de defeitos no QA (L2T-001 a L2T-003), de um review de segurança incremental (E1.4b) e da troca de computador no meio. O time precisa saber o que custou tempo e o que vira melhoria. Repositório principal `/home/rodrigoisensee/Metricas/MetricasDSPD`, branch `docs/jarvis-2026-10-23` (do Jarvis); não troque de branch. Outros agentes podem commitar nesta branch ao mesmo tempo: se o `git commit` acusar `index.lock`, espere alguns segundos e tente de novo.

## Ler
- `docs/pedidos/025-front-do-011-lote2.md` inteiro.
- `docs/kanban/historico.md`, linhas do K-110 e do K-139.
- `docs/kanban/conferencias.md`, linhas do 025.
- `docs/retrospectivas/2026-10-22-040-banco-local.md`, só como modelo de forma.

## Entregar (volta 2)
- Escopo da entrega original, já conferido e inalterado; esta volta só corrige os achados abaixo (E1, E2, E3, E4).
- (E1) Achado da conferência de entrega de 2026-10-23 20:29 (decisões, `tardio`): em `docs/retrospectivas/2026-10-23-025-taticas-lote2.md`, as tabelas de rodadas e reprovações (linhas 37 a 47) ficam agregadas por classe de causa, sem nomear brief por instância de agente (tech-lead-4, tech-lead-6, qa-engineer-7 e afins) e sem atribuir defeito a um papel; a evidência cita o arquivo e a data (`conferencias.md`, 2026-10-21 19:37) em vez do nome do brief. O mesmo nas linhas 24, 31, 33, 48, 62 e 70 e em qualquer outro ponto do arquivo: nenhuma instância de agente (papel seguido de número, como react-frontend-2, agile-coach-1 ou security-engineer-2) fica no texto.
- (E1) As 7 linhas `MELHORIA:` continuam 7, com o mesmo problema, a mesma medida e a mesma classe; só a evidência é reescrita sem nome de instância de agente (data e arquivo). Esta volta substitui, para esse ponto, o "As 7 linhas `MELHORIA:` não mudam" da volta anterior.
- (E1) Gravar só com Write ou Edit; um commit só da retrospectiva, `git add` explícito por caminho, linha `Cartão: K-110`; sem push.

## Fora do escopo
- "E1.8 (forge:ux-designer): ajustar a ficha da T14 na especificação ao que a tela mostra (só "Meu time: k" com o projeto oculto), sem mudar a tela, pela decisão T14-1 = A (K-139)." · etapa de outro papel.
- "E1.1 (forge:react-frontend): front do lote 2 (T10 a T14), com testes de unidade e o `pnpm run pronto` verde.", "E1.2 (forge:qa-engineer): plano de testes e E2E do lote 2 a partir da especificação, em paralelo com o E1.1.", "E1.3 (forge:tech-lead): code review.", "E1.5 (forge:qa-engineer): QA e parecer.", "E1.6 (forge:ux-designer): revisão da interface implementada contra a especificação." e "E1.7 (forge:tech-lead): PR para a develop (squash) e merge; limpeza da branch." · etapas de outro papel, cumpridas.
- "E1.4 (forge:security-engineer): review de segurança da tela da T14 (reidentificação: R-1 = B e T14-M1 = B na exibição), em paralelo com o E1.3." e E1.4b (forge:security-engineer), o review incremental · etapas de outro papel, cumpridas.
- Implementar qualquer melhoria (vira cartão ou PR depois, pelo Jarvis); o quadro (`KANBAN.md` e `historico.md`); o arquivo do pedido; os pedidos 037 e 041; push.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-20): ordem das pendências: "veja se tem algo das metricas estrategicas pendentes se tem comece por ele, senao va para taticas e por ultimo operacional. Depois de tudo isso faremos as integracoes oficiais funcionar."
- DECISÃO DO DONO (2026-10-20): recibo do pedido 025 aceito ("sim"), com a leitura de "sem o total exato do projeto" = não mostrar o total.
- DECISÃO DO DONO (2026-10-16): R-1 = B: na T14, "outros times" fica oculto quando somar menos de 2 pessoas (pedido 011, linha 82).
- DECISÃO DO DONO (2026-10-17): T14-M1 = B ("D1 - B"): quando "outros times" estiver oculto, a T14 mostra só a fatia do meu time, sem o total exato do projeto (pedido 011, linha 135).
- DECISÃO DO DONO (2026-10-17): B11-001 = sim ("3 -sim"): o nome do fornecedor no T10 ignora maiúsculas, minúsculas e espaços (pedido 011, linha 130).
- DECISÃO DO DONO (2026-10-21): D1, opção A ("A se d1 foi feito e vai subir certo"): o D1 deixa de ser pendência; no 037 aparece como W037-001, encontrado e corrigido na entrega, e no 025 como não se aplica; condição: a correção sobe certa (check `e2e` do PR do 037 verde); o K-131 fecha depois do merge. D2 continua pendência (K-132).
- DECISÃO DO DONO (2026-10-21): defeitos baixos do QA do 025, opção A ("A"): corrigir agora L2T-001 (T13 em Frentes: "Amostra insuficiente: 147 de 20 itens mínimos") e L2T-002 (T14: "Meu time: 1 demandas"); L2T-003 (CLS de 0,073 a 0,100 em /tatico com equipe na API, herdado) segue como pendência listada no PR, em cartão próprio.
- DECISÃO DO DONO (2026-10-21): defeitos D1 (média: 100 E2E defasados na develop, K-131) e D2 (baixa: 9 E2E instáveis com 8 workers, K-132), já existentes na develop, opção A ("A"): acompanham as entregas do 037 e do 025 como pendências listadas no PR e são corrigidos depois nos cartões K-131 e K-132 (R-QA).
- DECISÃO DO DONO (2026-10-21): comando de pronto, opção A ("A"): durante o desenvolvimento só os testes e o typecheck do pacote alterado; `pnpm run pronto` completo uma vez, antes do commit final. Vale para as próximas delegações deste projeto; a regra geral vai ao Forge (F3 do prompt de melhorias).
- DECISÃO DO DONO (2026-10-23): "Faca suas recomendacoes": T14-1 = A, ajustar a ficha da T14 ao que a tela mostra (só "Meu time: k" com o projeto oculto), sem mudar a tela. Cartão K-139 (ux-designer).
- Métricas de processo, nunca de pessoa ou de agente individual (regra inviolável do projeto, CLAUDE.md).
- Erro recorrente deste destino (forge-check, 30 dias): decisao em 2 entregas · evita: grave a decisão no pedido antes do brief; o `brief gerar` copia as linhas de decisão do dono (R-BRIEF)
- Erro recorrente deste destino (forge-check, 30 dias): implementacao em 2 entregas · evita: rode a suíte inteira e cada prova antes do relatório (R-PROVA)

## Pronto quando
- PQ-1 (arquivo): `test -e /home/rodrigoisensee/Metricas/MetricasDSPD/docs/retrospectivas/2026-10-23-025-taticas-lote2.md`
- PQ-2 (cmd): `grep -c '^MELHORIA:' /home/rodrigoisensee/Metricas/MetricasDSPD/docs/retrospectivas/2026-10-23-025-taticas-lote2.md` · espera: rc=0
- PQ-3 (sha): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD log -1 --format=%H -- docs/retrospectivas/2026-10-23-025-taticas-lote2.md` · espera: o sha40 do commit da retrospectiva
- PQ-4 (cmd): `grep -cE '(tech-lead|qa-engineer|react-frontend|node-backend|ux-designer|security-engineer|devops-engineer|agile-coach|software-architect)-[0-9]' /home/rodrigoisensee/Metricas/MetricasDSPD/docs/retrospectivas/2026-10-23-025-taticas-lote2.md` · espera: igual '0'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
