Agente destino: forge:tech-lead
Pedido: 094-lote-testes-e-guia
Tipo: codigo
Branch: fix/k267-regex-pessoa   Base: develop   Base-sha: 18701297fd058a6cf420c6361c08a264871dfc87
Etapa: codigo   Cobre: E3.4

## Objetivo
PR do K-267: branch `fix/k267-regex-pessoa` (worktree `/home/rodrigoisensee/MetricasDSPD-052f`, ponta c90340ee; código 914480843f9988b10bdceb18d38fac248f6839a5 com review b653e6d4 e QA c90340ee aprovados), para a develop.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052f/docs/reviews/094-k267-regex-pessoa.md` (novo) e `/home/rodrigoisensee/MetricasDSPD-052f/docs/qa/094-k267-regex-pessoa.md` (novo).

## Entregar
- "E3.4 (tech-lead): PR do K-267; o merge é do dono." (E3.4)
- (E3) (E3.4) Abrir o PR para a develop pelo nome da branch, a partir da worktree (corpo gravado por Write num arquivo do scratchpad e passado com `--body-file`; `Cartão: K-267`; os dois pareceres; o A3 do review, `QUEM` em maiúsculas, como pendência recomendada) e esperar a CI verde em laços de até 170 s por chamada, com uma leitura final de `gh pr checks` depois do laço. Não mesclar (o merge é do dono, E3.4). Sem commit nem push nesta delegação.
- (E1) (E2) Nada a entregar aqui: não nesta delegação.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 094-lote-testes-e-guia até e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 (0 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/094-lote-testes-e-guia.md; valem todas, leia-as nas fontes)
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, arquivos fora da lista `- arquivos:`, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`; nenhum merge.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (tech-lead): K-265, na branch docs/k265-guia-pronto, worktree /home/rodrigoisensee/MetricasDSPD-052c." · etapa de outra delegação; continua no pedido
- "E1.2 (tech-lead): review do K-265." · etapa de outra delegação; continua no pedido
- "E1.3 (tech-lead): PR do K-265; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E2.1 (node-backend): K-266, na branch fix/k266-seed-tmpdir, worktree /home/rodrigoisensee/MetricasDSPD-052d." · etapa de outra delegação; continua no pedido
- "E2.2 (tech-lead): review do K-266." · etapa de outra delegação; continua no pedido
- "E2.3 (qa-engineer): QA do K-266." · etapa de outra delegação; continua no pedido
- "E2.4 (tech-lead): PR do K-266; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E3.1 (node-backend): K-267, na branch fix/k267-regex-pessoa, worktree /home/rodrigoisensee/MetricasDSPD-052f." · etapa de outra delegação; continua no pedido
- "E3.2 (tech-lead): review do K-267." · etapa de outra delegação; continua no pedido
- "E3.3 (qa-engineer): QA do K-267." · etapa de outra delegação; continua no pedido
- "E4.1 (agile-coach): retrospectiva curta." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `gh pr list --repo rodrigo-isensee/MetricasDSPD --state all --head fix/k267-regex-pessoa --base develop --json number --jq .[].number` · espera: linhas=1
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
