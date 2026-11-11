Agente destino: forge:tech-lead
Pedido: 094-lote-testes-e-guia
Tipo: codigo
Branch: fix/k267-regex-pessoa   Base: develop   Base-sha: 18701297fd058a6cf420c6361c08a264871dfc87
Etapa: codigo   Cobre: E3.2

## Objetivo
Revalidação do review do K-267 depois da volta: o review aa4f287d aprovou 9f4ecf99 com A1 e A2 recomendados; a volta 91448084 (só `server/tests/painel-real-f6.test.ts`) tratou os dois. Worktree `/home/rodrigoisensee/MetricasDSPD-052f`, branch `fix/k267-regex-pessoa` (ponta 91448084).

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052f diff aa4f287d 91448084`.
- `/home/rodrigoisensee/MetricasDSPD-052f/docs/reviews/094-k267-regex-pessoa.md` (novo), achados A1 e A2.

## Entregar
- "E3.2 (tech-lead): review do K-267." (E3.2) Nesta volta, só o que mudou desde o parecer.
- (E3) (E3.2) Conferir que A1 (quem por palavra inteira; "esquema" passa) e A2 (user_id, userId e motivo_texto pegos) estão resolvidos, sem afrouxar o que a regex já pegava e com o S6 real verde; rodar o arquivo com no máximo 2 workers (R-TETO). Regravar `docs/reviews/094-k267-regex-pessoa.md` inteiro pela ferramenta Write, com `commit: 914480843f9988b10bdceb18d38fac248f6839a5`, o veredito e os achados atualizados (linhas de até 300 caracteres). Commit só do parecer com `Cartão: K-267` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052f push origin HEAD:refs/heads/fix/k267-regex-pessoa` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E1) (E2) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/reviews/094-k267-regex-pessoa.md

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
- "E3.3 (qa-engineer): QA do K-267." · etapa de outra delegação; continua no pedido
- "E3.4 (tech-lead): PR do K-267; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E4.1 (agile-coach): retrospectiva curta." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052f show origin/fix/k267-regex-pessoa:docs/reviews/094-k267-regex-pessoa.md` · espera: contém 'commit: 91448084'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
