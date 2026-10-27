Agente destino: forge:qa-engineer
Pedido: docs/pedidos/025-front-do-011-lote2.md
Branch: feature/025-front-taticas   Base: develop   Base-sha: 306cf6ef29db7bbae2509194406e0b7fcc6ab232

## Objetivo
Retestar o 025 no head 43f29b3, que trouxe a develop com o Worker do 037 (merge d3356a8, com review incremental aprovado). O Worker muda o momento em que os painéis ficam prontos (W037-001), então os E2E do 025 e o CLS da L2T-003 precisam ser confirmados nesse head antes do PR. Etapa E1.5 do pedido 025, cartão K-110. Worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-025`, branch `feature/025-front-taticas` (head 43f29b3, no remoto, com dependências instaladas).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD-025/docs/qa/025-front-taticas.md`, frontmatter, seção "Parecer" e as linhas da L2T-003.
- `/home/rodrigoisensee/Metricas/MetricasDSPD-025/docs/reviews/025-front-taticas.md`, a última seção (review do merge): o que ela pede ao QA.

## Entregar
- (E1, E2, E3, E4) Rodar no head 43f29b3, com porta própria (`E2E_PORTA` e `E2E_PORTA_ALT`, para não reaproveitar o preview de outra worktree) e com o PATH `/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin` na frente: os specs `e2e/tests-api/tatico-011-lote2.spec.ts` e `e2e/tests-api/t10-grafias.spec.ts` (projeto `chromium-api`, via `scripts/com-api-mock.sh`) e `e2e/tests/complementares.spec.ts`, mais o typecheck dos E2E. Falha: registre como defeito com passos para reproduzir; o código e os testes não mudam nesta etapa.
- (E1) Medir de novo o CLS de /tatico com equipe na API (L2T-003) e registrar o valor no parecer, comparando com o de antes (0,073 a 0,100).
- (E1) Atualizar o parecer `docs/qa/025-front-taticas.md` com uma seção do reteste no head 43f29b3: resultado dos specs, CLS e pendências (D2 e L2T-003 continuam pendências, D1 não se aplica). O frontmatter passa a `commit: 43f29b3`, com veredito e contadores atualizados. Gravar com Write ou Edit, nunca por Bash, e validar com o `forge-check docs`. Fazer um commit só do parecer, com `git add` explícito por caminho, a linha `Cartão: K-110` e mensagem conforme a seção de commits do `docs/engineering/praticas.md`. Sem push.
- (E1) `pnpm run pronto` uma vez, antes do commit, na worktree.

## Fora do escopo
- "E1.7 (forge:tech-lead): PR para a develop (squash) e merge; limpeza da branch." · etapa de outro papel, depois desta.
- "E1.3 (forge:tech-lead): code review." e "E1.6 (forge:ux-designer): revisão da interface implementada contra a especificação." · etapas de outro papel, cumpridas (43f29b3 e 5a0a999).
- "E1.1 (forge:react-frontend): front do lote 2 (T10 a T14), com testes de unidade e o `pnpm run pronto` verde.", "E1.2 (forge:qa-engineer): plano de testes e E2E do lote 2 a partir da especificação, em paralelo com o E1.1." e "E1.4 (forge:security-engineer): review de segurança da tela da T14 (reidentificação: R-1 = B e T14-M1 = B na exibição), em paralelo com o E1.3." · etapas cumpridas.
- Mudar código, specs ou outros pareceres; a suíte E2E completa (só os specs do 025); o quadro; push; PR.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-21): D1, opção A ("A se d1 foi feito e vai subir certo"): o D1 deixa de ser pendência; no 037 aparece como W037-001, encontrado e corrigido na entrega, e no 025 como não se aplica; condição: a correção sobe certa (check `e2e` do PR do 037 verde); o K-131 fecha depois do merge. D2 continua pendência (K-132).
- DECISÃO DO DONO (2026-10-21): defeitos D1 (média: 100 E2E defasados na develop, K-131) e D2 (baixa: 9 E2E instáveis com 8 workers, K-132), já existentes na develop, opção A ("A"): acompanham as entregas do 037 e do 025 como pendências listadas no PR e são corrigidos depois nos cartões K-131 e K-132 (R-QA).
- Para o D1 vale a decisão "D1, opção A", resposta do dono posterior à outra (ordem registrada no Andamento do pedido 025, 2026-10-22). Ela revê a anterior só no D1: no 025 o D1 não se aplica e não entra como pendência; o D2 continua pendência. A condição foi cumprida: o check `e2e` do #139 ficou verde e o squash 2bb9f68 está na develop.
- DECISÃO DO DONO (2026-10-21): defeitos baixos do QA do 025, opção A ("A"): corrigir agora L2T-001 (T13 em Frentes: "Amostra insuficiente: 147 de 20 itens mínimos") e L2T-002 (T14: "Meu time: 1 demandas"); L2T-003 (CLS de 0,073 a 0,100 em /tatico com equipe na API, herdado) segue como pendência listada no PR, em cartão próprio.
- DECISÃO DO DONO (2026-10-21): comando de pronto, opção A ("A"): durante o desenvolvimento só os testes e o typecheck do pacote alterado; `pnpm run pronto` completo uma vez, antes do commit final. Vale para as próximas delegações deste projeto; a regra geral vai ao Forge (F3 do prompt de melhorias).
- DECISÃO DO DONO (2026-10-20): ordem das pendências: "veja se tem algo das metricas estrategicas pendentes se tem comece por ele, senao va para taticas e por ultimo operacional. Depois de tudo isso faremos as integracoes oficiais funcionar."
- DECISÃO DO DONO (2026-10-20): recibo do pedido 025 aceito ("sim"), com a leitura de "sem o total exato do projeto" = não mostrar o total.
- DECISÃO DO DONO (2026-10-16): R-1 = B: na T14, "outros times" fica oculto quando somar menos de 2 pessoas (pedido 011, linha 82).
- DECISÃO DO DONO (2026-10-17): T14-M1 = B ("D1 - B"): quando "outros times" estiver oculto, a T14 mostra só a fatia do meu time, sem o total exato do projeto (pedido 011, linha 135).
- DECISÃO DO DONO (2026-10-17): B11-001 = sim ("3 -sim"): o nome do fornecedor no T10 ignora maiúsculas, minúsculas e espaços (pedido 011, linha 130).
- R-TETO: antes de rodar E2E, `pgrep -fa 'playwright|vitest'` sem processo de outra worktree; um pesado por vez. O banco local está no ar (pedido 040), mas os specs do 025 usam a API mock.
- R-MAIN: nada na `main`. R-VERIFY: nunca `--no-verify` nem `--force`; nada de `reset` nem reescrita de histórico. `aceite_usuario` não se marca sem decisão do dono.

## Pronto quando
- PQ-1 (sha): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-025 log -1 --format=%H -- docs/qa/025-front-taticas.md` · espera: o sha40 do commit do parecer, depois de 43f29b3
- PQ-2 (cmd): `grep -c '^commit: 43f29b3' /home/rodrigoisensee/Metricas/MetricasDSPD-025/docs/qa/025-front-taticas.md` · espera: igual '1'
- PQ-3 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-025 status --porcelain -- web server e2e packages` · espera: linhas=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
