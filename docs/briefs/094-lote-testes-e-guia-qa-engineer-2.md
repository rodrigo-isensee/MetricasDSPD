Agente destino: forge:qa-engineer
Pedido: 094-lote-testes-e-guia
Tipo: codigo
Branch: fix/k267-regex-pessoa   Base: develop   Base-sha: 18701297fd058a6cf420c6361c08a264871dfc87
Etapa: codigo   Cobre: E3.3

## Objetivo
QA do K-267: branch `fix/k267-regex-pessoa`, worktree `/home/rodrigoisensee/MetricasDSPD-052f`, código em 914480843f9988b10bdceb18d38fac248f6839a5 (regex de pessoa do S6 ampliada, "quem" por palavra inteira, user_id e motivo_texto; caso S6b), review aprovado (b653e6d4), base develop 18701297fd058a6cf420c6361c08a264871dfc87.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052f diff 18701297fd058a6cf420c6361c08a264871dfc87 914480843f9988b10bdceb18d38fac248f6839a5`.
- `/home/rodrigoisensee/MetricasDSPD-052f/docs/reviews/094-k267-regex-pessoa.md` (novo).

## Entregar
- "E3.3 (qa-engineer): QA do K-267." (E3.3)
- (E3) (E3.3) Rodar o arquivo com no máximo 2 workers (R-TETO); conferir que o S6 sobre as respostas reais segue verde e que o S6b pega cada termo; uma mutação (tirar um termo novo da regex, por exemplo `user[ _-]?id`) que o S6b pega, restaurada antes do commit. Grave `docs/qa/094-k267-regex-pessoa.md` (novo) pela ferramenta Write, com `pedido: 094-lote-testes-e-guia`, `branch: fix/k267-regex-pessoa`, `commit: 914480843f9988b10bdceb18d38fac248f6839a5`, veredito, contagem de bugs fora do bloco `## Achados` e `## Achados` só com linhas de achado (vazio se não houver). Commit só do parecer com `Cartão: K-267` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052f push origin HEAD:refs/heads/fix/k267-regex-pessoa` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E1) (E2) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/qa/094-k267-regex-pessoa.md

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
- "E3.4 (tech-lead): PR do K-267; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E4.1 (agile-coach): retrospectiva curta." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052f show origin/fix/k267-regex-pessoa:docs/qa/094-k267-regex-pessoa.md` · espera: contém 'commit: 914480843f9988b10bdceb18d38fac248f6839a5'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
