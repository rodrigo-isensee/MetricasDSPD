Agente destino: forge:tech-lead
Pedido: docs/pedidos/025-front-do-011-lote2.md
Tipo: codigo
Branch: feature/025-front-taticas   Base: develop   Base-sha: 306cf6ef29db7bbae2509194406e0b7fcc6ab232

## Objetivo
Levar o 025 (front das táticas T10 a T14) para a develop: PR por squash, com os checks verdes, merge e limpeza. Esta é a etapa E1.7, parte 2, do pedido 025, cartão K-110, depois do reteste do QA aprovado no head 43f29b3 (parecer 20d7857). Worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-025`, branch `feature/025-front-taticas` (head local 20d7857, sem push; remoto em 43f29b3).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD-025/docs/qa/025-front-taticas.md`: frontmatter, a seção do reteste no head 43f29b3 e as pendências.
- `/home/rodrigoisensee/Metricas/MetricasDSPD-025/docs/reviews/025-front-taticas.md`: frontmatter e a última seção.
- `/home/rodrigoisensee/Metricas/MetricasDSPD-025/docs/security/025-t14-reidentificacao.md`: o veredito.

## Entregar
- (E1) Commitar `docs/qa/bugs/ENV-025-001-chromium-sem-libnspr4.md`, que o QA marcou como corrigido no ambiente e deixou sem commit, com `git add` explícito por caminho e a linha `Cartão: K-110`. Gravação de documento só com Write ou Edit, nunca por script no Bash.
- (E1) Rodar o `forge-check pr 025-front-do-011-lote2 --ref feature/025-front-taticas --base origin/develop`. Se ele acusar o parecer de review desatualizado só por commits de `docs/qa/` posteriores a d3356a8, atualize o `commit:` do parecer de review para o head com Edit, sem mudar o veredito, num commit só desse arquivo. Qualquer outro achado: pare e relate.
- (E1, E2, E3, E4) Push da branch (o pre-push roda lint e typecheck), PR para a `develop` aberto depois dos pareceres, com squash. O corpo do PR traz: o resumo do T10 ao T14; os links dos pareceres de review, segurança, QA e UX; as pendências listadas pela decisão do dono, que são D2 (K-132) e L2T-003 (K-133, com o CLS remedido de 0,032 a 0,085 e o /tatico sem equipe em 0,091); D1 não se aplica; as ressalvas de UX T14-1 e T14-2 e a pergunta T14-1, que segue com o dono.
- (E1) Com todos os checks verdes (`rapida`, `testes`, `build` e `e2e`, exigidos pelo ruleset da develop) e os pareceres aprovados no head, mesclar o PR na `develop` por squash, com mensagem conforme a seção de commits do `docs/engineering/praticas.md` e a linha `Cartão: K-110`. Check vermelho por defeito de código ou de teste não se contorna: pare e relate, sem mudar código, teste nem limite.
- (E1) Depois do merge: apagar a branch remota, a local e a worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-025` (R-FLUXO, "Depois do merge").

## Fora do escopo
- "E1.1 (forge:react-frontend): front do lote 2 (T10 a T14), com testes de unidade e o `pnpm run pronto` verde." · etapa de outro papel, cumprida.
- "E1.2 (forge:qa-engineer): plano de testes e E2E do lote 2 a partir da especificação, em paralelo com o E1.1." e "E1.5 (forge:qa-engineer): QA e parecer." · etapas de outro papel, cumpridas (20d7857).
- "E1.3 (forge:tech-lead): code review." · etapa cumprida (43f29b3).
- "E1.4 (forge:security-engineer): review de segurança da tela da T14 (reidentificação: R-1 = B e T14-M1 = B na exibição), em paralelo com o E1.3." · etapa de outro papel, cumprida.
- "E1.6 (forge:ux-designer): revisão da interface implementada contra a especificação." · etapa de outro papel, cumprida (5a0a999).
- A promoção develop → homolog e a release para a `main` (pedido 037, E2.6 a E2.8); mudar código, testes ou pareceres além do `commit:` do review; o quadro; tocar a `main`.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-21): D1, opção A ("A se d1 foi feito e vai subir certo"): o D1 deixa de ser pendência; no 037 aparece como W037-001, encontrado e corrigido na entrega, e no 025 como não se aplica; condição: a correção sobe certa (check `e2e` do PR do 037 verde); o K-131 fecha depois do merge. D2 continua pendência (K-132).
- DECISÃO DO DONO (2026-10-21): defeitos baixos do QA do 025, opção A ("A"): corrigir agora L2T-001 (T13 em Frentes: "Amostra insuficiente: 147 de 20 itens mínimos") e L2T-002 (T14: "Meu time: 1 demandas"); L2T-003 (CLS de 0,073 a 0,100 em /tatico com equipe na API, herdado) segue como pendência listada no PR, em cartão próprio.
- DECISÃO DO DONO (2026-10-21): defeitos D1 (média: 100 E2E defasados na develop, K-131) e D2 (baixa: 9 E2E instáveis com 8 workers, K-132), já existentes na develop, opção A ("A"): acompanham as entregas do 037 e do 025 como pendências listadas no PR e são corrigidos depois nos cartões K-131 e K-132 (R-QA).
- Para o D1 vale a decisão "D1, opção A", resposta do dono posterior à outra (ordem registrada no Andamento do pedido 025, 2026-10-22). Ela revê a anterior só no D1: no 025 o D1 não se aplica e não entra como pendência; o D2 continua pendência.
- DECISÃO DO DONO (2026-10-21): comando de pronto, opção A ("A"): durante o desenvolvimento só os testes e o typecheck do pacote alterado; `pnpm run pronto` completo uma vez, antes do commit final. Vale para as próximas delegações deste projeto; a regra geral vai ao Forge (F3 do prompt de melhorias).
- DECISÃO DO DONO (2026-10-20): ordem das pendências: "veja se tem algo das metricas estrategicas pendentes se tem comece por ele, senao va para taticas e por ultimo operacional. Depois de tudo isso faremos as integracoes oficiais funcionar."
- DECISÃO DO DONO (2026-10-20): recibo do pedido 025 aceito ("sim"), com a leitura de "sem o total exato do projeto" = não mostrar o total.
- DECISÃO DO DONO (2026-10-16): R-1 = B: na T14, "outros times" fica oculto quando somar menos de 2 pessoas (pedido 011, linha 82).
- DECISÃO DO DONO (2026-10-17): T14-M1 = B ("D1 - B"): quando "outros times" estiver oculto, a T14 mostra só a fatia do meu time, sem o total exato do projeto (pedido 011, linha 135).
- DECISÃO DO DONO (2026-10-17): B11-001 = sim ("3 -sim"): o nome do fornecedor no T10 ignora maiúsculas, minúsculas e espaços (pedido 011, linha 130).
- R-MAIN: nada na `main`. R-VERIFY: nunca `--no-verify` nem `--force`; nada de `reset` nem reescrita de histórico. R-CONFORMIDADE: bloqueio não se contorna. Ambiente: o PATH do node é `/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin`, como prefixo literal (o hook barra `$`, crase e `?`).

## Pronto quando
- PQ-1 (pr): `gh pr list --head feature/025-front-taticas --state merged --json number,createdAt` · espera: um PR, criado depois do commit do parecer de QA 20d7857
- PQ-2 (merge): `gh pr list --head feature/025-front-taticas --state merged --json mergeCommit --jq '.[0].mergeCommit.oid'` · espera: o sha40 do squash na `develop`
- PQ-3 (run): `gh pr checks <número do PR>` · espera: nenhum check `fail` nem `pending`; `rapida`, `testes`, `build` e `e2e` em `pass`
- PQ-4 (cmd): `git ls-remote origin refs/heads/feature/025-front-taticas` · espera: linhas=0
- PQ-5 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD worktree list` · espera: linhas=1
- PQ-6 (sha): `git log -1 --format=%H origin/feature/025-front-taticas -- docs/qa/bugs/ENV-025-001-chromium-sem-libnspr4.md` (antes do merge) · espera: o sha40 do commit do arquivo do bug, depois de 20d7857

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
