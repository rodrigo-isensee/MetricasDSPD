Agente destino: forge:tech-lead
Pedido: docs/pedidos/025-front-do-011-lote2.md
Branch: feature/025-front-taticas   Base: develop   Base-sha: 568ea481bde436e220d23e99142aa2bfe4718e76

## Objetivo
Fechar o 025 na develop: review incremental do commit 7807199 (correção do TS18048 no E2E do lote 2, posterior ao parecer de review `commit: af1fa41`), commit da revisão de UX, PR para a develop e merge (squash). Etapas E1.3 (incremental) e E1.7 do pedido 025, cartão K-110. Worktree `/home/rodrigoisensee/MetricasDSPD-025`, branch `feature/025-front-taticas` (head 1062b91: depois de d8f1c51 só o parecer de QA; tudo sem push; a revisão de UX está no disco sem commit).

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-025 show 7807199` (uma linha em `e2e/tests-api/tatico-011-lote2.spec.ts`).
- `/home/rodrigoisensee/MetricasDSPD-025/docs/reviews/025-front-taticas.md`, frontmatter e a última seção de revisão incremental.
- `/home/rodrigoisensee/MetricasDSPD-025/docs/ux/revisao-025-front-taticas.md` (parecer de UX: aprovado com ressalvas, sem bloqueante).
- `/home/rodrigoisensee/MetricasDSPD-025/docs/qa/025-front-taticas.md`, seções "Já existentes na `develop`" e "Parecer" (pendências para o corpo do PR).

## Entregar
- (E1) Review: acrescentar ao parecer `docs/reviews/025-front-taticas.md` a revisão incremental `af1fa41..7807199` e trocar o frontmatter para `commit: 7807199`; aprovado ou reprovado, achados bloqueantes em `## Achados`; o D1 não entra como pendência do 025 (decisão do dono abaixo, com a condição dela atendida: o check `e2e` do PR do 037 passou na run 39699610730); gravar com a ferramenta Write ou Edit, nunca por Bash; validar com o `forge-check docs`; um commit só do parecer, `git add` explícito por caminho, linha `Cartão: K-110`.
- (E2, E3, E4) Sem mudança: o 7807199 não toca a T14 nem o T10; as conclusões do parecer sobre R-1 = B, T14-M1 = B e B11-001 continuam como em af1fa41.
- (E1) Commit da revisão de UX `docs/ux/revisao-025-front-taticas.md` (escrita pelo ux-designer, que não tem Bash), `git add` explícito por caminho, linha `Cartão: K-110`.
- (E1) Com o review aprovado, rodar o `forge-check pr 025-front-do-011-lote2 --ref feature/025-front-taticas --base origin/develop` sem violação; push da branch; abrir o PR para a `develop` com o corpo listando as pendências: D2 (K-132) e L2T-003 (K-133); o D1 não se aplica ao 025; os recomendados da revisão de UX (T14-1 e T14-2) e o Leia junto com o O19 no lote 3 (pedido 026).
- (E1) Se a `develop` andar antes do merge (o PR do 037 está sendo mesclado agora) e o GitHub pedir a branch atualizada, trazer a `develop` por merge (nunca rebase nem `--force`) e acrescentar ao parecer de review a leitura desse merge, com o `commit:` no head de código novo.
- (E1) Com todos os checks verdes no head, mesclar o PR na `develop` (squash), mensagem conforme a seção de commits do `docs/engineering/praticas.md` e a linha `Cartão: K-110`; depois do merge, apagar a branch remota, a local e a worktree `/home/rodrigoisensee/MetricasDSPD-025` (R-FLUXO, "Depois do merge").

## Fora do escopo
- "E1.5 (forge:qa-engineer): QA e parecer." · etapa de outro papel, cumprida (1062b91).
- "E1.6 (forge:ux-designer): revisão da interface implementada contra a especificação." · etapa de outro papel, cumprida (arquivo no disco, commit nesta entrega).
- "E1.1 (forge:react-frontend): front do lote 2 (T10 a T14), com testes de unidade e o `pnpm run pronto` verde.", "E1.2 (forge:qa-engineer): plano de testes e E2E do lote 2 a partir da especificação, em paralelo com o E1.1." e "E1.4 (forge:security-engineer): review de segurança da tela da T14 (reidentificação: R-1 = B e T14-M1 = B na exibição), em paralelo com o E1.3." · etapas cumpridas.
- Mudar código, spec, especificação de UX ou o parecer de QA; corrigir os recomendados da revisão de UX; o quadro; tocar a `main`.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-21): D1, opção A ("A se d1 foi feito e vai subir certo"): o D1 deixa de ser pendência; no 037 aparece como W037-001, encontrado e corrigido na entrega, e no 025 como não se aplica; condição: a correção sobe certa (check `e2e` do PR do 037 verde); o K-131 fecha depois do merge. D2 continua pendência (K-132).
- DECISÃO DO DONO (2026-10-21): defeitos D1 (média: 100 E2E defasados na develop, K-131) e D2 (baixa: 9 E2E instáveis com 8 workers, K-132), já existentes na develop, opção A ("A"): acompanham as entregas do 037 e do 025 como pendências listadas no PR e são corrigidos depois nos cartões K-131 e K-132 (R-QA).
- Para o D1 vale a decisão mais recente (2026-10-21, "A se d1 foi feito e vai subir certo"), que substitui a anterior só no D1: no 025 o D1 não se aplica e não entra como pendência, com a condição da decisão (check `e2e` do PR do 037 verde) atendida na run 39699610730; o D2 continua pendência.
- DECISÃO DO DONO (2026-10-21): defeitos baixos do QA do 025, opção A ("A"): corrigir agora L2T-001 (T13 em Frentes: "Amostra insuficiente: 147 de 20 itens mínimos") e L2T-002 (T14: "Meu time: 1 demandas"); L2T-003 (CLS de 0,073 a 0,100 em /tatico com equipe na API, herdado) segue como pendência listada no PR, em cartão próprio.
- DECISÃO DO DONO (2026-10-21): comando de pronto, opção A ("A"): durante o desenvolvimento só os testes e o typecheck do pacote alterado; `pnpm run pronto` completo uma vez, antes do commit final. Vale para as próximas delegações deste projeto; a regra geral vai ao Forge (F3 do prompt de melhorias).
- DECISÃO DO DONO (2026-10-20): ordem das pendências: "veja se tem algo das metricas estrategicas pendentes se tem comece por ele, senao va para taticas e por ultimo operacional. Depois de tudo isso faremos as integracoes oficiais funcionar."
- DECISÃO DO DONO (2026-10-20): recibo do pedido 025 aceito ("sim"), com a leitura de "sem o total exato do projeto" = não mostrar o total.
- DECISÃO DO DONO (2026-10-16): R-1 = B: na T14, "outros times" fica oculto quando somar menos de 2 pessoas (pedido 011, linha 82).
- DECISÃO DO DONO (2026-10-17): T14-M1 = B ("D1 - B"): quando "outros times" estiver oculto, a T14 mostra só a fatia do meu time, sem o total exato do projeto (pedido 011, linha 135).
- DECISÃO DO DONO (2026-10-17): B11-001 = sim ("3 -sim"): o nome do fornecedor no T10 ignora maiúsculas, minúsculas e espaços (pedido 011, linha 130).
- R-MAIN: nada na `main`. R-VERIFY: nunca `--no-verify` nem `--force`. R-CONFORMIDADE: check vermelho por defeito de código ou teste não se contorna: pare e relate, sem mudar código, teste nem limite. R-TETO: antes de algo pesado, `pgrep -fa 'playwright|vitest'` sem processo de outra worktree.

## Pronto quando
- PQ-1 (sha): `git -C /home/rodrigoisensee/MetricasDSPD log -1 --format=%H origin/feature/025-front-taticas -- docs/reviews/025-front-taticas.md` (antes do merge) · espera: o sha40 do commit do parecer de review, depois de 1062b91
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD show origin/develop:docs/reviews/025-front-taticas.md | grep -c '^commit: '` · espera: igual '1'
- PQ-3 (arquivo): `git -C /home/rodrigoisensee/MetricasDSPD cat-file -e origin/develop:docs/ux/revisao-025-front-taticas.md`
- PQ-4 (pr): `gh pr list --head feature/025-front-taticas --state merged --json number,createdAt,mergeCommit` · espera: um PR, `createdAt` depois do commit do PQ-1
- PQ-5 (run): `gh pr checks <número do PR>` · espera: nenhum check `fail` nem `pending`; `skipping` só no banco (filtro de caminho) e no perf (só roda com base homolog ou main)
- PQ-6 (sha): `git fetch -q origin && git log -1 --format=%H origin/develop` · espera: o sha40 do `mergeCommit` do PQ-4 (ou um descendente dele, se outro PR entrar depois)
- PQ-7 (cmd): `git ls-remote origin refs/heads/feature/025-front-taticas | wc -l` · espera: igual '0'
- PQ-8 (cmd): `git worktree list | grep -c MetricasDSPD-025` · espera: igual '0'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
