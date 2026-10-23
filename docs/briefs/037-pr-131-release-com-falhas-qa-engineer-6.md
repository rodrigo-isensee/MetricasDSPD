Agente destino: forge:qa-engineer
Pedido: docs/pedidos/037-pr-131-release-com-falhas.md
Branch: feature/037-c6-operacional   Base: develop   Base-sha: 794b9820cb4bab30e50b7de64748030b474a3074

## Objetivo
Descobrir se os 101 E2E vermelhos do check `e2e` do PR #137 (run 39677135959) são regressão do Web Worker ou defeito antigo da develop, medindo os dois lados com porta própria (o `reuseExistingServer` na porta 4173 pode ter misturado builds de worktrees). Etapa E2.3c do pedido 037, cartão K-113. Worktree `/home/rodrigoisensee/MetricasDSPD-037`, branch `feature/037-c6-operacional` (head 85d1896).

## Ler
- `docs/pedidos/037-pr-131-release-com-falhas.md`: Andamento de 2026-10-21 18:45 e a etapa E2.3c.
- O log do job `e2e` do run 39677135959 (`gh run view 39677135959 --log-failed`), só os nomes dos testes e as mensagens de erro.
- `e2e/playwright.config.ts` da branch `feature/025-front-taticas` (variáveis `E2E_PORTA` e `E2E_PORTA_ALT`), para usar a mesma ideia de porta própria sem mudar arquivo desta branch.

## Entregar
- (E2) Rodar `e2e/tests/intensivo-filtros.spec.ts`, `b12-fluxo`, `intensivo-filtros-bordas` e `filtros` em dois lados, cada um com o próprio build e uma porta exclusiva (sem `vite preview` de outra worktree escutando; conferir com `ss -ltnp` antes): (a) a develop 794b982 numa worktree temporária `/home/rodrigoisensee/MetricasDSPD-037dev` (removida no fim sem `--force`); (b) o head 85d1896 desta branch. Registrar quantos falham em cada lado e, para uma amostra de 3 falhas, a mensagem de erro.
- (E2) Veredito no parecer `docs/qa/037-c6-operacional.md`, numa seção nova "E2E do PR #137 (E2.3c)": regressão do Worker (falha só em 85d1896) ou defeito antigo (falha nos dois lados), com os números e o load; se for regressão, abrir o arquivo de bug em `docs/qa/bugs/` com passos para reproduzir e marcar o parecer como reprovado; frontmatter `commit: 85d1896`.
- (E2) Um commit do parecer (e do arquivo de bug, se houver), com `git add` explícito por caminho, mensagem conforme a seção de commits do `docs/engineering/praticas.md` e a linha `Cartão: K-113`; push da branch.

## Fora do escopo
- "E2.4a (forge:tech-lead): code review da branch (inclusive o que o QA acrescentar), parecer em docs com o commit do head." e "E2.4b (forge:tech-lead): PR para a develop (squash), com D1 e D2 listados como pendências, e merge com os checks verdes; limpeza da branch e da worktree -037 depois do merge." · etapas de outro papel.
- "E2.5 (dono): mesclar o #136 (homolog → main) com o homolog-aprovada verde." · etapa do dono.
- "E2.6 (forge:qa-engineer): parecer de QA da promoção develop → homolog." e "E2.7 (forge:tech-lead): parecer de review da promoção, PR develop → homolog (merge commit) e merge com o portão disparado." · etapas de outro momento.
- "E2.1 (forge:qa-engineer): sonda S0 da proposta 037 (C6 do perf-api em /operacional, /operacional?cadencia=diaria e /, e dois perfis do Chromium com pilha), registrada no arquivo do bug C6.", "E2.2 (forge:react-frontend): implementar a ADR 0021 (núcleo puro e Worker), depois do veredito da S0.", "E2.3 (forge:qa-engineer): paridade E2E, C5 com o heap do Worker e medição do pronto (mediana < 150 ms nas 7 rotas)." e "E2.3b (forge:qa-engineer): atualizar o frontmatter do parecer de QA para o head testado (9ee640f), com D1 e D2 como pendências pela decisão do dono de 2026-10-21." · etapas cumpridas.
- "E1.1 (dono): autorizar ou não rodar de novo os jobs que falharam (custo de minutos do Actions). Feito: opção A.", "E1.2 (forge:qa-engineer): medir localmente o C6 de /operacional no código da main (9180c7e) e no da develop/homolog (12018de, mesmo conteúdo da homolog), registrando as versões do Playwright e do Chromium; o T5 não precisa (passou na nova rodada).", "E1.3 (forge:dono): mesclar o #131 na main quando o portão ficar verde.", "E1.4 (forge:devops-engineer): rodar de novo os jobs que falharam do portão de homologação do #131 e, depois, o `homolog-aprovada`, e relatar o resultado." e "E1.5 (forge:software-architect): proposta de tratamento do C6 de /operacional sem afrouxar o limite (K-113), a partir da medição 1f715e8, gravada na worktree -037 (sem commit: o arquiteto não tem Bash; o commit vai com a implementação)." · etapas cumpridas.
- Corrigir código de `web/` ou dos testes (achado vira bug); mudar `e2e/playwright.config.ts` desta branch; mesclar o PR; o quadro.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-20): rodar de novo os jobs que falharam no #131, opção A ("A"), com o custo de minutos do Actions.
- DECISÃO DO DONO (2026-10-20): C6 do #131, opção A ("A"): medir antes (C6 de /operacional local no código da main × no da homolog, para confirmar se a causa é o @playwright/test 1.64.1 do #130); depois o software-architect decide o tratamento sem afrouxar o limite (K-113).
- DECISÃO DO DONO (2026-10-20): C6, opção A ("A"): seguir com o Web Worker da ADR 0021 (proposta docs/architecture/propostas/037-c6-operacional.md, alternativa A), precedido pela sonda S0; o #131 espera de 2 a 3 dias com o portão vermelho.
- DECISÃO DO DONO (2026-10-21): comando de pronto, opção A ("A"): durante o desenvolvimento só os testes e o typecheck do pacote alterado; `pnpm run pronto` completo uma vez, antes do commit final. Vale para as próximas delegações deste projeto; a regra geral vai ao Forge (F3 do prompt de melhorias).
- DECISÃO DO DONO (2026-10-21): PR #136 (release homolog → main, homolog-aprovada vermelho: portão não disparou em d722901 e o C6 ainda não corrigido), opção A ("A"): esperar o 037; o #136 fica aberto e, com o Worker na develop (review e QA), o tech-lead promove para a homolog com os pareceres da promoção, o portão roda e o dono mescla o #136.
- DECISÃO DO DONO (2026-10-21): defeitos D1 (média: 100 E2E defasados na develop, K-131) e D2 (baixa: 9 E2E instáveis com 8 workers, K-132), já existentes na develop, opção A ("A"): acompanham as entregas do 037 e do 025 como pendências listadas no PR e são corrigidos depois nos cartões K-131 e K-132 (R-QA).
- ADR 0003 (citada no pedido) e ADR 0021 (citada no pedido). Regras invioláveis do `CLAUDE.md` (T2.5). R-MAIN: nada na `main`. R-VERIFY: nunca `--no-verify` nem `--force`.
- R-TETO: uma suíte pesada por vez; antes de cada execução, `pgrep -af 'node .*(vitest|playwright)'` sem processo de outra worktree (o 025 pode estar rodando o `pronto`).

## Pronto quando
- PQ-1 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-037 log -1 --format=%h -- docs/qa/037-c6-operacional.md` · espera: o hash do commit do parecer.
- PQ-2 (push): `git ls-remote origin refs/heads/feature/037-c6-operacional` igual ao head local.
- PQ-3 (cmd): `grep -c 'E2.3c' /home/rodrigoisensee/MetricasDSPD-037/docs/qa/037-c6-operacional.md` · espera: linhas>=1

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
