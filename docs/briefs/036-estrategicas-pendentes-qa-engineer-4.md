Agente destino: forge:qa-engineer
Pedido: docs/pedidos/036-estrategicas-pendentes.md
Branch: feature/036-estrategicas-pendentes   Base: develop   Base-sha: 12018deb8e35a7b473d6e8c1b7a693795a80c1ac

## Objetivo
QA da branch das estratégicas pendentes depois do review aprovado (R-QA, portão obrigatório), etapa E1.4 do pedido 036. Worktree `/home/rodrigoisensee/MetricasDSPD-030`, branch `feature/036-estrategicas-pendentes` (head fc9ecf2: catálogo do E7 bf137a9, reteste do FA-006 f3a2995, IF-A de /estrategico 154f43a, especificação a711371, parecer de review fc9ecf2).

## Ler
- `docs/reviews/036-estrategicas-pendentes.md` (parecer de review, achados A1 e A2).
- `docs/pedidos/036-estrategicas-pendentes.md`, seções Escopo e Critério de pronto.
- Modelo de frontmatter: `docs/qa/011-front-estrategicas.md`.

## Entregar
- (E1) (E2) (E3) Validar contra o escopo: o catálogo mostra no E7 a pergunta "Qual a participação de cada sistema nas nossas entregas?" (teste de unidade ou E2E existente que abra o catálogo, ou verificação na tela com o Playwright); o reteste do FA-006 está registrado; o IF-A de /estrategico passa e verifica ao menos 1 cartão. Rodar a suíte E2E do `e2e/` que cobre /estrategico e o catálogo (no mínimo `tests/intensivo-filtros.spec.ts -g "IF-A"` e a spec do lote 1 das estratégicas, `tests/estrategico-011-lote1.spec.ts`), uma suíte pesada por vez (R-TETO; sem `flock`, que o hook recusa; `pgrep -fa 'playwright|vitest'` vazio antes).
- (E2) Corrigir o achado A2 do review: no arquivo do IFA-001, a nota que diz que o /operacional fica para o "pedido 036" passa a dizer que fica para as operacionais (lote 3), como o Fora do escopo do pedido 036.
- (E1) Parecer em `docs/qa/036-estrategicas-pendentes.md` (frontmatter no padrão do projeto: `tipo: qa`, `pedido: 036-estrategicas-pendentes`, `branch: feature/036-estrategicas-pendentes`, `commit:` o sha40 do head testado, `parecer:`, `escopo:`, contagem de bugs), com bloco `## Achados`. Um commit da correção do A2 e outro só do parecer, com `git add` explícito e a linha do cartão (K-091, K-119) na mensagem, conforme a seção de commits do `docs/engineering/praticas.md`; um push.

## Fora do escopo
- "E1.5 (forge:tech-lead): PR para a develop e merge." · etapa de outro papel, depois deste QA.
- "E1.3 (forge:tech-lead): code review." · etapa de outro papel, cumprida (fc9ecf2).
- "E1.1 (forge:qa-engineer): medição do FA-006 (3 execuções, mock e api), na branch do pedido." e "E2.1 (forge:qa-engineer): teste do IFA-001 em /estrategico, na mesma branch, depois do E1.1 (R-WIP)." · etapas do mesmo papel, já cumpridas.
- "E1.2 (forge:react-frontend): correção do FA-006, só se a medição confirmar o estouro." · etapa de outro papel; não se aplica.
- "E3.1 (dono): decidir o texto do E7 no catálogo (feito: opção A)." · etapa do dono, cumprida.
- "E3.2 (forge:react-frontend): trocar o texto no catálogo e o teste que o cita." e "E3.3 (forge:ux-designer): trocar o texto na especificação." · etapas de outro papel, cumpridas.
- IF-A em /operacional sem cadência (lote 3); o achado A1 (linha do cartão no squash, E1.5); código de `web/` ou `server/`; o quadro; PR.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-20): ordem das pendências: "veja se tem algo das metricas estrategicas pendentes se tem comece por ele, senao va para taticas e por ultimo operacional. Depois de tudo isso faremos as integracoes oficiais funcionar."
- DECISÃO DO DONO (2026-10-20): recibo do pedido 036 aceito ("sim").
- DECISÃO DO DONO (2026-10-20): E7 no catálogo, opção A ("A"): a pergunta passa a ser "Qual a participação de cada sistema nas nossas entregas?" (catálogo `web/src/content/catalogo-metricas.ts` e especificação `docs/ux/metricas-tambem-disponiveis/02-especificacao.md` §E7).
- ADR 0003 (citada no pedido): F2, CLS < 0,1; o limite não muda.
- ADR 0004 (citada no pedido): documentos com frontmatter; o parecer de QA segue o padrão. Os 10 documentos antigos sem frontmatter são do K-121 e não entram aqui.
- A medição do C6 do pedido 037 roda na worktree `-037` e na `-main`: se houver playwright rodando, espere ele terminar antes da sua suíte (as duas medem tempo).
- R-MAIN: nada na `main`. R-VERIFY: nunca `--no-verify` nem `--force`.

## Pronto quando
- PQ-1 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-030 log -1 --format=%h` da branch · espera: o hash do commit do parecer de QA.
- PQ-2 (push): `git ls-remote origin refs/heads/feature/036-estrategicas-pendentes` igual ao head local.
- PQ-3 (cmd): `grep -c '^parecer: ' /home/rodrigoisensee/MetricasDSPD-030/docs/qa/036-estrategicas-pendentes.md` · espera: igual '1'
- PQ-4 (cmd): `forge-check pr 036-estrategicas-pendentes --ref feature/036-estrategicas-pendentes --base origin/develop` · espera: linhas=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
