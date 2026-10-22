Agente destino: forge:qa-engineer
Pedido: docs/pedidos/025-front-do-011-lote2.md
Branch: feature/025-front-taticas   Base: develop   Base-sha: 568ea481bde436e220d23e99142aa2bfe4718e76

## Objetivo
Alinhar o parecer de QA do 025 à decisão do dono sobre o D1 (achado da conferência de entrega de 2026-10-22: `docs/qa/025-front-taticas.md` linhas 110 e 122 ainda põem o D1 como pendência do PR) e resolver os 61 PNGs de evidência alterados sem commit na worktree. Etapa E1.5 (parecer) do pedido 025, cartão K-110. Worktree `/home/rodrigoisensee/MetricasDSPD-025`, branch `feature/025-front-taticas` (head d8f1c51). O `forge:tech-lead` faz ao mesmo tempo o review incremental na mesma worktree, só em `docs/reviews/025-front-taticas.md`.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-025/docs/qa/025-front-taticas.md`, frontmatter e seções "Já existentes na `develop`", "Decisões do dono (2026-10-21)" e "Parecer".
- `git -C /home/rodrigoisensee/MetricasDSPD-025 status --short -- docs/qa/evidencias/`.

## Entregar
- (E1) No parecer `docs/qa/025-front-taticas.md`: o D1 sai das pendências do PR e passa a constar como "não se aplica ao 025" (no 037 ele virou o W037-001, encontrado e corrigido; o check `e2e` do PR #137 passou na run 39699610730), na lista da linha 110 e no item 3 da linha 122; o D2 (K-132) e o L2T-003 (K-133) continuam pendências; frontmatter continua `commit: 7807199` e o veredito não muda; gravar com a ferramenta Write ou Edit, nunca por Bash, para o hook registrar a autoria; validar com o `forge-check docs`.
- (E1) Os 61 PNGs de `docs/qa/evidencias/` alterados pelas execuções: se o parecer não cita nenhum deles como evidência nova desta entrega, descartar as alterações com `git restore` por caminho; se cita, commitá-los no mesmo commit do parecer; relatar qual dos dois.
- (E2, E3, E4) Sem mudança: as conclusões de R-1 = B, T14-M1 = B e B11-001 no parecer continuam como em d8f1c51.
- (E1) Um commit do parecer (e dos PNGs, se for o caso), com `git add` explícito por caminho, mensagem conforme a seção de commits do `docs/engineering/praticas.md` e a linha `Cartão: K-110`; sem push (o envio da branch é do tech-lead, no E1.7).

## Fora do escopo
- "E1.3 (forge:tech-lead): code review." · etapa de outro papel, em paralelo (review incremental de 7807199).
- "E1.6 (forge:ux-designer): revisão da interface implementada contra a especificação." e "E1.7 (forge:tech-lead): PR para a develop (squash) e merge; limpeza da branch." · etapas de outro papel, depois desta.
- "E1.1 (forge:react-frontend): front do lote 2 (T10 a T14), com testes de unidade e o `pnpm run pronto` verde.", "E1.2 (forge:qa-engineer): plano de testes e E2E do lote 2 a partir da especificação, em paralelo com o E1.1." e "E1.4 (forge:security-engineer): review de segurança da tela da T14 (reidentificação: R-1 = B e T14-M1 = B na exibição), em paralelo com o E1.3." · etapas cumpridas.
- Rodar testes de novo (o código não muda nesta entrega; o `pronto` já rodou com rc=0 em 7807199); mudar código, spec ou o parecer de review; o quadro; push; PR.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-21): D1, opção A ("A se d1 foi feito e vai subir certo"): o D1 deixa de ser pendência; no 037 aparece como W037-001, encontrado e corrigido na entrega, e no 025 como não se aplica; condição: a correção sobe certa (check `e2e` do PR do 037 verde); o K-131 fecha depois do merge. D2 continua pendência (K-132).
- DECISÃO DO DONO (2026-10-21): defeitos D1 (média: 100 E2E defasados na develop, K-131) e D2 (baixa: 9 E2E instáveis com 8 workers, K-132), já existentes na develop, opção A ("A"): acompanham as entregas do 037 e do 025 como pendências listadas no PR e são corrigidos depois nos cartões K-131 e K-132 (R-QA).
- Para o D1 vale a decisão mais recente (2026-10-21, "A se d1 foi feito e vai subir certo"), que substitui a anterior só no D1: no 025 o D1 não se aplica e não entra como pendência; o D2 continua pendência.
- DECISÃO DO DONO (2026-10-21): defeitos baixos do QA do 025, opção A ("A"): corrigir agora L2T-001 (T13 em Frentes: "Amostra insuficiente: 147 de 20 itens mínimos") e L2T-002 (T14: "Meu time: 1 demandas"); L2T-003 (CLS de 0,073 a 0,100 em /tatico com equipe na API, herdado) segue como pendência listada no PR, em cartão próprio.
- DECISÃO DO DONO (2026-10-21): comando de pronto, opção A ("A"): durante o desenvolvimento só os testes e o typecheck do pacote alterado; `pnpm run pronto` completo uma vez, antes do commit final. Vale para as próximas delegações deste projeto; a regra geral vai ao Forge (F3 do prompt de melhorias).
- DECISÃO DO DONO (2026-10-20): ordem das pendências: "veja se tem algo das metricas estrategicas pendentes se tem comece por ele, senao va para taticas e por ultimo operacional. Depois de tudo isso faremos as integracoes oficiais funcionar."
- DECISÃO DO DONO (2026-10-20): recibo do pedido 025 aceito ("sim"), com a leitura de "sem o total exato do projeto" = não mostrar o total.
- DECISÃO DO DONO (2026-10-16): R-1 = B: na T14, "outros times" fica oculto quando somar menos de 2 pessoas (pedido 011, linha 82).
- DECISÃO DO DONO (2026-10-17): T14-M1 = B ("D1 - B"): quando "outros times" estiver oculto, a T14 mostra só a fatia do meu time, sem o total exato do projeto (pedido 011, linha 135).
- DECISÃO DO DONO (2026-10-17): B11-001 = sim ("3 -sim"): o nome do fornecedor no T10 ignora maiúsculas, minúsculas e espaços (pedido 011, linha 130).
- R-MAIN: nada na `main`. R-VERIFY: nunca `--no-verify` nem `--force`. Worktree compartilhada com o tech-lead nesta rodada: `git add` só dos seus caminhos; se o `index.lock` existir, espere e tente de novo, sem apagá-lo.

## Pronto quando
- PQ-1 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-025 log -1 --format=%H -- docs/qa/025-front-taticas.md` · espera: o sha40 do commit do parecer, depois de d8f1c51
- PQ-2 (cmd): `grep -c 'K-131' /home/rodrigoisensee/MetricasDSPD-025/docs/qa/025-front-taticas.md` · espera: igual '0' se o K-131 sair do texto; senão, cada linha com K-131 diz "não se aplica"
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-025 status --short -- docs/qa/evidencias/ | wc -l` · espera: igual '0'
- PQ-4 (cmd): `grep -c '^commit: 7807199' /home/rodrigoisensee/MetricasDSPD-025/docs/qa/025-front-taticas.md` · espera: igual '1'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
