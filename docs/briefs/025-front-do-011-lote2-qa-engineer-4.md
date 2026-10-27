Agente destino: forge:qa-engineer
Pedido: 025-front-do-011-lote2
Branch: feature/025-front-taticas   Base: develop   Base-sha: 568ea481bde436e220d23e99142aa2bfe4718e76

## Objetivo
Corrigir o erro de tipo que o reteste do QA introduziu no E2E do lote 2 em af1fa41 (`pnpm --filter @metricas-dspd/e2e typecheck`: `e2e/tests-api/tatico-011-lote2.spec.ts(170,19): error TS18048: 'textoT13' is possibly 'undefined'`), que o `pnpm run pronto` não pega e que reprova o check de typecheck do PR, e atualizar o parecer de QA para o novo head. Etapas E1.2 (E2E) e E1.5 (parecer) do pedido 025, cartão K-110. Worktree `/home/rodrigoisensee/MetricasDSPD-025`, branch `feature/025-front-taticas` (head 03d514f).

## Ler
- `/home/rodrigoisensee/MetricasDSPD-025/e2e/tests-api/tatico-011-lote2.spec.ts`, linhas 160 a 175 (TT-07, guarda do L2T-001).
- `/home/rodrigoisensee/MetricasDSPD-025/docs/qa/025-front-taticas.md` (frontmatter e o bloco `## Achados`).

## Entregar
- (E1) Na linha 169 de `e2e/tests-api/tatico-011-lote2.spec.ts`, garantir string no resultado do `split` (por exemplo `?? ''`), sem mudar o que o teste afirma nem retirar asserção; `pnpm --filter @metricas-dspd/e2e typecheck` com rc=0; rodar só o spec `tatico-011-lote2` no projeto `chromium-api`, com porta própria (`E2E_PORTA`) e `--retries=0`; um commit só do spec, com `git add` explícito por caminho, mensagem conforme a seção de commits do `docs/engineering/praticas.md` e a linha `Cartão: K-110`.
- (E1) No parecer `docs/qa/025-front-taticas.md`: frontmatter `commit:` com o hash curto do commit do spec, uma linha sobre a correção do tipo e o resultado do spec; o resto igual; gravar com a ferramenta Write ou Edit, nunca por Bash; validar com o `forge-check docs`.
- (E2, E3, E4) Sem mudança: as conclusões de R-1 = B, T14-M1 = B e B11-001 no parecer continuam como em af1fa41.
- (E1) `pnpm run pronto` completo uma vez, antes do commit do parecer (decisão do dono de 2026-10-21); um commit só do parecer, com `git add` explícito por caminho e a linha `Cartão: K-110`; sem push (o envio da branch é do tech-lead).

## Fora do escopo
- "E1.1 (forge:react-frontend): front do lote 2 (T10 a T14), com testes de unidade e o `pnpm run pronto` verde." e "E1.4 (forge:security-engineer): review de segurança da tela da T14 (reidentificação: R-1 = B e T14-M1 = B na exibição), em paralelo com o E1.3." · etapas de outro papel, cumpridas.
- "E1.3 (forge:tech-lead): code review." · etapa de outro papel; o review incremental deste commit vem depois desta.
- "E1.6 (forge:ux-designer): revisão da interface implementada contra a especificação." e "E1.7 (forge:tech-lead): PR para a develop (squash) e merge; limpeza da branch." · etapas de outro papel, depois desta.
- Push da branch; mudar código do `web/` ou do `server/`; outros specs; incluir o typecheck dos E2E no `pronto` (cartão K-134); o quadro; PR.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-20): ordem das pendências: "veja se tem algo das metricas estrategicas pendentes se tem comece por ele, senao va para taticas e por ultimo operacional. Depois de tudo isso faremos as integracoes oficiais funcionar."
- DECISÃO DO DONO (2026-10-20): recibo do pedido 025 aceito ("sim"), com a leitura de "sem o total exato do projeto" = não mostrar o total.
- DECISÃO DO DONO (2026-10-16): R-1 = B: na T14, "outros times" fica oculto quando somar menos de 2 pessoas (pedido 011, linha 82).
- DECISÃO DO DONO (2026-10-17): T14-M1 = B ("D1 - B"): quando "outros times" estiver oculto, a T14 mostra só a fatia do meu time, sem o total exato do projeto (pedido 011, linha 135).
- DECISÃO DO DONO (2026-10-17): B11-001 = sim ("3 -sim"): o nome do fornecedor no T10 ignora maiúsculas, minúsculas e espaços (pedido 011, linha 130).
- Regras invioláveis do `CLAUDE.md`: nenhuma métrica para avaliação individual nem comparação entre times (a T14 não nomeia nem ranqueia outros times); abaixo de 20 itens não publicar estatística; nenhum cálculo no front (percentis e tempos vêm da biblioteca compartilhada, via API).
- ADR 0003: F2 CLS < 0,1 e C6 < 200 ms em /tatico (a S0 do pedido 037 viu CLS 0,103 em /tatico numa execução: reserve altura dos cartões).
- DECISÃO DO DONO (2026-10-21): comando de pronto, opção A ("A"): durante o desenvolvimento só os testes e o typecheck do pacote alterado; `pnpm run pronto` completo uma vez, antes do commit final. Vale para as próximas delegações deste projeto; a regra geral vai ao Forge (F3 do prompt de melhorias).
- DECISÃO DO DONO (2026-10-21): defeitos D1 (média: 100 E2E defasados na develop, K-131) e D2 (baixa: 9 E2E instáveis com 8 workers, K-132), já existentes na develop, opção A ("A"): acompanham as entregas do 037 e do 025 como pendências listadas no PR e são corrigidos depois nos cartões K-131 e K-132 (R-QA).
- DECISÃO DO DONO (2026-10-21): defeitos baixos do QA do 025, opção A ("A"): corrigir agora L2T-001 (T13 em Frentes: "Amostra insuficiente: 147 de 20 itens mínimos") e L2T-002 (T14: "Meu time: 1 demandas"); L2T-003 (CLS de 0,073 a 0,100 em /tatico com equipe na API, herdado) segue como pendência listada no PR, em cartão próprio.
- DECISÃO DO DONO (2026-10-21): D1, opção A ("A se d1 foi feito e vai subir certo"): o D1 deixa de ser pendência; no 037 aparece como W037-001, encontrado e corrigido na entrega, e no 025 como não se aplica; condição: a correção sobe certa (check `e2e` do PR do 037 verde); o K-131 fecha depois do merge. D2 continua pendência (K-132).
- Para o D1 vale a decisão mais recente (2026-10-21, "A se d1 foi feito e vai subir certo"), que substitui a anterior só no D1: no 025 o D1 não se aplica e não entra como pendência; o D2 continua pendência.
- R-MAIN: nada na `main`. R-VERIFY: nunca `--no-verify` nem `--force`.
- R-TETO: uma suíte pesada por vez; antes de cada execução, `pgrep -af 'node .*(vitest|playwright)'` sem processo de outra worktree (o 037 corrige o W037-001 ao mesmo tempo); use porta própria (`E2E_PORTA`).

## Pronto quando
- PQ-1 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-025 log -1 --format=%h -- e2e/tests-api/tatico-011-lote2.spec.ts` · espera: o hash do commit da correção, diferente de af1fa41.
- PQ-2 (cmd): `pnpm --filter @metricas-dspd/e2e typecheck` rodado em `/home/rodrigoisensee/MetricasDSPD-025` · espera: rc=0
- PQ-3 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-025 log -1 --format=%h -- docs/qa/025-front-taticas.md` · espera: o hash do commit do parecer.

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
