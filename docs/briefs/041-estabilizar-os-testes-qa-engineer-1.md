Agente destino: forge:qa-engineer
Pedido: docs/pedidos/041-estabilizar-os-testes.md
Tipo: codigo
Branch: feature/041-estabilidade   Base: develop   Base-sha: c4db73e666e560f2120ab0b0d4cff1307d7710c9

## Objetivo
Medir as instabilidades da suíte antes de corrigir qualquer coisa: taxa de falha por teste e causa raiz, para que as correções do 041 ataquem a causa e não o sintoma (retry ou timeout maior). Etapa E1.1 do pedido 041, cartão K-138. Criar a worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041` com a branch `feature/041-estabilidade` a partir de `origin/develop` (já com o 025 e o 037).

## Ler
- `docs/pedidos/041-estabilizar-os-testes.md`, seções "Diagnóstico inicial", "Escopo" e "Critério de pronto".
- `e2e/playwright.config.ts` (projetos, workers, `reuseExistingServer`, `E2E_PORTA`) e `e2e/pages/PainelPage.ts` (esperas de painel pronto).
- `docs/qa/bugs/W037-001-e2e-100-vermelhos-com-o-worker.md`, seção "Causa raiz e correção".

## Entregar
- (E1) Rodar e medir, com porta própria (`E2E_PORTA` e `E2E_PORTA_ALT`) e o PATH `/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin` como prefixo literal: os testes de unidade (`pnpm test`) 5 vezes seguidas; a suíte E2E completa com 1, 2 e 8 workers, 3 vezes cada, com `--retries=0`; e os testes citados no Diagnóstico (K-092, K-107, K-115, K-123, K-132) 20 vezes cada, isolados e sob carga (com a suíte de unidade rodando em paralelo). Uma execução pesada por vez (R-TETO).
- (E1) Relatório `docs/qa/041-estabilidade.md` com frontmatter no padrão do projeto. Para cada teste instável: arquivo e nome; taxa de falha por cenário (1, 2 e 8 workers e sob carga); mensagem de erro; causa raiz provável com a evidência; grupo (carga e tempo, aleatoriedade, espera frágil, portão). Para cada grupo, a correção proposta e quem a faz (E2 a E4 do pedido), sem aumentar timeout nem ligar retry. Inclua instabilidades novas que aparecerem fora da lista.
- (E1) Garanta que as execuções não regravem `docs/qa/evidencias` no caminho versionado (se regravarem, registre isso como achado e não commite os PNGs).
- (E1) Gravar com Write ou Edit, nunca por script no Bash. Fazer um commit só do relatório, com `git add` explícito por caminho, a linha `Cartão: K-138` e mensagem conforme a seção de commits do `docs/engineering/praticas.md`. Sem push.

## Fora do escopo
- "E2.1 (forge:qa-engineer): esperas do E2E e helper único de "painel pronto" (K-135, K-092, K-115, K-132)." · etapa do mesmo papel, depois desta, pelo plano deste diagnóstico.
- "E2.2 (forge:node-backend): semente fixa ou propriedade determinística no montecarlo (K-107) e limite de tempo do gerador que não dependa da carga da máquina (K-123)." · etapa de outro papel.
- "E3.1 (forge:tech-lead): typecheck do e2e no `pronto` (K-134)." e "E3.2 (forge:devops-engineer): `homolog-aprovada` espera o portão (K-108) e parecer de devops." · etapas de outro papel.
- "E4.1 (forge:qa-engineer): prova de estabilidade (E4) e parecer de QA." · etapa do mesmo papel, depois das correções.
- "E5.1 (forge:tech-lead): code review e PRs para a develop." · etapa de outro papel.
- Mudar código, testes, configuração ou limites; o quadro; push; PR.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-22): "Jarvis preciso que voce melhore os testes, porque to achando muito estranho algumas instabilidades".
- DECISÃO DO DONO (2026-10-22): recibo do 041 aceito ("Ok"), sem instabilidade específica além das do Diagnóstico.
- Pedido 041, Fora do escopo: afrouxar limite de performance (C6, F6, F9, ADR 0003) ou de cobertura não entra.
- R-TETO: antes de cada execução pesada, `pgrep -fa 'playwright|vitest'` sem processo de outra worktree. R-VERIFY e R-CONFORMIDADE: bloqueio não se contorna.

## Pronto quando
- PQ-1 (arquivo): `test -e /home/rodrigoisensee/Metricas/MetricasDSPD-041/docs/qa/041-estabilidade.md`
- PQ-2 (sha): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 log -1 --format=%H -- docs/qa/041-estabilidade.md` · espera: o sha40 do commit do relatório
- PQ-3 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 status --porcelain -- web server e2e packages` · espera: linhas=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
