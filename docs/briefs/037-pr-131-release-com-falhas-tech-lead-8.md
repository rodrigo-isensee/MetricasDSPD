Agente destino: forge:tech-lead
Pedido: docs/pedidos/037-pr-131-release-com-falhas.md
Tipo: codigo
Branch: docs/jarvis-2026-10-20-noite   Base: develop   Base-sha: 568ea481bde436e220d23e99142aa2bfe4718e76

## Objetivo
Preparar o PR de documentação do Jarvis para a develop: trazer a develop para a branch, corrigir a linha 57 do parecer de review do 037 e revisar o diff, que é só de documentação. Isso é a etapa E2.5b do pedido 037, parte 1 (cartão K-113). A documentação e a correção chegam à develop antes da promoção para a homolog. Trabalhe no diretório principal `/home/rodrigoisensee/Metricas/MetricasDSPD`, branch `docs/jarvis-2026-10-20-noite` (cerca de 85 arquivos de `docs/` e `KANBAN.md` desde 568ea48). Esta etapa começa depois do commit do parecer de segurança incremental da T14 (`docs/security/025-t14-reidentificacao-incremental.md`, etapa E1.4b do pedido 025), que entra no diff a revisar.

## Ler
- `git -C /home/rodrigoisensee/Metricas/MetricasDSPD diff --stat 568ea481bde436e220d23e99142aa2bfe4718e76 HEAD` e, por amostra, os pedidos 025, 037, 040 e 041 e a retrospectiva `docs/retrospectivas/2026-10-22-040-banco-local.md`.
- `docs/reviews/037-c6-operacional.md` na develop, linhas 53 a 66.
- `docs/pedidos/037-pr-131-release-com-falhas.md`, Andamento de 2026-10-22 15:02 (o achado da linha 57).

## Entregar
- (E2) Merge de `origin/develop` na branch (o ruleset da develop exige branch atualizada), sem rebase e sem `--force`. Os caminhos não se sobrepõem. Se aparecer conflito, pare e relate.
- (E2) Corrigir o primeiro período da linha 57 de `docs/reviews/037-c6-operacional.md`. Ele diz que D1 e D2 "Já existem na develop; não são regressão deste diff", e o E2.3c mostrou que o D1 é o W037-001, regressão do Worker corrigida nesta entrega (35bfd72). Só o D2 era antigo. Grave com Edit, nunca por script no Bash. O veredito e o frontmatter `commit:` não mudam. Um commit só desse arquivo, com a linha `Cartão: K-113`.
- (E2) Revisar o diff da branch contra a develop, que deve ser só documentação (`docs/` e `KANBAN.md`). Veja se há segredo, dado de pessoa (nome, e-mail) ou métrica individual nos documentos, que são regras invioláveis do `CLAUDE.md`. Grave o parecer em `docs/reviews/jarvis-2026-10-22-docs.md`, com frontmatter no padrão do projeto (`commit:` no head revisado, `parecer:`), usando Write ou Edit. Um commit só do parecer, com a linha `Cartão: K-113`.
- (E2) Push da branch (o pre-push roda lint e typecheck).

## Fora do escopo
- "E2.5c (forge:qa-engineer): parecer de QA só de documentação (`docs:check`) da branch do Jarvis, antes do merge do E2.5b." · etapa de outro papel, depois desta.
- "E2.6 (forge:qa-engineer): parecer de QA da promoção develop → homolog." · etapa de outro papel, depois.
- "E2.7 (forge:tech-lead): parecer de review da promoção, PR develop → homolog (merge commit) e merge com o portão disparado." e "E2.8 (forge:tech-lead): abrir o PR de release homolog → main com o Worker do 037, depois do E2.7, para o dono validar e mesclar." · etapas do mesmo papel, depois.
- "E1.1 (dono): autorizar ou não rodar de novo os jobs que falharam (custo de minutos do Actions). Feito: opção A.", "E1.2 (forge:qa-engineer): medir localmente o C6 de /operacional no código da main (9180c7e) e no da develop/homolog (12018de, mesmo conteúdo da homolog), registrando as versões do Playwright e do Chromium; o T5 não precisa (passou na nova rodada).", "E1.3 (forge:dono): mesclar o #131 na main quando o portão ficar verde.", "E1.4 (forge:devops-engineer): rodar de novo os jobs que falharam do portão de homologação do #131 e, depois, o `homolog-aprovada`, e relatar o resultado." e "E1.5 (forge:software-architect): proposta de tratamento do C6 de /operacional sem afrouxar o limite (K-113), a partir da medição 1f715e8, gravada na worktree -037 (sem commit: o arquiteto não tem Bash; o commit vai com a implementação)." · etapas cumpridas.
- A parte 2 do E2.5b (abrir o PR e mesclar): numa delegação seguinte, depois do parecer de QA.
- Editar os documentos do Jarvis (pedidos, briefs, quadro): um achado neles vira item do parecer, e o Jarvis corrige. Também fora: código, `main` e homolog.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-21): D1, opção A ("A se d1 foi feito e vai subir certo"): o D1 deixa de ser pendência; no 037 aparece como W037-001, encontrado e corrigido na entrega, e no 025 como não se aplica; condição: a correção sobe certa (check `e2e` do PR do 037 verde); o K-131 fecha depois do merge. D2 continua pendência (K-132).
- DECISÃO DO DONO (2026-10-21): defeitos D1 (média: 100 E2E defasados na develop, K-131) e D2 (baixa: 9 E2E instáveis com 8 workers, K-132), já existentes na develop, opção A ("A"): acompanham as entregas do 037 e do 025 como pendências listadas no PR e são corrigidos depois nos cartões K-131 e K-132 (R-QA).
- DECISÃO DO DONO (2026-10-21): comando de pronto, opção A ("A"): durante o desenvolvimento só os testes e o typecheck do pacote alterado; `pnpm run pronto` completo uma vez, antes do commit final. Vale para as próximas delegações deste projeto; a regra geral vai ao Forge (F3 do prompt de melhorias).
- DECISÃO DO DONO (2026-10-20): rodar de novo os jobs que falharam no #131, opção A ("A"), com o custo de minutos do Actions.
- DECISÃO DO DONO (2026-10-20): C6 do #131, opção A ("A"): medir antes (C6 de /operacional local no código da main × no da homolog, para confirmar se a causa é o @playwright/test 1.64.1 do #130); depois o software-architect decide o tratamento sem afrouxar o limite (K-113).
- ADR 0003 (citada no pedido): C6 < 200 ms bloqueia e não muda; nada de performance muda nesta etapa, que é só de documentação.
- DECISÃO DO DONO (2026-10-20): C6, opção A ("A"): seguir com o Web Worker da ADR 0021 (proposta docs/architecture/propostas/037-c6-operacional.md, alternativa A), precedido pela sonda S0; o #131 espera de 2 a 3 dias com o portão vermelho.
- DECISÃO DO DONO (2026-10-21): PR #136 (release homolog → main, homolog-aprovada vermelho: portão não disparou em d722901 e o C6 ainda não corrigido), opção A ("A"): esperar o 037; o #136 fica aberto e, com o Worker na develop (review e QA), o tech-lead promove para a homolog com os pareceres da promoção, o portão roda e o dono mescla o #136. (Superada pelo ato do dono: o #136 foi mesclado em 2026-10-21 13:10; ver E2.5 e E2.8.)
- DECISÃO DO DONO (2026-10-22): "Vou dormir toque tudo que puder" (ordem ampla: só o que já está confirmado ou delegado segue, R-DECISAO "Complemento"; aqui, E2.6 a E2.8, a promoção com o 025 e o PR de release para o dono validar).
- R-MAIN: nada na `main`. R-VERIFY: nunca `--no-verify` nem `--force`. O PATH do node é `/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin`, como prefixo literal (o hook barra `$`, crase e `?`).

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD merge-base --is-ancestor origin/develop HEAD` · espera: rc=0
- PQ-2 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD show HEAD:docs/reviews/037-c6-operacional.md | grep -c 'não são regressão deste diff'` · espera: igual '0'
- PQ-3 (sha): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD log -1 --format=%H -- docs/reviews/jarvis-2026-10-22-docs.md` · espera: o sha40 do commit do parecer
- PQ-4 (push): `git ls-remote origin refs/heads/docs/jarvis-2026-10-20-noite` igual ao head local

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
