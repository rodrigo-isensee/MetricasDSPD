Agente destino: forge:qa-engineer
Pedido: docs/pedidos/025-front-do-011-lote2.md
Branch: feature/025-front-taticas   Base: develop   Base-sha: 568ea481bde436e220d23e99142aa2bfe4718e76

## Objetivo
Revalidar por delta o parecer de QA do 025 para o head ea533a3: o `forge-check pr` acusa o parecer (`commit: 7807199`) como desatualizado porque `docs/ux/revisao-025-front-taticas.md` entrou depois dele (5a0a999), o que impede o PR. Etapa E1.5 (parecer) do pedido 025, cartão K-110. Worktree `/home/rodrigoisensee/MetricasDSPD-025`, branch `feature/025-front-taticas` (head ea533a3, sem push).

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-025 diff --stat 7807199 HEAD` (esperado: só `.forge/versao`, `docs/qa/`, `docs/reviews/` e `docs/ux/`).
- `/home/rodrigoisensee/MetricasDSPD-025/docs/qa/025-front-taticas.md`, frontmatter e seção "Parecer".

## Entregar
- (E1) Confirmar com o diff que nada de código nem de teste mudou depois de 7807199 (só documentação e o `.forge/versao` vindo da develop pelo merge 4fe19af); registrar essa revalidação por delta numa linha do parecer e trocar o frontmatter para `commit:` com o head ea533a3; o veredito, as pendências (D2 em K-132, L2T-003 em K-133) e o "D1 não se aplica" não mudam; gravar com a ferramenta Write ou Edit, nunca por Bash; validar com o `forge-check docs` e o `forge-check pr 025-front-do-011-lote2 --ref feature/025-front-taticas --base origin/develop` (sem linha de QA desatualizado).
- (E2, E3, E4) Sem mudança: as conclusões de R-1 = B, T14-M1 = B e B11-001 continuam como em 1062b91.
- (E1) Um commit só do parecer, `git add` explícito por caminho, mensagem conforme a seção de commits do `docs/engineering/praticas.md` e a linha `Cartão: K-110`; sem push (o envio é do tech-lead, no E1.7). Se o diff mostrar código ou teste mudado, não atualize o `commit:`: pare e relate.

## Fora do escopo
- "E1.7 (forge:tech-lead): PR para a develop (squash) e merge; limpeza da branch." · etapa de outro papel, depois desta.
- "E1.3 (forge:tech-lead): code review." e "E1.6 (forge:ux-designer): revisão da interface implementada contra a especificação." · etapas de outro papel, cumpridas (ea533a3 e 5a0a999).
- "E1.1 (forge:react-frontend): front do lote 2 (T10 a T14), com testes de unidade e o `pnpm run pronto` verde.", "E1.2 (forge:qa-engineer): plano de testes e E2E do lote 2 a partir da especificação, em paralelo com o E1.1." e "E1.4 (forge:security-engineer): review de segurança da tela da T14 (reidentificação: R-1 = B e T14-M1 = B na exibição), em paralelo com o E1.3." · etapas cumpridas.
- Rodar testes (o código não mudou; o `pronto` rodou com rc=0 em 7807199); mudar código, spec ou outros pareceres; o quadro; push; PR.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-21): D1, opção A ("A se d1 foi feito e vai subir certo"): o D1 deixa de ser pendência; no 037 aparece como W037-001, encontrado e corrigido na entrega, e no 025 como não se aplica; condição: a correção sobe certa (check `e2e` do PR do 037 verde); o K-131 fecha depois do merge. D2 continua pendência (K-132).
- DECISÃO DO DONO (2026-10-21): defeitos D1 (média: 100 E2E defasados na develop, K-131) e D2 (baixa: 9 E2E instáveis com 8 workers, K-132), já existentes na develop, opção A ("A"): acompanham as entregas do 037 e do 025 como pendências listadas no PR e são corrigidos depois nos cartões K-131 e K-132 (R-QA).
- Para o D1 vale a decisão mais recente (2026-10-21, "A se d1 foi feito e vai subir certo"), que substitui a anterior só no D1: no 025 o D1 não se aplica e não entra como pendência, com a condição da decisão (check `e2e` do PR do 037 verde) a confirmar no head do PR #139 (o e2e passou na run 39699610730, no head 47c3e66 com o mesmo código; no head 0822f63, que só acrescenta o parecer de review, o e2e ainda roda, e o merge do #139 exige esse check verde); o D2 continua pendência.
- DECISÃO DO DONO (2026-10-21): defeitos baixos do QA do 025, opção A ("A"): corrigir agora L2T-001 (T13 em Frentes: "Amostra insuficiente: 147 de 20 itens mínimos") e L2T-002 (T14: "Meu time: 1 demandas"); L2T-003 (CLS de 0,073 a 0,100 em /tatico com equipe na API, herdado) segue como pendência listada no PR, em cartão próprio.
- DECISÃO DO DONO (2026-10-21): comando de pronto, opção A ("A"): durante o desenvolvimento só os testes e o typecheck do pacote alterado; `pnpm run pronto` completo uma vez, antes do commit final. Vale para as próximas delegações deste projeto; a regra geral vai ao Forge (F3 do prompt de melhorias).
- DECISÃO DO DONO (2026-10-20): ordem das pendências: "veja se tem algo das metricas estrategicas pendentes se tem comece por ele, senao va para taticas e por ultimo operacional. Depois de tudo isso faremos as integracoes oficiais funcionar."
- DECISÃO DO DONO (2026-10-20): recibo do pedido 025 aceito ("sim"), com a leitura de "sem o total exato do projeto" = não mostrar o total.
- DECISÃO DO DONO (2026-10-16): R-1 = B: na T14, "outros times" fica oculto quando somar menos de 2 pessoas (pedido 011, linha 82).
- DECISÃO DO DONO (2026-10-17): T14-M1 = B ("D1 - B"): quando "outros times" estiver oculto, a T14 mostra só a fatia do meu time, sem o total exato do projeto (pedido 011, linha 135).
- DECISÃO DO DONO (2026-10-17): B11-001 = sim ("3 -sim"): o nome do fornecedor no T10 ignora maiúsculas, minúsculas e espaços (pedido 011, linha 130).
- R-MAIN: nada na `main`. R-VERIFY: nunca `--no-verify` nem `--force`; nada de `reset` nem reescrita de histórico.

## Pronto quando
- PQ-1 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-025 log -1 --format=%H -- docs/qa/025-front-taticas.md` · espera: o sha40 do commit do parecer, depois de ea533a3
- PQ-2 (cmd): `grep -c '^commit: ea533a3' /home/rodrigoisensee/MetricasDSPD-025/docs/qa/025-front-taticas.md` · espera: igual '1'
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-025 diff --name-only 7807199 ea533a3 -- web server e2e packages | wc -l` · espera: igual '0'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
