Agente destino: forge:node-backend
Pedido: 094-lote-testes-e-guia
Tipo: codigo
Branch: fix/k267-regex-pessoa   Base: develop   Base-sha: 18701297fd058a6cf420c6361c08a264871dfc87
Etapa: codigo   Cobre: E3.1

## Objetivo
K-267: o teste S6 de `server/tests/painel-real-f6.test.ts` (perto da linha 339) prova que as respostas de BLOQUEADOS, O1, O2, O5 e O19 não trazem dado de pessoa, por uma regex que não cobre "bloqueado por", "quem", "comentário" e "observação", que o modelo de ameaças do 075 cita. Worktree `/home/rodrigoisensee/MetricasDSPD-052f`, branch `fix/k267-regex-pessoa` (a partir da develop 18701297fd058a6cf420c6361c08a264871dfc87).

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052f/server/tests/painel-real-f6.test.ts`, o caso S6 e a regex de pessoa.
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/security/075-modelo-ameacas.md`, os campos de pessoa e de texto livre do bloqueio.

## Entregar
- "E3.1 (node-backend): K-267, na branch fix/k267-regex-pessoa, worktree /home/rodrigoisensee/MetricasDSPD-052f." (E3.1)
- (E3) (E3.1) Ampliar a regex do S6 para cobrir também "bloqueado por" (e variações sem acento e em inglês, como blocked_by), "quem", "comentário" e "observação" (com e sem acento), sem afrouxar o que já pega; provar que ela pega cada termo novo (caso que injeta o campo numa resposta simulada e espera a falha) e que as respostas reais de hoje continuam passando. Só o arquivo de teste; código de produção não muda (se o teste novo achar um vazamento real, pare e relate). Rodar o arquivo com no máximo 2 workers (R-TETO) e o `pnpm run pronto` da raiz da worktree. Commit com `Cartão: K-267` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052f push origin HEAD:refs/heads/fix/k267-regex-pessoa` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E1) (E2) Nada a entregar aqui: não nesta delegação.
- arquivos: server/tests/painel-real-f6.test.ts

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 094-lote-testes-e-guia até e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 (0 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/094-lote-testes-e-guia.md; valem todas, leia-as nas fontes)
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: arquivos fora da lista `- arquivos:` (outro arquivo necessário: pare e relate antes), os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (tech-lead): K-265, na branch docs/k265-guia-pronto, worktree /home/rodrigoisensee/MetricasDSPD-052c." · etapa de outra delegação; continua no pedido
- "E1.2 (tech-lead): review do K-265." · etapa de outra delegação; continua no pedido
- "E1.3 (tech-lead): PR do K-265; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E2.1 (node-backend): K-266, na branch fix/k266-seed-tmpdir, worktree /home/rodrigoisensee/MetricasDSPD-052d." · etapa de outra delegação; continua no pedido
- "E2.2 (tech-lead): review do K-266." · etapa de outra delegação; continua no pedido
- "E2.3 (qa-engineer): QA do K-266." · etapa de outra delegação; continua no pedido
- "E2.4 (tech-lead): PR do K-266; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E3.2 (tech-lead): review do K-267." · etapa de outra delegação; continua no pedido
- "E3.3 (qa-engineer): QA do K-267." · etapa de outra delegação; continua no pedido
- "E3.4 (tech-lead): PR do K-267; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E4.1 (agile-coach): retrospectiva curta." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052f log -1 --format=%B origin/fix/k267-regex-pessoa` · espera: contém 'Cartão: K-267'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
