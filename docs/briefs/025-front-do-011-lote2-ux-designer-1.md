Agente destino: forge:ux-designer
Pedido: docs/pedidos/025-front-do-011-lote2.md
Branch: feature/025-front-taticas   Base: develop   Base-sha: 568ea481bde436e220d23e99142aa2bfe4718e76

## Objetivo
Revisão de UX da interface implementada no pedido 025 (lote 2 em /tatico: T10, T11, T12, T13 e T14), contra a especificação validada, antes do PR. Etapa E1.6 (passo 5 do fluxo do `CLAUDE.md`), cartão K-110. Worktree `/home/rodrigoisensee/MetricasDSPD-025`, branch `feature/025-front-taticas` (head 1062b91; o código de interface é o de 5108fcd, que corrigiu L2T-001 e L2T-002).

## Ler
- `/home/rodrigoisensee/MetricasDSPD-025/docs/ux/metricas-tambem-disponiveis/02-especificacao.md`: §3 (regras transversais), fichas T10 a T14 (linhas 154 a ~230) e §11.
- `/home/rodrigoisensee/MetricasDSPD-025/web/src/features/complementares/taticas.tsx` e `CartaoComplementar.tsx` (textos, estados vazio, insuficiente e oculto).
- `/home/rodrigoisensee/MetricasDSPD-025/docs/qa/025-front-taticas.md`: seções de verificação da T13 e da T14 e os bugs L2T-001 e L2T-002 (corrigidos).
- Modelo: `/home/rodrigoisensee/MetricasDSPD/docs/ux/revisao-011-front-estrategicas.md`.

## Entregar
- (E1) Revisão em `/home/rodrigoisensee/MetricasDSPD-025/docs/ux/revisao-025-front-taticas.md`, no formato do modelo: para cada um de T10 a T14, o texto, os estados (sem dado, amostra abaixo de 20, oculto) e a hierarquia batem com a ficha da especificação; achados (bloqueante, recomendado ou nenhum) e parecer. Sem commit e sem push: você não tem Bash; o tech-lead commita o arquivo no PR (E1.7).
- (E2, E3) Conferir na tela da T14 que "outros times" some com menos de 2 pessoas e que, oculto, não aparece o total exato do projeto (só "meu time: k").
- (E4) Conferir que o T10 mostra o nome do fornecedor como vem da API.

## Fora do escopo
- "E1.7 (forge:tech-lead): PR para a develop (squash) e merge; limpeza da branch." · etapa de outro papel, depois desta.
- "E1.3 (forge:tech-lead): code review." · etapa de outro papel, em andamento (review incremental de 7807199, só E2E).
- "E1.5 (forge:qa-engineer): QA e parecer." · etapa de outro papel, cumprida (1062b91).
- "E1.1 (forge:react-frontend): front do lote 2 (T10 a T14), com testes de unidade e o `pnpm run pronto` verde.", "E1.2 (forge:qa-engineer): plano de testes e E2E do lote 2 a partir da especificação, em paralelo com o E1.1." e "E1.4 (forge:security-engineer): review de segurança da tela da T14 (reidentificação: R-1 = B e T14-M1 = B na exibição), em paralelo com o E1.3." · etapas cumpridas.
- Editar código, especificação ou outros documentos; o quadro; PR.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-21): D1, opção A ("A se d1 foi feito e vai subir certo"): o D1 deixa de ser pendência; no 037 aparece como W037-001, encontrado e corrigido na entrega, e no 025 como não se aplica; condição: a correção sobe certa (check `e2e` do PR do 037 verde); o K-131 fecha depois do merge. D2 continua pendência (K-132).
- DECISÃO DO DONO (2026-10-21): defeitos D1 (média: 100 E2E defasados na develop, K-131) e D2 (baixa: 9 E2E instáveis com 8 workers, K-132), já existentes na develop, opção A ("A"): acompanham as entregas do 037 e do 025 como pendências listadas no PR e são corrigidos depois nos cartões K-131 e K-132 (R-QA).
- Para o D1 vale a decisão mais recente (2026-10-21, "A se d1 foi feito e vai subir certo"), que substitui a anterior só no D1: no 025 o D1 não se aplica e não entra como pendência, com a condição da decisão (check `e2e` do PR do 037 verde) atendida na run 39699610730; o D2 continua pendência. Nenhum dos dois é de interface.
- DECISÃO DO DONO (2026-10-21): defeitos baixos do QA do 025, opção A ("A"): corrigir agora L2T-001 (T13 em Frentes: "Amostra insuficiente: 147 de 20 itens mínimos") e L2T-002 (T14: "Meu time: 1 demandas"); L2T-003 (CLS de 0,073 a 0,100 em /tatico com equipe na API, herdado) segue como pendência listada no PR, em cartão próprio.
- DECISÃO DO DONO (2026-10-21): comando de pronto, opção A ("A"): durante o desenvolvimento só os testes e o typecheck do pacote alterado; `pnpm run pronto` completo uma vez, antes do commit final. Vale para as próximas delegações deste projeto; a regra geral vai ao Forge (F3 do prompt de melhorias).
- DECISÃO DO DONO (2026-10-20): ordem das pendências: "veja se tem algo das metricas estrategicas pendentes se tem comece por ele, senao va para taticas e por ultimo operacional. Depois de tudo isso faremos as integracoes oficiais funcionar."
- DECISÃO DO DONO (2026-10-20): recibo do pedido 025 aceito ("sim"), com a leitura de "sem o total exato do projeto" = não mostrar o total.
- DECISÃO DO DONO (2026-10-16): R-1 = B: na T14, "outros times" fica oculto quando somar menos de 2 pessoas (pedido 011, linha 82).
- DECISÃO DO DONO (2026-10-17): T14-M1 = B ("D1 - B"): quando "outros times" estiver oculto, a T14 mostra só a fatia do meu time, sem o total exato do projeto (pedido 011, linha 135).
- DECISÃO DO DONO (2026-10-17): B11-001 = sim ("3 -sim"): o nome do fornecedor no T10 ignora maiúsculas, minúsculas e espaços (pedido 011, linha 130).
- Regras invioláveis do `CLAUDE.md`: nenhuma métrica para avaliação individual nem comparação entre times (a T14 não nomeia nem ranqueia outros times); abaixo de 20 itens não publicar estatística.

## Pronto quando
- PQ-1 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD-025/docs/ux/revisao-025-front-taticas.md`

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
