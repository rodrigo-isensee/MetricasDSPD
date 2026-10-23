Agente destino: forge:ux-designer
Pedido: docs/pedidos/025-front-do-011-lote2.md
Tipo: codigo
Branch: docs/jarvis-2026-10-23   Base: develop   Base-sha: ae009a75d4383c3d6c9a8ba4851f9b5b2ba5dbb8

## Objetivo
Alinhar a ficha da T14 à tela que já está na main (etapa E1.8 do pedido 025, cartão K-139): com "outros times" oculto, a tela mostra só "Meu time: k", sem barra e sem "Sem time informado", e a ficha ainda prevê os dois. O dono decidiu ajustar a ficha (T14-1 = A), sem mudar a tela. Repositório principal `/home/rodrigoisensee/Metricas/MetricasDSPD`, branch `docs/jarvis-2026-10-23`. Você não tem Bash: grave com Edit e não commite; o commit vai depois, por outra delegação.

## Ler
- `docs/ux/revisao-025-front-taticas.md`, o achado T14-1 (linha 41).
- `docs/ux/metricas-tambem-disponiveis/02-especificacao.md`: §3 item 8 (linha 23), §5 T14 (linhas 202 a 230), CA-27 e CA-45 (linhas 341 e 361) e a tabela de decisões (linhas 375 a 377).

## Entregar
- (E3) Em `docs/ux/metricas-tambem-disponiveis/02-especificacao.md`, §5 T14, item "Outros times oculto": a linha do projeto oculto mostra só o texto "Meu time: k" (k demandas do meu time), sem barra, sem "Sem time informado", sem total exato, sem "k de n" e sem percentual; CA-45 com o mesmo texto (barra, tabela alternativa e exportação).
- (E3) Na tabela de decisões da especificação, uma linha "T14-1 = A | 2026-10-23 | ficha da T14 alinhada à tela: projeto oculto mostra só 'Meu time: k' (§5 T14, CA-45)".
- (E3) Em `docs/ux/revisao-025-front-taticas.md`, o achado T14-1 recebe a linha "Resolvido em 2026-10-23: T14-1 = A, ficha ajustada (K-139)".
- (E3) Gravar só com Edit; nada de mudar a tela nem outro cartão.
- (E2, E4) Regra R-1 = B da T14 e B11-001 do T10: não nesta delegação; já entregues na main (release #144), e a ficha deles não muda.

## Fora do escopo
- "R.1 (forge:agile-coach): retrospectiva do pedido 025." · etapa de outro papel.
- "E1.1 (forge:react-frontend): front do lote 2 (T10 a T14), com testes de unidade e o `pnpm run pronto` verde.", "E1.6 (forge:ux-designer): revisão da interface implementada contra a especificação." e "E1.7 (forge:tech-lead): PR para a develop (squash) e merge; limpeza da branch." · etapas cumpridas.
- Mudar código ou a tela; T14-2 e T13-1 da revisão; commit; push; o quadro e o arquivo do pedido.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-23): "Faca suas recomendacoes": T14-1 = A, ajustar a ficha da T14 ao que a tela mostra (só "Meu time: k" com o projeto oculto), sem mudar a tela. Cartão K-139 (ux-designer).
- DECISÃO DO DONO (2026-10-17): T14-M1 = B ("D1 - B"): quando "outros times" estiver oculto, a T14 mostra só a fatia do meu time, sem o total exato do projeto (pedido 011, linha 135).
- DECISÃO DO DONO (2026-10-16): R-1 = B: na T14, "outros times" fica oculto quando somar menos de 2 pessoas (pedido 011, linha 82).
- DECISÃO DO DONO (2026-10-20): recibo do pedido 025 aceito ("sim"), com a leitura de "sem o total exato do projeto" = não mostrar o total.
- DECISÃO DO DONO (2026-10-17): B11-001 = sim ("3 -sim"): o nome do fornecedor no T10 ignora maiúsculas, minúsculas e espaços (pedido 011, linha 130).
- DECISÃO DO DONO (2026-10-20): ordem das pendências: "veja se tem algo das metricas estrategicas pendentes se tem comece por ele, senao va para taticas e por ultimo operacional. Depois de tudo isso faremos as integracoes oficiais funcionar."
- DECISÃO DO DONO (2026-10-21): D1, opção A ("A se d1 foi feito e vai subir certo"): o D1 deixa de ser pendência; no 037 aparece como W037-001, encontrado e corrigido na entrega, e no 025 como não se aplica; condição: a correção sobe certa (check `e2e` do PR do 037 verde); o K-131 fecha depois do merge. D2 continua pendência (K-132).
- DECISÃO DO DONO (2026-10-21): defeitos baixos do QA do 025, opção A ("A"): corrigir agora L2T-001 (T13 em Frentes: "Amostra insuficiente: 147 de 20 itens mínimos") e L2T-002 (T14: "Meu time: 1 demandas"); L2T-003 (CLS de 0,073 a 0,100 em /tatico com equipe na API, herdado) segue como pendência listada no PR, em cartão próprio.
- DECISÃO DO DONO (2026-10-21): defeitos D1 (média: 100 E2E defasados na develop, K-131) e D2 (baixa: 9 E2E instáveis com 8 workers, K-132), já existentes na develop, opção A ("A"): acompanham as entregas do 037 e do 025 como pendências listadas no PR e são corrigidos depois nos cartões K-131 e K-132 (R-QA).
- DECISÃO DO DONO (2026-10-21): comando de pronto, opção A ("A"): durante o desenvolvimento só os testes e o typecheck do pacote alterado; `pnpm run pronto` completo uma vez, antes do commit final. Vale para as próximas delegações deste projeto; a regra geral vai ao Forge (F3 do prompt de melhorias).
- Nenhuma métrica para avaliação individual; nenhum outro time nomeado (regras invioláveis, CLAUDE.md).

## Pronto quando
- PQ-1 (cmd): `grep -c 'T14-1 = A' /home/rodrigoisensee/Metricas/MetricasDSPD/docs/ux/metricas-tambem-disponiveis/02-especificacao.md` · espera: rc=0
- PQ-2 (cmd): `grep -c 'Resolvido em 2026-10-23' /home/rodrigoisensee/Metricas/MetricasDSPD/docs/ux/revisao-025-front-taticas.md` · espera: rc=0
- PQ-3 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD status --porcelain -- docs/ux` · espera: linhas=2

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
