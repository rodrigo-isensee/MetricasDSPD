Agente destino: forge:qa-engineer
Pedido: docs/pedidos/037-pr-131-release-com-falhas.md
Tipo: codigo
Branch: docs/promocao-2026-10-23   Base: develop   Base-sha: ae009a75d4383c3d6c9a8ba4851f9b5b2ba5dbb8

## Objetivo
Parecer de QA da promoção develop → homolog, a candidata que leva o Worker do 037 (#139), as táticas do 025 (#140), o registro do Forge 0.28.0 (#138) e a documentação (#141). Etapa E2.6 do pedido 037, cartão K-113. O parecer vai numa branch curta, que o tech-lead leva à develop antes do PR de promoção, como no pedido 023.

## Ler
- `docs/engineering/fluxo-homologacao.md`, §4 "Critério de promoção", itens 1 a 5.
- `git -C /home/rodrigoisensee/Metricas/MetricasDSPD log --oneline origin/homolog..origin/develop`.
- Os pareceres de QA dos PRs incluídos, na develop: `docs/qa/037-c6-operacional.md`, `docs/qa/025-front-taticas.md` e `docs/qa/jarvis-2026-10-22-docs.md` (frontmatter, veredito e pendências).

## Entregar
- (E2) Criar a worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-promo` com a branch `docs/promocao-2026-10-23` a partir de `origin/develop` (ae009a7).
- (E2) QA da promoção: cada PR incluído tem parecer de QA aprovado, sem bug crítico, alto ou médio aberto, e as ressalvas baixas abertas estão listadas (D2/K-132, pela decisão do pedido 037 abaixo, e L2T-003/K-133, pela decisão do pedido 025 citada abaixo; o CLS de /tatico sem equipe em 0,091 está no parecer de QA do 025, reteste de 20d7857). A CI do push na develop no head ae009a7 tem de estar `success`, com run e link (se ainda estiver rodando, espere). O #140 teve o E2E completo verde no PR (run 39882340603), e o E2E roda de novo no PR de promoção e no portão da homolog.
- (E2) Gravar `docs/qa/037-promocao-2026-10-23.md` só com Write ou Edit, nunca por script no Bash. Frontmatter: `tipo: qa`, `pedido: 037-pr-131-release-com-falhas`, `branch: develop`, `commit: ae009a75d4383c3d6c9a8ba4851f9b5b2ba5dbb8`, `parecer:`, `escopo: completo`, a contagem de bugs por severidade e `aceite_usuario:`. O `aceite_usuario` só vale `sim` com a decisão do dono citada (data e texto). Inclua a tabela PR × parecer de QA × ressalvas. Um commit só desse arquivo, com `git add` explícito por caminho e a linha `Cartão: K-113`, e push da branch, sem `--force`. Não abra PR.

## Fora do escopo
- "E2.7 (forge:tech-lead): parecer de review da promoção, PR develop → homolog (merge commit) e merge com o portão disparado." e "E2.8 (forge:tech-lead): abrir o PR de release homolog → main com o Worker do 037, depois do E2.7, para o dono validar e mesclar." · etapas de outro papel, depois desta.
- "E2.5b (forge:tech-lead): no PR de documentação do Jarvis (branch `docs/jarvis-2026-10-20-noite`) para a develop, corrigir a linha 57 do parecer `docs/reviews/037-c6-operacional.md` (achado da conferência de 2026-10-22 15:02), revisar o diff só de documentação, abrir o PR e mesclar." e "E2.5c (forge:qa-engineer): parecer de QA só de documentação (`docs:check`) da branch do Jarvis, antes do merge do E2.5b." · etapas cumpridas (#141, ae009a7).
- "E1.1 (dono): autorizar ou não rodar de novo os jobs que falharam (custo de minutos do Actions). Feito: opção A.", "E1.2 (forge:qa-engineer): medir localmente o C6 de /operacional no código da main (9180c7e) e no da develop/homolog (12018de, mesmo conteúdo da homolog), registrando as versões do Playwright e do Chromium; o T5 não precisa (passou na nova rodada).", "E1.3 (forge:dono): mesclar o #131 na main quando o portão ficar verde.", "E1.4 (forge:devops-engineer): rodar de novo os jobs que falharam do portão de homologação do #131 e, depois, o `homolog-aprovada`, e relatar o resultado." e "E1.5 (forge:software-architect): proposta de tratamento do C6 de /operacional sem afrouxar o limite (K-113), a partir da medição 1f715e8, gravada na worktree -037 (sem commit: o arquiteto não tem Bash; o commit vai com a implementação)." · etapas cumpridas.
- Rodar a suíte E2E local (ela roda na CI do PR de promoção e no portão; a worktree -041 já ocupa a máquina com o diagnóstico); PR; mudar código; o quadro.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-21): D1, opção A ("A se d1 foi feito e vai subir certo"): o D1 deixa de ser pendência; no 037 aparece como W037-001, encontrado e corrigido na entrega, e no 025 como não se aplica; condição: a correção sobe certa (check `e2e` do PR do 037 verde); o K-131 fecha depois do merge. D2 continua pendência (K-132).
- DECISÃO DO DONO (2026-10-21): defeitos D1 (média: 100 E2E defasados na develop, K-131) e D2 (baixa: 9 E2E instáveis com 8 workers, K-132), já existentes na develop, opção A ("A"): acompanham as entregas do 037 e do 025 como pendências listadas no PR e são corrigidos depois nos cartões K-131 e K-132 (R-QA).
- DECISÃO DO DONO (2026-10-21): comando de pronto, opção A ("A"): durante o desenvolvimento só os testes e o typecheck do pacote alterado; `pnpm run pronto` completo uma vez, antes do commit final. Vale para as próximas delegações deste projeto; a regra geral vai ao Forge (F3 do prompt de melhorias).
- DECISÃO DO DONO (2026-10-20): rodar de novo os jobs que falharam no #131, opção A ("A"), com o custo de minutos do Actions.
- DECISÃO DO DONO (2026-10-20): C6 do #131, opção A ("A"): medir antes (C6 de /operacional local no código da main × no da homolog, para confirmar se a causa é o @playwright/test 1.64.1 do #130); depois o software-architect decide o tratamento sem afrouxar o limite (K-113).
- ADR 0003 (citada no pedido): C6 < 200 ms bloqueia e não muda; o `perf` roda no PR de promoção e no portão da homolog.
- DECISÃO DO DONO (2026-10-20): C6, opção A ("A"): seguir com o Web Worker da ADR 0021 (proposta docs/architecture/propostas/037-c6-operacional.md, alternativa A), precedido pela sonda S0; o #131 espera de 2 a 3 dias com o portão vermelho.
- DECISÃO DO DONO (2026-10-21): PR #136 (release homolog → main, homolog-aprovada vermelho: portão não disparou em d722901 e o C6 ainda não corrigido), opção A ("A"): esperar o 037; o #136 fica aberto e, com o Worker na develop (review e QA), o tech-lead promove para a homolog com os pareceres da promoção, o portão roda e o dono mescla o #136. (Superada pelo ato do dono: o #136 foi mesclado em 2026-10-21 13:10; ver E2.5 e E2.8.)
- DECISÃO DO DONO (2026-10-22): "Vou dormir toque tudo que puder" (ordem ampla: só o que já está confirmado ou delegado segue, R-DECISAO "Complemento"; aqui, E2.6 a E2.8, a promoção com o 025 e o PR de release para o dono validar).
- Do pedido 025 (`docs/pedidos/025-front-do-011-lote2.md`), que entra nesta promoção pelo #140: DECISÃO DO DONO (2026-10-21): defeitos baixos do QA do 025, opção A ("A"): corrigir agora L2T-001 (T13 em Frentes: "Amostra insuficiente: 147 de 20 itens mínimos") e L2T-002 (T14: "Meu time: 1 demandas"); L2T-003 (CLS de 0,073 a 0,100 em /tatico com equipe na API, herdado) segue como pendência listada no PR, em cartão próprio.
- R-MAIN: nada na `main`. R-VERIFY: nunca `--no-verify` nem `--force`. O hook barra `$`, crase e `?` no Bash. O PATH do node é `/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin`, como prefixo literal.

## Pronto quando
- PQ-1 (sha): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-promo log -1 --format=%H -- docs/qa/037-promocao-2026-10-23.md` · espera: o sha40 do commit do parecer
- PQ-2 (push): `git ls-remote origin refs/heads/docs/promocao-2026-10-23` igual ao head local
- PQ-3 (run): `gh run list --branch develop --limit 1 --json headSha,conclusion` · espera: contém 'ae009a75d4383c3d6c9a8ba4851f9b5b2ba5dbb8' e contém 'success'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
