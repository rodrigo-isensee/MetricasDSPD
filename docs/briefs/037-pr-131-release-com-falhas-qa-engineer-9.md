Agente destino: forge:qa-engineer
Pedido: docs/pedidos/037-pr-131-release-com-falhas.md
Tipo: codigo
Branch: docs/jarvis-2026-10-20-noite   Base: develop   Base-sha: c4db73e666e560f2120ab0b0d4cff1307d7710c9

## Objetivo
Parecer de QA só de documentação da branch do Jarvis, antes do PR para a develop. É a etapa E2.5c do pedido 037, cartão K-113. Diretório principal `/home/rodrigoisensee/Metricas/MetricasDSPD`, branch `docs/jarvis-2026-10-20-noite`, com head a24eeeb e o review aprovado em 92a984c.

## Ler
- `docs/reviews/jarvis-2026-10-22-docs.md` (frontmatter e veredito).
- `git -C /home/rodrigoisensee/Metricas/MetricasDSPD diff --stat origin/develop HEAD`.

## Entregar
- (E2) Conferir que o diff contra `origin/develop` é só documentação (`.md` em `docs/` e `KANBAN.md`). Rodar `pnpm run docs:check` na raiz do diretório principal, com o PATH `/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin` como prefixo literal.
- (E2) Gravar o parecer em `docs/qa/jarvis-2026-10-22-docs.md`, com frontmatter no padrão do projeto (`pedido: 037-pr-131-release-com-falhas`, `branch: docs/jarvis-2026-10-20-noite`, `commit:` com o sha40 do head conferido e `parecer:`) e a saída do `docs:check` copiada. Gravar só com Write ou Edit, nunca por script no Bash. Um commit só desse arquivo, com `git add` explícito por caminho, a linha `Cartão: K-113` e mensagem conforme a seção de commits do `docs/engineering/praticas.md`. Depois, push da branch.

## Fora do escopo
- "E2.5b (forge:tech-lead): no PR de documentação do Jarvis (branch `docs/jarvis-2026-10-20-noite`) para a develop, corrigir a linha 57 do parecer `docs/reviews/037-c6-operacional.md` (achado da conferência de 2026-10-22 15:02), revisar o diff só de documentação, abrir o PR e mesclar." · etapa de outro papel (parte 1 cumprida em a24eeeb; a parte 2, o PR e o merge, vem depois desta).
- "E2.6 (forge:qa-engineer): parecer de QA da promoção develop → homolog." · etapa do mesmo papel, depois do merge do PR de documentação.
- "E2.7 (forge:tech-lead): parecer de review da promoção, PR develop → homolog (merge commit) e merge com o portão disparado." e "E2.8 (forge:tech-lead): abrir o PR de release homolog → main com o Worker do 037, depois do E2.7, para o dono validar e mesclar." · etapas de outro papel.
- "E1.1 (dono): autorizar ou não rodar de novo os jobs que falharam (custo de minutos do Actions). Feito: opção A.", "E1.2 (forge:qa-engineer): medir localmente o C6 de /operacional no código da main (9180c7e) e no da develop/homolog (12018de, mesmo conteúdo da homolog), registrando as versões do Playwright e do Chromium; o T5 não precisa (passou na nova rodada).", "E1.3 (forge:dono): mesclar o #131 na main quando o portão ficar verde.", "E1.4 (forge:devops-engineer): rodar de novo os jobs que falharam do portão de homologação do #131 e, depois, o `homolog-aprovada`, e relatar o resultado." e "E1.5 (forge:software-architect): proposta de tratamento do C6 de /operacional sem afrouxar o limite (K-113), a partir da medição 1f715e8, gravada na worktree -037 (sem commit: o arquiteto não tem Bash; o commit vai com a implementação)." · etapas cumpridas.
- Rodar testes de código (o diff é só documentação); editar documentos do Jarvis ou o parecer de review; PR; o quadro.

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
- R-VERIFY: nunca `--no-verify` nem `--force`. O hook barra `$`, crase e `?` no Bash.

## Pronto quando
- PQ-1 (sha): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD log -1 --format=%H -- docs/qa/jarvis-2026-10-22-docs.md` · espera: o sha40 do commit do parecer
- PQ-2 (push): `git ls-remote origin refs/heads/docs/jarvis-2026-10-20-noite` igual ao head local
- PQ-3 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD diff --name-only origin/develop HEAD -- web server e2e packages` · espera: linhas=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
